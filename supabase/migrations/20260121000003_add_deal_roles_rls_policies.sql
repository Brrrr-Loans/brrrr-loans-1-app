-- =============================================================================
-- Migration: Add RLS Policies to deal_roles Table
-- =============================================================================
-- Issue: Supabase Security Advisor flagged deal_roles as having RLS enabled
-- but no policies defined.
--
-- Context: The deal_roles table assigns roles (borrower, broker, loan processor,
-- etc.) to contacts/users for specific deals. It is used in:
--   - src/app/actions/deals.ts for creating deals and checking permissions
--   - Deal permission checks for update/delete operations
--
-- Solution: Add comprehensive RLS policies that:
--   1. Allow internal admins full access
--   2. Allow users to view/manage roles for deals they have access to
--   3. Allow users to see roles where they are assigned
-- =============================================================================

-- Drop existing policies first (idempotent)
DROP POLICY IF EXISTS "deal_roles_admin_all" ON public.deal_roles;
DROP POLICY IF EXISTS "deal_roles_select_own" ON public.deal_roles;
DROP POLICY IF EXISTS "deal_roles_insert_own" ON public.deal_roles;
DROP POLICY IF EXISTS "deal_roles_update_own" ON public.deal_roles;
DROP POLICY IF EXISTS "deal_roles_delete_own" ON public.deal_roles;

-- Policy 1: Internal admins have full access
CREATE POLICY "deal_roles_admin_all" ON public.deal_roles
  FOR ALL TO authenticated
  USING (is_internal_admin())
  WITH CHECK (is_internal_admin());

-- Policy 2: Users can view deal roles for deals they have access to
CREATE POLICY "deal_roles_select_own" ON public.deal_roles
  FOR SELECT TO authenticated
  USING (
    -- User has access to this deal via bsi_deals_clerk_users
    EXISTS (
      SELECT 1 FROM bsi_deals_clerk_users bdcu
      WHERE bdcu.deal_id = deal_roles.deal_id
      AND bdcu.clerk_user_id = get_current_user_id()
    )
    OR
    -- User is the one assigned to this role
    auth_clerk_users_id = get_current_user_id()
  );

-- Policy 3: Users can insert deal roles for deals they have access to
CREATE POLICY "deal_roles_insert_own" ON public.deal_roles
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bsi_deals_clerk_users bdcu
      WHERE bdcu.deal_id = deal_roles.deal_id
      AND bdcu.clerk_user_id = get_current_user_id()
    )
  );

-- Policy 4: Users can update deal roles for deals they have access to
CREATE POLICY "deal_roles_update_own" ON public.deal_roles
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bsi_deals_clerk_users bdcu
      WHERE bdcu.deal_id = deal_roles.deal_id
      AND bdcu.clerk_user_id = get_current_user_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bsi_deals_clerk_users bdcu
      WHERE bdcu.deal_id = deal_roles.deal_id
      AND bdcu.clerk_user_id = get_current_user_id()
    )
  );

-- Policy 5: Users can delete deal roles for deals they have access to
CREATE POLICY "deal_roles_delete_own" ON public.deal_roles
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bsi_deals_clerk_users bdcu
      WHERE bdcu.deal_id = deal_roles.deal_id
      AND bdcu.clerk_user_id = get_current_user_id()
    )
  );

-- Add table comment
COMMENT ON TABLE public.deal_roles IS 
  'Assigns roles (borrower, broker, loan processor, etc.) to contacts/users for specific deals. Used for permission checks on deal operations.';
