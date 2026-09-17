"use server";

import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

// Re-export types from constants (type-only re-exports are fine in "use server")
export type {
  ConditionInput,
  ConditionGroupInput,
  PolicyScope,
  PolicyEffect,
  PolicyDefinitionInput,
  ResourceType,
  PolicyAction,
  OrgPolicyRow,
  NamedScopeRow,
  IntegrationFeatureResource,
  RoomScopeInput,
  DealRoleTypeRow,
} from "./constants";

import type {
  PolicyDefinitionInput,
  ResourceType,
  PolicyAction,
  OrgPolicyRow,
  NamedScopeRow,
  DealRoleTypeRow,
} from "./constants";
import { getClerkSupabaseToken } from "@/lib/clerk-supabase-token";
import {
  FEATURE_RESOURCES,
  LIVEBLOCKS_RESOURCES,
  API_RESOURCES,
  type IntegrationFeatureResource,
} from "./constants";
import {
  assertCreateSelection,
  assertPolicyMutable,
  deriveLegacyScope,
  fanOutResourceActions,
  hasValidPolicyConditions,
  orgPoliciesListOrFilter,
  sanitizePolicyConditions,
  POLICY_UPSERT_RESTORE_FIELDS,
  type PolicyMutationSubject,
} from "@/lib/policies/policy-mutation";
import {
  resolveAuthClerkOrgPk,
  throwMappedSupabaseError,
} from "@/lib/org-lookup";

type SavePolicyInput = {
  resourceType: ResourceType;
  resourceName?: string;
  actions: PolicyAction[];
  definition: PolicyDefinitionInput;
};

function supabaseForUser(token: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL environment variable. Please add it to your .env file."
    );
  }

  if (!anon) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable. Please add it to your .env file."
    );
  }

  return createClient(url, anon, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false },
  });
}

async function requireAuthAndOrg() {
  const { userId, orgId, getToken, orgRole } = await auth();
  if (!userId) throw new Error("Not authenticated");
  if (!orgId) throw new Error("No active organization selected");

  const token = await getClerkSupabaseToken((options) => getToken(options));
  if (!token) {
    throw new Error("Missing Clerk Supabase token");
  }

  return { userId, orgId, orgRole, token };
}

// ADAPTED: Changed from UUID to BIGINT
async function getOrgPk(
  supabase: ReturnType<typeof supabaseForUser>,
  orgId: string
): Promise<number> {
  if (!orgId.startsWith("org_")) {
    throw new Error(
      `Invalid organization ID: "${orgId}". ` +
        `Organization IDs must start with "org_", not "user_". ` +
        `Please check your URL and ensure you're using the correct organization ID.`
    );
  }

  const { data, error } = await supabase
    .from("auth_clerk_orgs")
    .select("id")
    .eq("clerk_org_id", orgId)
    .maybeSingle();

  return resolveAuthClerkOrgPk({ clerkOrgId: orgId, data, error });
}

function normalizeRole(value?: string) {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return "";
  return trimmed.toLowerCase().replace(/^org:/, "");
}

function prepareDefinition(definition: PolicyDefinitionInput): PolicyDefinitionInput {
  const sanitized = sanitizePolicyConditions(definition);
  if (!hasValidPolicyConditions(sanitized)) {
    throw new Error(
      "At least one condition or internal-user allowance is required."
    );
  }
  return {
    ...sanitized,
    scope: deriveLegacyScope(sanitized),
  };
}

type CompiledCondition = { field: string; operator: string; values: string[] };

