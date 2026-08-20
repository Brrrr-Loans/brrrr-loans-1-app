import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getSupabaseClient } from "@/lib/supabase-server";
import type { ContactType, UserRole, UserPermissions } from "@/types/auth";
import {
  canAccessDeals,
  isClerkOrgAdminRole,
  isOrgAdminFromMemberships,
} from "@/lib/deal-access";

function canAccessDistributions(
  contactType: ContactType,
  role: UserRole,
  isOrgAdmin: boolean
): boolean {
  if (isOrgAdmin || role === "admin") return true;

  const allowedContactTypes: ContactType[] = [
    "Balance Sheet Investor",
    "Lender",
    "Point of Contact",
  ];

  return allowedContactTypes.includes(contactType);
}

function canAccessDocuments(
  contactType: ContactType,
  role: UserRole,
  isOrgAdmin: boolean
): boolean {
  if (isOrgAdmin || role === "admin") return true;

  const restrictedContactTypes: ContactType[] = ["Appraisal Administration"];

  return !restrictedContactTypes.includes(contactType);
}

function canAccessAdminFeatures(role: UserRole): boolean {
  return role === "admin";
}

function buildPermissions(input: {
  userId: string;
  email: string;
  contactType: ContactType;
  role: UserRole;
  contactId: number;
  authUserProfileId: number;
  isOrgAdmin: boolean;
}): UserPermissions {
  return {
    userId: input.userId,
    email: input.email,
    contactType: input.contactType,
    role: input.role,
    contactId: input.contactId,
    authUserProfileId: input.authUserProfileId,
    isOrgAdmin: input.isOrgAdmin,
    canAccessDeals: canAccessDeals({
      contactType: input.contactType,
      personalRole: input.role,
      isOrgAdmin: input.isOrgAdmin,
    }),
    canAccessDistributions: canAccessDistributions(
      input.contactType,
      input.role,
      input.isOrgAdmin
    ),
    canAccessDocuments: canAccessDocuments(
      input.contactType,
      input.role,
      input.isOrgAdmin
    ),
    canAccessReports: canAccessDeals({
      contactType: input.contactType,
      personalRole: input.role,
      isOrgAdmin: input.isOrgAdmin,
    }),
    canAccessAdminFeatures: canAccessAdminFeatures(input.role),
  };
}

function developmentFallback(
  userId: string,
  email: string,
  extras?: { authUserProfileId?: number; isOrgAdmin?: boolean }
): UserPermissions {
  return buildPermissions({
    userId,
    email,
    contactType: "Balance Sheet Investor",
    role: "admin",
    contactId: 1,
    authUserProfileId: extras?.authUserProfileId ?? 1,
    isOrgAdmin: extras?.isOrgAdmin ?? true,
  });
}

export async function GET() {
  try {
    const { userId, orgRole, has } = await auth();
    const user = await currentUser();

    console.log("🔍 Auth check - userId:", userId, "currentUser:", user?.id);

    if (!userId && !user) {
      console.log("❌ No authentication found with either method");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const finalUserId = userId || user?.id;

    if (!finalUserId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 401 });
    }

    const finalUser =
      user ||
      (await (async () => {
        const { clerkClient } = await import("@clerk/nextjs/server");
        const client = await clerkClient();
        return await client.users.getUser(finalUserId as string);
      })());

    const clerkMemberships = Array.isArray(finalUser.organizationMemberships)
      ? finalUser.organizationMemberships
      : [];
    const clerkIsOrgAdmin =
      (typeof has === "function" && Boolean(has({ role: "org:admin" }))) ||
      isClerkOrgAdminRole(orgRole) ||
      isOrgAdminFromMemberships(clerkMemberships);

    console.log("👤 Clerk user:", {
      id: finalUser.id,
      email: finalUser.emailAddresses[0]?.emailAddress,
      metadata: finalUser.publicMetadata,
      orgRole,
      clerkIsOrgAdmin,
    });

    const supabase = await getSupabaseClient();

    const { data: profile, error: profileError } = await supabase
      .from("auth_clerk_users")
      .select("id, email, clerk_user_id, personal_role, contact_id")
      .eq("clerk_user_id", finalUserId as string)
      .single();

    console.log("📊 Profile lookup:", { profile, profileError });

    if (profileError || !profile) {
      console.error("Profile fetch error:", profileError);

      if (clerkIsOrgAdmin) {
        return NextResponse.json(
          buildPermissions({
            userId: finalUserId as string,
            email: finalUser.emailAddresses[0]?.emailAddress || "",
            contactType: "Balance Sheet Investor",
            role: "balance_sheet_investor",
            contactId: 0,
            authUserProfileId: 0,
            isOrgAdmin: true,
          })
        );
      }

      if (process.env.NODE_ENV === "development") {
        console.log("🛠️ Creating development fallback permissions");
        return NextResponse.json(
          developmentFallback(
            finalUserId as string,
            finalUser.emailAddresses[0]?.emailAddress || "dev@example.com"
          )
        );
      }

      return NextResponse.json(
        {
          error: profile ? "Failed to fetch user profile" : "User profile not found",
          details: profileError,
        },
        { status: profile ? 500 : 404 }
      );
    }

    const { data: memberships, error: membershipError } = await supabase
      .from("auth_clerk_orgs_members")
      .select("clerk_org_role")
      .eq("auth_clerk_users_id", profile.id);

    if (membershipError) {
      console.error("Membership lookup error:", membershipError);
    }

    const isOrgAdmin =
      clerkIsOrgAdmin || isOrgAdminFromMemberships(memberships);

    let contactId = profile.contact_id ?? 0;
    let primaryContactType: ContactType = "Balance Sheet Investor";

    const { data: contact, error: contactError } = profile.contact_id
      ? await supabase
          .from("contact")
          .select("id")
          .eq("id", profile.contact_id)
          .maybeSingle()
      : await supabase
          .from("contact")
          .select("id")
          .eq("user_id", profile.id)
          .maybeSingle();

    console.log("👥 Contact lookup:", { contact, contactError, isOrgAdmin });

    if (contactError) {
      console.error("Contact fetch error:", contactError);
    }

    if (contact?.id) {
      contactId = contact.id;
    } else if (!isOrgAdmin && process.env.NODE_ENV === "development") {
      console.log("🛠️ Creating development fallback permissions (contact error)");
      return NextResponse.json(
        developmentFallback(finalUserId as string, profile.email || "", {
          authUserProfileId: profile.id,
          isOrgAdmin,
        })
      );
    } else if (!contact && !isOrgAdmin && !profile.personal_role) {
      return NextResponse.json(
        { error: "Contact info not found" },
        { status: 404 }
      );
    }

    const role =
      (profile.personal_role as UserRole) ||
      (finalUser.publicMetadata?.role as UserRole) ||
      "viewer";

    const userPermissions = buildPermissions({
      userId: finalUserId as string,
      email: profile.email || "",
      contactType: primaryContactType,
      role: role as UserRole,
      contactId,
      authUserProfileId: profile.id,
      isOrgAdmin,
    });

    return NextResponse.json(userPermissions);
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
