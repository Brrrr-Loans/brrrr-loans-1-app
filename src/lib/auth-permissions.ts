import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/lib/supabase-server";
import { getUserInvestmentOrgs } from "@/lib/auth-helpers";
import { getUserInvestmentOrgs } from "@/lib/auth-helpers";
import type { ContactType, UserRole, UserPermissions } from "@/types/auth";
import {
  canAccessDeals as computeCanAccessDeals,
  isClerkOrgAdminRole,
  isOrgAdminFromMemberships,
} from "@/lib/deal-access";

import { isPlatformAdminIdentity } from "@/lib/internal-admin";
import { PermissionError } from "@/types/auth";
export { PermissionError } from "@/types/auth";
export type { ContactType, UserRole, UserPermissions } from "@/types/auth";

/**
 * Get comprehensive user permissions from database
 */
export async function getUserPermissions(): Promise<UserPermissions | null> {
  try {
    const { userId, orgRole, has } = await auth();
    if (!userId) return null;

    const supabase = createServiceRoleClient();

    const { data: userProfile, error: userError } = await supabase
      .from("auth_clerk_users")
      .select(
        `
        id,
        email,
        personal_role,
        is_internal_yn,
        contact_id,
        auth_clerk_orgs_members (
          clerk_org_role
        ),
        contact:contact_id (
          id,
          email_address
        )
      `
      )
      .eq("clerk_user_id", userId)
      .single();

    const clerkIsOrgAdmin =
      (typeof has === "function" && has({ role: "org:admin" })) ||
      isClerkOrgAdminRole(orgRole);

    if (userError || !userProfile) {
      console.error("Failed to get user profile:", userError);
      const isPlatformAdmin = isPlatformAdminIdentity({ clerkUserId: userId });
      if (isPlatformAdmin || clerkIsOrgAdmin) {
        return {
          userId,
          email: "",
          contactType: "Balance Sheet Investor",
          role: isPlatformAdmin ? "admin" : "balance_sheet_investor",
          contactId: 0,
          authUserProfileId: 0,
          isOrgAdmin: true,
          canAccessDeals: true,
          canAccessDistributions: true,
          canAccessDocuments: true,
          canAccessReports: true,
          canAccessAdminFeatures: isPlatformAdmin,
        };
      }
      return null;
    }

    const memberships = (
      userProfile as {
        auth_clerk_orgs_members?: Array<{ clerk_org_role: string | null }>;
      }
    ).auth_clerk_orgs_members;
    const isOrgAdmin =
      clerkIsOrgAdmin || isOrgAdminFromMemberships(memberships);

    const displayContactType: ContactType = "Balance Sheet Investor";
    const isPlatformAdmin = isPlatformAdminIdentity({
      clerkUserId: userId,
      email: userProfile.email,
      personalRole: userProfile.personal_role,
      isInternalYn: (
        userProfile as { is_internal_yn?: boolean | null }
      ).is_internal_yn,
    });
    const role = (isPlatformAdmin ? "admin" : userProfile.personal_role) as UserRole;
    const contact = userProfile.contact as {
      id: number;
      email_address: string | null;
    } | null;

    if (
      !contact &&
      !isPlatformAdmin &&
      !computeCanAccessDeals({
        personalRole: role,
        isOrgAdmin,
      })
    ) {
      console.error("Failed to get user contact");
      return null;
    }

    const contactTypeForAccess = contact ? displayContactType : undefined;

    const permissions: UserPermissions = {
      userId,
      email: userProfile.email || contact?.email_address || "",
      contactType: displayContactType,
      role,
      contactId: contact?.id || userProfile.contact_id || 0,
      authUserProfileId: userProfile.id,
      isOrgAdmin: isOrgAdmin || isPlatformAdmin,
      canAccessDeals: computeCanAccessDeals({
        contactType: contactTypeForAccess,
        personalRole: role,
        isOrgAdmin: isOrgAdmin || isPlatformAdmin,
      }),
      canAccessDistributions: canAccessDistributions(
        contactTypeForAccess,
        role,
        isOrgAdmin || isPlatformAdmin
      ),
      canAccessDocuments: canAccessDocuments(
        contactTypeForAccess,
        role,
        isOrgAdmin || isPlatformAdmin
      ),
      canAccessReports: computeCanAccessDeals({
        contactType: contactTypeForAccess,
        personalRole: role,
        isOrgAdmin: isOrgAdmin || isPlatformAdmin,
      }),
      canAccessAdminFeatures:
        isPlatformAdmin || canAccessAdminFeatures(displayContactType, role),
    };

    return permissions;
  } catch (error) {
    console.error("Error getting user permissions:", error);
    return null;
  }
}

