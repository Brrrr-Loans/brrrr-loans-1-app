-- Drop the incorrect policy that uses auth.uid()
DROP POLICY IF EXISTS "Admins can view all organization memberships" ON auth_clerk_orgs_members;

-- Create the corrected policy using auth.jwt() ->> 'sub' (proper Clerk integration)
CREATE POLICY "Admins can view all organization memberships" ON auth_clerk_orgs_members
    FOR SELECT TO authenticated
    USING (EXISTS (
        SELECT 1 FROM auth_clerk_users p
        WHERE p.clerk_user_id = (auth.jwt() ->> 'sub'::text)
        AND p.role = 'admin'::user_role_internal
    ));
