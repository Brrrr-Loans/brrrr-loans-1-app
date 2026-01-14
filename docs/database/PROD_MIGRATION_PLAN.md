# PROD Database Migration Plan

## Overview

**Current State:**
- PROD latest migration: `20251223092250` (Dec 23, 2025)
- DEV latest migration: `20260114210001` (Jan 14, 2026)
- **Gap: 19 migrations**

**Migration Strategy:** 4 stages with safety checks between each.

---

## Pre-Migration Checklist

- [ ] **Backup PROD database** (full dump)
- [ ] **Notify team** of maintenance window
- [ ] **Document current state** (row counts, policy counts)
- [ ] **Have rollback plan ready** for each stage

### Pre-Migration Verification Queries

Run these on PROD before starting:

```sql
-- Record baseline metrics
SELECT 'tables' as type, COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'public';
SELECT 'policies' as type, COUNT(*) as count FROM pg_policies WHERE schemaname = 'public';
SELECT 'functions' as type, COUNT(*) as count FROM information_schema.routines WHERE routine_schema = 'public';

-- Document files table state
SELECT COUNT(*) as document_files_count FROM public.document_files;
SELECT COUNT(*) as document_investors_count FROM public.document_investors;

-- RLS policies using inline admin check (should be ~63 before Stage 2)
SELECT COUNT(*) as inline_admin_policies 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND (qual LIKE '%auth_clerk_users%role%admin%' OR with_check LIKE '%auth_clerk_users%role%admin%');
```

---

## Stage 1: Minor Schema Updates (LOW RISK)

**Migrations:**
1. `20251223123551_update_name_generated_columns_with_middle_name`
2. `20251223124558_drop_deal_roles_is_primary_column`
3. `20251225152633_revoke_anon_document_access`

**Risk Level:** 🟢 Low
**Estimated Time:** 2-3 minutes
**Rollback Complexity:** Easy

### What Changes:
- Updates generated columns for name fields (adds middle name support)
- Drops unused `is_primary` column from `deal_roles` (renamed to `deal_contacts`)
- Revokes anonymous access to document tables (security hardening)

### Stage 1 Execution

```bash
# Link to PROD temporarily
npx supabase link --project-ref gsxggtsgqskhchcbrmhe

# Dry run first
npx supabase db push --dry-run

# If dry run looks good, apply
npx supabase db push
```

### Stage 1 Safety Checks

```sql
-- Verify name columns updated
SELECT column_name, generation_expression 
FROM information_schema.columns 
WHERE table_name IN ('borrower', 'guarantor', 'contact') 
  AND column_name = 'full_name';

-- Verify deal_contacts table exists (renamed from deal_roles)
SELECT column_name FROM information_schema.columns WHERE table_name = 'deal_contacts';

-- Verify anon access revoked
SELECT grantee, privilege_type 
FROM information_schema.table_privileges 
WHERE table_name = 'document_files' AND grantee = 'anon';
```

**✅ Proceed to Stage 2 only if all checks pass**

---

## Stage 2: RLS Policy Refactoring (MEDIUM RISK)

**Migrations:**
1. `20260113180652_remote_schema`
2. `20260113193055_refactor_rls_use_is_admin` ⚠️ **Major: 63 policies**
3. `20260113193056_refactor_bsi_junction_policies`
4. `20260113203019_remote_schema`
5. `20260113203327_refactor_compound_policies`
6. `20260113221925_remote_schema`

**Risk Level:** 🟡 Medium
**Estimated Time:** 5-10 minutes
**Rollback Complexity:** Medium (policies can be recreated)

### What Changes:
- Refactors 63+ admin RLS policies to use `is_admin()` function
- Splits compound policies into single-responsibility policies
- Improves policy consistency and maintainability
- **No data changes** - only policy definitions

### Stage 2 Pre-Check

```sql
-- Verify is_admin() function exists (should already exist in PROD)
SELECT proname, prosrc FROM pg_proc WHERE proname = 'is_admin';

-- Count current admin policies with inline checks
SELECT COUNT(*) as inline_admin_policies 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND (qual LIKE '%auth_clerk_users%role%admin%' OR with_check LIKE '%auth_clerk_users%role%admin%');
```

