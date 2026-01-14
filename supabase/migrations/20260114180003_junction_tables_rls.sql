-- Migration: Enable RLS and create policies for document junction tables
-- Part of document system consolidation (Phase 1C)

---------------------------------------------------------------
-- Enable RLS on all junction tables
---------------------------------------------------------------
ALTER TABLE public.document_files_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_files_borrowers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_files_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_files_guarantors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_files_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_files_clerk_orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_files_clerk_users ENABLE ROW LEVEL SECURITY;

---------------------------------------------------------------
-- Admin manage policies (full CRUD for admins)
-- Uses public.is_admin() helper function for consistency
---------------------------------------------------------------
CREATE POLICY "Admin can manage document_files_deals"
ON public.document_files_deals
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admin can manage document_files_borrowers"
ON public.document_files_borrowers
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admin can manage document_files_properties"
ON public.document_files_properties
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admin can manage document_files_guarantors"
ON public.document_files_guarantors
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admin can manage document_files_companies"
ON public.document_files_companies
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admin can manage document_files_clerk_orgs"
ON public.document_files_clerk_orgs
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admin can manage document_files_clerk_users"
ON public.document_files_clerk_users
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

---------------------------------------------------------------
-- User SELECT policies (non-admins)
---------------------------------------------------------------

-- Users can view their own document links
CREATE POLICY "Users can view own document_files_clerk_users links"
ON public.document_files_clerk_users
FOR SELECT
TO authenticated
USING (clerk_user_id = public.get_current_user_id());

-- Org members can view their org's document links
CREATE POLICY "Org members can view document_files_clerk_orgs links"
ON public.document_files_clerk_orgs
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.auth_clerk_orgs_members m
        WHERE m.auth_clerk_users_id = public.get_current_user_id()
          AND m.clerk_org_id = document_files_clerk_orgs.clerk_org_id
    )
);

---------------------------------------------------------------
-- Grant permissions to roles
---------------------------------------------------------------
GRANT ALL ON public.document_files_deals TO authenticated, service_role;
GRANT ALL ON public.document_files_borrowers TO authenticated, service_role;
GRANT ALL ON public.document_files_properties TO authenticated, service_role;
GRANT ALL ON public.document_files_guarantors TO authenticated, service_role;
GRANT ALL ON public.document_files_companies TO authenticated, service_role;
GRANT ALL ON public.document_files_clerk_orgs TO authenticated, service_role;
GRANT ALL ON public.document_files_clerk_users TO authenticated, service_role;
