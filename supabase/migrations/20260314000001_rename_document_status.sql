-- ============================================================================
-- Migration: Drop document_status ENUM, rename document_statuses table
-- ============================================================================
-- Step 1: Drop dependent view
-- Step 2: Convert document_files.document_status column from ENUM to TEXT
-- Step 3: Recreate the view
-- Step 4: Drop the document_status ENUM type
-- Step 5: Rename document_statuses table to document_status
-- ============================================================================

-- Step 1: Drop the dependent view
DROP VIEW IF EXISTS public.view_transaction_documents;

-- Step 2: Convert document_files.document_status from ENUM to TEXT
ALTER TABLE public.document_files
  ALTER COLUMN document_status TYPE text
  USING document_status::text;

-- Step 3: Recreate the view (now uses text column)
CREATE OR REPLACE VIEW public.view_transaction_documents
  WITH (security_invoker = true) AS
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

COMMENT ON VIEW public.view_transaction_documents IS
  'Joins transaction document files with document metadata. SECURITY INVOKER ensures RLS is enforced for the calling user.';

-- Step 4: Drop the ENUM type (now unused)
DROP TYPE IF EXISTS public.document_status;

-- Step 5: Rename the table
ALTER TABLE public.document_statuses RENAME TO document_status;

-- Step 6: Rename constraints and indexes to match new table name
ALTER TABLE public.document_status
  RENAME CONSTRAINT document_statuses_pkey TO document_status_pkey;

ALTER INDEX IF EXISTS document_statuses_code_global_uniq
  RENAME TO document_status_code_global_uniq;

ALTER INDEX IF EXISTS document_statuses_code_org_uniq
  RENAME TO document_status_code_org_uniq;

ALTER INDEX IF EXISTS document_statuses_org_display_idx
  RENAME TO document_status_org_display_idx;

ALTER INDEX IF EXISTS idx_document_statuses_single_default
  RENAME TO idx_document_status_single_default;
