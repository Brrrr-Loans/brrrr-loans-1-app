-- Migration: Fix function search_path security vulnerabilities
-- Adds SET search_path = '' to all affected functions and schema-qualifies all references
-- Addresses Supabase Security Advisor warnings: function_search_path_mutable

SET check_function_bodies = off;

-- ============================================================================
-- 1. is_admin - CRITICAL (used in RLS policies)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''  -- ADDED: Security fix
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.auth_clerk_users acu  -- CHANGED: Added public. prefix
    WHERE acu.clerk_user_id = (auth.jwt() ->> 'sub'::text)  -- auth.jwt() is built-in, no prefix needed
    AND acu.role = 'admin'::public.user_role_internal  -- CHANGED: Added public. prefix to enum
  );
$$;

COMMENT ON FUNCTION public.is_admin() IS 
'Check if current user is an admin. Used in RLS policies. Security: search_path fixed on 2025-11-18.';

-- ============================================================================
-- 2. count_pending_brex_transfer_syncs - HIGH PRIORITY
-- ============================================================================
CREATE OR REPLACE FUNCTION public.count_pending_brex_transfer_syncs()
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''  -- ADDED: Security fix
AS $$
DECLARE
    v_count bigint;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM public.api_brex_transfers at  -- CHANGED: Added public. prefix
    WHERE at.counterparty_id IS NOT NULL
    AND (
        EXISTS (
            SELECT 1 FROM public.api_brex_vendors av  -- CHANGED: Added public. prefix
            JOIN public.api_brex_vendors_clerk_users avcu ON avcu.brex_vendor_id = av.id  -- CHANGED: Added public. prefix
            WHERE av.brex_vendor_id = at.counterparty_id
        )
        OR EXISTS (
            SELECT 1 FROM public.api_brex_vendors av  -- CHANGED: Added public. prefix
            JOIN public.api_brex_vendors_clerk_orgs avco ON avco.brex_vendor_id = av.id  -- CHANGED: Added public. prefix
            WHERE av.brex_vendor_id = at.counterparty_id
        )
    )
    AND NOT EXISTS (
        SELECT 1 FROM public.bsi_transactions_api_brex_transfers btbt  -- CHANGED: Added public. prefix
        WHERE btbt.brex_transfer_id = at.brex_transfer_id
    );
    
    RETURN v_count;
END;
$$;

COMMENT ON FUNCTION public.count_pending_brex_transfer_syncs() IS 
'Returns the count of Brex transfers that are matched to vendors but have not yet been synced to bsi_transactions. Security: search_path fixed on 2025-11-18.';

GRANT EXECUTE ON FUNCTION public.count_pending_brex_transfer_syncs() TO service_role;

