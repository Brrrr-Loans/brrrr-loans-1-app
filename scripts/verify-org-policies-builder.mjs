import {
  API_KEY_ACTIONS,
  BUILDER_ROUTE_ACTIONS,
  POLICY_UPSERT_RESTORE_FIELDS,
  V1_RESOURCE_TYPES,
  assertCreateSelection,
  formActionForStoredPolicy,
  canMutatePolicy,
  deriveLegacyScope,
  fanOutResourceActions,
  fanOutResourcesActions,
  actionForPolicyUpdate,
  filterActionsForFeature,
  filterActionsForResourceType,
  hasValidPolicyConditions,
  humanizeRole,
  isGlobalPolicy,
  isMultiRulePolicy,
  isProtectedPolicy,
  orgPoliciesListOrFilter,
  policyFanOutKey,
  policyMutationBlockReason,
  sanitizePolicyConditions,
} from "../src/lib/policies/policy-mutation.ts";
import {
  CLERK_SUPABASE_JWT_REJECTED_MESSAGE,
  isPostgrestCoerceError,
  orgNotSyncedMessage,
  resolveAuthClerkOrgPk,
} from "../src/lib/org-lookup.ts";

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

// ---------------------------------------------------------------------------
// Fan-out save uniqueness
// ---------------------------------------------------------------------------

const duplicateActions = fanOutResourceActions(42, "api_key", "deals", [
  "read",
  "write",
  "read",
]);
assertEqual(
  duplicateActions.map(policyFanOutKey),
  ["42|api_key|deals|read", "42|api_key|deals|write"],
  "duplicate actions collapse to one row per (org, type, name, action)"
);

const duplicateResources = fanOutResourcesActions(
  42,
  [
    { resourceType: "table", resourceName: "deal" },
    { resourceType: "table", resourceName: "deal" },
    { resourceType: "feature", resourceName: "settings_policies" },
  ],
  ["select", "select", "update"]
);
assertEqual(
  duplicateResources.map(policyFanOutKey),
  [
    "42|table|deal|select",
    "42|table|deal|update",
    "42|feature|settings_policies|update",
  ],
  "duplicate resources × actions fan out uniquely and drop verbs invalid for the type"
);

const wildcardName = fanOutResourceActions(7, "route", "", ["view"]);
assertEqual(
  wildcardName[0],
  { orgId: 7, resourceType: "route", resourceName: "*", action: "view" },
  "empty resource name becomes wildcard *"
);

const defaultActions = fanOutResourceActions(1, "table", "deal", []);
assertEqual(
  defaultActions.map((row) => row.action),
  [],
  "empty action list writes nothing — create requires an explicit action"
);

const mixedFanOut = fanOutResourcesActions(
  42,
  [
    { resourceType: "table", resourceName: "deal" },
    { resourceType: "api_key", resourceName: "deals" },
  ],
  ["read", "write", "select"]
);
assertEqual(
  mixedFanOut.map(policyFanOutKey),
  [
    "42|table|deal|select",
    "42|api_key|deals|read",
    "42|api_key|deals|write",
  ],
  "mixed resources only receive actions allowed for each type"
);

assertEqual(
  filterActionsForResourceType("table", ["read", "write", "select"]),
  ["select"],
  "read/write are not applied to tables"
);
assertEqual(
  filterActionsForResourceType("api_key", ["select", "read"]),
  ["read"],
  "table CRUD is not applied to api_key resources"
);
assertEqual(
  filterActionsForResourceType("route", ["select", "insert", "update", "delete"]),
  [],
  "table CRUD is not applied to routes"
);
assertEqual(
  filterActionsForResourceType("route", ["view", "submit", "select"]),
  ["view", "submit"],
  "routes keep view/submit from the route action set"
);

const mixedRouteFanOut = fanOutResourcesActions(
  42,
  [
    { resourceType: "table", resourceName: "deal" },
    { resourceType: "route", resourceName: "*" },
  ],
  ["select", "view"]
);
assertEqual(
  mixedRouteFanOut.map(policyFanOutKey),
  ["42|table|deal|select", "42|route|*|view"],
  "mixed table+route persists only type-allowed verbs"
);

assertEqual(
  BUILDER_ROUTE_ACTIONS,
  ["view", "submit"],
  "route picker does not offer all"
);
assertEqual(
  formActionForStoredPolicy("route", "all"),
  "view",
  "stored route all opens as view, not select"
);
assertEqual(
  formActionForStoredPolicy("table", "all"),
  "select",
  "stored table all still opens as select"
);
assertEqual(
  fanOutResourcesActions(
    42,
    [
      { resourceType: "table", resourceName: "deal" },
      { resourceType: "route", resourceName: "*" },
    ],
    BUILDER_ROUTE_ACTIONS
  ).map(policyFanOutKey),
  ["42|route|*|view", "42|route|*|submit"],
  "mixed table+route with picker verbs does not write table all/select"
);

// ---------------------------------------------------------------------------
// Global inherited / read-only
// ---------------------------------------------------------------------------

