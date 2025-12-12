-- ============================================================================
-- MIGRATION: Create investors bucket and fix security issues
-- ============================================================================

-- 1. Create investors bucket if it doesn't exist
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

-- 2. Fix function search_path security issues
-- These functions are used in storage RLS policies

-- Fix get_clerk_user_id
CREATE OR REPLACE FUNCTION public.get_clerk_user_id()
RETURNS TEXT
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

-- Fix get_user_org_ids
CREATE OR REPLACE FUNCTION public.get_user_org_ids()
RETURNS TEXT[]
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

-- Fix is_internal_admin
CREATE OR REPLACE FUNCTION public.is_internal_admin()
RETURNS BOOLEAN
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

-- Fix debug_jwt (returns json, not jsonb)
CREATE OR REPLACE FUNCTION public.debug_jwt()
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT auth.jwt()::json;
$$;

-- 3. Enable RLS on deal table
ALTER TABLE public.deal ENABLE ROW LEVEL SECURITY;

-- 4. Create storage policies for investors bucket (idempotent using DO blocks)

-- Policy: Admin can INSERT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'investors_insert_admin_only'
  ) THEN
    CREATE POLICY "investors_insert_admin_only" ON storage.objects
    FOR INSERT TO public
    WITH CHECK (
      bucket_id = 'investors' AND is_internal_admin()
    );
  END IF;
END $$;

-- Policy: Admin can UPDATE  
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'investors_update_admin_only'
  ) THEN
    CREATE POLICY "investors_update_admin_only" ON storage.objects
    FOR UPDATE TO public
    USING (bucket_id = 'investors' AND is_internal_admin())
    WITH CHECK (bucket_id = 'investors' AND is_internal_admin());
  END IF;
END $$;

-- Policy: Admin can DELETE
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'investors_delete_admin_only'
  ) THEN
    CREATE POLICY "investors_delete_admin_only" ON storage.objects
    FOR DELETE TO public
    USING (bucket_id = 'investors' AND is_internal_admin());
  END IF;
END $$;

-- Policy: Users can SELECT their own files or org files they belong to
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'investors_select_own_files'
  ) THEN
    CREATE POLICY "investors_select_own_files" ON storage.objects
    FOR SELECT TO public
    USING (
      bucket_id = 'investors' AND (
        -- Admins can see everything
        is_internal_admin()
        -- Users can see files in their personal folder: users/{clerk_user_id}/...
        OR (
          (storage.foldername(name))[1] = 'users' 
          AND (storage.foldername(name))[2] = get_clerk_user_id()
        )
        -- Users can see files in orgs they belong to: orgs/{org_id}/...
        OR (
          (storage.foldername(name))[1] = 'orgs'
          AND (storage.foldername(name))[2] = ANY(get_user_org_ids())
        )
      )
    );
  END IF;
END $$;
