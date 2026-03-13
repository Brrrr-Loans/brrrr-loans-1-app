-- ============================================================================
-- Migration: Create Organization Policies System (Standard BIGINT Strategy)
-- ============================================================================
-- Creates policy tables with BIGINT foreign keys to existing primary keys
-- No changes to existing tables - 100% additive
--
-- Adaptations from pricing-engine:
-- - organizations → auth_clerk_orgs
-- - users → auth_clerk_users
-- - UUID → BIGINT (for org_id and created_by_user_id columns)
-- ============================================================================

-- ============================================================================
-- PHASE A: Create Policy Tables
-- ============================================================================

-- Table 1: organization_policies
-- Stores conditional access rules
CREATE TABLE IF NOT EXISTS public.organization_policies (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  org_id bigint NULL,
  resource_type text NOT NULL,
  resource_name text NOT NULL DEFAULT '*',
  action text NOT NULL,
  definition_json jsonb NOT NULL,
  compiled_config jsonb NOT NULL,
  version integer NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by_user_id bigint NULL,
  created_by_clerk_sub text NULL,
  scope text NOT NULL DEFAULT 'all',
  effect text NOT NULL DEFAULT 'ALLOW',
  archived_at timestamp with time zone NULL,
  archived_by text NULL,
  is_protected_policy boolean NOT NULL DEFAULT false,

  CONSTRAINT org_policies_pkey PRIMARY KEY (id),
  CONSTRAINT organization_policies_unique UNIQUE (
    org_id, resource_type, resource_name, action
  ),

  -- Standard FK → PK references (BIGINT to BIGINT)
  CONSTRAINT organization_policies_created_by_user_id_fkey
    FOREIGN KEY (created_by_user_id)
    REFERENCES auth_clerk_users(id) ON DELETE SET NULL,

  CONSTRAINT organization_policies_org_id_fkey
    FOREIGN KEY (org_id)
    REFERENCES auth_clerk_orgs(id) ON DELETE CASCADE,

  -- Constraints
  CONSTRAINT organization_policies_effect_check CHECK (
    effect = ANY (ARRAY['ALLOW'::text, 'DENY'::text])
  ),
  CONSTRAINT organization_policies_resource_type_check CHECK (
    resource_type = ANY (ARRAY[
      'table'::text,
      'storage_bucket'::text,
      'feature'::text,
      'route'::text,
      'liveblocks'::text,
      'api_key'::text
    ])
  ),
  CONSTRAINT organization_policies_scope_check CHECK (
    scope = ANY (ARRAY[
      'all'::text,
      'org_records'::text,
      'user_records'::text,
      'org_and_user'::text
    ])
  ),
  CONSTRAINT organization_policies_action_check CHECK (
    action = ANY (ARRAY[
      'select'::text,
      'insert'::text,
      'update'::text,
      'delete'::text,
      'all'::text,
      'submit'::text,
      'view'::text,
      'room_write'::text,
      'room_read'::text,
      'room_presence_write'::text,
      'room_private'::text
    ])
  )
);

COMMENT ON TABLE public.organization_policies IS 
  'Conditional access control policies for organization-scoped resources';
COMMENT ON COLUMN public.organization_policies.org_id IS 
  'FK to auth_clerk_orgs.id (BIGINT). NULL = global policy';
COMMENT ON COLUMN public.organization_policies.created_by_user_id IS 
  'FK to auth_clerk_users.id (BIGINT). User who created this policy';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_organization_policies_lookup
  ON public.organization_policies (
    org_id, resource_type, resource_name, action, is_active
  );

CREATE INDEX IF NOT EXISTS idx_organization_policies_not_archived
  ON public.organization_policies (id)
  WHERE archived_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_organization_policies_global_unique
  ON public.organization_policies (
    resource_type, resource_name, action, effect
  )
  WHERE org_id IS NULL;

-- Table 2: Column filters for automatic policy application
CREATE TABLE IF NOT EXISTS public.organization_policies_column_filters (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  schema_name text NOT NULL DEFAULT 'public'::text,
  org_column text NULL,
  user_column text NULL,
  user_column_type text NOT NULL DEFAULT 'clerk_id'::text,
  join_path text NULL,
  is_excluded boolean NOT NULL DEFAULT false,
  notes text NULL,
  named_scopes text[] NOT NULL DEFAULT '{}'::text[],

  CONSTRAINT organization_policies_column_filters_pkey PRIMARY KEY (id),
  CONSTRAINT organization_policies_column_filters_table_name_key UNIQUE (table_name),
  CONSTRAINT organization_policies_column_filters_user_column_type_check CHECK (
    user_column_type = ANY (ARRAY['clerk_id'::text, 'pk'::text])
  )
);

COMMENT ON TABLE public.organization_policies_column_filters IS 
  'Metadata for automatic policy application to tables';

-- Table 3: Named scopes registry
CREATE TABLE IF NOT EXISTS public.organization_policy_named_scopes (
  name text NOT NULL,
  label text NOT NULL,
  description text NULL,
  uses_precomputed boolean NOT NULL DEFAULT false,
  precomputed_table text NULL,
  precomputed_user_col text NULL,
  precomputed_pk_col text NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),

  CONSTRAINT organization_policy_named_scopes_pkey PRIMARY KEY (name)
);

