-- Grant org admins (and org members / investor links) access to deals.
--
-- Root cause: deal SELECT was limited to is_admin() (internal personal_role)
-- and check_user_deal_role() (rows in deal_roles). Clerk org admins such as
-- user_36TZm8DhGc6q5GyVW1RrJYQUwaS have clerk_org_role=admin and investor
-- links in bsi_deals_clerk_users, but often no deal_roles row, so the Deals
-- page query returned no rows / permission errors.

CREATE OR REPLACE FUNCTION public.check_user_deal_role(p_deal_id bigint)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
DECLARE
  v_user_id bigint;
  v_has_access boolean;
BEGIN
  SELECT id INTO v_user_id
  FROM public.auth_clerk_users
  WHERE clerk_user_id = (SELECT auth.jwt() ->> 'sub');

  IF v_user_id IS NULL THEN
    RETURN false;
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.deal_roles
    WHERE deal_id = p_deal_id
      AND auth_clerk_users_id = v_user_id
  ) INTO v_has_access;

  IF v_has_access THEN
    RETURN true;
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.bsi_deals_clerk_users
    WHERE deal_id = p_deal_id
      AND clerk_user_id = v_user_id
  ) INTO v_has_access;

  IF v_has_access THEN
    RETURN true;
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.bsi_deals_clerk_orgs dorg
    JOIN public.auth_clerk_orgs_members m
      ON m.clerk_org_id = dorg.clerk_org_id
    WHERE dorg.deal_id = p_deal_id
      AND m.auth_clerk_users_id = v_user_id
      AND m.clerk_org_role IN ('admin', 'member')
  ) INTO v_has_access;

  RETURN COALESCE(v_has_access, false);
END;
$$;

COMMENT ON FUNCTION public.check_user_deal_role(bigint) IS
  'True if the current user can view a deal via deal_roles, bsi_deals_clerk_users, or org membership (admin/member) on bsi_deals_clerk_orgs.';

DROP POLICY IF EXISTS "Org members can view org-linked deals" ON public.deal;
CREATE POLICY "Org members can view org-linked deals"
ON public.deal
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.bsi_deals_clerk_orgs dorg
    JOIN public.auth_clerk_orgs_members m
      ON m.clerk_org_id = dorg.clerk_org_id
    JOIN public.auth_clerk_users acu
      ON acu.id = m.auth_clerk_users_id
    WHERE dorg.deal_id = deal.id
      AND acu.clerk_user_id = (auth.jwt() ->> 'sub')
      AND m.clerk_org_role IN ('admin', 'member')
  )
  OR EXISTS (
    SELECT 1
    FROM public.bsi_deals_clerk_users dcu
    JOIN public.auth_clerk_users acu
      ON acu.id = dcu.clerk_user_id
    WHERE dcu.deal_id = deal.id
      AND acu.clerk_user_id = (auth.jwt() ->> 'sub')
  )
);
