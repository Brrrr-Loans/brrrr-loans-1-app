-- supabase/migrations/20260120100001_deal_document_participants.sql
-- Denormalized table for fast document-to-deal lookups
-- Run AFTER the RBAC migration is verified

BEGIN;

--------------------------------------------------------------------------------
-- SECTION 1: Create deal_document_participants table
--------------------------------------------------------------------------------

CREATE TABLE public.deal_document_participants (
  deal_id bigint NOT NULL REFERENCES public.deal(id) ON DELETE CASCADE,
  document_file_id bigint NOT NULL REFERENCES public.document_files(id) ON DELETE CASCADE,
  source_table text NOT NULL,  -- e.g., 'document_files_deals', 'document_files_guarantors'
  source_pk bigint NOT NULL,   -- PK of the source junction row
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (deal_id, document_file_id, source_table, source_pk)
);

COMMENT ON TABLE public.deal_document_participants IS 
  'Denormalized table linking documents to deals via any path. Maintained by triggers.';

CREATE INDEX IF NOT EXISTS idx_ddp_deal ON public.deal_document_participants (deal_id, document_file_id);
CREATE INDEX IF NOT EXISTS idx_ddp_doc ON public.deal_document_participants (document_file_id);

-- RLS: inherit from document_files visibility
ALTER TABLE public.deal_document_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ddp_select ON public.deal_document_participants;

CREATE POLICY ddp_select
ON public.deal_document_participants
FOR SELECT TO authenticated
USING (public.can_access_document(document_file_id, 'view'));

-- Writes are trigger-only (internal)
DROP POLICY IF EXISTS ddp_write_admin_only ON public.deal_document_participants;

CREATE POLICY ddp_write_admin_only
ON public.deal_document_participants
FOR ALL TO authenticated
USING (public.is_internal_admin())
WITH CHECK (public.is_internal_admin());

--------------------------------------------------------------------------------
-- SECTION 2: Triggers to maintain deal_document_participants
--------------------------------------------------------------------------------

-- Trigger function for direct doc↔deal links
CREATE OR REPLACE FUNCTION public.trg_ddp_from_document_files_deals()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
SET row_security TO 'off'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.deal_document_participants (deal_id, document_file_id, source_table, source_pk)
    VALUES (NEW.deal_id, NEW.document_file_id, 'document_files_deals', NEW.id)
    ON CONFLICT DO NOTHING;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM public.deal_document_participants
    WHERE deal_id = OLD.deal_id
      AND document_file_id = OLD.document_file_id
      AND source_table = 'document_files_deals'
      AND source_pk = OLD.id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Trigger for document_files_deals
DROP TRIGGER IF EXISTS trg_ddp_document_files_deals ON public.document_files_deals;
CREATE TRIGGER trg_ddp_document_files_deals
AFTER INSERT OR DELETE ON public.document_files_deals
FOR EACH ROW EXECUTE FUNCTION public.trg_ddp_from_document_files_deals();

-- Guarantor path: document_files_guarantors -> deal_guarantors -> deal
CREATE OR REPLACE FUNCTION public.trg_ddp_from_document_files_guarantors()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
SET row_security TO 'off'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.deal_document_participants (deal_id, document_file_id, source_table, source_pk)
    SELECT dg.deal_id, NEW.document_file_id, 'document_files_guarantors', NEW.id
    FROM public.deal_guarantors dg
    WHERE dg.guarantor_id = NEW.guarantor_id
    ON CONFLICT DO NOTHING;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM public.deal_document_participants
    WHERE document_file_id = OLD.document_file_id
      AND source_table = 'document_files_guarantors'
      AND source_pk = OLD.id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_ddp_document_files_guarantors ON public.document_files_guarantors;
CREATE TRIGGER trg_ddp_document_files_guarantors
AFTER INSERT OR DELETE ON public.document_files_guarantors
FOR EACH ROW EXECUTE FUNCTION public.trg_ddp_from_document_files_guarantors();

-- Borrower path: document_files_borrowers -> guarantor -> deal_guarantors -> deal
CREATE OR REPLACE FUNCTION public.trg_ddp_from_document_files_borrowers()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
SET row_security TO 'off'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.deal_document_participants (deal_id, document_file_id, source_table, source_pk)
    SELECT dg.deal_id, NEW.document_file_id, 'document_files_borrowers', NEW.id
    FROM public.guarantor g
    JOIN public.deal_guarantors dg ON dg.guarantor_id = g.id
    WHERE g.borrower_id = NEW.borrower_id
    ON CONFLICT DO NOTHING;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM public.deal_document_participants
    WHERE document_file_id = OLD.document_file_id
      AND source_table = 'document_files_borrowers'
      AND source_pk = OLD.id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_ddp_document_files_borrowers ON public.document_files_borrowers;
