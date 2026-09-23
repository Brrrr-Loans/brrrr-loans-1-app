"use server";

import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { getClerkSupabaseToken } from "@/lib/clerk-supabase-token";
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
  const { userId, orgId, getToken } = await auth();
  const options: MemberRoleOption[] = [{ ...ALL_MEMBER_ROLES_OPTION }];
  if (!userId || !orgId) return options;

  const token = await getClerkSupabaseToken((opts) => getToken(opts));
  if (!token) return options;

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

  if (!org) return options;

  // Membership verified above via RLS; service role only lists the org's roles.
  const supabase = createServiceRoleClient();
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
