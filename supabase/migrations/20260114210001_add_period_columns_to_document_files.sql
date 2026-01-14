-- Migration: Add period_start and period_end columns to document_files
-- 
-- These columns track the date range covered by a document
-- (e.g., a monthly statement covers Nov 1 - Nov 30, 2025)

-- Add period_start column
ALTER TABLE public.document_files
ADD COLUMN IF NOT EXISTS period_start DATE;

-- Add period_end column  
ALTER TABLE public.document_files
ADD COLUMN IF NOT EXISTS period_end DATE;

-- Add index for efficient date range queries
CREATE INDEX IF NOT EXISTS idx_document_files_period 
ON public.document_files(period_start, period_end);

-- Add comments
COMMENT ON COLUMN public.document_files.period_start IS 'Start date of the period covered by this document (e.g., first day of statement period)';
COMMENT ON COLUMN public.document_files.period_end IS 'End date of the period covered by this document (e.g., last day of statement period)';
