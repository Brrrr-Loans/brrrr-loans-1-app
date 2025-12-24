-- Grant permissions on org_themes table
-- This migration is idempotent - handles both org_themes and auth_clerk_orgs_themes

DO $$
DECLARE
  target_table text;
BEGIN
  -- Determine which table exists
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'auth_clerk_orgs_themes') THEN
    target_table := 'auth_clerk_orgs_themes';
  ELSIF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'org_themes') THEN
    target_table := 'org_themes';
  ELSE
    RAISE NOTICE 'Neither org_themes nor auth_clerk_orgs_themes exists, skipping permissions';
    RETURN;
  END IF;

  -- Grant permissions
  EXECUTE format('GRANT ALL ON TABLE public.%I TO anon, authenticated, service_role', target_table);

  RAISE NOTICE 'Granted permissions on %', target_table;
END $$;

