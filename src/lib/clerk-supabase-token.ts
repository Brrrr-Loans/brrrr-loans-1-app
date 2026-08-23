type GetToken = (options?: { template?: string }) => Promise<string | null>;

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const segment = token.split(".")[1];
    if (!segment) return null;

    const padded = segment.replace(/-/g, "+").replace(/_/g, "/");
    const padLength = (4 - (padded.length % 4)) % 4;
    const base64 = padded + "=".repeat(padLength);
    const json =
      typeof atob === "function"
        ? atob(base64)
        : Buffer.from(base64, "base64").toString("utf8");

    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function isSupabaseCompatibleToken(token: string): boolean {
  const payload = decodeJwtPayload(token);
  const role = payload?.role;
  return role === "authenticated" || role === "service_role";
}

/**
 * Clerk token for Supabase PostgREST.
 *
 * Native third-party Clerk auth uses the default session JWT after Clerk adds
 * `role: "authenticated"`. The legacy `supabase` JWT template is still tried
 * when the session token is missing that claim (or unavailable).
 */
export async function getClerkSupabaseToken(
  getToken: GetToken | undefined
): Promise<string | null> {
  if (!getToken) return null;

  const attempts: Array<{ template?: string }> = [{}, { template: "supabase" }];
  let fallback: string | null = null;

  for (const options of attempts) {
    try {
      const token = options.template
        ? await getToken({ template: options.template })
        : await getToken();
      if (!token) continue;
      if (isSupabaseCompatibleToken(token)) return token;
      if (!fallback) fallback = token;
    } catch {
      // Native session tokens and the optional supabase template can each fail
      // independently depending on Clerk/Supabase configuration.
    }
  }

  return fallback;
}

export function supabaseErrorMessage(error: unknown): string {
  if (!error) return "An unexpected error occurred";
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "object" && error !== null) {
    const maybeError = error as {
      message?: unknown;
      details?: unknown;
      code?: unknown;
    };
    if (typeof maybeError.message === "string" && maybeError.message.trim()) {
      return maybeError.message;
    }
    if (typeof maybeError.details === "string" && maybeError.details.trim()) {
      return maybeError.details;
    }
    if (typeof maybeError.code === "string" && maybeError.code.trim()) {
      return `Error ${maybeError.code}`;
    }
  }
  return "An unexpected error occurred";
}

export function isSupabaseAuthError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const maybeError = error as {
    message?: unknown;
    code?: unknown;
    status?: unknown;
  };
  if (maybeError.status === 401 || maybeError.status === 403) return true;
  if (maybeError.code === "PGRST301") return true;

  const message =
    typeof maybeError.message === "string"
      ? maybeError.message.toLowerCase()
      : "";
  return (
    message.includes("jwt") ||
    message.includes("unauthorized") ||
    message.includes("invalid api key") ||
    message.includes("jwsinvalid")
  );
}
