create extension if not exists "pg_cron" with schema "extensions";


drop trigger if exists "validate_investor_allocation_sum_delete" on "public"."bsi_transactions_investors";

drop trigger if exists "validate_investor_allocation_sum_insert" on "public"."bsi_transactions_investors";

drop policy "Users can link documents to their transactions" on "public"."bsi_transaction_document_files";

drop policy "Users can unlink their documents" on "public"."bsi_transaction_document_files";

drop policy "Users can view documents for their transactions" on "public"."bsi_transaction_document_files";

drop policy "Org members and admins can read transactions" on "public"."bsi_transactions";

drop policy "Admin can select all contacts" on "public"."contact";

drop policy "Admin can manage payroll submissions" on "public"."payroll_submission";

drop policy "Users can view payroll submissions for their deals" on "public"."payroll_submission";

drop policy "Admin can manage payroll fees" on "public"."payroll_submission_fees_1099";

revoke delete on table "public"."bsi_transaction_document_files" from "anon";

revoke insert on table "public"."bsi_transaction_document_files" from "anon";

revoke references on table "public"."bsi_transaction_document_files" from "anon";

revoke select on table "public"."bsi_transaction_document_files" from "anon";

revoke trigger on table "public"."bsi_transaction_document_files" from "anon";

revoke truncate on table "public"."bsi_transaction_document_files" from "anon";

revoke update on table "public"."bsi_transaction_document_files" from "anon";

revoke delete on table "public"."bsi_transaction_document_files" from "authenticated";

revoke insert on table "public"."bsi_transaction_document_files" from "authenticated";

revoke references on table "public"."bsi_transaction_document_files" from "authenticated";

revoke select on table "public"."bsi_transaction_document_files" from "authenticated";

revoke trigger on table "public"."bsi_transaction_document_files" from "authenticated";

revoke truncate on table "public"."bsi_transaction_document_files" from "authenticated";

revoke update on table "public"."bsi_transaction_document_files" from "authenticated";

revoke delete on table "public"."bsi_transaction_document_files" from "service_role";

revoke insert on table "public"."bsi_transaction_document_files" from "service_role";

revoke references on table "public"."bsi_transaction_document_files" from "service_role";

revoke select on table "public"."bsi_transaction_document_files" from "service_role";

revoke trigger on table "public"."bsi_transaction_document_files" from "service_role";

revoke truncate on table "public"."bsi_transaction_document_files" from "service_role";

revoke update on table "public"."bsi_transaction_document_files" from "service_role";

revoke delete on table "public"."payroll_submission" from "anon";

revoke insert on table "public"."payroll_submission" from "anon";

revoke references on table "public"."payroll_submission" from "anon";

revoke select on table "public"."payroll_submission" from "anon";

revoke trigger on table "public"."payroll_submission" from "anon";

revoke truncate on table "public"."payroll_submission" from "anon";

revoke update on table "public"."payroll_submission" from "anon";

revoke delete on table "public"."payroll_submission" from "authenticated";

revoke insert on table "public"."payroll_submission" from "authenticated";

revoke references on table "public"."payroll_submission" from "authenticated";

revoke select on table "public"."payroll_submission" from "authenticated";

revoke trigger on table "public"."payroll_submission" from "authenticated";

revoke truncate on table "public"."payroll_submission" from "authenticated";

revoke update on table "public"."payroll_submission" from "authenticated";

revoke delete on table "public"."payroll_submission" from "service_role";

revoke insert on table "public"."payroll_submission" from "service_role";

revoke references on table "public"."payroll_submission" from "service_role";

revoke select on table "public"."payroll_submission" from "service_role";

revoke trigger on table "public"."payroll_submission" from "service_role";

revoke truncate on table "public"."payroll_submission" from "service_role";

revoke update on table "public"."payroll_submission" from "service_role";

revoke delete on table "public"."payroll_submission_fees_1099" from "anon";

revoke insert on table "public"."payroll_submission_fees_1099" from "anon";

