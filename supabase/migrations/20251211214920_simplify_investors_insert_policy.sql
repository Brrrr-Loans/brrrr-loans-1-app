-- Drop the existing policy
DROP POLICY IF EXISTS "investors_insert_admin_only" ON storage.objects;

-- Create a simpler policy that just checks the bucket and JWT sub claim
CREATE POLICY "investors_insert_admin_only" ON storage.objects
FOR INSERT TO public
WITH CHECK (
  bucket_id = 'investors' AND (
    -- Check if the JWT sub matches an admin user
    (auth.jwt() ->> 'sub') IN (
      SELECT clerk_user_id 
      FROM public.auth_clerk_users 
      WHERE role = 'admin' AND is_internal_yn = true
    )
  )
);

-- Also grant execute on the auth.jwt() function if needed
-- This ensures the policy can access JWT data
