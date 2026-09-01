-- Migration: Migrate existing document_files data to junction tables
--
-- Filename order runs 20260114180005 (drop deal_id etc.) BEFORE this file.
-- Preview clones that already dropped those columns must skip the copy.
-- Each step no-ops when the source column/table is gone.

---------------------------------------------------------------
-- Step 1: Migrate document_files.deal_id to document_files_deals
---------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'document_files' AND column_name = 'deal_id'
  ) THEN
    INSERT INTO public.document_files_deals (document_file_id, deal_id, created_at, created_by)
    SELECT
        df.id,
        df.deal_id,
        COALESCE(df.created_at, now()),
        df.uploaded_by
    FROM public.document_files df
    WHERE df.deal_id IS NOT NULL
    ON CONFLICT (document_file_id, deal_id) DO NOTHING;
    RAISE NOTICE 'Migrated document_files.deal_id';
  ELSE
    RAISE NOTICE 'Skipping deal_id migration; column already dropped';
  END IF;
END $$;

---------------------------------------------------------------
-- Step 2: Migrate document_files.borrower_id to document_files_borrowers
---------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'document_files' AND column_name = 'borrower_id'
  ) THEN
    INSERT INTO public.document_files_borrowers (document_file_id, borrower_id, created_at, created_by)
    SELECT
        df.id,
        df.borrower_id,
        COALESCE(df.created_at, now()),
        df.uploaded_by
    FROM public.document_files df
    WHERE df.borrower_id IS NOT NULL
    ON CONFLICT (document_file_id, borrower_id) DO NOTHING;
    RAISE NOTICE 'Migrated document_files.borrower_id';
  ELSE
    RAISE NOTICE 'Skipping borrower_id migration; column already dropped';
  END IF;
END $$;

---------------------------------------------------------------
-- Step 3: Migrate document_files.property_id to document_files_properties
---------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'document_files' AND column_name = 'property_id'
  ) THEN
    INSERT INTO public.document_files_properties (document_file_id, property_id, created_at, created_by)
    SELECT
        df.id,
        df.property_id,
        COALESCE(df.created_at, now()),
        df.uploaded_by
    FROM public.document_files df
    WHERE df.property_id IS NOT NULL
    ON CONFLICT (document_file_id, property_id) DO NOTHING;
    RAISE NOTICE 'Migrated document_files.property_id';
  ELSE
    RAISE NOTICE 'Skipping property_id migration; column already dropped';
  END IF;
END $$;

---------------------------------------------------------------
-- Step 4: Migrate document_files.guarantor_id to document_files_guarantors
---------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'document_files' AND column_name = 'guarantor_id'
  ) THEN
    INSERT INTO public.document_files_guarantors (document_file_id, guarantor_id, created_at, created_by)
    SELECT
        df.id,
        df.guarantor_id,
        COALESCE(df.created_at, now()),
        df.uploaded_by
    FROM public.document_files df
    WHERE df.guarantor_id IS NOT NULL
    ON CONFLICT (document_file_id, guarantor_id) DO NOTHING;
    RAISE NOTICE 'Migrated document_files.guarantor_id';
  ELSE
    RAISE NOTICE 'Skipping guarantor_id migration; column already dropped';
  END IF;
END $$;

---------------------------------------------------------------
-- Step 5: Migrate document_files.entity_id to document_files_companies
---------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'document_files' AND column_name = 'entity_id'
  ) THEN
    INSERT INTO public.document_files_companies (document_file_id, company_id, created_at, created_by)
    SELECT
        df.id,
        df.entity_id,
        COALESCE(df.created_at, now()),
        df.uploaded_by
    FROM public.document_files df
    WHERE df.entity_id IS NOT NULL
    ON CONFLICT (document_file_id, company_id) DO NOTHING;
    RAISE NOTICE 'Migrated document_files.entity_id';
  ELSE
    RAISE NOTICE 'Skipping entity_id migration; column already dropped';
  END IF;
END $$;

---------------------------------------------------------------
-- Step 6: Migrate file_path/file_url to storage_bucket/storage_path
---------------------------------------------------------------
DO $$
DECLARE
  has_file_path boolean;
  has_file_url boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'document_files' AND column_name = 'file_path'
  ) INTO has_file_path;
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'document_files' AND column_name = 'file_url'
  ) INTO has_file_url;

  IF has_file_path AND has_file_url THEN
    UPDATE public.document_files
    SET
        storage_bucket = 'documents',
        storage_path = COALESCE(file_path, file_url)
    WHERE
        (storage_bucket IS NULL OR storage_path IS NULL)
        AND (file_path IS NOT NULL OR file_url IS NOT NULL);
    RAISE NOTICE 'Updated storage columns from file_path/file_url';
  ELSIF has_file_path THEN
    UPDATE public.document_files
    SET
        storage_bucket = 'documents',
        storage_path = file_path
    WHERE
        (storage_bucket IS NULL OR storage_path IS NULL)
        AND file_path IS NOT NULL;
    RAISE NOTICE 'Updated storage columns from file_path';
  ELSIF has_file_url THEN
    UPDATE public.document_files
    SET
        storage_bucket = 'documents',
        storage_path = file_url
    WHERE
        (storage_bucket IS NULL OR storage_path IS NULL)
        AND file_url IS NOT NULL;
    RAISE NOTICE 'Updated storage columns from file_url';
  ELSE
    RAISE NOTICE 'Skipping storage column copy; file_path/file_url already dropped';
  END IF;
END $$;

---------------------------------------------------------------
-- Step 7: Migrate document_investors to junction tables
---------------------------------------------------------------
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'document_investors') THEN
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
-- Summary
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
