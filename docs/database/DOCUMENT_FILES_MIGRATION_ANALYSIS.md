# Document Files Migration - Conflict Analysis & Resolution Plan

## Overview

This document analyzes potential conflicts in migrating `document_files` from direct FK columns to junction tables, and provides resolution strategies.

---

## Conflicts Identified

### 1. View: `transaction_documents_view`

**Issue:** This view directly references columns we're dropping:
- `deal_id`
- `borrower_id`
- `entity_id`
- `property_id`
- `guarantor_id`
- `file_path`

**Current Definition:**
```sql
CREATE OR REPLACE VIEW "public"."transaction_documents_view" AS
SELECT tdf.transaction_id,
    tdf.id AS junction_id,
    df.id,
    df.created_at,
    df.document_name,
    df.public_notes,
    df.private_notes,
    df.document_status,
    df.document_category,
    df.deal_id,           -- DROPPING
    df.borrower_id,       -- DROPPING
    df.entity_id,         -- DROPPING
    df.property_id,       -- DROPPING
    df.guarantor_id,      -- DROPPING
    df.effective_date,
    df.expiration_date,
    df.is_required,
    df.uploaded_by,
    df.uploaded_at,
    df.file_size,
    df.file_type,
    df.file_path          -- DROPPING (replaced by storage_bucket + storage_path)
FROM bsi_transactions_document_files tdf
JOIN document_files df ON tdf.document_file_id = df.id;
```

**Resolution:** Update the view to:
1. Use new `storage_bucket` and `storage_path` columns
2. Remove deprecated FK columns (they won't be used via view anyway)

---

### 2. Table: `appraisal`

**Issue:** Has FK constraint `appraisal_document_id_fkey` referencing `document_files(id)`

**Analysis:** ✅ **NO ACTION REQUIRED**
- We are NOT dropping the `id` column from `document_files`
- The FK constraint remains valid

---

### 3. Table: `document_roles_files`

**Issue:** Has FK constraint `document_roles_files_document_files_id_fkey` referencing `document_files(id)`

**Analysis:** ✅ **NO ACTION REQUIRED**
- We are NOT dropping the `id` column from `document_files`
- The FK constraint remains valid

---

### 4. API Route: `/api/documents/[id]/route.ts`

**Issue:** Uses deprecated columns and incorrect bucket reference

**Current Code (lines 40-43):**
```typescript
if (document.file_path) {
  const { error: storageError } = await supabase.storage
    .from("document_files")  // WRONG: This is a bucket name, not a table name
    .remove([document.file_path]);
}
```

**Resolution:** Update to use new columns:
```typescript
if (document.storage_bucket && document.storage_path) {
  const { error: storageError } = await supabase.storage
    .from(document.storage_bucket)
    .remove([document.storage_path]);
}
```

---

### 5. TypeScript Types: `database.types.ts`

**Issue:** Auto-generated types will be stale after migration

**Resolution:** After migration, regenerate types:
```bash
npx supabase gen types typescript --project-id <project-id> > src/types/database.types.ts
```

---

### 6. Existing Junction Table: `bsi_transactions_document_files`

**Issue:** Already exists and follows the junction pattern

**Analysis:** ✅ **NO ACTION REQUIRED**
- This table is already in the correct format
- Has FK to `document_files(id)` which we're keeping

---

## Migration Order (Dependencies)

To avoid FK constraint violations and view errors:

```
1. Add new columns to document_files (storage_bucket, storage_path)
   ↓
2. Create new junction tables
   ↓
3. Enable RLS on junction tables
   ↓
4. Update transaction_documents_view (drop deprecated columns from view)
   ↓
5. Drop deprecated columns from document_files
   ↓
6. Drop document_investors table
```

---

## Summary

| Item | Status | Action |
|------|--------|--------|
| `transaction_documents_view` | ⚠️ Conflict | Update view definition |
| `appraisal` table | ✅ Safe | No action |
| `document_roles_files` table | ✅ Safe | No action |
| `bsi_transactions_document_files` table | ✅ Safe | No action |
| `/api/documents/[id]/route.ts` | ⚠️ Conflict | Update code |
| `database.types.ts` | ⚠️ Stale | Regenerate after migration |
| Manual `document-files.ts` types | ⚠️ Update | Update interface |

---

## Files to Update After Migration

1. `src/app/api/documents/[id]/route.ts` - Use new storage columns ✅ DONE
2. `src/app/api/documents/route.ts` - Use new storage columns ✅ DONE
3. `src/lib/transaction-document-helpers.ts` - Use new storage columns ✅ DONE
4. `src/types/document-files.ts` - Update interface ✅ DONE
5. Regenerate `src/types/database.types.ts` - Run after migration applied

---

## Migrations Created

| Migration | Description |
|-----------|-------------|
| `20260114180001_add_storage_columns_to_document_files.sql` | Add `storage_bucket` and `storage_path` columns |
| `20260114180002_create_document_junction_tables.sql` | Create 7 junction tables with `created_by` column |
| `20260114180003_junction_tables_rls.sql` | Enable RLS and create admin/user policies |
| `20260114180004_update_transaction_documents_view.sql` | Update view to use new storage columns |
| `20260114180005_cleanup_deprecated_document_columns.sql` | Drop deprecated FK columns and `document_investors` table |

---

## Application Code Updated

| File | Changes |
|------|---------|
| `src/app/api/documents/[id]/route.ts` | Use `storage_bucket` + `storage_path` instead of `file_path` |
| `src/app/api/documents/route.ts` | Use new columns, support `deal_ids` array for junction linking |
| `src/lib/transaction-document-helpers.ts` | Updated upload/download to use new storage columns |
| `src/types/document-files.ts` | New interfaces for junction tables and updated `DocumentFile` |

---

## Post-Migration Steps

1. **Run migrations on DEV:**
   ```bash
   npx supabase db push
   ```

2. **Regenerate TypeScript types:**
   ```bash
   npx supabase gen types typescript --project-id <project-id> > src/types/database.types.ts
   ```

3. **Test the application:**
   - Upload a document via the UI
   - Verify it appears in `document_files` with `storage_bucket` and `storage_path`
   - Verify junction table entries are created when linking to deals

4. **Deploy to PROD** after validation
