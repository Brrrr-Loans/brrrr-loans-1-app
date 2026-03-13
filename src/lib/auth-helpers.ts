import { auth } from "@clerk/nextjs/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  createServiceRoleClient,
  getSupabaseClient,
} from "@/lib/supabase-server";
import type { Database } from "@/types/supabase";

/**
 * Get RLS-aware Supabase client for authenticated user
 * Use this for all user-scoped queries where RLS policies handle filtering
 * @throws Error if user is not authenticated
 */
export async function getAuthenticatedSupabase(): Promise<
  SupabaseClient<Database>
> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  return await getSupabaseClient(); // Has JWT with user context, RLS enforced
}

/**
 * Get current user's data using Service Role
 * Used during transition period for explicit filtering
 * Prefer getAuthenticatedSupabase() with RLS where possible
 */
export async function getCurrentUserData() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return null;

  const supabase = createServiceRoleClient();
  const { data: user } = await supabase
    .from("auth_clerk_users")
    .select(
      `
      id,
      clerk_user_id,
      personal_role,
      is_internal_yn,
      auth_clerk_orgs_members(
        clerk_org_id,
        clerk_org_role,
        auth_clerk_orgs:clerk_org_id(id, clerk_org_name)
      )
    `
    )
    .eq("clerk_user_id", clerkUserId)
    .single();

  return user;
}

/**
 * Get user's investment organizations (excludes viewer role)
 * @param authClerkUsersId - Internal user ID from auth_clerk_users table
 * @returns Array of organization IDs where user has investment interest
 */
export async function getUserInvestmentOrgs(
  authClerkUsersId: number
): Promise<number[]> {
  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from("auth_clerk_orgs_members")
    .select("clerk_org_id")
    .eq("auth_clerk_users_id", authClerkUsersId)
    .in("clerk_org_role", ["admin", "member"]); // Exclude viewer

  return (data || [])
    .map((m) => m.clerk_org_id)
    .filter((id): id is number => id !== null);
}

/**
 * Get Service Role client for admin operations
 * Only call after verifying user is admin
 * @throws Error if user is not authenticated or not an admin
 */
export async function getAdminSupabase(): Promise<SupabaseClient<Database>> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const userData = await getCurrentUserData();
  if (!userData || userData.personal_role !== "admin") {
    throw new Error("Forbidden: Admin access required");
  }

  return createServiceRoleClient();
}

/**
 * Verify user has admin role
 * @throws Error if user is not authenticated or not an admin
 * @returns User data if user is admin
 */
export async function requireAdmin() {
  const userData = await getCurrentUserData();
  if (!userData || userData.personal_role !== "admin") {
    throw new Error("Forbidden: Admin access required");
  }
  return userData;
}
