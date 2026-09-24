import { readFileSync } from "node:fs";
import {
  CHRIS_LESNIK_CLERK_USER_ID,
  isPlatformAdminIdentity,
} from "../src/lib/internal-admin.ts";
import { buildPortalQuery } from "../src/lib/deals-api.ts";
import {
  DEFAULT_IMPERSONATION_SESSION_TTL_SECONDS,
  authorizeImpersonationStart,
  buildImpersonationSessionPayload,
  canControlImpersonation,
  extractClientSuppliedTarget,
  getImpersonationSessionTtlSeconds,
  impersonationCookieOptions,
  resolveImpersonationTarget,
  signImpersonationSession,
  verifyImpersonationSession,
} from "../src/lib/impersonation-session.ts";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const SECRET = "test-impersonation-secret";

const investor = {
  clerkUserId: "user_investor",
  email: "investor@example.com",
  personalRole: "balance_sheet_investor",
  isInternalYn: false,
};

const platformAdmin = {
  clerkUserId: CHRIS_LESNIK_CLERK_USER_ID,
  email: "clesnik@brrrr.com",
  personalRole: "admin",
  isInternalYn: true,
};

const flaggedInternalAdmin = {
  clerkUserId: "user_staff_admin",
  email: "staff@example.com",
  personalRole: "admin",
  isInternalYn: true,
};

assert(
  canControlImpersonation(investor) === false,
  "investors cannot control impersonation"
);
assert(
  canControlImpersonation(platformAdmin) === true,
  "known platform admin can control impersonation"
);
assert(
  canControlImpersonation(flaggedInternalAdmin) === true,
  "personal_role=admin && is_internal_yn can control impersonation"
);
assert(
  canControlImpersonation({ clerkUserId: null }) === false,
  "unsigned callers cannot control impersonation"
);
assert(
  isPlatformAdminIdentity({
    clerkUserId: platformAdmin.clerkUserId,
    email: platformAdmin.email,
    personalRole: platformAdmin.personalRole,
    isInternalYn: platformAdmin.isInternalYn,
  }) === canControlImpersonation(platformAdmin),
  "impersonation uses the same platform-admin helper"
);

const deniedByQuery = authorizeImpersonationStart({
  caller: investor,
  requestedTargetUserId: 99,
});
assert(deniedByQuery.ok === false && deniedByQuery.status === 403, "a");
assert(
  deniedByQuery.error === "Forbidden - admin only",
  "normal user cannot start impersonation via a request body target"
);

const deniedUnsigned = authorizeImpersonationStart({
  caller: { clerkUserId: null },
  requestedTargetUserId: 99,
});
assert(deniedUnsigned.ok === false && deniedUnsigned.status === 401, "unsigned start is 401");

const allowedStart = authorizeImpersonationStart({
  caller: platformAdmin,
  requestedTargetUserId: "42",
});
assert(
  allowedStart.ok === true && allowedStart.targetUserId === 42,
  "platform admin can start impersonation for a numeric target"
);

assert(
  DEFAULT_IMPERSONATION_SESSION_TTL_SECONDS === 30 * 60,
  "default impersonation TTL is 30 minutes"
);
assert(
  getImpersonationSessionTtlSeconds(undefined) === 30 * 60,
  "missing TTL env falls back to 30 minutes"
);
assert(
  getImpersonationSessionTtlSeconds("900") === 900,
  "IMPERSONATION_SESSION_TTL_SECONDS is honored"
);
assert(
  getImpersonationSessionTtlSeconds("0") === 30 * 60,
  "non-positive TTL env is ignored"
);
assert(
  impersonationCookieOptions().maxAge === getImpersonationSessionTtlSeconds(),
  "httpOnly cookie maxAge matches the session TTL"
);

const now = 1_700_000_000_000;
const cookie = signImpersonationSession(
  buildImpersonationSessionPayload({
    actorClerkUserId: platformAdmin.clerkUserId,
    targetUserId: 42,
    targetUserName: "Jane Investor",
    now,
    ttlSeconds: 1800,
  }),
  SECRET
);

const verified = verifyImpersonationSession(cookie, SECRET, { now });
assert(verified?.targetUserId === 42, "signed session round-trips");
assert(verified?.exp === now + 1800 * 1000, "signed session carries exp");
assert(
  verifyImpersonationSession(cookie, "wrong-secret", { now }) === null,
  "tampered secret is rejected"
);
assert(
  verifyImpersonationSession(`${cookie}x`, SECRET, { now }) === null,
  "tampered cookie is rejected"
);

const expiredCookie = signImpersonationSession(
  buildImpersonationSessionPayload({
    actorClerkUserId: platformAdmin.clerkUserId,
    targetUserId: 42,
    targetUserName: "Jane Investor",
    now,
    ttlSeconds: 60,
  }),
  SECRET
);
assert(
  verifyImpersonationSession(expiredCookie, SECRET, {
    now: now + 60 * 1000,
  }) === null,
  "expired session is rejected at the cookie"
);
assert(
  verifyImpersonationSession(
    signImpersonationSession(
      {
        actorClerkUserId: platformAdmin.clerkUserId,
        targetUserId: 42,
        targetUserName: "Jane Investor",
        iat: now,
      },
      SECRET
    ),
    SECRET,
    { now }
  ) === null,
  "cookies without exp are invalid"
);

