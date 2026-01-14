-- Migration: Drop deprecated columns and tables
-- Part of document system consolidation (Phase 1E)
--
-- This migration MUST run AFTER:
-- 1. Junction tables are created (migration 20260114180002)
-- 2. transaction_documents_view is updated (migration 20260114180004)
--
-- Safe to run because:
-- - document_files table currently has no data
-- - document_investors table data is not needed (user confirmed OK to lose)

---------------------------------------------------------------
-- Drop FK constraints from document_files
-- These must be dropped before dropping the columns
---------------------------------------------------------------
ALTER TABLE public.document_files DROP CONSTRAINT IF EXISTS documents_deal_id_fkey;
ALTER TABLE public.document_files DROP CONSTRAINT IF EXISTS documents_borrower_id_fkey;
ALTER TABLE public.document_files DROP CONSTRAINT IF EXISTS documents_property_id_fkey;
ALTER TABLE public.document_files DROP CONSTRAINT IF EXISTS documents_guarantor_id_fkey;
ALTER TABLE public.document_files DROP CONSTRAINT IF EXISTS documents_entity_id_fkey;

---------------------------------------------------------------
-- Drop deprecated FK columns from document_files
-- (Now handled by junction tables)
---------------------------------------------------------------
ALTER TABLE public.document_files DROP COLUMN IF EXISTS deal_id;
ALTER TABLE public.document_files DROP COLUMN IF EXISTS borrower_id;
ALTER TABLE public.document_files DROP COLUMN IF EXISTS property_id;
ALTER TABLE public.document_files DROP COLUMN IF EXISTS guarantor_id;
ALTER TABLE public.document_files DROP COLUMN IF EXISTS entity_id;

---------------------------------------------------------------
-- Drop deprecated file location columns
-- (Replaced by storage_bucket + storage_path)
---------------------------------------------------------------
ALTER TABLE public.document_files DROP COLUMN IF EXISTS file_path;
ALTER TABLE public.document_files DROP COLUMN IF EXISTS file_url;

---------------------------------------------------------------
-- Drop deprecated document_investors table
-- (Replaced by document_files_clerk_orgs and document_files_clerk_users)
---------------------------------------------------------------

-- First drop RLS policies
DROP POLICY IF EXISTS "Authenticated users can view document_investors" ON public.document_investors;
DROP POLICY IF EXISTS "Authenticated users can insert document_investors" ON public.document_investors;
DROP POLICY IF EXISTS "Authenticated users can update document_investors" ON public.document_investors;
DROP POLICY IF EXISTS "Authenticated users can delete document_investors" ON public.document_investors;

-- Drop indexes
DROP INDEX IF EXISTS public.idx_document_investors_path;
DROP INDEX IF EXISTS public.idx_document_investors_investor;

-- Drop the table
DROP TABLE IF EXISTS public.document_investors;

---------------------------------------------------------------
-- Add NOT NULL constraints to new storage columns
-- (Optional - only if you want to enforce these going forward)
---------------------------------------------------------------
-- Uncomment these if you want to require storage columns:
-- ALTER TABLE public.document_files ALTER COLUMN storage_bucket SET NOT NULL;
-- ALTER TABLE public.document_files ALTER COLUMN storage_path SET NOT NULL;
