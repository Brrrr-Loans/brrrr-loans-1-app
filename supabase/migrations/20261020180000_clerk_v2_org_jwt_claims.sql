-- =============================================================================
-- Migration: Read Clerk v2 organization claims from the session JWT
-- =============================================================================
-- Native Clerk session tokens nest the active organization under `o`:
--   o.id  → organization id (replaces top-level org_id)
--   o.rol → organization role without the `org:` prefix (replaces org_role)
--
-- Keep the legacy top-level claims as a fallback so older session tokens
-- still resolve. Do not apply this file to a live database until the current
-- pg_proc definitions are compared with the bodies below. Migration history
-- is not proof of what production is running.
--
-- Functions replaced (latest definitions in supabase/migrations):
--   public.get_active_org_id()
--     from 20260119212237_fix_rbac_policies_and_role_logic.sql
--   public.create_document_with_deal_link(text, bigint, bigint, text, text, text, bigint)
--     from 20260120100002_document_rpcs.sql
--   public.create_document_with_subject_link(text, bigint, text, text, text, bigint, text, bigint)
--     from 20260120100002_document_rpcs.sql
--
-- No function in supabase/migrations reads auth.jwt()->>'org_role', so none
-- were replaced for that claim. A future reader should prefer
-- auth.jwt()->'o'->>'rol' (values such as 'admin') and fall back to
-- auth.jwt()->>'org_role' (values such as 'org:admin'), then normalize the
-- same way mapClerkOrgRole does (strip a leading 'org:' prefix).

-- -----------------------------------------------------------------------------
-- public.get_active_org_id()
-- Signature, return type, language, volatility, SECURITY DEFINER, and
-- search_path match 20260119212237.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_active_org_id()
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Clerk v2 stores the active org at o.id. Older session tokens use org_id.
  SELECT co.id
  FROM public.auth_clerk_orgs co
  WHERE co.clerk_org_id = coalesce(auth.jwt()->'o'->>'id', auth.jwt()->>'org_id')
  LIMIT 1;
$$;

COMMENT ON FUNCTION public.get_active_org_id IS
  'Returns the database ID of the active org from Clerk JWT o.id, falling back to org_id. Returns NULL if no org context.';

GRANT EXECUTE ON FUNCTION public.get_active_org_id TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_active_org_id TO anon;

-- -----------------------------------------------------------------------------
-- public.create_document_with_deal_link(...)
-- Signature, return type, language, volatility (default VOLATILE), SECURITY
-- DEFINER, search_path, and row_security match 20260120100002.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_document_with_deal_link(
  p_document_name text,
  p_document_category_id bigint,
  p_deal_id bigint,
  p_storage_bucket text,
  p_original_filename text,
  p_file_type text DEFAULT NULL,
  p_file_size bigint DEFAULT NULL
) RETURNS TABLE (document_file_id bigint, storage_bucket text, storage_path text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
SET row_security TO 'off'
AS $$
DECLARE
  v_doc_id bigint;
  v_active_org_id bigint;
  v_active_org_clerk_id text;
  v_path text;
BEGIN
  -- 1) Bucket whitelist
  IF p_storage_bucket <> 'documents' THEN
    RAISE EXCEPTION 'Invalid storage_bucket: must be documents';
  END IF;

  -- 2) Validate org context exists
  v_active_org_id := public.get_active_org_id();
  IF v_active_org_id IS NULL THEN
    RAISE EXCEPTION 'No active org context';
  END IF;

  -- 3) Clerk org id string from JWT (v2 o.id, legacy org_id)
  v_active_org_clerk_id := coalesce(auth.jwt()->'o'->>'id', auth.jwt()->>'org_id');
  IF v_active_org_clerk_id IS NULL THEN
    RAISE EXCEPTION 'Missing org_id in JWT';
  END IF;

  -- 4) Permission check (insert doc for deal/category)
  IF NOT public.can_access_deal_document(p_deal_id, p_document_category_id, 'insert') THEN
    RAISE EXCEPTION 'Permission denied: cannot insert documents for this deal/category';
  END IF;

  -- 5) Create doc row first (storage_path set after we get id)
  INSERT INTO public.document_files (
    document_name,
    document_category_id,
    storage_bucket,
    storage_path,
    file_type,
    file_size,
    uploaded_by
  ) VALUES (
    p_document_name,
    p_document_category_id,
    p_storage_bucket,
    NULL,  -- set after we have the id
    p_file_type,
    p_file_size,
    public.get_clerk_user_id()
  ) RETURNING id INTO v_doc_id;

  -- 6) Deterministic path: orgs/<clerk_org_id>/df/<doc_id>/<filename>
  v_path := format('orgs/%s/df/%s/%s', v_active_org_clerk_id, v_doc_id, p_original_filename);

  UPDATE public.document_files
  SET storage_path = v_path
  WHERE id = v_doc_id;

  -- 7) Create deal link
  INSERT INTO public.document_files_deals (document_file_id, deal_id)
  VALUES (v_doc_id, p_deal_id);

  -- 8) Return result for client to use for upload
  RETURN QUERY SELECT v_doc_id, p_storage_bucket, v_path;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_document_with_deal_link TO authenticated;