function compilePolicy(definition: PolicyDefinitionInput): {
  allow_internal_users: boolean;
  conditions: CompiledCondition[];
  [key: string]: unknown;
} {
  const legacyScope = deriveLegacyScope(definition);
  const conditions = (definition.conditions ?? []).map((c) => ({
    field: c.field,
    operator: c.operator,
    values: c.values.map((v) => v.toLowerCase()),
  }));
  const conditionGroups = (definition.conditionGroups ?? [])
    .filter((g) => g.conditions.length > 0)
    .map((g) => ({
      connector: g.connector,
      conditions: g.conditions.map((c) => ({
        field: c.field,
        operator: c.operator,
        values: c.values.map((v) => v.toLowerCase()),
      })),
    }));
  const scopeConditions = (definition.scopeConditions ?? []).map((c) => ({
    column: c.column,
    operator: c.operator,
    reference: c.reference,
  }));
  const namedScopes = definition.namedScopeConditions ?? [];

  const ruleScope =
    namedScopes.length > 0 ? `named:${namedScopes[0].name}` : legacyScope;

  const ruleObj: Record<string, unknown> = {
    connector: definition.connector || "AND",
    scope: ruleScope,
    conditions,
  };
  if (conditionGroups.length > 0) {
    ruleObj.condition_groups = conditionGroups;
  }
  if (namedScopes.length > 0) {
    ruleObj.named_scope_conditions = namedScopes.map((n) => ({ name: n.name }));
  }
  if (definition.roomScope) {
    ruleObj.room_scope = {
      level: definition.roomScope.level,
      deal_role_type_ids: definition.roomScope.dealRoleTypeIds,
    };
  }

  const compiled: {
    allow_internal_users: boolean;
    conditions: CompiledCondition[];
    [key: string]: unknown;
  } = {
    version: 3,
    allow_internal_users: !!definition.allowInternalUsers,
    rules: [ruleObj],
    conditions,
    condition_groups: conditionGroups.length > 0 ? conditionGroups : undefined,
    connector: definition.connector || "AND",
    scope: legacyScope,
    scope_conditions: scopeConditions,
    scope_connector: definition.scopeConnector || "OR",
  };
  if (definition.roomScope) {
    compiled.room_scope = {
      level: definition.roomScope.level,
      deal_role_type_ids: definition.roomScope.dealRoleTypeIds,
    };
  }
  return compiled;
}

function buildDefinition(definition: PolicyDefinitionInput) {
  const namedScopes = definition.namedScopeConditions ?? [];
  const conditionGroups = (definition.conditionGroups ?? [])
    .filter((g) => g.conditions.length > 0)
    .map((g) => ({
      connector: g.connector,
      conditions: g.conditions.map((c) => ({
        field: c.field,
        operator: c.operator,
        values: c.values,
      })),
    }));
  const base: Record<string, unknown> = {
    version: 3,
    effect: definition.effect || "ALLOW",
    allow_internal_users: !!definition.allowInternalUsers,
    conditions: (definition.conditions ?? []).map((c) => ({
      field: c.field,
      operator: c.operator,
      values: c.values,
    })),
    connector: definition.connector || "AND",
    scope: deriveLegacyScope(definition),
    scope_conditions: (definition.scopeConditions ?? []).map((c) => ({
      column: c.column,
      operator: c.operator,
      reference: c.reference,
    })),
    scope_connector: definition.scopeConnector || "OR",
  };
  if (conditionGroups.length > 0) {
    base.condition_groups = conditionGroups;
  }
  if (namedScopes.length > 0) {
    base.named_scope_conditions = namedScopes.map((n) => ({ name: n.name }));
  }
  if (definition.roomScope) {
    base.room_scope = {
      level: definition.roomScope.level,
      deal_role_type_ids: definition.roomScope.dealRoleTypeIds,
    };
  }
  return base;
}

export async function getOrgDisplayName(): Promise<string> {
  const { orgId, token } = await requireAuthAndOrg();
  const supabase = supabaseForUser(token);

  const { data, error } = await supabase
    .from("auth_clerk_orgs")
    .select("clerk_org_name")
    .eq("clerk_org_id", orgId)
    .maybeSingle();

  throwMappedSupabaseError(error);

  return (data?.clerk_org_name as string) ?? "This Organization";
}

