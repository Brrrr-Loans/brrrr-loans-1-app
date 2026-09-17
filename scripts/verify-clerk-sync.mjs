import { AARON_KRAUT_CLERK_USER_ID } from "../src/lib/internal-admin.ts";
import {
  CLERK_SYNC_SECRET_HEADER,
  authorizeClerkSync,
  clerkSyncUnauthorizedBody,
  isScopedClerkOrgAdmin,
  mapClerkOrgRole,
  parseSyncClerkScope,
  resolveOrganizationCreatedWrite,
  verifiedClerkEmails,
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
  }).authorized === true,
  "matching sync secret is authorized"
);

assert(
  authorizeClerkSync({
    authorizationHeader: "Bearer preview-secret",
    expectedSecret: "preview-secret",
  }).authorized === true,
  "Bearer sync secret is authorized"
);

assert(
  authorizeClerkSync({
    secretHeader: "wrong",
    expectedSecret: "preview-secret",
    clerkUserId: "user_stranger",
  }).authorized === false,
  "wrong secret without admin is rejected"
);

assert(
  authorizeClerkSync({
    clerkUserId: AARON_KRAUT_CLERK_USER_ID,
    expectedSecret: "preview-secret",
  }).authorized === true,
  "platform admin can sync without the secret"
);

assert(
  authorizeClerkSync({
    expectedSecret: null,
    clerkUserId: "user_preview_session",
    email: "akraut@brrrr.com", // pragma: allowlist secret
  }).authorized === true,
  "Aaron email allowlist authorizes even if session user id is not hardcoded"
);

assert(
  authorizeClerkSync({
    expectedSecret: null,
    emails: ["personal@example.com", "AKRAUT@BRRRR.COM"], // pragma: allowlist secret
    clerkUserId: "user_preview_session",
  }).authorized === true,
  "secondary Clerk emails still match the platform admin allowlist"
);

assertEqual(
  verifiedClerkEmails({
    primaryEmailAddress: {
      emailAddress: "personal@example.com",
      verification: { status: "verified" },
    },
    emailAddresses: [
      {
        emailAddress: "akraut@brrrr.com", // pragma: allowlist secret
        verification: { status: "unverified" },
      },
      {
        emailAddress: "AKRAUT@BRRRR.COM", // pragma: allowlist secret
        verification: { status: "verified" },
      },
    ],
  }),
  ["personal@example.com", "AKRAUT@BRRRR.COM"], // pragma: allowlist secret
  "only verified Clerk emails are candidates for platform-admin matching"
);

assertEqual(
  verifiedClerkEmails({
    primaryEmailAddress: {
      emailAddress: "akraut@brrrr.com", // pragma: allowlist secret
      verification: { status: "unverified" },
    },
    emailAddresses: [
      {
        emailAddress: "akraut@brrrr.com", // pragma: allowlist secret
        verification: { status: "unverified" },
      },
    ],
  }),
  [],
  "unverified allowlisted emails must not be forwarded to authorizeClerkSync"
);

assert(
  authorizeClerkSync({
    expectedSecret: null,
    clerkUserId: "user_stranger",
  }).authorized === false,
  "public callers are rejected when no secret is configured"
);

const emailMismatch = authorizeClerkSync({
  expectedSecret: null,
  clerkUserId: "user_preview_session",
  email: "someone@example.com",
});
assert(emailMismatch.authorized === false, "unknown email is not a platform admin");
assertEqual(
  { hasUserId: emailMismatch.hasUserId, emailMatched: emailMismatch.emailMatched },
  { hasUserId: true, emailMatched: false },
  "401 hint reports signed-in caller without leaking identity"
);

const anonymous = authorizeClerkSync({ expectedSecret: null });
assertEqual(
  clerkSyncUnauthorizedBody(anonymous),
  {
    success: false,
    error: "Unauthorized",
    auth: { hasUserId: false, emailMatched: false },
  },
  "401 body is only success/error/auth booleans"
);
assert(
  !JSON.stringify(clerkSyncUnauthorizedBody(emailMismatch)).includes("user_"),
  "401 body must not include Clerk user ids"
);
assert(
  !JSON.stringify(clerkSyncUnauthorizedBody({
    hasUserId: true,
    emailMatched: true,
  })).includes("@"),
  "401 body must not include emails"
);

assert(
  isScopedClerkOrgAdmin({
    scopedClerkOrgId: "org_2rNqHTbc3gCIKwPSTXYudYB3Log",
    sessionOrgId: "org_2rNqHTbc3gCIKwPSTXYudYB3Log",
    sessionOrgRole: "org:admin",
  }) === true,
  "active Clerk org admin can sync that org"
);

assert(
  authorizeClerkSync({
    expectedSecret: null,
    clerkUserId: "user_org_admin",
    scopedClerkOrgId: "org_2rNqHTbc3gCIKwPSTXYudYB3Log",
    sessionOrgId: "org_2rNqHTbc3gCIKwPSTXYudYB3Log",
    sessionOrgRole: "org:admin",
  }).authorized === true,
  "scoped sync allows the org's Clerk admin"
);

assert(
  authorizeClerkSync({
    expectedSecret: null,
    clerkUserId: "user_org_admin",
    scopedClerkOrgId: "org_2rNqHTbc3gCIKwPSTXYudYB3Log",
    sessionOrgId: "org_other",
    sessionOrgRole: "org:admin",
  }).authorized === false,
  "org admin of a different org cannot scoped-sync"
);

assert(
  authorizeClerkSync({
    expectedSecret: null,
    clerkUserId: "user_org_member",
    scopedClerkOrgId: "org_2rNqHTbc3gCIKwPSTXYudYB3Log",
    sessionOrgId: "org_2rNqHTbc3gCIKwPSTXYudYB3Log",
    sessionOrgRole: "org:member",
  }).authorized === false,
  "org members cannot scoped-sync"
);

assert(
  authorizeClerkSync({
    expectedSecret: null,
    clerkUserId: "user_org_admin",
    sessionOrgId: "org_2rNqHTbc3gCIKwPSTXYudYB3Log",
    sessionOrgRole: "org:admin",
  }).authorized === false,
  "full sync stays platform-admin/secret only"
);

assert(
  authorizeClerkSync({
    expectedSecret: null,
    clerkUserId: "user_org_admin",
    scopedClerkOrgId: "org_2rNqHTbc3gCIKwPSTXYudYB3Log",
    sessionOrgId: "org_2rNqHTbc3gCIKwPSTXYudYB3Log",
    sessionHasOrgAdmin: true,
  }).authorized === true,
  "Clerk has({ role: org:admin }) is enough for scoped sync"
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
