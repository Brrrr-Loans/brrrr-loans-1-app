-- =============================================================================
-- Migration: Change document_files.document_category from enum to foreign key
-- =============================================================================
-- This migration:
-- 1. Adds a new column document_category_id (bigint, FK to document_categories)
-- 2. Migrates existing enum values to FK references
-- 3. Drops the old enum column
-- 4. Renames new column to document_category_id
-- 5. Updates dependent functions and views
-- =============================================================================

-- =============================================================================
-- STEP 1: Add new FK column (idempotent)
-- =============================================================================
ALTER TABLE public.document_files 
  ADD COLUMN IF NOT EXISTS document_category_id bigint NULL;

-- Add foreign key constraint (check if exists first)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'document_files_document_category_id_fkey'
    AND table_name = 'document_files'
  ) THEN
    ALTER TABLE public.document_files 
      ADD CONSTRAINT document_files_document_category_id_fkey 
      FOREIGN KEY (document_category_id) 
      REFERENCES public.document_categories(id) 
      ON DELETE SET NULL;
  END IF;
END $$;

-- Add index for performance (idempotent)
CREATE INDEX IF NOT EXISTS idx_document_files_document_category_id 
  ON public.document_files(document_category_id);

-- =============================================================================
-- STEP 2: Migrate existing enum values to FK references (if column still exists)
-- =============================================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'document_files' 
    AND column_name = 'document_category'
    AND table_schema = 'public'
  ) THEN
    UPDATE public.document_files df
    SET document_category_id = dc.id
    FROM public.document_categories dc
    WHERE df.document_category::text = dc.code
      AND df.document_category IS NOT NULL;
  END IF;
END $$;

-- =============================================================================
-- STEP 3: Drop dependent views before dropping the column
-- =============================================================================
DROP VIEW IF EXISTS public.view_transaction_documents CASCADE;

-- =============================================================================
-- STEP 4: Drop the old enum column (if it still exists)
-- =============================================================================
ALTER TABLE public.document_files 
  DROP COLUMN IF EXISTS document_category;

-- =============================================================================
-- STEP 4: Update the can_access_deal_document function
-- =============================================================================
-- The function now accepts document_category_id instead of code
CREATE OR REPLACE FUNCTION public.can_access_deal_document(
  p_deal_id bigint,
  p_document_category_id bigint,
  p_action text DEFAULT 'view'  -- 'view', 'insert', 'upload', 'delete'
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    -- Admins can do everything
    public.is_internal_admin()
    OR
    -- Check if user has a deal role that grants access
    EXISTS (
      SELECT 1
      FROM public.deal_roles dr
      JOIN public.auth_clerk_users acu ON dr.auth_clerk_users_id = acu.id
      JOIN public.document_access_permissions dap ON dr.deal_role_types_id = dap.deal_role_types_id
      WHERE dr.deal_id = p_deal_id
        AND acu.clerk_user_id = public.get_clerk_user_id()
        AND dap.document_categories_id = p_document_category_id
        AND (
          (p_action = 'view' AND dap.can_view = true)
          OR (p_action = 'insert' AND dap.can_insert = true)
          OR (p_action = 'upload' AND dap.can_upload = true)
          OR (p_action = 'delete' AND dap.can_delete = true)
        )
    );
$$;

COMMENT ON FUNCTION public.can_access_deal_document(bigint, bigint, text) IS 
  'Check if current user can perform an action on a document category (by ID) for a specific deal';

-- Keep backward-compatible version that accepts category code
CREATE OR REPLACE FUNCTION public.can_access_deal_document(
  p_deal_id bigint,
  p_document_category_code text,
  p_action text DEFAULT 'view'
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.can_access_deal_document(
    p_deal_id, 
    (SELECT id FROM public.document_categories WHERE code = p_document_category_code),
    p_action
  );
$$;

COMMENT ON FUNCTION public.can_access_deal_document(bigint, text, text) IS 
  'Check if current user can perform an action on a document category (by code) for a specific deal - backward compatible';

GRANT EXECUTE ON FUNCTION public.can_access_deal_document(bigint, bigint, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_deal_document(bigint, text, text) TO authenticated;

-- =============================================================================
-- STEP 6: Recreate view_transaction_documents with new column
-- =============================================================================
CREATE OR REPLACE VIEW public.view_transaction_documents AS
SELECT 
  tdf.id,
  tdf.transaction_id,
  tdf.document_file_id,
  df.document_name,
  df.document_category_id,
  dc.code AS document_category_code,
  dc.name AS document_category_name,
  df.document_status,
  df.file_type,
  df.file_size,
  df.storage_bucket,
  df.storage_path,
  df.uploaded_at,
  df.uploaded_by,
  tdf.created_at
FROM public.bsi_transactions_document_files tdf
JOIN public.document_files df ON tdf.document_file_id = df.id
LEFT JOIN public.document_categories dc ON df.document_category_id = dc.id;

GRANT SELECT ON public.view_transaction_documents TO authenticated;
