# Brex API Integration - Known Limitations

**Last Updated**: November 19, 2025  
**Brex API Version**: Payments API v1

## Overview

This document tracks known gaps between Brex API documentation and actual API responses, as well as fields that are not available via the API.

---

## Fields Not Available in API Responses

### 1. `fed_reference_number` (Transfers)

**Status**: ❌ Not Provided by Brex API  
**Documentation Says**: `counterparty.fed_reference_number` should exist for incoming wires  
**Reality**: Field is NOT present in any API responses (tested on 155 ACH/Wire transfers)

**Tested Transfer Types**:
- ✅ ACH (45 transfers) - No fed_reference_number
- ✅ DOMESTIC_WIRE (106 transfers) - No fed_reference_number  
- ✅ CHEQUE (4 transfers) - No fed_reference_number

**Tested Statuses**:
- PROCESSED (completed transfers) - No fed_reference_number
- PROCESSING (in-flight transfers) - No fed_reference_number

**Workaround**: 
- Column remains in `api_brex_transfers` table for future use
- Manual entry supported post-sync if needed
- Extraction code path is correct: `counterparty?.fed_reference_number`

**Investigation Needed**:
- Possibly only available for INCOMING transfers (not outgoing payments)
- May be timing-dependent (populated days after processing)
- May only be available via Brex UI/dashboard, not API
- Consider reaching out to Brex support for clarification

---

### 2. `vendor_type` (Vendors)

**Status**: ❌ Not Provided by Brex API  
**Documentation Says**: Not documented  
**Reality**: Brex does not categorize vendors by type in API

**Workaround**: 
- Column remains in `api_brex_vendors` for manual categorization
- Examples: "supplier", "contractor", "landlord", "utility"
- Can be populated via application logic or manual entry

---

### 3. Vendor-Level Address (Vendors)

**Status**: ⚠️ Unclear if Available  
**What We Get**: `payment_accounts[0].address[0]` (payment account address)  
**What We Don't Get**: Vendor company address (if different from payment account)

**Schema Updated**: Column names now reflect actual source
- `payment_account_address_line1` (not `address_line1`)
- `payment_account_address_line2` (not `address_line2`)
- etc.

---

### 4. Originating Account Name/Number (Transfers)

**Status**: ⚠️ Partial Data  
**What We Get**: `originating_account.id` and `originating_account.type`  
**What We Don't Get**: 
- `originating_account.name` - Always null
- `originating_account.account_number` - Always null

**Why This Matters**: Can identify which Brex account sent the transfer, but not human-readable details

**Workaround**: Use `display_name` field which often contains account info

---

### 5. Counterparty Name (Transfers)

**Status**: ⚠️ Inconsistent  
**Availability**:
- ✅ Available for VENDOR counterparties (via vendor lookup)
- ❌ Not available for BANK_ACCOUNT counterparties
- ❌ Not available for BOOK_TRANSFER counterparties

**Workaround**: 
- Use `display_name` field as fallback
- Can lookup vendor via `counterparty_id` to get vendor name

---

## Fields Conditionally Available

### 1. `cancellation_reason`

**When Available**: Only when `status = 'CANCELLED'` or `status = 'FAILED'`  
**Current Data**: 0/161 transfers (no cancelled transfers in current dataset)

### 2. `external_memo`

**When Available**: User-provided field, not always populated  
**Current Data**: Some transfers have this, depends on user input

---

## Data Structure Clarifications

### Nested Data in Vendors API

```
Vendor Response:
└── vendor
    ├── id (vendor_id)
    ├── company_name
    ├── email
    ├── phone
    └── payment_accounts[] (array)
        └── [0] (first payment account)
            ├── details
            │   ├── payment_instrument_id
            │   ├── routing_number
            │   ├── account_number
            │   ├── account_type (CHECKING, SAVINGS, etc.)
            │   └── account_class
            └── address[] (array)
                └── [0] (first address)
                    ├── line1
                    ├── line2
                    ├── city
                    ├── state
                    ├── postal_code
                    └── country
```

**Our Approach**: Extract data from first payment account's first address

---

### Nested Data in Transfers API

```
Transfer Response:
└── transfer
    ├── id (transfer_id)
    ├── amount { amount, currency }
    ├── status
    ├── payment_type
    ├── counterparty
    │   ├── id
    │   ├── type (VENDOR, BANK_ACCOUNT, BOOK_TRANSFER)
    │   ├── payment_instrument_id
    │   ├── routing_number
    │   ├── account_number
    │   └── fed_reference_number ❌ (documented but not returned)
    ├── originating_account
    │   ├── id
    │   ├── type (BREX_CASH, etc.)
    │   ├── name ❌ (not returned)
    │   └── account_number ❌ (not returned)
    └── external_memo
```

---

## Recommendations

### For Production Use

1. **Monitor for API Changes**: Brex may add these fields in future versions
2. **Save raw_payload**: Always store complete API response for future data extraction
3. **Manual Entry Option**: Provide UI for adding missing data post-sync
4. **Alternative Data Sources**: Some fields might be available via Brex UI/exports

### For Development

1. **Use display_name**: Often contains useful information that other fields don't
2. **Check raw_payload**: When in doubt, check the JSONB for unexpected data
3. **Document Assumptions**: Note which fields are Brex-provided vs manual

---

## Testing Checklist

When Brex updates their API:
- [ ] Check if `fed_reference_number` appears in responses
- [ ] Check if `vendor_type` becomes available
- [ ] Check if originating account details become available
- [ ] Update extraction code if new fields appear

---

## Related Files

- `src/lib/brex/client.ts` - TypeScript interfaces for Brex API
- `src/app/api/brex/sync-vendors/route.ts` - Vendor sync logic
- `src/app/api/brex/sync-transfers/route.ts` - Transfer sync logic
- `supabase/migrations/20251109161150_create_api_brex_vendors_tables.sql` - Original schema
- `supabase/migrations/20251119171742_rename_brex_vendor_columns.sql` - Column rename migration

---

## Contact

If you discover any of these fields become available or find alternative extraction paths, please update this document and the corresponding sync logic.

