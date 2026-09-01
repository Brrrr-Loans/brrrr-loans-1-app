-- =============================================================================
-- CONSOLIDATED Migration: Role Column Changes
-- =============================================================================
-- This migration consolidates 3 separate migrations into one atomic operation:
--   1. Rename auth_clerk_users.role → personal_role (then convert to text)
--   2. Add clerk_member_role (text) to auth_clerk_orgs_members
--   3. Update all authorization functions
--   4. Recreate RLS policies
--
-- SAFE: Drops all dependent policies FIRST, then recreates them at the end.
-- =============================================================================

-- =============================================================================
-- STEP 1: DROP ALL DEPENDENT RLS POLICIES (prevents breakage during changes)
-- =============================================================================

DROP POLICY IF EXISTS "Balance sheet investors can insert their own statements" ON public.bsi_statements;
DROP POLICY IF EXISTS "Balance sheet investors can select their statements" ON public.bsi_statements;
DROP POLICY IF EXISTS "Users can view transaction deal allocations" ON public.bsi_transactions_deals;
DROP POLICY IF EXISTS "Users can view transaction instrument allocations" ON public.bsi_transactions_instruments;
DROP POLICY IF EXISTS "Users can link documents to their transactions" ON public.bsi_transactions_document_files;
DROP POLICY IF EXISTS "Users can unlink their documents" ON public.bsi_transactions_document_files;
DROP POLICY IF EXISTS "Users can view documents for their transactions" ON public.bsi_transactions_document_files;

-- =============================================================================
-- STEP 2-3: Rename role → personal_role and convert enum to text if needed
-- =============================================================================
-- Preview may already have personal_role as text from 20260119193448 /
-- 20260119195349. Do not rename a missing role column or DROP CASCADE an
-- already-converted text column.

DO $$
DECLARE
  role_type text;
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'auth_clerk_users'
      AND column_name = 'role'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'auth_clerk_users'
      AND column_name = 'personal_role'
  ) THEN
    ALTER TABLE public.auth_clerk_users
      RENAME COLUMN role TO personal_role;
  END IF;

  SELECT c.data_type INTO role_type
  FROM information_schema.columns c
  WHERE c.table_schema = 'public'
    AND c.table_name = 'auth_clerk_users'
    AND c.column_name = 'personal_role';

  IF role_type IS NULL THEN
    ALTER TABLE public.auth_clerk_users
      ADD COLUMN personal_role text;
  ELSIF role_type IS DISTINCT FROM 'text' THEN
    ALTER TABLE public.auth_clerk_users
      ADD COLUMN IF NOT EXISTS personal_role_text text;

    UPDATE public.auth_clerk_users
      SET personal_role_text = personal_role::text
      WHERE personal_role IS NOT NULL;

    ALTER TABLE public.auth_clerk_users
      DROP COLUMN IF EXISTS personal_role CASCADE;

    ALTER TABLE public.auth_clerk_users
      RENAME COLUMN personal_role_text TO personal_role;
  END IF;
END $$;

COMMENT ON COLUMN public.auth_clerk_users.personal_role IS 
  'User role when NOT in an org context (personal scope). Example values: admin, account_executive, loan_processor, balance_sheet_investor, loan_opener, borrower, broker';

-- =============================================================================
-- STEP 4: ADD clerk_member_role TO auth_clerk_orgs_members (as text)
-- =============================================================================

ALTER TABLE public.auth_clerk_orgs_members 
  ADD COLUMN IF NOT EXISTS clerk_member_role text;

COMMENT ON COLUMN public.auth_clerk_orgs_members.clerk_member_role IS 
  'Functional role within this specific org. Different from clerk_org_role which is coarse privilege (admin/member/viewer). Example values: admin, account_executive, loan_processor, balance_sheet_investor, loan_opener, broker, borrower';

CREATE INDEX IF NOT EXISTS idx_auth_clerk_orgs_members_clerk_member_role 
  ON public.auth_clerk_orgs_members(clerk_member_role);

-- =============================================================================
-- STEP 5: UPDATE/CREATE AUTHORIZATION FUNCTIONS
-- =============================================================================

-- get_effective_role: Returns role based on context
DROP FUNCTION IF EXISTS public.get_effective_role(bigint);

CREATE OR REPLACE FUNCTION public.get_effective_role(p_org_id bigint DEFAULT NULL)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text;
  v_clerk_user_id text;
BEGIN
  v_clerk_user_id := public.get_clerk_user_id();
  
  IF v_clerk_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  IF p_org_id IS NOT NULL THEN
    -- Org context: use clerk_member_role
    SELECT com.clerk_member_role INTO v_role
    FROM public.auth_clerk_orgs_members com
    JOIN public.auth_clerk_users acu ON com.auth_clerk_users_id = acu.id
    WHERE acu.clerk_user_id = v_clerk_user_id
      AND com.clerk_org_id = p_org_id;
  ELSE
    -- Personal context: use personal_role
    SELECT acu.personal_role INTO v_role
    FROM public.auth_clerk_users acu
    WHERE acu.clerk_user_id = v_clerk_user_id;
  END IF;
  
  RETURN v_role;
END;
$$;

COMMENT ON FUNCTION public.get_effective_role IS 
  'Returns user role based on context. If org_id provided, returns clerk_member_role for that org. If null, returns personal_role.';

GRANT EXECUTE ON FUNCTION public.get_effective_role TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_effective_role TO anon;

-- has_role: Check if user has specific role
DROP FUNCTION IF EXISTS public.has_role(public.user_role_internal, bigint);
DROP FUNCTION IF EXISTS public.has_role(text, bigint);

