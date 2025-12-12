-- Allow admins to view all organization memberships (needed for impersonation feature)
CREATE POLICY "Admins can view all organization memberships" ON auth_clerk_orgs_members
    FOR SELECT TO authenticated
    USING (EXISTS (
        SELECT 1 FROM auth_clerk_users p
        WHERE p.clerk_user_id = (auth.uid())::text
        AND p.role = 'admin'::user_role_internal
    ));
