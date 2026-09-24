import { createHmac, timingSafeEqual } from "node:crypto";
import { isPlatformAdminIdentity } from "./internal-admin";

export const IMPERSONATION_COOKIE_NAME = "portal_impersonation";
export const DEFAULT_IMPERSONATION_SESSION_TTL_SECONDS = 30 * 60;

export type ImpersonationSessionPayload = {
  actorClerkUserId: string;
  targetUserId: number;
  targetUserName: string;
  iat: number;
  exp: number;
};

export type CallerIdentity = {
  clerkUserId?: string | null;
  email?: string | null;
  personalRole?: string | null;
  isInternalYn?: boolean | null;
  publicMetadata?: { role?: string | null } | null;
};

export type ResolvedImpersonation = {
  isImpersonating: boolean;
  targetUserId: number | null;
  targetUserName: string | null;
  actorClerkUserId: string | null;
  ignoredClientTarget: boolean;
  rejected: false | "not_admin" | "invalid_session" | "actor_mismatch";
};

export type AuthorizeImpersonationStartResult =
  | { ok: true; targetUserId: number }
  | { ok: false; status: 401 | 403 | 400; error: string };

export function canControlImpersonation(identity: CallerIdentity): boolean {
  if (!identity.clerkUserId) return false;
  return isPlatformAdminIdentity(identity);
}

export function getImpersonationSecret(explicit?: string): string {
  const secret =
    explicit ||
    process.env.IMPERSONATION_SESSION_SECRET ||
    process.env.CLERK_SECRET_KEY ||
    "";
  if (!secret) {
    throw new Error("Missing impersonation session secret");
  }
  return secret;
}

export function getImpersonationSessionTtlSeconds(
  envValue = process.env.IMPERSONATION_SESSION_TTL_SECONDS
): number {
  const parsed = envValue ? Number.parseInt(envValue, 10) : Number.NaN;
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }
  return DEFAULT_IMPERSONATION_SESSION_TTL_SECONDS;
}

export function impersonationCookieOptions(): {
  httpOnly: true;
  secure: boolean;
  sameSite: "lax";
  path: string;
  maxAge: number;
} {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: getImpersonationSessionTtlSeconds(),
  };
}

export function buildImpersonationSessionPayload(input: {
  actorClerkUserId: string;
  targetUserId: number;
  targetUserName: string;
  now?: number;
  ttlSeconds?: number;
}): ImpersonationSessionPayload {
  const iat = input.now ?? Date.now();
  const ttlSeconds =
    input.ttlSeconds ?? getImpersonationSessionTtlSeconds();
  return {
    actorClerkUserId: input.actorClerkUserId,
    targetUserId: input.targetUserId,
    targetUserName: input.targetUserName,
    iat,
    exp: iat + ttlSeconds * 1000,
  };
}

function toBase64Url(value: Buffer | string): string {
  const buffer = typeof value === "string" ? Buffer.from(value) : value;
  return buffer.toString("base64url");
}

function hmac(secret: string, data: string): Buffer {
  return createHmac("sha256", secret).update(data).digest();
}

export function signImpersonationSession(
  payload: ImpersonationSessionPayload,
  secret: string
): string {
  const body = toBase64Url(JSON.stringify(payload));
  const signature = toBase64Url(hmac(secret, body));
  return `${body}.${signature}`;
}

function isSessionPayload(value: unknown): value is ImpersonationSessionPayload {
  if (!value || typeof value !== "object") return false;
  const parsed = value as Record<string, unknown>;
  return (
    typeof parsed.actorClerkUserId === "string" &&
    typeof parsed.targetUserId === "number" &&
    Number.isFinite(parsed.targetUserId) &&
    typeof parsed.targetUserName === "string" &&
    typeof parsed.iat === "number" &&
    typeof parsed.exp === "number" &&
    Number.isFinite(parsed.exp)
  );
}

