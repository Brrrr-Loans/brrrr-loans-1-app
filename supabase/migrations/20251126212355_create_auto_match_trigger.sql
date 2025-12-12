-- Migration: Create trigger to automatically match transfers to vendors
-- When a transfer is inserted/updated with a counterparty_id that matches a vendor,
-- automatically create a junction table record

CREATE OR REPLACE FUNCTION auto_match_transfer_to_vendor()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- If the transfer has a counterparty_id, try to match it to a vendor
    IF NEW.counterparty_id IS NOT NULL THEN
        -- Insert automatic match if vendor exists
        INSERT INTO api_brex_transfers_vendors (
            brex_transfer_id,
            brex_vendor_id,
            match_method,
            created_at
        )
        SELECT 
            NEW.brex_transfer_id,
            v.id,
            'automatic',
            NOW()
        FROM api_brex_vendors v
        WHERE v.brex_vendor_id = NEW.counterparty_id
        -- Only insert if no match exists yet (don't override manual matches)
        AND NOT EXISTS (
            SELECT 1 FROM api_brex_transfers_vendors atv
            WHERE atv.brex_transfer_id = NEW.brex_transfer_id
        )
        ON CONFLICT (brex_transfer_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger on INSERT and UPDATE (drop first in case it exists from earlier migration)
DROP TRIGGER IF EXISTS auto_match_transfer_to_vendor_trigger ON api_brex_transfers;
CREATE TRIGGER auto_match_transfer_to_vendor_trigger
    AFTER INSERT OR UPDATE ON api_brex_transfers
    FOR EACH ROW
    EXECUTE FUNCTION auto_match_transfer_to_vendor();

-- Add comment
COMMENT ON FUNCTION auto_match_transfer_to_vendor() IS 
'Automatically creates junction table records for transfers with matching counterparty_id. Does not override existing manual matches.';