CREATE TRIGGER trg_ddp_document_files_borrowers
AFTER INSERT OR DELETE ON public.document_files_borrowers
FOR EACH ROW EXECUTE FUNCTION public.trg_ddp_from_document_files_borrowers();

-- Property path: document_files_properties -> deal_property -> deal
CREATE OR REPLACE FUNCTION public.trg_ddp_from_document_files_properties()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
SET row_security TO 'off'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.deal_document_participants (deal_id, document_file_id, source_table, source_pk)
    SELECT dp.deal_id, NEW.document_file_id, 'document_files_properties', NEW.id
    FROM public.deal_property dp
    WHERE dp.property_id = NEW.property_id
    ON CONFLICT DO NOTHING;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM public.deal_document_participants
    WHERE document_file_id = OLD.document_file_id
      AND source_table = 'document_files_properties'
      AND source_pk = OLD.id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_ddp_document_files_properties ON public.document_files_properties;
CREATE TRIGGER trg_ddp_document_files_properties
AFTER INSERT OR DELETE ON public.document_files_properties
FOR EACH ROW EXECUTE FUNCTION public.trg_ddp_from_document_files_properties();

-- Company path: document_files_companies -> company_roles -> deal
CREATE OR REPLACE FUNCTION public.trg_ddp_from_document_files_companies()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
SET row_security TO 'off'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.deal_document_participants (deal_id, document_file_id, source_table, source_pk)
    SELECT cr.deal_id, NEW.document_file_id, 'document_files_companies', NEW.id
    FROM public.company_roles cr
    WHERE cr.co_id = NEW.company_id
      AND cr.deal_id IS NOT NULL
    ON CONFLICT DO NOTHING;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM public.deal_document_participants
    WHERE document_file_id = OLD.document_file_id
      AND source_table = 'document_files_companies'
      AND source_pk = OLD.id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_ddp_document_files_companies ON public.document_files_companies;
CREATE TRIGGER trg_ddp_document_files_companies
AFTER INSERT OR DELETE ON public.document_files_companies
FOR EACH ROW EXECUTE FUNCTION public.trg_ddp_from_document_files_companies();

--------------------------------------------------------------------------------
-- SECTION 2B: Triggers on RELATIONSHIP tables (prevents stale data)
-- These fire when a guarantor/property/company is linked to a NEW deal
--------------------------------------------------------------------------------

-- When a guarantor is added/removed from a deal, sync all docs linked to that guarantor
CREATE OR REPLACE FUNCTION public.trg_ddp_from_deal_guarantors()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
SET row_security = 'off'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- docs directly linked to this guarantor
    INSERT INTO public.deal_document_participants (deal_id, document_file_id, source_table, source_pk)
    SELECT NEW.deal_id, dfg.document_file_id, 'document_files_guarantors', dfg.id
    FROM public.document_files_guarantors dfg
    WHERE dfg.guarantor_id = NEW.guarantor_id
    ON CONFLICT DO NOTHING;

    -- docs linked to the borrower of this guarantor
    INSERT INTO public.deal_document_participants (deal_id, document_file_id, source_table, source_pk)
    SELECT NEW.deal_id, dfb.document_file_id, 'document_files_borrowers', dfb.id
    FROM public.guarantor g
    JOIN public.document_files_borrowers dfb
      ON dfb.borrower_id = g.borrower_id
    WHERE g.id = NEW.guarantor_id
    ON CONFLICT DO NOTHING;

    RETURN NEW;

  ELSIF TG_OP = 'DELETE' THEN
    -- remove guarantor-linked ddp rows for this deal
    DELETE FROM public.deal_document_participants ddp
    WHERE ddp.deal_id = OLD.deal_id
      AND ddp.source_table = 'document_files_guarantors'
      AND ddp.source_pk IN (
        SELECT dfg.id
        FROM public.document_files_guarantors dfg
        WHERE dfg.guarantor_id = OLD.guarantor_id
      );

    -- remove borrower-linked ddp rows for this deal (borrower derived via this guarantor)
    DELETE FROM public.deal_document_participants ddp
    WHERE ddp.deal_id = OLD.deal_id
      AND ddp.source_table = 'document_files_borrowers'
      AND ddp.source_pk IN (
        SELECT dfb.id
        FROM public.guarantor g
        JOIN public.document_files_borrowers dfb
          ON dfb.borrower_id = g.borrower_id
        WHERE g.id = OLD.guarantor_id
      );

    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_ddp_deal_guarantors ON public.deal_guarantors;
CREATE TRIGGER trg_ddp_deal_guarantors
AFTER INSERT OR DELETE ON public.deal_guarantors
FOR EACH ROW EXECUTE FUNCTION public.trg_ddp_from_deal_guarantors();

