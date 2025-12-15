-- ============================================================
-- OPTIMIZE AUTH HELPER FUNCTIONS
-- Replace auth.jwt() with (select auth.jwt()) to force
-- the planner to evaluate once per query, not per row
-- ============================================================

-- 1. Optimize get_clerk_user_id()
CREATE OR REPLACE FUNCTION public.get_clerk_user_id()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (select auth.jwt()) ->> 'sub',
    (select auth.jwt()) ->> 'user_id'
  );
$$;

-- 2. Optimize is_admin()
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.auth_clerk_users acu
    WHERE acu.clerk_user_id = ((select auth.jwt()) ->> 'sub'::text)
    AND acu.role = 'admin'::public.user_role_internal
  );
$$;

-- 3. Optimize is_internal_admin() - already uses get_clerk_user_id() which is now optimized
-- But let's also set search_path for security
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
    AND role = 'admin'
    AND is_internal_yn = true
  );
$$;

