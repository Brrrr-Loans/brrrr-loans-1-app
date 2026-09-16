import { AARON_KRAUT_CLERK_USER_ID } from "../src/lib/internal-admin.ts";
import {
  CLERK_SYNC_SECRET_HEADER,
  InvalidSyncClerkOrgIdError,
  authorizeClerkSync,
  mapClerkOrgRole,
  parseSyncClerkOrgId,
} from "../src/lib/clerk-org-sync.ts";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertEqual(actual, expected, message) {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);
  if (actualJson !== expectedJson) {
    throw new Error(
      `${message}\n  expected: ${expectedJson}\n  actual:   ${actualJson}`
    );
  }
}

assertEqual(mapClerkOrgRole("org:admin"), "admin", "org:admin → admin");
assertEqual(mapClerkOrgRole("org:member"), "member", "org:member → member");
assertEqual(mapClerkOrgRole("org:viewer"), "viewer", "org:viewer → viewer");
assertEqual(mapClerkOrgRole("admin"), "admin", "legacy admin → admin");
assertEqual(mapClerkOrgRole("Org:Admin"), "admin", "mixed-case org:admin");
assertEqual(
  mapClerkOrgRole("custom_org:viewer_role"),
  "viewer",
  "includes viewer"
);
assertEqual(mapClerkOrgRole(""), "member", "empty role defaults to member");
assertEqual(mapClerkOrgRole(null), "member", "null role defaults to member");

const targeted = parseSyncClerkOrgId({
  searchParams: new URLSearchParams(
    "clerk_org_id=org_2rNqHTbc3gCIKwPSTXYudYB3Log"
  ),
  body: null,
});
assertEqual(
  targeted,
  "org_2rNqHTbc3gCIKwPSTXYudYB3Log",
  "query clerk_org_id is accepted"
);

assertEqual(
  parseSyncClerkOrgId({
    searchParams: new URLSearchParams(),
    body: { clerk_org_id: "org_2rNqHTbc3gCIKwPSTXYudYB3Log" },
  }),
  "org_2rNqHTbc3gCIKwPSTXYudYB3Log",
  "body clerk_org_id is accepted"
);

assertEqual(
  parseSyncClerkOrgId({
    searchParams: new URLSearchParams(),
    body: null,
  }),
  undefined,
  "missing clerk_org_id means full sync"
);

try {
  parseSyncClerkOrgId({
    searchParams: new URLSearchParams("clerk_org_id=user_nope"),
    body: null,
  });
  throw new Error("non-org ids should be rejected");
} catch (error) {
  assert(
    error instanceof InvalidSyncClerkOrgIdError,
    "non-org ids throw InvalidSyncClerkOrgIdError"
  );
}

try {
  parseSyncClerkOrgId({
    searchParams: new URLSearchParams("clerk_org_id=org-typo"),
    body: { clerk_org_id: "org_2rNqHTbc3gCIKwPSTXYudYB3Log" },
  });
  throw new Error("invalid query clerk_org_id should not fall through");
} catch (error) {
  assert(
    error instanceof InvalidSyncClerkOrgIdError,
    "invalid query clerk_org_id is not treated as a full sync"
  );
}

assertEqual(CLERK_SYNC_SECRET_HEADER, "x-clerk-sync-secret", "secret header name");

assert(
  authorizeClerkSync({
    secretHeader: "preview-secret",
    expectedSecret: "preview-secret",
  }) === true,
  "matching sync secret is authorized"
);

assert(
  authorizeClerkSync({
    authorizationHeader: "Bearer preview-secret",
    expectedSecret: "preview-secret",
  }) === true,
  "Bearer sync secret is authorized"
);

assert(
  authorizeClerkSync({
    secretHeader: "wrong",
    expectedSecret: "preview-secret",
    clerkUserId: "user_stranger",
  }) === false,
  "wrong secret without admin is rejected"
);

assert(
  authorizeClerkSync({
    clerkUserId: AARON_KRAUT_CLERK_USER_ID,
    expectedSecret: "preview-secret",
  }) === true,
  "platform admin can sync without the secret"
);

assert(
  authorizeClerkSync({
    expectedSecret: null,
    clerkUserId: "user_stranger",
  }) === false,
  "public callers are rejected when no secret is configured"
);

console.log("verify-clerk-sync: all assertions passed");
