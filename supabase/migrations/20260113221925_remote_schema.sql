-- Stale `db pull` dump. Preview replays this after 20260113193056 already
-- created the junction policies with is_admin(), so CREATE POLICY without
-- DROP fails. auth_clerk_users.role also no longer exists.
-- Theme policy drops are IF EXISTS because 20251216155918 may already
-- have replaced them.

DROP POLICY IF EXISTS "org_themes_admin_all" ON "public"."auth_clerk_orgs_themes";
DROP POLICY IF EXISTS "org_themes_member_read" ON "public"."auth_clerk_orgs_themes";

DROP POLICY IF EXISTS "Admins can manage bsi_distributions_transactions" ON "public"."bsi_distributions_transactions";
CREATE POLICY "Admins can manage bsi_distributions_transactions"
  ON "public"."bsi_distributions_transactions"
  AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage bsi_statements_transactions" ON "public"."bsi_statements_transactions";
CREATE POLICY "Admins can manage bsi_statements_transactions"
  ON "public"."bsi_statements_transactions"
  AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
