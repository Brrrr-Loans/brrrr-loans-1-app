/**
 * Pure policy-builder rules shared by the UI, server actions, and tests.
 * Keep this file free of server/client boundaries so Node scripts can import it.
 */

export type PolicyResourceType =
  | "table"
  | "storage_bucket"
  | "feature"
  | "route"
  | "liveblocks"
  | "api_key";

export type PolicyAction =
  | "select"
  | "insert"
  | "update"
  | "delete"
  | "all"
  | "submit"
  | "view"
  | "room_write"
  | "room_read"
  | "room_presence_write"
  | "room_private"
  | "read"
  | "write";

export type FanOutPolicyKey = {
  orgId: number;
  resourceType: PolicyResourceType;
  resourceName: string;
  action: PolicyAction;
};

export const DEFAULT_TABLE_ACTIONS: PolicyAction[] = [
  "select",
  "insert",
  "update",
  "delete",
];

export const V1_RESOURCE_TYPES: PolicyResourceType[] = [
  "table",
  "feature",
  "route",
  "storage_bucket",
  "liveblocks",
  "api_key",
];

export const API_KEY_ACTIONS: PolicyAction[] = ["read", "write"];

export const LIVEBLOCKS_ACTIONS: PolicyAction[] = [
  "room_write",
  "room_read",
  "room_presence_write",
  "room_private",
];

export const FEATURE_ACTIONS: PolicyAction[] = [
  "submit",
  "view",
  "insert",
  "update",
  "delete",
];

const ROUTE_ACTIONS: readonly PolicyAction[] = [
  "view",
  "submit",
  ...DEFAULT_TABLE_ACTIONS,
];

const TABLE_AND_STORAGE_ACTIONS: readonly PolicyAction[] = [
  ...DEFAULT_TABLE_ACTIONS,
  "all",
];

/** Actions the engine and UI treat as valid for a given resource type. */
export function allowedActionsForResourceType(
  resourceType: PolicyResourceType
): readonly PolicyAction[] {
  switch (resourceType) {
    case "api_key":
      return API_KEY_ACTIONS;
    case "liveblocks":
      return LIVEBLOCKS_ACTIONS;
    case "feature":
      return FEATURE_ACTIONS;
    case "route":
      return ROUTE_ACTIONS;
    default:
      return TABLE_AND_STORAGE_ACTIONS;
  }
}

export function filterActionsForResourceType(
  resourceType: PolicyResourceType,
  actions: readonly PolicyAction[]
): PolicyAction[] {
  const allowed = new Set<PolicyAction>(
    allowedActionsForResourceType(resourceType)
  );
  return actions.filter((action) => allowed.has(action));
}

/** Supabase `.or()` filter: org-owned rows plus inherited globals. */
export function orgPoliciesListOrFilter(orgPk: number): string {
  return `org_id.eq.${orgPk},org_id.is.null`;
}

export function policyFanOutKey(row: FanOutPolicyKey): string {
  return `${row.orgId}|${row.resourceType}|${row.resourceName}|${row.action}`;
}

export function fanOutResourceActions(
  orgId: number,
  resourceType: PolicyResourceType,
  resourceName: string,
  actions: PolicyAction[]
): FanOutPolicyKey[] {
  const resolvedActions = actions.length ? actions : DEFAULT_TABLE_ACTIONS;
  const resolvedName = resourceName || "*";
  const seen = new Set<string>();
  const rows: FanOutPolicyKey[] = [];

  for (const action of resolvedActions) {
    const row: FanOutPolicyKey = {
      orgId,
      resourceType,
      resourceName: resolvedName,
      action,
    };
    const key = policyFanOutKey(row);
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push(row);
  }

  return rows;
}

/**
 * Multi-select resources × actions → one unique row per
 * (org, resource_type, resource_name, action).
 */
export function fanOutResourcesActions(
  orgId: number,
  resources: Array<{ resourceType: PolicyResourceType; resourceName: string }>,
  actions: PolicyAction[]
): FanOutPolicyKey[] {
  const seen = new Set<string>();
  const rows: FanOutPolicyKey[] = [];

  for (const resource of resources) {
    for (const row of fanOutResourceActions(
      orgId,
      resource.resourceType,
      resource.resourceName,
      actions
    )) {
      const key = policyFanOutKey(row);
      if (seen.has(key)) continue;
      seen.add(key);
      rows.push(row);
    }
  }

  return rows;
}

export type PolicyMutationSubject = {
  org_id: number | null;
  is_protected_policy?: boolean | null;
  compiled_config?: { rules?: unknown[] } | null;
  definition_json?: { rules?: unknown[] } | null;
};

export function isGlobalPolicy(
  policy: Pick<PolicyMutationSubject, "org_id">
): boolean {
  return policy.org_id == null;
}

export function isProtectedPolicy(
  policy: Pick<PolicyMutationSubject, "is_protected_policy">
): boolean {
  return !!policy.is_protected_policy;
}

export function policyRuleCount(policy: PolicyMutationSubject): number {
  const compiledRules = policy.compiled_config?.rules;
  if (Array.isArray(compiledRules) && compiledRules.length > 0) {
    return compiledRules.length;
  }
  const definitionRules = policy.definition_json?.rules;
  if (Array.isArray(definitionRules) && definitionRules.length > 0) {
    return definitionRules.length;
  }
  return 1;
}

export function isMultiRulePolicy(policy: PolicyMutationSubject): boolean {
  return policyRuleCount(policy) > 1;
}

export type PolicyMutationKind = "edit" | "toggle" | "archive";

/**
 * Frozen product rules:
 * - Globals (org_id IS NULL) are inherited / read-only
 * - Protected policies are view-only
 * - Multi-rule policies are view-only (SQL to edit)
 */
export function canMutatePolicy(
  policy: PolicyMutationSubject,
  kind: PolicyMutationKind
): boolean {
  if (isGlobalPolicy(policy)) return false;
  if (isProtectedPolicy(policy)) return false;
  if (kind === "edit" && isMultiRulePolicy(policy)) return false;
  if (kind === "archive" && isMultiRulePolicy(policy)) return false;
  return true;
}

export function policyMutationBlockReason(
  policy: PolicyMutationSubject,
  kind: PolicyMutationKind
): string | null {
  if (isGlobalPolicy(policy)) {
    return "Inherited global policies are read-only for this organization.";
  }
  if (isProtectedPolicy(policy)) {
    if (kind === "toggle") {
      return "Protected policies cannot be disabled. They are required for core application security.";
    }
    if (kind === "archive") {
      return "Protected policies cannot be archived. They are required for core application security.";
    }
    return "Protected policies cannot be edited. They are required for core application security.";
  }
  if (kind === "edit" && isMultiRulePolicy(policy)) {
    return "Multi-rule policies are view-only in the UI. Edit them with a SQL migration.";
  }
  if (kind === "archive" && isMultiRulePolicy(policy)) {
    return "Multi-rule policies cannot be archived from the UI. Edit them with a SQL migration.";
  }
  return null;
}

export function assertPolicyMutable(
  policy: PolicyMutationSubject,
  kind: PolicyMutationKind
): void {
  const reason = policyMutationBlockReason(policy, kind);
  if (reason) throw new Error(reason);
}
