-- =============================================================================
-- Migration: Fix RBAC Policies and Role Logic
-- =============================================================================
-- This migration:
-- 1. Creates get_active_org_id() - extracts org_id from JWT claims
-- 2. Updates get_effective_role() - uses org context with personal_role fallback
-- 3. Creates is_org_admin() - checks if user is admin of a specific org
-- 4. Makes is_admin() an alias for is_internal_admin() (backward compat)
-- 5. Creates has_permission() helper
-- 6. Adds org admin policies for org-linked records
-- =============================================================================

-- =============================================================================
-- STEP 1: Create get_active_org_id() function
-- =============================================================================
-- Extracts the active organization ID from the Clerk JWT claims
-- Clerk stores org_id in the JWT when user is operating in an org context

CREATE OR REPLACE FUNCTION public.get_active_org_id()
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Clerk stores the active org in 'org_id' claim when user switches orgs
  SELECT co.id
  FROM public.auth_clerk_orgs co
  WHERE co.clerk_org_id = (auth.jwt() ->> 'org_id')
  LIMIT 1;
$$;

COMMENT ON FUNCTION public.get_active_org_id IS 
  'Returns the database ID of the active org from Clerk JWT org_id claim. Returns NULL if no org context.';

GRANT EXECUTE ON FUNCTION public.get_active_org_id TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_active_org_id TO anon;

-- =============================================================================
-- STEP 2: Update get_effective_role() function
-- =============================================================================
-- Now properly handles:
-- (i) Get active org from JWT
-- (ii) Get clerk_member_role for that org
-- (iii) Fall back to personal_role if no org context

DROP FUNCTION IF EXISTS public.get_effective_role(bigint);

CREATE OR REPLACE FUNCTION public.get_effective_role(p_org_id bigint DEFAULT NULL)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text;
  v_clerk_user_id text;
  v_active_org_id bigint;
BEGIN
  -- Get current user's Clerk ID
  v_clerk_user_id := public.get_clerk_user_id();
  
  IF v_clerk_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Determine org context: use provided org_id, or get from JWT
  v_active_org_id := COALESCE(p_org_id, public.get_active_org_id());

  IF v_active_org_id IS NOT NULL THEN
    -- Org context: look up clerk_member_role
    SELECT com.clerk_member_role INTO v_role
    FROM public.auth_clerk_orgs_members com
    JOIN public.auth_clerk_users acu ON com.auth_clerk_users_id = acu.id
    WHERE acu.clerk_user_id = v_clerk_user_id
      AND com.clerk_org_id = v_active_org_id;
    
    -- If found org membership with role, return it
    IF v_role IS NOT NULL THEN
      RETURN v_role;
    END IF;
  END IF;

  -- Fallback: Personal context - use personal_role
  SELECT acu.personal_role INTO v_role
  FROM public.auth_clerk_users acu
  WHERE acu.clerk_user_id = v_clerk_user_id;
  
  RETURN v_role;
END;
$$;

COMMENT ON FUNCTION public.get_effective_role IS 
  'Returns user role based on context. If org_id provided (or in JWT), returns clerk_member_role. Falls back to personal_role.';

GRANT EXECUTE ON FUNCTION public.get_effective_role TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_effective_role TO anon;

-- =============================================================================
-- STEP 3: Create is_org_admin() function
-- =============================================================================
-- Checks if the current user is an admin of a specific org

CREATE OR REPLACE FUNCTION public.is_org_admin(p_org_id bigint DEFAULT NULL)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.auth_clerk_orgs_members com
    JOIN public.auth_clerk_users acu ON com.auth_clerk_users_id = acu.id
    WHERE acu.clerk_user_id = public.get_clerk_user_id()
      AND com.clerk_org_id = COALESCE(p_org_id, public.get_active_org_id())
      AND com.clerk_org_role = 'admin'
  );
$$;

COMMENT ON FUNCTION public.is_org_admin IS 
  'Returns true if user has clerk_org_role = admin for the specified org (or active org from JWT)';

GRANT EXECUTE ON FUNCTION public.is_org_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_org_admin TO anon;

-- =============================================================================
-- STEP 4: Make is_admin() an alias for is_internal_admin()
-- =============================================================================
-- Instead of dropping 80+ policies, we redefine is_admin() to call is_internal_admin()
-- This ensures backward compatibility while standardizing on internal admin checks

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Delegate to is_internal_admin for consistent behavior
  SELECT public.is_internal_admin();
$$;

