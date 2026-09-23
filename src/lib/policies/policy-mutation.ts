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

export const V1_RESOURCE_TYPES: PolicyResourceType[] = [
  "table",
  "feature",
  "route",
  "storage_bucket",
  "liveblocks",
  "api_key",
];

export const API_KEY_ACTIONS: PolicyAction[] = ["read", "write"];

/** Verbs the route picker offers. `all` stays valid in the DB but is not a builder choice. */
export const BUILDER_ROUTE_ACTIONS: PolicyAction[] = ["view", "submit"];

/**
 * Map a stored action into a picker verb for display only — never used to
 * persist. The UI never offers `all`, so a stored `all` becomes the type's
 * default explicit action instead of `select` on every resource type.
 */
export function formActionForStoredPolicy(
  resourceType: PolicyResourceType,
  action: PolicyAction
): PolicyAction {
  if (action !== "all") return action;
  if (resourceType === "route" || resourceType === "feature") return "view";
  if (resourceType === "api_key") return "read";
  if (resourceType === "liveblocks") return "room_write";
  return "select";
}

export const RESOURCE_TYPE_ACTIONS: Record<PolicyResourceType, PolicyAction[]> =
  {
    table: ["select", "insert", "update", "delete", "all"],
    storage_bucket: ["select", "insert", "update", "delete", "all"],
    feature: ["submit", "view", "insert", "update", "delete"],
    route: ["view", "submit", "all"],
    liveblocks: [
      "room_write",
      "room_read",
      "room_presence_write",
      "room_private",
    ],
    api_key: ["read", "write"],
  };

export const POLICY_UPSERT_RESTORE_FIELDS = {
  archived_at: null,
  archived_by: null,
  is_active: true,
} as const;

export type ScopeConditionLike = {
  column: string;
  operator: string;
  reference?: string;
};

export type PolicyScope = "all" | "org_records" | "user_records" | "org_and_user";

export type PolicyConditionLike = {
  field?: string;
  operator?: string;
  values?: string[];
};

export type PolicyConditionGroupLike = {
  connector?: string;
  conditions?: PolicyConditionLike[];
};

export type PolicyDefinitionLike = {
  allowInternalUsers?: boolean;
  conditions?: PolicyConditionLike[];
  conditionGroups?: PolicyConditionGroupLike[];
  scope?: PolicyScope;
  scopeConditions?: ScopeConditionLike[];
  namedScopeConditions?: Array<{ name: string }>;
};

export function actionsAllowedForResourceType(
  resourceType: PolicyResourceType
): PolicyAction[] {
  return RESOURCE_TYPE_ACTIONS[resourceType] ?? [];
}

/** Keep only verbs that are valid for this resource type. */
export function filterActionsForResourceType(
  resourceType: PolicyResourceType,
  actions: PolicyAction[]
): PolicyAction[] {
  const allowed = new Set(actionsAllowedForResourceType(resourceType));
  const seen = new Set<PolicyAction>();
  const filtered: PolicyAction[] = [];
  for (const action of actions) {
    if (!allowed.has(action) || seen.has(action)) continue;
    seen.add(action);
    filtered.push(action);
  }
  return filtered;
}

/** Narrow verbs to those a specific feature declares; unknown features pass through unchanged. */
export function filterActionsForFeature(
  resourceName: string,
  actions: PolicyAction[],
  featureResources: ReadonlyArray<{ name: string; actions: PolicyAction[] }>
): PolicyAction[] {
  const feature = featureResources.find((f) => f.name === resourceName);
  if (!feature) return filterActionsForResourceType("feature", actions);
  const allowed = new Set(feature.actions);
  return filterActionsForResourceType("feature", actions).filter((a) =>
    allowed.has(a)
  );
}

