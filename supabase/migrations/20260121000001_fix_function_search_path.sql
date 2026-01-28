-- =============================================================================
-- Migration: Fix Function Search Path Mutable Warnings
-- =============================================================================
-- Issue: Supabase Security Advisor flagged 9 functions with mutable search_path
-- 
-- Problem: Functions without a fixed search_path can be vulnerable to search path
-- injection attacks, where a malicious user creates objects in their schema that
-- shadow the intended objects.
--
-- Solution: Add SET search_path = 'public' to all flagged functions
--
-- Affected Functions:
--   SECURITY DEFINER (higher risk):
--     1. count_pending_brex_transfer_syncs
--     2. handle_deal_changes
--   SECURITY INVOKER (lower risk, but best practice):
--     3. check_deal_allocation_sum
--     4. format_address (7-arg version)
--     5. format_deal_name
--     6. generate_tag_slug
--     7. get_complete_schema
--     8. update_document_tags_updated_at
--     9. update_property_address
-- =============================================================================

-- SECURITY DEFINER functions (higher priority)
ALTER FUNCTION public.count_pending_brex_transfer_syncs() SET search_path = 'public';
ALTER FUNCTION public.handle_deal_changes() SET search_path = 'public';

-- SECURITY INVOKER functions
ALTER FUNCTION public.check_deal_allocation_sum() SET search_path = 'public';
ALTER FUNCTION public.format_address(text, text, text, text, text, text, text) SET search_path = 'public';
ALTER FUNCTION public.format_deal_name(bigint) SET search_path = 'public';
ALTER FUNCTION public.generate_tag_slug(text) SET search_path = 'public';
ALTER FUNCTION public.get_complete_schema() SET search_path = 'public';
ALTER FUNCTION public.update_document_tags_updated_at() SET search_path = 'public';
ALTER FUNCTION public.update_property_address() SET search_path = 'public';
