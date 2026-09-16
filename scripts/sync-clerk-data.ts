/**
 * Sync Clerk users, organizations, and memberships into Supabase.
 * Used for preview-branch backfill when webhooks never ran.
 *
 *   npx tsx scripts/sync-clerk-data.ts
 *   npx tsx scripts/sync-clerk-data.ts --clerk-org-id org_2rNqHTbc3gCIKwPSTXYudYB3Log
 */

import { fileURLToPath } from "node:url";
import path from "node:path";
import { createClerkClient } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "../src/lib/supabase-server";
import { resolveClerkProfileSync } from "../src/lib/internal-admin.ts";
import { mapClerkOrgRole } from "../src/lib/clerk-org-sync.ts";

export type SyncClerkDataOptions = {
  clerkOrgId?: string;
};

export type SyncClerkDataResult = {
  clerkOrgId?: string;
  usersUpserted: number;
  orgsUpserted: number;
  membershipsUpserted: number;
};

type ClerkClient = ReturnType<typeof createClerkClient>;
type ServiceClient = ReturnType<typeof createServiceRoleClient>;

function clerkClientFromEnv(): ClerkClient {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Missing CLERK_SECRET_KEY environment variable");
  }
  return createClerkClient({ secretKey });
}

function usernameFromEmail(email: string): string {
  return email.split("@")[0].toLowerCase().replace(/[^a-z0-9._-]/g, "") || "user";
}

async function listAllOrganizations(clerk: ClerkClient) {
  const orgs: Awaited<
    ReturnType<ClerkClient["organizations"]["getOrganizationList"]>
  >["data"] = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const page = await clerk.organizations.getOrganizationList({ limit, offset });
    const rows = page.data ?? [];
    orgs.push(...rows);
    if (rows.length < limit) break;
    offset += limit;
  }

  return orgs;
}

async function listOrganizationMemberships(
  clerk: ClerkClient,
  organizationId: string
) {
  const memberships: Awaited<
    ReturnType<ClerkClient["organizations"]["getOrganizationMembershipList"]>
  >["data"] = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const page = await clerk.organizations.getOrganizationMembershipList({
      organizationId,
      limit,
      offset,
    });
    const rows = page.data ?? [];
    memberships.push(...rows);
    if (rows.length < limit) break;
    offset += limit;
  }

  return memberships;
}

async function upsertClerkUser(
  supabase: ServiceClient,
  input: {
    clerkUserId: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
    publicMetadata?: { role?: string | null } | null;
  }
): Promise<number> {
  const { data: existing } = await supabase
    .from("auth_clerk_users")
    .select("id, personal_role, is_internal_yn")
    .eq("clerk_user_id", input.clerkUserId)
    .maybeSingle();

  const sync = resolveClerkProfileSync({
    clerkUserId: input.clerkUserId,
    email: input.email,
    publicMetadata: input.publicMetadata,
    existingPersonalRole: existing?.personal_role,
    existingIsInternalYn: existing?.is_internal_yn,
  });

  const row = {
    clerk_user_id: input.clerkUserId,
    email: input.email,
    clerk_username: existing
      ? undefined
      : usernameFromEmail(input.email),
    first_name: input.firstName || null,
    last_name: input.lastName || null,
    phone_number: input.phone || null,
    personal_role: sync.personal_role,
    is_internal_yn: sync.is_internal_yn,
    is_active_yn: true,
  };

  if (existing) {
    const { error } = await supabase
      .from("auth_clerk_users")
      .update({
        email: row.email,
        first_name: row.first_name,
        last_name: row.last_name,
        phone_number: row.phone_number,
        personal_role: row.personal_role,
        is_internal_yn: row.is_internal_yn,
        is_active_yn: true,
      })
      .eq("clerk_user_id", input.clerkUserId);
    if (error) throw error;
    return existing.id;
  }

  const { data, error } = await supabase
    .from("auth_clerk_users")
    .upsert(
      {
        clerk_user_id: row.clerk_user_id,
        email: row.email,
        clerk_username: row.clerk_username,
        first_name: row.first_name,
        last_name: row.last_name,
        phone_number: row.phone_number,
        personal_role: row.personal_role,
        is_internal_yn: row.is_internal_yn,
        is_active_yn: true,
      },
      { onConflict: "clerk_user_id" }
    )
    .select("id")
    .maybeSingle();

  if (error) throw error;
  if (data?.id != null) return data.id;

  const { data: lookup, error: lookupError } = await supabase
    .from("auth_clerk_users")
    .select("id")
    .eq("clerk_user_id", input.clerkUserId)
    .maybeSingle();
  if (lookupError || lookup?.id == null) {
    throw lookupError ?? new Error(`Failed to upsert user ${input.clerkUserId}`);
  }
  return lookup.id;
}

async function upsertClerkUserFromId(
  clerk: ClerkClient,
  supabase: ServiceClient,
  clerkUserId: string
): Promise<number> {
  const user = await clerk.users.getUser(clerkUserId);
  const email = user.emailAddresses?.[0]?.emailAddress;
  if (!email) {
    throw new Error(`Clerk user ${clerkUserId} has no email`);
  }
  return upsertClerkUser(supabase, {
    clerkUserId: user.id,
    email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phoneNumbers?.[0]?.phoneNumber || null,
    publicMetadata: user.publicMetadata as { role?: string | null },
  });
}

