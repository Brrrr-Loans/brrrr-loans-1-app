-- =============================================================================
-- Migration: Fix Security Definer Views
-- =============================================================================
-- Issue: Supabase Security Advisor flagged 4 views as "Security Definer Views"
-- 
-- Problem: Views owned by postgres (superuser) bypass RLS on underlying tables
-- because PostgreSQL evaluates RLS policies as the view owner, not the querying user.
--
-- Solution: Add security_invoker = true to ensure views respect RLS policies
-- on underlying tables by evaluating permissions as the calling user.
--
-- Affected Views:
--   1. view_transaction_documents - joins transaction docs with file metadata
--   2. view_rbac_permissions_summary - aggregates RBAC permissions for auditing
--   3. view_storage_objects - admin-only view of storage objects
--   4. view_document_categories_user_order - user-specific category ordering
--
-- Note: PostgreSQL 15+ required for security_invoker option (we have 17.6)
-- =============================================================================

-- Add security_invoker = true to all 4 flagged views
ALTER VIEW public.view_transaction_documents SET (security_invoker = true);
ALTER VIEW public.view_rbac_permissions_summary SET (security_invoker = true);
ALTER VIEW public.view_storage_objects SET (security_invoker = true);
ALTER VIEW public.view_document_categories_user_order SET (security_invoker = true);

-- Add comments documenting the security model
COMMENT ON VIEW public.view_transaction_documents IS 
  'Joins transaction document files with document metadata. SECURITY INVOKER ensures RLS is enforced for the calling user.';

COMMENT ON VIEW public.view_rbac_permissions_summary IS 
  'Aggregated view of permissions by role and resource type for auditing. SECURITY INVOKER respects underlying RLS.';

COMMENT ON VIEW public.view_storage_objects IS 
  'Admin-only view of storage objects. Access controlled by is_internal_admin() function. SECURITY INVOKER enforced.';

COMMENT ON VIEW public.view_document_categories_user_order IS 
  'Document categories with user-specific display order (falls back to system default). SECURITY INVOKER enforced.';
