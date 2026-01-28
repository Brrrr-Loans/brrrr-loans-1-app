-- Migration: Stage 1 - Table and Column Changes
-- Date: 2026-01-28
-- Description: 
--   1.1 Rename contacts_contact_types to contact_contact_types (PROD only)
--   1.2 Add clerk_org_id column to bsi_transactions (PROD only)
--   1.3 Remove positive_transaction_amount constraint (DEV only - already doesn't exist in PROD)

-- ============================================================================
-- 1.1 Rename Table (PROD only - table already named correctly in DEV)
-- ============================================================================
-- Check if old table name exists before renaming
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'contacts_contact_types'
    ) THEN
        ALTER TABLE public.contacts_contact_types RENAME TO contact_contact_types;
        RAISE NOTICE 'Table contacts_contact_types renamed to contact_contact_types';
    ELSE
        RAISE NOTICE 'Table contacts_contact_types does not exist (already renamed or on DEV)';
    END IF;
END $$;

-- ============================================================================
-- 1.2 Add clerk_org_id column to bsi_transactions (PROD only)
-- ============================================================================
-- Check if column already exists before adding
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'bsi_transactions' 
          AND column_name = 'clerk_org_id'
    ) THEN
        ALTER TABLE public.bsi_transactions 
        ADD COLUMN clerk_org_id bigint 
        REFERENCES public.auth_clerk_orgs(id);
        
        RAISE NOTICE 'Column clerk_org_id added to bsi_transactions';
    ELSE
        RAISE NOTICE 'Column clerk_org_id already exists in bsi_transactions';
    END IF;
END $$;

-- Create index for the new column (idempotent)
CREATE INDEX IF NOT EXISTS idx_transactions_clerk_org_id 
ON public.bsi_transactions(clerk_org_id);

-- ============================================================================
-- 1.3 Remove positive_transaction_amount constraint (DEV only)
-- ============================================================================
-- This constraint only exists in DEV - negative values are intentional for contributions
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_schema = 'public' 
          AND table_name = 'bsi_transactions' 
          AND constraint_name = 'positive_transaction_amount'
    ) THEN
        ALTER TABLE public.bsi_transactions 
        DROP CONSTRAINT positive_transaction_amount;
        RAISE NOTICE 'Constraint positive_transaction_amount removed from bsi_transactions';
    ELSE
        RAISE NOTICE 'Constraint positive_transaction_amount does not exist (PROD or already removed)';
    END IF;
END $$;

-- ============================================================================
-- Verification queries (run manually to confirm)
-- ============================================================================
-- SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contact_contact_types');
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'bsi_transactions' AND column_name = 'clerk_org_id';
-- SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'bsi_transactions' AND constraint_name = 'positive_transaction_amount';