async function upsertOrganization(
  supabase: ServiceClient,
  org: {
    id: string;
    name: string;
    slug: string | null;
    createdBy?: string | null;
  },
  createdByClerkUserId: string
): Promise<number> {
  const { data, error } = await supabase
    .from("auth_clerk_orgs")
    .upsert(
      {
        clerk_org_id: org.id,
        clerk_org_name: org.name,
        clerk_org_slug: org.slug || org.id,
        created_by_clerk_user_id: createdByClerkUserId,
      },
      { onConflict: "clerk_org_id" }
    )
    .select("id")
    .maybeSingle();

  if (error) throw error;
  if (data?.id != null) return data.id;

  const { data: lookup, error: lookupError } = await supabase
    .from("auth_clerk_orgs")
    .select("id")
    .eq("clerk_org_id", org.id)
    .maybeSingle();
  if (lookupError || lookup?.id == null) {
    throw lookupError ?? new Error(`Failed to upsert org ${org.id}`);
  }
  return lookup.id;
}

async function upsertMembership(
  supabase: ServiceClient,
  input: {
    userPk: number;
    orgPk: number;
    role: string | null | undefined;
  }
): Promise<void> {
  const orgRole = mapClerkOrgRole(input.role);

  const { data: existing, error: lookupError } = await supabase
    .from("auth_clerk_orgs_members")
    .select("id, clerk_org_role")
    .eq("auth_clerk_users_id", input.userPk)
    .eq("clerk_org_id", input.orgPk)
    .maybeSingle();

  if (lookupError) throw lookupError;

  if (existing) {
    const { error } = await supabase
      .from("auth_clerk_orgs_members")
      .update({ clerk_org_role: orgRole })
      .eq("id", existing.id);
    if (error) throw error;
    return;
  }

  const { error } = await supabase.from("auth_clerk_orgs_members").insert({
    auth_clerk_users_id: input.userPk,
    clerk_org_id: input.orgPk,
    clerk_org_role: orgRole,
  });
  if (error) throw error;
}

export async function syncExistingClerkData(
  options: SyncClerkDataOptions = {}
): Promise<SyncClerkDataResult> {
  const clerk = clerkClientFromEnv();
  const supabase = createServiceRoleClient();
  const result: SyncClerkDataResult = {
    clerkOrgId: options.clerkOrgId,
    usersUpserted: 0,
    orgsUpserted: 0,
    membershipsUpserted: 0,
  };

  console.log(
    options.clerkOrgId
      ? `Starting Clerk sync for ${options.clerkOrgId}`
      : "Starting full Clerk sync"
  );

  const orgs = options.clerkOrgId
    ? [
        await clerk.organizations.getOrganization({
          organizationId: options.clerkOrgId,
        }),
      ]
    : await listAllOrganizations(clerk);

  if (!options.clerkOrgId) {
    const usersPage = await clerk.users.getUserList({ limit: 100 });
    const users = usersPage.data ?? [];
    for (const user of users) {
      const email = user.emailAddresses?.[0]?.emailAddress;
      if (!email) continue;
      await upsertClerkUser(supabase, {
        clerkUserId: user.id,
        email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phoneNumbers?.[0]?.phoneNumber || null,
        publicMetadata: user.publicMetadata as { role?: string | null },
      });
      result.usersUpserted += 1;
    }
  }

  for (const org of orgs) {
    const memberships = await listOrganizationMemberships(clerk, org.id);
    const userPkByClerkId = new Map<string, number>();

    for (const membership of memberships) {
      const clerkUserId = membership.publicUserData?.userId;
      if (!clerkUserId) continue;
      const userPk = await upsertClerkUserFromId(clerk, supabase, clerkUserId);
      userPkByClerkId.set(clerkUserId, userPk);
      result.usersUpserted += 1;
    }

    let createdBy = org.createdBy || memberships[0]?.publicUserData?.userId;
    if (!createdBy) {
      throw new Error(`Organization ${org.id} has no createdBy user to satisfy FK`);
    }
    if (!userPkByClerkId.has(createdBy)) {
      const createdByPk = await upsertClerkUserFromId(clerk, supabase, createdBy);
      userPkByClerkId.set(createdBy, createdByPk);
      result.usersUpserted += 1;
    }

    const orgPk = await upsertOrganization(supabase, org, createdBy);
    result.orgsUpserted += 1;

    for (const membership of memberships) {
      const clerkUserId = membership.publicUserData?.userId;
      if (!clerkUserId) continue;
      const userPk = userPkByClerkId.get(clerkUserId);
      if (userPk == null) continue;
      await upsertMembership(supabase, {
        userPk,
        orgPk,
        role: membership.role,
      });
      result.membershipsUpserted += 1;
    }

    console.log(
      `Synced ${org.name} (${org.id}): ${memberships.length} memberships`
    );
  }

  console.log("Clerk sync completed", result);
  return result;
}

function parseCliOrgId(argv: string[]): string | undefined {
  const flagIndex = argv.findIndex(
    (arg) => arg === "--clerk-org-id" || arg === "--org"
  );
  if (flagIndex >= 0) return argv[flagIndex + 1];
  const prefixed = argv.find((arg) => arg.startsWith("--clerk-org-id="));
  return prefixed?.split("=")[1];
}

function isDirectRun(): boolean {
  const entry = process.argv[1];
  if (!entry) return false;
  return fileURLToPath(import.meta.url) === path.resolve(entry);
}

if (isDirectRun()) {
  syncExistingClerkData({ clerkOrgId: parseCliOrgId(process.argv.slice(2)) })
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
