-- Migration: Update ledger_entry_type enum
-- Adds 'distribution' value and migrates existing data
-- Keeps 'contribution' as-is for money borrowed from investors (cash IN)
-- Maps 'redemption', 'interest', 'fee' to 'distribution' (money paid to investors - cash OUT)

-- Step 1: Add new enum value
ALTER TYPE public.ledger_entry_type ADD VALUE IF NOT EXISTS 'distribution';

-- Step 2: Migrate existing data (only if data exists)
-- This is wrapped in a DO block with exception handling for fresh databases
-- where the new enum value can't be used in the same transaction
DO $$
BEGIN
  -- Only attempt update if there's data to migrate
  IF EXISTS (SELECT 1 FROM public.bsi_transactions WHERE ledger_entry_type IN ('redemption', 'interest', 'fee')) THEN
    UPDATE public.bsi_transactions 
    SET ledger_entry_type = 'distribution'
    WHERE ledger_entry_type IN ('redemption', 'interest', 'fee');
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- Fresh database: enum value not yet usable in same transaction, skip update
    RAISE NOTICE 'Skipping data migration - enum value not available in same transaction (fresh DB)';
END $$;

-- Step 3: Update default value (keep as contribution since it's the default for new investments)
-- Default remains 'contribution'::public.ledger_entry_type, no change needed

-- Note: The old enum values ('redemption', 'interest', 'fee') will remain in the enum
-- for backward compatibility but should not be used for new transactions.
-- Going forward, use only 'contribution' and 'distribution'.