revoke references on table "public"."payroll_submission_fees_1099" from "anon";

revoke select on table "public"."payroll_submission_fees_1099" from "anon";

revoke trigger on table "public"."payroll_submission_fees_1099" from "anon";

revoke truncate on table "public"."payroll_submission_fees_1099" from "anon";

revoke update on table "public"."payroll_submission_fees_1099" from "anon";

revoke delete on table "public"."payroll_submission_fees_1099" from "authenticated";

revoke insert on table "public"."payroll_submission_fees_1099" from "authenticated";

revoke references on table "public"."payroll_submission_fees_1099" from "authenticated";

revoke select on table "public"."payroll_submission_fees_1099" from "authenticated";

revoke trigger on table "public"."payroll_submission_fees_1099" from "authenticated";

revoke truncate on table "public"."payroll_submission_fees_1099" from "authenticated";

revoke update on table "public"."payroll_submission_fees_1099" from "authenticated";

revoke delete on table "public"."payroll_submission_fees_1099" from "service_role";

revoke insert on table "public"."payroll_submission_fees_1099" from "service_role";

revoke references on table "public"."payroll_submission_fees_1099" from "service_role";

revoke select on table "public"."payroll_submission_fees_1099" from "service_role";

revoke trigger on table "public"."payroll_submission_fees_1099" from "service_role";

revoke truncate on table "public"."payroll_submission_fees_1099" from "service_role";

revoke update on table "public"."payroll_submission_fees_1099" from "service_role";

alter table "public"."bsi_transaction_document_files" drop constraint "fk_document_file";

alter table "public"."bsi_transaction_document_files" drop constraint "fk_transaction";

alter table "public"."bsi_transaction_document_files" drop constraint "unique_transaction_document";

alter table "public"."payroll_submission" drop constraint "payroll_submission_deal_id_fkey";

alter table "public"."payroll_submission_fees_1099" drop constraint "payroll_submission_fees_1099_broker_id_fkey";

alter table "public"."payroll_submission_fees_1099" drop constraint "payroll_submission_fees_1099_payroll_submission_id_fkey";

drop function if exists "public"."check_investor_allocation_sum"();

drop view if exists "public"."transaction_documents_view";

alter table "public"."bsi_transaction_document_files" drop constraint "bsi_transaction_document_files_pkey";

alter table "public"."payroll_submission" drop constraint "payroll_submission_pkey";

alter table "public"."payroll_submission_fees_1099" drop constraint "payroll_submission_fees_1099_pkey";

drop index if exists "public"."payroll_submission_fees_1099_pkey";

drop index if exists "public"."payroll_submission_pkey";

drop index if exists "public"."bsi_transaction_document_files_pkey";

drop index if exists "public"."idx_bsi_transaction_document_files_document_file_id";

drop index if exists "public"."idx_bsi_transaction_document_files_transaction_id";

drop index if exists "public"."unique_transaction_document";

drop table "public"."bsi_transaction_document_files";

drop table "public"."payroll_submission";

drop table "public"."payroll_submission_fees_1099";

create table "public"."bsi_transactions_document_files" (
    "id" bigint not null default nextval('bsi_transaction_document_files_id_seq'::regclass),
    "transaction_id" bigint not null,
    "document_file_id" bigint not null,
    "created_at" timestamp with time zone default now()
);


alter table "public"."bsi_transactions_document_files" enable row level security;

create table "public"."payroll_ledger" (
    "id" bigint generated by default as identity not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone default now(),
    "income_bpc_usd" numeric,
    "income_bpc_pct" numeric,
    "income_lpc_usd" numeric,
    "income_lpc_pct" numeric,
    "income_lpc_trailing_yn" boolean,
    "income_lpc_trailing_usd" numeric,
    "income_lpc_trailing_pct" numeric,
    "income_lpc_promo_usd" numeric,
    "expense_ace_corp_return_usd" numeric default 0.00,
    "expense_ace_corp_override_usd" numeric default 0.00,
    "expense_misc_ppcc_usd" numeric default 0.00,
    "income_net_usd" numeric,
    "comp_ae_formula_output_usd" numeric,
    "comp_ae_formula_output_pct" numeric,
    "comp_ae_final_usd" numeric,
    "comp_lp_formula_output_usd" numeric,
    "comp_lp_formula_output_pct" numeric,
    "comp_lp_final_usd" numeric,
    "income_bpc_received_yn" boolean,
    "income_bpc_received_datetime" timestamp with time zone,
    "deal_id" bigint
);


