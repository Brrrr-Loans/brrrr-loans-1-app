-- =============================================================================
-- Migration: Fix deal_roles infinite recursion in RLS policy
-- =============================================================================
-- The policy "Users can view their deal roles" caused infinite recursion
-- because it queried deal_roles from within its own policy.
-- 
-- Solution: Create a SECURITY DEFINER helper function that bypasses RLS
-- to check deal membership, then use it in the policy.
-- =============================================================================

-- =============================================================================
-- STEP 1: Create helper function with SECURITY DEFINER to bypass RLS
-- =============================================================================

CREATE OR REPLACE FUNCTION public.user_has_deal_role(p_deal_id bigint)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.deal_roles
    WHERE deal_id = p_deal_id
    AND auth_clerk_users_id = public.get_current_user_id()
  );
$$;

COMMENT ON FUNCTION public.user_has_deal_role IS 
  'Returns true if current user has any role on the specified deal. Uses SECURITY DEFINER to bypass RLS.';

GRANT EXECUTE ON FUNCTION public.user_has_deal_role TO authenticated;

-- =============================================================================
-- STEP 2: Drop the recursive policy
-- =============================================================================

DROP POLICY IF EXISTS "Users can view their deal roles" ON public.deal_roles;

-- =============================================================================
-- STEP 3: Create new non-recursive policy
-- =============================================================================
-- Users can view deal_roles if:
-- 1. They are the user assigned to that role (direct ownership), OR
-- 2. They have ANY role on the same deal (checked via helper function)

CREATE POLICY "Users can view their deal roles"
ON public.deal_roles
FOR SELECT TO authenticated
USING (
  -- Direct ownership - user is the one assigned to this role
  auth_clerk_users_id = public.get_current_user_id()
  OR
  -- User has any role on this deal (checked via SECURITY DEFINER function)
  public.user_has_deal_role(deal_id)
);

-- =============================================================================
-- STEP 4: Fix deal_guarantors policy which also references deal_roles
-- =============================================================================
-- The policy "Users can view deal guarantors for their deals" also queries 
-- deal_roles and may cause recursion issues

DROP POLICY IF EXISTS "Users can view deal guarantors for their deals" ON public.deal_guarantors;

CREATE POLICY "Users can view deal guarantors for their deals"
ON public.deal_guarantors
FOR SELECT TO authenticated
USING (
  public.user_has_deal_role(deal_id)
);

-- =============================================================================
-- STEP 5: Ensure the deal table has proper policies for external users
-- =============================================================================
-- Check if there's a policy allowing users to see deals they're assigned to

DROP POLICY IF EXISTS "Users can view their assigned deals" ON public.deal;

CREATE POLICY "Users can view their assigned deals"
ON public.deal
FOR SELECT TO authenticated
USING (
  public.is_admin()
  OR
  public.user_has_deal_role(id)
);

-- =============================================================================
-- DOCUMENTATION
-- =============================================================================
-- 
-- This migration fixes the "infinite recursion detected in policy for relation 
-- 'deal_roles'" error by:
--
-- 1. Creating user_has_deal_role(deal_id) - A SECURITY DEFINER function that
--    can query deal_roles without triggering RLS policies.
--
-- 2. Rewriting the "Users can view their deal roles" policy to use the helper
--    function instead of a direct subquery.
--
-- 3. Fixing similar issues in deal_guarantors policy.
--
-- 4. Adding a deal viewing policy that uses the same pattern.
--
-- The SECURITY DEFINER approach is safe because:
-- - The function still validates the current user via get_current_user_id()
-- - It only returns a boolean (true/false), not actual row data
-- - It's scoped to a specific deal_id
-- =============================================================================
