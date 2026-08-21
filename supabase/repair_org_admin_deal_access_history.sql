-- Record 20260820120000_org_admin_deal_access as applied.
-- Run this in the Supabase SQL editor on DEV and PROD AFTER the migration SQL
-- itself has already been executed (dashboard "Success. No rows returned").
--
-- The SQL editor does not write supabase_migrations.schema_migrations.
-- This insert is what `supabase migration repair --status applied 20260820120000`
-- would do, so later `supabase db push` / `migration list` will not try to
-- re-apply the file.

INSERT INTO supabase_migrations.schema_migrations (version, name, statements)
VALUES (
  '20260820120000',
  'org_admin_deal_access',
  ARRAY['-- applied via SQL editor; see supabase/migrations/20260820120000_org_admin_deal_access.sql']
)
ON CONFLICT (version) DO NOTHING;