alter table "public"."payroll_ledger" enable row level security;

create table "public"."payroll_ledger_fees_1099" (
    "id" uuid not null default gen_random_uuid(),
    "payroll_ledger_id" bigint,
    "payee_id" bigint,
    "fee_amount_usd" numeric,
    "fee_amount_pct" numeric,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone
);


alter table "public"."payroll_ledger_fees_1099" enable row level security;

create table "public"."roles" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "created_at" timestamp with time zone default CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone default CURRENT_TIMESTAMP
);


alter table "public"."roles" enable row level security;

create table "public"."users_roles" (
    "id" uuid not null default gen_random_uuid(),
    "role_id" uuid not null,
    "user_id" uuid not null,
    "created_at" timestamp with time zone default CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone default CURRENT_TIMESTAMP
);


alter table "public"."users_roles" enable row level security;

alter table "public"."bsi_transactions_investors" add column "amount" numeric;

alter sequence "public"."bsi_transaction_document_files_id_seq" owned by "public"."bsi_transactions_document_files"."id";

CREATE UNIQUE INDEX payroll_ledger_fees_1099_pkey ON public.payroll_ledger_fees_1099 USING btree (id);

CREATE UNIQUE INDEX payroll_ledger_pkey ON public.payroll_ledger USING btree (id);

CREATE UNIQUE INDEX roles_pkey ON public.roles USING btree (id);

CREATE UNIQUE INDEX users_roles_pkey ON public.users_roles USING btree (id);

CREATE INDEX users_roles_role_id_idx ON public.users_roles USING btree (role_id);

CREATE INDEX users_roles_user_id_idx ON public.users_roles USING btree (user_id);

CREATE UNIQUE INDEX bsi_transaction_document_files_pkey ON public.bsi_transactions_document_files USING btree (id);

CREATE INDEX idx_bsi_transaction_document_files_document_file_id ON public.bsi_transactions_document_files USING btree (document_file_id);

CREATE INDEX idx_bsi_transaction_document_files_transaction_id ON public.bsi_transactions_document_files USING btree (transaction_id);

CREATE UNIQUE INDEX unique_transaction_document ON public.bsi_transactions_document_files USING btree (transaction_id, document_file_id);

alter table "public"."bsi_transactions_document_files" add constraint "bsi_transaction_document_files_pkey" PRIMARY KEY using index "bsi_transaction_document_files_pkey";

alter table "public"."payroll_ledger" add constraint "payroll_ledger_pkey" PRIMARY KEY using index "payroll_ledger_pkey";

alter table "public"."payroll_ledger_fees_1099" add constraint "payroll_ledger_fees_1099_pkey" PRIMARY KEY using index "payroll_ledger_fees_1099_pkey";

alter table "public"."roles" add constraint "roles_pkey" PRIMARY KEY using index "roles_pkey";

alter table "public"."users_roles" add constraint "users_roles_pkey" PRIMARY KEY using index "users_roles_pkey";

alter table "public"."bsi_transactions_document_files" add constraint "fk_document_file" FOREIGN KEY (document_file_id) REFERENCES document_files(id) ON DELETE CASCADE not valid;

alter table "public"."bsi_transactions_document_files" validate constraint "fk_document_file";

alter table "public"."bsi_transactions_document_files" add constraint "fk_transaction" FOREIGN KEY (transaction_id) REFERENCES bsi_transactions(id) ON DELETE CASCADE not valid;

alter table "public"."bsi_transactions_document_files" validate constraint "fk_transaction";

