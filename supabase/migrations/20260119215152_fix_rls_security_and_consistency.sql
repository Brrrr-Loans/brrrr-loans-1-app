-- =============================================================================
-- Migration: Fix RLS Security and Consistency
-- =============================================================================
-- This migration addresses:
-- 1. Priority 1: Fix wide-open deal_roles and deal_guarantors policies
-- 2. Priority 2: Implement entity-based document access
-- 3. Priority 3: Add org admin capabilities for org members
-- 4. Fix overlapping policies
-- 5. Standardize naming to "{Subject} can {action}" pattern
-- =============================================================================

-- =============================================================================
-- STEP 1: Update is_admin() to check both personal_role AND is_internal_yn
-- =============================================================================
-- Now is_admin() explicitly checks is_internal_yn = true

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.auth_clerk_users
    WHERE clerk_user_id = public.get_clerk_user_id()
    AND personal_role = 'admin'
    AND is_internal_yn = true
  );
$$;

COMMENT ON FUNCTION public.is_admin IS 
  'Returns true if user has personal_role=admin AND is_internal_yn=true. Equivalent to is_internal_admin().';

-- =============================================================================
-- PRIORITY 1: Fix wide-open deal_roles policies
-- =============================================================================

-- Drop dangerous wide-open policies
DROP POLICY IF EXISTS "deal_roles_delete_authenticated" ON public.deal_roles;
DROP POLICY IF EXISTS "deal_roles_insert_authenticated" ON public.deal_roles;
DROP POLICY IF EXISTS "deal_roles_update_authenticated" ON public.deal_roles;
DROP POLICY IF EXISTS "deal_roles_select_authenticated" ON public.deal_roles;

-- Create proper policies with "{Subject} can {action}" naming
DROP POLICY IF EXISTS "Internal users can manage deal roles" ON public.deal_roles;
CREATE POLICY "Internal users can manage deal roles"
ON public.deal_roles
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Users can view deal roles for deals they're assigned to
DROP POLICY IF EXISTS "Users can view their deal roles" ON public.deal_roles;
CREATE POLICY "Users can view their deal roles"
ON public.deal_roles
FOR SELECT TO authenticated
USING (
  auth_clerk_users_id = public.get_current_user_id()
  OR EXISTS (
    SELECT 1 FROM public.deal_roles dr2
    WHERE dr2.deal_id = deal_roles.deal_id
    AND dr2.auth_clerk_users_id = public.get_current_user_id()
  )
);

-- =============================================================================
-- PRIORITY 1: Fix wide-open deal_guarantors policies
-- =============================================================================

DROP POLICY IF EXISTS "deal_guarantors_delete_authenticated" ON public.deal_guarantors;
DROP POLICY IF EXISTS "deal_guarantors_insert_authenticated" ON public.deal_guarantors;
DROP POLICY IF EXISTS "deal_guarantors_update_authenticated" ON public.deal_guarantors;
DROP POLICY IF EXISTS "deal_guarantors_select_authenticated" ON public.deal_guarantors;

DROP POLICY IF EXISTS "Internal users can manage deal guarantors" ON public.deal_guarantors;
CREATE POLICY "Internal users can manage deal guarantors"
ON public.deal_guarantors
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Users can view guarantors for deals they're assigned to
DROP POLICY IF EXISTS "Users can view deal guarantors for their deals" ON public.deal_guarantors;
CREATE POLICY "Users can view deal guarantors for their deals"
ON public.deal_guarantors
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.deal_roles dr
    WHERE dr.deal_id = deal_guarantors.deal_id
    AND dr.auth_clerk_users_id = public.get_current_user_id()
  )
);

