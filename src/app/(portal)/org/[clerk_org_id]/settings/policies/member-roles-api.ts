"use server";

import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/lib/supabase-server";

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

export async function getMemberRolesForPolicies(): Promise<MemberRoleOption[]> {
  const { orgId } = await auth();
  const options: MemberRoleOption[] = [{ ...ALL_MEMBER_ROLES_OPTION }];
  if (!orgId) return options;

  const supabase = createServiceRoleClient();

  // Service role + maybeSingle: missing org returns the All option, not a coerce error
  const { data: org } = await supabase
    .from("auth_clerk_orgs")
    .select("id")
    .eq("clerk_org_id", orgId)
    .maybeSingle();

  if (!org) return options;

  const { data: memberships } = await supabase
    .from("auth_clerk_orgs_members")
    .select("clerk_org_role")
    .eq("clerk_org_id", org.id);

  const uniqueRoles = new Set(
    (memberships ?? [])
      .map((membership) => membership.clerk_org_role)
      .filter((role): role is string => Boolean(role))
  );

  for (const role of uniqueRoles) {
    options.push({
      value: role,
      label: ROLE_LABELS[role] ?? role,
      description: null,
      isOrgSpecific: false,
    });
  }

  return options;
}
