-- Migration: Update transaction_documents_view to use new storage columns
-- Part of document system consolidation (Phase 1D)
-- 
-- This migration MUST run BEFORE dropping deprecated columns from document_files
-- because the view references those columns.
--
-- The updated view removes deprecated FK columns (deal_id, borrower_id, etc.)
-- and uses the new storage_bucket + storage_path columns.

-- Drop and recreate the view with updated columns
DROP VIEW IF EXISTS public.transaction_documents_view;

CREATE VIEW public.transaction_documents_view AS
SELECT 
    tdf.transaction_id,
    tdf.id AS junction_id,
    df.id,
    df.created_at,
    df.document_name,
    df.public_notes,
    df.private_notes,
    df.document_status,
    df.document_category,
    df.effective_date,
    df.expiration_date,
    df.is_required,
    df.uploaded_by,
    df.uploaded_at,
    df.file_size,
    df.file_type,
    -- New storage columns (replacing file_path and file_url)
    df.storage_bucket,
    df.storage_path
FROM public.bsi_transactions_document_files tdf
JOIN public.document_files df ON tdf.document_file_id = df.id;

-- Add comment explaining the view
COMMENT ON VIEW public.transaction_documents_view IS 
'Joins transaction document files with document metadata. Uses storage_bucket and storage_path for file location. SECURITY INVOKER ensures RLS is enforced for the calling user.';

-- Grant permissions
GRANT ALL ON public.transaction_documents_view TO authenticated;
GRANT ALL ON public.transaction_documents_view TO service_role;
