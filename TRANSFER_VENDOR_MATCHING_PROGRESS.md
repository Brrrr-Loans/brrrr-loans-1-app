# Transfer-Vendor Manual Matching System

**Status:** Stage 1 & 2 Complete ✅ | Stage 3 Planned

---

## Problem Solved

Many Brex transfers (like #150) have `counterparty_id = NULL` or mismatched values, preventing them from syncing to `bsi_transactions` and appearing in the Investments/Distributions tables.

**Solution:** Manual matching system that links transfers to vendors via junction table, allowing admin to match any transfer to any vendor regardless of Brex API data quality.

---

## Architecture

```
api_brex_transfers (source from Brex API)
         ↓
api_brex_transfers_vendors (junction table - manual + automatic matches)
         ↓
api_brex_vendors (vendor records)
         ↓
api_brex_vendors_clerk_users/orgs (vendor → investor mapping)
         ↓
sync function → bsi_transactions (master transaction records)
         ↓
bsi_transactions_investors (investor allocations)
```

---

## Stage 1: Core Infrastructure ✅

**Created:**
1. **Junction Table:** `api_brex_transfers_vendors`
   - Links one transfer to one vendor (UNIQUE constraint on `brex_transfer_id`)
   - Supports both 'automatic' and 'manual' match methods
   - Admin-only RLS policies

2. **Updated Sync Function:** `sync_matched_api_brex_transfers_to_bsi_transactions()`
   - Queries transfers via junction table (not via `counterparty_id`)
   - Handles both automatic and manual matches
   - Proper ledger logic: negative = contribution, positive = distribution
   - Uses ABS() for allocation amounts (CHECK constraint requires positive)

3. **API Route:** `/api/brex/match-transfer-to-vendor`
   - POST: Match transfer(s) to vendor
   - GET: Fetch unmatched transfers

**Files:**
- `supabase/migrations/20251126100710_create_api_brex_transfers_vendors_junction.sql`
- `supabase/migrations/20251126100902_update_sync_to_use_junction_table.sql`
- `supabase/migrations/20251126104714_fix_ledger_entry_type_logic.sql`
- `src/app/api/brex/match-transfer-to-vendor/route.ts`

**Test Result:** Transfer #150 (-$47,250.00) successfully matched to David Beth → synced → appears in Investments tab ✅

---

## Stage 2: Bulk Matching & Professional UI ✅

**Created:**
1. **TanStack Table Component:** `UnmatchedTransfersTable`
   - Checkbox selection (individual + select all)
   - Sortable columns: ID, Date, Name, Description, Amount
   - Search functionality
   - Pagination with rows-per-page dropdown (10/20/30/50)
   - Matches Investments table styling (border, bg-muted header, hover effects)

2. **Bulk Matching:**
   - API supports `transfer_ids: number[]` for bulk operations
   - Selection count display ("X of Y row(s) selected")
   - Vendor combobox with search (shows name + email)
   - Optional notes field
   - Success toast notifications

3. **Integrated into Brex Page:** `/platform-settings/integrations/brex`
   - BrexSyncButtons (step 1: sync from API)
   - BrexVendorMatcher (step 2: match vendors to clerk users/orgs)
   - UnmatchedTransfersTable (step 3: match transfers to vendors) ← NEW

**Files:**
- `src/components/admin/unmatched-transfers-table.tsx` (new)
- `src/app/(dashboard)/platform-settings/integrations/brex/page.tsx` (updated)
- `src/app/api/brex/match-transfer-to-vendor/route.ts` (updated for bulk)

**UI Styling:**
- Amounts: Negative (outgoing) in default color, positive (incoming) in green (theme-aware `text-success-foreground`)
- Matches Brex UX patterns
- Clean, professional table layout

---

## Stage 3: Planned (Not Started)

### Features to Add:
1. **Automatic Match Tracking**
   - One-time migration to populate existing automatic matches
   - Trigger to auto-populate junction table when new transfers sync from Brex
   - Update RLS policy on `api_brex_transfers` to include junction table matches

2. **Soft Delete & Audit Trail**
   - Add columns: `deleted_at`, `created_by_user_id`, `updated_by_user_id`, `updated_at`
   - Soft delete instead of hard delete (preserves synced transactions)
   - UI filters out soft-deleted matches by default

3. **Enhanced Features**
   - Match impact preview (shows which transactions will be created)
   - Re-matching capability (update existing matches)
   - Manual matches manager component (audit log view)
   - Post-match workflow (offer immediate sync)
   - Auto-suggest vendors based on name/email/account similarity

---

## Key Decisions

1. **One transfer → one vendor** (UNIQUE constraint prevents multiple vendor matches per transfer)
2. **Manual matches override automatic** (junction table allows updates)
3. **Preserve amount sign** (negative = contribution/out, positive = distribution/in)
4. **Allocation amounts must be positive** (ABS() used due to database CHECK constraint)
5. **Admin-only access** (RLS policies check `auth_clerk_users.role = 'admin'`)

---

## Testing Workflow

1. Go to `/platform-settings/integrations/brex`
2. Scroll to "Match Transfers to Vendors" table
3. Select transfers using checkboxes
4. Choose vendor from dropdown
5. Click "Match X Transfers to Vendor"
6. Click "Sync to Transactions" at top of page
7. Navigate to `/balance-sheet/transactions?tab=investments`
8. Verify transfers now appear! ✅

---

## Next Steps (When Ready for Stage 3)

1. Create trigger for automatic match population
2. Add soft delete and audit columns
3. Build match impact preview API
4. Create manual matches manager UI
5. Update RLS policies
6. Test complete audit trail

---

**Date Completed:** November 26, 2025  
**Status:** Ready for production use with current Stage 1 & 2 features

