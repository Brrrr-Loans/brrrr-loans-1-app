import { AARON_KRAUT_CLERK_USER_ID } from "../src/lib/internal-admin.ts";
import {
  CLERK_SYNC_SECRET_HEADER,
  authorizeClerkSync,
  mapClerkOrgRole,
  parseSyncClerkScope,
  resolveOrganizationCreatedWrite,
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

assertEqual(
  parseSyncClerkScope({
    searchParams: new URLSearchParams(
      "clerk_org_id=org_2rNqHTbc3gCIKwPSTXYudYB3Log"
    ),
    body: null,
  }),
  { mode: "one", clerkOrgId: "org_2rNqHTbc3gCIKwPSTXYudYB3Log" },
  "query clerk_org_id is accepted"
);

assertEqual(
  parseSyncClerkScope({
    searchParams: new URLSearchParams(),
    body: { clerk_org_id: "org_2rNqHTbc3gCIKwPSTXYudYB3Log" },
  }),
  { mode: "one", clerkOrgId: "org_2rNqHTbc3gCIKwPSTXYudYB3Log" },
  "body clerk_org_id is accepted"
);

assertEqual(
  parseSyncClerkScope({
    searchParams: new URLSearchParams("clerk_org_id=user_nope"),
    body: null,
  }),
  { mode: "invalid", value: "user_nope" },
  "non-org ids are invalid and must not fall through to full sync"
);

assertEqual(
  parseSyncClerkScope({
    searchParams: new URLSearchParams(),
    body: null,
  }),
  { mode: "all" },
  "omitted clerk_org_id means full sync"
);

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

assertEqual(
  resolveOrganizationCreatedWrite({
    orgId: "org_preview",
    name: "Preview Org",
    slug: null,
    createdBy: "user_missing",
    creatorExists: false,
    existing: {
      created_by_clerk_user_id: "user_member",
      clerk_org_slug: "preview-org",
    },
  }),
  {
    clerk_org_name: "Preview Org",
    clerk_org_slug: "preview-org",
    created_by_clerk_user_id: "user_member",
  },
  "org.created keeps membership creator and slug when webhook creator is unsynced"
);

assertEqual(
  resolveOrganizationCreatedWrite({
    orgId: "org_preview",
    name: "Preview Org",
    slug: null,
    createdBy: "user_missing",
    creatorExists: false,
    existing: null,
  }),
  {
    clerk_org_name: "Preview Org",
    clerk_org_slug: "org_preview",
  },
  "new org with unsynced creator omits created_by and coalesces slug to org id"
);

console.log("verify-clerk-sync: all assertions passed");