const globalPolicy = {
  org_id: null,
  is_protected_policy: false,
  compiled_config: { rules: [{ connector: "AND" }] },
};
assert(isGlobalPolicy(globalPolicy) === true, "null org_id is global");
assert(isGlobalPolicy({ org_id: 12 }) === false, "numeric org_id is org-owned");
assert(
  canMutatePolicy(globalPolicy, "edit") === false,
  "globals cannot be edited"
);
assert(
  canMutatePolicy(globalPolicy, "toggle") === false,
  "globals cannot be toggled"
);
assert(
  canMutatePolicy(globalPolicy, "archive") === false,
  "globals cannot be archived"
);
assert(
  policyMutationBlockReason(globalPolicy, "edit")?.includes("Inherited") ===
    true,
  "global block reason mentions inherited"
);

// ---------------------------------------------------------------------------
// Protected / multi-rule blocked edit
// ---------------------------------------------------------------------------

const protectedPolicy = {
  org_id: 12,
  is_protected_policy: true,
  compiled_config: { rules: [{ connector: "AND" }] },
};
assert(isProtectedPolicy(protectedPolicy) === true, "protected flag");
assert(
  canMutatePolicy(protectedPolicy, "edit") === false,
  "protected cannot be edited"
);
assert(
  canMutatePolicy(protectedPolicy, "toggle") === false,
  "protected cannot be toggled"
);
assert(
  canMutatePolicy(protectedPolicy, "archive") === false,
  "protected cannot be archived"
);

const multiRulePolicy = {
  org_id: 12,
  is_protected_policy: false,
  compiled_config: {
    rules: [{ connector: "AND" }, { connector: "OR" }],
  },
};
assert(isMultiRulePolicy(multiRulePolicy) === true, "two compiled rules");
assert(
  canMutatePolicy(multiRulePolicy, "edit") === false,
  "multi-rule cannot be edited in UI"
);
assert(
  canMutatePolicy(multiRulePolicy, "archive") === false,
  "multi-rule cannot be archived in UI"
);
assert(
  canMutatePolicy(multiRulePolicy, "toggle") === true,
  "org-owned single-tenant multi-rule may still be toggled"
);

const editablePolicy = {
  org_id: 12,
  is_protected_policy: false,
  compiled_config: { rules: [{ connector: "AND" }] },
};
assert(canMutatePolicy(editablePolicy, "edit") === true, "org single-rule editable");
assert(canMutatePolicy(editablePolicy, "toggle") === true, "org single-rule togglable");
assert(canMutatePolicy(editablePolicy, "archive") === true, "org single-rule archivable");

// ---------------------------------------------------------------------------
// Query paths still include org + inherited globals
// ---------------------------------------------------------------------------

assertEqual(
  orgPoliciesListOrFilter(99),
  "org_id.eq.99,org_id.is.null",
  "list query still fetches org rows plus org_id IS NULL globals"
);

assertEqual(
  V1_RESOURCE_TYPES.slice().sort(),
  [
    "api_key",
    "feature",
    "liveblocks",
    "route",
    "storage_bucket",
    "table",
  ],
  "v1 resource types stay complete"
);

assertEqual(API_KEY_ACTIONS, ["read", "write"], "api_key actions persist as read/write");

// ---------------------------------------------------------------------------
// Archived recreate restores visibility
// ---------------------------------------------------------------------------

assertEqual(
  POLICY_UPSERT_RESTORE_FIELDS,
  { archived_at: null, archived_by: null, is_active: true },
  "upsert restore fields clear archived_at and restore visibility"
);

// ---------------------------------------------------------------------------
// Condition groups count; leftover empty org_role rows are dropped
// ---------------------------------------------------------------------------

assert(
  hasValidPolicyConditions({
    conditions: [{ field: "org_role", operator: "is", values: [] }],
    conditionGroups: [
      {
        connector: "OR",
        conditions: [{ field: "org_role", operator: "is", values: ["admin"] }],
      },
    ],
  }) === true,
  "nested condition groups count as valid conditions"
);

assert(
  hasValidPolicyConditions({
    conditions: [{ field: "org_role", operator: "is", values: [] }],
    conditionGroups: [
      {
        connector: "OR",
        conditions: [{ field: "org_role", operator: "is", values: [] }],
      },
    ],
  }) === false,
  "empty leftover org_role rows are not valid conditions"
);

const sanitized = sanitizePolicyConditions({
  conditions: [
    { field: "org_role", operator: "is", values: [] },
    { field: "org_role", operator: "is", values: ["member"] },
  ],
  conditionGroups: [
    {
      connector: "OR",
      conditions: [{ field: "org_role", operator: "is", values: [] }],
    },
    {
      connector: "AND",
      conditions: [{ field: "org_type", operator: "is", values: ["internal"] }],
    },
  ],
});
assertEqual(
  sanitized.conditions,
  [{ field: "org_role", operator: "is", values: ["member"] }],
  "sanitize drops empty leftover org_role conditions"
);
assertEqual(
  sanitized.conditionGroups,
  [
    {
      connector: "AND",
      conditions: [{ field: "org_type", operator: "is", values: ["internal"] }],
    },
  ],
  "sanitize drops empty leftover org_role groups"
);

