-- Migration: Update ledger_entry_type enum
-- Adds 'distribution' value and migrates existing data
-- Keeps 'contribution' as-is for money borrowed from investors (cash IN)
-- Maps 'redemption', 'interest', 'fee' to 'distribution' (money paid to investors - cash OUT)

-- Step 1: Add new enum value
ALTER TYPE public.ledger_entry_type ADD VALUE IF NOT EXISTS 'distribution';

-- Step 2: Migrate existing data
-- Keep 'contribution' as-is (no change needed)
-- Map redemption, interest, and fee to distribution
UPDATE public.bsi_transactions 
SET ledger_entry_type = 'distribution'
WHERE ledger_entry_type IN ('redemption', 'interest', 'fee');

-- Step 3: Update default value (keep as contribution since it's the default for new investments)
-- Default remains 'contribution'::public.ledger_entry_type, no change needed

-- Note: The old enum values ('redemption', 'interest', 'fee') will remain in the enum
-- for backward compatibility but should not be used for new transactions.
-- Going forward, use only 'contribution' and 'distribution'.

