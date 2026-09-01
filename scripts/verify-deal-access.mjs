import {
  canAccessDeals,
  isClerkOrgAdminRole,
  isOrgAdminFromMemberships,
  normalizeOrgRole,
} from "../src/lib/deal-access.ts";
import {
  CHRIS_LESNIK_CLERK_USER_ID,
  AARON_KRAUT_CLERK_USER_ID,
  PLATFORM_ADMIN_EMAILS,
  isPlatformAdminIdentity,
  resolveClerkProfileSync,
  shouldFallbackToAllDeals,
} from "../src/lib/internal-admin.ts";
import { unwrapApiDeals, wrapDealsForApi } from "../src/lib/deals-api.ts";
import {
  DEAL_LIST_PATH,
  DEAL_NEW_PATH,
  DEAL_PIPELINE_PATH,
  dealRecordPath,
} from "../src/config/deal-routes.ts";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

assert(normalizeOrgRole("org:admin") === "admin", "normalize org:admin");
assert(isClerkOrgAdminRole("org:admin") === true, "clerk org:admin is admin");
assert(isClerkOrgAdminRole("admin") === true, "admin is admin");
assert(isClerkOrgAdminRole("org:member") === false, "member is not admin");

assert(
  isOrgAdminFromMemberships([{ role: "org:admin" }]) === true,
  "membership role org:admin"
);
assert(
  isOrgAdminFromMemberships([{ clerk_org_role: "admin" }]) === true,
  "db clerk_org_role admin"
);
assert(
  isOrgAdminFromMemberships([{ role: "org:member" }]) === false,
  "membership member is not admin"
);

assert(
  canAccessDeals({ isOrgAdmin: true, personalRole: "viewer" }) === true,
  "org admin can access deals regardless of personal_role"
);
assert(
  canAccessDeals({
    personalRole: "balance_sheet_investor",
    isOrgAdmin: false,
  }) === true,
  "balance_sheet_investor personal role can access deals"
);
assert(
  canAccessDeals({
    contactType: "Balance Sheet Investor",
    personalRole: "viewer",
    isOrgAdmin: false,
  }) === true,
  "BSI contact type can access deals"
);
assert(
  canAccessDeals({
    contactType: "Title",
    personalRole: "loan_processor",
    isOrgAdmin: false,
  }) === false,
  "unrelated role/contact cannot access deals"
);
assert(
  canAccessDeals({
    personalRole: "loan_processor",
    isOrgAdmin: false,
  }) === false,
  "missing contact type must not grant deals via an unrelated personal_role"
);
assert(
  canAccessDeals({
    personalRole: "account_executive",
    isOrgAdmin: false,
  }) === false,
  "profiled non-investor roles cannot access deals without an allowed contact type"
);

assert(
  CHRIS_LESNIK_CLERK_USER_ID === "user_36T4CPKX3NzzDtWTdpQIPBQsijN",
  "Chris Lesnik Clerk user id"
);
assert(
  AARON_KRAUT_CLERK_USER_ID === "user_36SyenOL3VUjantAyBmwVbrKbYX",
  "Aaron Kraut Clerk user id"
);

assert(
  isPlatformAdminIdentity({
    clerkUserId: CHRIS_LESNIK_CLERK_USER_ID,
    email: "clesnik@brrrr.com",
    publicMetadata: {},
  }) === true,
  "Chris is a platform admin even with empty Clerk metadata"
);
assert(
  isPlatformAdminIdentity({
    clerkUserId: AARON_KRAUT_CLERK_USER_ID,
    personalRole: "balance_sheet_investor",
    isInternalYn: false,
  }) === true,
  "Aaron is a platform admin even if the DB row was demoted"
);
assert(
  isPlatformAdminIdentity({
    clerkUserId: "user_other",
    email: "investor@example.com",
    personalRole: "balance_sheet_investor",
  }) === false,
  "unrelated users are not platform admins"
);
assert(
  isPlatformAdminIdentity({
    clerkUserId: "user_other",
    email: "staff@example.com",
    personalRole: "admin",
    isInternalYn: true,
  }) === true,
  "internal admin flag still grants platform admin"
);

