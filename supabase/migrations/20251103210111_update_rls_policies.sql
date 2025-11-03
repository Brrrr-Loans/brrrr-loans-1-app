-- Migration: Update RLS Policies
-- Generated from live database on 2025-11-03
-- This migration captures all current RLS policies from the production database

-- Note: This is a snapshot of all RLS policies as they exist in production
-- Individual policy updates should be done through separate, targeted migrations

-- ============================================================================
-- RLS Policies for auth_clerk_users
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role can insert new users" ON auth_clerk_users;
DROP POLICY IF EXISTS "Service role can read all profiles" ON auth_clerk_users;
DROP POLICY IF EXISTS "Service role can update user profiles" ON auth_clerk_users;
DROP POLICY IF EXISTS "Users can select their own profile" ON auth_clerk_users;
DROP POLICY IF EXISTS "Users can update their profile" ON auth_clerk_users;
DROP POLICY IF EXISTS "Users can view their profile" ON auth_clerk_users;

-- Recreate policies
CREATE POLICY "Service role can insert new users" ON auth_clerk_users
    FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Service role can read all profiles" ON auth_clerk_users
    FOR SELECT TO service_role USING (true);

CREATE POLICY "Service role can update user profiles" ON auth_clerk_users
    FOR UPDATE TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Users can select their own profile" ON auth_clerk_users
    FOR SELECT TO authenticated
    USING (clerk_user_id = (auth.jwt() ->> 'sub'::text));

CREATE POLICY "Users can update their profile" ON auth_clerk_users
    FOR UPDATE TO authenticated
    USING (clerk_user_id = (auth.jwt() ->> 'sub'::text))
    WITH CHECK (clerk_user_id = (auth.jwt() ->> 'sub'::text));

CREATE POLICY "Users can view their profile" ON auth_clerk_users
    FOR SELECT TO authenticated
    USING (clerk_user_id = (auth.jwt() ->> 'sub'::text));

-- ============================================================================
-- RLS Policies for auth_clerk_orgs
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own organizations" ON auth_clerk_orgs;

CREATE POLICY "Users can view their own organizations" ON auth_clerk_orgs
    FOR SELECT TO public
    USING (EXISTS (
        SELECT 1 FROM auth_clerk_orgs_members m
        JOIN auth_clerk_users p ON m.auth_clerk_users_id = p.id
        WHERE m.clerk_org_id = auth_clerk_orgs.id
        AND p.clerk_user_id = (auth.uid())::text
    ));

-- ============================================================================
-- RLS Policies for auth_clerk_orgs_members
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own organization memberships" ON auth_clerk_orgs_members;

CREATE POLICY "Users can view their own organization memberships" ON auth_clerk_orgs_members
    FOR SELECT TO public
    USING (EXISTS (
        SELECT 1 FROM auth_clerk_users p
        WHERE p.id = auth_clerk_orgs_members.auth_clerk_users_id
        AND p.clerk_user_id = (auth.uid())::text
    ));

-- ============================================================================
-- RLS Policies for bsi_deals
-- ============================================================================

DROP POLICY IF EXISTS "Admin can select all bsi_deals" ON bsi_deals;

CREATE POLICY "Admin can select all bsi_deals" ON bsi_deals
    FOR SELECT TO authenticated
    USING (EXISTS (
        SELECT 1 FROM auth_clerk_users acu
        WHERE acu.clerk_user_id = (auth.uid())::text
        AND acu.role = 'admin'::user_role_internal
    ));

-- ============================================================================
-- RLS Policies for bsi_deals_orgs
-- ============================================================================

DROP POLICY IF EXISTS "Only admins can link orgs to deals" ON bsi_deals_orgs;
DROP POLICY IF EXISTS "Only admins can unlink orgs from deals" ON bsi_deals_orgs;
DROP POLICY IF EXISTS "Only admins can update deal-org links" ON bsi_deals_orgs;
DROP POLICY IF EXISTS "Org members can read linked deals" ON bsi_deals_orgs;

