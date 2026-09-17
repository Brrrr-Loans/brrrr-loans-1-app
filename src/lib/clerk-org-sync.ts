import { isClerkOrgAdminRole } from "./deal-access.ts";
import { isKnownPlatformAdmin, isPlatformAdminIdentity } from "./internal-admin.ts";

export type ClerkOrgRole = "admin" | "member" | "viewer";

export const CLERK_SYNC_SECRET_HEADER = "x-clerk-sync-secret";

/**
 * Clerk org roles arrive as `org:admin` / `org:member` / `org:viewer`
 * (or legacy `admin`). Map them onto the `clerk_org_role` enum.
 */
export function mapClerkOrgRole(role?: string | null): ClerkOrgRole {
  const normalized = (role ?? "").trim().toLowerCase();
  if (normalized.includes("admin")) return "admin";
  if (normalized.includes("viewer")) return "viewer";
  return "member";
}

export type SyncClerkScope =
  | { mode: "all" }
  | { mode: "one"; clerkOrgId: string }
  | { mode: "invalid"; value: string };

function rawClerkOrgIdInput(input: {
  searchParams?: URLSearchParams | null;
  body?: unknown;
}): string | null {
  const fromQuery = input.searchParams?.get("clerk_org_id");
  if (typeof fromQuery === "string" && fromQuery.trim()) {
    return fromQuery.trim();
  }

  if (input.body && typeof input.body === "object") {
    const id = (input.body as { clerk_org_id?: unknown }).clerk_org_id;
    if (typeof id === "string" && id.trim()) {
      return id.trim();
    }
  }

  return null;
}

/**
 * Missing `clerk_org_id` → full sync.
 * Present but not `org_…` → invalid (do not fall through to full sync).
 */
export function parseSyncClerkScope(input: {
  searchParams?: URLSearchParams | null;
  body?: unknown;
}): SyncClerkScope {
  const raw = rawClerkOrgIdInput(input);
  if (!raw) return { mode: "all" };
  if (raw.startsWith("org_")) return { mode: "one", clerkOrgId: raw };
  return { mode: "invalid", value: raw };
}

export function bearerToken(authorizationHeader?: string | null): string | null {
  if (!authorizationHeader) return null;
  const match = authorizationHeader.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

export function isValidClerkSyncSecret(
  provided: string | null | undefined,
  expected: string | null | undefined
): boolean {
  if (!expected || !provided) return false;
  return provided === expected;
}

export type OrganizationCreatedWrite = {
  clerk_org_name: string;
  clerk_org_slug: string;
  created_by_clerk_user_id?: string;
};

/**
 * Membership may already have created the org with a valid creator/slug.
 * Do not overwrite created_by with an unsynced Clerk user (FK 500),
 * and never persist a null slug.
 */
export function resolveOrganizationCreatedWrite(input: {
  orgId: string;
  name: string;
  slug?: string | null;
  createdBy?: string | null;
  creatorExists: boolean;
  existing?: {
    created_by_clerk_user_id?: string | null;
    clerk_org_slug?: string | null;
  } | null;
}): OrganizationCreatedWrite {
  const slug = input.slug || input.existing?.clerk_org_slug || input.orgId;
  const createdBy = input.creatorExists
    ? input.createdBy || input.existing?.created_by_clerk_user_id || undefined
    : input.existing?.created_by_clerk_user_id || undefined;

  const write: OrganizationCreatedWrite = {
    clerk_org_name: input.name,
    clerk_org_slug: slug,
  };
  if (createdBy) write.created_by_clerk_user_id = createdBy;
  return write;
}

export type ClerkSyncAuthHint = {
  hasUserId: boolean;
  emailMatched: boolean;
};

export type ClerkSyncAuthResult = ClerkSyncAuthHint & {
  authorized: boolean;
};

export function clerkSyncUnauthorizedBody(hint: ClerkSyncAuthHint): {
  success: false;
  error: "Unauthorized";
  auth: ClerkSyncAuthHint;
} {
  return {
    success: false,
    error: "Unauthorized",
    auth: {
      hasUserId: Boolean(hint.hasUserId),
      emailMatched: Boolean(hint.emailMatched),
    },
  };
}

export function isScopedClerkOrgAdmin(input: {
  scopedClerkOrgId?: string | null;
  sessionOrgId?: string | null;
  sessionOrgRole?: string | null;
  sessionHasOrgAdmin?: boolean | null;
}): boolean {
  if (!input.scopedClerkOrgId || !input.sessionOrgId) return false;
  if (input.scopedClerkOrgId !== input.sessionOrgId) return false;
  return (
    input.sessionHasOrgAdmin === true ||
    isClerkOrgAdminRole(input.sessionOrgRole)
  );
}

export function authorizeClerkSync(input: {
  secretHeader?: string | null;
  authorizationHeader?: string | null;
  expectedSecret?: string | null;
  clerkUserId?: string | null;
  email?: string | null;
  emails?: Array<string | null | undefined>;
  scopedClerkOrgId?: string | null;
  sessionOrgId?: string | null;
  sessionOrgRole?: string | null;
  sessionHasOrgAdmin?: boolean | null;
}): ClerkSyncAuthResult {
  const emails = [input.email, ...(input.emails ?? [])];
  const matchingEmail =
    emails.find((value) => isKnownPlatformAdmin({ email: value })) ?? null;
  const hint: ClerkSyncAuthHint = {
    hasUserId: Boolean(input.clerkUserId),
    emailMatched: Boolean(matchingEmail),
  };

  const providedSecret = input.secretHeader || bearerToken(input.authorizationHeader);
  if (isValidClerkSyncSecret(providedSecret, input.expectedSecret)) {
    return { authorized: true, ...hint };
  }

  if (
    isPlatformAdminIdentity({
      clerkUserId: input.clerkUserId,
      email: matchingEmail ?? input.email,
    })
  ) {
    return { authorized: true, ...hint };
  }

  if (
    isScopedClerkOrgAdmin({
      scopedClerkOrgId: input.scopedClerkOrgId,
      sessionOrgId: input.sessionOrgId,
      sessionOrgRole: input.sessionOrgRole,
      sessionHasOrgAdmin: input.sessionHasOrgAdmin,
    })
  ) {
    return { authorized: true, ...hint };
  }

  return { authorized: false, ...hint };
}
