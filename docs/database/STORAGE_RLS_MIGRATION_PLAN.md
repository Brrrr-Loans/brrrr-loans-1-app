# Storage RLS Migration Plan: Align PROD with DEV

## Current State

### DEV Storage (Reference Model)

**Bucket**: `investors`

| Policy | Command | Logic |
|--------|---------|-------|
| `investors_delete_admin_only` | DELETE | `is_internal_admin()` |
| `investors_insert_admin_only` | INSERT | `is_internal_admin()` |
| `investors_update_admin_only` | UPDATE | `is_internal_admin()` |
| `investors_select_own_files` | SELECT | `is_internal_admin() OR user_folder OR org_folder` |

**Folder Structure**:
```
investors/
├── users/{clerk_user_id}/...
└── orgs/{org_id}/...
```

### PROD Storage (Legacy)

**Bucket**: `transaction-documents`

| Policy | Command | Logic |
|--------|---------|-------|
| `Admins can access all documents` | ALL? | Inline admin check with `auth.uid()` (legacy) |

**Issues**:
- Misleading policy name
- Uses `auth.uid()` instead of Clerk JWT
- Inline admin check instead of `is_internal_admin()`
- No user/org folder-based access

---

## Migration Plan

### Phase 1: Verify DEV has all needed buckets

Before syncing, confirm DEV has the buckets PROD needs:

```sql
-- Run in DEV to check buckets
SELECT id, name, public FROM storage.buckets ORDER BY name;
```

If `transaction-documents` bucket doesn't exist in DEV, decide:
- **Option A**: Migrate PROD data to `investors` bucket
- **Option B**: Create `transaction-documents` bucket in DEV with same policy pattern

### Phase 2: Create `is_internal_admin()` in PROD (if missing)

```sql
-- Check if function exists in PROD
SELECT proname FROM pg_proc WHERE proname = 'is_internal_admin';

-- If missing, create it:
CREATE OR REPLACE FUNCTION public.is_internal_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.auth_clerk_users
    WHERE clerk_user_id = public.get_clerk_user_id()
    AND role = 'admin'
    AND is_internal_yn = true
  );
$$;
```

### Phase 3: Drop legacy PROD policies

```sql
-- Drop the legacy policy
DROP POLICY IF EXISTS "Admins can access all documents" ON storage.objects;
```

### Phase 4: Create new PROD policies (matching DEV pattern)

#### Option A: For `investors` bucket

```sql
-- DELETE: Admin only
CREATE POLICY "investors_delete_admin_only" ON storage.objects
FOR DELETE
USING (
  bucket_id = 'investors'
  AND public.is_internal_admin()
);

-- INSERT: Admin only  
CREATE POLICY "investors_insert_admin_only" ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'investors'
  AND public.is_internal_admin()
);

-- UPDATE: Admin only
CREATE POLICY "investors_update_admin_only" ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'investors'
  AND public.is_internal_admin()
)
WITH CHECK (
  bucket_id = 'investors'
  AND public.is_internal_admin()
);

-- SELECT: Admin or own files
CREATE POLICY "investors_select_own_files" ON storage.objects
FOR SELECT
USING (
  bucket_id = 'investors'
  AND (
    public.is_internal_admin()
    OR
    ((storage.foldername(name))[1] = 'users' AND (storage.foldername(name))[2] = public.get_clerk_user_id())
    OR
    ((storage.foldername(name))[1] = 'orgs' AND (storage.foldername(name))[2] = ANY(public.get_user_org_ids()))
  )
);
```

#### Option B: For `transaction-documents` bucket (if keeping this bucket)

```sql
-- DELETE: Admin only
CREATE POLICY "txn_docs_delete_admin_only" ON storage.objects
FOR DELETE
USING (
  bucket_id = 'transaction-documents'
  AND public.is_internal_admin()
);

-- INSERT: Admin only  
CREATE POLICY "txn_docs_insert_admin_only" ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'transaction-documents'
  AND public.is_internal_admin()
);

-- UPDATE: Admin only
CREATE POLICY "txn_docs_update_admin_only" ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'transaction-documents'
  AND public.is_internal_admin()
)
WITH CHECK (
  bucket_id = 'transaction-documents'
  AND public.is_internal_admin()
);

-- SELECT: Admin or user with access to transaction
CREATE POLICY "txn_docs_select_own" ON storage.objects
FOR SELECT
USING (
  bucket_id = 'transaction-documents'
  AND (
    public.is_internal_admin()
    OR
    -- Add user access logic here based on transaction ownership
    EXISTS (
      SELECT 1 FROM public.bsi_transactions_document_files tdf
      JOIN public.bsi_transactions t ON tdf.transaction_id = t.id
      WHERE tdf.document_path = name
      AND t.id IN (SELECT transaction_id FROM public.get_accessible_transaction_ids())
    )
  )
);
```

---

## Verification Queries

After migration, run in PROD:

```sql
-- Check all storage policies
SELECT policyname, cmd, qual::text 
FROM pg_policies 
WHERE schemaname = 'storage'
ORDER BY policyname;

-- Verify no legacy patterns remain
SELECT policyname 
FROM pg_policies 
WHERE schemaname = 'storage'
AND (qual::text LIKE '%auth.uid()%' OR qual::text LIKE '%auth.jwt()%role%');
```

---

## Pre-Migration Checklist

- [ ] Verify which buckets exist in PROD
- [ ] Decide on bucket strategy (migrate data vs. create new policies)
- [ ] Verify `is_internal_admin()` exists in PROD
- [ ] Verify `get_clerk_user_id()` exists in PROD
- [ ] Verify `get_user_org_ids()` exists in PROD
- [ ] Backup PROD before migration
- [ ] Test in DEV first if making changes

---

## Notes

- DEV uses `is_internal_admin()` which requires `is_internal_yn = true`
- This is stricter than `is_admin()` which only checks role
- Storage folder structure in DEV: `{bucket}/users/{clerk_user_id}/` and `{bucket}/orgs/{org_id}/`
