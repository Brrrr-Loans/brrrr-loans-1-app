import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  try {
    const supabase = createServiceRoleClient();
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check for impersonation
    const url = new URL(request.url);
    const impersonatedUserIdParam = url.searchParams.get("impersonate_user_id");
    
    let targetUserId: number;

    if (impersonatedUserIdParam) {
      targetUserId = parseInt(impersonatedUserIdParam);
    } else {
      const { data: currentUser } = await supabase
        .from("auth_clerk_users")
        .select("id")
        .eq("clerk_user_id", clerkUserId)
        .single();

      if (!currentUser) {
        return NextResponse.json([]);
      }

      targetUserId = currentUser.id;
    }

    // Get the user's organization memberships
    const { data: orgMemberships } = await supabase
      .from("auth_clerk_orgs_members")
      .select("clerk_org_id")
      .eq("auth_clerk_users_id", targetUserId);

    const userOrgIds = (orgMemberships || [])
      .map((m) => m.clerk_org_id)
      .filter((id): id is number => id !== null);

    // Get deals for this user via bsi_deals (links individual users to deals)
    const { data: userDeals, error: userError } = await supabase
      .from("bsi_deals")
      .select(
        `
        id,
        deal_id,
        deal:deal_id(
          id,
          deal_name,
          deal_disposition_1
        )
      `
      )
      .eq("auth_clerk_users_id", targetUserId);

    if (userError) {
      console.error("Error fetching user deals:", userError);
    }

    // Get deals for user's orgs via bsi_deals_orgs (links orgs to deals)
    let orgDeals: typeof userDeals = [];
    if (userOrgIds.length > 0) {
      const { data: orgData, error: orgError } = await supabase
        .from("bsi_deals_orgs")
        .select(
          `
          id,
          deal_id,
          deal:deal_id(
            id,
            deal_name,
            deal_disposition_1
          )
        `
        )
        .in("clerk_org_id", userOrgIds);

      if (orgError) {
        console.error("Error fetching org deals:", orgError);
      } else {
        orgDeals = orgData || [];
      }
    }

    // Combine and deduplicate by deal_id
    const allDeals = [...(userDeals || []), ...orgDeals];
    const uniqueDeals = Array.from(
      new Map(allDeals.map((d) => [d.deal_id, d])).values()
    );

    // Map to expected format - get status from the linked deal
    const deals = uniqueDeals
      .filter((row) => row.deal) // Filter out rows without a linked deal
      .map((row) => ({
        status: row.deal?.deal_disposition_1 || "unknown",
      }));

    return NextResponse.json(deals);
  } catch (error) {
    console.error("Error fetching deals:", error);
    return NextResponse.json([]);
  }
}

