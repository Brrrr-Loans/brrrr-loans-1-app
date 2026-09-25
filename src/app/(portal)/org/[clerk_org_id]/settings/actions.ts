"use server";

import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { getClerkSupabaseToken } from "@/lib/clerk-supabase-token";
import {
  resolveAuthClerkOrgPk,
  throwMappedSupabaseError,
} from "@/lib/org-lookup";

export type DealRoleTypeRow = {
  id: number;
  name: string;
  description?: string | null;
};

export type DocumentCategoryRow = {
  id: number;
  name: string;
  description?: string | null;
  // optional: if you have a group column, map it here
  group?: string | null;
};

export type PermissionRow = {
  deal_role_types_id: number;
  document_categories_id: number;
  can_view: boolean;
  can_insert: boolean;
  can_upload: boolean;
  can_delete: boolean;
};

export type RbacMatrixPayload = {
  orgPk: number;
  roles: DealRoleTypeRow[];
  categories: DocumentCategoryRow[];
  permissions: PermissionRow[];
};

function supabaseForUser(token: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, anon, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false },
  });
}

async function requireAuthAndOrg() {
  const { userId, orgId, getToken } = await auth();
  if (!userId) throw new Error("Not authenticated");
  if (!orgId) throw new Error("No active organization selected");
  const token = await getClerkSupabaseToken((options) => getToken(options));
  if (!token) throw new Error("Missing Clerk Supabase token");
  return { orgId, token };
}

async function getOrgPk(supabase: ReturnType<typeof supabaseForUser>, orgId: string) {
  const { data, error } = await supabase
    .from("auth_clerk_orgs")
    .select("id")
    .eq("clerk_org_id", orgId)
    .maybeSingle();

  return resolveAuthClerkOrgPk({ clerkOrgId: orgId, data, error });
}

// Loader
export async function getDocumentRbacMatrix(): Promise<RbacMatrixPayload> {
  const { orgId, token } = await requireAuthAndOrg();
  const supabase = supabaseForUser(token);

  const orgPk = await getOrgPk(supabase, orgId);

  // Roles (columns)
  const rolesRes = await supabase
    .from("deal_role_types")
    .select("id,name,description")
    .order("name", { ascending: true });

  throwMappedSupabaseError(rolesRes.error);

  // Categories (rows)
  // If your table has a group column (ex: group_name), add it to select.
  const catsRes = await supabase
    .from("document_categories")
    .select("id,name,description")
    .order("name", { ascending: true });

  throwMappedSupabaseError(catsRes.error);

  // Permissions for org
  const permsRes = await supabase
    .from("document_access_permissions")
    .select("deal_role_types_id,document_categories_id,can_view,can_insert,can_upload,can_delete")
    .eq("clerk_org_id", orgPk);

  throwMappedSupabaseError(permsRes.error);

  return {
    orgPk,
    roles: (rolesRes.data ?? []) as DealRoleTypeRow[],
    categories: (catsRes.data ?? []) as DocumentCategoryRow[],
    permissions: (permsRes.data ?? []) as PermissionRow[],
  };
}

// Save (bulk upsert)
export async function saveDocumentRbacMatrix(input: {
  orgPk: number; // from loader
  rows: PermissionRow[]; // deal_role_types_id x document_categories_id
}): Promise<{ ok: true; updated: number }> {
  const { orgId, token } = await requireAuthAndOrg();
  const supabase = supabaseForUser(token);

  const actualOrgPk = await getOrgPk(supabase, orgId);
  if (actualOrgPk !== input.orgPk) throw new Error("Organization mismatch.");

  const upsertRows = input.rows.map(r => ({
    clerk_org_id: actualOrgPk,
    deal_role_types_id: r.deal_role_types_id,
    document_categories_id: r.document_categories_id,
    can_view: r.can_view,
    can_insert: r.can_insert,
    can_upload: r.can_upload,
    can_delete: r.can_delete,
  }));

  const { error } = await supabase
    .from("document_access_permissions")
    .upsert(upsertRows, {
      onConflict: "clerk_org_id,deal_role_types_id,document_categories_id",
    });

  throwMappedSupabaseError(error);

  return { ok: true, updated: upsertRows.length };
}

// Optional: reset to template (if you created reset_org_document_permissions RPC)
export async function resetOrgDocumentPermissions(orgPk: number): Promise<{ ok: true }> {
  const { orgId, token } = await requireAuthAndOrg();
  const supabase = supabaseForUser(token);

  const actualOrgPk = await getOrgPk(supabase, orgId);
  if (actualOrgPk !== orgPk) throw new Error("Organization mismatch.");

  const { error } = await supabase.rpc("reset_org_document_permissions", { p_org_id: actualOrgPk });
  throwMappedSupabaseError(error);

  return { ok: true };
}
