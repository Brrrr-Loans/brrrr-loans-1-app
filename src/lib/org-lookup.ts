import {
  isSupabaseAuthError,
  supabaseErrorMessage,
} from "./clerk-supabase-token.ts";

export const CLERK_SUPABASE_JWT_REJECTED_MESSAGE =
  "Clerk session was rejected by Supabase (401). Check that Clerk third-party auth is enabled, the JWT includes role: authenticated, and the JWT secret matches.";

export function orgNotSyncedMessage(clerkOrgId?: string): string {
  const suffix = clerkOrgId ? ` (${clerkOrgId})` : "";
  return (
    `This organization is not synced into auth_clerk_orgs${suffix}. ` +
    "Confirm Clerk webhooks have created the org row and your membership."
  );
}

export function isPostgrestCoerceError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const maybeError = error as { code?: unknown; message?: unknown };
  if (maybeError.code === "PGRST116") return true;
  const message =
    typeof maybeError.message === "string"
      ? maybeError.message.toLowerCase()
      : "";
  return message.includes("coerce") || message.includes("0 rows");
}

export function throwIfSupabaseAuthError(error: unknown): void {
  if (isSupabaseAuthError(error)) {
    throw new Error(CLERK_SUPABASE_JWT_REJECTED_MESSAGE);
  }
}

export function throwMappedSupabaseError(error: unknown): void {
  throwIfSupabaseAuthError(error);
  if (error) throw new Error(supabaseErrorMessage(error));
}

/**
 * Map auth_clerk_orgs lookup results from `.maybeSingle()`.
 * - JWT/401/PGRST301 → Clerk↔Supabase token rejected
 * - 0 rows / coerce leftovers → org not synced
 */
export function resolveAuthClerkOrgPk(input: {
  clerkOrgId: string;
  data: { id?: number | null } | null;
  error: unknown;
}): number {
  throwIfSupabaseAuthError(input.error);

  if (input.data?.id != null) {
    return Number(input.data.id);
  }

  if (isPostgrestCoerceError(input.error)) {
    throw new Error(orgNotSyncedMessage(input.clerkOrgId));
  }

  if (input.error) {
    throw new Error(supabaseErrorMessage(input.error));
  }

  throw new Error(orgNotSyncedMessage(input.clerkOrgId));
}
