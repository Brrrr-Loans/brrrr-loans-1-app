import {
  API_KEY_ACTIONS,
  V1_RESOURCE_TYPES,
  canMutatePolicy,
  fanOutResourceActions,
  fanOutResourcesActions,
  filterActionsForResourceType,
  isGlobalPolicy,
  isMultiRulePolicy,
  isProtectedPolicy,
  orgPoliciesListOrFilter,
  policyFanOutKey,
  policyMutationBlockReason,
} from "../src/lib/policies/policy-mutation.ts";

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
    "42|feature|settings_policies|select",
    "42|feature|settings_policies|update",
  ],
  "duplicate resources × actions fan out uniquely"
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
  ["select", "insert", "update", "delete"],
  "empty action list defaults to table CRUD"
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

assertEqual(
  filterActionsForResourceType("table", ["select", "read", "write", "insert"]),
  ["select", "insert"],
  "table policies drop api_key verbs"
);
assertEqual(
  filterActionsForResourceType("api_key", ["select", "read", "write", "insert"]),
  ["read", "write"],
  "api_key policies drop table verbs"
);
assertEqual(
  filterActionsForResourceType("liveblocks", ["room_write", "select", "read"]),
  ["room_write"],
  "liveblocks policies drop foreign verbs"
);

console.log("verify-org-policies-builder: all assertions passed");
