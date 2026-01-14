-- ============================================================================
-- Migration: Refactor RLS policies to use is_admin() function
-- ============================================================================
-- This migration refactors 63 RLS policies that use inline admin checks
-- to use the is_admin() function instead, improving consistency and
-- maintainability.
--
-- The is_admin() function contains the same logic:
--   SELECT EXISTS (
--     SELECT 1 FROM public.auth_clerk_users acu
--     WHERE acu.clerk_user_id = ((select auth.jwt()) ->> 'sub'::text)
--     AND acu.role = 'admin'::public.user_role_internal
--   );
-- ============================================================================

-- ============================================================================
-- SECTION 1: Simple "Admin can manage" policies (ALL operations)
-- These policies grant full CRUD access to admins
-- ============================================================================

-- borrower
DROP POLICY IF EXISTS "Admin can manage borrower" ON "public"."borrower";
CREATE POLICY "Admin can manage borrower" ON "public"."borrower"
  TO "authenticated"
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- cba_requests
DROP POLICY IF EXISTS "Admin can manage CBA requests" ON "public"."cba_requests";
CREATE POLICY "Admin can manage CBA requests" ON "public"."cba_requests"
  TO "authenticated"
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- cba_requests_guarantors
DROP POLICY IF EXISTS "Admin can manage CBA request guarantors" ON "public"."cba_requests_guarantors";
CREATE POLICY "Admin can manage CBA request guarantors" ON "public"."cba_requests_guarantors"
  TO "authenticated"
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- company
DROP POLICY IF EXISTS "Admin can manage company" ON "public"."company";
CREATE POLICY "Admin can manage company" ON "public"."company"
  TO "authenticated"
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- company_contact
DROP POLICY IF EXISTS "Admin can manage company contacts" ON "public"."company_contact";
CREATE POLICY "Admin can manage company contacts" ON "public"."company_contact"
  TO "authenticated"
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- company_member
DROP POLICY IF EXISTS "Admin can manage company members" ON "public"."company_member";
CREATE POLICY "Admin can manage company members" ON "public"."company_member"
  TO "authenticated"
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- company_roles
DROP POLICY IF EXISTS "Admin can manage company roles" ON "public"."company_roles";
CREATE POLICY "Admin can manage company roles" ON "public"."company_roles"
  TO "authenticated"
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- company_roles_defined
DROP POLICY IF EXISTS "Admin can manage company role definitions" ON "public"."company_roles_defined";
CREATE POLICY "Admin can manage company role definitions" ON "public"."company_roles_defined"
  TO "authenticated"
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- constants
DROP POLICY IF EXISTS "Admin can manage constants" ON "public"."constants";
CREATE POLICY "Admin can manage constants" ON "public"."constants"
  TO "authenticated"
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- contact
DROP POLICY IF EXISTS "Admin can manage contacts" ON "public"."contact";
CREATE POLICY "Admin can manage contacts" ON "public"."contact"
  TO "authenticated"
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- contact_types
DROP POLICY IF EXISTS "Admin can manage contact types" ON "public"."contact_types";
CREATE POLICY "Admin can manage contact types" ON "public"."contact_types"
  TO "authenticated"
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- contact_contact_types
DROP POLICY IF EXISTS "Admin can manage contact type junctions" ON "public"."contact_contact_types";
CREATE POLICY "Admin can manage contact type junctions" ON "public"."contact_contact_types"
  TO "authenticated"
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- custom_loan_fees
DROP POLICY IF EXISTS "Admin can manage custom loan fees" ON "public"."custom_loan_fees";
CREATE POLICY "Admin can manage custom loan fees" ON "public"."custom_loan_fees"
  TO "authenticated"
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- deal_appraisals
DROP POLICY IF EXISTS "Admin can manage deal appraisals" ON "public"."deal_appraisals";
CREATE POLICY "Admin can manage deal appraisals" ON "public"."deal_appraisals"
  TO "authenticated"
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- deal_property
DROP POLICY IF EXISTS "Admin can manage deal properties" ON "public"."deal_property";
CREATE POLICY "Admin can manage deal properties" ON "public"."deal_property"
  TO "authenticated"
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- document_roles
DROP POLICY IF EXISTS "Admin can manage document roles" ON "public"."document_roles";
CREATE POLICY "Admin can manage document roles" ON "public"."document_roles"
  TO "authenticated"
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- document_roles_files
DROP POLICY IF EXISTS "Admin can manage document role assignments" ON "public"."document_roles_files";
CREATE POLICY "Admin can manage document role assignments" ON "public"."document_roles_files"
  TO "authenticated"
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- fee
DROP POLICY IF EXISTS "Admin can manage fees" ON "public"."fee";
CREATE POLICY "Admin can manage fees" ON "public"."fee"
  TO "authenticated"
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- loan_application
DROP POLICY IF EXISTS "Admin can manage loan_application" ON "public"."loan_application";
CREATE POLICY "Admin can manage loan_application" ON "public"."loan_application"
  TO "authenticated"
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- milestone_templates
DROP POLICY IF EXISTS "Admin can manage milestone templates" ON "public"."milestone_templates";
CREATE POLICY "Admin can manage milestone templates" ON "public"."milestone_templates"
  TO "authenticated"
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- milestones
DROP POLICY IF EXISTS "Admin can manage milestones" ON "public"."milestones";
CREATE POLICY "Admin can manage milestones" ON "public"."milestones"
  TO "authenticated"
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- payroll_ledger
DROP POLICY IF EXISTS "Admin can manage payroll submissions" ON "public"."payroll_ledger";
CREATE POLICY "Admin can manage payroll submissions" ON "public"."payroll_ledger"
  TO "authenticated"
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- payroll_ledger_fees_1099
DROP POLICY IF EXISTS "Admin can manage payroll fees" ON "public"."payroll_ledger_fees_1099";
CREATE POLICY "Admin can manage payroll fees" ON "public"."payroll_ledger_fees_1099"
  TO "authenticated"
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- property
DROP POLICY IF EXISTS "Admin can manage property" ON "public"."property";
CREATE POLICY "Admin can manage property" ON "public"."property"
  TO "authenticated"
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- property_income
DROP POLICY IF EXISTS "Admin can manage property income" ON "public"."property_income";
CREATE POLICY "Admin can manage property income" ON "public"."property_income"
  TO "authenticated"
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- select_uw_outcomes
DROP POLICY IF EXISTS "Admin can manage UW outcomes" ON "public"."select_uw_outcomes";
CREATE POLICY "Admin can manage UW outcomes" ON "public"."select_uw_outcomes"
  TO "authenticated"
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- task_templates (manage policy)
DROP POLICY IF EXISTS "Admin can manage task templates" ON "public"."task_templates";
CREATE POLICY "Admin can manage task templates" ON "public"."task_templates"
  TO "authenticated"
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- task_templates (read policy)
DROP POLICY IF EXISTS "Admin can read task templates" ON "public"."task_templates";
CREATE POLICY "Admin can read task templates" ON "public"."task_templates"
  FOR SELECT
  TO "authenticated"
  USING (public.is_admin());

