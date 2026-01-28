-- Migration: Stage 2 - Function, Index, Sequence, and Comment Sync
-- Date: 2026-01-28
-- Description:
--   2.1 Fix check_deal_allocation_sum() function (use allocation_amount, PROD validation logic)
--   2.2 Sync indexes between DEV and PROD
--   2.3 Fix sequence naming (DEV to match PROD)
--   2.4 Add security comments to functions

-- ============================================================================
-- 2.1 Fix check_deal_allocation_sum() Function
-- ============================================================================
-- Issues fixed:
--   - Uses correct column name: allocation_amount (not "amount" which doesn't exist)
--   - Uses PROD validation logic: allows partial allocations (sum <= transaction amount)
--   - Keeps improved DELETE handling from DEV
--   - Proper schema prefixes for table references

CREATE OR REPLACE FUNCTION public.check_deal_allocation_sum()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
    total_allocated DECIMAL(15,2);
    transaction_total DECIMAL(15,2);
BEGIN
    IF TG_OP = 'DELETE' THEN
        -- For DELETE, use OLD record
        SELECT COALESCE(SUM(allocation_amount), 0) INTO total_allocated
        FROM public.bsi_transactions_deals
        WHERE transaction_id = OLD.transaction_id;

        SELECT transaction_amount INTO transaction_total
        FROM public.bsi_transactions
        WHERE id = OLD.transaction_id;
    ELSE
        -- For INSERT/UPDATE, use NEW record
        SELECT COALESCE(SUM(allocation_amount), 0) INTO total_allocated
        FROM public.bsi_transactions_deals
        WHERE transaction_id = NEW.transaction_id;

        SELECT transaction_amount INTO transaction_total
        FROM public.bsi_transactions
        WHERE id = NEW.transaction_id;
    END IF;

    -- Validate: total allocations cannot exceed transaction amount
    -- Note: Using ABS() to handle negative transaction amounts (contributions)
    IF total_allocated > ABS(transaction_total) THEN
        RAISE EXCEPTION 'Total deal allocations (%) cannot exceed transaction amount (%)', 
            total_allocated, ABS(transaction_total);
    END IF;

    -- Return appropriate record based on operation
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$;

COMMENT ON FUNCTION public.check_deal_allocation_sum() IS 
'Trigger function to validate deal allocations do not exceed transaction amount. Security: search_path fixed on 2025-11-18.';

-- ============================================================================
-- 2.2 Sync Indexes
-- ============================================================================
-- Add indexes that exist in PROD but not in DEV

CREATE INDEX IF NOT EXISTS idx_bsi_distributions_transactions_distribution_id 
ON public.bsi_distributions_transactions(distribution_id);

CREATE INDEX IF NOT EXISTS idx_bsi_distributions_transactions_transaction_id 
ON public.bsi_distributions_transactions(transaction_id);

CREATE INDEX IF NOT EXISTS idx_bsi_statements_transactions_statement_id 
ON public.bsi_statements_transactions(statement_id);

CREATE INDEX IF NOT EXISTS idx_bsi_statements_transactions_transaction_id 
ON public.bsi_statements_transactions(transaction_id);

-- Note: idx_transactions_clerk_org_id already created in migration 20260128000001

-- ============================================================================
-- 2.3 Fix Sequence Naming (DEV only)
-- ============================================================================
-- DEV has: bsi_deals_orgs_id_seq
-- PROD has: bsi_deals_clerk_orgs_id_seq
-- Rename DEV sequence to match PROD naming convention

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_sequences 
        WHERE schemaname = 'public' 
          AND sequencename = 'bsi_deals_orgs_id_seq'
    ) THEN
        ALTER SEQUENCE public.bsi_deals_orgs_id_seq 
        RENAME TO bsi_deals_clerk_orgs_id_seq;
        RAISE NOTICE 'Sequence bsi_deals_orgs_id_seq renamed to bsi_deals_clerk_orgs_id_seq';
    ELSE
        RAISE NOTICE 'Sequence bsi_deals_orgs_id_seq does not exist (PROD or already renamed)';
    END IF;
END $$;

-- ============================================================================
-- 2.4 Add Security Comments to Functions (PROD alignment)
-- ============================================================================
-- Add comments to PROD functions that are missing the security notation
-- These comments document when search_path was fixed for security

COMMENT ON FUNCTION public.format_address(text, text, text, text, text, text) IS 
'Format address with 6 parameters. Security: search_path fixed on 2025-11-18.';

COMMENT ON FUNCTION public.format_address(text, text, text, text, text, text, text) IS 
'Format address with 7 parameters including PO Box. Security: search_path fixed on 2025-11-18.';

COMMENT ON FUNCTION public.format_deal_name(bigint) IS 
'Format deal name from property address. Security: search_path fixed on 2025-11-18.';

COMMENT ON FUNCTION public.get_complete_schema() IS 
'Returns complete schema information as JSON. Security: search_path fixed on 2025-11-18.';

COMMENT ON FUNCTION public.handle_deal_changes() IS 
'Trigger function to update deal_name when property changes. Security: search_path fixed on 2025-11-18.';

COMMENT ON FUNCTION public.update_property_address() IS 
'Trigger function to format and update property address. Security: search_path fixed on 2025-11-18.';

COMMENT ON FUNCTION public.user_has_transaction_access(bigint) IS 
'Check if current user has access to a specific transaction. Used for access control. Security: search_path fixed on 2025-11-18.';

COMMENT ON FUNCTION public.count_pending_brex_transfer_syncs() IS 
'Returns the count of Brex transfers that are matched to vendors but have not yet been synced to bsi_transactions. Security: search_path fixed on 2025-11-18.';

COMMENT ON FUNCTION public.sync_matched_api_brex_transfers_to_bsi_transactions() IS 
'Syncs matched Brex transfers to bsi_transactions. Uses ABS() for transaction_amount since the table requires positive values. Direction is captured via ledger_entry_type: negative Brex amounts = contribution, positive = distribution.';

-- ============================================================================
-- Verification queries (run manually to confirm)
-- ============================================================================
-- -- 2.1 Verify function uses allocation_amount
-- SELECT prosrc LIKE '%allocation_amount%' as uses_correct_column
-- FROM pg_proc WHERE proname = 'check_deal_allocation_sum';

-- -- 2.2 Verify indexes exist
-- SELECT indexname FROM pg_indexes 
-- WHERE schemaname = 'public' 
--   AND indexname IN (
--     'idx_bsi_distributions_transactions_distribution_id',
--     'idx_bsi_distributions_transactions_transaction_id',
--     'idx_bsi_statements_transactions_statement_id',
--     'idx_bsi_statements_transactions_transaction_id',
--     'idx_transactions_clerk_org_id'
--   );

-- -- 2.3 Verify sequence name
-- SELECT sequencename FROM pg_sequences 
-- WHERE schemaname = 'public' AND sequencename = 'bsi_deals_clerk_orgs_id_seq';
