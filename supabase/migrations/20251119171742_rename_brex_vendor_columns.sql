-- Migration: Rename api_brex_vendors columns to reflect actual data nesting
-- Fixes misleading column names that don't reflect the actual API structure

-- ============================================================================
-- 1. Rename address columns to reflect payment_account nesting
-- ============================================================================

-- These addresses come from payment_accounts[0].address[0], not the vendor directly
ALTER TABLE public.api_brex_vendors 
  RENAME COLUMN address_line1 TO payment_account_address_line1;

ALTER TABLE public.api_brex_vendors 
  RENAME COLUMN address_line2 TO payment_account_address_line2;

ALTER TABLE public.api_brex_vendors 
  RENAME COLUMN city TO payment_account_city;

ALTER TABLE public.api_brex_vendors 
  RENAME COLUMN state TO payment_account_state;

ALTER TABLE public.api_brex_vendors 
  RENAME COLUMN postal_code TO payment_account_postal_code;

ALTER TABLE public.api_brex_vendors 
  RENAME COLUMN country TO payment_account_country;

-- ============================================================================
-- 2. Rename account_type to clarify it's the bank account type
-- ============================================================================

-- Prevents confusion with payment types or other account classifications
ALTER TABLE public.api_brex_vendors 
  RENAME COLUMN account_type TO bank_account_type;

-- ============================================================================
-- 3. Add comments to document the data structure
-- ============================================================================

COMMENT ON COLUMN public.api_brex_vendors.payment_account_address_line1 IS 
'Address line 1 from payment_accounts[0].address[0] in Brex API response';

COMMENT ON COLUMN public.api_brex_vendors.payment_account_address_line2 IS 
'Address line 2 from payment_accounts[0].address[0] in Brex API response';

COMMENT ON COLUMN public.api_brex_vendors.bank_account_type IS 
'Bank account type (CHECKING, SAVINGS, etc.) from payment_accounts[0].details.account_type';

COMMENT ON COLUMN public.api_brex_vendors.vendor_type IS 
'Not provided by Brex API. Reserved for manual categorization (e.g., supplier, contractor, landlord)';

COMMENT ON COLUMN public.api_brex_vendors.payment_instrument_id IS 
'Brex payment instrument ID from payment_accounts[0].details.payment_instrument_id';

-- ============================================================================
-- Validation
-- ============================================================================

DO $$
BEGIN
    -- Verify columns were renamed
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'api_brex_vendors'
        AND column_name = 'payment_account_address_line1'
    ) THEN
        RAISE EXCEPTION 'Column rename failed: payment_account_address_line1 not found';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'api_brex_vendors'
        AND column_name = 'bank_account_type'
    ) THEN
        RAISE EXCEPTION 'Column rename failed: bank_account_type not found';
    END IF;
    
    RAISE NOTICE 'Successfully renamed 7 columns in api_brex_vendors to reflect actual data structure';
END $$;

