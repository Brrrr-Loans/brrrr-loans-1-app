-- Migration: Stage 1.4.c - RLS Policy Cleanup
-- Date: 2026-01-28
-- Description: Remove redundant policies identified during analysis
--   - PROD: Drop 12 redundant policies (covered by existing "manage" policies)
--   - DEV: Drop 4 redundant policies (duplicate SELECT + redundant operation policies)
--   - Keep: Org member access policies in PROD

-- ============================================================================
-- PROD-specific cleanup: Drop policies on old table name (contacts_contact_types)
-- These are now invalid after table rename in migration 20260128000001
-- ============================================================================

-- Drop old policies that reference the old table name
-- Note: These might fail if table was already renamed - that's expected
DO $$
BEGIN
    -- Try to drop old policies on old table name (will fail gracefully if table renamed)
    DROP POLICY IF EXISTS "contact_contact_types_delete_authenticated" ON public.contacts_contact_types;
EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'Table contacts_contact_types does not exist (already renamed)';
END $$;

DO $$
BEGIN
    DROP POLICY IF EXISTS "contact_contact_types_insert_authenticated" ON public.contacts_contact_types;
EXCEPTION WHEN undefined_table THEN
    NULL; -- Already handled above
END $$;

DO $$
BEGIN
    DROP POLICY IF EXISTS "contact_contact_types_update_authenticated" ON public.contacts_contact_types;
EXCEPTION WHEN undefined_table THEN
    NULL; -- Already handled above
END $$;

-- ============================================================================
-- Drop redundant policies on bsi_distributions
-- "Admin can manage distributions" already covers SELECT, INSERT, UPDATE, DELETE
-- ============================================================================

DROP POLICY IF EXISTS "Admin can select all distributions" ON public.bsi_distributions;
DROP POLICY IF EXISTS "Admins can delete distributions" ON public.bsi_distributions;
DROP POLICY IF EXISTS "Admins can insert distributions" ON public.bsi_distributions;

-- NOTE: Keep "Org members and admins can read distributions" - provides org member access

-- ============================================================================
-- Drop redundant policies on bs_debt_instruments_deals
-- "Admin can manage instrument-deal links" already covers SELECT, INSERT, UPDATE, DELETE
-- ============================================================================

DROP POLICY IF EXISTS "Admins can delete instrument-deal links" ON public.bs_debt_instruments_deals;
DROP POLICY IF EXISTS "Admins can insert instrument-deal links" ON public.bs_debt_instruments_deals;

-- NOTE: Keep "Org members and admins can read instrument-deal links" - provides org member access

-- ============================================================================
-- Drop redundant policies on deal
-- "Admin full access to deals" already covers SELECT, INSERT, UPDATE, DELETE
-- ============================================================================

DROP POLICY IF EXISTS "Admin can select all deals" ON public.deal;
DROP POLICY IF EXISTS "Admin can delete deals" ON public.deal;
DROP POLICY IF EXISTS "Admin can insert deals" ON public.deal;
DROP POLICY IF EXISTS "Admin can update deals" ON public.deal;

-- ============================================================================
-- Drop redundant policy on task_templates
-- "Admin can manage task templates" already covers SELECT, INSERT, UPDATE, DELETE
-- ============================================================================

DROP POLICY IF EXISTS "Admin can read task templates" ON public.task_templates;

-- ============================================================================
-- DEV-specific cleanup: Drop duplicate and redundant policies on contact_contact_types
-- ============================================================================

-- Drop duplicate SELECT policy (keep "All authenticated users can read contact type junctions")
DROP POLICY IF EXISTS "contact_contact_types_select_authenticated" ON public.contact_contact_types;

-- Drop operation-specific policies that are redundant with "Admin can manage contact type junctions"
-- Note: We just added these in migration 20260128000002 for PROD parity, but they're redundant
-- The "Admin can manage contact type junctions" policy already covers all operations
DROP POLICY IF EXISTS "Internal users can delete contact type links" ON public.contact_contact_types;
DROP POLICY IF EXISTS "Internal users can manage contact type links" ON public.contact_contact_types;
DROP POLICY IF EXISTS "Internal users can update contact type links" ON public.contact_contact_types;

-- ============================================================================
-- Verification query (run manually to confirm policy counts)
-- ============================================================================
-- SELECT tablename, COUNT(*) as policy_count 
-- FROM pg_policies 
-- WHERE schemaname = 'public' 
--   AND tablename IN ('bsi_distributions', 'bs_debt_instruments_deals', 'deal', 'task_templates', 'contact_contact_types')
-- GROUP BY tablename
-- ORDER BY tablename;

-- Expected results after cleanup:
-- bsi_distributions: should have "Admin can manage distributions" + "Org members and admins can read distributions"
-- bs_debt_instruments_deals: should have "Admin can manage instrument-deal links" + "Org members and admins can read instrument-deal links"
-- deal: should have "Admin full access to deals" + other non-admin policies
-- task_templates: should have "Admin can manage task templates"
-- contact_contact_types: should have "Admin can manage contact type junctions" + "All authenticated users can read contact type junctions"
