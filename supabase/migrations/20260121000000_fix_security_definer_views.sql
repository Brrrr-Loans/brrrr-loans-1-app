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

-- Add security_invoker = true to flagged views when they exist. Preview
-- clones may not have every view from this era.

DO $$
DECLARE
  view_name text;
BEGIN
  FOREACH view_name IN ARRAY ARRAY[
    'view_transaction_documents',
    'view_rbac_permissions_summary',
    'view_storage_objects',
    'view_document_categories_user_order'
  ]
  LOOP
    IF to_regclass('public.' || view_name) IS NOT NULL THEN
      EXECUTE format(
        'ALTER VIEW public.%I SET (security_invoker = true)',
        view_name
      );
    ELSE
      RAISE NOTICE 'Skipping security_invoker on missing view %', view_name;
    END IF;
  END LOOP;
END $$;

DO $$
BEGIN
  IF to_regclass('public.view_transaction_documents') IS NOT NULL THEN
    EXECUTE $c$COMMENT ON VIEW public.view_transaction_documents IS
      'Joins transaction document files with document metadata. SECURITY INVOKER ensures RLS is enforced for the calling user.'$c$;
  END IF;
  IF to_regclass('public.view_rbac_permissions_summary') IS NOT NULL THEN
    EXECUTE $c$COMMENT ON VIEW public.view_rbac_permissions_summary IS
      'Aggregated view of permissions by role and resource type for auditing. SECURITY INVOKER respects underlying RLS.'$c$;
  END IF;
  IF to_regclass('public.view_storage_objects') IS NOT NULL THEN
    EXECUTE $c$COMMENT ON VIEW public.view_storage_objects IS
      'Admin-only view of storage objects. Access controlled by is_internal_admin() function. SECURITY INVOKER enforced.'$c$;
  END IF;
  IF to_regclass('public.view_document_categories_user_order') IS NOT NULL THEN
    EXECUTE $c$COMMENT ON VIEW public.view_document_categories_user_order IS
      'Document categories with user-specific display order (falls back to system default). SECURITY INVOKER enforced.'$c$;
  END IF;
END $$;
