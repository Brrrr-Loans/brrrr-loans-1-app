-- Migration: Add Org Member Read Policies to DEV
-- Date: 2026-01-28
-- Description: Add 2 policies from PROD to DEV for org member read access
--   These policies allow org members (not just admins) to read distributions
--   and instrument-deal links related to their organization.

-- ============================================================================
-- Policy 1: Org members and admins can read distributions
-- ============================================================================
-- Allows org members to see distributions for their organization
-- Uses auth_clerk_orgs_members to check org membership

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename = 'bsi_distributions' 
          AND policyname = 'Org members and admins can read distributions'
    ) THEN
        CREATE POLICY "Org members and admins can read distributions" 
        ON public.bsi_distributions 
        FOR SELECT 
        USING (
            public.is_admin() 
            OR EXISTS (
                SELECT 1
                FROM public.auth_clerk_orgs_members m
                WHERE m.auth_clerk_users_id = public.get_current_user_id()
                  AND m.clerk_org_id = bsi_distributions.clerk_org_id
            )
        );
        RAISE NOTICE 'Created policy: Org members and admins can read distributions';
    ELSE
        RAISE NOTICE 'Policy already exists: Org members and admins can read distributions';
    END IF;
END $$;

-- ============================================================================
-- Policy 2: Org members and admins can read instrument-deal links
-- ============================================================================
-- Allows org members to see which deals are linked to which instruments
-- Checks membership via bsi_deals_clerk_orgs junction table

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename = 'bs_debt_instruments_deals' 
          AND policyname = 'Org members and admins can read instrument-deal links'
    ) THEN
        CREATE POLICY "Org members and admins can read instrument-deal links" 
        ON public.bs_debt_instruments_deals 
        FOR SELECT 
        USING (
            public.is_admin() 
            OR EXISTS (
                SELECT 1
                FROM public.bsi_deals_clerk_orgs dorg
                JOIN public.auth_clerk_orgs_members m ON m.clerk_org_id = dorg.clerk_org_id
                WHERE dorg.deal_id = bs_debt_instruments_deals.deal_id
                  AND m.auth_clerk_users_id = public.get_current_user_id()
            )
        );
        RAISE NOTICE 'Created policy: Org members and admins can read instrument-deal links';
    ELSE
        RAISE NOTICE 'Policy already exists: Org members and admins can read instrument-deal links';
    END IF;
END $$;

-- ============================================================================
-- Verification query
-- ============================================================================
-- SELECT tablename, policyname FROM pg_policies 
-- WHERE schemaname = 'public' 
--   AND policyname LIKE 'Org members%'
-- ORDER BY tablename;