alter table "public"."bsi_transactions_document_files" add constraint "unique_transaction_document" UNIQUE using index "unique_transaction_document";

alter table "public"."bsi_transactions_investors" add constraint "bsi_transactions_investors_amount_positive" CHECK ((amount > (0)::numeric)) not valid;

alter table "public"."bsi_transactions_investors" validate constraint "bsi_transactions_investors_amount_positive";

alter table "public"."payroll_ledger" add constraint "payroll_ledger_deal_id_fkey" FOREIGN KEY (deal_id) REFERENCES deal(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."payroll_ledger" validate constraint "payroll_ledger_deal_id_fkey";

alter table "public"."payroll_ledger_fees_1099" add constraint "payroll_ledger_fees_1099_payee_id_fkey" FOREIGN KEY (payee_id) REFERENCES contact(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."payroll_ledger_fees_1099" validate constraint "payroll_ledger_fees_1099_payee_id_fkey";

alter table "public"."payroll_ledger_fees_1099" add constraint "payroll_ledger_fees_1099_payroll_ledger_id_fkey" FOREIGN KEY (payroll_ledger_id) REFERENCES payroll_ledger(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."payroll_ledger_fees_1099" validate constraint "payroll_ledger_fees_1099_payroll_ledger_id_fkey";

alter table "public"."users_roles" add constraint "users_roles_role_id_fkey" FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE not valid;

alter table "public"."users_roles" validate constraint "users_roles_role_id_fkey";

alter table "public"."users_roles" add constraint "users_roles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."users_roles" validate constraint "users_roles_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_complete_schema()
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
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
$function$
;

create or replace view "public"."transaction_documents_view" as  SELECT tdf.transaction_id,
    tdf.id AS junction_id,
    df.id,
    df.created_at,
    df.document_name,
    df.public_notes,
    df.private_notes,
    df.document_status,
    df.document_category,
    df.deal_id,
    df.borrower_id,
    df.entity_id,
    df.property_id,
    df.guarantor_id,
    df.effective_date,
    df.expiration_date,
    df.is_required,
    df.uploaded_by,
    df.uploaded_at,
    df.file_url,
    df.file_size,
    df.file_type,
    df.file_path
   FROM (bsi_transactions_document_files tdf
     JOIN document_files df ON ((tdf.document_file_id = df.id)));


grant delete on table "public"."bsi_transactions_document_files" to "anon";

grant insert on table "public"."bsi_transactions_document_files" to "anon";

grant references on table "public"."bsi_transactions_document_files" to "anon";

grant select on table "public"."bsi_transactions_document_files" to "anon";

grant trigger on table "public"."bsi_transactions_document_files" to "anon";

grant truncate on table "public"."bsi_transactions_document_files" to "anon";

grant update on table "public"."bsi_transactions_document_files" to "anon";

grant delete on table "public"."bsi_transactions_document_files" to "authenticated";

grant insert on table "public"."bsi_transactions_document_files" to "authenticated";

grant references on table "public"."bsi_transactions_document_files" to "authenticated";

grant select on table "public"."bsi_transactions_document_files" to "authenticated";

grant trigger on table "public"."bsi_transactions_document_files" to "authenticated";

grant truncate on table "public"."bsi_transactions_document_files" to "authenticated";

grant update on table "public"."bsi_transactions_document_files" to "authenticated";

grant delete on table "public"."bsi_transactions_document_files" to "service_role";

grant insert on table "public"."bsi_transactions_document_files" to "service_role";

grant references on table "public"."bsi_transactions_document_files" to "service_role";

grant select on table "public"."bsi_transactions_document_files" to "service_role";

grant trigger on table "public"."bsi_transactions_document_files" to "service_role";

grant truncate on table "public"."bsi_transactions_document_files" to "service_role";

grant update on table "public"."bsi_transactions_document_files" to "service_role";

grant delete on table "public"."payroll_ledger" to "anon";

grant insert on table "public"."payroll_ledger" to "anon";

grant references on table "public"."payroll_ledger" to "anon";

grant select on table "public"."payroll_ledger" to "anon";

grant trigger on table "public"."payroll_ledger" to "anon";

grant truncate on table "public"."payroll_ledger" to "anon";

grant update on table "public"."payroll_ledger" to "anon";

grant delete on table "public"."payroll_ledger" to "authenticated";

grant insert on table "public"."payroll_ledger" to "authenticated";

grant references on table "public"."payroll_ledger" to "authenticated";

grant select on table "public"."payroll_ledger" to "authenticated";

grant trigger on table "public"."payroll_ledger" to "authenticated";

grant truncate on table "public"."payroll_ledger" to "authenticated";

grant update on table "public"."payroll_ledger" to "authenticated";

grant delete on table "public"."payroll_ledger" to "service_role";

grant insert on table "public"."payroll_ledger" to "service_role";

grant references on table "public"."payroll_ledger" to "service_role";

grant select on table "public"."payroll_ledger" to "service_role";

grant trigger on table "public"."payroll_ledger" to "service_role";

grant truncate on table "public"."payroll_ledger" to "service_role";

grant update on table "public"."payroll_ledger" to "service_role";

grant delete on table "public"."payroll_ledger_fees_1099" to "anon";

grant insert on table "public"."payroll_ledger_fees_1099" to "anon";

grant references on table "public"."payroll_ledger_fees_1099" to "anon";

grant select on table "public"."payroll_ledger_fees_1099" to "anon";

grant trigger on table "public"."payroll_ledger_fees_1099" to "anon";

grant truncate on table "public"."payroll_ledger_fees_1099" to "anon";

grant update on table "public"."payroll_ledger_fees_1099" to "anon";

grant delete on table "public"."payroll_ledger_fees_1099" to "authenticated";

grant insert on table "public"."payroll_ledger_fees_1099" to "authenticated";

grant references on table "public"."payroll_ledger_fees_1099" to "authenticated";

grant select on table "public"."payroll_ledger_fees_1099" to "authenticated";

grant trigger on table "public"."payroll_ledger_fees_1099" to "authenticated";

grant truncate on table "public"."payroll_ledger_fees_1099" to "authenticated";

grant update on table "public"."payroll_ledger_fees_1099" to "authenticated";

grant delete on table "public"."payroll_ledger_fees_1099" to "service_role";

grant insert on table "public"."payroll_ledger_fees_1099" to "service_role";

grant references on table "public"."payroll_ledger_fees_1099" to "service_role";

grant select on table "public"."payroll_ledger_fees_1099" to "service_role";

grant trigger on table "public"."payroll_ledger_fees_1099" to "service_role";

grant truncate on table "public"."payroll_ledger_fees_1099" to "service_role";

grant update on table "public"."payroll_ledger_fees_1099" to "service_role";

grant delete on table "public"."roles" to "anon";

grant insert on table "public"."roles" to "anon";

grant references on table "public"."roles" to "anon";

grant select on table "public"."roles" to "anon";

grant trigger on table "public"."roles" to "anon";

grant truncate on table "public"."roles" to "anon";

grant update on table "public"."roles" to "anon";

grant delete on table "public"."roles" to "authenticated";

grant insert on table "public"."roles" to "authenticated";

grant references on table "public"."roles" to "authenticated";

grant select on table "public"."roles" to "authenticated";

grant trigger on table "public"."roles" to "authenticated";

grant truncate on table "public"."roles" to "authenticated";

grant update on table "public"."roles" to "authenticated";

grant delete on table "public"."roles" to "service_role";

grant insert on table "public"."roles" to "service_role";

grant references on table "public"."roles" to "service_role";

grant select on table "public"."roles" to "service_role";

grant trigger on table "public"."roles" to "service_role";

grant truncate on table "public"."roles" to "service_role";

grant update on table "public"."roles" to "service_role";

grant delete on table "public"."users_roles" to "anon";

grant insert on table "public"."users_roles" to "anon";

grant references on table "public"."users_roles" to "anon";

grant select on table "public"."users_roles" to "anon";

grant trigger on table "public"."users_roles" to "anon";

grant truncate on table "public"."users_roles" to "anon";

grant update on table "public"."users_roles" to "anon";

grant delete on table "public"."users_roles" to "authenticated";

grant insert on table "public"."users_roles" to "authenticated";

grant references on table "public"."users_roles" to "authenticated";

grant select on table "public"."users_roles" to "authenticated";

grant trigger on table "public"."users_roles" to "authenticated";

grant truncate on table "public"."users_roles" to "authenticated";

grant update on table "public"."users_roles" to "authenticated";

grant delete on table "public"."users_roles" to "service_role";

grant insert on table "public"."users_roles" to "service_role";

grant references on table "public"."users_roles" to "service_role";

grant select on table "public"."users_roles" to "service_role";

grant trigger on table "public"."users_roles" to "service_role";

grant truncate on table "public"."users_roles" to "service_role";

grant update on table "public"."users_roles" to "service_role";

create policy "Admin can manage borrower"
on "public"."borrower"
as permissive
for all
to authenticated
using ((EXISTS ( SELECT 1
   FROM auth_clerk_users acu
  WHERE ((acu.clerk_user_id = (auth.uid())::text) AND (acu.role = 'admin'::user_role_internal)))))
with check ((EXISTS ( SELECT 1
   FROM auth_clerk_users acu
  WHERE ((acu.clerk_user_id = (auth.uid())::text) AND (acu.role = 'admin'::user_role_internal)))));


create policy "Users can link documents to their transactions"
on "public"."bsi_transactions_document_files"
as permissive
for insert
to public
with check (((EXISTS ( SELECT 1
   FROM (bsi_transactions t
     JOIN bsi_transactions_investors ti ON ((t.id = ti.transaction_id)))
  WHERE ((t.id = ti.transaction_id) AND (ti.clerk_user_id IN ( SELECT auth_clerk_users.id
           FROM auth_clerk_users
          WHERE (auth_clerk_users.clerk_user_id = (auth.uid())::text)))))) OR (EXISTS ( SELECT 1
   FROM auth_clerk_users
  WHERE ((auth_clerk_users.clerk_user_id = (auth.uid())::text) AND (auth_clerk_users.role = 'admin'::user_role_internal))))));


create policy "Users can unlink their documents"
on "public"."bsi_transactions_document_files"
as permissive
for delete
to public
using (((EXISTS ( SELECT 1
   FROM document_files df
  WHERE ((df.id = bsi_transactions_document_files.document_file_id) AND (df.uploaded_by = (auth.uid())::text)))) OR (EXISTS ( SELECT 1
   FROM auth_clerk_users
  WHERE ((auth_clerk_users.clerk_user_id = (auth.uid())::text) AND (auth_clerk_users.role = 'admin'::user_role_internal))))));


create policy "Users can view documents for their transactions"
on "public"."bsi_transactions_document_files"
as permissive
for select
to public
using (((EXISTS ( SELECT 1
   FROM (bsi_transactions t
     JOIN bsi_transactions_investors ti ON ((t.id = ti.transaction_id)))
  WHERE ((t.id = bsi_transactions_document_files.transaction_id) AND (ti.clerk_user_id IN ( SELECT auth_clerk_users.id
           FROM auth_clerk_users
          WHERE (auth_clerk_users.clerk_user_id = (auth.uid())::text)))))) OR (EXISTS ( SELECT 1
   FROM auth_clerk_users
  WHERE ((auth_clerk_users.clerk_user_id = (auth.uid())::text) AND (auth_clerk_users.role = 'admin'::user_role_internal))))));


create policy "Admin can manage company"
on "public"."company"
as permissive
for all
to authenticated
using ((EXISTS ( SELECT 1
   FROM auth_clerk_users acu
  WHERE ((acu.clerk_user_id = (auth.uid())::text) AND (acu.role = 'admin'::user_role_internal)))))
with check ((EXISTS ( SELECT 1
   FROM auth_clerk_users acu
  WHERE ((acu.clerk_user_id = (auth.uid())::text) AND (acu.role = 'admin'::user_role_internal)))));


create policy "Admin can manage contacts"
on "public"."contact"
as permissive
for all
to authenticated
using ((EXISTS ( SELECT 1
   FROM auth_clerk_users acu
  WHERE ((acu.clerk_user_id = (auth.uid())::text) AND (acu.role = 'admin'::user_role_internal)))))
with check ((EXISTS ( SELECT 1
   FROM auth_clerk_users acu
  WHERE ((acu.clerk_user_id = (auth.uid())::text) AND (acu.role = 'admin'::user_role_internal)))));


create policy "Admin can manage loan_application"
on "public"."loan_application"
as permissive
for all
to authenticated
using ((EXISTS ( SELECT 1
   FROM auth_clerk_users acu
  WHERE ((acu.clerk_user_id = (auth.uid())::text) AND (acu.role = 'admin'::user_role_internal)))))
with check ((EXISTS ( SELECT 1
   FROM auth_clerk_users acu
  WHERE ((acu.clerk_user_id = (auth.uid())::text) AND (acu.role = 'admin'::user_role_internal)))));


create policy "Admin can manage payroll submissions"
on "public"."payroll_ledger"
as permissive
for all
to authenticated
using ((EXISTS ( SELECT 1
   FROM auth_clerk_users acu
  WHERE ((acu.clerk_user_id = (auth.uid())::text) AND (acu.role = 'admin'::user_role_internal)))));


create policy "Users can view payroll submissions for their deals"
on "public"."payroll_ledger"
as permissive
for select
to authenticated
using ((deal_id IN ( SELECT bd.deal_id
   FROM (((bsi_deals bd
     JOIN bsi_deals_orgs bdo ON ((bd.id = bdo.deal_id)))
     JOIN auth_clerk_orgs_members om ON ((bdo.clerk_org_id = om.clerk_org_id)))
     JOIN auth_clerk_users acu ON ((om.auth_clerk_users_id = acu.id)))
  WHERE (acu.clerk_user_id = (auth.uid())::text))));


create policy "Admin can manage payroll fees"
on "public"."payroll_ledger_fees_1099"
as permissive
for all
to authenticated
using ((EXISTS ( SELECT 1
   FROM auth_clerk_users acu
  WHERE ((acu.clerk_user_id = (auth.uid())::text) AND (acu.role = 'admin'::user_role_internal)))));


create policy "Admin can manage property"
on "public"."property"
as permissive
for all
to authenticated
using ((EXISTS ( SELECT 1
   FROM auth_clerk_users acu
  WHERE ((acu.clerk_user_id = (auth.uid())::text) AND (acu.role = 'admin'::user_role_internal)))))
with check ((EXISTS ( SELECT 1
   FROM auth_clerk_users acu
  WHERE ((acu.clerk_user_id = (auth.uid())::text) AND (acu.role = 'admin'::user_role_internal)))));


create policy "Public can view roles"
on "public"."roles"
as permissive
for select
to authenticated, anon
using (true);


create policy "Service role can delete roles"
on "public"."roles"
as permissive
for delete
to service_role
using (true);


create policy "Service role can insert roles"
on "public"."roles"
as permissive
for insert
to service_role
with check (true);


create policy "Service role can update roles"
on "public"."roles"
as permissive
for update
to service_role
using (true)
with check (true);


create policy "Public can view users_roles"
on "public"."users_roles"
as permissive
for select
to authenticated, anon
using (true);


create policy "Service role can delete users_roles"
on "public"."users_roles"
as permissive
for delete
to service_role
using (true);


create policy "Service role can insert users_roles"
on "public"."users_roles"
as permissive
for insert
to service_role
with check (true);


create policy "Service role can update users_roles"
on "public"."users_roles"
as permissive
for update
to service_role
using (true)
with check (true);



