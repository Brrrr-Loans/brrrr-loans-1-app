import {
  canAccessDeals,
  isClerkOrgAdminRole,
  isOrgAdminFromMemberships,
  normalizeOrgRole,
} from "../src/lib/deal-access.ts";

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

console.log("deal-access checks passed");
