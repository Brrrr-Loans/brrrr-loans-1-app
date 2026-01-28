-- Migration: Stage 1.4.a - Add Missing RLS Policies to contact_contact_types
-- Date: 2026-01-28
-- Description: Add 3 policies from DEV to PROD for the renamed contact_contact_types table
-- Note: These policies will be evaluated in Step 1.4.b for potential redundancy cleanup

-- ============================================================================
-- Add policies that exist in DEV but not in PROD
-- These are being added for parity before the cleanup phase
-- ============================================================================

-- Policy: Internal users can delete contact type links
-- Allows admins to delete contact type junction records
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename = 'contact_contact_types' 
          AND policyname = 'Internal users can delete contact type links'
    ) THEN
        CREATE POLICY "Internal users can delete contact type links" 
        ON public.contact_contact_types 
        FOR DELETE 
        TO authenticated 
        USING (public.is_admin());
        
        RAISE NOTICE 'Created policy: Internal users can delete contact type links';
    ELSE
        RAISE NOTICE 'Policy already exists: Internal users can delete contact type links';
    END IF;
END $$;

-- Policy: Internal users can manage contact type links (INSERT)
-- Allows admins to insert contact type junction records
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename = 'contact_contact_types' 
          AND policyname = 'Internal users can manage contact type links'
    ) THEN
        CREATE POLICY "Internal users can manage contact type links" 
        ON public.contact_contact_types 
        FOR INSERT 
        TO authenticated 
        WITH CHECK (public.is_admin());
        
        RAISE NOTICE 'Created policy: Internal users can manage contact type links';
    ELSE
        RAISE NOTICE 'Policy already exists: Internal users can manage contact type links';
    END IF;
END $$;

-- Policy: Internal users can update contact type links
-- Allows admins to update contact type junction records
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename = 'contact_contact_types' 
          AND policyname = 'Internal users can update contact type links'
    ) THEN
        CREATE POLICY "Internal users can update contact type links" 
        ON public.contact_contact_types 
        FOR UPDATE 
        TO authenticated 
        USING (public.is_admin()) 
        WITH CHECK (public.is_admin());
        
        RAISE NOTICE 'Created policy: Internal users can update contact type links';
    ELSE
        RAISE NOTICE 'Policy already exists: Internal users can update contact type links';
    END IF;
END $$;

-- ============================================================================
-- Verification query (run manually to confirm)
-- ============================================================================
-- SELECT policyname, cmd FROM pg_policies 
-- WHERE schemaname = 'public' AND tablename = 'contact_contact_types';
