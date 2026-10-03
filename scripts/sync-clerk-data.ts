/**
 * Sync Clerk users, organizations, and memberships into Supabase.
 * Used for preview-branch backfill when webhooks never ran.
 * Additive only: rows that no longer exist in Clerk are left in place.
 *
 *   npx tsx scripts/sync-clerk-data.ts
 *   npx tsx scripts/sync-clerk-data.ts --clerk-org-id org_2rNqHTbc3gCIKwPSTXYudYB3Log
 */

import { fileURLToPath } from "node:url";
import path from "node:path";
import { createClerkClient } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "../src/lib/supabase-server";
import { resolveClerkProfileSync } from "../src/lib/internal-admin.ts";
import {
  clerkUsernameCandidates,
  clerkUserPrivilegeWrite,
  mapClerkOrgRole,
  type ClerkSyncProfile,
} from "../src/lib/clerk-org-sync.ts";

export type SyncClerkDataOptions = {
  clerkOrgId?: string;
  /** Org-admin callers use identity so they cannot rewrite portal privileges. */
  profile?: ClerkSyncProfile;
};

export type SyncClerkDataResult = {
  mode: "backfill";
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

async function allocateClerkUsername(
  supabase: ServiceClient,
  email: string,
  clerkUserId: string
): Promise<string> {
  const candidates = clerkUsernameCandidates(email, clerkUserId);
  for (const candidate of candidates) {
    const { data, error } = await supabase
      .from("auth_clerk_users")
      .select("clerk_user_id")
      .eq("clerk_username", candidate)
      .maybeSingle();
    if (error) throw error;
    if (!data || data.clerk_user_id === clerkUserId) return candidate;
  }
  const base = candidates[0] ?? "user";
  const stamp = clerkUserId.toLowerCase().replace(/[^a-z0-9]/g, "").slice(-16);
  return `${base}-${stamp}`.slice(0, 64);
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

async function listAllUsers(clerk: ClerkClient) {
  const users: Awaited<
    ReturnType<ClerkClient["users"]["getUserList"]>
  >["data"] = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const page = await clerk.users.getUserList({ limit, offset });
    const rows = page.data ?? [];
    users.push(...rows);
    if (rows.length < limit) break;
    offset += limit;
  }

  return users;
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
    profile?: ClerkSyncProfile;
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
  const privileges = clerkUserPrivilegeWrite({
    profile: input.profile ?? "full",
    existing: Boolean(existing),
    personalRole: sync.personal_role,
    isInternalYn: sync.is_internal_yn,
  });

  const row = {
    clerk_user_id: input.clerkUserId,
    email: input.email,
    clerk_username: existing
      ? undefined
      : await allocateClerkUsername(supabase, input.email, input.clerkUserId),
    first_name: input.firstName || null,
    last_name: input.lastName || null,
    phone_number: input.phone || null,
    ...privileges,
  };

  if (!existing && (input.profile ?? "full") === "identity") {
    const inserted = await supabase
      .from("auth_clerk_users")
      .insert({
        clerk_user_id: row.clerk_user_id,
        email: row.email,
        clerk_username: row.clerk_username,
        first_name: row.first_name,
        last_name: row.last_name,
        phone_number: row.phone_number,
        ...privileges,
      })
      .select("id")
      .maybeSingle();
    if (!inserted.error && inserted.data?.id != null) return inserted.data.id;

    const code = (inserted.error as { code?: string } | null)?.code;
    const message = inserted.error?.message ?? "";
    const raced =
      code === "23505" || message.toLowerCase().includes("duplicate");
    if (!raced) {
      if (inserted.error) throw inserted.error;
      throw new Error(`Failed to insert user ${input.clerkUserId}`);
    }

    const { error: racedUpdateError } = await supabase
      .from("auth_clerk_users")
      .update({
        email: row.email,
        first_name: row.first_name,
        last_name: row.last_name,
        phone_number: row.phone_number,
      })
      .eq("clerk_user_id", input.clerkUserId);
    if (racedUpdateError) throw racedUpdateError;

    const { data: racedLookup, error: racedLookupError } = await supabase
      .from("auth_clerk_users")
      .select("id")
      .eq("clerk_user_id", input.clerkUserId)
      .maybeSingle();
    if (racedLookupError || racedLookup?.id == null) {
      throw racedLookupError ?? new Error(`Failed to upsert user ${input.clerkUserId}`);
    }
    return racedLookup.id;
  }

  if (existing) {
    const { error } = await supabase
      .from("auth_clerk_users")
      .update({
        email: row.email,
        first_name: row.first_name,
        last_name: row.last_name,
        phone_number: row.phone_number,
        ...privileges,
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
        ...privileges,
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
  clerkUserId: string,
  profile: ClerkSyncProfile
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
    profile,
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
  const profile = options.profile ?? "full";
  const result: SyncClerkDataResult = {
    mode: "backfill",
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
    const users = await listAllUsers(clerk);
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
        profile,
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
      const userPk = await upsertClerkUserFromId(
        clerk,
        supabase,
        clerkUserId,
        profile
      );
      userPkByClerkId.set(clerkUserId, userPk);
      result.usersUpserted += 1;
    }

    let createdBy = org.createdBy || undefined;
    if (createdBy && !userPkByClerkId.has(createdBy)) {
      try {
        const createdByPk = await upsertClerkUserFromId(
          clerk,
          supabase,
          createdBy,
          profile
        );
        userPkByClerkId.set(createdBy, createdByPk);
        result.usersUpserted += 1;
      } catch (error) {
        console.warn(
          `Org ${org.id} createdBy ${createdBy} is missing or has no email; using a member instead`,
          error
        );
        createdBy = undefined;
      }
    }
    if (!createdBy) {
      createdBy = userPkByClerkId.keys().next().value;
    }
    if (!createdBy) {
      const message = `Organization ${org.id} has no createdBy user to satisfy FK`;
      if (options.clerkOrgId) throw new Error(message);
      console.warn(`Skipping org ${org.name} (${org.id}): ${message}`);
      continue;
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