CREATE POLICY "Only admins can link orgs to deals" ON bsi_deals_orgs
    FOR INSERT TO authenticated
    WITH CHECK (EXISTS (
        SELECT 1 FROM auth_clerk_users p
        WHERE p.clerk_user_id = (auth.uid())::text
        AND p.role = 'admin'::user_role_internal
    ));

CREATE POLICY "Only admins can unlink orgs from deals" ON bsi_deals_orgs
    FOR DELETE TO authenticated
    USING (EXISTS (
        SELECT 1 FROM auth_clerk_users p
        WHERE p.clerk_user_id = (auth.uid())::text
        AND p.role = 'admin'::user_role_internal
    ));

CREATE POLICY "Only admins can update deal-org links" ON bsi_deals_orgs
    FOR UPDATE TO authenticated
    USING (EXISTS (
        SELECT 1 FROM auth_clerk_users p
        WHERE p.clerk_user_id = (auth.uid())::text
        AND p.role = 'admin'::user_role_internal
    ));

CREATE POLICY "Org members can read linked deals" ON bsi_deals_orgs
    FOR SELECT TO public
    USING (EXISTS (
        SELECT 1 FROM auth_clerk_users p
        JOIN auth_clerk_orgs_members m ON p.id = m.auth_clerk_users_id
        WHERE m.clerk_org_id = bsi_deals_orgs.clerk_org_id
        AND p.clerk_user_id = (auth.uid())::text
    ));

-- ============================================================================
-- RLS Policies for bsi_distributions
-- ============================================================================

DROP POLICY IF EXISTS "Admin can select all distributions" ON bsi_distributions;
DROP POLICY IF EXISTS "Admins can delete distributions" ON bsi_distributions;
DROP POLICY IF EXISTS "Admins can insert distributions" ON bsi_distributions;
DROP POLICY IF EXISTS "Admins can update distributions" ON bsi_distributions;
DROP POLICY IF EXISTS "Org members and admins can read distributions" ON bsi_distributions;
DROP POLICY IF EXISTS "Users can view distributions in their organizations" ON bsi_distributions;

CREATE POLICY "Admin can select all distributions" ON bsi_distributions
    FOR SELECT TO authenticated
    USING (EXISTS (
        SELECT 1 FROM auth_clerk_users acu
        WHERE acu.clerk_user_id = (auth.uid())::text
        AND acu.role = 'admin'::user_role_internal
    ));

CREATE POLICY "Admins can delete distributions" ON bsi_distributions
    FOR DELETE TO authenticated
    USING (EXISTS (
        SELECT 1 FROM auth_clerk_users p
        WHERE p.clerk_user_id = (auth.uid())::text
        AND p.role = 'admin'::user_role_internal
    ));

CREATE POLICY "Admins can insert distributions" ON bsi_distributions
    FOR INSERT TO authenticated
    WITH CHECK (EXISTS (
        SELECT 1 FROM auth_clerk_users p
        WHERE p.clerk_user_id = (auth.uid())::text
        AND p.role = 'admin'::user_role_internal
    ));

CREATE POLICY "Admins can update distributions" ON bsi_distributions
    FOR UPDATE TO authenticated
    USING (EXISTS (
        SELECT 1 FROM auth_clerk_users p
        WHERE p.clerk_user_id = (auth.uid())::text
        AND p.role = 'admin'::user_role_internal
    ));

CREATE POLICY "Org members and admins can read distributions" ON bsi_distributions
    FOR SELECT TO public
    USING (EXISTS (
        SELECT 1 FROM auth_clerk_users p
        JOIN auth_clerk_orgs_members m ON p.id = m.auth_clerk_users_id
        WHERE p.clerk_user_id = (auth.uid())::text
        AND (p.role = 'admin'::user_role_internal OR m.clerk_org_id = bsi_distributions.clerk_org_id)
    ));

