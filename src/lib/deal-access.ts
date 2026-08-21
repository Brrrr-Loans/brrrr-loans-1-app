import type { ContactType, UserRole } from "@/types/auth";

const ALLOWED_DEAL_CONTACT_TYPES: ContactType[] = [
  "Balance Sheet Investor",
  "Lender",
  "Point of Contact",
  "Broker",
  "Borrower",
];

const ALLOWED_DEAL_ROLES: Array<UserRole | string> = [
  "admin",
  "balance_sheet_investor",
];

export function normalizeOrgRole(role?: string | null): string {
  if (!role) return "";
  return role.trim().toLowerCase().replace(/^org:/, "");
}

export function isClerkOrgAdminRole(role?: string | null): boolean {
  return normalizeOrgRole(role) === "admin";
}

/** Org roles that have investment interest (excludes viewer). */
export function isInvestmentOrgRole(role?: string | null): boolean {
  const normalized = normalizeOrgRole(role);
  return normalized === "admin" || normalized === "member";
}

export function isOrgAdminFromMemberships(
  memberships?: Array<{ role?: string | null; clerk_org_role?: string | null }> | null
): boolean {
  if (!memberships || memberships.length === 0) return false;

  for (let i = 0; i < memberships.length; i++) {
    const membership = memberships[i];
    if (
      isClerkOrgAdminRole(membership.role) ||
      isClerkOrgAdminRole(membership.clerk_org_role)
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Deals page access: org admins, internal/investor roles, or allowed contact types.
 * Clerk org admins must be able to view Deals even when personal_role is not admin.
 */
export function canAccessDeals(input: {
  contactType?: string | null;
  personalRole?: string | null;
  isOrgAdmin?: boolean;
}): boolean {
  if (input.isOrgAdmin) return true;

  if (input.personalRole && ALLOWED_DEAL_ROLES.includes(input.personalRole)) {
    return true;
  }

  if (
    input.contactType &&
    ALLOWED_DEAL_CONTACT_TYPES.includes(input.contactType as ContactType)
  ) {
    return true;
  }

  return false;
}

export const DEAL_PAGE_CONTACT_TYPES = ALLOWED_DEAL_CONTACT_TYPES;