-- When a property is added/removed from a deal, sync all docs linked to that property
CREATE OR REPLACE FUNCTION public.trg_ddp_from_deal_property()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
SET row_security = 'off'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.deal_document_participants (deal_id, document_file_id, source_table, source_pk)
    SELECT NEW.deal_id, dfp.document_file_id, 'document_files_properties', dfp.id
    FROM public.document_files_properties dfp
    WHERE dfp.property_id = NEW.property_id
    ON CONFLICT DO NOTHING;

    RETURN NEW;

  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM public.deal_document_participants ddp
    WHERE ddp.deal_id = OLD.deal_id
      AND ddp.source_table = 'document_files_properties'
      AND ddp.source_pk IN (
        SELECT dfp.id
        FROM public.document_files_properties dfp
        WHERE dfp.property_id = OLD.property_id
      );

    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_ddp_deal_property ON public.deal_property;
CREATE TRIGGER trg_ddp_deal_property
AFTER INSERT OR DELETE ON public.deal_property
FOR EACH ROW EXECUTE FUNCTION public.trg_ddp_from_deal_property();

-- When a company's deal or company assignment changes, sync all docs linked to that company
-- Handles INSERT, DELETE, and UPDATE (deal_id OR co_id can change!)
CREATE OR REPLACE FUNCTION public.trg_ddp_from_company_roles()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
SET row_security = 'off'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.deal_id IS NOT NULL THEN
      INSERT INTO public.deal_document_participants (deal_id, document_file_id, source_table, source_pk)
      SELECT NEW.deal_id, dfc.document_file_id, 'document_files_companies', dfc.id
      FROM public.document_files_companies dfc
      WHERE dfc.company_id = NEW.co_id
      ON CONFLICT DO NOTHING;
    END IF;
    RETURN NEW;

  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.deal_id IS NOT NULL THEN
      DELETE FROM public.deal_document_participants ddp
      WHERE ddp.deal_id = OLD.deal_id
        AND ddp.source_table = 'document_files_companies'
        AND ddp.source_pk IN (
          SELECT dfc.id
          FROM public.document_files_companies dfc
          WHERE dfc.company_id = OLD.co_id
        );
    END IF;
    RETURN OLD;

  ELSIF TG_OP = 'UPDATE' THEN
    -- remove old deal mapping if deal_id changed or company changed
    IF OLD.deal_id IS NOT NULL AND (OLD.deal_id IS DISTINCT FROM NEW.deal_id OR OLD.co_id IS DISTINCT FROM NEW.co_id) THEN
      DELETE FROM public.deal_document_participants ddp
      WHERE ddp.deal_id = OLD.deal_id
        AND ddp.source_table = 'document_files_companies'
        AND ddp.source_pk IN (
          SELECT dfc.id
          FROM public.document_files_companies dfc
          WHERE dfc.company_id = OLD.co_id
        );
    END IF;

    -- add new mapping
    IF NEW.deal_id IS NOT NULL THEN
      INSERT INTO public.deal_document_participants (deal_id, document_file_id, source_table, source_pk)
      SELECT NEW.deal_id, dfc.document_file_id, 'document_files_companies', dfc.id
      FROM public.document_files_companies dfc
      WHERE dfc.company_id = NEW.co_id
      ON CONFLICT DO NOTHING;
    END IF;

    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_ddp_company_roles ON public.company_roles;
CREATE TRIGGER trg_ddp_company_roles
AFTER INSERT OR DELETE OR UPDATE OF deal_id, co_id ON public.company_roles
FOR EACH ROW EXECUTE FUNCTION public.trg_ddp_from_company_roles();

--------------------------------------------------------------------------------
-- SECTION 3: Backfill existing data
--------------------------------------------------------------------------------

-- Direct deal links
INSERT INTO public.deal_document_participants (deal_id, document_file_id, source_table, source_pk)
SELECT deal_id, document_file_id, 'document_files_deals', id
FROM public.document_files_deals
ON CONFLICT DO NOTHING;

-- Guarantor path
INSERT INTO public.deal_document_participants (deal_id, document_file_id, source_table, source_pk)
SELECT dg.deal_id, dfg.document_file_id, 'document_files_guarantors', dfg.id
FROM public.document_files_guarantors dfg
JOIN public.deal_guarantors dg ON dg.guarantor_id = dfg.guarantor_id
ON CONFLICT DO NOTHING;

-- Borrower path
INSERT INTO public.deal_document_participants (deal_id, document_file_id, source_table, source_pk)
SELECT dg.deal_id, dfb.document_file_id, 'document_files_borrowers', dfb.id
FROM public.document_files_borrowers dfb
JOIN public.guarantor g ON g.borrower_id = dfb.borrower_id
JOIN public.deal_guarantors dg ON dg.guarantor_id = g.id
ON CONFLICT DO NOTHING;

