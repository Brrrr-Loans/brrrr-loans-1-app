import { cookies } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/lib/supabase-server";
import { getCurrentUserData } from "@/lib/auth-helpers";
import {
  IMPERSONATION_COOKIE_NAME,
  authorizeImpersonationStart,
  buildImpersonationSessionPayload,
  canControlImpersonation,
  getImpersonationSecret,
  impersonationCookieOptions,
  resolveImpersonationTarget,
  signImpersonationSession,
  type CallerIdentity,
} from "@/lib/impersonation-session";

export type ImpersonationScope = {
  clerkUserId: string | null;
  callerUserId: number | null;
  isPlatformAdmin: boolean;
  isImpersonating: boolean;
  targetUserId: number | null;
  targetUserName: string | null;
  actorClerkUserId: string | null;
};

export type ImpersonationView = {
  canImpersonate: boolean;
  isImpersonating: boolean;
  impersonatedUserId: number | null;
  impersonatedUserName: string | null;
};

export type ImpersonationCommandResult =
  | { ok: true; impersonatedUserId: number; impersonatedUserName: string }
  | { ok: false; status: 401 | 403 | 400 | 404; error: string };

const EMPTY_SCOPE: ImpersonationScope = {
  clerkUserId: null,
  callerUserId: null,
  isPlatformAdmin: false,
  isImpersonating: false,
  targetUserId: null,
  targetUserName: null,
  actorClerkUserId: null,
};

const EMPTY_VIEW: ImpersonationView = {
  canImpersonate: false,
  isImpersonating: false,
  impersonatedUserId: null,
  impersonatedUserName: null,
};

async function loadCallerIdentity(): Promise<{
  identity: CallerIdentity;
  callerUserId: number | null;
  clerkUserId: string | null;
}> {
  const { userId } = await auth();
  if (!userId) {
    return { identity: {}, callerUserId: null, clerkUserId: null };
  }

  const userData = await getCurrentUserData();
  return {
    clerkUserId: userId,
    callerUserId: userData?.id ?? null,
    identity: {
      clerkUserId: userId,
      email: userData?.email,
      personalRole: userData?.personal_role,
      isInternalYn: userData?.is_internal_yn,
    },
  };
}

export async function resolveRequestImpersonation(): Promise<ImpersonationScope> {
  const { identity, callerUserId, clerkUserId } = await loadCallerIdentity();
  if (!clerkUserId) {
    return { ...EMPTY_SCOPE };
  }

  const cookieStore = await cookies();
  const resolved = resolveImpersonationTarget({
    caller: identity,
    cookieValue: cookieStore.get(IMPERSONATION_COOKIE_NAME)?.value ?? null,
    secret: getImpersonationSecret(),
  });

  if (resolved.rejected === "invalid_session") {
    cookieStore.set(IMPERSONATION_COOKIE_NAME, "", {
      ...impersonationCookieOptions(),
      maxAge: 0,
    });
  }

  return {
    clerkUserId,
    callerUserId,
    isPlatformAdmin: canControlImpersonation(identity),
    isImpersonating: resolved.isImpersonating,
    targetUserId: resolved.isImpersonating
      ? resolved.targetUserId
      : callerUserId,
    targetUserName: resolved.isImpersonating ? resolved.targetUserName : null,
    actorClerkUserId: resolved.actorClerkUserId,
  };
}

export async function getImpersonationView(): Promise<ImpersonationView> {
  const scope = await resolveRequestImpersonation();
  if (!scope.isPlatformAdmin) {
    return { ...EMPTY_VIEW };
  }

  return {
    canImpersonate: true,
    isImpersonating: scope.isImpersonating,
    impersonatedUserId: scope.isImpersonating ? scope.targetUserId : null,
    impersonatedUserName: scope.targetUserName,
  };
}

export async function startImpersonationSession(
  requestedTargetUserId: unknown
): Promise<ImpersonationCommandResult> {
  const { identity, clerkUserId } = await loadCallerIdentity();
  const authorized = authorizeImpersonationStart({
    caller: identity,
    requestedTargetUserId,
  });
  if (!authorized.ok) {
    return authorized;
  }
  if (!clerkUserId) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }

  const supabase = createServiceRoleClient();
  const { data: target } = await supabase
    .from("auth_clerk_users")
    .select("id, full_name, email")
    .eq("id", authorized.targetUserId)
    .maybeSingle();

  if (!target) {
    return {
      ok: false,
      status: 404,
      error: "Impersonated user not found",
    };
  }

  const targetUserName = target.full_name || target.email || "Unknown";
  const cookieStore = await cookies();
  cookieStore.set(
    IMPERSONATION_COOKIE_NAME,
    signImpersonationSession(
      buildImpersonationSessionPayload({
        actorClerkUserId: clerkUserId,
        targetUserId: target.id,
        targetUserName,
      }),
      getImpersonationSecret()
    ),
    impersonationCookieOptions()
  );

  console.info("[impersonation] start", {
    actorClerkUserId: clerkUserId,
    targetUserId: target.id,
    targetUserName,
  });

  return {
    ok: true,
    impersonatedUserId: target.id,
    impersonatedUserName: targetUserName,
  };
}

export async function stopImpersonationSession(): Promise<void> {
  const { clerkUserId } = await loadCallerIdentity();
  const cookieStore = await cookies();
  cookieStore.set(IMPERSONATION_COOKIE_NAME, "", {
    ...impersonationCookieOptions(),
    maxAge: 0,
  });

  if (clerkUserId) {
    console.info("[impersonation] stop", { actorClerkUserId: clerkUserId });
  }
}