COMMENT ON FUNCTION public.is_admin IS 
  'DEPRECATED: Use is_internal_admin() directly. This is now an alias for backward compatibility.';

-- =============================================================================
-- STEP 5: Create has_permission() function
-- =============================================================================
-- Central permission check that respects role hierarchy

CREATE OR REPLACE FUNCTION public.has_permission(p_required_role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    -- Internal admins can do everything
    public.is_internal_admin()
    OR
    -- Check if effective role matches
    public.get_effective_role() = p_required_role;
$$;

COMMENT ON FUNCTION public.has_permission IS 
  'Check if current user has the required role (internal admins always pass)';

GRANT EXECUTE ON FUNCTION public.has_permission TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_permission TO anon;

-- =============================================================================
-- STEP 6: Add org admin policies for document junction tables
-- =============================================================================
-- These ADD new policies (don't replace existing admin-only policies)

-- document_files_clerk_orgs: Org admins can manage their org's links
CREATE POLICY "Org admins manage own org document links" 
ON public.document_files_clerk_orgs 
FOR ALL TO authenticated 
USING (public.is_org_admin(clerk_org_id))
WITH CHECK (public.is_org_admin(clerk_org_id));

-- bsi_deals_clerk_orgs: Org admins can view their org's deal links
CREATE POLICY "Org admins view own deal links" 
ON public.bsi_deals_clerk_orgs 
FOR SELECT TO authenticated 
USING (public.is_org_admin(clerk_org_id));

-- =============================================================================
-- STEP 7: Add document access via deal permissions
-- =============================================================================

-- Users can view documents if they have deal role permissions
CREATE POLICY "Users view documents via deal permissions" 
ON public.document_files 
FOR SELECT TO authenticated 
USING (
  EXISTS (
    SELECT 1 
    FROM public.document_files_deals dfd
    WHERE dfd.document_file_id = document_files.id
    AND public.can_access_deal_document(dfd.deal_id, document_files.document_category::text, 'view')
  )
);

-- Users can view document_files_deals links via deal permissions
CREATE POLICY "Users view document deal links via permissions" 
ON public.document_files_deals 
FOR SELECT TO authenticated 
USING (
  public.can_access_deal_document(deal_id, 
    (SELECT document_category::text FROM document_files WHERE id = document_file_id), 
    'view')
);

-- Users can insert document_files_deals links via deal permissions
CREATE POLICY "Users insert document deal links via permissions" 
ON public.document_files_deals 
FOR INSERT TO authenticated 
WITH CHECK (
  public.can_access_deal_document(deal_id,
    (SELECT document_category::text FROM document_files WHERE id = document_file_id),
    'insert')
);

-- =============================================================================
-- STEP 8: Update document_access_permissions for org admin visibility
-- =============================================================================

-- Org admins can view all permissions (needed for UI configuration)
CREATE POLICY "Org admins view document_access_permissions" 
ON public.document_access_permissions 
FOR SELECT TO authenticated 
USING (public.is_org_admin());

-- =============================================================================
-- STEP 9: Update storage policies to be consistent
-- =============================================================================

-- Drop old separate policies if they exist
DROP POLICY IF EXISTS "investors_insert_admin_only" ON storage.objects;
DROP POLICY IF EXISTS "investors_update_admin_only" ON storage.objects;
DROP POLICY IF EXISTS "investors_delete_admin_only" ON storage.objects;

-- Consolidated admin policy for investors bucket (uses is_internal_admin)
CREATE POLICY "investors_admin_full_access" ON storage.objects
FOR ALL TO public
USING (
  bucket_id = 'investors' 
  AND public.is_internal_admin()
)
WITH CHECK (
  bucket_id = 'investors' 
  AND public.is_internal_admin()
);

-- =============================================================================
-- DOCUMENTATION
-- =============================================================================
-- 
-- ROLE HIERARCHY:
--   1. is_internal_admin() - BSI staff with personal_role='admin' AND is_internal_yn=true
--   2. is_admin() - Now alias for is_internal_admin() (backward compat)
--   3. is_org_admin(org_id) - Org member with clerk_org_role='admin'
--   4. get_effective_role() - clerk_member_role (if org) or personal_role (fallback)
--   5. can_access_deal_document() - Dynamic permissions from document_access_permissions
--
-- PERMISSION CHECK ORDER:
--   1. Internal admin? → ALLOW
--   2. Org admin for linked record? → ALLOW (if applicable)
--   3. Has deal role with permission? → ALLOW (via document_access_permissions)
--   4. Own record? → ALLOW (for personal data)
--   5. → DENY
--
-- =============================================================================
