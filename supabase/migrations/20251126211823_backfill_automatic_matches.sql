-- Migration: Backfill automatic matches into junction table
-- Populate api_brex_transfers_vendors with existing automatic matches
-- where transfer.counterparty_id = vendor.brex_vendor_id

INSERT INTO api_brex_transfers_vendors (
    brex_transfer_id, 
    brex_vendor_id, 
    match_method,
    created_at
)
SELECT DISTINCT
    t.brex_transfer_id,
    v.id,
    'automatic',
    NOW()
FROM api_brex_transfers t
JOIN api_brex_vendors v ON v.brex_vendor_id = t.counterparty_id
WHERE t.counterparty_id IS NOT NULL
  -- Don't override existing matches (manual or automatic)
  AND NOT EXISTS (
    SELECT 1 FROM api_brex_transfers_vendors atv 
    WHERE atv.brex_transfer_id = t.brex_transfer_id
  )
-- If somehow there's a duplicate, keep existing record
ON CONFLICT (brex_transfer_id) DO NOTHING;

-- Log the result
DO $$
DECLARE
    v_count bigint;
BEGIN
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RAISE NOTICE 'Backfilled % automatic matches', v_count;
END $$;

