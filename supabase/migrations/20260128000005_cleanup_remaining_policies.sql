-- Migration: Cleanup Remaining Redundant Policies
-- Date: 2026-01-28
-- Description: Drop policies that were missed in the first cleanup
--   - Old contact_contact_types_* policies (came with table rename)
--   - Update policies for distributions and instrument-deal links

-- ============================================================================
-- Drop old contact_contact_types policies that came with the table rename
-- These policies use USING(true) which is overly permissive and redundant
-- with the "Admin can manage contact type junctions" policy
-- ============================================================================

DROP POLICY IF EXISTS "contact_contact_types_delete_authenticated" ON public.contact_contact_types;
DROP POLICY IF EXISTS "contact_contact_types_insert_authenticated" ON public.contact_contact_types;
DROP POLICY IF EXISTS "contact_contact_types_update_authenticated" ON public.contact_contact_types;

-- ============================================================================
-- Drop redundant update policies (covered by "manage" policies)
-- ============================================================================

-- bsi_distributions: "Admin can manage distributions" already covers UPDATE
DROP POLICY IF EXISTS "Admins can update distributions" ON public.bsi_distributions;

-- bs_debt_instruments_deals: "Admin can manage instrument-deal links" already covers UPDATE  
DROP POLICY IF EXISTS "Admins can update instrument-deal links" ON public.bs_debt_instruments_deals;

-- ============================================================================
-- Verification query
-- ============================================================================
-- SELECT tablename, policyname FROM pg_policies 
-- WHERE schemaname = 'public' 
--   AND tablename IN ('contact_contact_types', 'bsi_distributions', 'bs_debt_instruments_deals')
-- ORDER BY tablename, policyname;