const investorViaQuery = resolveImpersonationTarget({
  caller: investor,
  searchParams: new URLSearchParams("impersonate_user_id=42&clerk_org_id=org_other"),
  secret: SECRET,
});
assert(investorViaQuery.isImpersonating === false, "query param does not impersonate");
assert(investorViaQuery.targetUserId === null, "query param target is not used");
assert(
  investorViaQuery.ignoredClientTarget === true,
  "old query-param style is detected and ignored"
);
assert(investorViaQuery.rejected === "not_admin", "non-admin query impersonation is rejected");

const investorViaBody = resolveImpersonationTarget({
  caller: investor,
  body: { impersonate_user_id: 42, userId: 42 },
  secret: SECRET,
});
assert(
  investorViaBody.isImpersonating === false &&
    investorViaBody.targetUserId === null &&
    investorViaBody.ignoredClientTarget === true,
  "request-body impersonation is ignored for normal users"
);

const investorStolenCookie = resolveImpersonationTarget({
  caller: investor,
  cookieValue: cookie,
  secret: SECRET,
});
assert(
  investorStolenCookie.isImpersonating === false &&
    investorStolenCookie.targetUserId === null,
  "non-admins cannot read an impersonation cookie"
);

const adminViaQueryOnly = resolveImpersonationTarget({
  caller: platformAdmin,
  searchParams: new URLSearchParams("impersonate_user_id=99"),
  body: { impersonate_user_id: 99 },
  secret: SECRET,
});
assert(
  adminViaQueryOnly.isImpersonating === false &&
    adminViaQueryOnly.targetUserId === null &&
    adminViaQueryOnly.ignoredClientTarget === true,
  "old query-param / body style is ignored even for admins"
);

const adminViaSession = resolveImpersonationTarget({
  caller: platformAdmin,
  cookieValue: cookie,
  searchParams: new URLSearchParams("impersonate_user_id=99"),
  body: { impersonate_user_id: 99 },
  secret: SECRET,
  now,
});
assert(adminViaSession.isImpersonating === true, "admin can impersonate via signed session");
assert(
  adminViaSession.targetUserId === 42,
  "session target wins; query/body target 99 is not used"
);
assert(adminViaSession.targetUserName === "Jane Investor", "session carries the display name");
assert(
  adminViaSession.ignoredClientTarget === true,
  "query-param style is still flagged as ignored when a session exists"
);

const expiredForAdmin = resolveImpersonationTarget({
  caller: platformAdmin,
  cookieValue: expiredCookie,
  secret: SECRET,
  now: now + 60 * 1000,
});
assert(
  expiredForAdmin.isImpersonating === false &&
    expiredForAdmin.targetUserId === null &&
    expiredForAdmin.rejected === "invalid_session",
  "expired session is ignored even for a platform admin"
);

const otherAdmin = resolveImpersonationTarget({
  caller: flaggedInternalAdmin,
  cookieValue: cookie,
  secret: SECRET,
  now,
});
assert(
  otherAdmin.isImpersonating === false && otherAdmin.rejected === "actor_mismatch",
  "impersonation cookies are bound to the acting admin"
);

const queryTarget = extractClientSuppliedTarget({
  searchParams: new URLSearchParams("impersonate_user_id=7"),
  body: { impersonate_user_id: 8 },
});
assert(queryTarget === 7, "query impersonate_user_id is the extractable client target");

const impersonatingQuery = buildPortalQuery({
  clerkOrgId: "org_admin",
  isImpersonating: true,
});
assert(
  impersonatingQuery.has("impersonate_user_id") === false,
  "client query builder never sends impersonate_user_id"
);
assert(
  impersonatingQuery.has("clerk_org_id") === false,
  "impersonation does not send the admin org as an override"
);

const orgOnlyQuery = buildPortalQuery({
  clerkOrgId: "org_vt",
  isImpersonating: false,
});
assert(orgOnlyQuery.get("clerk_org_id") === "org_vt", "org filter remains for the signed-in user");
assert(
  orgOnlyQuery.has("impersonate_user_id") === false,
  "org filter is not an impersonation query param"
);

const apiRoutesThatMustIgnoreQueryImpersonation = [
  "src/app/api/investor-summary/contributions/route.ts",
  "src/app/api/investor-summary/distributions/route.ts",
  "src/app/api/investor-summary/deals/route.ts",
  "src/app/api/investor-dashboard/cumulative-cash-flow/route.ts",
  "src/app/api/deals/route.ts",
  "src/app/api/distributions/route.ts",
  "src/app/api/documents/deal/route.ts",
];

for (const file of apiRoutesThatMustIgnoreQueryImpersonation) {
  const source = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
  assert(
    !source.includes("impersonate_user_id"),
    `${file} must not read impersonate_user_id`
  );
  assert(
    source.includes("resolveRequestImpersonation"),
    `${file} must resolve impersonation from the server session`
  );
}

console.log("impersonation checks passed");
