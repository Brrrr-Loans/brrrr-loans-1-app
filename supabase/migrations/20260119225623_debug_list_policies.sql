-- =============================================================================
-- Debug helper: list active RLS policies for a table
-- =============================================================================
-- SECURITY DEFINER + row_security = off to inspect policies without RLS impact.
-- Remove after debugging.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.debug_list_policies(p_table text)
RETURNS TABLE (
  policyname text,
  cmd text,
  qual text,
  with_check text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_catalog
SET row_security = off
AS $$
  SELECT policyname, cmd, qual, with_check
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename = p_table
  ORDER BY policyname;
$$;

COMMENT ON FUNCTION public.debug_list_policies IS
  'Debug helper to list RLS policies for a table. Remove after debugging.';

GRANT EXECUTE ON FUNCTION public.debug_list_policies(text) TO authenticated;