-- ============================================================================
-- SECTION 2: Separate CRUD policies for specific tables
-- ============================================================================

-- appraisal
DROP POLICY IF EXISTS "Admin can access all appraisals" ON "public"."appraisal";
CREATE POLICY "Admin can access all appraisals" ON "public"."appraisal"
  TO "authenticated"
  USING (public.is_admin());

-- deal (4 policies)
DROP POLICY IF EXISTS "Admin can delete deals" ON "public"."deal";
CREATE POLICY "Admin can delete deals" ON "public"."deal"
  FOR DELETE
  TO "authenticated"
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admin can insert deals" ON "public"."deal";
CREATE POLICY "Admin can insert deals" ON "public"."deal"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin can select all deals" ON "public"."deal";
CREATE POLICY "Admin can select all deals" ON "public"."deal"
  FOR SELECT
  TO "authenticated"
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admin can update deals" ON "public"."deal";
CREATE POLICY "Admin can update deals" ON "public"."deal"
  FOR UPDATE
  TO "authenticated"
  USING (public.is_admin());

-- document_files (4 policies)
DROP POLICY IF EXISTS "Admin can delete documents" ON "public"."document_files";
CREATE POLICY "Admin can delete documents" ON "public"."document_files"
  FOR DELETE
  TO "authenticated"
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admin can insert documents" ON "public"."document_files";
CREATE POLICY "Admin can insert documents" ON "public"."document_files"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin can select all documents" ON "public"."document_files";
CREATE POLICY "Admin can select all documents" ON "public"."document_files"
  FOR SELECT
  TO "authenticated"
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admin can update documents" ON "public"."document_files";
CREATE POLICY "Admin can update documents" ON "public"."document_files"
  FOR UPDATE
  TO "authenticated"
  USING (public.is_admin());

