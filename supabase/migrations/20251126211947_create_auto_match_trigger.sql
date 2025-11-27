-- Migration: Create trigger to automatically match transfers to vendors
-- When new transfers are synced from Brex API, automatically create junction records
-- for transfers that have a matching counterparty_id

-- Create trigger function
CREATE OR REPLACE FUNCTION auto_match_transfer_to_vendor()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Only auto-match if counterparty_id is present
    IF NEW.counterparty_id IS NOT NULL THEN
        -- Try to find matching vendor and create junction record
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
        LIMIT 1
        -- Don't override existing matches (manual takes precedence)
        ON CONFLICT (brex_transfer_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger on INSERT and UPDATE
CREATE TRIGGER auto_match_transfer_to_vendor_trigger
    AFTER INSERT OR UPDATE OF counterparty_id ON api_brex_transfers
    FOR EACH ROW
    EXECUTE FUNCTION auto_match_transfer_to_vendor();

-- Add comment
COMMENT ON FUNCTION auto_match_transfer_to_vendor() IS 
'Automatically creates junction table records for transfers with matching counterparty_id when synced from Brex API. Manual matches take precedence (ON CONFLICT DO NOTHING).';

