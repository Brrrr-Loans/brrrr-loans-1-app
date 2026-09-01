/**
 * Platform (internal) admins have full CRUD on application data.
 *
 * Clerk `public_metadata` is empty for the company principals, and the
 * user.updated webhook previously wrote a nonexistent `role` column. That left
 * `personal_role` / `is_internal_yn` unset, so `is_admin()` RLS and the
 * permissions API treated them as external investors.
 */

export const CHRIS_LESNIK_CLERK_USER_ID =
  "user_36T4CPKX3NzzDtWTdpQIPBQsijN";
export const AARON_KRAUT_CLERK_USER_ID =
  "user_36SyenOL3VUjantAyBmwVbrKbYX";

export const PLATFORM_ADMIN_CLERK_USER_IDS = [
  CHRIS_LESNIK_CLERK_USER_ID,
  AARON_KRAUT_CLERK_USER_ID,
] as const;

export const PLATFORM_ADMIN_EMAILS = [
  "clesnik@brrrr.com",
] as const;

const PLATFORM_ADMIN_ID_SET = new Set<string>(PLATFORM_ADMIN_CLERK_USER_IDS);
const PLATFORM_ADMIN_EMAIL_SET = new Set(
  PLATFORM_ADMIN_EMAILS.map((email) => email.toLowerCase())
);

export type ClerkProfileSync = {
  personal_role: string;
  is_internal_yn: boolean;
};

export function normalizeEmail(email?: string | null): string {
  return (email || "").trim().toLowerCase();
}

export function isKnownPlatformAdmin(input: {
  clerkUserId?: string | null;
  email?: string | null;
}): boolean {
  if (input.clerkUserId && PLATFORM_ADMIN_ID_SET.has(input.clerkUserId)) {
    return true;
  }
  const email = normalizeEmail(input.email);
  return email.length > 0 && PLATFORM_ADMIN_EMAIL_SET.has(email);
}

export function isPlatformAdminIdentity(input: {
  clerkUserId?: string | null;
  email?: string | null;
  personalRole?: string | null;
  isInternalYn?: boolean | null;
  publicMetadata?: { role?: string | null } | null;
}): boolean {
  if (isKnownPlatformAdmin(input)) return true;

  const metadataRole = (input.publicMetadata?.role || "").toLowerCase();
  if (metadataRole === "admin") return true;

  return (
    input.personalRole === "admin" && input.isInternalYn === true
  );
}

export function mapClerkMetadataRole(
  role?: string | null
): string | null {
  if (!role) return null;
  const normalized = role.trim().toLowerCase();
  if (
    normalized === "admin" ||
    normalized === "account_executive" ||
    normalized === "loan_processor" ||
    normalized === "loan_opener" ||
    normalized === "balance_sheet_investor"
  ) {
    return normalized;
  }
  return null;
}

/**
 * Values to write to auth_clerk_users. Never include a `role` column —
 * the table column is `personal_role`.
 */
export function resolveClerkProfileSync(input: {
  clerkUserId: string;
  email?: string | null;
  publicMetadata?: { role?: string | null } | null;
  existingPersonalRole?: string | null;
  existingIsInternalYn?: boolean | null;
}): ClerkProfileSync {
  if (
    isKnownPlatformAdmin({
      clerkUserId: input.clerkUserId,
      email: input.email,
    })
  ) {
    return { personal_role: "admin", is_internal_yn: true };
  }

  const metadataRole = mapClerkMetadataRole(input.publicMetadata?.role);
  if (metadataRole === "admin") {
    return { personal_role: "admin", is_internal_yn: true };
  }

  if (
    input.existingPersonalRole === "admin" &&
    input.existingIsInternalYn === true &&
    !metadataRole
  ) {
    return { personal_role: "admin", is_internal_yn: true };
  }

  return {
    personal_role: metadataRole || "balance_sheet_investor",
    is_internal_yn: false,
  };
}

/**
 * Internal admins should not see an empty Deals table just because
 * bsi_deals_clerk_orgs has no rows for the active Clerk org.
 */
export function shouldFallbackToAllDeals(input: {
  isInternalAdmin: boolean;
  orgLinkedCount: number;
}): boolean {
  return input.isInternalAdmin && input.orgLinkedCount === 0;
}