// ADAPTED: Return type changed from string to number (BIGINT)
export async function getOrgPolicies(): Promise<{
  orgPk: number;
  policies: OrgPolicyRow[];
}> {
  const { orgId, token } = await requireAuthAndOrg();
  const supabase = supabaseForUser(token);
  const orgPk = await getOrgPk(supabase, orgId);

  // Try with is_protected_policy first; fall back if column doesn't exist yet
  let data: unknown[] | null = null;
  let error: { message: string } | null = null;

  // Fetch org-specific + global (org_id IS NULL) policies
  const result = await supabase
    .from("organization_policies")
    .select(
      "id,org_id,resource_type,resource_name,action,definition_json,compiled_config,scope,effect,version,is_active,is_protected_policy,created_at,archived_at"
    )
    .or(orgPoliciesListOrFilter(orgPk))
    .is("archived_at", null)
    .order("created_at", { ascending: false });

  if (result.error && result.error.message.includes("is_protected_policy")) {
    // Column not yet added — retry without it
    const fallback = await supabase
      .from("organization_policies")
      .select(
        "id,org_id,resource_type,resource_name,action,definition_json,compiled_config,scope,effect,version,is_active,created_at,archived_at"
      )
      .or(orgPoliciesListOrFilter(orgPk))
      .is("archived_at", null)
      .order("created_at", { ascending: false });

    data = (fallback.data ?? []).map((row: Record<string, unknown>) => ({
      ...row,
      is_protected_policy: false,
    }));
    error = fallback.error as { message: string } | null;
  } else {
    data = result.data;
    error = result.error as { message: string } | null;
  }

  throwMappedSupabaseError(error);

  return {
    orgPk,
    policies: (data ?? []) as OrgPolicyRow[],
  };
}

export async function saveOrgPolicy(
  input: SavePolicyInput
): Promise<{ ok: true }> {
  const { orgId, token, orgRole, userId } = await requireAuthAndOrg();
  const supabase = supabaseForUser(token);
  const orgPk = await getOrgPk(supabase, orgId);

  assertCreateSelection(
    [{ resourceType: input.resourceType, resourceName: input.resourceName }],
    input.actions
  );

  const definition = prepareDefinition(input.definition);
  const compiledConfig = compilePolicy(definition);
  const definitionJson = buildDefinition(definition);

  // Self-lockout protection: owners and admins can always save policies
  const normalizedOrgRole = normalizeRole(orgRole ?? "");
  const isPrivileged = ["owner", "admin"].includes(normalizedOrgRole);

  if (!isPrivileged) {
    // For non-admin users, check if the policy would still grant them access
    const currentUserAllowed =
      compiledConfig.allow_internal_users ||
      compiledConfig.conditions.some(
        (c: { field: string; operator: string; values: string[] }) =>
          c.field === "org_role" &&
          c.operator === "is" &&
          (c.values.includes("*") || c.values.includes(normalizedOrgRole))
      );

    if (!currentUserAllowed) {
      throw new Error(
        "This policy would deny your access based on your org role. Update the conditions or use an owner/admin account."
      );
    }
  }

  const fanOut = fanOutResourceActions(
    orgPk,
    input.resourceType,
    input.resourceName || "*",
    input.actions
  );

  if (fanOut.length === 0) {
    throw new Error(
      `None of the selected actions apply to ${input.resourceType} resources.`
    );
  }

  const rows = await Promise.all(
    fanOut.map(async (key) => {
      const { data: existing } = await supabase
        .from("organization_policies")
        .select("id,version")
        .eq("org_id", orgPk)
        .eq("resource_type", key.resourceType)
        .eq("resource_name", key.resourceName)
        .eq("action", key.action)
        .maybeSingle();

      return {
        id: existing?.id ?? crypto.randomUUID(),
        org_id: orgPk,
        resource_type: key.resourceType,
        resource_name: key.resourceName,
        action: key.action,
        definition_json: definitionJson,
        compiled_config: compiledConfig,
        scope: definition.scope || "all",
        effect: definition.effect || "ALLOW",
        version: (existing?.version ?? 0) + 1,
        created_by_clerk_sub: userId,
        ...POLICY_UPSERT_RESTORE_FIELDS,
      };
    })
  );

  const { error } = await supabase.from("organization_policies").upsert(rows, {
    onConflict: "org_id,resource_type,resource_name,action",
  });

  throwMappedSupabaseError(error);

  return { ok: true };
}

