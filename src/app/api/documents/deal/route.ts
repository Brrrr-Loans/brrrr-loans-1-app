import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";

interface DealDocumentResult {
  id: number;
  document_name: string;
  storage_bucket: string;
  storage_path: string;
  file_type: string | null;
  file_size: number | null;
  uploaded_at: string;
  category_name: string | null;
  deal_names: string[];
}

export async function GET(request: Request) {
  try {
    const supabase = createServiceRoleClient();
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const impersonatedUserIdParam = url.searchParams.get("impersonate_user_id");

    // Get target user ID (for impersonation or current user)
    let targetUserId: number;
    let targetClerkUserId: string;

    if (impersonatedUserIdParam) {
      // Verify the requesting user is an admin
      const { data: adminUser } = await supabase
        .from("auth_clerk_users")
        .select("id, personal_role")
        .eq("clerk_user_id", clerkUserId)
        .single();

      if (!adminUser || adminUser.personal_role !== "admin") {
        return NextResponse.json(
          { error: "Forbidden - admin only" },
          { status: 403 },
        );
      }

      // Get the impersonated user's details
      const { data: impersonatedUser } = await supabase
        .from("auth_clerk_users")
        .select("id, clerk_user_id")
        .eq("id", parseInt(impersonatedUserIdParam))
        .single();

      if (!impersonatedUser || !impersonatedUser.clerk_user_id) {
        return NextResponse.json(
          { error: "Impersonated user not found" },
          { status: 404 },
        );
      }

      targetUserId = impersonatedUser.id;
      targetClerkUserId = impersonatedUser.clerk_user_id;
    } else {
      // Normal user - get their own info
      const { data: currentUser } = await supabase
        .from("auth_clerk_users")
        .select("id, clerk_user_id, personal_role")
        .eq("clerk_user_id", clerkUserId)
        .single();

      if (!currentUser) {
        return NextResponse.json([]);
      }

      targetUserId = currentUser.id;
      targetClerkUserId = currentUser.clerk_user_id || clerkUserId;

      // If admin and not impersonating, show ALL documents (existing behavior)
      if (currentUser.personal_role === "admin") {
        return await fetchAllDocuments(supabase);
      }
    }

    // For non-admin users (or when impersonating), filter by user access
    return await fetchDocumentsForUser(
      supabase,
      targetUserId,
      targetClerkUserId,
    );
  } catch (error) {
    console.error("Error fetching deal documents:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}

// Fetch ALL documents (for admin view without impersonation)
async function fetchAllDocuments(
  supabase: ReturnType<typeof createServiceRoleClient>,
): Promise<NextResponse> {
  const { data, error } = await supabase
    .from("document_files")
    .select(
      `
      id,
      document_name,
      storage_bucket,
      storage_path,
      file_type,
      file_size,
      uploaded_at,
      document_category:document_categories(name),
      document_files_deals(deal:deal(deal_name))
    `,
    )
    .eq("storage_bucket", "documents")
    .not("uploaded_at", "is", null)
    .order("uploaded_at", { ascending: false });

  if (error) {
    console.error("Error fetching all documents:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const docs = transformDocuments(data || []);
  return NextResponse.json(docs);
}

// Fetch documents accessible to a specific user
async function fetchDocumentsForUser(
  supabase: ReturnType<typeof createServiceRoleClient>,
  targetUserId: number,
  targetClerkUserId: string,
): Promise<NextResponse> {
  // Get user's org memberships
  const { data: orgMemberships } = await supabase
    .from("auth_clerk_orgs_members")
    .select("clerk_org_id")
    .eq("auth_clerk_users_id", targetUserId);

  const userOrgIds = (orgMemberships || [])
    .map((m) => m.clerk_org_id)
    .filter((id): id is number => id !== null);

  // Get user's deal roles
  const { data: dealRoles } = await supabase
    .from("deal_roles")
    .select("deal_id")
    .eq("auth_clerk_users_id", targetUserId);

  const userDealIds = (dealRoles || [])
    .map((r) => r.deal_id)
    .filter((id): id is number => id !== null);

  // Collect all document IDs the user can access
  const accessibleDocIds = new Set<number>();

  // 1. Documents directly linked to user via document_files_clerk_users
  const { data: directUserDocs } = await supabase
    .from("document_files_clerk_users")
    .select("document_file_id")
    .eq("clerk_user_id", targetUserId);

  (directUserDocs || []).forEach((d) => {
    if (d.document_file_id) accessibleDocIds.add(d.document_file_id);
  });

  // 2. Documents linked to user's orgs via document_files_clerk_orgs
  if (userOrgIds.length > 0) {
    const { data: orgDocs } = await supabase
      .from("document_files_clerk_orgs")
      .select("document_file_id")
      .in("clerk_org_id", userOrgIds);

    (orgDocs || []).forEach((d) => {
      if (d.document_file_id) accessibleDocIds.add(d.document_file_id);
    });
  }

  // 3. Documents linked to user's deals via document_files_deals
  if (userDealIds.length > 0) {
    const { data: dealDocs } = await supabase
      .from("document_files_deals")
      .select("document_file_id")
      .in("deal_id", userDealIds);

    (dealDocs || []).forEach((d) => {
      if (d.document_file_id) accessibleDocIds.add(d.document_file_id);
    });
  }

  // 4. Documents uploaded by the user (uploaded_by = clerk_user_id)
  const { data: uploadedDocs } = await supabase
    .from("document_files")
    .select("id")
    .eq("storage_bucket", "documents")
    .eq("uploaded_by", targetClerkUserId);

  (uploadedDocs || []).forEach((d) => {
    if (d.id) accessibleDocIds.add(d.id);
  });

  // If no accessible documents, return empty array
  if (accessibleDocIds.size === 0) {
    return NextResponse.json([]);
  }

  // Fetch the full document details for accessible docs
  const { data, error } = await supabase
    .from("document_files")
    .select(
      `
      id,
      document_name,
      storage_bucket,
      storage_path,
      file_type,
      file_size,
      uploaded_at,
      document_category:document_categories(name),
      document_files_deals(deal:deal(deal_name))
    `,
    )
    .in("id", Array.from(accessibleDocIds))
    .eq("storage_bucket", "documents")
    .not("uploaded_at", "is", null)
    .order("uploaded_at", { ascending: false });

  if (error) {
    console.error("Error fetching user documents:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const docs = transformDocuments(data || []);
  return NextResponse.json(docs);
}

// Transform raw database results to API response format
function transformDocuments(
  data: Array<{
    id: number;
    document_name: string;
    storage_bucket: string;
    storage_path: string;
    file_type: string | null;
    file_size: number | null;
    uploaded_at: string;
    document_category: { name: string } | null;
    document_files_deals: Array<{ deal: { deal_name: string } | null }> | null;
  }>,
): DealDocumentResult[] {
  return data.map((df) => ({
    id: df.id,
    document_name: df.document_name,
    storage_bucket: df.storage_bucket,
    storage_path: df.storage_path,
    file_type: df.file_type,
    file_size: df.file_size,
    uploaded_at: df.uploaded_at,
    category_name: df.document_category?.name || null,
    deal_names: (df.document_files_deals || [])
      .map((d) => d.deal?.deal_name)
      .filter((n): n is string => Boolean(n)),
  }));
}
