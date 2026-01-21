-- supabase/migrations/20260120100000_unified_document_rbac.sql
-- Unified, org-scoped document RBAC + canonical can_access_document() + full junction-table RLS
--
-- Notes:
-- - document_files INSERT/UPDATE remain INTERNAL-ADMIN ONLY by design (use an RPC/server-action to create docs + links atomically)
-- - Junction-table INSERT policies are written to avoid the "first-link chicken-and-egg" problem by authorizing using NEW row fields
-- - Org-admin bypass in can_access_deal_document() is gated by deal↔active-org validation (prevents cross-org leakage)

BEGIN;

--------------------------------------------------------------------------------
-- SECTION 0: Ensure RLS enabled on all relevant tables (explicit, no assumptions)
--------------------------------------------------------------------------------

ALTER TABLE public.document_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_files_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_files_borrowers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_files_guarantors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_files_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_files_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_files_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_files_clerk_orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_files_clerk_users ENABLE ROW LEVEL SECURITY;

--------------------------------------------------------------------------------
-- SECTION 0.5: Create Storage bucket 'documents' (idempotent, schema-robust)
--------------------------------------------------------------------------------

DO $$
DECLARE
  v_cols text[] := ARRAY['id','name'];
  v_vals text[] := ARRAY[quote_literal('documents'), quote_literal('documents')];
  v_dt text;
  v_is_nullable text;
  v_col_default text;
  v_stmt text;