async function loadPolicyForMutation(
  supabase: ReturnType<typeof supabaseForUser>,
  id: string
): Promise<PolicyMutationSubject> {
  const { data, error } = await supabase
    .from("organization_policies")
    .select("org_id,is_protected_policy,compiled_config,definition_json")
    .eq("id", id)
    .maybeSingle();

  throwMappedSupabaseError(error);
  if (!data) throw new Error("Policy not found.");
  return data as PolicyMutationSubject;
}

export async function setOrgPolicyActive(input: {
  id: string;
  isActive: boolean;
}): Promise<{ ok: true }> {
  const { token } = await requireAuthAndOrg();
  const supabase = supabaseForUser(token);
  assertPolicyMutable(await loadPolicyForMutation(supabase, input.id), "toggle");

  const { error } = await supabase
    .from("organization_policies")
    .update({ is_active: input.isActive })
    .eq("id", input.id);

  throwMappedSupabaseError(error);

  return { ok: true };
}

export async function updateOrgPolicy(input: {
  id: string;
  definition: PolicyDefinitionInput;
  action?: PolicyAction;
  resourceType?: ResourceType;
  resourceName?: string;
}): Promise<{ ok: true }> {
  const { userId, token, orgRole } = await requireAuthAndOrg();
  const supabase = supabaseForUser(token);
  assertPolicyMutable(await loadPolicyForMutation(supabase, input.id), "edit");

  const definition = prepareDefinition(input.definition);
  const compiledConfig = compilePolicy(definition);
  const definitionJson = buildDefinition(definition);

  const normalizedOrgRole = normalizeRole(orgRole ?? "");
  const isPrivileged = ["owner", "admin"].includes(normalizedOrgRole);

  if (!isPrivileged) {
    const hasOrgRoleDenyCondition = compiledConfig.conditions.some(
      (c: { field: string; operator: string; values: string[] }) =>
        c.field === "org_role" &&
        c.operator === "is_not" &&
        c.values.includes(normalizedOrgRole)
    );

    const hasOrgRoleRestriction = compiledConfig.conditions.some(
      (c: { field: string; operator: string; values: string[] }) =>
        c.field === "org_role" && c.operator === "is"
    );

    const orgRoleAllowed =
      !hasOrgRoleRestriction ||
      compiledConfig.conditions.some(
        (c: { field: string; operator: string; values: string[] }) =>
          c.field === "org_role" &&
          c.operator === "is" &&
          (c.values.includes("*") || c.values.includes(normalizedOrgRole))
      );

    if (hasOrgRoleDenyCondition || !orgRoleAllowed) {
      throw new Error(
        "This policy would deny your access based on your org role. Update the conditions or use an owner/admin account."
      );
    }
  }

  const updatePayload: Record<string, unknown> = {
    definition_json: definitionJson,
    compiled_config: compiledConfig,
    scope: definition.scope || "all",
    effect: definition.effect || "ALLOW",
    created_by_clerk_sub: userId,
  };

  if (input.action) updatePayload.action = input.action;
  if (input.resourceType) updatePayload.resource_type = input.resourceType;
  if (input.resourceName !== undefined)
    updatePayload.resource_name = input.resourceName || "*";

  const { error } = await supabase
    .from("organization_policies")
    .update(updatePayload)
    .eq("id", input.id);

  throwMappedSupabaseError(error);

  return { ok: true };
}

export async function getAvailableResources(): Promise<{
  tables: string[];
  buckets: string[];
  features: typeof FEATURE_RESOURCES;
  integrationFeatures: IntegrationFeatureResource[];
  liveblocksRooms: typeof LIVEBLOCKS_RESOURCES;
  apiResources: typeof API_RESOURCES;
}> {
  const { token } = await requireAuthAndOrg();
  const supabase = supabaseForUser(token);

  // ADAPTED: Exclude lender-portal auth tables instead of pricing-engine tables
  const excludedTables = [
    "organization_policies",
    "organization_policies_column_filters",
    "organization_policy_named_scopes",
    "organization_policy_named_scope_tables",
    "auth_clerk_orgs",
    "auth_clerk_orgs_members",
    "auth_clerk_orgs_themes",
    "auth_clerk_users",
    "schema_migrations",
  ];

  // Query tables and buckets
  const [tablesRes, bucketsRes] = await Promise.all([
    supabase.rpc("get_public_table_names").select(),
    supabase.storage.listBuckets(),
  ]);

  // NOTE: integration_settings table doesn't exist in lender-portal yet
  // Return empty array for now
  const integrationFeatures: IntegrationFeatureResource[] = [];

  return {
    tables:
      (tablesRes.data as Array<{ table_name: string }> | null)
        ?.map((t) => t.table_name)
        .filter((t) => !excludedTables.includes(t))
        .sort() ?? [],
    buckets: bucketsRes.data?.map((b) => b.name).sort() ?? [],
    features: FEATURE_RESOURCES,
    integrationFeatures,
    liveblocksRooms: LIVEBLOCKS_RESOURCES,
    apiResources: API_RESOURCES,
  };
}