-- =============================================================================
-- PRIORITY 1: Fix wide-open contact_contact_types policies
-- =============================================================================
-- Note: Table may not exist in all environments, wrap in DO block

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'contact_contact_types') THEN
    DROP POLICY IF EXISTS "contact_contact_types_delete_authenticated" ON public.contact_contact_types;
    DROP POLICY IF EXISTS "contact_contact_types_insert_authenticated" ON public.contact_contact_types;
    DROP POLICY IF EXISTS "contact_contact_types_update_authenticated" ON public.contact_contact_types;
    
    -- Create proper policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contact_contact_types' AND policyname = 'Internal users can manage contact type links') THEN
      CREATE POLICY "Internal users can manage contact type links"
      ON public.contact_contact_types
      FOR INSERT TO authenticated
      WITH CHECK (public.is_admin());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contact_contact_types' AND policyname = 'Internal users can update contact type links') THEN
      CREATE POLICY "Internal users can update contact type links"
      ON public.contact_contact_types
      FOR UPDATE TO authenticated
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contact_contact_types' AND policyname = 'Internal users can delete contact type links') THEN
      CREATE POLICY "Internal users can delete contact type links"
      ON public.contact_contact_types
      FOR DELETE TO authenticated
      USING (public.is_admin());
    END IF;
  END IF;
END $$;

-- =============================================================================
-- PRIORITY 2: Entity-based document access helper functions
-- =============================================================================
-- Access is granted if:
-- (a) User is admin, OR
-- (b) User's clerk_user_id is linked via document_files_clerk_users, OR
-- (c) User's org is linked via document_files_clerk_orgs, OR
-- (d) User has a deal_role on a deal linked to the same document

-- Check if user can access documents linked to a borrower
CREATE OR REPLACE FUNCTION public.can_access_borrower_document(p_borrower_id bigint)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    public.is_admin()
    OR
    -- User is directly linked to a document that's also linked to this borrower
    EXISTS (
      SELECT 1 FROM public.document_files_borrowers dfb
      JOIN public.document_files_clerk_users dfcu ON dfb.document_file_id = dfcu.document_file_id
      WHERE dfb.borrower_id = p_borrower_id
      AND dfcu.clerk_user_id = public.get_current_user_id()
    )
    OR
    -- User's org is linked to a document that's also linked to this borrower
    EXISTS (
      SELECT 1 FROM public.document_files_borrowers dfb
      JOIN public.document_files_clerk_orgs dfco ON dfb.document_file_id = dfco.document_file_id
      WHERE dfb.borrower_id = p_borrower_id
      AND dfco.clerk_org_id = ANY(public.get_current_user_org_ids())
    )
    OR
    -- User has deal role on a deal that has a document linked to this borrower
    EXISTS (
      SELECT 1 FROM public.document_files_borrowers dfb
      JOIN public.document_files_deals dfd ON dfb.document_file_id = dfd.document_file_id
      JOIN public.deal_roles dr ON dfd.deal_id = dr.deal_id
      WHERE dfb.borrower_id = p_borrower_id
      AND dr.auth_clerk_users_id = public.get_current_user_id()
    );
$$;

COMMENT ON FUNCTION public.can_access_borrower_document IS 
  'Returns true if user can access documents linked to this borrower (via user/org/deal link)';

GRANT EXECUTE ON FUNCTION public.can_access_borrower_document TO authenticated;

-- Check if user can access documents linked to a company
CREATE OR REPLACE FUNCTION public.can_access_company_document(p_company_id bigint)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    public.is_admin()
    OR
    -- User is directly linked to a document that's also linked to this company
    EXISTS (
      SELECT 1 FROM public.document_files_companies dfc
      JOIN public.document_files_clerk_users dfcu ON dfc.document_file_id = dfcu.document_file_id
      WHERE dfc.company_id = p_company_id
      AND dfcu.clerk_user_id = public.get_current_user_id()
    )
    OR
    -- User's org is linked to a document that's also linked to this company
    EXISTS (
      SELECT 1 FROM public.document_files_companies dfc
      JOIN public.document_files_clerk_orgs dfco ON dfc.document_file_id = dfco.document_file_id
      WHERE dfc.company_id = p_company_id
      AND dfco.clerk_org_id = ANY(public.get_current_user_org_ids())
    )
    OR
    -- User has deal role on a deal that has a document linked to this company
    EXISTS (
      SELECT 1 FROM public.document_files_companies dfc
      JOIN public.document_files_deals dfd ON dfc.document_file_id = dfd.document_file_id
      JOIN public.deal_roles dr ON dfd.deal_id = dr.deal_id
      WHERE dfc.company_id = p_company_id
      AND dr.auth_clerk_users_id = public.get_current_user_id()
    );
