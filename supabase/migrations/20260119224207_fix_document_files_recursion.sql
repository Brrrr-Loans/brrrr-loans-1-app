-- =============================================================================
-- Migration: Fix document_files infinite recursion in RLS policies
-- =============================================================================
-- PROBLEM: Circular dependency between document_files and document_files_deals policies
-- 
-- document_files policy queries document_files_deals:
--   EXISTS (SELECT 1 FROM document_files_deals WHERE document_file_id = document_files.id ...)
-- 
-- document_files_deals policy queries document_files:
--   (SELECT document_category FROM document_files WHERE id = document_file_id)
-- 
-- This creates infinite recursion!
-- 
-- FIX: Create a SECURITY DEFINER function that bypasses RLS to get document_category
-- =============================================================================

-- =============================================================================
-- STEP 1: Create helper function to get document category without triggering RLS
-- =============================================================================

CREATE OR REPLACE FUNCTION public.get_document_category_internal(p_document_file_id bigint)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
SET row_security = off  -- Bypass RLS to avoid recursion
AS $$
  SELECT document_category::text 
  FROM public.document_files 
  WHERE id = p_document_file_id;
$$;

COMMENT ON FUNCTION public.get_document_category_internal IS 
  'Returns document category for a document file, bypassing RLS to avoid recursion in policies';

GRANT EXECUTE ON FUNCTION public.get_document_category_internal TO authenticated;

-- =============================================================================
-- STEP 2: Drop the problematic policies
-- =============================================================================

DROP POLICY IF EXISTS "Users view documents via deal permissions" ON public.document_files;
DROP POLICY IF EXISTS "Users view document deal links via permissions" ON public.document_files_deals;
DROP POLICY IF EXISTS "Users insert document deal links via permissions" ON public.document_files_deals;

-- =============================================================================
-- STEP 3: Recreate the document_files_deals policies using the helper function
-- =============================================================================

-- Users can view document_files_deals links via deal permissions
CREATE POLICY "Users view document deal links via permissions" 
ON public.document_files_deals 
FOR SELECT TO authenticated 
USING (
  public.can_access_deal_document(
    deal_id, 
    public.get_document_category_internal(document_file_id),  -- Use helper function!
    'view'
  )
);

-- Users can insert document_files_deals links via deal permissions
CREATE POLICY "Users insert document deal links via permissions" 
ON public.document_files_deals 
FOR INSERT TO authenticated 
WITH CHECK (
  public.can_access_deal_document(
    deal_id,
    public.get_document_category_internal(document_file_id),  -- Use helper function!
    'insert'
  )
);

-- =============================================================================
-- STEP 4: Recreate the document_files policy with a SECURITY DEFINER helper
-- =============================================================================

-- Create a helper function to check if user has deal access to a document
CREATE OR REPLACE FUNCTION public.user_has_document_deal_access(p_document_id bigint)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
SET row_security = off  -- Bypass RLS to avoid recursion
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.document_files_deals dfd
    JOIN public.deal_roles dr ON dr.deal_id = dfd.deal_id
    JOIN public.auth_clerk_users acu ON dr.auth_clerk_users_id = acu.id
    JOIN public.document_access_permissions dap ON dr.deal_role_types_id = dap.deal_role_types_id
    JOIN public.document_categories dc ON dap.document_categories_id = dc.id
    JOIN public.document_files df ON df.id = dfd.document_file_id
    WHERE dfd.document_file_id = p_document_id
      AND acu.clerk_user_id = public.get_clerk_user_id()
      AND df.document_category::text = dc.code
      AND dap.can_view = true
  );
$$;

COMMENT ON FUNCTION public.user_has_document_deal_access IS 
  'Returns true if user can view a document via their deal roles. Uses SECURITY DEFINER + row_security=off to bypass RLS.';

GRANT EXECUTE ON FUNCTION public.user_has_document_deal_access TO authenticated;

-- Recreate the document_files policy using the helper function
CREATE POLICY "Users view documents via deal permissions" 
ON public.document_files 
FOR SELECT TO authenticated 
USING (
  public.user_has_document_deal_access(id)
);

-- =============================================================================
-- DOCUMENTATION
-- =============================================================================
-- 
-- This migration fixes the infinite recursion by:
-- 
-- 1. get_document_category_internal(document_file_id):
--    - Fetches document_category from document_files bypassing RLS
--    - Used by document_files_deals policies to avoid querying document_files with RLS
-- 
-- 2. user_has_document_deal_access(document_id):
--    - Checks if user has deal-based access to a document
--    - Runs with row_security=off to avoid triggering document_files_deals RLS
--    - Used by document_files policy
-- 
-- The key insight: SECURITY DEFINER + SET row_security = off allows the function
-- to query tables without triggering their RLS policies, breaking the recursion.
-- =============================================================================
