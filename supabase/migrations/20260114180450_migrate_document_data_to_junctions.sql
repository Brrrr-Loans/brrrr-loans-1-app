-- Migration: Migrate existing document_files data to junction tables
-- 
-- Order in migration sequence:
--   20260114180001 - Add storage columns ✓
--   20260114180002 - Create junction tables ✓
--   20260114180003 - Junction tables RLS ✓
--   20260114180004 - Update view ✓
--   >>> 20260114180450 - THIS MIGRATION (data migration) <<<
--   20260114180005 - Cleanup deprecated columns (DESTRUCTIVE)
--
-- Purpose: Preserve existing FK relationships by copying them to junction tables
-- Safe to run multiple times (uses ON CONFLICT DO NOTHING)

---------------------------------------------------------------
-- Step 1: Migrate document_files.deal_id to document_files_deals
---------------------------------------------------------------
INSERT INTO public.document_files_deals (document_file_id, deal_id, created_at, created_by)
SELECT 
    df.id,
    df.deal_id,
    COALESCE(df.created_at, now()),
    df.uploaded_by
FROM public.document_files df
WHERE df.deal_id IS NOT NULL
ON CONFLICT (document_file_id, deal_id) DO NOTHING;

DO $$ 
BEGIN
    RAISE NOTICE 'Migrated % rows from document_files.deal_id', 
        (SELECT COUNT(*) FROM public.document_files WHERE deal_id IS NOT NULL);
END $$;

---------------------------------------------------------------
-- Step 2: Migrate document_files.borrower_id to document_files_borrowers
---------------------------------------------------------------
INSERT INTO public.document_files_borrowers (document_file_id, borrower_id, created_at, created_by)
SELECT 
    df.id,
    df.borrower_id,
    COALESCE(df.created_at, now()),
    df.uploaded_by
FROM public.document_files df
WHERE df.borrower_id IS NOT NULL
ON CONFLICT (document_file_id, borrower_id) DO NOTHING;

DO $$ 
BEGIN
    RAISE NOTICE 'Migrated % rows from document_files.borrower_id', 
        (SELECT COUNT(*) FROM public.document_files WHERE borrower_id IS NOT NULL);
END $$;

---------------------------------------------------------------
-- Step 3: Migrate document_files.property_id to document_files_properties
---------------------------------------------------------------
INSERT INTO public.document_files_properties (document_file_id, property_id, created_at, created_by)
SELECT 
    df.id,
    df.property_id,
    COALESCE(df.created_at, now()),
    df.uploaded_by
FROM public.document_files df
WHERE df.property_id IS NOT NULL
ON CONFLICT (document_file_id, property_id) DO NOTHING;

DO $$ 
BEGIN
    RAISE NOTICE 'Migrated % rows from document_files.property_id', 
        (SELECT COUNT(*) FROM public.document_files WHERE property_id IS NOT NULL);
END $$;

---------------------------------------------------------------
-- Step 4: Migrate document_files.guarantor_id to document_files_guarantors
---------------------------------------------------------------
INSERT INTO public.document_files_guarantors (document_file_id, guarantor_id, created_at, created_by)
SELECT 
    df.id,
    df.guarantor_id,
    COALESCE(df.created_at, now()),
    df.uploaded_by
FROM public.document_files df
WHERE df.guarantor_id IS NOT NULL
ON CONFLICT (document_file_id, guarantor_id) DO NOTHING;

DO $$ 
BEGIN
    RAISE NOTICE 'Migrated % rows from document_files.guarantor_id', 
        (SELECT COUNT(*) FROM public.document_files WHERE guarantor_id IS NOT NULL);
END $$;

---------------------------------------------------------------
-- Step 5: Migrate document_files.entity_id to document_files_companies
---------------------------------------------------------------
INSERT INTO public.document_files_companies (document_file_id, company_id, created_at, created_by)
SELECT 
    df.id,
    df.entity_id,
    COALESCE(df.created_at, now()),
    df.uploaded_by
FROM public.document_files df
WHERE df.entity_id IS NOT NULL
ON CONFLICT (document_file_id, company_id) DO NOTHING;

