-- =============================================================================
-- Migration: Complete fix for document_files RLS policies (drop all, recreate safely)
-- =============================================================================
-- This migration completely drops and recreates all document_files policies
-- to ensure there's no possibility of infinite recursion.
-- =============================================================================

-- =============================================================================
-- STEP 1: Drop ALL existing policies on document_files
-- =============================================================================
-- Drop every possible policy name that might exist

-- Admin policies
DROP POLICY IF EXISTS "Admin can delete documents" ON public.document_files;
DROP POLICY IF EXISTS "Admin can insert documents" ON public.document_files;
DROP POLICY IF EXISTS "Admin can select all documents" ON public.document_files;
DROP POLICY IF EXISTS "Admin can update documents" ON public.document_files;

-- User policies
DROP POLICY IF EXISTS "Users can select their own documents" ON public.document_files;
DROP POLICY IF EXISTS "Users view documents via deal permissions" ON public.document_files;

-- Any other policies that might exist
DROP POLICY IF EXISTS "document_files_select_policy" ON public.document_files;
DROP POLICY IF EXISTS "document_files_insert_policy" ON public.document_files;
DROP POLICY IF EXISTS "document_files_update_policy" ON public.document_files;
DROP POLICY IF EXISTS "document_files_delete_policy" ON public.document_files;

-- =============================================================================
-- STEP 2: Also drop and recreate the problematic document_files_deals policies
-- =============================================================================

DROP POLICY IF EXISTS "Admin can manage document_files_deals" ON public.document_files_deals;
DROP POLICY IF EXISTS "Users view document deal links via permissions" ON public.document_files_deals;
DROP POLICY IF EXISTS "Users insert document deal links via permissions" ON public.document_files_deals;

-- =============================================================================
-- STEP 3: Recreate ONLY simple, non-recursive policies for document_files
-- =============================================================================

-- Admin full access (uses is_admin() which only queries auth_clerk_users - safe)
CREATE POLICY "Admin full access to documents"
ON public.document_files
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Users can view their own uploaded documents (simple check - safe)
CREATE POLICY "Users can view own uploads"
ON public.document_files
FOR SELECT TO authenticated
USING (uploaded_by = (auth.jwt() ->> 'sub')::text);

-- =============================================================================
-- STEP 4: Recreate document_files_deals policies (simple, non-recursive)
-- =============================================================================

-- Admin full access
CREATE POLICY "Admin full access to document_deals"
ON public.document_files_deals
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- For non-admin users, use user_has_deal_role (which uses row_security=off)
-- This allows users to see document links for deals they have a role on
CREATE POLICY "Users can view document links for their deals"
ON public.document_files_deals
FOR SELECT TO authenticated
USING (public.user_has_deal_role(deal_id));

-- =============================================================================
-- STEP 5: Fix document_files_tags policy (it also queries document_files)
-- =============================================================================

DROP POLICY IF EXISTS "Users can read document_files_tags" ON public.document_files_tags;
DROP POLICY IF EXISTS "Admin can manage document_files_tags" ON public.document_files_tags;

-- Admin can manage all tags
CREATE POLICY "Admin manages document_files_tags"
ON public.document_files_tags
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Create a helper function to check document access without recursion
CREATE OR REPLACE FUNCTION public.user_can_access_document(p_document_file_id bigint)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
  SELECT 
    -- Check if user uploaded the document
    EXISTS (
      SELECT 1 FROM public.document_files df
      WHERE df.id = p_document_file_id
      AND df.uploaded_by = public.get_clerk_user_id()
    )
    OR
    -- Check if user has deal role for a deal linked to this document
    EXISTS (
      SELECT 1 FROM public.document_files_deals dfd
      JOIN public.deal_roles dr ON dr.deal_id = dfd.deal_id
      WHERE dfd.document_file_id = p_document_file_id
      AND dr.auth_clerk_users_id = public.get_current_user_id()
    );
$$;

COMMENT ON FUNCTION public.user_can_access_document IS 
  'Returns true if user can access the document (uploader or has deal role). Uses SECURITY DEFINER + row_security=off.';

GRANT EXECUTE ON FUNCTION public.user_can_access_document TO authenticated;

-- Users can read tags for documents they have access to
CREATE POLICY "Users can view tags for accessible docs"
ON public.document_files_tags
FOR SELECT TO authenticated
USING (public.user_can_access_document(document_file_id));

-- =============================================================================
-- STEP 6: Clean up unused helper functions from previous migration
-- =============================================================================

-- Drop the functions that are no longer needed (or have been superseded)
DROP FUNCTION IF EXISTS public.user_has_document_deal_access(bigint);
DROP FUNCTION IF EXISTS public.get_document_category_internal(bigint);

-- =============================================================================
-- DOCUMENTATION
-- =============================================================================
-- 
-- SAFE POLICIES (no recursion):
-- 
-- document_files:
--   - "Admin full access to documents" → is_admin() → queries auth_clerk_users only
--   - "Users can view own uploads" → uploaded_by = auth.jwt() → no table query
-- 
-- document_files_deals:
--   - "Admin full access to document_deals" → is_admin() → safe
--   - "Users can view document links for their deals" → user_has_deal_role() → 
--     has row_security=off so queries deal_roles safely
-- 
-- document_files_tags:
--   - "Admin manages document_files_tags" → is_admin() → safe
--   - "Users can view tags for accessible docs" → user_can_access_document() →
--     has row_security=off so queries document_files and document_files_deals safely
-- 
-- KEY INSIGHT: Any function that queries tables with RLS from within an RLS policy
-- MUST use SECURITY DEFINER + SET row_security = off to avoid recursion.
-- =============================================================================
