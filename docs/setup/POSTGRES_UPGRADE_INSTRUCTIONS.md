# Postgres Version Upgrade Instructions

## Current Status

- **Current Version**: `supabase-postgres-15.8.1.073`
- **Status**: Outstanding security patches available
- **Action Required**: Upgrade to latest Postgres version

## Why Upgrade?

The current Postgres version has known security vulnerabilities that have been patched in newer versions. Upgrading ensures:

- Latest security patches applied
- Improved stability and performance
- Compliance with security best practices

## How to Upgrade

### Via Supabase Dashboard

1. **Navigate to Infrastructure Settings**
   - Log in to [Supabase Dashboard](https://supabase.com/dashboard)
   - Select your project
   - Go to **Settings** → **Infrastructure** (in the left sidebar)
   - Direct link: `https://supabase.com/dashboard/project/_/settings/infrastructure`

2. **Remove Deprecated Extensions (If Needed)**
   - If you see a message about deprecated extensions (like `pgjwt`), you must remove them first
   - Click the **"Manage"** button next to the deprecated extension
   - Disable/remove the extension
   - **Note**: The `pgjwt` extension has been removed from this project (Nov 18, 2025)

3. **Initiate Upgrade**
   - Look for the "Postgres Version" section (shows current version)
   - Click the **"Upgrade project"** button (appears after deprecated extensions are removed)
   - Review the upgrade details and confirm
   - Follow the prompts to complete the upgrade

4. **Expected Downtime**
   - The upgrade requires a brief database restart
   - Expected downtime: A few seconds to 1-2 minutes
   - Plan the upgrade during low-traffic periods

### Important Notes

- ✅ **Backup First**: Supabase automatically creates a backup before upgrading
- ✅ **Test After**: Verify critical application functionality after upgrade
- ✅ **Monitor Logs**: Check logs for any unexpected errors post-upgrade
- ⚠️ **Cannot Be Automated**: This upgrade must be done through the dashboard
- ⚠️ **One-Way Operation**: Postgres upgrades cannot be rolled back

## Timing Recommendation

**Upgrade After Function Fixes**: The function search_path security fixes are independent of the Postgres version and should be completed first (already done). The Postgres upgrade can then be performed separately.

## Verification

After upgrading, verify the new version:

```sql
SELECT version();
```

Or check the Supabase Dashboard → Database → Settings → Postgres Version

## References

- [Supabase Upgrade Guide](https://supabase.com/docs/guides/platform/upgrading)
- [Security Advisor Documentation](https://supabase.com/docs/guides/database/database-linter)

---

## Completed Security Fixes

The following security issues have been resolved as of 2025-11-18:

✅ **All 11 function search_path warnings fixed**:

- `is_admin`
- `count_pending_brex_transfer_syncs`
- `sync_matched_api_brex_transfers_to_bsi_transactions`
- `check_deal_allocation_sum`
- `handle_deal_changes`
- `update_property_address`
- `format_address` (2 overloads)
- `format_deal_name`
- `get_complete_schema`
- `user_has_transaction_access`

✅ **RLS enabled on backup table**: `_function_backups_20251118`

⏳ **Pending**: Postgres version upgrade (manual action required)
