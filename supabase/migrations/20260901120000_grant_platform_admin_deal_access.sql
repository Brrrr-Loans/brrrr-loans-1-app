-- Grant Chris Lesnik and Aaron Kraut internal-admin flags so is_admin() /
-- is_internal_admin() RLS (personal_role = 'admin' AND is_internal_yn = true)
-- allows full CRUD. Empty Clerk public_metadata plus a webhook that wrote a
-- nonexistent `role` column left these principals looking like external
-- investors. Do not treat every @brrrr.com address as an admin.

UPDATE public.auth_clerk_users
SET
  personal_role = 'admin',
  is_internal_yn = true,
  updated_at = now()
WHERE clerk_user_id IN (
  'user_36T4CPKX3NzzDtWTdpQIPBQsijN',
  'user_36SyenOL3VUjantAyBmwVbrKbYX'
);

-- Keep RLS true for these principals even if a later webhook demotes the row.
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.auth_clerk_users
    WHERE clerk_user_id = public.get_clerk_user_id()
      AND (
        (personal_role = 'admin' AND is_internal_yn = true)
        OR clerk_user_id IN (
          'user_36T4CPKX3NzzDtWTdpQIPBQsijN',
          'user_36SyenOL3VUjantAyBmwVbrKbYX'
        )
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.is_internal_admin() RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $$
  SELECT public.is_admin();
$$;

COMMENT ON FUNCTION public.is_admin() IS
  'True when the JWT user is an internal admin (personal_role=admin AND is_internal_yn) or a known platform principal.';

COMMENT ON FUNCTION public.is_internal_admin() IS
  'Alias of is_admin().';
