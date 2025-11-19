-- Migration: Add helper function to count pending Brex transfer syncs
-- Function: count_pending_brex_transfer_syncs

CREATE OR REPLACE FUNCTION count_pending_brex_transfer_syncs()
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_count bigint;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM api_brex_transfers at
    WHERE at.counterparty_id IS NOT NULL
    AND (
        EXISTS (
            SELECT 1 FROM api_brex_vendors av
            JOIN api_brex_vendors_clerk_users avcu ON avcu.brex_vendor_id = av.id
            WHERE av.brex_vendor_id = at.counterparty_id
        )
        OR EXISTS (
            SELECT 1 FROM api_brex_vendors av
            JOIN api_brex_vendors_clerk_orgs avco ON avco.brex_vendor_id = av.id
            WHERE av.brex_vendor_id = at.counterparty_id
        )
    )
    AND NOT EXISTS (
        SELECT 1 FROM bsi_transactions_api_brex_transfers btbt
        WHERE btbt.brex_transfer_id = at.brex_transfer_id
    );
    
    RETURN v_count;
END;
$$;

GRANT EXECUTE ON FUNCTION count_pending_brex_transfer_syncs() TO service_role;

COMMENT ON FUNCTION count_pending_brex_transfer_syncs() IS 
'Returns the count of Brex transfers that are matched to vendors but have not yet been synced to bsi_transactions.';