$$;

COMMENT ON FUNCTION public.can_access_company_document IS 
  'Returns true if user can access documents linked to this company (via user/org/deal link)';

GRANT EXECUTE ON FUNCTION public.can_access_company_document TO authenticated;

-- Check if user can access documents linked to a property
CREATE OR REPLACE FUNCTION public.can_access_property_document(p_property_id bigint)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    public.is_admin()
    OR
    -- User is directly linked to a document that's also linked to this property
    EXISTS (
      SELECT 1 FROM public.document_files_properties dfp
      JOIN public.document_files_clerk_users dfcu ON dfp.document_file_id = dfcu.document_file_id
      WHERE dfp.property_id = p_property_id
      AND dfcu.clerk_user_id = public.get_current_user_id()
    )
    OR
    -- User's org is linked to a document that's also linked to this property
    EXISTS (
      SELECT 1 FROM public.document_files_properties dfp
      JOIN public.document_files_clerk_orgs dfco ON dfp.document_file_id = dfco.document_file_id
      WHERE dfp.property_id = p_property_id
      AND dfco.clerk_org_id = ANY(public.get_current_user_org_ids())
    )
    OR
    -- User has deal role on a deal that has a document linked to this property
    EXISTS (
      SELECT 1 FROM public.document_files_properties dfp
      JOIN public.document_files_deals dfd ON dfp.document_file_id = dfd.document_file_id
      JOIN public.deal_roles dr ON dfd.deal_id = dr.deal_id
      WHERE dfp.property_id = p_property_id
      AND dr.auth_clerk_users_id = public.get_current_user_id()
    );
$$;

COMMENT ON FUNCTION public.can_access_property_document IS 
  'Returns true if user can access documents linked to this property (via user/org/deal link)';

GRANT EXECUTE ON FUNCTION public.can_access_property_document TO authenticated;

-- Check if user can access documents linked to a guarantor
CREATE OR REPLACE FUNCTION public.can_access_guarantor_document(p_guarantor_id bigint)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    public.is_admin()
    OR
    -- User is directly linked to a document that's also linked to this guarantor
    EXISTS (
      SELECT 1 FROM public.document_files_guarantors dfg
      JOIN public.document_files_clerk_users dfcu ON dfg.document_file_id = dfcu.document_file_id
      WHERE dfg.guarantor_id = p_guarantor_id
      AND dfcu.clerk_user_id = public.get_current_user_id()
    )
    OR
    -- User's org is linked to a document that's also linked to this guarantor
    EXISTS (
      SELECT 1 FROM public.document_files_guarantors dfg
      JOIN public.document_files_clerk_orgs dfco ON dfg.document_file_id = dfco.document_file_id
      WHERE dfg.guarantor_id = p_guarantor_id
      AND dfco.clerk_org_id = ANY(public.get_current_user_org_ids())
    )
    OR
    -- User has deal role on a deal that has a document linked to this guarantor
    EXISTS (
      SELECT 1 FROM public.document_files_guarantors dfg
      JOIN public.document_files_deals dfd ON dfg.document_file_id = dfd.document_file_id
      JOIN public.deal_roles dr ON dfd.deal_id = dr.deal_id
      WHERE dfg.guarantor_id = p_guarantor_id
      AND dr.auth_clerk_users_id = public.get_current_user_id()
    );
