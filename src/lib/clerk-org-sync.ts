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