BEGIN
  -- If the bucket already exists, do nothing
  IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'documents') THEN
    RETURN;
  END IF;

  -- If storage schema isn't installed/enabled, fail loudly
  IF to_regclass('storage.buckets') IS NULL THEN
    RAISE EXCEPTION 'storage.buckets does not exist (is Storage enabled in this project?)';
  END IF;

  -- Some versions have a "type" column for bucket types (FILES/ANALYTICS/VECTOR)
  -- Dynamically get the first enum label to avoid hardcoding values that may not exist
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='storage' AND table_name='buckets' AND column_name='type'
  ) THEN
    SELECT c.column_default, c.is_nullable, c.udt_name
      INTO v_col_default, v_is_nullable, v_dt
    FROM information_schema.columns c
    WHERE c.table_schema='storage' AND c.table_name='buckets' AND c.column_name='type';

    -- Only set it if required and no default exists
    IF v_col_default IS NULL AND v_is_nullable = 'NO' THEN
      v_cols := array_append(v_cols, 'type');
      -- v_dt holds the enum type name (udt_name); get first valid enum label
      v_vals := array_append(v_vals, quote_literal(
        (
          SELECT e.enumlabel
          FROM pg_type t
          JOIN pg_enum e ON e.enumtypid = t.oid
          WHERE t.typname = v_dt
          ORDER BY e.enumsortorder
          LIMIT 1
        )
      ));
    END IF;
  END IF;

  -- Public/private flag column has differed across versions
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='storage' AND table_name='buckets' AND column_name='public'
  ) THEN
    v_cols := array_append(v_cols, 'public');
    v_vals := array_append(v_vals, 'false');
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='storage' AND table_name='buckets' AND column_name='is_public'
  ) THEN
    v_cols := array_append(v_cols, 'is_public');
    v_vals := array_append(v_vals, 'false');
  END IF;

  -- Optional: file_size_limit / max file size (type varies across versions)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='storage' AND table_name='buckets' AND column_name='file_size_limit'
  ) THEN
    SELECT c.data_type INTO v_dt
    FROM information_schema.columns c
    WHERE c.table_schema='storage' AND c.table_name='buckets' AND c.column_name='file_size_limit';

    v_cols := array_append(v_cols, 'file_size_limit');
    IF v_dt IN ('bigint','integer','numeric') THEN
      v_vals := array_append(v_vals, '52428800');          -- 50 MiB in bytes
    ELSE
      v_vals := array_append(v_vals, quote_literal('50MiB'));
    END IF;
  END IF;

  -- Optional: allowed MIME types (type varies: text[], jsonb, etc.)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='storage' AND table_name='buckets' AND column_name='allowed_mime_types'
  ) THEN
    SELECT c.data_type INTO v_dt
    FROM information_schema.columns c
    WHERE c.table_schema='storage' AND c.table_name='buckets' AND c.column_name='allowed_mime_types';

    v_cols := array_append(v_cols, 'allowed_mime_types');
    IF v_dt = 'ARRAY' OR v_dt = 'text[]' THEN
      v_vals := array_append(v_vals, 'ARRAY[''application/pdf'',''image/*'',''text/*'',''application/zip'']::text[]');
    ELSIF v_dt = 'jsonb' THEN
      v_vals := array_append(v_vals, '''["application/pdf","image/*","text/*","application/zip"]''::jsonb');
    ELSE
      -- fall back to NULL rather than failing migration
      v_vals := array_append(v_vals, 'NULL');
    END IF;
  END IF;

  v_stmt := format(
    'insert into storage.buckets (%s) values (%s) on conflict (id) do nothing',
    array_to_string(v_cols, ','),
    array_to_string(v_vals, ',')
  );

  EXECUTE v_stmt;
END $$;

--------------------------------------------------------------------------------
-- SECTION 1: ORG-SCOPE document_access_permissions + RLS + template lockdown + org seeding
--------------------------------------------------------------------------------

-- 1A) Preserve old table as a baseline template (safe rename with guard)
DO $$
BEGIN
  -- If both exist, stop. That state is ambiguous.
  IF to_regclass('public.document_access_permissions') IS NOT NULL
     AND to_regclass('public.document_access_permissions_global') IS NOT NULL THEN
    RAISE EXCEPTION 'Both document_access_permissions and document_access_permissions_global exist. Manual intervention required.';
  END IF;

  -- First run: rename old table + old sequence + old constraints
  IF to_regclass('public.document_access_permissions') IS NOT NULL
     AND to_regclass('public.document_access_permissions_global') IS NULL THEN

    ALTER TABLE public.document_access_permissions
      RENAME TO document_access_permissions_global;

    -- Only rename the old sequence if it exists at the old name
    IF to_regclass('public.document_access_permissions_id_seq') IS NOT NULL THEN
      ALTER SEQUENCE public.document_access_permissions_id_seq
        RENAME TO document_access_permissions_global_id_seq;
    END IF;
  END IF;

  -- Ensure constraint is renamed (handles partial migration state)
  IF to_regclass('public.document_access_permissions_global') IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'document_access_permissions_unique'
        AND conrelid = 'public.document_access_permissions_global'::regclass
    ) THEN
      ALTER TABLE public.document_access_permissions_global
        RENAME CONSTRAINT document_access_permissions_unique TO document_access_permissions_global_unique;
    END IF;
  END IF;
END $$;

-- 1B) Create new org-scoped table (strict - fail if already exists)
CREATE TABLE public.document_access_permissions (
  id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  clerk_org_id bigint NOT NULL REFERENCES public.auth_clerk_orgs(id) ON DELETE CASCADE,
  deal_role_types_id bigint NOT NULL REFERENCES public.deal_role_types(id) ON DELETE CASCADE,
  document_categories_id bigint NOT NULL REFERENCES public.document_categories(id) ON DELETE CASCADE,
  can_view boolean NOT NULL DEFAULT false,
  can_insert boolean NOT NULL DEFAULT false,
  can_upload boolean NOT NULL DEFAULT false,
  can_delete boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  -- Audit fields for in-app RBAC management
  updated_by_user_id bigint REFERENCES public.auth_clerk_users(id) ON DELETE SET NULL,
  updated_by_clerk_sub text,
  CONSTRAINT document_access_permissions_unique
    UNIQUE (clerk_org_id, deal_role_types_id, document_categories_id)
);

COMMENT ON TABLE public.document_access_permissions IS
  'Org-scoped permission matrix. Each org has its own copy, seeded from document_access_permissions_global template.';

-- Indexes for RLS/runtime checks + UI
CREATE INDEX IF NOT EXISTS idx_doc_access_perm_lookup
  ON public.document_access_permissions (clerk_org_id, deal_role_types_id, document_categories_id);

CREATE INDEX IF NOT EXISTS idx_doc_access_perm_role
  ON public.document_access_permissions (clerk_org_id, deal_role_types_id);

CREATE INDEX IF NOT EXISTS idx_doc_access_perm_category
  ON public.document_access_permissions (clerk_org_id, document_categories_id);

-- 1C) Seed baseline: copy the old global matrix to every org (guarded for greenfield)
DO $$
BEGIN
  IF to_regclass('public.document_access_permissions_global') IS NOT NULL THEN
    INSERT INTO public.document_access_permissions
      (clerk_org_id, deal_role_types_id, document_categories_id, can_view, can_insert, can_upload, can_delete, created_at)
    SELECT
      o.id,
      g.deal_role_types_id,
      g.document_categories_id,
      g.can_view,
      g.can_insert,
      g.can_upload,
      g.can_delete,
      g.created_at
    FROM public.auth_clerk_orgs o
    CROSS JOIN public.document_access_permissions_global g
    ON CONFLICT (clerk_org_id, deal_role_types_id, document_categories_id) DO NOTHING;
  END IF;
END $$;

-- 1D) Grants (NO anon) - dynamic sequence resolution to handle different naming
REVOKE ALL ON TABLE public.document_access_permissions FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.document_access_permissions TO authenticated;
GRANT ALL ON TABLE public.document_access_permissions TO service_role;

DO $$
DECLARE
  seq regclass;
BEGIN
  SELECT to_regclass(pg_get_serial_sequence('public.document_access_permissions', 'id')) INTO seq;

  IF seq IS NOT NULL THEN
    EXECUTE format('REVOKE ALL ON SEQUENCE %s FROM anon', seq);
    EXECUTE format('GRANT USAGE, SELECT ON SEQUENCE %s TO authenticated', seq);
    EXECUTE format('GRANT ALL ON SEQUENCE %s TO service_role', seq);
  END IF;
END $$;

-- 1E) RLS on new org-scoped permissions table
ALTER TABLE public.document_access_permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "document_access_permissions_admin_all" ON public.document_access_permissions;
DROP POLICY IF EXISTS "document_access_permissions_select_authenticated" ON public.document_access_permissions;
DROP POLICY IF EXISTS "Org admins view document_access_permissions" ON public.document_access_permissions;
DROP POLICY IF EXISTS "document_access_permissions_internal_admin_all" ON public.document_access_permissions;
DROP POLICY IF EXISTS "document_access_permissions_org_admin_manage" ON public.document_access_permissions;
DROP POLICY IF EXISTS dap_internal_admin_all ON public.document_access_permissions;
DROP POLICY IF EXISTS dap_org_admin_manage ON public.document_access_permissions;

CREATE POLICY dap_internal_admin_all
ON public.document_access_permissions
FOR ALL TO authenticated
USING (public.is_internal_admin())
WITH CHECK (public.is_internal_admin());

CREATE POLICY dap_org_admin_manage
ON public.document_access_permissions
FOR ALL TO authenticated
USING (public.is_org_admin(clerk_org_id))
WITH CHECK (public.is_org_admin(clerk_org_id));

-- 1F) Lock down the template table so it cannot be read/edited by normal users (guarded)
DO $$
BEGIN
  IF to_regclass('public.document_access_permissions_global') IS NOT NULL THEN
    ALTER TABLE public.document_access_permissions_global ENABLE ROW LEVEL SECURITY;

    -- Revoke all privileges for anon; restrict authenticated to SELECT only (RLS still gates it)
    REVOKE ALL ON TABLE public.document_access_permissions_global FROM anon;
    REVOKE ALL ON TABLE public.document_access_permissions_global FROM authenticated;
    GRANT SELECT ON TABLE public.document_access_permissions_global TO authenticated;
    GRANT ALL ON TABLE public.document_access_permissions_global TO service_role;

    -- Remove any overly-permissive policies that may exist on the template table
    DROP POLICY IF EXISTS "document_access_permissions_select_authenticated" ON public.document_access_permissions_global;
    DROP POLICY IF EXISTS "document_access_permissions_admin_all" ON public.document_access_permissions_global;
    DROP POLICY IF EXISTS "Org admins view document_access_permissions" ON public.document_access_permissions_global;
    DROP POLICY IF EXISTS dap_global_internal_admin_read ON public.document_access_permissions_global;

    CREATE POLICY dap_global_internal_admin_read
    ON public.document_access_permissions_global
    FOR SELECT TO authenticated
    USING (public.is_internal_admin());
  END IF;
END $$;

-- 1G) updated_at + audit fields trigger for org-scoped permissions table (namespaced to avoid conflicts)
CREATE OR REPLACE FUNCTION public.tg_set_updated_at_document_access_permissions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by_user_id = public.get_current_user_id();
  NEW.updated_by_clerk_sub = public.get_clerk_user_id();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_document_access_permissions_updated_at ON public.document_access_permissions;

CREATE TRIGGER trg_document_access_permissions_updated_at
BEFORE UPDATE ON public.document_access_permissions
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at_document_access_permissions();

-- 1H) Seed permissions for new orgs automatically (guards for missing template)
CREATE OR REPLACE FUNCTION public.seed_document_access_permissions_for_org(p_org_id bigint)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
SET row_security TO 'off'
AS $$
BEGIN
  -- Only seed if the global template table exists
  IF to_regclass('public.document_access_permissions_global') IS NOT NULL THEN
    INSERT INTO public.document_access_permissions
      (clerk_org_id, deal_role_types_id, document_categories_id, can_view, can_insert, can_upload, can_delete, created_at)
    SELECT
      p_org_id,
      g.deal_role_types_id,
      g.document_categories_id,
      g.can_view,
      g.can_insert,
      g.can_upload,
      g.can_delete,
      now()
    FROM public.document_access_permissions_global g
    ON CONFLICT (clerk_org_id, deal_role_types_id, document_categories_id) DO NOTHING;
  END IF;
END;
$$;

DROP TRIGGER IF EXISTS trg_seed_dap_on_org_insert ON public.auth_clerk_orgs;

CREATE OR REPLACE FUNCTION public.auth_clerk_orgs_after_insert_seed_dap()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM public.seed_document_access_permissions_for_org(NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_seed_dap_on_org_insert
AFTER INSERT ON public.auth_clerk_orgs
FOR EACH ROW EXECUTE FUNCTION public.auth_clerk_orgs_after_insert_seed_dap();

--------------------------------------------------------------------------------
-- SECTION 1.9: Ensure is_org_admin(bigint) returns false on NULL (deterministic)
-- NOTE: This function may already exist with dependent policies. We check and
-- only update the body if needed, preserving any existing signature/defaults.
--------------------------------------------------------------------------------

DO $$
BEGIN
  -- Check if function exists
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'is_org_admin'
  ) THEN
    -- Function exists, just update the comment
    COMMENT ON FUNCTION public.is_org_admin(bigint) IS 
      'Returns true if user is admin of specified org. Returns false (not NULL) when p_org_id is NULL.';
  ELSE
    -- Function doesn't exist, create it
    CREATE FUNCTION public.is_org_admin(p_org_id bigint)
    RETURNS boolean
    LANGUAGE sql
    STABLE
    SECURITY DEFINER
    SET search_path TO 'public'
    AS $func$
      SELECT COALESCE(
        p_org_id IS NOT NULL
        AND EXISTS (
          SELECT 1
          FROM public.auth_clerk_orgs_members m
          WHERE m.auth_clerk_users_id = public.get_current_user_id()
            AND m.clerk_org_id = p_org_id
            AND m.clerk_org_role = 'admin'
        ),
        false
      );
    $func$;
    
    GRANT EXECUTE ON FUNCTION public.is_org_admin(bigint) TO authenticated;
  END IF;
END $$;

--------------------------------------------------------------------------------
-- SECTION 2: Core Authorization Functions
--------------------------------------------------------------------------------

-- 2A) Helper: derive all deal_ids for a document file (UNION ALL + outer DISTINCT)
CREATE OR REPLACE FUNCTION public.document_file_deal_ids(p_document_file_id bigint)
RETURNS TABLE (deal_id bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
SET row_security TO 'off'
AS $$
  SELECT DISTINCT d.deal_id
  FROM (
    -- direct doc <-> deal links
    SELECT dfd.deal_id
    FROM public.document_files_deals dfd
    WHERE dfd.document_file_id = p_document_file_id

    UNION ALL

    -- doc <-> guarantor, guarantor <-> deal
    SELECT dg.deal_id
    FROM public.document_files_guarantors dfg
    JOIN public.deal_guarantors dg ON dg.guarantor_id = dfg.guarantor_id
    WHERE dfg.document_file_id = p_document_file_id

    UNION ALL

    -- doc <-> borrower, borrower <-> guarantor, guarantor <-> deal
    SELECT dg.deal_id
    FROM public.document_files_borrowers dfb
    JOIN public.guarantor g ON g.borrower_id = dfb.borrower_id
    JOIN public.deal_guarantors dg ON dg.guarantor_id = g.id
    WHERE dfb.document_file_id = p_document_file_id

    UNION ALL

    -- doc <-> property, property <-> deal
    SELECT dp.deal_id
    FROM public.document_files_properties dfp
    JOIN public.deal_property dp ON dp.property_id = dfp.property_id
    WHERE dfp.document_file_id = p_document_file_id

    UNION ALL

    -- doc <-> company, company_roles <-> deal
    SELECT cr.deal_id
    FROM public.document_files_companies dfc
    JOIN public.company_roles cr ON cr.co_id = dfc.company_id
    WHERE dfc.document_file_id = p_document_file_id
      AND cr.deal_id IS NOT NULL
  ) d;
$$;

COMMENT ON FUNCTION public.document_file_deal_ids IS
  'Returns all deal_ids linked to a document via any path (direct, guarantor, borrower, property, company).';

GRANT EXECUTE ON FUNCTION public.document_file_deal_ids(bigint) TO authenticated;

-- 2B) Deal-scoped authorization (NO cross-org admin leak)
CREATE OR REPLACE FUNCTION public.can_access_deal_document(
  p_deal_id bigint,
  p_document_category_id bigint,
  p_action text DEFAULT 'view'
) RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
SET row_security TO 'off'
AS $$
  SELECT
    CASE
      WHEN p_action NOT IN ('view','insert','upload','delete') THEN false
      ELSE (
        public.is_internal_admin()
        OR (
          public.get_active_org_id() IS NOT NULL

          -- Must be member of active org
          AND EXISTS (
            SELECT 1
            FROM public.auth_clerk_orgs_members m
            WHERE m.auth_clerk_users_id = public.get_current_user_id()
              AND m.clerk_org_id = public.get_active_org_id()
          )

          -- Deal must belong to active org if mapped
          AND (
            NOT EXISTS (
              SELECT 1
              FROM public.bsi_deals_clerk_orgs dorg
              WHERE dorg.deal_id = p_deal_id
            )
            OR EXISTS (
              SELECT 1
              FROM public.bsi_deals_clerk_orgs dorg
              WHERE dorg.deal_id = p_deal_id
                AND dorg.clerk_org_id = public.get_active_org_id()
            )
          )

          -- Org-admin bypass only after deal↔org validation
          AND (
            public.is_org_admin(public.get_active_org_id())
            OR EXISTS (
              SELECT 1
              FROM public.deal_roles dr
              JOIN public.document_access_permissions dap
                ON dap.clerk_org_id = public.get_active_org_id()
               AND dap.deal_role_types_id = dr.deal_role_types_id
               AND dap.document_categories_id = p_document_category_id
              WHERE dr.deal_id = p_deal_id
                AND dr.auth_clerk_users_id = public.get_current_user_id()
                AND (
                  (p_action = 'view'   AND dap.can_view)
                  OR (p_action = 'insert' AND dap.can_insert)
                  OR (p_action = 'upload' AND dap.can_upload)
                  OR (p_action = 'delete' AND dap.can_delete)
                )
            )
          )
        )
      )
    END;
$$;

COMMENT ON FUNCTION public.can_access_deal_document(bigint, bigint, text) IS
  'Org-scoped deal document access. Validates active-org membership, deal↔org mapping, then checks permissions matrix (or org-admin bypass).';

GRANT EXECUTE ON FUNCTION public.can_access_deal_document(bigint, bigint, text) TO authenticated;

-- 2C) Canonical: can_access_document (single entry point for all RLS read/delete decisions)
CREATE OR REPLACE FUNCTION public.can_access_document(
  p_document_file_id bigint,
  p_action text DEFAULT 'view'
) RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
SET row_security TO 'off'
AS $$
  WITH df AS (
    SELECT id, document_category_id, uploaded_by, uploaded_at
    FROM public.document_files
    WHERE id = p_document_file_id
  )
  SELECT
    CASE
      WHEN p_action NOT IN ('view','insert','upload','delete') THEN false
      ELSE (
        public.is_internal_admin()

        -- org admins: full VIEW access to docs explicitly linked to the active org
        OR (
          p_action = 'view'
          AND public.is_org_admin(public.get_active_org_id())
          AND EXISTS (
            SELECT 1
            FROM public.document_files_clerk_orgs dfco
            WHERE dfco.document_file_id = p_document_file_id
              AND dfco.clerk_org_id = public.get_active_org_id()
          )
        )

        -- uploader can view
        OR (
          p_action = 'view'
          AND EXISTS (
            SELECT 1 FROM df
            WHERE df.uploaded_by = public.get_clerk_user_id()
          )
        )

        -- uploader can upload to their own fresh doc (uploaded_at IS NULL means not yet uploaded)
        OR (
          p_action = 'upload'
          AND EXISTS (
            SELECT 1 FROM df
            WHERE df.uploaded_by = public.get_clerk_user_id()
              AND df.uploaded_at IS NULL
          )
        )

        -- direct user link can view (view-only by design)
        OR (
          p_action = 'view'
          AND EXISTS (
            SELECT 1
            FROM public.document_files_clerk_users dfcu
            WHERE dfcu.document_file_id = p_document_file_id
              AND dfcu.clerk_user_id = public.get_current_user_id()
          )
        )

        -- direct org link can view (must be member of active org)
        OR (
          p_action = 'view'
          AND public.get_active_org_id() IS NOT NULL
          AND EXISTS (
            SELECT 1
            FROM public.document_files_clerk_orgs dfco
            JOIN public.auth_clerk_orgs_members m
              ON m.clerk_org_id = dfco.clerk_org_id
             AND m.auth_clerk_users_id = public.get_current_user_id()
            WHERE dfco.document_file_id = p_document_file_id
              AND dfco.clerk_org_id = public.get_active_org_id()
          )
        )

        -- deal-derived permission (covers docs linked to borrower/guarantor/company/property)
        OR EXISTS (
          SELECT 1
          FROM df
          JOIN public.document_file_deal_ids(p_document_file_id) d ON true
          WHERE df.document_category_id IS NOT NULL
            AND public.can_access_deal_document(d.deal_id, df.document_category_id, p_action)
        )
      )
    END;
$$;

COMMENT ON FUNCTION public.can_access_document IS
  'Canonical document access check. Uploader can upload to their own fresh doc (uploaded_at IS NULL). Deal-derived permissions for other actions.';

GRANT EXECUTE ON FUNCTION public.can_access_document(bigint, text) TO authenticated;

--------------------------------------------------------------------------------
-- SECTION 3: RLS Policies for document_files_clerk_orgs (org-scoped visibility links)
--------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Admin can manage document_files_clerk_orgs" ON public.document_files_clerk_orgs;
DROP POLICY IF EXISTS "Org admins manage own org document links" ON public.document_files_clerk_orgs;
DROP POLICY IF EXISTS "Org members can view document_files_clerk_orgs links" ON public.document_files_clerk_orgs;
DROP POLICY IF EXISTS dfco_select ON public.document_files_clerk_orgs;
DROP POLICY IF EXISTS dfco_insert ON public.document_files_clerk_orgs;
DROP POLICY IF EXISTS dfco_delete ON public.document_files_clerk_orgs;

CREATE POLICY dfco_select
ON public.document_files_clerk_orgs
FOR SELECT TO authenticated
USING (
  public.is_internal_admin()
  OR EXISTS (
    SELECT 1
    FROM public.auth_clerk_orgs_members m
    WHERE m.auth_clerk_users_id = public.get_current_user_id()
      AND m.clerk_org_id = document_files_clerk_orgs.clerk_org_id
  )
);

CREATE POLICY dfco_insert
ON public.document_files_clerk_orgs
FOR INSERT TO authenticated
WITH CHECK (
  public.is_internal_admin()
  OR public.is_org_admin(document_files_clerk_orgs.clerk_org_id)
);

CREATE POLICY dfco_delete
ON public.document_files_clerk_orgs
FOR DELETE TO authenticated
USING (
  public.is_internal_admin()
  OR public.is_org_admin(document_files_clerk_orgs.clerk_org_id)
);

--------------------------------------------------------------------------------
-- SECTION 4: RLS Policies for document_files_clerk_users (user-scoped visibility links)
--------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Admin can manage document_files_clerk_users" ON public.document_files_clerk_users;
DROP POLICY IF EXISTS "Users can view own document_files_clerk_users links" ON public.document_files_clerk_users;
DROP POLICY IF EXISTS dfcu_select ON public.document_files_clerk_users;
DROP POLICY IF EXISTS dfcu_write_admin_only ON public.document_files_clerk_users;

CREATE POLICY dfcu_select
ON public.document_files_clerk_users
FOR SELECT TO authenticated
USING (
  public.is_internal_admin()
  OR document_files_clerk_users.clerk_user_id = public.get_current_user_id()
);

-- Lock down writes to internal admin only (prevents self-link escalation)
CREATE POLICY dfcu_write_admin_only
ON public.document_files_clerk_users
FOR ALL TO authenticated
USING (public.is_internal_admin())
WITH CHECK (public.is_internal_admin());

--------------------------------------------------------------------------------
-- SECTION 5: RLS Policies for document junction tables (SELECT)
--------------------------------------------------------------------------------

-- Borrowers
DROP POLICY IF EXISTS "Admin can manage document_files_borrowers" ON public.document_files_borrowers;
DROP POLICY IF EXISTS "Users can view borrower documents for their deals" ON public.document_files_borrowers;
DROP POLICY IF EXISTS dfb_select ON public.document_files_borrowers;

CREATE POLICY dfb_select
ON public.document_files_borrowers
FOR SELECT TO authenticated
USING (public.can_access_document(document_file_id, 'view'));

-- Companies
DROP POLICY IF EXISTS "Admin can manage document_files_companies" ON public.document_files_companies;
DROP POLICY IF EXISTS "Users can view company documents for their deals" ON public.document_files_companies;
DROP POLICY IF EXISTS dfc_select ON public.document_files_companies;

CREATE POLICY dfc_select
ON public.document_files_companies
FOR SELECT TO authenticated
USING (public.can_access_document(document_file_id, 'view'));

-- Guarantors
DROP POLICY IF EXISTS "Admin can manage document_files_guarantors" ON public.document_files_guarantors;
DROP POLICY IF EXISTS "Users can view guarantor documents for their deals" ON public.document_files_guarantors;
DROP POLICY IF EXISTS dfg_select ON public.document_files_guarantors;

CREATE POLICY dfg_select
ON public.document_files_guarantors
FOR SELECT TO authenticated
USING (public.can_access_document(document_file_id, 'view'));

-- Properties
DROP POLICY IF EXISTS "Admin can manage document_files_properties" ON public.document_files_properties;
DROP POLICY IF EXISTS "Users can view property documents for their deals" ON public.document_files_properties;
DROP POLICY IF EXISTS dfp_select ON public.document_files_properties;

CREATE POLICY dfp_select
ON public.document_files_properties
FOR SELECT TO authenticated
USING (public.can_access_document(document_file_id, 'view'));

-- Deals
DROP POLICY IF EXISTS "Admin full access to document_deals" ON public.document_files_deals;
DROP POLICY IF EXISTS "Users view document_files_deals via role" ON public.document_files_deals;
DROP POLICY IF EXISTS dfd_select ON public.document_files_deals;

CREATE POLICY dfd_select
ON public.document_files_deals
FOR SELECT TO authenticated
USING (public.can_access_document(document_file_id, 'view'));

-- Tags
DROP POLICY IF EXISTS "Admin manages document_files_tags" ON public.document_files_tags;
DROP POLICY IF EXISTS "Users can view tags for accessible docs" ON public.document_files_tags;
DROP POLICY IF EXISTS dft_select ON public.document_files_tags;

CREATE POLICY dft_select
ON public.document_files_tags
FOR SELECT TO authenticated
USING (public.can_access_document(document_file_id, 'view'));

--------------------------------------------------------------------------------
-- SECTION 6: RLS Policies for document junction tables (INSERT/DELETE)
-- IMPORTANT: INSERT uses NEW row fields to avoid "first-link" authorization deadlocks.
--------------------------------------------------------------------------------

-- Borrowers: borrower -> guarantor -> deal
DROP POLICY IF EXISTS dfb_insert ON public.document_files_borrowers;
DROP POLICY IF EXISTS dfb_delete ON public.document_files_borrowers;

CREATE POLICY dfb_insert
ON public.document_files_borrowers
FOR INSERT TO authenticated
WITH CHECK (
  public.is_internal_admin()
  OR EXISTS (
    SELECT 1
    FROM public.document_files df
    JOIN public.guarantor g
      ON g.borrower_id = document_files_borrowers.borrower_id
    JOIN public.deal_guarantors dg
      ON dg.guarantor_id = g.id
    WHERE df.id = document_files_borrowers.document_file_id
      AND df.document_category_id IS NOT NULL
      AND public.can_access_deal_document(dg.deal_id, df.document_category_id, 'insert')
  )
);

CREATE POLICY dfb_delete
ON public.document_files_borrowers
FOR DELETE TO authenticated
USING (public.can_access_document(document_file_id, 'delete'));

-- Companies: company_roles.deal_id -> deal
DROP POLICY IF EXISTS dfc_insert ON public.document_files_companies;
DROP POLICY IF EXISTS dfc_delete ON public.document_files_companies;

CREATE POLICY dfc_insert
ON public.document_files_companies
FOR INSERT TO authenticated
WITH CHECK (
  public.is_internal_admin()
  OR EXISTS (
    SELECT 1
    FROM public.document_files df
    JOIN public.company_roles cr
      ON cr.co_id = document_files_companies.company_id
     AND cr.deal_id IS NOT NULL
    WHERE df.id = document_files_companies.document_file_id
      AND df.document_category_id IS NOT NULL
      AND public.can_access_deal_document(cr.deal_id, df.document_category_id, 'insert')
  )
);

CREATE POLICY dfc_delete
ON public.document_files_companies
FOR DELETE TO authenticated
USING (public.can_access_document(document_file_id, 'delete'));

-- Guarantors: guarantor -> deal
DROP POLICY IF EXISTS dfg_insert ON public.document_files_guarantors;
DROP POLICY IF EXISTS dfg_delete ON public.document_files_guarantors;

CREATE POLICY dfg_insert
ON public.document_files_guarantors
FOR INSERT TO authenticated
WITH CHECK (
  public.is_internal_admin()
  OR EXISTS (
    SELECT 1
    FROM public.document_files df
    JOIN public.deal_guarantors dg
      ON dg.guarantor_id = document_files_guarantors.guarantor_id
    WHERE df.id = document_files_guarantors.document_file_id
      AND df.document_category_id IS NOT NULL
      AND public.can_access_deal_document(dg.deal_id, df.document_category_id, 'insert')
  )
);

CREATE POLICY dfg_delete
ON public.document_files_guarantors
FOR DELETE TO authenticated
USING (public.can_access_document(document_file_id, 'delete'));

-- Properties: deal_property.deal_id -> deal
DROP POLICY IF EXISTS dfp_insert ON public.document_files_properties;
DROP POLICY IF EXISTS dfp_delete ON public.document_files_properties;

CREATE POLICY dfp_insert
ON public.document_files_properties
FOR INSERT TO authenticated
WITH CHECK (
  public.is_internal_admin()
  OR EXISTS (
    SELECT 1
    FROM public.document_files df
    JOIN public.deal_property dp
      ON dp.property_id = document_files_properties.property_id
    WHERE df.id = document_files_properties.document_file_id
      AND df.document_category_id IS NOT NULL
      AND public.can_access_deal_document(dp.deal_id, df.document_category_id, 'insert')
  )
);

CREATE POLICY dfp_delete
ON public.document_files_properties
FOR DELETE TO authenticated
USING (public.can_access_document(document_file_id, 'delete'));

-- Deals: direct deal_id available on NEW row
DROP POLICY IF EXISTS dfd_insert ON public.document_files_deals;
DROP POLICY IF EXISTS dfd_delete ON public.document_files_deals;

CREATE POLICY dfd_insert
ON public.document_files_deals
FOR INSERT TO authenticated
WITH CHECK (
  public.is_internal_admin()
  OR EXISTS (
    SELECT 1
    FROM public.document_files df
    WHERE df.id = document_files_deals.document_file_id
      AND df.document_category_id IS NOT NULL
      AND public.can_access_deal_document(document_files_deals.deal_id, df.document_category_id, 'insert')
  )
);

CREATE POLICY dfd_delete
ON public.document_files_deals
FOR DELETE TO authenticated
USING (public.can_access_document(document_file_id, 'delete'));

-- Tags: tagging is allowed only if user has insert permission on the document (no first-link issue here)
DROP POLICY IF EXISTS dft_insert ON public.document_files_tags;
DROP POLICY IF EXISTS dft_delete ON public.document_files_tags;

CREATE POLICY dft_insert
ON public.document_files_tags
FOR INSERT TO authenticated
WITH CHECK (
  public.is_internal_admin()
  OR public.can_access_document(document_file_id, 'insert')
);

CREATE POLICY dft_delete
ON public.document_files_tags
FOR DELETE TO authenticated
USING (public.can_access_document(document_file_id, 'delete'));

--------------------------------------------------------------------------------
-- SECTION 7: RLS Policies for document_files table
-- - SELECT uses canonical function
-- - INSERT/UPDATE are internal-admin only (use RPC/server action to create doc + links atomically)
--------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Admin full access to documents" ON public.document_files;
DROP POLICY IF EXISTS "Users can view own uploads" ON public.document_files;
DROP POLICY IF EXISTS "Users can view accessible documents" ON public.document_files;
DROP POLICY IF EXISTS df_select ON public.document_files;
DROP POLICY IF EXISTS df_insert ON public.document_files;
DROP POLICY IF EXISTS df_update ON public.document_files;
DROP POLICY IF EXISTS df_delete ON public.document_files;

CREATE POLICY df_select
ON public.document_files
FOR SELECT TO authenticated
USING (public.can_access_document(id, 'view'));

-- Keep INSERT internal-admin only; create docs via RPC/server action so links are created atomically.
CREATE POLICY df_insert
ON public.document_files
FOR INSERT TO authenticated
WITH CHECK (public.is_internal_admin());

-- Keep UPDATE internal-admin only to avoid "upload == update anything" ambiguity.
CREATE POLICY df_update
ON public.document_files
FOR UPDATE TO authenticated
USING (public.is_internal_admin())
WITH CHECK (public.is_internal_admin());

CREATE POLICY df_delete
ON public.document_files
FOR DELETE TO authenticated
USING (public.can_access_document(id, 'delete'));

--------------------------------------------------------------------------------
-- SECTION 8: Drop obsolete helper functions (fragmented access checkers)
--------------------------------------------------------------------------------

DROP FUNCTION IF EXISTS public.can_access_borrower_document(bigint);
DROP FUNCTION IF EXISTS public.can_access_company_document(bigint);
DROP FUNCTION IF EXISTS public.can_access_guarantor_document(bigint);
DROP FUNCTION IF EXISTS public.can_access_property_document(bigint);
DROP FUNCTION IF EXISTS public.user_can_access_document(bigint);

--------------------------------------------------------------------------------
-- SECTION 9: Storage RLS for documents bucket (document-level access)
-- Note: storage.objects already has RLS enabled by Supabase
--------------------------------------------------------------------------------

-- Drop old policies if they exist
DROP POLICY IF EXISTS documents_admin_full_access ON storage.objects;
DROP POLICY IF EXISTS documents_select_via_document_files ON storage.objects;
DROP POLICY IF EXISTS documents_insert_via_document_files ON storage.objects;
DROP POLICY IF EXISTS documents_update_via_document_files ON storage.objects;
DROP POLICY IF EXISTS documents_delete_via_document_files ON storage.objects;

-- Internal admin: full access to documents bucket
CREATE POLICY documents_admin_full_access
ON storage.objects
FOR ALL TO authenticated
USING (bucket_id = 'documents' AND public.is_internal_admin())
WITH CHECK (bucket_id = 'documents' AND public.is_internal_admin());

-- SELECT: must map to document_files + can_access_document(view)
CREATE POLICY documents_select_via_document_files
ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'documents'
  AND EXISTS (
    SELECT 1
    FROM public.document_files df
    WHERE df.storage_bucket = 'documents'
      AND df.storage_path = storage.objects.name
      AND public.can_access_document(df.id, 'view')
  )
);

-- INSERT (upload/create object): must map to document_files + can_access_document(upload)
CREATE POLICY documents_insert_via_document_files
ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND EXISTS (
    SELECT 1
    FROM public.document_files df
    WHERE df.storage_bucket = 'documents'
      AND df.storage_path = storage.objects.name
      AND public.can_access_document(df.id, 'upload')
  )
);

-- UPDATE (overwrite/metadata): same rule as upload
CREATE POLICY documents_update_via_document_files
ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'documents'
  AND EXISTS (
    SELECT 1
    FROM public.document_files df
    WHERE df.storage_bucket = 'documents'
      AND df.storage_path = storage.objects.name
      AND public.can_access_document(df.id, 'upload')
  )
)
WITH CHECK (
  bucket_id = 'documents'
  AND EXISTS (
    SELECT 1
    FROM public.document_files df
    WHERE df.storage_bucket = 'documents'
      AND df.storage_path = storage.objects.name
      AND public.can_access_document(df.id, 'upload')
  )
);

-- DELETE: must map to document_files + can_access_document(delete)
CREATE POLICY documents_delete_via_document_files
ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'documents'
  AND EXISTS (
    SELECT 1
    FROM public.document_files df
    WHERE df.storage_bucket = 'documents'
      AND df.storage_path = storage.objects.name
      AND public.can_access_document(df.id, 'delete')
  )
);

--------------------------------------------------------------------------------
-- SECTION 10: Performance indexes for document_file_deal_ids() and RLS
--------------------------------------------------------------------------------

-- Junction table indexes (composite for common joins) - these tables are guaranteed to exist
CREATE INDEX IF NOT EXISTS idx_dfd_deal ON public.document_files_deals (deal_id, document_file_id);
CREATE INDEX IF NOT EXISTS idx_dfg_guar ON public.document_files_guarantors (guarantor_id, document_file_id);
CREATE INDEX IF NOT EXISTS idx_dfb_borr ON public.document_files_borrowers (borrower_id, document_file_id);

-- Entity-to-deal relationship indexes - these tables are guaranteed to exist
CREATE INDEX IF NOT EXISTS idx_dg_guar ON public.deal_guarantors (guarantor_id, deal_id);
CREATE INDEX IF NOT EXISTS idx_dp_prop ON public.deal_property (property_id, deal_id);
CREATE INDEX IF NOT EXISTS idx_cr_co_deal ON public.company_roles (co_id, deal_id) WHERE deal_id IS NOT NULL;

-- Transaction-related indexes (guarded - tables may not exist in all environments)
DO $$
BEGIN
  IF to_regclass('public.bsi_transactions_deals') IS NOT NULL THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_btd_txn ON public.bsi_transactions_deals (transaction_id, deal_id)';
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.bsi_transactions_document_files') IS NOT NULL THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_btdf_txn ON public.bsi_transactions_document_files (transaction_id, document_file_id)';
  END IF;
END $$;

-- Appraisal lookup (guarded - table/column may not exist in all environments)
DO $$
BEGIN
  IF to_regclass('public.appraisal') IS NOT NULL
     AND EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema='public' AND table_name='appraisal' AND column_name='document_id'
     ) THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_appraisal_doc ON public.appraisal (document_id, deal_id, property_id)';
  END IF;
END $$;

COMMIT;