$$;

COMMENT ON FUNCTION public.can_access_guarantor_document IS 
  'Returns true if user can access documents linked to this guarantor (via user/org/deal link)';

GRANT EXECUTE ON FUNCTION public.can_access_guarantor_document TO authenticated;

-- =============================================================================
-- PRIORITY 2: Add entity-based document access policies
-- =============================================================================

-- document_files_borrowers: View if linked to borrower via deal
DROP POLICY IF EXISTS "Users can view borrower documents for their deals" ON public.document_files_borrowers;
CREATE POLICY "Users can view borrower documents for their deals"
ON public.document_files_borrowers
FOR SELECT TO authenticated
USING (public.can_access_borrower_document(borrower_id));

-- document_files_companies: View if linked to company
DROP POLICY IF EXISTS "Users can view company documents for their deals" ON public.document_files_companies;
CREATE POLICY "Users can view company documents for their deals"
ON public.document_files_companies
FOR SELECT TO authenticated
USING (public.can_access_company_document(company_id));

-- document_files_properties: View if linked to property via deal
DROP POLICY IF EXISTS "Users can view property documents for their deals" ON public.document_files_properties;
CREATE POLICY "Users can view property documents for their deals"
ON public.document_files_properties
FOR SELECT TO authenticated
USING (public.can_access_property_document(property_id));

-- document_files_guarantors: View if linked to guarantor via deal
DROP POLICY IF EXISTS "Users can view guarantor documents for their deals" ON public.document_files_guarantors;
CREATE POLICY "Users can view guarantor documents for their deals"
ON public.document_files_guarantors
FOR SELECT TO authenticated
USING (public.can_access_guarantor_document(guarantor_id));

-- =============================================================================
-- PRIORITY 3: Org admin capabilities
-- =============================================================================

-- Org admins can manage their own org's members
DROP POLICY IF EXISTS "Org admins can manage own members" ON public.auth_clerk_orgs_members;
CREATE POLICY "Org admins can manage own members"
ON public.auth_clerk_orgs_members
FOR ALL TO authenticated
USING (public.is_org_admin(clerk_org_id))
WITH CHECK (public.is_org_admin(clerk_org_id));

-- Org admins can update their own org's details
DROP POLICY IF EXISTS "Org admins can update own org" ON public.auth_clerk_orgs;
CREATE POLICY "Org admins can update own org"
ON public.auth_clerk_orgs
FOR UPDATE TO authenticated
USING (public.is_org_admin(id))
WITH CHECK (public.is_org_admin(id));

-- =============================================================================
-- FIX #4: Remove duplicate/overlapping policies
-- =============================================================================

-- Fix duplicate auth_clerk_users profile policies
DROP POLICY IF EXISTS "Users can view their profile" ON public.auth_clerk_users;
-- Keep "Users can select their own profile" as it's more descriptive

-- =============================================================================
-- FIX #8: Rename policies for consistency (selected high-impact ones)
-- =============================================================================

-- Note: Full rename would require dropping and recreating many policies.
-- For now, new policies use the "{Subject} can {action}" pattern.
-- Existing policies can be renamed incrementally in future migrations.

-- =============================================================================
-- DOCUMENTATION
-- =============================================================================
-- 
-- POLICY NAMING CONVENTION: "{Subject} can {action} [scope]"
-- Examples:
--   - "Internal users can manage deal roles"
--   - "Users can view their deal roles"
--   - "Org admins can manage own members"
--
-- ACCESS HIERARCHY:
--   1. is_admin() - Internal staff (personal_role='admin' AND is_internal_yn=true)
--   2. is_org_admin(org_id) - Org member with clerk_org_role='admin'
--   3. Entity functions - can_access_*_document() for deal-linked access
--   4. Direct ownership - clerk_user_id = current user
--
-- =============================================================================
