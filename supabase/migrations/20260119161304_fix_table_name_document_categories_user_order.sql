-- =============================================================================
-- Migration: Fix Table Name (typo correction)
-- =============================================================================
-- Rename: vdocument_categories_user_order → document_categories_user_order
-- =============================================================================

-- 1. Rename the table
ALTER TABLE IF EXISTS public.vdocument_categories_user_order 
  RENAME TO document_categories_user_order;

-- 2. Drop and recreate RLS policy with correct table reference
DROP POLICY IF EXISTS "user_pref_doc_cat_order_own" ON public.document_categories_user_order;

CREATE POLICY "document_categories_user_order_own" ON public.document_categories_user_order
FOR ALL TO authenticated
USING (clerk_user_id = public.get_clerk_user_id())
WITH CHECK (clerk_user_id = public.get_clerk_user_id());

-- 3. Recreate view with correct table reference
DROP VIEW IF EXISTS public.view_document_categories_user_order;

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
LEFT JOIN document_categories_user_order udco 
  ON dc.id = udco.document_categories_id 
  AND udco.clerk_user_id = public.get_clerk_user_id()
WHERE dc.is_active = true
ORDER BY COALESCE(udco.display_order, dc.default_display_order);

COMMENT ON VIEW public.view_document_categories_user_order IS 
  'Document categories with user-specific display order (falls back to system default)';

GRANT SELECT ON public.view_document_categories_user_order TO authenticated;

-- 4. Update table comment
COMMENT ON TABLE public.document_categories_user_order IS 
  'Per-user custom display order for document categories (drag-and-drop reordering)';