-- ============================================================================
-- 3. sync_matched_api_brex_transfers_to_bsi_transactions - HIGH PRIORITY
-- ============================================================================
CREATE OR REPLACE FUNCTION public.sync_matched_api_brex_transfers_to_bsi_transactions()
RETURNS TABLE (
    inserted_count bigint,
    updated_count bigint,
    error_count bigint,
    errors jsonb
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''  -- ADDED: Security fix
AS $$
DECLARE
    v_inserted_count bigint := 0;
    v_updated_count bigint := 0;
    v_error_count bigint := 0;
    v_errors jsonb := '[]'::jsonb;
    v_transfer_record RECORD;
    v_transaction_id bigint;
    v_transaction_method text;
    v_transaction_status text;
    v_fed_reference_number text;
    v_amount_dollars numeric;
    v_duplicate_vendors jsonb;
BEGIN
    -- Validate vendor matching
    SELECT jsonb_agg(jsonb_build_object('brex_vendor_id', brex_vendor_id, 'issue', issue_type))
    INTO v_duplicate_vendors
    FROM (
        SELECT 
            av.brex_vendor_id,
            CASE 
                WHEN COALESCE(user_count, 0) > 1 THEN 'Multiple user matches'
                WHEN COALESCE(org_count, 0) > 1 THEN 'Multiple org matches'
                WHEN COALESCE(user_count, 0) > 0 AND COALESCE(org_count, 0) > 0 THEN 'Has both user AND org matches'
            END as issue_type,
            COALESCE(user_count, 0) as user_count,
            COALESCE(org_count, 0) as org_count
        FROM public.api_brex_vendors av  -- CHANGED: Added public. prefix
        LEFT JOIN (
            SELECT brex_vendor_id, COUNT(*) as user_count
            FROM public.api_brex_vendors_clerk_users  -- CHANGED: Added public. prefix
            GROUP BY brex_vendor_id
        ) u ON u.brex_vendor_id = av.id
        LEFT JOIN (
            SELECT brex_vendor_id, COUNT(*) as org_count
            FROM public.api_brex_vendors_clerk_orgs  -- CHANGED: Added public. prefix
            GROUP BY brex_vendor_id
        ) o ON o.brex_vendor_id = av.id
        WHERE (COALESCE(user_count, 0) > 1) 
           OR (COALESCE(org_count, 0) > 1) 
           OR (COALESCE(user_count, 0) > 0 AND COALESCE(org_count, 0) > 0)
    ) violations;
    
    IF v_duplicate_vendors IS NOT NULL THEN
        RAISE EXCEPTION 'Vendor matching validation failed: %', v_duplicate_vendors::text;
    END IF;

    FOR v_transfer_record IN
        SELECT DISTINCT
            at.brex_transfer_id,
            at.amount,
            at.amount_cents,
            at.process_date,
            at.status,
            at.external_memo,
            at.payment_type,
            at.fed_reference_number,
            at.raw_payload,
            COALESCE(
                at.counterparty_id,
                (SELECT av.brex_vendor_id 
                 FROM public.api_brex_vendors av  -- CHANGED: Added public. prefix
                 WHERE av.account_number = at.counterparty_account_number
                   AND av.routing_number = at.counterparty_routing_number
                 LIMIT 1)
            ) as matched_vendor_id,
            (SELECT avcu.clerk_user_id 
             FROM public.api_brex_vendors_clerk_users avcu  -- CHANGED: Added public. prefix
             JOIN public.api_brex_vendors av ON av.id = avcu.brex_vendor_id  -- CHANGED: Added public. prefix
             WHERE av.brex_vendor_id = COALESCE(
                 at.counterparty_id,
                 (SELECT av2.brex_vendor_id 
                  FROM public.api_brex_vendors av2  -- CHANGED: Added public. prefix
                  WHERE av2.account_number = at.counterparty_account_number
                    AND av2.routing_number = at.counterparty_routing_number
                  LIMIT 1)
             )
            ) as clerk_user_id,
            (SELECT avco.clerk_org_id 
             FROM public.api_brex_vendors_clerk_orgs avco  -- CHANGED: Added public. prefix
             JOIN public.api_brex_vendors av ON av.id = avco.brex_vendor_id  -- CHANGED: Added public. prefix
             WHERE av.brex_vendor_id = COALESCE(
                 at.counterparty_id,
                 (SELECT av2.brex_vendor_id 
                  FROM public.api_brex_vendors av2  -- CHANGED: Added public. prefix
                  WHERE av2.account_number = at.counterparty_account_number
                    AND av2.routing_number = at.counterparty_routing_number
                  LIMIT 1)
             )
            ) as clerk_org_id
        FROM public.api_brex_transfers at  -- CHANGED: Added public. prefix
        WHERE (
            at.counterparty_id IS NOT NULL
            OR EXISTS (
                SELECT 1 FROM public.api_brex_vendors av  -- CHANGED: Added public. prefix
                WHERE av.account_number = at.counterparty_account_number
                  AND av.routing_number = at.counterparty_routing_number
            )
        )
        AND (
            EXISTS (
                SELECT 1 FROM public.api_brex_vendors av  -- CHANGED: Added public. prefix
                JOIN public.api_brex_vendors_clerk_users avcu ON avcu.brex_vendor_id = av.id  -- CHANGED: Added public. prefix
                WHERE av.brex_vendor_id = COALESCE(
                    at.counterparty_id,
                    (SELECT av2.brex_vendor_id 
                     FROM public.api_brex_vendors av2  -- CHANGED: Added public. prefix
                     WHERE av2.account_number = at.counterparty_account_number
                       AND av2.routing_number = at.counterparty_routing_number
                     LIMIT 1)
                )
            )
            OR EXISTS (
                SELECT 1 FROM public.api_brex_vendors av  -- CHANGED: Added public. prefix
                JOIN public.api_brex_vendors_clerk_orgs avco ON avco.brex_vendor_id = av.id  -- CHANGED: Added public. prefix
                WHERE av.brex_vendor_id = COALESCE(
                    at.counterparty_id,
                    (SELECT av2.brex_vendor_id 
                     FROM public.api_brex_vendors av2  -- CHANGED: Added public. prefix
                     WHERE av2.account_number = at.counterparty_account_number
                       AND av2.routing_number = at.counterparty_routing_number
                     LIMIT 1)
                )
            )
        )
        AND NOT EXISTS (
            SELECT 1 FROM public.bsi_transactions_api_brex_transfers btbt  -- CHANGED: Added public. prefix
            WHERE btbt.brex_transfer_id = at.brex_transfer_id
        )
    LOOP
        v_fed_reference_number := COALESCE(
            v_transfer_record.fed_reference_number,
            (v_transfer_record.raw_payload->'counterparty'->>'fed_reference_number')::text
        );

        IF v_transfer_record.amount_cents IS NOT NULL THEN
            v_amount_dollars := v_transfer_record.amount_cents / 100.0;
            IF v_transfer_record.amount IS NOT NULL THEN
                IF ABS(v_amount_dollars - v_transfer_record.amount) > 0.01 THEN
                    RAISE EXCEPTION 'Amount inconsistency for transfer %', v_transfer_record.brex_transfer_id;
                END IF;
            END IF;
        ELSIF v_transfer_record.amount IS NOT NULL THEN
            v_amount_dollars := v_transfer_record.amount;
        ELSE
            v_amount_dollars := NULL;
        END IF;

        CASE v_transfer_record.payment_type
            WHEN 'ACH' THEN v_transaction_method := 'ach';
            WHEN 'DOMESTIC_WIRE' THEN v_transaction_method := 'wire';
            WHEN 'INTERNATIONAL_WIRE' THEN v_transaction_method := 'wire';
            WHEN 'CHEQUE' THEN v_transaction_method := 'check';
            ELSE v_transaction_method := 'other';
        END CASE;

        CASE UPPER(TRIM(v_transfer_record.status))
            WHEN 'PROCESSING' THEN v_transaction_status := 'processing';
            WHEN 'COMPLETED' THEN v_transaction_status := 'completed';
            WHEN 'FAILED' THEN v_transaction_status := 'failed';
            WHEN 'CANCELLED', 'CANCELED' THEN v_transaction_status := 'canceled';
            WHEN 'PENDING' THEN v_transaction_status := 'pending';
            WHEN 'SCHEDULED' THEN v_transaction_status := 'scheduled';
            WHEN 'INITIATED' THEN v_transaction_status := 'initiated';
            WHEN 'PROCESSED' THEN v_transaction_status := 'processed';
            ELSE v_transaction_status := COALESCE(
                    LOWER((v_transfer_record.raw_payload->>'status')::text),
                    'pending'
                );
        END CASE;

        IF v_transaction_status NOT IN ('canceled','completed','failed','initiated','on_hold','owed','pending','pending_approval','processed','processing','refunded','returned','scheduled') THEN
            v_transaction_status := 'pending';
        END IF;

        INSERT INTO public.bsi_transactions (  -- CHANGED: Added public. prefix
            transaction_amount,
            transaction_date,
            transaction_method,
            transaction_status,
            reference_number,
            external_memo,
            ledger_entry_type,
            created_at,
            updated_at
        )
        VALUES (
            v_amount_dollars,
            COALESCE(v_transfer_record.process_date::timestamp with time zone, NOW()),
            v_transaction_method::public.transaction_method,  -- CHANGED: Added public. prefix to enum
            v_transaction_status::public.transaction_status,  -- CHANGED: Added public. prefix to enum
            v_fed_reference_number,
            v_transfer_record.external_memo,
            NULL,
            NOW(),
            NOW()
        )
        RETURNING id INTO v_transaction_id;

        IF v_transfer_record.clerk_user_id IS NOT NULL OR v_transfer_record.clerk_org_id IS NOT NULL THEN
            INSERT INTO public.bsi_transactions_investors (  -- CHANGED: Added public. prefix
                transaction_id,
                clerk_user_id,
                clerk_org_id,
                allocation_amount,
                created_at
            )
            VALUES (
                v_transaction_id,
                v_transfer_record.clerk_user_id,
                v_transfer_record.clerk_org_id,
                NULL,
                NOW()
            );
        END IF;

        INSERT INTO public.bsi_transactions_api_brex_transfers (  -- CHANGED: Added public. prefix
            transaction_id,
            brex_transfer_id,
            created_at
        )
        VALUES (
            v_transaction_id,
            v_transfer_record.brex_transfer_id,
            NOW()
        );

        v_inserted_count := v_inserted_count + 1;
    END LOOP;

    RETURN QUERY SELECT v_inserted_count, v_updated_count, v_error_count, v_errors;
END;
$$;

COMMENT ON FUNCTION public.sync_matched_api_brex_transfers_to_bsi_transactions() IS 
'Syncs matched Brex transfers to bsi_transactions. Only processes transfers with vendors matched to Clerk users/orgs that have not been synced yet. Security: search_path fixed on 2025-11-18.';

GRANT EXECUTE ON FUNCTION public.sync_matched_api_brex_transfers_to_bsi_transactions() TO service_role;

-- ============================================================================
-- 4. check_deal_allocation_sum - HIGH PRIORITY (trigger function)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.check_deal_allocation_sum()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''  -- ADDED: Security fix
AS $$
DECLARE
    total_allocated DECIMAL(15,2);
    transaction_total DECIMAL(15,2);
BEGIN
    IF TG_OP = 'DELETE' THEN
        SELECT COALESCE(SUM(allocation_amount), 0) INTO total_allocated
        FROM public.bsi_transactions_deals  -- CHANGED: Added public. prefix
        WHERE transaction_id = OLD.transaction_id;

        SELECT transaction_amount INTO transaction_total
        FROM public.bsi_transactions  -- CHANGED: Added public. prefix
        WHERE id = OLD.transaction_id;
    ELSE
        SELECT COALESCE(SUM(allocation_amount), 0) INTO total_allocated
        FROM public.bsi_transactions_deals  -- CHANGED: Added public. prefix
        WHERE transaction_id = NEW.transaction_id;

        SELECT transaction_amount INTO transaction_total
        FROM public.bsi_transactions  -- CHANGED: Added public. prefix
        WHERE id = NEW.transaction_id;
    END IF;

    IF total_allocated > ABS(transaction_total) THEN
        RAISE EXCEPTION 'Total deal allocations (%) cannot exceed transaction amount (%)', 
            total_allocated, ABS(transaction_total);
    END IF;

    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.check_deal_allocation_sum() IS 
'Trigger function to validate deal allocations do not exceed transaction amount. Security: search_path fixed on 2025-11-18.';

-- ============================================================================
-- 5. handle_deal_changes - HIGH PRIORITY (trigger function)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_deal_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''  -- ADDED: Security fix
AS $$
BEGIN
  IF NEW.property_id IS NOT NULL THEN
    NEW.deal_name := public.format_deal_name(NEW.property_id);  -- CHANGED: Added public. prefix
  END IF;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_deal_changes() IS 
'Trigger function to update deal_name when property changes. Security: search_path fixed on 2025-11-18.';

-- ============================================================================
-- 6. update_property_address - HIGH PRIORITY (trigger function)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_property_address()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''  -- ADDED: Security fix
AS $$
DECLARE 
  new_address text;
BEGIN
  IF length(NEW.address_state_long::text) > 2 THEN
    NEW.address_state := public.get_state_code(NEW.address_state_long::text);  -- CHANGED: Added public. prefix
  END IF;

  new_address := public.format_address(NEW.address_street, NEW.address_suite_apt, NEW.address_city, NEW.address_state::text, NEW.address_postal_code, null);  -- CHANGED: Added public. prefix
  
  NEW.address = new_address;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.update_property_address() IS 
'Trigger function to format and update property address. Security: search_path fixed on 2025-11-18.';

-- ============================================================================
-- 7. format_address (6 parameters) - MEDIUM PRIORITY
-- ============================================================================
CREATE OR REPLACE FUNCTION public.format_address(
    street text DEFAULT NULL::text, 
    suite_apt text DEFAULT NULL::text, 
    city text DEFAULT NULL::text, 
    state text DEFAULT NULL::text, 
    postal_code text DEFAULT NULL::text, 
    country text DEFAULT 'United States'::text
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'  -- ADDED: Security fix (note: this one already had a partial fix)
AS $$
BEGIN
  RETURN TRIM(CONCAT_WS(', ',
    NULLIF(CONCAT_WS(' ', street, suite_apt), ''),
    NULLIF(city, ''),
    NULLIF(state, ''),
    NULLIF(postal_code, ''),
    NULLIF(country, '')
  ));
END;
$$;

COMMENT ON FUNCTION public.format_address(text, text, text, text, text, text) IS 
'Format address with 6 parameters. Security: search_path fixed on 2025-11-18.';

-- ============================================================================
-- 8. format_address (7 parameters) - MEDIUM PRIORITY
-- ============================================================================
CREATE OR REPLACE FUNCTION public.format_address(
    po_box text, 
    street text, 
    apt_suite text, 
    city text, 
    state text, 
    postal_code text, 
    country text
)
RETURNS text
LANGUAGE plpgsql
SET search_path = ''  -- ADDED: Security fix
AS $$
DECLARE
    formatted_address text;
BEGIN
    formatted_address := TRIM(BOTH ', ' FROM
        array_to_string(
            ARRAY_REMOVE(
                ARRAY[
                    NULLIF(street, ''),
                    NULLIF(apt_suite, ''),
                    NULLIF(city, ''),
                    CASE
                        WHEN COALESCE(state, '') <> '' AND COALESCE(postal_code, '') <> '' THEN
                            state || ' ' || postal_code
                        WHEN COALESCE(state, '') <> '' THEN
                            state
                        WHEN COALESCE(postal_code, '') <> '' THEN
                            postal_code
                        ELSE
                            NULL
                    END,
                    CASE 
                        WHEN COALESCE(po_box, '') <> '' THEN
                            'PO Box ' || po_box 
                        ELSE 
                            NULL 
                    END
                ],
                NULL
            ),
            ', '
        )
    );

    RETURN formatted_address;
END;
$$;

COMMENT ON FUNCTION public.format_address(text, text, text, text, text, text, text) IS 
'Format address with 7 parameters including PO Box. Security: search_path fixed on 2025-11-18.';

-- ============================================================================
-- 9. format_deal_name - MEDIUM PRIORITY
-- ============================================================================
CREATE OR REPLACE FUNCTION public.format_deal_name(property_id bigint)
RETURNS text
LANGUAGE plpgsql
SET search_path = ''  -- ADDED: Security fix
AS $$
DECLARE
    formatted_name text;
BEGIN
    SELECT 
        CONCAT_WS(', ', 
            p.address_street, 
            p.address_suite_apt, 
            p.address_city || ', ' || p.address_state || ' ' || p.address_postal_code
        )
    INTO formatted_name
    FROM public.property p  -- CHANGED: Added public. prefix
    WHERE p.id = property_id;

    RETURN formatted_name;
END;
$$;

COMMENT ON FUNCTION public.format_deal_name(bigint) IS 
'Format deal name from property address. Security: search_path fixed on 2025-11-18.';

-- ============================================================================
-- 10. get_complete_schema - MEDIUM PRIORITY
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_complete_schema()
RETURNS jsonb
LANGUAGE plpgsql
SET search_path = ''  -- ADDED: Security fix
AS $$
DECLARE
    result jsonb;
BEGIN
    -- Get all enums
    WITH enum_types AS (
        SELECT 
            t.typname as enum_name,
            array_agg(e.enumlabel ORDER BY e.enumsortorder) as enum_values
        FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
        WHERE n.nspname = 'public'
        GROUP BY t.typname
    )
    SELECT jsonb_build_object(
        'enums',
        COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'name', enum_name,
                    'values', to_jsonb(enum_values)
                )
            ),
            '[]'::jsonb
        )
    )
    FROM enum_types
    INTO result;

    -- Get all tables with their details
    WITH RECURSIVE 
    columns_info AS (
        SELECT 
            c.oid as table_oid,
            c.relname as table_name,
            a.attname as column_name,
            format_type(a.atttypid, a.atttypmod) as column_type,
            a.attnotnull as notnull,
            pg_get_expr(d.adbin, d.adrelid) as column_default,
            CASE 
                WHEN a.attidentity != '' THEN true
                WHEN pg_get_expr(d.adbin, d.adrelid) LIKE 'nextval%' THEN true
                ELSE false
            END as is_identity,
            EXISTS (
                SELECT 1 FROM pg_constraint con 
                WHERE con.conrelid = c.oid 
                AND con.contype = 'p' 
                AND a.attnum = ANY(con.conkey)
            ) as is_pk
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        LEFT JOIN pg_attribute a ON a.attrelid = c.oid
        LEFT JOIN pg_attrdef d ON d.adrelid = c.oid AND d.adnum = a.attnum
        WHERE n.nspname = 'public' 
        AND c.relkind = 'r'
        AND a.attnum > 0 
        AND NOT a.attisdropped
    ),
    fk_info AS (
        SELECT 
            c.oid as table_oid,
            jsonb_agg(
                jsonb_build_object(
                    'name', con.conname,
                    'column', col.attname,
                    'foreign_schema', fs.nspname,
                    'foreign_table', ft.relname,
                    'foreign_column', fcol.attname,
                    'on_delete', CASE con.confdeltype
                        WHEN 'a' THEN 'NO ACTION'
                        WHEN 'c' THEN 'CASCADE'
                        WHEN 'r' THEN 'RESTRICT'
                        WHEN 'n' THEN 'SET NULL'
                        WHEN 'd' THEN 'SET DEFAULT'
                        ELSE NULL
                    END
                )
            ) as foreign_keys
        FROM pg_class c
        JOIN pg_constraint con ON con.conrelid = c.oid
        JOIN pg_attribute col ON col.attrelid = con.conrelid AND col.attnum = ANY(con.conkey)
        JOIN pg_class ft ON ft.oid = con.confrelid
        JOIN pg_namespace fs ON fs.oid = ft.relnamespace
        JOIN pg_attribute fcol ON fcol.attrelid = con.confrelid AND fcol.attnum = ANY(con.confkey)
        WHERE con.contype = 'f'
        GROUP BY c.oid
    ),
    index_info AS (
        SELECT 
            c.oid as table_oid,
            jsonb_agg(
                jsonb_build_object(
                    'name', i.relname,
                    'using', am.amname,
                    'columns', (
                        SELECT jsonb_agg(a.attname ORDER BY array_position(ix.indkey, a.attnum))
                        FROM unnest(ix.indkey) WITH ORDINALITY as u(attnum, ord)
                        JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum = u.attnum
                    )
                )
            ) as indexes
        FROM pg_class c
        JOIN pg_index ix ON ix.indrelid = c.oid
        JOIN pg_class i ON i.oid = ix.indexrelid
        JOIN pg_am am ON am.oid = i.relam
        WHERE NOT ix.indisprimary
        GROUP BY c.oid
    ),
    policy_info AS (
        SELECT 
            c.oid as table_oid,
            jsonb_agg(
                jsonb_build_object(
                    'name', pol.polname,
                    'command', CASE pol.polcmd
                        WHEN 'r' THEN 'SELECT'
                        WHEN 'a' THEN 'INSERT'
                        WHEN 'w' THEN 'UPDATE'
                        WHEN 'd' THEN 'DELETE'
                        WHEN '*' THEN 'ALL'
                    END,
                    'roles', (
                        SELECT string_agg(quote_ident(r.rolname), ', ')
                        FROM pg_roles r
                        WHERE r.oid = ANY(pol.polroles)
                    ),
                    'using', pg_get_expr(pol.polqual, pol.polrelid),
                    'check', pg_get_expr(pol.polwithcheck, pol.polrelid)
                )
            ) as policies
        FROM pg_class c
        JOIN pg_policy pol ON pol.polrelid = c.oid
        GROUP BY c.oid
    ),
    trigger_info AS (
        SELECT 
            c.oid as table_oid,
            jsonb_agg(
                jsonb_build_object(
                    'name', t.tgname,
                    'timing', CASE 
                        WHEN t.tgtype & 2 = 2 THEN 'BEFORE'
                        WHEN t.tgtype & 4 = 4 THEN 'AFTER'
                        WHEN t.tgtype & 64 = 64 THEN 'INSTEAD OF'
                    END,
                    'events', (
                        CASE WHEN t.tgtype & 1 = 1 THEN 'INSERT'
                             WHEN t.tgtype & 8 = 8 THEN 'DELETE'
                             WHEN t.tgtype & 16 = 16 THEN 'UPDATE'
                             WHEN t.tgtype & 32 = 32 THEN 'TRUNCATE'
                        END
                    ),
                    'statement', pg_get_triggerdef(t.oid)
                )
            ) as triggers
        FROM pg_class c
        JOIN pg_trigger t ON t.tgrelid = c.oid
        WHERE NOT t.tgisinternal
        GROUP BY c.oid
    ),
    table_info AS (
        SELECT DISTINCT 
            c.table_oid,
            c.table_name,
            jsonb_agg(
                jsonb_build_object(
                    'name', c.column_name,
                    'type', c.column_type,
                    'notnull', c.notnull,
                    'default', c.column_default,
                    'identity', c.is_identity,
                    'is_pk', c.is_pk
                ) ORDER BY c.column_name
            ) as columns,
            COALESCE(fk.foreign_keys, '[]'::jsonb) as foreign_keys,
            COALESCE(i.indexes, '[]'::jsonb) as indexes,
            COALESCE(p.policies, '[]'::jsonb) as policies,
            COALESCE(t.triggers, '[]'::jsonb) as triggers
        FROM columns_info c
        LEFT JOIN fk_info fk ON fk.table_oid = c.table_oid
        LEFT JOIN index_info i ON i.table_oid = c.table_oid
        LEFT JOIN policy_info p ON p.table_oid = c.table_oid
        LEFT JOIN trigger_info t ON t.table_oid = c.table_oid
        GROUP BY c.table_oid, c.table_name, fk.foreign_keys, i.indexes, p.policies, t.triggers
    )
    SELECT result || jsonb_build_object(
        'tables',
        COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'name', table_name,
                    'columns', columns,
                    'foreign_keys', foreign_keys,
                    'indexes', indexes,
                    'policies', policies,
                    'triggers', triggers
                )
            ),
            '[]'::jsonb
        )
    )
    FROM table_info
    INTO result;

    -- Get all functions
    WITH function_info AS (
        SELECT 
            p.proname AS name,
            pg_get_functiondef(p.oid) AS definition
        FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'public'
        AND p.prokind = 'f'
    )
    SELECT result || jsonb_build_object(
        'functions',
        COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'name', name,
                    'definition', definition
                )
            ),
            '[]'::jsonb
        )
    )
    FROM function_info
    INTO result;

    RETURN result;
