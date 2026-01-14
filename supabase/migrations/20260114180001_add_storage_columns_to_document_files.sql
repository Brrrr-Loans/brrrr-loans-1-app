-- Migration: Add storage_bucket and storage_path columns to document_files
-- Part of document system consolidation (Phase 1A)

-- Add storage bucket column
ALTER TABLE public.document_files 
ADD COLUMN IF NOT EXISTS storage_bucket TEXT;

-- Add storage path column
ALTER TABLE public.document_files 
ADD COLUMN IF NOT EXISTS storage_path TEXT;

-- Add unique constraint on storage location (prevents duplicate file references)
-- Only applies when both columns are NOT NULL
CREATE UNIQUE INDEX IF NOT EXISTS idx_document_files_storage_location 
ON public.document_files(storage_bucket, storage_path) 
WHERE storage_bucket IS NOT NULL AND storage_path IS NOT NULL;

-- Add index for efficient lookups by bucket
CREATE INDEX IF NOT EXISTS idx_document_files_bucket 
ON public.document_files(storage_bucket);

-- Add comments for documentation
COMMENT ON COLUMN public.document_files.storage_bucket IS 'Supabase storage bucket name (e.g., investors, transaction-documents)';
COMMENT ON COLUMN public.document_files.storage_path IS 'Full path within the storage bucket';
