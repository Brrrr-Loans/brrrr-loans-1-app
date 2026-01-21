-- =============================================================================
-- Migration: Rename Tables and Views for Consistency
-- =============================================================================
-- Naming conventions:
--   Views: prefix with "view_"
--   User preference tables: prefix with "user_pref_" (already in place) or standardize
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Rename Views (add "view_" prefix)
-- -----------------------------------------------------------------------------

-- Rename document_categories_with_order → view_document_categories_user_order
ALTER VIEW IF EXISTS public.document_categories_with_order 
  RENAME TO view_document_categories_user_order;

-- Rename transaction_documents_view → view_transaction_documents
ALTER VIEW IF EXISTS public.transaction_documents_view 
  RENAME TO view_transaction_documents;

-- Rename storage_objects_view → view_storage_objects
ALTER VIEW IF EXISTS public.storage_objects_view 
  RENAME TO view_storage_objects;

-- -----------------------------------------------------------------------------
-- 2. Rename Tables
-- -----------------------------------------------------------------------------

-- Rename user_pref_document_categories_order → user_pref_document_categories_order
-- Note: This appears to be renaming to "vdocument_categories_user_order" per request
-- If this is a typo, please update accordingly
ALTER TABLE IF EXISTS public.user_pref_document_categories_order 
  RENAME TO user_pref_document_categories_order_new;

-- Actually rename to the requested name
ALTER TABLE IF EXISTS public.user_pref_document_categories_order_new 
  RENAME TO vdocument_categories_user_order;

-- -----------------------------------------------------------------------------
-- 3. Update any references in RLS policies
-- -----------------------------------------------------------------------------

-- Drop and recreate policy for renamed table
DROP POLICY IF EXISTS "user_pref_doc_cat_order_own" ON public.vdocument_categories_user_order;

CREATE POLICY "user_pref_doc_cat_order_own" ON public.vdocument_categories_user_order
FOR ALL TO authenticated
USING (clerk_user_id = public.get_clerk_user_id())
WITH CHECK (clerk_user_id = public.get_clerk_user_id());

-- -----------------------------------------------------------------------------
-- 4. Recreate view with new table name reference
-- -----------------------------------------------------------------------------

-- Drop the renamed view (we'll recreate it with updated table reference)
DROP VIEW IF EXISTS public.view_document_categories_user_order;

-- Recreate view with correct table reference
CREATE OR REPLACE VIEW public.view_document_categories_user_order AS
SELECT 
  dc.id,
  dc.code,
  dc.name,
  dc.description,
  dc.storage_folder,
  dc.icon,
  dc.is_internal_only,
  COALESCE(udco.display_order, dc.default_display_order) AS display_order,
  CASE WHEN udco.id IS NOT NULL THEN true ELSE false END AS is_custom_order
FROM document_categories dc
LEFT JOIN vdocument_categories_user_order udco 
  ON dc.id = udco.document_categories_id 
  AND udco.clerk_user_id = public.get_clerk_user_id()
WHERE dc.is_active = true
ORDER BY COALESCE(udco.display_order, dc.default_display_order);

COMMENT ON VIEW public.view_document_categories_user_order IS 
  'Document categories with user-specific display order (falls back to system default)';

GRANT SELECT ON public.view_document_categories_user_order TO authenticated;

-- -----------------------------------------------------------------------------
-- 5. Add comments for documentation
-- -----------------------------------------------------------------------------

COMMENT ON TABLE public.vdocument_categories_user_order IS 
  'Per-user custom display order for document categories (drag-and-drop reordering)';