const chrisSync = resolveClerkProfileSync({
  clerkUserId: CHRIS_LESNIK_CLERK_USER_ID,
  email: "clesnik@brrrr.com",
  publicMetadata: {},
});
assert(chrisSync.personal_role === "admin", "Chris webhook sync sets personal_role admin");
assert(chrisSync.is_internal_yn === true, "Chris webhook sync sets is_internal_yn");
assert(
  !("role" in chrisSync),
  "webhook payload must use personal_role, not the nonexistent role column"
);

const demotedSync = resolveClerkProfileSync({
  clerkUserId: AARON_KRAUT_CLERK_USER_ID,
  publicMetadata: {},
  existingPersonalRole: "admin",
  existingIsInternalYn: true,
});
assert(
  demotedSync.personal_role === "admin" && demotedSync.is_internal_yn === true,
  "empty Clerk metadata must not demote an existing internal admin"
);

const investorSync = resolveClerkProfileSync({
  clerkUserId: "user_other",
  email: "investor@example.com",
  publicMetadata: {},
});
assert(
  investorSync.personal_role === "balance_sheet_investor",
  "external users still default to balance_sheet_investor"
);
assert(investorSync.is_internal_yn === false, "external users are not internal");

assert(
  shouldFallbackToAllDeals({
    isInternalAdmin: true,
    orgLinkedCount: 0,
  }) === true,
  "internal admins see all deals when org junction rows are empty"
);
assert(
  shouldFallbackToAllDeals({
    isInternalAdmin: true,
    orgLinkedCount: 3,
  }) === false,
  "internal admins keep org filter when org-linked deals exist, even if a later status/search filter is empty"
);
assert(
  shouldFallbackToAllDeals({
    isInternalAdmin: false,
    orgLinkedCount: 0,
  }) === false,
  "non-admins do not get an all-deals fallback"
);

assert(
  PLATFORM_ADMIN_EMAILS.includes("clesnik@brrrr.com"),
  "Chris email is a known platform admin email"
);
assert(
  isPlatformAdminIdentity({
    clerkUserId: AARON_KRAUT_CLERK_USER_ID,
    email: "unrelated@example.com",
    personalRole: "viewer",
    isInternalYn: false,
  }) === true,
  "Aaron is a platform admin by Clerk user id even if email and role are wrong"
);
assert(
  isPlatformAdminIdentity({
    clerkUserId: "user_unrelated",
    email: "anastasia@brrrr.com",
  }) === false,
  "other @brrrr.com addresses are not automatically platform admins"
);

const nested = unwrapApiDeals([
  {
    deal_id: 10,
    deal: {
      id: 10,
      deal_name: "Nested Deal",
      deal_stage_2: "loan_setup",
      deal_disposition_1: "active",
      loan_amount_total: 100,
      funding_date: null,
      project_type: null,
      property_id: null,
      loan_number: "BL1-1",
    },
  },
]);
assert(nested.length === 1 && nested[0].id === 10, "unwrap nested deal rows");

const raw = unwrapApiDeals([
  {
    id: 11,
    deal_name: "Raw Deal",
    deal_stage_2: "underwriting",
    deal_disposition_1: "active",
    loan_amount_total: 200,
    funding_date: null,
    project_type: null,
    property_id: null,
    loan_number: "BL1-2",
  },
]);
assert(raw.length === 1 && raw[0].id === 11, "unwrap raw deal rows from admin queries");

const wrapped = wrapDealsForApi(raw);
assert(
  wrapped.length === 1 && wrapped[0].deal_id === 11 && wrapped[0].deal.id === 11,
  "wrap raw deals so the portal table can consume them"
);

assert(
  DEAL_LIST_PATH === "/balance-sheet/investor-portfolio/deals",
  "deals list route"
);
assert(
  DEAL_PIPELINE_PATH === "/balance-sheet/investor-portfolio/deals/pipeline",
  "deal pipeline route"
);
assert(
  dealRecordPath(69) === "/balance-sheet/investor-portfolio/deals/69",
  "deal record route helper"
);
assert(
  DEAL_NEW_PATH === "/balance-sheet/investor-portfolio/deals/new",
  "new deal route"
);

console.log("deal-access checks passed");
