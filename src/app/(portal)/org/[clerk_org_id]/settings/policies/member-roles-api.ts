"use server";

import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { getClerkSupabaseToken } from "@/lib/clerk-supabase-token";
import { createServiceRoleClient } from "@/lib/supabase-server";
import { humanizeRole } from "@/lib/policies/policy-mutation";

export type MemberRoleOption = {
  value: string;
  label: string;
  description: string | null;
  isOrgSpecific: boolean;
};

const ALL_MEMBER_ROLES_OPTION: MemberRoleOption = {
  value: "_all",
  label: "All",
  description: "Matches all member roles",
  isOrgSpecific: false,
};

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  member: "Member",
  viewer: "Viewer",
};

const ORG_ROLE_VALUES = ["admin", "member", "viewer"];

type ServiceRoleClient = ReturnType<typeof createServiceRoleClient>;

async function resolveOrgForRoleOptions(): Promise<{
  orgPk: number;
  supabase: ServiceRoleClient;
} | null> {
  const { userId, orgId, getToken } = await auth();
  if (!userId || !orgId) return null;

  const token = await getClerkSupabaseToken((opts) => getToken(opts));
  if (!token) return null;

  // Resolve the org with a user-scoped client so RLS ("Users can view their
  // own organizations") enforces membership before we trust the org.
  const userClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false },
    }
  );

  const { data: org } = await userClient
    .from("auth_clerk_orgs")
    .select("id")
    .eq("clerk_org_id", orgId)
    .maybeSingle();

  if (!org) return null;

  // Membership verified above via RLS; service role only lists the org's roles.
  return { orgPk: org.id, supabase: createServiceRoleClient() };
}

export async function getMemberRolesForPolicies(): Promise<MemberRoleOption[]> {
  const options: MemberRoleOption[] = [{ ...ALL_MEMBER_ROLES_OPTION }];
  const resolved = await resolveOrgForRoleOptions();
  if (!resolved) return options;

  const { data: memberships } = await resolved.supabase
    .from("auth_clerk_orgs_members")
    .select("clerk_member_role")
    .eq("clerk_org_id", resolved.orgPk);

  const uniqueRoles = new Set(
    (memberships ?? [])
      .map((membership) => membership.clerk_member_role)
      .filter((role): role is string => Boolean(role))
  );

  for (const role of uniqueRoles) {
    options.push({
      value: role,
      label: humanizeRole(role),
      description: null,
      isOrgSpecific: false,
    });
  }

  return options;
}

export async function getOrgRolesForPolicies(): Promise<MemberRoleOption[]> {
  const options: MemberRoleOption[] = ORG_ROLE_VALUES.map((role) => ({
    value: role,
    label: ROLE_LABELS[role] ?? humanizeRole(role),
    description: null,
    isOrgSpecific: false,
  }));

  const resolved = await resolveOrgForRoleOptions();
  if (!resolved) return options;

  const { data: memberships } = await resolved.supabase
    .from("auth_clerk_orgs_members")
    .select("clerk_org_role")
    .eq("clerk_org_id", resolved.orgPk);

  const extras = new Set(
    (memberships ?? [])
      .map((membership) => membership.clerk_org_role as string | null)
      .filter(
        (role): role is string =>
          Boolean(role) && !ORG_ROLE_VALUES.includes(role as string)
      )
  );

  for (const role of [...extras].sort()) {
    options.push({
      value: role,
      label: ROLE_LABELS[role] ?? humanizeRole(role),
      description: null,
      isOrgSpecific: false,
    });
  }

  return options;
}
