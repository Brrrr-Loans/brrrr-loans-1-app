-- =============================================================================
-- Migration: Rename member_role and change personal_role to text
-- =============================================================================
-- 1. Rename member_role → clerk_member_role
-- 2. Change personal_role from enum to text
-- 3. Recreate dependent RLS policies
-- =============================================================================

-- =============================================================================
-- 1. RENAME member_role → clerk_member_role
-- =============================================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'auth_clerk_orgs_members'
      AND column_name = 'member_role'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'auth_clerk_orgs_members'
      AND column_name = 'clerk_member_role'
  ) THEN
    ALTER TABLE public.auth_clerk_orgs_members
      RENAME COLUMN member_role TO clerk_member_role;
  END IF;
END $$;

-- Update comment
COMMENT ON COLUMN public.auth_clerk_orgs_members.clerk_member_role IS 
  'Functional role within this specific org. Different from clerk_org_role which is coarse privilege (admin/member/viewer). Example values: admin, account_executive, loan_processor, balance_sheet_investor, loan_opener, broker, borrower';

-- Recreate index with new name
DROP INDEX IF EXISTS idx_auth_clerk_orgs_members_member_role;
CREATE INDEX IF NOT EXISTS idx_auth_clerk_orgs_members_clerk_member_role 
  ON public.auth_clerk_orgs_members(clerk_member_role);

-- =============================================================================
-- 2. DROP DEPENDENT RLS POLICIES (they reference personal_role enum)
-- =============================================================================

DROP POLICY IF EXISTS "Balance sheet investors can insert their own statements" ON public.bsi_statements;
DROP POLICY IF EXISTS "Balance sheet investors can select their statements" ON public.bsi_statements;
DROP POLICY IF EXISTS "Users can view transaction deal allocations" ON public.bsi_transactions_deals;
DROP POLICY IF EXISTS "Users can view transaction instrument allocations" ON public.bsi_transactions_instruments;
DROP POLICY IF EXISTS "Users can link documents to their transactions" ON public.bsi_transactions_document_files;
DROP POLICY IF EXISTS "Users can unlink their documents" ON public.bsi_transactions_document_files;
DROP POLICY IF EXISTS "Users can view documents for their transactions" ON public.bsi_transactions_document_files;

-- =============================================================================
-- 3. CHANGE personal_role from enum to text
-- =============================================================================

DO $$
DECLARE
  role_type text;
BEGIN
  SELECT c.data_type INTO role_type
  FROM information_schema.columns c
  WHERE c.table_schema = 'public'
    AND c.table_name = 'auth_clerk_users'
    AND c.column_name = 'personal_role';

  IF role_type IS DISTINCT FROM 'text' AND role_type IS NOT NULL THEN
    ALTER TABLE public.auth_clerk_users
      ADD COLUMN IF NOT EXISTS personal_role_text text;

    UPDATE public.auth_clerk_users
      SET personal_role_text = personal_role::text
      WHERE personal_role IS NOT NULL;

    ALTER TABLE public.auth_clerk_users
      DROP COLUMN IF EXISTS personal_role CASCADE;

    ALTER TABLE public.auth_clerk_users
      RENAME COLUMN personal_role_text TO personal_role;
  ELSIF role_type IS NULL THEN
    ALTER TABLE public.auth_clerk_users
      ADD COLUMN personal_role text;
  END IF;
END $$;

-- Update comment
COMMENT ON COLUMN public.auth_clerk_users.personal_role IS 
  'User role when NOT in an org context (personal scope). Example values: admin, account_executive, loan_processor, balance_sheet_investor, loan_opener, borrower, broker';

-- =============================================================================
-- 3. UPDATE get_effective_role() to use new column name
-- =============================================================================

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
  -- Get current user's Clerk ID
  v_clerk_user_id := public.get_clerk_user_id();
  
  IF v_clerk_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  IF p_org_id IS NOT NULL THEN
    -- Org context: use clerk_member_role (NO fallback)
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

-- =============================================================================
-- 4. UPDATE is_internal_admin() to use text column
-- =============================================================================

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

-- =============================================================================
-- 5. UPDATE is_admin() to use text column
-- =============================================================================

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
-- 6. RECREATE RLS POLICIES (using text comparison instead of enum)
-- =============================================================================

-- bsi_statements policies
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
