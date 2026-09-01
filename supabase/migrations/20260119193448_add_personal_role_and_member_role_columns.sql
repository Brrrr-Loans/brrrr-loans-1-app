-- =============================================================================
-- Migration: Add Personal Role and Member Role Columns
-- =============================================================================
-- This migration implements the proper role scoping pattern:
--   1. personal_role (on auth_clerk_users) - Role when user is NOT in an org context
--   2. member_role (on auth_clerk_orgs_members) - Role within a specific org
--
-- The authorization function branches on org_id presence:
--   - org_id present → use member_role
--   - org_id null → use personal_role
-- =============================================================================

-- =============================================================================
-- 1. RENAME auth_clerk_users.role → personal_role
-- =============================================================================

-- Rename the column if the old name is still present.
DO $$
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
END $$;

-- Update the comment
COMMENT ON COLUMN public.auth_clerk_users.personal_role IS 
  'User role when NOT in an org context (personal scope). Values: admin, account_executive, loan_processor, balance_sheet_investor, loan_opener';

-- =============================================================================
-- 2. ADD member_role to auth_clerk_orgs_members
-- =============================================================================

-- Add the column (nullable to allow gradual migration)
ALTER TABLE public.auth_clerk_orgs_members 
  ADD COLUMN IF NOT EXISTS member_role public.user_role_internal;

COMMENT ON COLUMN public.auth_clerk_orgs_members.member_role IS 
  'Functional role within this specific org. Different from clerk_org_role which is coarse privilege (admin/member/viewer). Values: admin, account_executive, loan_processor, balance_sheet_investor, loan_opener';

-- Create index for common queries
CREATE INDEX IF NOT EXISTS idx_auth_clerk_orgs_members_member_role 
  ON public.auth_clerk_orgs_members(member_role);

-- =============================================================================
-- 3. CREATE get_effective_role() FUNCTION
-- =============================================================================
-- This function returns the user's role based on context:
--   - If org_id is provided: returns member_role from that org (no fallback)
--   - If org_id is null: returns personal_role from auth_clerk_users

CREATE OR REPLACE FUNCTION public.get_effective_role(p_org_id bigint DEFAULT NULL)
RETURNS public.user_role_internal
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role public.user_role_internal;
  v_clerk_user_id text;
BEGIN
  -- Get current user's Clerk ID
  v_clerk_user_id := public.get_clerk_user_id();
  
  IF v_clerk_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  IF p_org_id IS NOT NULL THEN
    -- Org context: use member_role (NO fallback)
    SELECT com.member_role INTO v_role
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
  'Returns user role based on context. If org_id provided, returns member_role for that org. If null, returns personal_role.';

GRANT EXECUTE ON FUNCTION public.get_effective_role TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_effective_role TO anon;

-- =============================================================================
-- 4. CREATE has_role() HELPER FUNCTION
-- =============================================================================
-- Convenience function to check if user has a specific role in a context

CREATE OR REPLACE FUNCTION public.has_role(
  p_role public.user_role_internal,
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

-- =============================================================================
-- 5. UPDATE is_internal_admin() TO USE NEW COLUMN NAME
-- =============================================================================
-- This function is used throughout the codebase, update it to use personal_role

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
-- 6. UPDATE is_admin() IF IT EXISTS
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
-- 7. DOCUMENTATION
-- =============================================================================
-- 
-- USAGE EXAMPLES:
--
-- 1. Check user's role in personal context:
--    SELECT get_effective_role();  -- Returns personal_role
--
-- 2. Check user's role in org context:
--    SELECT get_effective_role(123);  -- Returns member_role for org 123
--
-- 3. Check if user is admin (personal scope):
--    SELECT has_role('admin');
--
-- 4. Check if user is account_executive in org 456:
--    SELECT has_role('account_executive', 456);
--
-- ROLE HIERARCHY:
--   - clerk_org_role (admin/member/viewer): Coarse org privilege gate
--   - member_role: Functional role within org (e.g., loan_processor)
--   - personal_role: Role when not in org context
--
-- =============================================================================
