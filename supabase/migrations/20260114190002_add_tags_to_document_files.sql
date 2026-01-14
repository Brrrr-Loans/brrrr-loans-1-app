-- Migration: Add tags column to document_files
-- 
-- Adds a TEXT[] array column for storing user-defined document tags.
-- Tags can be added/removed inline in the documents table UI.

-- Add the tags column
ALTER TABLE public.document_files
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Create a GIN index for efficient tag searches
CREATE INDEX IF NOT EXISTS idx_document_files_tags 
ON public.document_files USING GIN (tags);

-- Add comment
COMMENT ON COLUMN public.document_files.tags IS 'User-defined tags for categorizing documents';
