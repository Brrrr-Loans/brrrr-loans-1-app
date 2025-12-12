-- Drop and recreate the INSERT policy with direct JWT check
DROP POLICY IF EXISTS "investors_insert_admin_only" ON storage.objects;

CREATE POLICY "investors_insert_admin_only" ON storage.objects
FOR INSERT TO public
WITH CHECK (
  bucket_id = 'investors' AND (
    -- Check using the function
    is_internal_admin()
    -- Fallback: Direct JWT check
    OR EXISTS (
      SELECT 1 FROM public.auth_clerk_users
      WHERE clerk_user_id = (auth.jwt() ->> 'sub')
      AND role = 'admin'
      AND is_internal_yn = true
    )
  )
);

-- Also update the UPDATE and DELETE policies for consistency
DROP POLICY IF EXISTS "investors_update_admin_only" ON storage.objects;

CREATE POLICY "investors_update_admin_only" ON storage.objects
FOR UPDATE TO public
USING (
  bucket_id = 'investors' AND (
    is_internal_admin()
    OR EXISTS (
      SELECT 1 FROM public.auth_clerk_users
      WHERE clerk_user_id = (auth.jwt() ->> 'sub')
      AND role = 'admin'
      AND is_internal_yn = true
    )
  )
)
WITH CHECK (
  bucket_id = 'investors' AND (
    is_internal_admin()
    OR EXISTS (
      SELECT 1 FROM public.auth_clerk_users
      WHERE clerk_user_id = (auth.jwt() ->> 'sub')
      AND role = 'admin'
      AND is_internal_yn = true
    )
  )
);

DROP POLICY IF EXISTS "investors_delete_admin_only" ON storage.objects;

CREATE POLICY "investors_delete_admin_only" ON storage.objects
FOR DELETE TO public
USING (
  bucket_id = 'investors' AND (
    is_internal_admin()
    OR EXISTS (
      SELECT 1 FROM public.auth_clerk_users
      WHERE clerk_user_id = (auth.jwt() ->> 'sub')
      AND role = 'admin'
      AND is_internal_yn = true
    )
  )
);