CREATE POLICY "Users can view distributions in their organizations" ON bsi_distributions
    FOR SELECT TO public
    USING (EXISTS (
        SELECT 1 FROM auth_clerk_orgs_members m
        JOIN auth_clerk_users p ON p.id = m.auth_clerk_users_id
        WHERE p.clerk_user_id = (auth.uid())::text
        AND m.clerk_org_id = bsi_distributions.clerk_org_id
    ));

-- ============================================================================
-- RLS Policies for bsi_statements
-- ============================================================================

DROP POLICY IF EXISTS "Admin can select all statements" ON bsi_statements;
DROP POLICY IF EXISTS "Admins can delete statements" ON bsi_statements;
DROP POLICY IF EXISTS "Admins can insert statements" ON bsi_statements;
DROP POLICY IF EXISTS "Admins can update statements" ON bsi_statements;
DROP POLICY IF EXISTS "Balance sheet investors can insert their own statements" ON bsi_statements;
DROP POLICY IF EXISTS "Balance sheet investors can select their statements" ON bsi_statements;

CREATE POLICY "Admin can select all statements" ON bsi_statements
    FOR SELECT TO authenticated
    USING (EXISTS (
        SELECT 1 FROM auth_clerk_users acu
        WHERE acu.clerk_user_id = (auth.jwt() ->> 'sub'::text)
        AND acu.role = 'admin'::user_role_internal
    ));

CREATE POLICY "Admins can delete statements" ON bsi_statements
    FOR DELETE TO authenticated
    USING (EXISTS (
        SELECT 1 FROM auth_clerk_users p
        WHERE p.clerk_user_id = (auth.jwt() ->> 'sub'::text)
        AND p.role = 'admin'::user_role_internal
    ));

CREATE POLICY "Admins can insert statements" ON bsi_statements
    FOR INSERT TO authenticated
    WITH CHECK (EXISTS (
        SELECT 1 FROM auth_clerk_users p
        WHERE p.clerk_user_id = (auth.jwt() ->> 'sub'::text)
        AND p.role = 'admin'::user_role_internal
    ));

CREATE POLICY "Admins can update statements" ON bsi_statements
    FOR UPDATE TO authenticated
    USING (EXISTS (
        SELECT 1 FROM auth_clerk_users p
        WHERE p.clerk_user_id = (auth.jwt() ->> 'sub'::text)
        AND p.role = 'admin'::user_role_internal
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM auth_clerk_users p
        WHERE p.clerk_user_id = (auth.jwt() ->> 'sub'::text)
        AND p.role = 'admin'::user_role_internal
    ));

CREATE POLICY "Balance sheet investors can insert their own statements" ON bsi_statements
    FOR INSERT TO authenticated
    WITH CHECK (EXISTS (
        SELECT 1 FROM auth_clerk_users acu
        WHERE acu.clerk_user_id = (auth.jwt() ->> 'sub'::text)
        AND acu.role = 'balance_sheet_investor'::user_role_internal
        AND bsi_statements.auth_clerk_users_id = acu.id
    ));

CREATE POLICY "Balance sheet investors can select their statements" ON bsi_statements
    FOR SELECT TO authenticated
    USING (EXISTS (
        SELECT 1 FROM auth_clerk_users acu
        WHERE acu.clerk_user_id = (auth.jwt() ->> 'sub'::text)
        AND (acu.role = 'admin'::user_role_internal OR (
            acu.role = 'balance_sheet_investor'::user_role_internal
            AND bsi_statements.auth_clerk_users_id = acu.id
        ))
    ));

-- ============================================================================
-- RLS Policies for bsi_transactions
-- ============================================================================

DROP POLICY IF EXISTS "Admins can delete transactions" ON bsi_transactions;
DROP POLICY IF EXISTS "Admins can insert transactions" ON bsi_transactions;
DROP POLICY IF EXISTS "Admins can update transactions" ON bsi_transactions;
DROP POLICY IF EXISTS "Org members and admins can read transactions" ON bsi_transactions;