CREATE OR REPLACE FUNCTION public.has_role(
  p_role text,
  p_org_id bigint DEFAULT NULL
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.get_effective_role(p_org_id) = p_role;
$$;

COMMENT ON FUNCTION public.has_role IS 
  'Check if current user has the specified role in the given context (org or personal)';

GRANT EXECUTE ON FUNCTION public.has_role TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role TO anon;

-- is_internal_admin: Check if user is internal admin
CREATE OR REPLACE FUNCTION public.is_internal_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.auth_clerk_users
    WHERE clerk_user_id = public.get_clerk_user_id()
    AND personal_role = 'admin'
    AND is_internal_yn = true
  );
$$;

-- is_admin: Check if user is admin (any type)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.auth_clerk_users
    WHERE clerk_user_id = public.get_clerk_user_id()
    AND personal_role = 'admin'
  );
$$;

-- =============================================================================
-- STEP 6: RECREATE RLS POLICIES (using text comparison)
-- =============================================================================

-- bsi_statements policies
DROP POLICY IF EXISTS "Balance sheet investors can insert their own statements" ON public.bsi_statements;
CREATE POLICY "Balance sheet investors can insert their own statements" 
ON public.bsi_statements 
FOR INSERT TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.auth_clerk_users acu
    WHERE acu.clerk_user_id = (auth.jwt() ->> 'sub')
    AND acu.personal_role = 'balance_sheet_investor'
    AND bsi_statements.auth_clerk_users_id = acu.id
  )
);

DROP POLICY IF EXISTS "Balance sheet investors can select their statements" ON public.bsi_statements;
CREATE POLICY "Balance sheet investors can select their statements" 
ON public.bsi_statements 
FOR SELECT TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.auth_clerk_users acu
    WHERE acu.clerk_user_id = (auth.jwt() ->> 'sub')
    AND (
      acu.personal_role = 'admin' 
      OR (
        acu.personal_role = 'balance_sheet_investor' 
        AND bsi_statements.auth_clerk_users_id = acu.id
      )
    )
  )
);

-- bsi_transactions_deals policy
DROP POLICY IF EXISTS "Users can view transaction deal allocations" ON public.bsi_transactions_deals;
CREATE POLICY "Users can view transaction deal allocations" 
ON public.bsi_transactions_deals 
FOR SELECT TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.auth_clerk_users acu
    WHERE acu.clerk_user_id = (auth.jwt() ->> 'sub')
    AND (
      acu.personal_role = 'admin'
      OR EXISTS (
        SELECT 1 FROM public.bsi_transactions t
        WHERE t.id = bsi_transactions_deals.transaction_id
        AND t.clerk_user_id = acu.id
      )
    )
  )
);

-- bsi_transactions_instruments policy
DROP POLICY IF EXISTS "Users can view transaction instrument allocations" ON public.bsi_transactions_instruments;
CREATE POLICY "Users can view transaction instrument allocations" 
ON public.bsi_transactions_instruments 
FOR SELECT TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.auth_clerk_users acu
    WHERE acu.clerk_user_id = (auth.jwt() ->> 'sub')
    AND (
      acu.personal_role = 'admin'
      OR EXISTS (
        SELECT 1 FROM public.bsi_transactions t
        WHERE t.id = bsi_transactions_instruments.transaction_id
        AND t.clerk_user_id = acu.id
      )
    )
  )
);

-- bsi_transactions_document_files policies
DROP POLICY IF EXISTS "Users can link documents to their transactions" ON public.bsi_transactions_document_files;
CREATE POLICY "Users can link documents to their transactions" 
ON public.bsi_transactions_document_files 
FOR INSERT TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.auth_clerk_users acu
    JOIN public.bsi_transactions t ON t.clerk_user_id = acu.id
    WHERE acu.clerk_user_id = (auth.jwt() ->> 'sub')
    AND t.id = bsi_transactions_document_files.transaction_id
    AND (acu.personal_role = 'admin' OR acu.personal_role = 'balance_sheet_investor')
  )
);

DROP POLICY IF EXISTS "Users can unlink their documents" ON public.bsi_transactions_document_files;
CREATE POLICY "Users can unlink their documents" 
ON public.bsi_transactions_document_files 
FOR DELETE TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.auth_clerk_users acu
    JOIN public.bsi_transactions t ON t.clerk_user_id = acu.id
    WHERE acu.clerk_user_id = (auth.jwt() ->> 'sub')
    AND t.id = bsi_transactions_document_files.transaction_id
    AND (acu.personal_role = 'admin' OR acu.personal_role = 'balance_sheet_investor')
  )
);

DROP POLICY IF EXISTS "Users can view documents for their transactions" ON public.bsi_transactions_document_files;
CREATE POLICY "Users can view documents for their transactions" 
ON public.bsi_transactions_document_files 
FOR SELECT TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.auth_clerk_users acu
    WHERE acu.clerk_user_id = (auth.jwt() ->> 'sub')
    AND (
      acu.personal_role = 'admin'
      OR EXISTS (
        SELECT 1 FROM public.bsi_transactions t
        WHERE t.id = bsi_transactions_document_files.transaction_id
        AND t.clerk_user_id = acu.id
      )
    )
  )
);

-- =============================================================================
-- DOCUMENTATION
-- =============================================================================
-- 
-- SCHEMA AFTER THIS MIGRATION:
--
-- auth_clerk_users:
--   personal_role: text (user's default role when not in org context)
--
-- auth_clerk_orgs_members:
--   clerk_org_role: enum (admin/member/viewer) - coarse org privilege
--   clerk_member_role: text - functional role within this org
--
-- USAGE:
--   get_effective_role()      → returns personal_role
--   get_effective_role(123)   → returns clerk_member_role for org 123
--   has_role('admin')         → checks personal_role
--   has_role('admin', 123)    → checks clerk_member_role in org 123
--
-- =============================================================================
