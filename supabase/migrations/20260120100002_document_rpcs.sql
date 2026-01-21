-- supabase/migrations/20260120100002_document_rpcs.sql
-- RPC functions for atomic document creation with links
-- These bypass document_files RLS (which is admin-only) but enforce permission checks

BEGIN;

--------------------------------------------------------------------------------
-- SECTION 1: RPC for creating documents with deal links
--------------------------------------------------------------------------------

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

  -- 3) Clerk org id string from JWT (adjust claim name if needed)
  v_active_org_clerk_id := (auth.jwt() ->> 'org_id');
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

--------------------------------------------------------------------------------
-- SECTION 2: RPC to finalize upload (marks upload complete, prevents re-upload)
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.finalize_document_upload(
  p_document_file_id bigint,
  p_file_size bigint DEFAULT NULL
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
SET row_security TO 'off'
AS $$
BEGIN
  -- Only the uploader can finalize their own fresh doc
  IF NOT EXISTS (
    SELECT 1 FROM public.document_files
    WHERE id = p_document_file_id
      AND uploaded_by = public.get_clerk_user_id()
      AND uploaded_at IS NULL
  ) THEN
    RAISE EXCEPTION 'Permission denied or document already finalized';
  END IF;

  UPDATE public.document_files
  SET uploaded_at = now(),
      file_size = COALESCE(p_file_size, file_size)
  WHERE id = p_document_file_id;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.finalize_document_upload TO authenticated;

--------------------------------------------------------------------------------
-- SECTION 3: RPC to reset org permissions matrix to template defaults
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.reset_org_document_permissions(p_org_id bigint)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
SET row_security TO 'off'
AS $$
BEGIN
  -- Only org admins or internal admins can reset
  IF NOT (public.is_internal_admin() OR public.is_org_admin(p_org_id)) THEN
    RAISE EXCEPTION 'Permission denied: must be org admin or internal admin';
  END IF;

  -- Delete existing permissions for this org
  DELETE FROM public.document_access_permissions
  WHERE clerk_org_id = p_org_id;

  -- Re-seed from template
  PERFORM public.seed_document_access_permissions_for_org(p_org_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.reset_org_document_permissions(bigint) TO authenticated;

--------------------------------------------------------------------------------
-- SECTION 4: RPC for pre-deal uploads (passport, DL, credit reports)
-- Creates: document_files + document_files_clerk_orgs + optional subject link
--------------------------------------------------------------------------------

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

  -- 3) Clerk org id string from JWT
  v_active_org_clerk_id := (auth.jwt() ->> 'org_id');
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

COMMIT;
