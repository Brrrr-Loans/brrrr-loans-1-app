-- Migration: Rename bsi_transactions.notes to external_memo
-- This change has already been applied to the remote database
-- This migration documents the change for consistency

-- Rename column from notes to external_memo (if it exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'bsi_transactions' 
    AND column_name = 'notes'
  ) THEN
    ALTER TABLE public.bsi_transactions 
    RENAME COLUMN notes TO external_memo;
  END IF;
END $$;


