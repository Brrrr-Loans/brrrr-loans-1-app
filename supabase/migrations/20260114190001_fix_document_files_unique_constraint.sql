-- Migration: Fix document_files unique constraint for upsert operations
-- 
-- The previous migration created a partial unique INDEX, but ON CONFLICT
-- requires a proper unique CONSTRAINT. This migration fixes that.

-- Drop the partial unique index (it doesn't work with ON CONFLICT)
DROP INDEX IF EXISTS public.idx_document_files_storage_location;

-- Create a proper unique constraint on storage_bucket and storage_path
-- This allows upsert operations with ON CONFLICT
ALTER TABLE public.document_files
ADD CONSTRAINT document_files_storage_bucket_storage_path_key 
UNIQUE (storage_bucket, storage_path);

-- Create a regular index for efficient lookups (non-unique, for query performance)
CREATE INDEX IF NOT EXISTS idx_document_files_storage_location 
ON public.document_files(storage_bucket, storage_path);
