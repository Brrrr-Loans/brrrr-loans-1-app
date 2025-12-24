-- Recreate RLS policies for org_themes table
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
    RAISE NOTICE 'Neither org_themes nor auth_clerk_orgs_themes exists, skipping RLS policies';
    RETURN;
  END IF;

  -- Drop existing policies if they exist
  EXECUTE format('DROP POLICY IF EXISTS "org_themes_admin_all" ON public.%I', target_table);
  EXECUTE format('DROP POLICY IF EXISTS "org_themes_member_read" ON public.%I', target_table);
  
  -- Create policies
  EXECUTE format('
    CREATE POLICY "org_themes_admin_all" ON public.%I
    FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM public.auth_clerk_users u
        WHERE u.clerk_user_id = (current_setting(''request.jwt.claims'', true)::json->>''sub'')
        AND u.role = ''admin''
      )
    )
  ', target_table);

  EXECUTE format('
    CREATE POLICY "org_themes_member_read" ON public.%I
    FOR SELECT
    USING (true)
  ', target_table);

  RAISE NOTICE 'Created RLS policies for %', target_table;
END $$;

