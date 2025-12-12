-- =============================================================================
-- Unified Investors Storage Bucket Policies
-- =============================================================================
-- This migration creates consistent RLS policies for the 'investors' storage bucket.
-- It is idempotent and safe to run on both dev and prod environments.
--
-- Requirements:
-- - Admins (role='admin', is_internal_yn=true): Full CRUD access to all files
-- - Balance Sheet Investors: Can only SELECT files in their personal folder or
--   folders belonging to their Clerk organizations
-- - No upload permissions for non-admin users
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Create Helper Functions (idempotent)
-- -----------------------------------------------------------------------------

-- Function to get the Clerk user ID from the JWT
CREATE OR REPLACE FUNCTION public.get_clerk_user_id()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT COALESCE(
    auth.jwt() ->> 'sub',
    auth.jwt() ->> 'user_id'
  );
$$;

-- Function to check if the current user is an internal admin
CREATE OR REPLACE FUNCTION public.is_internal_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.auth_clerk_users
    WHERE clerk_user_id = public.get_clerk_user_id()
    AND role = 'admin'
    AND is_internal_yn = true
  );
$$;

-- Function to get all org IDs the current user belongs to
CREATE OR REPLACE FUNCTION public.get_user_org_ids()
RETURNS text[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    ARRAY_AGG(co.clerk_org_id::text),
    ARRAY[]::TEXT[]
  )
  FROM public.auth_clerk_orgs_members com
  JOIN public.auth_clerk_orgs co ON com.clerk_org_id = co.id
  JOIN public.auth_clerk_users cu ON com.auth_clerk_users_id = cu.id
  WHERE cu.clerk_user_id = public.get_clerk_user_id();
$$;

-- -----------------------------------------------------------------------------
-- 2. Ensure the 'investors' bucket exists
-- -----------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'investors',
  'investors',
  false,
  52428800, -- 50MB
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/csv'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- -----------------------------------------------------------------------------
-- 3. Drop existing investors policies (idempotent)
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "investors_insert_admin_only" ON storage.objects;
DROP POLICY IF EXISTS "investors_update_admin_only" ON storage.objects;
DROP POLICY IF EXISTS "investors_delete_admin_only" ON storage.objects;
DROP POLICY IF EXISTS "investors_select_own_files" ON storage.objects;

-- -----------------------------------------------------------------------------
-- 4. Create Storage Policies for 'investors' bucket
-- -----------------------------------------------------------------------------

-- INSERT: Only admins can upload files
CREATE POLICY "investors_insert_admin_only" ON storage.objects
FOR INSERT TO public
WITH CHECK (
  bucket_id = 'investors'
  AND public.is_internal_admin()
);

-- UPDATE: Only admins can update files
CREATE POLICY "investors_update_admin_only" ON storage.objects
FOR UPDATE TO public
USING (
  bucket_id = 'investors'
  AND public.is_internal_admin()
)
WITH CHECK (
  bucket_id = 'investors'
  AND public.is_internal_admin()
);

-- DELETE: Only admins can delete files
CREATE POLICY "investors_delete_admin_only" ON storage.objects
FOR DELETE TO public
USING (
  bucket_id = 'investors'
  AND public.is_internal_admin()
);

-- SELECT: Admins see all, users see their personal or org files
CREATE POLICY "investors_select_own_files" ON storage.objects
FOR SELECT TO public
USING (
  bucket_id = 'investors'
  AND (
    -- Admins can see everything in the bucket
    public.is_internal_admin()
    -- Users can see files in their personal folder: users/{clerk_user_id}/*
    OR (
      (storage.foldername(name))[1] = 'users'
      AND (storage.foldername(name))[2] = public.get_clerk_user_id()
    )
    -- Users can see files in their org folders: orgs/{clerk_org_id}/*
    OR (
      (storage.foldername(name))[1] = 'orgs'
      AND (storage.foldername(name))[2] = ANY(public.get_user_org_ids())
    )
  )
);

-- -----------------------------------------------------------------------------
-- 5. Grant execute permissions on helper functions
-- -----------------------------------------------------------------------------

GRANT EXECUTE ON FUNCTION public.get_clerk_user_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_clerk_user_id() TO anon;
GRANT EXECUTE ON FUNCTION public.is_internal_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_internal_admin() TO anon;
GRANT EXECUTE ON FUNCTION public.get_user_org_ids() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_org_ids() TO anon;