/** `loan_processor` → "Loan Processor". */
export function humanizeRole(role: string): string {
  return role
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** A stored `all` is preserved on edit; the builder never rewrites it to a narrower verb. */
export function actionForPolicyUpdate(
  storedAction: PolicyAction,
  selectedAction: PolicyAction | undefined
): PolicyAction | undefined {
  if (storedAction === "all") return undefined;
  return selectedAction;
}

export function parseCreateSelection(resources: unknown, actions: unknown): {
  resources: unknown[];
  actions: unknown[];
} {
  return {
    resources: Array.isArray(resources) ? resources : [],
    actions: Array.isArray(actions) ? actions : [],
  };
}

export function assertCreateSelection(
  resources: unknown,
  actions: unknown
): void {
  const parsed = parseCreateSelection(resources, actions);
  if (parsed.resources.length === 0) {
    throw new Error("Select at least one resource.");
  }
  if (parsed.actions.length === 0) {
    throw new Error("Select at least one action.");
  }
}

export function isFilledCondition(condition: PolicyConditionLike | null | undefined): boolean {
  return Array.isArray(condition?.values) && condition.values.length > 0;
}

export function sanitizePolicyConditions<T extends PolicyDefinitionLike>(
  definition: T
): T {
  const conditions = (definition.conditions ?? []).filter(isFilledCondition);
  const conditionGroups = (definition.conditionGroups ?? [])
    .map((group) => ({
      ...group,
      conditions: (group.conditions ?? []).filter(isFilledCondition),
    }))
    .filter((group) => group.conditions.length > 0);

  return {
    ...definition,
    conditions,
    conditionGroups,
  };
}

export function hasValidPolicyConditions(definition: PolicyDefinitionLike): boolean {
  if (definition.allowInternalUsers) return true;
  if ((definition.namedScopeConditions ?? []).length > 0) return true;
  if ((definition.conditions ?? []).some(isFilledCondition)) return true;
  return (definition.conditionGroups ?? []).some((group) =>
    (group.conditions ?? []).some(isFilledCondition)
  );
}

export function parseScopeColumn(column: string): string {
  const trimmed = (column ?? "").trim();
  if (!trimmed) return "";
  const parts = trimmed.split(".");
  return parts[parts.length - 1] ?? trimmed;
}

export function isEqualityScopeOperator(operator: string): boolean {
  const normalized = (operator ?? "").trim().toLowerCase();
  return normalized === "=" || normalized === "is" || normalized === "eq";
}

export function isOrgScopeColumn(column: string): boolean {
  const name = parseScopeColumn(column);
  return name === "org_id" || name === "clerk_org_id";
}

export function isUserScopeColumn(column: string): boolean {
  const name = parseScopeColumn(column);
  return (
    name === "created_by" ||
    name === "user_id" ||
    name === "clerk_user_id" ||
    name === "uploaded_by"
  );
}

export function deriveLegacyScope(definition: PolicyDefinitionLike): PolicyScope {
  const explicit = definition.scope;
  const scopeConditions = definition.scopeConditions ?? [];

  if (scopeConditions.length === 0) {
    return explicit || "all";
  }

  const hasOrgEquals = scopeConditions.some(
    (condition) =>
      isOrgScopeColumn(condition.column) &&
      isEqualityScopeOperator(condition.operator)
  );
  const hasUserEquals = scopeConditions.some(
    (condition) =>
      isUserScopeColumn(condition.column) &&
      isEqualityScopeOperator(condition.operator)
  );

  if (hasOrgEquals && hasUserEquals) return "org_and_user";
  if (hasOrgEquals) return "org_records";
  if (hasUserEquals) return "user_records";
  return explicit || "all";
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
  const resolvedName = resourceName || "*";
  return filterActionsForResourceType(resourceType, actions).map((action) => ({
    orgId,
    resourceType,
    resourceName: resolvedName,
    action,
  }));
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

export function canMutatePolicy(
  policy: PolicyMutationSubject,
  kind: PolicyMutationKind
): boolean {
  return policyMutationBlockReason(policy, kind) === null;
}

export function assertPolicyMutable(
  policy: PolicyMutationSubject,
  kind: PolicyMutationKind
): void {
  const reason = policyMutationBlockReason(policy, kind);
  if (reason) throw new Error(reason);
}