### Stage 2 Execution

```bash
# Apply Stage 2 migrations
npx supabase db push
```

### Stage 2 Safety Checks

```sql
-- Verify policies now use is_admin()
SELECT COUNT(*) as is_admin_policies 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND (qual LIKE '%is_admin()%' OR with_check LIKE '%is_admin()%');

-- Should be ~100+ policies using is_admin()

-- Verify no inline admin checks remain (should be 0 or very few)
SELECT COUNT(*) as remaining_inline_checks 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND qual LIKE '%auth_clerk_users.clerk_user_id%role%admin%'
  AND qual NOT LIKE '%is_admin()%';

-- Test admin access still works (run as authenticated user with admin role)
-- This should be tested via the application
```

**✅ Proceed to Stage 3 only if:**
- [ ] is_admin() policies count increased significantly
- [ ] Application admin functions still work
- [ ] No RLS errors in application logs

---

## Stage 3: Document Files Schema Changes (HIGH RISK)

**Migrations:**
1. `20260114180001_add_storage_columns_to_document_files`
2. `20260114180002_create_document_junction_tables` (9 new tables)
3. `20260114180003_junction_tables_rls`
4. `20260114180004_update_transaction_documents_view`
5. `20260114180005_cleanup_deprecated_document_columns` ⚠️ **DESTRUCTIVE**

**Risk Level:** 🔴 High
**Estimated Time:** 10-15 minutes
**Rollback Complexity:** Difficult (data migration involved)

### What Changes:
- Adds `storage_bucket`, `storage_path` columns to `document_files`
- Creates 9 junction tables for many-to-many relationships:
  - `document_files_deals`
  - `document_files_borrowers`
  - `document_files_properties`
  - `document_files_guarantors`
  - `document_files_companies`
  - `document_files_clerk_orgs`
  - `document_files_clerk_users`
  - (Plus 2 tag-related tables in Stage 4)
- Drops deprecated FK columns (`deal_id`, `borrower_id`, etc.)
- Drops deprecated `document_investors` table
- Updates `transaction_documents_view`

### ⚠️ CRITICAL: Pre-Stage 3 Backup

```bash
# Create a point-in-time backup of PROD
pg_dump "postgresql://postgres.gsxggtsgqskhchcbrmhe:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres" \
  --schema=public \
  --no-owner \
  --no-privileges \
  -f /path/to/backup_prod_before_stage3.sql
```

### Stage 3 Pre-Check

```sql
-- Record current document_files data
SELECT COUNT(*) as total_docs, 
       COUNT(deal_id) as with_deal,
       COUNT(borrower_id) as with_borrower,
       COUNT(property_id) as with_property
FROM public.document_files;

-- Record document_investors data
SELECT COUNT(*) as investor_assignments FROM public.document_investors;
```

### Stage 3 Execution

```bash
# Apply Stage 3 migrations
npx supabase db push
```

### Stage 3 Safety Checks

```sql
-- Verify new columns exist
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'document_files' 
  AND column_name IN ('storage_bucket', 'storage_path');

-- Verify junction tables created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'document_files_%';

-- Verify old columns dropped
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'document_files' 
  AND column_name IN ('deal_id', 'borrower_id', 'property_id', 'guarantor_id', 'entity_id', 'file_url', 'file_path');
-- Should return 0 rows

-- Verify document_investors table dropped
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = 'document_investors'
);
-- Should return false

-- Verify view updated
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'transaction_documents_view';
```

**✅ Proceed to Stage 4 only if:**
- [ ] All junction tables created
- [ ] Old columns successfully dropped
- [ ] View updated correctly
- [ ] Application document features still work

---

## Stage 4: Document Tags System (MEDIUM RISK)

**Migrations:**
1. `20260114190001_fix_document_files_unique_constraint`
2. `20260114190002_add_tags_to_document_files`
3. `20260114200001_create_document_tags_tables`
4. `20260114200002_document_tags_rls`
5. `20260114200003_migrate_existing_tags`
6. `20260114210001_add_period_columns_to_document_files`

**Risk Level:** 🟡 Medium
**Estimated Time:** 5-10 minutes
**Rollback Complexity:** Medium

