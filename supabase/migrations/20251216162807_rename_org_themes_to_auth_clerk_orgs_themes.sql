-- Rename org_themes to auth_clerk_orgs_themes
-- This migration is idempotent - only renames if org_themes exists and auth_clerk_orgs_themes doesn't

DO $$
BEGIN
  -- Only rename if org_themes exists but auth_clerk_orgs_themes doesn't
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'org_themes')
     AND NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'auth_clerk_orgs_themes') THEN
    
    ALTER TABLE public.org_themes RENAME TO auth_clerk_orgs_themes;
    
    -- Rename constraints (only if they exist with the old names)
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'org_themes_pkey') THEN
      ALTER TABLE public.auth_clerk_orgs_themes 
        RENAME CONSTRAINT org_themes_pkey TO auth_clerk_orgs_themes_pkey;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'org_themes_org_id_fkey') 
       AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'auth_clerk_orgs_themes_org_id_fkey') THEN
      ALTER TABLE public.auth_clerk_orgs_themes 
        RENAME CONSTRAINT org_themes_org_id_fkey TO auth_clerk_orgs_themes_org_id_fkey;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'org_themes_created_by_user_id_fkey')
       AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'auth_clerk_orgs_themes_created_by_user_id_fkey') THEN
      ALTER TABLE public.auth_clerk_orgs_themes 
        RENAME CONSTRAINT org_themes_created_by_user_id_fkey TO auth_clerk_orgs_themes_created_by_user_id_fkey;
    END IF;
    
    RAISE NOTICE 'Renamed org_themes to auth_clerk_orgs_themes';
  ELSIF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'auth_clerk_orgs_themes') THEN
    RAISE NOTICE 'auth_clerk_orgs_themes already exists, skipping rename';
  ELSE
    RAISE NOTICE 'org_themes does not exist, skipping rename';
  END IF;
END $$;