DO $$ 
BEGIN
    RAISE NOTICE 'Migrated % rows from document_files.entity_id', 
        (SELECT COUNT(*) FROM public.document_files WHERE entity_id IS NOT NULL);
END $$;

---------------------------------------------------------------
-- Step 6: Migrate file_path/file_url to storage_bucket/storage_path
-- Only if storage columns are empty and old columns have data
---------------------------------------------------------------
UPDATE public.document_files
SET 
    storage_bucket = 'documents',
    storage_path = COALESCE(file_path, file_url)
WHERE 
    (storage_bucket IS NULL OR storage_path IS NULL)
    AND (file_path IS NOT NULL OR file_url IS NOT NULL);

DO $$ 
BEGIN
    RAISE NOTICE 'Updated storage columns for % rows', 
        (SELECT COUNT(*) FROM public.document_files 
         WHERE storage_bucket IS NOT NULL AND storage_path IS NOT NULL);
END $$;

---------------------------------------------------------------
-- Step 7: Migrate document_investors to junction tables
-- document_investors links storage paths to clerk_org_id or clerk_user_id
---------------------------------------------------------------

-- First check if document_investors table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'document_investors') THEN
        -- Migrate org assignments
        INSERT INTO public.document_files_clerk_orgs (document_file_id, clerk_org_id, created_at, created_by)
        SELECT DISTINCT
            df.id,
            di.clerk_org_id,
            COALESCE(di.created_at, now()),
            di.created_by
        FROM public.document_investors di
        JOIN public.document_files df ON df.storage_path = di.storage_path
        WHERE di.clerk_org_id IS NOT NULL
        ON CONFLICT (document_file_id, clerk_org_id) DO NOTHING;

        RAISE NOTICE 'Migrated org assignments from document_investors';

        -- Migrate user assignments  
        INSERT INTO public.document_files_clerk_users (document_file_id, clerk_user_id, created_at, created_by)
        SELECT DISTINCT
            df.id,
            di.clerk_user_id,
            COALESCE(di.created_at, now()),
            di.created_by
        FROM public.document_investors di
        JOIN public.document_files df ON df.storage_path = di.storage_path
        WHERE di.clerk_user_id IS NOT NULL
        ON CONFLICT (document_file_id, clerk_user_id) DO NOTHING;

        RAISE NOTICE 'Migrated user assignments from document_investors';
    ELSE
        RAISE NOTICE 'document_investors table does not exist, skipping';
    END IF;
END $$;

---------------------------------------------------------------
-- Summary: Output migration results
---------------------------------------------------------------
DO $$ 
DECLARE
    v_deals INT;
    v_borrowers INT;
    v_properties INT;
    v_guarantors INT;
    v_companies INT;
    v_clerk_orgs INT;
    v_clerk_users INT;
BEGIN
    SELECT COUNT(*) INTO v_deals FROM public.document_files_deals;
    SELECT COUNT(*) INTO v_borrowers FROM public.document_files_borrowers;
    SELECT COUNT(*) INTO v_properties FROM public.document_files_properties;
    SELECT COUNT(*) INTO v_guarantors FROM public.document_files_guarantors;
    SELECT COUNT(*) INTO v_companies FROM public.document_files_companies;
    SELECT COUNT(*) INTO v_clerk_orgs FROM public.document_files_clerk_orgs;
    SELECT COUNT(*) INTO v_clerk_users FROM public.document_files_clerk_users;
    
    RAISE NOTICE '=== Data Migration Summary ===';
    RAISE NOTICE 'document_files_deals: % rows', v_deals;
    RAISE NOTICE 'document_files_borrowers: % rows', v_borrowers;
    RAISE NOTICE 'document_files_properties: % rows', v_properties;
    RAISE NOTICE 'document_files_guarantors: % rows', v_guarantors;
    RAISE NOTICE 'document_files_companies: % rows', v_companies;
    RAISE NOTICE 'document_files_clerk_orgs: % rows', v_clerk_orgs;
    RAISE NOTICE 'document_files_clerk_users: % rows', v_clerk_users;
    RAISE NOTICE '==============================';
END $$;
