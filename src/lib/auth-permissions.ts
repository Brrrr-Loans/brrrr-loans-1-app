import { auth } from "@clerk/nextjs/server";
import { getSupabaseClient } from "@/lib/supabase-server";
import type { ContactType, UserRole, UserPermissions } from "@/types/auth";

import { PermissionError } from "@/types/auth";
export { PermissionError } from "@/types/auth";
export type { ContactType, UserRole, UserPermissions } from "@/types/auth";

/**
 * Get comprehensive user permissions from database
 */
export async function getUserPermissions(): Promise<UserPermissions | null> {
  try {
    const { userId } = await auth();
    if (!userId) return null;

    const supabase = await getSupabaseClient();

    // Get user profile with contact info
    const { data: userProfile, error: userError } = await supabase
      .from("auth_clerk_users")
      .select(
        `
        id,
        email,
        role,
        contact_id,
        contact:contact_id (
          id,
          contact_type,
          email_address
        )
      `
      )
      .eq("clerk_user_id", userId)
      .single();

    if (userError || !userProfile || !userProfile.contact) {
      console.error("Failed to get user profile:", userError);
      return null;
    }

    const contactType = userProfile.contact.contact_type as ContactType;
    const role = userProfile.role as UserRole;

    // Define permission rules based on contact type and role
    const permissions: UserPermissions = {
      userId,
      email: userProfile.email || userProfile.contact.email_address || "",
      contactType,
      role,
      contactId: userProfile.contact.id,
      authUserProfileId: userProfile.id,
      canAccessDeals: canAccessDeals(contactType, role),
      canAccessDistributions: canAccessDistributions(contactType, role),
      canAccessDocuments: canAccessDocuments(contactType, role),
      canAccessAdminFeatures: canAccessAdminFeatures(contactType, role),
    };

    return permissions;
  } catch (error) {
    console.error("Error getting user permissions:", error);
    return null;
  }
}

/**
 * Check if user can access deals based on contact type and role
 */
function canAccessDeals(contactType: ContactType, role: UserRole): boolean {
  const allowedContactTypes: ContactType[] = [
    "Balance Sheet Investor",
    "Lender",
    "Borrower",
    "Broker",
    "Point of Contact",
  ];

  const allowedRoles: UserRole[] = ["admin", "balance_sheet_investor"];

  return (
    allowedContactTypes.includes(contactType) || allowedRoles.includes(role)
  );
}

/**
 * Check if user can access distributions
 */
function canAccessDistributions(
  contactType: ContactType,
  role: UserRole
): boolean {
  const allowedContactTypes: ContactType[] = [
    "Balance Sheet Investor",
    "Lender",
    "Borrower",
  ];

  const allowedRoles: UserRole[] = ["admin", "balance_sheet_investor"];

  return (
    allowedContactTypes.includes(contactType) || allowedRoles.includes(role)
  );
}

/**
 * Check if user can access documents
 */
function canAccessDocuments(contactType: ContactType, role: UserRole): boolean {
  // Most users can access documents related to their deals
  const restrictedContactTypes: ContactType[] = [
    "General Contractor",
    "Insurance",
  ];

  return !restrictedContactTypes.includes(contactType) || role === "admin";
}

/**
 * Check if user can access admin features
 */
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

    const supabase = await getSupabaseClient();

    // Check if user has access to this specific deal through bsi_deals_clerk_users
    const { data, error } = await supabase
      .from("bsi_deals_clerk_users")
      .select("deal_id")
      .eq("deal_id", Number(dealId))
      .eq("contact_id", permissions.contactId)
      .single();

    return !error && !!data;
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

    const supabase = await getSupabaseClient();

    // Check if document belongs to a deal the user has access to
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
      .single();

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
    if (!permissions[permission]) {
      throw new PermissionError(
        `Access denied: Missing permission ${permission}`,
        "INSUFFICIENT_PERMISSIONS"
      );
    }
  }

  return permissions;
}