-- -----------------------------------------------------------------------------
-- public.create_document_with_subject_link(...)
-- Signature, return type, language, volatility (default VOLATILE), SECURITY
-- DEFINER, search_path, and row_security match 20260120100002.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_document_with_subject_link(
  p_document_name text,
  p_document_category_id bigint,
  p_storage_bucket text,
  p_original_filename text,
  p_subject_type text,           -- 'borrower', 'guarantor', or NULL (org-only)
  p_subject_id bigint DEFAULT NULL,
  p_file_type text DEFAULT NULL,
  p_file_size bigint DEFAULT NULL
) RETURNS TABLE (document_file_id bigint, storage_bucket text, storage_path text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
SET row_security TO 'off'
AS $$
DECLARE
  v_doc_id bigint;
  v_active_org_id bigint;
  v_active_org_clerk_id text;
  v_path text;
BEGIN
  -- 1) Bucket whitelist
  IF p_storage_bucket <> 'documents' THEN
    RAISE EXCEPTION 'Invalid storage_bucket: must be documents';
  END IF;

  -- 2) Validate org context exists
  v_active_org_id := public.get_active_org_id();
  IF v_active_org_id IS NULL THEN
    RAISE EXCEPTION 'No active org context';
  END IF;

  -- 3) Clerk org id string from JWT (v2 o.id, legacy org_id)
  v_active_org_clerk_id := coalesce(auth.jwt()->'o'->>'id', auth.jwt()->>'org_id');
  IF v_active_org_clerk_id IS NULL THEN
    RAISE EXCEPTION 'Missing org_id in JWT';
  END IF;

  -- 4) Permission check: only org admins or internal admins can upload pre-deal docs
  IF NOT (public.is_internal_admin() OR public.is_org_admin(v_active_org_id)) THEN
    RAISE EXCEPTION 'Permission denied: must be org admin or internal admin for pre-deal uploads';
  END IF;

  -- 5) Validate subject type if provided
  IF p_subject_type IS NOT NULL AND p_subject_type NOT IN ('borrower', 'guarantor') THEN
    RAISE EXCEPTION 'Invalid subject_type: must be borrower or guarantor';
  END IF;

  IF p_subject_type IS NOT NULL AND p_subject_id IS NULL THEN
    RAISE EXCEPTION 'subject_id required when subject_type is provided';
  END IF;

  -- 6) Create doc row first (storage_path set after we get id)
  INSERT INTO public.document_files (
    document_name,
    document_category_id,
    storage_bucket,
    storage_path,
    file_type,
    file_size,
    uploaded_by
  ) VALUES (
    p_document_name,
    p_document_category_id,
    p_storage_bucket,
    NULL,
    p_file_type,
    p_file_size,
    public.get_clerk_user_id()
  ) RETURNING id INTO v_doc_id;

  -- 7) Deterministic path: orgs/<clerk_org_id>/df/<doc_id>/<filename>
  v_path := format('orgs/%s/df/%s/%s', v_active_org_clerk_id, v_doc_id, p_original_filename);

  UPDATE public.document_files
  SET storage_path = v_path
  WHERE id = v_doc_id;

  -- 8) Create org ownership link
  INSERT INTO public.document_files_clerk_orgs (document_file_id, clerk_org_id)
  VALUES (v_doc_id, v_active_org_id);

  -- 9) Create subject link if provided
  IF p_subject_type = 'borrower' THEN
    INSERT INTO public.document_files_borrowers (document_file_id, borrower_id)
    VALUES (v_doc_id, p_subject_id);
  ELSIF p_subject_type = 'guarantor' THEN
    INSERT INTO public.document_files_guarantors (document_file_id, guarantor_id)
    VALUES (v_doc_id, p_subject_id);
  END IF;

  -- 10) Return result for client to use for upload
  RETURN QUERY SELECT v_doc_id, p_storage_bucket, v_path;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_document_with_subject_link TO authenticated;