function canAccessDistributions(
  contactType: ContactType | undefined,
  role: UserRole,
  isOrgAdmin = false
): boolean {
  if (isOrgAdmin) return true;

  const allowedRoles: UserRole[] = ["admin", "balance_sheet_investor"];
  if (allowedRoles.includes(role)) return true;
  if (!contactType) return false;

  const allowedContactTypes: ContactType[] = [
    "Balance Sheet Investor",
    "Lender",
    "Borrower",
  ];

  return allowedContactTypes.includes(contactType);
}

function canAccessDocuments(
  contactType: ContactType | undefined,
  role: UserRole,
  isOrgAdmin = false
): boolean {
  if (isOrgAdmin || role === "admin") return true;
  if (!contactType) return false;

  const restrictedContactTypes: ContactType[] = [
    "General Contractor",
    "Insurance",
  ];

  return !restrictedContactTypes.includes(contactType);
}

function canAccessAdminFeatures(
  contactType: ContactType,
  role: UserRole
): boolean {
  return role === "admin" || contactType === "Lender";
}

/**
 * Verify user has permission to access a specific deal
 */
export async function canAccessDeal(dealId: string | number): Promise<boolean> {
  try {
    const permissions = await getUserPermissions();
    if (!permissions || !permissions.canAccessDeals) return false;
    if (permissions.canAccessAdminFeatures) return true;

    const supabase = createServiceRoleClient();
    const dealIdNum = Number(dealId);

    const { data, error } = await supabase
      .from("bsi_deals_clerk_users")
      .select("deal_id")
      .eq("deal_id", dealIdNum)
      .eq("clerk_user_id", permissions.authUserProfileId)
      .maybeSingle();

    if (!error && data) return true;

    if (!permissions.authUserProfileId) return false;

    const orgIds = await getUserInvestmentOrgs(permissions.authUserProfileId);
    if (orgIds.length === 0) return false;

    const { data: orgLink, error: orgError } = await supabase
      .from("bsi_deals_clerk_orgs")
      .select("deal_id")
      .eq("deal_id", dealIdNum)
      .in("clerk_org_id", orgIds)
      .maybeSingle();

    return !orgError && !!orgLink;
  } catch (error) {
    console.error("Error checking deal access:", error);
    return false;
  }
}

/**
 * Verify user has permission to access a specific document
 */
export async function canAccessDocument(
  documentId: string | number
): Promise<boolean> {
  try {
    const permissions = await getUserPermissions();
    if (!permissions || !permissions.canAccessDocuments) return false;
    if (permissions.canAccessAdminFeatures) return true;

    const supabase = createServiceRoleClient();

    const { data, error } = await supabase
      .from("document_files")
      .select(
        `
        id,
        deal_id,
        bsi_deals_clerk_users!inner(contact_id)
      `
      )
      .eq("id", Number(documentId))
      .eq("bsi_deals_clerk_users.contact_id", permissions.contactId)
      .maybeSingle();

    return !error && !!data;
  } catch (error) {
    console.error("Error checking document access:", error);
    return false;
  }
}

/**
 * Middleware helper to require specific permissions
 */
export async function requirePermissions(
  requiredPermissions: Array<keyof UserPermissions>
): Promise<UserPermissions> {
  const permissions = await getUserPermissions();

  if (!permissions) {
    throw new PermissionError("User not authenticated", "UNAUTHENTICATED");
  }

  for (const permission of requiredPermissions) {
    if (permission === "canAccessDeals" && permissions.isOrgAdmin) {
      continue;
    }
    if (!permissions[permission]) {
      throw new PermissionError(
        `Access denied: Missing permission ${permission}`,
        "INSUFFICIENT_PERMISSIONS"
      );
    }
  }

  return permissions;
}
