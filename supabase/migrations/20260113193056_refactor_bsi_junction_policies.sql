-- ============================================================================
-- Migration: Refactor remaining BSI junction table policies
-- ============================================================================
-- These 2 policies were added earlier today and also need to use is_admin()
-- ============================================================================

-- bsi_distributions_transactions
DROP POLICY IF EXISTS "Admins can manage bsi_distributions_transactions" ON "public"."bsi_distributions_transactions";
CREATE POLICY "Admins can manage bsi_distributions_transactions" ON "public"."bsi_distributions_transactions"
  TO "authenticated"
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- bsi_statements_transactions
DROP POLICY IF EXISTS "Admins can manage bsi_statements_transactions" ON "public"."bsi_statements_transactions";
CREATE POLICY "Admins can manage bsi_statements_transactions" ON "public"."bsi_statements_transactions"
  TO "authenticated"
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