-- ============================================================================
-- SECTION 3: BSI module policies
-- ============================================================================

-- bsi_deals_clerk_users
DROP POLICY IF EXISTS "Admin can select all bsi_deals_clerk_users" ON "public"."bsi_deals_clerk_users";
CREATE POLICY "Admin can select all bsi_deals_clerk_users" ON "public"."bsi_deals_clerk_users"
  FOR SELECT
  TO "authenticated"
  USING (public.is_admin());

-- bsi_deals_clerk_orgs (3 policies)
DROP POLICY IF EXISTS "Only admins can delete bsi_deals_clerk_orgs" ON "public"."bsi_deals_clerk_orgs";
CREATE POLICY "Only admins can delete bsi_deals_clerk_orgs" ON "public"."bsi_deals_clerk_orgs"
  FOR DELETE
  TO "authenticated"
  USING (public.is_admin());

DROP POLICY IF EXISTS "Only admins can insert bsi_deals_clerk_orgs" ON "public"."bsi_deals_clerk_orgs";
CREATE POLICY "Only admins can insert bsi_deals_clerk_orgs" ON "public"."bsi_deals_clerk_orgs"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Only admins can update bsi_deals_clerk_orgs" ON "public"."bsi_deals_clerk_orgs";
CREATE POLICY "Only admins can update bsi_deals_clerk_orgs" ON "public"."bsi_deals_clerk_orgs"
  FOR UPDATE
  TO "authenticated"
  USING (public.is_admin());

-- bsi_distributions (4 admin policies)
DROP POLICY IF EXISTS "Admin can select all distributions" ON "public"."bsi_distributions";
CREATE POLICY "Admin can select all distributions" ON "public"."bsi_distributions"
  FOR SELECT
  TO "authenticated"
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete distributions" ON "public"."bsi_distributions";
CREATE POLICY "Admins can delete distributions" ON "public"."bsi_distributions"
  FOR DELETE
  TO "authenticated"
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert distributions" ON "public"."bsi_distributions";
CREATE POLICY "Admins can insert distributions" ON "public"."bsi_distributions"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update distributions" ON "public"."bsi_distributions";
CREATE POLICY "Admins can update distributions" ON "public"."bsi_distributions"
  FOR UPDATE
  TO "authenticated"
  USING (public.is_admin());

-- bsi_statements (4 policies)
DROP POLICY IF EXISTS "Admin can select all statements" ON "public"."bsi_statements";
CREATE POLICY "Admin can select all statements" ON "public"."bsi_statements"
  FOR SELECT
  TO "authenticated"
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete statements" ON "public"."bsi_statements";
CREATE POLICY "Admins can delete statements" ON "public"."bsi_statements"
  FOR DELETE
  TO "authenticated"
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert statements" ON "public"."bsi_statements";
CREATE POLICY "Admins can insert statements" ON "public"."bsi_statements"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update statements" ON "public"."bsi_statements";
CREATE POLICY "Admins can update statements" ON "public"."bsi_statements"
  FOR UPDATE
  TO "authenticated"
  USING (public.is_admin());

-- bsi_transactions (3 policies)
DROP POLICY IF EXISTS "Admins can delete transactions" ON "public"."bsi_transactions";
CREATE POLICY "Admins can delete transactions" ON "public"."bsi_transactions"
  FOR DELETE
  TO "authenticated"
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert transactions" ON "public"."bsi_transactions";
CREATE POLICY "Admins can insert transactions" ON "public"."bsi_transactions"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update transactions" ON "public"."bsi_transactions";
CREATE POLICY "Admins can update transactions" ON "public"."bsi_transactions"
  FOR UPDATE
  TO "authenticated"
  USING (public.is_admin());

-- ============================================================================
-- SECTION 4: Debt instruments policies
-- ============================================================================

