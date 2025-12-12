-- Debug function to see JWT claims
CREATE OR REPLACE FUNCTION public.debug_jwt_claims()
RETURNS TABLE(claim_name text, claim_value text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT 'sub', auth.jwt() ->> 'sub'
  UNION ALL
  SELECT 'user_id', auth.jwt() ->> 'user_id'
  UNION ALL
  SELECT 'role', auth.jwt() ->> 'role'
  UNION ALL
  SELECT 'email', auth.jwt() ->> 'email'
  UNION ALL
  SELECT 'aud', auth.jwt() ->> 'aud'
  UNION ALL
  SELECT 'get_clerk_user_id()', get_clerk_user_id()
  UNION ALL
  SELECT 'is_internal_admin()', is_internal_admin()::text;
$$;

-- Grant access to authenticated users
GRANT EXECUTE ON FUNCTION public.debug_jwt_claims() TO authenticated;
GRANT EXECUTE ON FUNCTION public.debug_jwt_claims() TO anon;
