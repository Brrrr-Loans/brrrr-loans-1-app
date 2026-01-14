-- ============================================================================
-- Migration: Refactor compound RLS policies into separate focused policies
-- ============================================================================
-- This migration splits compound "admin + other" policies into distinct,
-- single-responsibility policies for better clarity and maintainability.
--
-- Tables affected:
-- - bsi_distributions: 5 policies → 3 policies
-- - bs_debt_instruments_deals: 4 policies → 3 policies
-- ============================================================================

-- ============================================================================
-- SECTION 1: bsi_distributions
-- ============================================================================
-- Current: 5 policies (4 separate admin CRUD + 1 compound)
-- Target: 3 policies (1 admin manage + 2 user/org read)
-- ============================================================================

-- Drop the 4 separate admin CRUD policies
DROP POLICY IF EXISTS "Admin can select all distributions" ON "public"."bsi_distributions";
DROP POLICY IF EXISTS "Admins can delete distributions" ON "public"."bsi_distributions";
DROP POLICY IF EXISTS "Admins can insert distributions" ON "public"."bsi_distributions";
DROP POLICY IF EXISTS "Admins can update distributions" ON "public"."bsi_distributions";

-- Drop the compound policy
DROP POLICY IF EXISTS "Org members and admins can read distributions" ON "public"."bsi_distributions";

-- Drop legacy policy if exists (consolidating)
DROP POLICY IF EXISTS "Users can view distributions in their organizations" ON "public"."bsi_distributions";

-- (i) Org members can read distributions linked to their org
CREATE POLICY "Org members can read linked distributions"
ON "public"."bsi_distributions"
FOR SELECT
TO "authenticated"
USING (
  EXISTS (
    SELECT 1
    FROM public.auth_clerk_orgs_members m
    WHERE m.auth_clerk_users_id = public.get_current_user_id()
      AND m.clerk_org_id = bsi_distributions.clerk_org_id
  )
);

-- (ii) Users can read distributions directly linked to them
CREATE POLICY "Users can read own distributions"
ON "public"."bsi_distributions"
FOR SELECT
TO "authenticated"
USING (
  bsi_distributions.clerk_user_id = public.get_current_user_id()
);

-- (iii) Admin can manage (full CRUD)
CREATE POLICY "Admin can manage distributions"
ON "public"."bsi_distributions"
TO "authenticated"
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ============================================================================
-- SECTION 2: bs_debt_instruments_deals
-- ============================================================================
-- Current: 4 policies (3 separate admin CRUD + 1 compound)
-- Target: 3 policies (1 admin manage + 2 user/org read)
-- ============================================================================

-- Drop the 3 separate admin CRUD policies
DROP POLICY IF EXISTS "Admins can delete instrument-deal links" ON "public"."bs_debt_instruments_deals";
DROP POLICY IF EXISTS "Admins can insert instrument-deal links" ON "public"."bs_debt_instruments_deals";
DROP POLICY IF EXISTS "Admins can update instrument-deal links" ON "public"."bs_debt_instruments_deals";

-- Drop the compound policy
DROP POLICY IF EXISTS "Org members and admins can read instrument-deal links" ON "public"."bs_debt_instruments_deals";

-- (i) Org members can read instrument-deal links through deal-org membership
CREATE POLICY "Org members can read linked instrument-deals"
ON "public"."bs_debt_instruments_deals"
FOR SELECT
TO "authenticated"
USING (
  EXISTS (
    SELECT 1
    FROM public.bsi_deals_clerk_orgs dorg
    JOIN public.auth_clerk_orgs_members m ON m.clerk_org_id = dorg.clerk_org_id
    WHERE dorg.deal_id = bs_debt_instruments_deals.deal_id
      AND m.auth_clerk_users_id = public.get_current_user_id()
  )
);

-- (ii) Users can read instrument-deal links for deals they're directly linked to
CREATE POLICY "Users can read own instrument-deals"
ON "public"."bs_debt_instruments_deals"
FOR SELECT
TO "authenticated"
USING (
  EXISTS (
    SELECT 1
    FROM public.bsi_deals_clerk_users du
    WHERE du.deal_id = bs_debt_instruments_deals.deal_id
      AND du.clerk_user_id = public.get_current_user_id()
  )
);

-- (iii) Admin can manage (full CRUD)
CREATE POLICY "Admin can manage instrument-deal links"
ON "public"."bs_debt_instruments_deals"
TO "authenticated"
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ============================================================================
-- VERIFICATION
-- After running this migration, verify policies:
--
-- SELECT tablename, policyname, cmd 
-- FROM pg_policies 
-- WHERE tablename IN ('bsi_distributions', 'bs_debt_instruments_deals')
-- ORDER BY tablename, policyname;
--
-- Expected:
-- bsi_distributions:
--   - Admin can manage distributions (ALL)
--   - Org members can read linked distributions (SELECT)
--   - Users can read own distributions (SELECT)
--
-- bs_debt_instruments_deals:
--   - Admin can manage instrument-deal links (ALL)
--   - Org members can read linked instrument-deals (SELECT)
--   - Users can read own instrument-deals (SELECT)
-- ============================================================================
