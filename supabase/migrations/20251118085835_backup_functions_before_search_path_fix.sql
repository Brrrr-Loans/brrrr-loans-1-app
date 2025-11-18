-- Migration: Backup current function definitions before applying search_path security fixes
-- This creates a safety net for rollback if needed

-- Create a temporary table to store function backups
CREATE TABLE IF NOT EXISTS _function_backups_20251118 (
    function_name text PRIMARY KEY,
    function_definition text NOT NULL,
    backed_up_at timestamp with time zone DEFAULT NOW()
);

-- Backup all 10 functions that will be modified
INSERT INTO _function_backups_20251118 (function_name, function_definition)
VALUES
    ('get_complete_schema', pg_get_functiondef('public.get_complete_schema()'::regprocedure)),
    ('handle_deal_changes', pg_get_functiondef('public.handle_deal_changes()'::regprocedure)),
    ('check_deal_allocation_sum', pg_get_functiondef('public.check_deal_allocation_sum()'::regprocedure)),
    ('format_deal_name', pg_get_functiondef('public.format_deal_name(bigint)'::regprocedure)),
    ('update_property_address', pg_get_functiondef('public.update_property_address()'::regprocedure)),
    ('format_address_7param', pg_get_functiondef('public.format_address(text, text, text, text, text, text, text)'::regprocedure)),
    ('format_address_6param', pg_get_functiondef('public.format_address(text, text, text, text, text, text)'::regprocedure)),
    ('sync_matched_api_brex_transfers_to_bsi_transactions', pg_get_functiondef('public.sync_matched_api_brex_transfers_to_bsi_transactions()'::regprocedure)),
    ('count_pending_brex_transfer_syncs', pg_get_functiondef('public.count_pending_brex_transfer_syncs()'::regprocedure)),
    ('is_admin', pg_get_functiondef('public.is_admin()'::regprocedure))
ON CONFLICT (function_name) DO NOTHING;

-- Validate that all required tables exist in public schema
DO $$
DECLARE
    missing_tables text[];
BEGIN
    SELECT ARRAY_AGG(table_name)
    INTO missing_tables
    FROM (
        SELECT unnest(ARRAY[
            'auth_clerk_users',
            'auth_clerk_orgs',
            'api_brex_transfers',
            'api_brex_vendors',
            'api_brex_vendors_clerk_users',
            'api_brex_vendors_clerk_orgs',
            'bsi_transactions',
            'bsi_transactions_investors',
            'bsi_transactions_deals',
            'bsi_transactions_api_brex_transfers',
            'bsi_deals',
            'property'
        ]) AS table_name
    ) required_tables
    WHERE NOT EXISTS (
        SELECT 1 FROM pg_tables
        WHERE schemaname = 'public' AND tablename = required_tables.table_name
    );
    
    IF missing_tables IS NOT NULL AND array_length(missing_tables, 1) > 0 THEN
        RAISE EXCEPTION 'Missing required tables in public schema: %', array_to_string(missing_tables, ', ');
    END IF;
    
    RAISE NOTICE 'Pre-flight validation passed: All required tables exist';
END $$;

-- Add comment
COMMENT ON TABLE _function_backups_20251118 IS 
'Backup of function definitions before applying search_path security fixes on 2025-11-18. Used for rollback if needed.';

-- Grant access to authenticated users to view backups (for debugging)
GRANT SELECT ON _function_backups_20251118 TO authenticated;

