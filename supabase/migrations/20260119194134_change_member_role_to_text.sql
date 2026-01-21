-- =============================================================================
-- Migration: Change member_role from enum to text
-- =============================================================================
-- Text is more flexible than enum - no migration needed to add new role values.
-- =============================================================================

-- =============================================================================
-- 1. CHANGE member_role column type to text
-- =============================================================================

-- Drop the column and recreate as text (simpler than ALTER TYPE for enum→text)
ALTER TABLE public.auth_clerk_orgs_members 
  DROP COLUMN IF EXISTS member_role;

ALTER TABLE public.auth_clerk_orgs_members 
  ADD COLUMN member_role text;

COMMENT ON COLUMN public.auth_clerk_orgs_members.member_role IS 
  'Functional role within this specific org. Different from clerk_org_role which is coarse privilege (admin/member/viewer). Example values: admin, account_executive, loan_processor, balance_sheet_investor, loan_opener, broker, borrower';

-- Recreate index
DROP INDEX IF EXISTS idx_auth_clerk_orgs_members_member_role;
CREATE INDEX idx_auth_clerk_orgs_members_member_role 
  ON public.auth_clerk_orgs_members(member_role);

-- =============================================================================
-- 2. UPDATE get_effective_role() to return text
-- =============================================================================

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
BEGIN
  -- Get current user's Clerk ID
  v_clerk_user_id := public.get_clerk_user_id();
  
  IF v_clerk_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  IF p_org_id IS NOT NULL THEN
    -- Org context: use member_role (NO fallback)
    SELECT com.member_role INTO v_role
    FROM public.auth_clerk_orgs_members com
    JOIN public.auth_clerk_users acu ON com.auth_clerk_users_id = acu.id
    WHERE acu.clerk_user_id = v_clerk_user_id
      AND com.clerk_org_id = p_org_id;
  ELSE
    -- Personal context: use personal_role (cast enum to text)
    SELECT acu.personal_role::text INTO v_role
    FROM public.auth_clerk_users acu
    WHERE acu.clerk_user_id = v_clerk_user_id;
  END IF;
  
  RETURN v_role;
END;
$$;

COMMENT ON FUNCTION public.get_effective_role IS 
  'Returns user role based on context. If org_id provided, returns member_role for that org. If null, returns personal_role.';

GRANT EXECUTE ON FUNCTION public.get_effective_role TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_effective_role TO anon;

-- =============================================================================
-- 3. UPDATE has_role() to accept text
-- =============================================================================

DROP FUNCTION IF EXISTS public.has_role(public.user_role_internal, bigint);

CREATE OR REPLACE FUNCTION public.has_role(
  p_role text,
  p_org_id bigint DEFAULT NULL
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.get_effective_role(p_org_id) = p_role;
$$;

COMMENT ON FUNCTION public.has_role IS 
  'Check if current user has the specified role in the given context (org or personal)';

GRANT EXECUTE ON FUNCTION public.has_role TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role TO anon;
