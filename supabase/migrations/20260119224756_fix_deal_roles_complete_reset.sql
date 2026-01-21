-- =============================================================================
-- Migration: Complete reset of deal_roles and deal_guarantors RLS policies
-- =============================================================================
-- This migration drops ALL policies and recreates them from scratch with
-- proper SECURITY DEFINER functions that truly bypass RLS.
-- =============================================================================

-- =============================================================================
-- STEP 1: Drop ALL dependent policies FIRST (before dropping functions)
-- =============================================================================

-- Drop policies that depend on user_has_deal_role function
DROP POLICY IF EXISTS "Users can view deal guarantors for their deals" ON public.deal_guarantors;
DROP POLICY IF EXISTS "Users can view their assigned deals" ON public.deal;
DROP POLICY IF EXISTS "Users can view document links for their deals" ON public.document_files_deals;
DROP POLICY IF EXISTS "Users view deal_guarantors via role" ON public.deal_guarantors;
DROP POLICY IF EXISTS "Users view deals via role" ON public.deal;

-- =============================================================================
-- STEP 2: Now drop the helper functions
-- =============================================================================

DROP FUNCTION IF EXISTS public.user_has_deal_role(bigint);
DROP FUNCTION IF EXISTS public.user_has_deal_role_internal(bigint, bigint);

-- =============================================================================
-- STEP 3: Drop ALL existing policies on deal_roles
-- =============================================================================

DROP POLICY IF EXISTS "Users can view their deal roles" ON public.deal_roles;
DROP POLICY IF EXISTS "Users can view their own deal roles" ON public.deal_roles;
DROP POLICY IF EXISTS "Admin can manage deal_roles" ON public.deal_roles;
DROP POLICY IF EXISTS "Admins can manage deal roles" ON public.deal_roles;
DROP POLICY IF EXISTS "deal_roles_select_authenticated" ON public.deal_roles;
DROP POLICY IF EXISTS "deal_roles_select_policy" ON public.deal_roles;
DROP POLICY IF EXISTS "Admin full access deal_roles" ON public.deal_roles;
DROP POLICY IF EXISTS "Users view own deal_roles" ON public.deal_roles;

-- =============================================================================
-- STEP 4: Drop more policies on deal_guarantors
-- =============================================================================

DROP POLICY IF EXISTS "Admin can manage deal_guarantors" ON public.deal_guarantors;
DROP POLICY IF EXISTS "Admins can manage deal guarantors" ON public.deal_guarantors;
DROP POLICY IF EXISTS "Admin full access deal_guarantors" ON public.deal_guarantors;

-- =============================================================================
-- STEP 5: Create a proper SECURITY DEFINER function using PL/pgSQL
-- =============================================================================
-- Using PL/pgSQL (not SQL) for more reliable row_security = off behavior

CREATE OR REPLACE FUNCTION public.check_user_deal_role(p_deal_id bigint)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
DECLARE
  v_user_id bigint;
  v_has_role boolean;
BEGIN
  -- Get current user's internal ID
  SELECT id INTO v_user_id
  FROM public.auth_clerk_users
  WHERE clerk_user_id = (SELECT auth.jwt() ->> 'sub');
  
  IF v_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if user has any role on this deal
  SELECT EXISTS (
    SELECT 1 FROM public.deal_roles
    WHERE deal_id = p_deal_id
    AND auth_clerk_users_id = v_user_id
  ) INTO v_has_role;
  
  RETURN v_has_role;
END;
$$;

COMMENT ON FUNCTION public.check_user_deal_role IS 
  'Checks if user has any role on a deal. Uses SECURITY DEFINER + row_security=off to bypass RLS.';

GRANT EXECUTE ON FUNCTION public.check_user_deal_role TO authenticated;

-- =============================================================================
-- STEP 6: Create simple, non-recursive policies for deal_roles
-- =============================================================================

-- Admin full access
CREATE POLICY "Admin full access deal_roles"
ON public.deal_roles
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Users can only see their OWN deal role entries (no self-join, no recursion)
CREATE POLICY "Users view own deal_roles"
ON public.deal_roles
FOR SELECT TO authenticated
USING (
  auth_clerk_users_id = (
    SELECT id FROM public.auth_clerk_users 
    WHERE clerk_user_id = (SELECT auth.jwt() ->> 'sub')
    LIMIT 1
  )
);

-- =============================================================================
-- STEP 7: Create simple policies for deal_guarantors
-- =============================================================================

-- Admin full access
CREATE POLICY "Admin full access deal_guarantors"
ON public.deal_guarantors
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Users can view guarantors for deals they have a role on
CREATE POLICY "Users view deal_guarantors via role"
ON public.deal_guarantors
FOR SELECT TO authenticated
USING (public.check_user_deal_role(deal_id));

-- =============================================================================
-- STEP 8: Recreate the deal policy using the helper function
-- =============================================================================

-- Admin full access (should already exist, but ensure it's there)
DROP POLICY IF EXISTS "Admin full access to deals" ON public.deal;
CREATE POLICY "Admin full access to deals"
ON public.deal
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Users can view deals they have a role on
CREATE POLICY "Users view deals via role"
ON public.deal
FOR SELECT TO authenticated
USING (public.check_user_deal_role(id));

-- =============================================================================
-- STEP 9: Recreate document_files_deals policy
-- =============================================================================

-- Users can view document links for deals they have a role on
CREATE POLICY "Users view document_files_deals via role"
ON public.document_files_deals
FOR SELECT TO authenticated
USING (public.check_user_deal_role(deal_id));

-- =============================================================================
-- DOCUMENTATION
-- =============================================================================
-- 
-- KEY CHANGES:
-- 1. Dropped ALL existing policies to ensure clean slate
-- 2. Created check_user_deal_role() using PL/pgSQL (not SQL) for better control
-- 3. The function uses row_security = off which completely bypasses RLS
-- 4. deal_roles policy is SIMPLE: just checks if user's ID matches the row
-- 5. deal_guarantors and deal policies use the helper function
-- 
-- WHY PL/pgSQL instead of SQL?
-- - PL/pgSQL functions with SECURITY DEFINER + row_security = off more reliably
--   bypass RLS because PostgreSQL evaluates the entire function body in the
--   definer's context with RLS disabled
-- - SQL functions are sometimes inlined which can cause unexpected RLS behavior
-- =============================================================================