CREATE POLICY "Admins can delete transactions" ON bsi_transactions
    FOR DELETE TO authenticated
    USING (EXISTS (
        SELECT 1 FROM auth_clerk_users p
        WHERE p.clerk_user_id = (auth.uid())::text
        AND p.role = 'admin'::user_role_internal
    ));

CREATE POLICY "Admins can insert transactions" ON bsi_transactions
    FOR INSERT TO authenticated
    WITH CHECK (EXISTS (
        SELECT 1 FROM auth_clerk_users p
        WHERE p.clerk_user_id = (auth.uid())::text
        AND p.role = 'admin'::user_role_internal
    ));

CREATE POLICY "Admins can update transactions" ON bsi_transactions
    FOR UPDATE TO authenticated
    USING (EXISTS (
        SELECT 1 FROM auth_clerk_users p
        WHERE p.clerk_user_id = (auth.uid())::text
        AND p.role = 'admin'::user_role_internal
    ));

CREATE POLICY "Org members and admins can read transactions" ON bsi_transactions
    FOR SELECT TO public
    USING (EXISTS (
        SELECT 1 FROM auth_clerk_users p
        JOIN auth_clerk_orgs_members m ON p.id = m.auth_clerk_users_id
        WHERE p.clerk_user_id = (auth.uid())::text
        AND (p.role = 'admin'::user_role_internal OR m.clerk_org_id = bsi_transactions.clerk_org_id)
    ));

-- ============================================================================
-- RLS Policies for document_files
-- ============================================================================

DROP POLICY IF EXISTS "Admin can delete documents" ON document_files;
DROP POLICY IF EXISTS "Admin can insert documents" ON document_files;
DROP POLICY IF EXISTS "Admin can select all documents" ON document_files;
DROP POLICY IF EXISTS "Admin can update documents" ON document_files;
DROP POLICY IF EXISTS "Users can select their own documents" ON document_files;

CREATE POLICY "Admin can delete documents" ON document_files
    FOR DELETE TO authenticated
    USING (EXISTS (
        SELECT 1 FROM auth_clerk_users acu
        WHERE acu.clerk_user_id = (auth.uid())::text
        AND acu.role = 'admin'::user_role_internal
    ));

CREATE POLICY "Admin can insert documents" ON document_files
    FOR INSERT TO authenticated
    WITH CHECK (EXISTS (
        SELECT 1 FROM auth_clerk_users acu
        WHERE acu.clerk_user_id = (auth.uid())::text
        AND acu.role = 'admin'::user_role_internal
    ));

CREATE POLICY "Admin can select all documents" ON document_files
    FOR SELECT TO authenticated
    USING (EXISTS (
        SELECT 1 FROM auth_clerk_users acu
        WHERE acu.clerk_user_id = (auth.uid())::text
        AND acu.role = 'admin'::user_role_internal
    ));

CREATE POLICY "Admin can update documents" ON document_files
    FOR UPDATE TO authenticated
    USING (EXISTS (
        SELECT 1 FROM auth_clerk_users acu
        WHERE acu.clerk_user_id = (auth.uid())::text
        AND acu.role = 'admin'::user_role_internal
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM auth_clerk_users acu
        WHERE acu.clerk_user_id = (auth.uid())::text
        AND acu.role = 'admin'::user_role_internal
    ));

CREATE POLICY "Users can select their own documents" ON document_files
    FOR SELECT TO authenticated
    USING (uploaded_by = (auth.uid())::text);

-- ============================================================================
-- Note: Additional RLS policies exist for other tables including:
-- - bs_debt_instruments and related junction tables
-- - bsi_transactions_* junction tables  
-- - All legacy/loan origination tables (appraisal, borrower, deal, etc.)
-- 
-- This migration focuses on the core investor-facing tables.
-- For a complete dump of all 100+ RLS policies, use:
-- supabase db pull (requires Docker)
-- ============================================================================

