-- =============================================================================
-- Migration: Document Intentional Public INSERT Policies
-- =============================================================================
-- Issue: Supabase Security Advisor flags 3 RLS policies as overly permissive
-- 
-- Context: These policies are INTENTIONAL because the tables store records
-- created via public form submissions:
--   1. company - Public intake form for new company registrations
--   2. loan_application - Public loan application intake form
--   3. property_reapi - Authenticated property lookups from RealEstateAPI
--
-- Resolution: Document the intent via comments. Warnings remain in Security
-- Advisor but are acknowledged as accepted business requirements.
-- =============================================================================

-- Document the intentional public form submission policies
COMMENT ON POLICY "Allow API Insert" ON public.company IS 
  'INTENTIONAL: Allows anonymous inserts for public form submissions. Security Advisor warning accepted.';

COMMENT ON POLICY "Allow API Insert" ON public.loan_application IS 
  'INTENTIONAL: Allows anonymous inserts for public loan application form submissions. Security Advisor warning accepted.';

COMMENT ON POLICY "Allow users to insert property records" ON public.property_reapi IS 
  'INTENTIONAL: Allows authenticated users to insert property records from RealEstateAPI lookups. Security Advisor warning accepted.';

-- Add table-level comments documenting the public form submission pattern
COMMENT ON TABLE public.company IS 
  'Company records. Supports anonymous INSERT via public intake forms (Security Advisor warning is intentional).';

COMMENT ON TABLE public.loan_application IS 
  'Loan application records. Supports anonymous INSERT via public intake forms (Security Advisor warning is intentional).';

COMMENT ON TABLE public.property_reapi IS 
  'Property data from RealEstateAPI. Supports authenticated INSERT for property lookups (Security Advisor warning is intentional).';