-- bs_debt_instruments (4 policies)
DROP POLICY IF EXISTS "Admins can delete instruments" ON "public"."bs_debt_instruments";
CREATE POLICY "Admins can delete instruments" ON "public"."bs_debt_instruments"
  FOR DELETE
  TO "authenticated"
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert instruments" ON "public"."bs_debt_instruments";
CREATE POLICY "Admins can insert instruments" ON "public"."bs_debt_instruments"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can read all instruments" ON "public"."bs_debt_instruments";
CREATE POLICY "Admins can read all instruments" ON "public"."bs_debt_instruments"
  FOR SELECT
  TO "authenticated"
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update instruments" ON "public"."bs_debt_instruments";
CREATE POLICY "Admins can update instruments" ON "public"."bs_debt_instruments"
  FOR UPDATE
  TO "authenticated"
  USING (public.is_admin());

-- bs_debt_instruments_deals (3 admin policies)
DROP POLICY IF EXISTS "Admins can delete instrument-deal links" ON "public"."bs_debt_instruments_deals";
CREATE POLICY "Admins can delete instrument-deal links" ON "public"."bs_debt_instruments_deals"
  FOR DELETE
  TO "authenticated"
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert instrument-deal links" ON "public"."bs_debt_instruments_deals";
CREATE POLICY "Admins can insert instrument-deal links" ON "public"."bs_debt_instruments_deals"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update instrument-deal links" ON "public"."bs_debt_instruments_deals";
CREATE POLICY "Admins can update instrument-deal links" ON "public"."bs_debt_instruments_deals"
  FOR UPDATE
  TO "authenticated"
  USING (public.is_admin());

-- ============================================================================
-- SECTION 5: Brex integration policies
-- ============================================================================

-- api_brex_transfers_vendors
DROP POLICY IF EXISTS "Admins can manage transfer-vendor matches" ON "public"."api_brex_transfers_vendors";
CREATE POLICY "Admins can manage transfer-vendor matches" ON "public"."api_brex_transfers_vendors"
  TO "authenticated"
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================================
-- SECTION 6: Compound policies (admin + other conditions)
-- These require special handling to preserve the non-admin conditions
-- ============================================================================

-- tasks: Admin OR user is assigned to the task
DROP POLICY IF EXISTS "Admin and assigned users can manage tasks" ON "public"."tasks";
CREATE POLICY "Admin and assigned users can manage tasks" ON "public"."tasks"
  TO "authenticated"
  USING (
    public.is_admin() 
    OR 
    (public.get_current_user_id() = "tasks"."assigned_to")
  );

-- bsi_distributions: Admin OR user is member of the org
DROP POLICY IF EXISTS "Org members and admins can read distributions" ON "public"."bsi_distributions";
CREATE POLICY "Org members and admins can read distributions" ON "public"."bsi_distributions"
  FOR SELECT
  USING (
    public.is_admin()
    OR
    EXISTS (
      SELECT 1
      FROM public.auth_clerk_orgs_members m
      WHERE m.auth_clerk_users_id = public.get_current_user_id()
        AND m.clerk_org_id = bsi_distributions.clerk_org_id
    )
  );

-- bs_debt_instruments_deals: Admin OR user has access through deal-org membership
DROP POLICY IF EXISTS "Org members and admins can read instrument-deal links" ON "public"."bs_debt_instruments_deals";
CREATE POLICY "Org members and admins can read instrument-deal links" ON "public"."bs_debt_instruments_deals"
  FOR SELECT
  USING (
    public.is_admin()
    OR
    EXISTS (
      SELECT 1
      FROM public.bsi_deals_clerk_orgs dorg
      JOIN public.auth_clerk_orgs_members m ON m.clerk_org_id = dorg.clerk_org_id
      WHERE dorg.deal_id = bs_debt_instruments_deals.deal_id
        AND m.auth_clerk_users_id = public.get_current_user_id()
    )
  );

-- ============================================================================
-- VERIFICATION
-- After running this migration, verify with:
-- 
-- SELECT COUNT(*) as policies_using_is_admin
-- FROM pg_policies 
-- WHERE qual::text LIKE '%is_admin%' OR with_check::text LIKE '%is_admin%';
-- 
-- Expected: ~99 policies (36 existing + 63 refactored)
-- ============================================================================

-- ============================================================================
-- SECTION 7: BSI junction table policies (added for completeness)
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
