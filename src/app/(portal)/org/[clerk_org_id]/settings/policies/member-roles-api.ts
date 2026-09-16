"use server";

import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/lib/supabase-server";

export type MemberRoleOption = {
  value: string;
  label: string;
  description: string | null;
  isOrgSpecific: boolean;
};

export async function getMemberRolesForPolicies(): Promise<MemberRoleOption[]> {
  const { orgId } = await auth();
  if (!orgId)
    return [
      {
        value: "_all",
        label: "All",
        description: "Matches all member roles",
        isOrgSpecific: false,
      },
    ];

  const supabase = createServiceRoleClient();

  // Get the org's internal ID
  const { data: org } = await supabase
    .from("auth_clerk_orgs")
    .select("id")
    .eq("clerk_org_id", orgId)
    .single();

  const options: MemberRoleOption[] = [
    {
      value: "_all",
      label: "All",
      description: "Matches all member roles",
      isOrgSpecific: false,
    },
  ];

  if (!org) return options;

  // Get unique org roles from memberships for this org
  const { data: memberships } = await supabase
    .from("auth_clerk_orgs_members")
    .select("clerk_org_role")
    .eq("clerk_org_id", org.id);

  const uniqueRoles = new Set(
    memberships?.map((m) => m.clerk_org_role).filter(Boolean) ?? []
  );

  const roleLabels: Record<string, string> = {
    admin: "Admin",
    member: "Member",
    viewer: "Viewer",
  };

  for (const role of uniqueRoles) {
    if (role) {
      options.push({
        value: role,
        label: roleLabels[role] ?? role,
        description: null,
        isOrgSpecific: false,
      });
    }
  }

  return options;
}