COMMENT ON TABLE public.organization_policy_named_scopes IS 
  'Registry of named scopes for advanced policy filtering';

-- Table 4: Named scope table associations
CREATE TABLE IF NOT EXISTS public.organization_policy_named_scope_tables (
  scope_name text NOT NULL,
  table_name text NOT NULL,
  fk_column text NOT NULL,
  notes text NULL,

  CONSTRAINT organization_policy_named_scope_tables_pkey PRIMARY KEY (scope_name, table_name),
  CONSTRAINT organization_policy_named_scope_tables_scope_name_fkey
    FOREIGN KEY (scope_name)
    REFERENCES organization_policy_named_scopes (name) ON DELETE CASCADE
);

COMMENT ON TABLE public.organization_policy_named_scope_tables IS 
  'Associates named scopes with specific tables and foreign key columns';

-- ============================================================================
-- PHASE B: Enable RLS and Create Policies
-- ============================================================================

-- Enable RLS on all policy tables
ALTER TABLE public.organization_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_policies_column_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_policy_named_scopes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_policy_named_scope_tables ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow authenticated users to read policies for their org
CREATE POLICY "Users can read org policies"
  ON public.organization_policies
  FOR SELECT
  TO authenticated
  USING (
    org_id IN (
      SELECT id
      FROM auth_clerk_orgs
      WHERE id IN (
        SELECT clerk_org_id
        FROM auth_clerk_orgs_members
        WHERE auth_clerk_users_id = (
          SELECT id FROM auth_clerk_users WHERE clerk_user_id = auth.jwt() ->> 'sub'
        )
      )
    ) OR org_id IS NULL -- Global policies visible to all
  );

-- RLS Policy: Admin-only write access
CREATE POLICY "Admins can manage policies"
  ON public.organization_policies
  TO authenticated
  USING (
    EXISTS(
      SELECT 1 FROM auth_clerk_users
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
      AND personal_role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS(
      SELECT 1 FROM auth_clerk_users
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
      AND personal_role = 'admin'
    )
  );

-- RLS Policy: Column filters readable by authenticated users
CREATE POLICY "Users can read column filters"
  ON public.organization_policies_column_filters
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policy: Only admins can manage column filters
CREATE POLICY "Admins can manage column filters"
  ON public.organization_policies_column_filters
  TO authenticated
  USING (
    EXISTS(
      SELECT 1 FROM auth_clerk_users
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
      AND personal_role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS(
      SELECT 1 FROM auth_clerk_users
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
      AND personal_role = 'admin'
    )
  );

-- RLS Policy: Named scopes readable by authenticated users
CREATE POLICY "Users can read named scopes"
  ON public.organization_policy_named_scopes
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policy: Only admins can manage named scopes
CREATE POLICY "Admins can manage named scopes"
  ON public.organization_policy_named_scopes
  TO authenticated
  USING (
    EXISTS(
      SELECT 1 FROM auth_clerk_users
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
      AND personal_role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS(
      SELECT 1 FROM auth_clerk_users
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
      AND personal_role = 'admin'
    )
  );

-- RLS Policy: Scope tables readable by authenticated users
CREATE POLICY "Users can read scope tables"
  ON public.organization_policy_named_scope_tables
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policy: Only admins can manage scope tables
CREATE POLICY "Admins can manage scope tables"
  ON public.organization_policy_named_scope_tables
  TO authenticated
  USING (
    EXISTS(
      SELECT 1 FROM auth_clerk_users
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
      AND personal_role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS(
      SELECT 1 FROM auth_clerk_users
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
      AND personal_role = 'admin'
    )
  );

-- ============================================================================
-- PHASE C: Seed Column Filters for Lender Portal Tables
-- ============================================================================

INSERT INTO public.organization_policies_column_filters
  (table_name, schema_name, org_column, user_column, user_column_type, named_scopes, notes)
VALUES
  ('deal', 'public', NULL, NULL, 'clerk_id', '{}', 'Deals - no direct org/user columns'),
  ('bsi_transactions', 'public', 'clerk_org_id', 'clerk_user_id', 'pk', '{}', 'Transactions with org and user BIGINT FK'),
  ('bsi_distributions', 'public', 'clerk_org_id', 'clerk_user_id', 'pk', '{}', 'Distributions with org and user BIGINT FK'),
  ('document_files', 'public', NULL, 'uploaded_by', 'clerk_id', '{}', 'Document files - uploaded_by is clerk text ID'),
  ('bsi_deals_clerk_users', 'public', NULL, 'clerk_user_id', 'pk', '{}', 'User-deal junction'),
  ('bsi_deals_clerk_orgs', 'public', 'clerk_org_id', NULL, 'pk', '{}', 'Org-deal junction')
ON CONFLICT (table_name) DO NOTHING;

-- ============================================================================
-- Verification Queries (for manual testing after migration)
-- ============================================================================
-- SELECT * FROM organization_policies;
-- SELECT * FROM organization_policies_column_filters;
-- \d organization_policies
-- \d+ organization_policies
