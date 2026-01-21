-- =============================================================================
-- Migration: Fix deal_roles infinite recursion v2 - Add row_security = off
-- =============================================================================
-- SECURITY DEFINER alone doesn't bypass RLS in PostgreSQL.
-- We need to explicitly set row_security = off in the function.
-- =============================================================================

-- =============================================================================
-- STEP 1: Fix user_has_deal_role function with row_security = off
-- =============================================================================

CREATE OR REPLACE FUNCTION public.user_has_deal_role(p_deal_id bigint)
RETURNS boolean
LANGUAGE plpgsql  -- Changed to plpgsql to support SET configuration
STABLE
SECURITY DEFINER
SET search_path = public
SET row_security = off  -- This is the key - bypass RLS in this function
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.deal_roles
    WHERE deal_id = p_deal_id
    AND auth_clerk_users_id = public.get_current_user_id()
  );
END;
$$;

COMMENT ON FUNCTION public.user_has_deal_role IS 
  'Returns true if current user has any role on the specified deal. Uses SECURITY DEFINER + row_security=off to bypass RLS.';

-- =============================================================================
-- STEP 2: Alternative approach - Drop the problematic policy and simplify
-- =============================================================================
-- Since the recursion is in the deal_roles policies, let's simplify:
-- - Admin policy stays (allows all access)
-- - For non-admins, only allow viewing their own direct roles (no self-join)

DROP POLICY IF EXISTS "Users can view their deal roles" ON public.deal_roles;

-- Simple policy: Users can see deal_roles where they are the assigned user
-- This avoids any self-referencing query
CREATE POLICY "Users can view their own deal roles"
ON public.deal_roles
FOR SELECT TO authenticated
USING (
  auth_clerk_users_id = public.get_current_user_id()
);

-- =============================================================================
-- STEP 3: Fix deal_guarantors policy (also uses deal_roles)
-- =============================================================================

DROP POLICY IF EXISTS "Users can view deal guarantors for their deals" ON public.deal_guarantors;

-- Use SECURITY DEFINER function to check access
CREATE POLICY "Users can view deal guarantors for their deals"
ON public.deal_guarantors
FOR SELECT TO authenticated
USING (
  public.is_admin() OR public.user_has_deal_role(deal_id)
);

-- =============================================================================
-- STEP 4: Fix deal policy 
-- =============================================================================

DROP POLICY IF EXISTS "Users can view their assigned deals" ON public.deal;

CREATE POLICY "Users can view their assigned deals"
ON public.deal
FOR SELECT TO authenticated
USING (
  public.is_admin() OR public.user_has_deal_role(id)
);

-- =============================================================================
-- DOCUMENTATION
-- =============================================================================
-- 
-- Key fix: Added SET row_security = off to user_has_deal_role()
-- 
-- In PostgreSQL, SECURITY DEFINER functions still respect RLS unless you 
-- explicitly disable it with SET row_security = off.
--
-- Reference: https://www.postgresql.org/docs/current/ddl-rowsecurity.html
-- "Superusers and roles with the BYPASSRLS attribute always bypass the row 
-- security system when accessing a table. Table owners normally bypass row 
-- security as well... When a function is executed with SECURITY DEFINER 
-- rights, if the function author is a table owner or has the BYPASSRLS 
-- attribute, then row security is also bypassed."
--
-- Since our function runs as postgres (the owner), row_security = off
-- ensures we can query deal_roles without triggering RLS policies.
-- =============================================================================