export async function getColumnFilters(): Promise<
  Array<{
    table_name: string;
    org_column: string | null;
    user_column: string | null;
    named_scopes: string[];
  }>
> {
  const { token } = await requireAuthAndOrg();
  const supabase = supabaseForUser(token);

  const { data } = await supabase
    .from("organization_policies_column_filters")
    .select("table_name,org_column,user_column,named_scopes")
    .eq("is_excluded", false)
    .order("table_name");

  return (data ?? []) as Array<{
    table_name: string;
    org_column: string | null;
    user_column: string | null;
    named_scopes: string[];
  }>;
}

/** Fetches the named scope registry for display in the policy builder. */
export async function getNamedScopeRegistry(): Promise<NamedScopeRow[]> {
  const { token } = await requireAuthAndOrg();
  const supabase = supabaseForUser(token);

  const { data } = await supabase
    .from("organization_policy_named_scopes")
    .select("name,label,description,uses_precomputed")
    .order("name");

  return (data ?? []) as NamedScopeRow[];
}

export async function deleteOrgPolicy(input: {
  id: string;
  action?: "restore";
}): Promise<{ ok: true }> {
  const { token, userId } = await requireAuthAndOrg();
  const supabase = supabaseForUser(token);
  if (input.action !== "restore") {
    assertPolicyMutable(await loadPolicyForMutation(supabase, input.id), "archive");
  }

  if (input.action === "restore") {
    const { error } = await supabase
      .from("organization_policies")
      .update({ archived_at: null, archived_by: null })
      .eq("id", input.id);
    throwMappedSupabaseError(error);
    return { ok: true };
  }

  // Archive instead of delete
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("organization_policies")
    .update({ archived_at: now, archived_by: userId })
    .eq("id", input.id);

  throwMappedSupabaseError(error);

  return { ok: true };
}

/** Fetches deal role types for the room scope selector. */
export async function getDealRoleTypes(): Promise<DealRoleTypeRow[]> {
  const { token } = await requireAuthAndOrg();
  const supabase = supabaseForUser(token);

  const { data } = await supabase
    .from("deal_role_types")
    .select("id,name,code")
    .eq("is_active", true)
    .order("name");

  return (data ?? []) as DealRoleTypeRow[];
}

/**
 * Returns the list of API resource scopes that are currently enabled for this
 * organization. An "enabled" scope is one backed by an active, non-archived
 * `api_key` policy.
 *
 * Used by the API Keys creation UI to populate the scope picker, and by the
 * route-level auth helper to decide whether to accept API keys.
 */
export async function getActiveApiScopes(): Promise<
  Array<{ resource: string; action: "read" | "write"; label: string }>
> {
  const { token } = await requireAuthAndOrg();
  const supabase = supabaseForUser(token);

  const { data } = await supabase
    .from("organization_policies")
    .select("resource_name, action")
    .eq("resource_type", "api_key")
    .eq("is_active", true)
    .is("archived_at", null);

  if (!data || data.length === 0) return [];

  const labelMap = new Map(API_RESOURCES.map((r) => [r.name, r.label]));

  return (data as Array<{ resource_name: string; action: string }>)
    .filter((row) => row.action === "read" || row.action === "write")
    .map((row) => ({
      resource: row.resource_name,
      action: row.action as "read" | "write",
      label: labelMap.get(row.resource_name) ?? row.resource_name,
    }));
}