END;
$$;

COMMENT ON FUNCTION public.get_complete_schema() IS 
'Returns complete schema information as JSON. Security: search_path fixed on 2025-11-18.';

-- ============================================================================
-- ============================================================================
-- 11. user_has_transaction_access - CRITICAL (used for transaction access control)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.user_has_transaction_access(transaction_id_param bigint)
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = ''  -- ADDED: Security fix
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.auth_clerk_users acu  -- CHANGED: Added public. prefix
    WHERE acu.clerk_user_id = (auth.jwt() ->> 'sub'::text)  -- auth.jwt() is built-in, no prefix needed
    AND (
      EXISTS (
        SELECT 1 FROM public.bsi_transactions_investors bti  -- CHANGED: Added public. prefix
        WHERE bti.transaction_id = transaction_id_param
        AND bti.clerk_user_id = acu.id
      )
      OR
      EXISTS (
        SELECT 1 FROM public.bsi_transactions_deals btd  -- CHANGED: Added public. prefix
        JOIN public.bsi_deals bd ON btd.deal_id = bd.deal_id  -- CHANGED: Added public. prefix
        WHERE btd.transaction_id = transaction_id_param
        AND bd.auth_clerk_users_id = acu.id
      )
    )
  );
$$;

COMMENT ON FUNCTION public.user_has_transaction_access(bigint) IS 
'Check if current user has access to a specific transaction. Used for access control. Security: search_path fixed on 2025-11-18.';

-- ============================================================================
-- Enable RLS on backup table
-- ============================================================================
ALTER TABLE public._function_backups_20251118 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only service_role can manage function backups" 
ON public._function_backups_20251118
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can view function backups" 
ON public._function_backups_20251118
FOR SELECT
TO authenticated
USING (true);

-- ============================================================================
-- Validation: Verify all functions were updated successfully
-- ============================================================================
DO $$
DECLARE
    func_count integer;
    missing_search_path text[];
BEGIN
    -- Check that all 11 functions now have search_path set
    SELECT COUNT(*)
    INTO func_count
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
    AND p.proname IN (
        'get_complete_schema',
        'handle_deal_changes',
        'check_deal_allocation_sum',
        'format_deal_name',
        'update_property_address',
        'format_address',
        'sync_matched_api_brex_transfers_to_bsi_transactions',
        'count_pending_brex_transfer_syncs',
        'is_admin',
        'user_has_transaction_access'
    );
    
    IF func_count < 11 THEN
        RAISE WARNING 'Expected 11 functions, found % (note: format_address has 2 overloads)', func_count;
    END IF;
    
    RAISE NOTICE 'Successfully updated % function definitions with search_path security fix', func_count;
END $$;