-- Property path
INSERT INTO public.deal_document_participants (deal_id, document_file_id, source_table, source_pk)
SELECT dp.deal_id, dfp.document_file_id, 'document_files_properties', dfp.id
FROM public.document_files_properties dfp
JOIN public.deal_property dp ON dp.property_id = dfp.property_id
ON CONFLICT DO NOTHING;

-- Company path
INSERT INTO public.deal_document_participants (deal_id, document_file_id, source_table, source_pk)
SELECT cr.deal_id, dfc.document_file_id, 'document_files_companies', dfc.id
FROM public.document_files_companies dfc
JOIN public.company_roles cr ON cr.co_id = dfc.company_id
WHERE cr.deal_id IS NOT NULL
ON CONFLICT DO NOTHING;

--------------------------------------------------------------------------------
-- SECTION 4: Helper functions for querying
--------------------------------------------------------------------------------

-- Return full document_files rows for a deal (respects RLS via SECURITY INVOKER)
CREATE OR REPLACE FUNCTION public.get_deal_documents(p_deal_id bigint)
RETURNS SETOF public.document_files
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO 'public'
AS $$
  SELECT df.*
  FROM public.document_files df
  JOIN public.deal_document_participants ddp
    ON ddp.document_file_id = df.id
  WHERE ddp.deal_id = p_deal_id
  ORDER BY df.created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_deal_documents(bigint) TO authenticated;

-- Return docs with sources for auditability
CREATE OR REPLACE FUNCTION public.get_deal_documents_with_sources(p_deal_id bigint)
RETURNS TABLE (
  document_file_id bigint,
  document_name text,
  storage_bucket text,
  storage_path text,
  created_at timestamptz,
  sources text[]
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO 'public'
AS $$
  SELECT
    df.id,
    df.document_name,
    df.storage_bucket,
    df.storage_path,
    df.created_at,
    array_agg(DISTINCT ddp.source_table ORDER BY ddp.source_table) AS sources
  FROM public.document_files df
  JOIN public.deal_document_participants ddp
    ON ddp.document_file_id = df.id
  WHERE ddp.deal_id = p_deal_id
  GROUP BY df.id, df.document_name, df.storage_bucket, df.storage_path, df.created_at
  ORDER BY df.created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_deal_documents_with_sources(bigint) TO authenticated;

--------------------------------------------------------------------------------
-- SECTION 5: Reconciliation function (rebuild from scratch if triggers drift)
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.refresh_deal_document_participants()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
SET row_security = 'off'
AS $$
BEGIN
  -- Only internal admins can run this
  IF NOT public.is_internal_admin() THEN
    RAISE EXCEPTION 'Permission denied: internal admin only';
  END IF;

  -- Clear and rebuild
  TRUNCATE TABLE public.deal_document_participants;

  -- Direct deal links
  INSERT INTO public.deal_document_participants (deal_id, document_file_id, source_table, source_pk)
  SELECT deal_id, document_file_id, 'document_files_deals', id
  FROM public.document_files_deals
  ON CONFLICT DO NOTHING;

  -- Guarantor path
  INSERT INTO public.deal_document_participants (deal_id, document_file_id, source_table, source_pk)
  SELECT dg.deal_id, dfg.document_file_id, 'document_files_guarantors', dfg.id
  FROM public.document_files_guarantors dfg
  JOIN public.deal_guarantors dg ON dg.guarantor_id = dfg.guarantor_id
  ON CONFLICT DO NOTHING;

  -- Borrower path
  INSERT INTO public.deal_document_participants (deal_id, document_file_id, source_table, source_pk)
  SELECT dg.deal_id, dfb.document_file_id, 'document_files_borrowers', dfb.id
  FROM public.document_files_borrowers dfb
  JOIN public.guarantor g ON g.borrower_id = dfb.borrower_id
  JOIN public.deal_guarantors dg ON dg.guarantor_id = g.id
  ON CONFLICT DO NOTHING;

  -- Property path
  INSERT INTO public.deal_document_participants (deal_id, document_file_id, source_table, source_pk)
  SELECT dp.deal_id, dfp.document_file_id, 'document_files_properties', dfp.id
  FROM public.document_files_properties dfp
  JOIN public.deal_property dp ON dp.property_id = dfp.property_id
  ON CONFLICT DO NOTHING;

  -- Company path
  INSERT INTO public.deal_document_participants (deal_id, document_file_id, source_table, source_pk)
  SELECT cr.deal_id, dfc.document_file_id, 'document_files_companies', dfc.id
  FROM public.document_files_companies dfc
  JOIN public.company_roles cr ON cr.co_id = dfc.company_id
  WHERE cr.deal_id IS NOT NULL
  ON CONFLICT DO NOTHING;
END;
$$;

GRANT EXECUTE ON FUNCTION public.refresh_deal_document_participants() TO authenticated;

COMMIT;