// ---------------------------------------------------------------------------
// WHERE operators + qualified columns compile to org/user scope
// ---------------------------------------------------------------------------

assertEqual(
  deriveLegacyScope({
    scopeConditions: [
      { column: "deal.org_id", operator: "is", reference: "active_org" },
    ],
  }),
  "org_records",
  "qualified org_id + is compiles to org_records"
);
assertEqual(
  deriveLegacyScope({
    scopeConditions: [
      { column: "created_by", operator: "is", reference: "current_user_clerk" },
    ],
  }),
  "user_records",
  "created_by + is compiles to user_records"
);
assertEqual(
  deriveLegacyScope({
    scopeConditions: [
      { column: "documents.clerk_org_id", operator: "eq", reference: "active_org" },
      { column: "documents.uploaded_by", operator: "=", reference: "current_user_pk" },
    ],
  }),
  "org_and_user",
  "org + user equality operators compile to org_and_user"
);
assertEqual(
  deriveLegacyScope({
    scopeConditions: [
      { column: "deal.org_id", operator: "is_not", reference: "active_org" },
    ],
  }),
  "all",
  "non-equality WHERE operators do not become org_records"
);

// ---------------------------------------------------------------------------
// Empty create never succeeds
// ---------------------------------------------------------------------------

let emptyCreateError = "";
try {
  assertCreateSelection([], ["select"]);
} catch (error) {
  emptyCreateError = error instanceof Error ? error.message : String(error);
}
assert(
  emptyCreateError.includes("resource"),
  "empty create without resources is rejected"
);

let emptyActionError = "";
try {
  assertCreateSelection([{ resourceType: "table", resourceName: "deal" }], []);
} catch (error) {
  emptyActionError = error instanceof Error ? error.message : String(error);
}
assert(
  emptyActionError.includes("action"),
  "empty create without actions is rejected"
);

// ---------------------------------------------------------------------------
// Org lookup / auth error mapping
// ---------------------------------------------------------------------------

let jwtError = "";
try {
  resolveAuthClerkOrgPk({
    clerkOrgId: "org_36SzeYzil2XqjLza1TKcLLEkQ8O",
    data: null,
    error: { status: 401, message: "JWT expired" },
  });
} catch (error) {
  jwtError = error instanceof Error ? error.message : String(error);
}
assertEqual(
  jwtError,
  CLERK_SUPABASE_JWT_REJECTED_MESSAGE,
  "401/JWT maps to Clerk↔Supabase token rejection"
);

let coerceError = "";
try {
  resolveAuthClerkOrgPk({
    clerkOrgId: "org_36SzeYzil2XqjLza1TKcLLEkQ8O",
    data: null,
    error: {
      code: "PGRST116",
      message: "Cannot coerce the result to a single JSON object",
    },
  });
} catch (error) {
  coerceError = error instanceof Error ? error.message : String(error);
}
assertEqual(
  coerceError,
  orgNotSyncedMessage("org_36SzeYzil2XqjLza1TKcLLEkQ8O"),
  "PGRST116 / 0-row coerce maps to unsynced org, not PostgREST gibberish"
);

let missingRowError = "";
try {
  resolveAuthClerkOrgPk({
    clerkOrgId: "org_missing",
    data: null,
    error: null,
  });
} catch (error) {
  missingRowError = error instanceof Error ? error.message : String(error);
}
assert(
  missingRowError.includes("auth_clerk_orgs"),
  "null maybeSingle row maps to org not synced"
);

assert(
  isPostgrestCoerceError({
    message: "Cannot coerce the result to a single JSON object",
  }) === true,
  "coerce detector matches Aaron's permissions error"
);

assertEqual(
  resolveAuthClerkOrgPk({
    clerkOrgId: "org_ok",
    data: { id: 12 },
    error: null,
  }),
  12,
  "maybeSingle org row resolves to numeric pk"
);

// ---------------------------------------------------------------------------
// Per-feature action narrowing + preserved `all` on update
// ---------------------------------------------------------------------------

const FEATURES = [
  { name: "settings_general", actions: ["view", "update"] },
  { name: "settings_members", actions: ["view", "insert", "update", "delete"] },
];

assertEqual(
  filterActionsForFeature("settings_general", ["view", "update", "delete"], FEATURES),
  ["view", "update"],
  "feature verbs narrow to the actions that feature declares"
);

assertEqual(
  filterActionsForFeature("unknown_feature", ["view", "all"], FEATURES),
  ["view"],
  "unknown features pass through, but `all` is not a feature verb"
);

assertEqual(
  actionForPolicyUpdate("all", "view"),
  undefined,
  "stored `all` is preserved on edit (no action update sent)"
);

assertEqual(
  actionForPolicyUpdate("view", "submit"),
  "submit",
  "non-`all` stored action is updated to the selected verb"
);

assertEqual(
  humanizeRole("loan_processor"),
  "Loan Processor",
  "snake_case member roles humanize for picker labels"
);

console.log("verify-org-policies-builder: all assertions passed");