export function verifyImpersonationSession(
  cookieValue: string | null | undefined,
  secret: string,
  options?: { now?: number }
): ImpersonationSessionPayload | null {
  if (!cookieValue) return null;
  const [body, signature] = cookieValue.split(".");
  if (!body || !signature) return null;

  const expected = hmac(secret, body);
  const actual = Buffer.from(signature, "base64url");
  if (actual.length !== expected.length) return null;
  if (!timingSafeEqual(actual, expected)) return null;

  try {
    const parsed: unknown = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8")
    );
    if (!isSessionPayload(parsed)) return null;
    const now = options?.now ?? Date.now();
    if (parsed.exp <= now) return null;
    return {
      actorClerkUserId: parsed.actorClerkUserId,
      targetUserId: parsed.targetUserId,
      targetUserName: parsed.targetUserName,
      iat: parsed.iat,
      exp: parsed.exp,
    };
  } catch {
    return null;
  }
}

function parseTargetId(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.trunc(value);
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
}

/**
 * Client-supplied impersonation ids are never authoritative. This only exists
 * so APIs can detect and ignore the old query/body attack surface.
 */
export function extractClientSuppliedTarget(input: {
  searchParams?: URLSearchParams | null;
  body?: unknown;
}): number | null {
  const fromQuery = parseTargetId(
    input.searchParams?.get("impersonate_user_id")
  );
  if (fromQuery != null) return fromQuery;

  if (!input.body || typeof input.body !== "object") return null;
  const body = input.body as Record<string, unknown>;
  return (
    parseTargetId(body.impersonate_user_id) ??
    parseTargetId(body.impersonateUserId) ??
    null
  );
}

export function authorizeImpersonationStart(input: {
  caller: CallerIdentity;
  requestedTargetUserId: unknown;
}): AuthorizeImpersonationStartResult {
  if (!input.caller.clerkUserId) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }
  if (!canControlImpersonation(input.caller)) {
    return { ok: false, status: 403, error: "Forbidden - admin only" };
  }
  const targetUserId = parseTargetId(input.requestedTargetUserId);
  if (targetUserId == null || targetUserId <= 0) {
    return { ok: false, status: 400, error: "Invalid impersonation target" };
  }
  return { ok: true, targetUserId };
}

function inactiveSession(
  actorClerkUserId: string | null,
  ignoredClientTarget: boolean,
  rejected: ResolvedImpersonation["rejected"]
): ResolvedImpersonation {
  return {
    isImpersonating: false,
    targetUserId: null,
    targetUserName: null,
    actorClerkUserId,
    ignoredClientTarget,
    rejected,
  };
}

/**
 * Resolve who the request may view as. Query params and request bodies are
 * never used as the target — only a signed cookie bound to a platform admin.
 */
export function resolveImpersonationTarget(input: {
  caller: CallerIdentity;
  cookieValue?: string | null;
  searchParams?: URLSearchParams | null;
  body?: unknown;
  secret: string;
  now?: number;
}): ResolvedImpersonation {
  const ignoredClientTarget = extractClientSuppliedTarget(input) != null;
  const actorClerkUserId = input.caller.clerkUserId ?? null;

  if (!canControlImpersonation(input.caller)) {
    const rejected =
      ignoredClientTarget || input.cookieValue ? "not_admin" : false;
    return inactiveSession(actorClerkUserId, ignoredClientTarget, rejected);
  }

  if (!input.cookieValue) {
    return inactiveSession(actorClerkUserId, ignoredClientTarget, false);
  }

  const session = verifyImpersonationSession(input.cookieValue, input.secret, {
    now: input.now,
  });
  if (!session) {
    return inactiveSession(
      actorClerkUserId,
      ignoredClientTarget,
      "invalid_session"
    );
  }
  if (session.actorClerkUserId !== input.caller.clerkUserId) {
    return inactiveSession(
      actorClerkUserId,
      ignoredClientTarget,
      "actor_mismatch"
    );
  }

  return {
    isImpersonating: true,
    targetUserId: session.targetUserId,
    targetUserName: session.targetUserName,
    actorClerkUserId,
    ignoredClientTarget,
    rejected: false,
  };
}
