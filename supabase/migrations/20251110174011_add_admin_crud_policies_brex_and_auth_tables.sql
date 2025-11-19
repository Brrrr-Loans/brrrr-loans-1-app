-- Migration: Add admin CRUD policies for Brex tables and auth tables
-- Updates auth.is_admin() helper function and adds admin policies using it

-- ============================================================================
-- Create helper function to check if current user is admin
-- Note: Creating in public schema since auth schema requires elevated privileges
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth_clerk_users acu
    WHERE acu.clerk_user_id = (auth.jwt() ->> 'sub'::text)
    AND acu.role = 'admin'::user_role_internal
  );
$$;

-- ============================================================================
-- RLS Policies for api_brex_vendors
-- ============================================================================

CREATE POLICY "Admins can manage vendors" ON "public"."api_brex_vendors"
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ============================================================================
-- RLS Policies for api_brex_vendors_clerk_users
-- ============================================================================

CREATE POLICY "Admins can manage vendor-user matches" ON "public"."api_brex_vendors_clerk_users"
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ============================================================================
-- RLS Policies for api_brex_vendors_clerk_orgs
-- ============================================================================

CREATE POLICY "Admins can manage vendor-org matches" ON "public"."api_brex_vendors_clerk_orgs"
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ============================================================================
-- RLS Policies for auth_clerk_users
-- ============================================================================

CREATE POLICY "Admins can manage users" ON "public"."auth_clerk_users"
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ============================================================================
-- RLS Policies for auth_clerk_orgs
-- ============================================================================

CREATE POLICY "Admins can manage orgs" ON "public"."auth_clerk_orgs"
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

