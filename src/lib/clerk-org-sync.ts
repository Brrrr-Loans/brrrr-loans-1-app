import { isPlatformAdminIdentity } from "./internal-admin.ts";

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

export function parseSyncClerkOrgId(input: {
  searchParams?: URLSearchParams | null;
  body?: unknown;
}): string | undefined {
  const fromQuery = input.searchParams?.get("clerk_org_id")?.trim();
  if (fromQuery?.startsWith("org_")) return fromQuery;

  if (input.body && typeof input.body === "object") {
    const id = (input.body as { clerk_org_id?: unknown }).clerk_org_id;
    if (typeof id === "string" && id.trim().startsWith("org_")) {
      return id.trim();
    }
  }

  return undefined;
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

export function authorizeClerkSync(input: {
  secretHeader?: string | null;
  authorizationHeader?: string | null;
  expectedSecret?: string | null;
  clerkUserId?: string | null;
  email?: string | null;
}): boolean {
  const providedSecret = input.secretHeader || bearerToken(input.authorizationHeader);
  if (isValidClerkSyncSecret(providedSecret, input.expectedSecret)) {
    return true;
  }

  return isPlatformAdminIdentity({
    clerkUserId: input.clerkUserId,
    email: input.email,
  });
}
