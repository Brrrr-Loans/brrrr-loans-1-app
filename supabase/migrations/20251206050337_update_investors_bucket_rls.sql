-- Drop existing overly-permissive policies on investors bucket
DROP POLICY IF EXISTS "Users can read from investors bucket" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload to investors bucket" ON storage.objects;
DROP POLICY IF EXISTS "Users can update in investors bucket" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete from investors bucket" ON storage.objects;

-- New SELECT policy: folder-based isolation with admin override
CREATE POLICY "investors_select_own_files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'investors'
  AND (
    -- Internal admins can see all files
    public.is_internal_admin()
    OR
    -- Users can see files in their own folder
    (
      (storage.foldername(name))[1] = 'users' 
      AND (storage.foldername(name))[2] = public.get_clerk_user_id()
    )
    OR
    -- Users can see files in their organization's folder
    (
      (storage.foldername(name))[1] = 'orgs'
      AND (storage.foldername(name))[2] = ANY(public.get_user_org_ids())
    )
  )
);

-- New INSERT policy: admin-only upload
CREATE POLICY "investors_insert_admin_only"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'investors'
  AND public.is_internal_admin()
);

-- New UPDATE policy: admin-only
CREATE POLICY "investors_update_admin_only"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'investors' 
  AND public.is_internal_admin()
)
WITH CHECK (
  bucket_id = 'investors' 
  AND public.is_internal_admin()
);

-- New DELETE policy: admin-only
CREATE POLICY "investors_delete_admin_only"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'investors' 
  AND public.is_internal_admin()
);