### What Changes:
- Adds unique constraint on `(storage_bucket, storage_path)`
- Adds `tags` TEXT[] column
- Creates `document_tags` table (tag metadata)
- Creates `document_files_tags` junction table
- Adds RLS policies for tag tables
- Migrates any existing tags to new structure
- Adds `period_start`, `period_end` DATE columns

### Stage 4 Execution

```bash
# Apply Stage 4 migrations
npx supabase db push
```

### Stage 4 Safety Checks

```sql
-- Verify unique constraint
SELECT constraint_name FROM information_schema.table_constraints 
WHERE table_name = 'document_files' AND constraint_type = 'UNIQUE';

-- Verify tags column
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'document_files' AND column_name = 'tags';

-- Verify document_tags table
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'document_tags';

-- Verify period columns
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'document_files' 
  AND column_name IN ('period_start', 'period_end');

-- Verify RLS on new tables
SELECT tablename, policyname FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('document_tags', 'document_files_tags');
```

---

## Post-Migration Verification

### Final State Comparison

```sql
-- Compare with pre-migration baseline
SELECT 'tables' as type, COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'public';
SELECT 'policies' as type, COUNT(*) as count FROM pg_policies WHERE schemaname = 'public';
SELECT 'functions' as type, COUNT(*) as count FROM information_schema.routines WHERE routine_schema = 'public';

-- Verify all expected tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'document%'
ORDER BY table_name;
```

### Application Testing Checklist

- [ ] Admin can log in and access dashboard
- [ ] Document upload works (Statements/Payments/Agreements tabs)
- [ ] Document list loads correctly
- [ ] Investor assignment works
- [ ] Tag add/remove works
- [ ] Period editing works
- [ ] Move document between folders works
- [ ] Board view with Group By works
- [ ] Bulk operations work

---

## Rollback Procedures

### Stage 1 Rollback
Minimal risk - can be addressed with individual ALTER statements.

### Stage 2 Rollback
Re-run original policy creation scripts from backup.

### Stage 3 Rollback (Most Complex)
1. Restore from pre-Stage 3 backup
2. Re-apply Stage 1 & 2 migrations
3. Investigate failure cause before retry

### Stage 4 Rollback
Drop new tables and columns:
```sql
DROP TABLE IF EXISTS public.document_files_tags CASCADE;
DROP TABLE IF EXISTS public.document_tags CASCADE;
ALTER TABLE public.document_files DROP COLUMN IF EXISTS tags;
ALTER TABLE public.document_files DROP COLUMN IF EXISTS period_start;
ALTER TABLE public.document_files DROP COLUMN IF EXISTS period_end;
```

---

## Timeline Estimate

| Stage | Duration | Cumulative |
|-------|----------|------------|
| Pre-checks & Backup | 10 min | 10 min |
| Stage 1 | 5 min | 15 min |
| Safety Check 1 | 5 min | 20 min |
| Stage 2 | 10 min | 30 min |
| Safety Check 2 | 10 min | 40 min |
| Stage 3 | 15 min | 55 min |
| Safety Check 3 | 15 min | 70 min |
| Stage 4 | 10 min | 80 min |
| Final Verification | 10 min | 90 min |

**Total Estimated Time: ~90 minutes**

---

## Commands Summary

```bash
# Step 0: Create PROD backup
pg_dump "postgresql://postgres.gsxggtsgqskhchcbrmhe:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres" \
  --schema=public -f backup_prod_$(date +%Y%m%d_%H%M%S).sql

# Step 1: Link to PROD (temporarily)
npx supabase link --project-ref gsxggtsgqskhchcbrmhe

# Step 2: Dry run to see pending migrations
npx supabase db push --dry-run

# Step 3: Apply migrations (all at once or use SQL editor for staged approach)
npx supabase db push

# Step 4: Re-link back to DEV when done
npx supabase link --project-ref cjbevtvvlthelhbjlqmp
```

---

## Ready to Execute?

**Confirm before starting:**
- [ ] I have created a fresh PROD backup
- [ ] I have the Supabase Dashboard open for PROD
- [ ] I have application logs accessible
- [ ] I understand the rollback procedures
- [ ] Team has been notified of maintenance window
