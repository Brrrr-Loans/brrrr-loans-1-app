create extension if not exists "pg_cron" with schema "extensions";


create sequence "public"."bsi_transaction_document_files_id_seq";

create sequence "public"."bsi_transactions_deals_id_seq";

create sequence "public"."bsi_transactions_instruments_id_seq";

create sequence "public"."bsi_transactions_investors_id_seq";

drop policy "Org members and admins can read statements" on "public"."bsi_statements";

drop policy "Admin can manage transaction references" on "public"."bsi_transactions_references";

drop policy "Org members can view transaction references" on "public"."bsi_transactions_references";

drop policy "Admin can manage document role assignments" on "public"."document_roles_assigned";

drop policy "Allow auth select" on "public"."borrower";

drop policy "Admin can select all statements" on "public"."bsi_statements";

drop policy "Admins can delete statements" on "public"."bsi_statements";

drop policy "Admins can insert statements" on "public"."bsi_statements";

drop policy "Admins can update statements" on "public"."bsi_statements";

drop policy "Allow auth select" on "public"."guarantor";

drop policy "Allow auth select" on "public"."property";

revoke delete on table "public"."bsi_transactions_references" from "anon";

revoke insert on table "public"."bsi_transactions_references" from "anon";

revoke references on table "public"."bsi_transactions_references" from "anon";

revoke select on table "public"."bsi_transactions_references" from "anon";

revoke trigger on table "public"."bsi_transactions_references" from "anon";

revoke truncate on table "public"."bsi_transactions_references" from "anon";

revoke update on table "public"."bsi_transactions_references" from "anon";

revoke delete on table "public"."bsi_transactions_references" from "authenticated";

revoke insert on table "public"."bsi_transactions_references" from "authenticated";

revoke references on table "public"."bsi_transactions_references" from "authenticated";

revoke select on table "public"."bsi_transactions_references" from "authenticated";

revoke trigger on table "public"."bsi_transactions_references" from "authenticated";

revoke truncate on table "public"."bsi_transactions_references" from "authenticated";

revoke update on table "public"."bsi_transactions_references" from "authenticated";

revoke delete on table "public"."bsi_transactions_references" from "service_role";

revoke insert on table "public"."bsi_transactions_references" from "service_role";

revoke references on table "public"."bsi_transactions_references" from "service_role";

revoke select on table "public"."bsi_transactions_references" from "service_role";

revoke trigger on table "public"."bsi_transactions_references" from "service_role";

revoke truncate on table "public"."bsi_transactions_references" from "service_role";

revoke update on table "public"."bsi_transactions_references" from "service_role";

revoke delete on table "public"."document_roles_assigned" from "anon";

revoke insert on table "public"."document_roles_assigned" from "anon";

revoke references on table "public"."document_roles_assigned" from "anon";

revoke select on table "public"."document_roles_assigned" from "anon";

revoke trigger on table "public"."document_roles_assigned" from "anon";

revoke truncate on table "public"."document_roles_assigned" from "anon";

revoke update on table "public"."document_roles_assigned" from "anon";

revoke delete on table "public"."document_roles_assigned" from "authenticated";

revoke insert on table "public"."document_roles_assigned" from "authenticated";

revoke references on table "public"."document_roles_assigned" from "authenticated";

revoke select on table "public"."document_roles_assigned" from "authenticated";

revoke trigger on table "public"."document_roles_assigned" from "authenticated";

revoke truncate on table "public"."document_roles_assigned" from "authenticated";

revoke update on table "public"."document_roles_assigned" from "authenticated";

revoke delete on table "public"."document_roles_assigned" from "service_role";

revoke insert on table "public"."document_roles_assigned" from "service_role";

revoke references on table "public"."document_roles_assigned" from "service_role";

revoke select on table "public"."document_roles_assigned" from "service_role";

revoke trigger on table "public"."document_roles_assigned" from "service_role";

revoke truncate on table "public"."document_roles_assigned" from "service_role";

revoke update on table "public"."document_roles_assigned" from "service_role";

alter table "public"."bsi_distributions" drop constraint "bsi_distributions_user_id_fkey";

alter table "public"."document_roles_assigned" drop constraint "fk_document";

alter table "public"."document_roles_assigned" drop constraint "fk_role";

alter table "public"."document_roles_assigned" drop constraint "document_roles_assigned_pkey";

drop index if exists "public"."document_roles_assigned_pkey";

drop table "public"."bsi_transactions_references";

drop table "public"."document_roles_assigned";

create table "public"."bsi_transaction_document_files" (
    "id" bigint not null default nextval('bsi_transaction_document_files_id_seq'::regclass),
    "transaction_id" bigint not null,
    "document_file_id" bigint not null,
    "created_at" timestamp with time zone default now()
);


alter table "public"."bsi_transaction_document_files" enable row level security;

create table "public"."bsi_transactions_deals" (
    "id" bigint not null default nextval('bsi_transactions_deals_id_seq'::regclass),
    "transaction_id" bigint not null,
    "deal_id" bigint not null,
    "amount" numeric(15,2),
    "created_at" timestamp with time zone default now()
);


alter table "public"."bsi_transactions_deals" enable row level security;

create table "public"."bsi_transactions_instruments" (
    "id" bigint not null default nextval('bsi_transactions_instruments_id_seq'::regclass),
    "transaction_id" bigint not null,
    "instrument_id" bigint not null,
    "amount" numeric(15,2),
    "created_at" timestamp with time zone default now()
);


alter table "public"."bsi_transactions_instruments" enable row level security;

create table "public"."bsi_transactions_investors" (
    "id" bigint not null default nextval('bsi_transactions_investors_id_seq'::regclass),
    "transaction_id" bigint not null,
    "clerk_user_id" bigint not null,
    "clerk_org_id" bigint,
    "created_at" timestamp with time zone default now()
);


alter table "public"."bsi_transactions_investors" enable row level security;

create table "public"."document_roles_files" (
    "id" bigint generated by default as identity not null,
    "document_files_id" bigint not null,
    "document_roles_id" bigint not null
);


alter table "public"."document_roles_files" enable row level security;

alter table "public"."bsi_distributions" drop column "user_id";

alter table "public"."bsi_distributions" add column "clerk_user_id" bigint not null;

alter table "public"."bsi_statements" add column "file_name" text;

alter table "public"."bsi_statements" add column "file_path" text;

alter table "public"."bsi_statements" add column "file_size" bigint;

alter table "public"."bsi_statements" add column "file_type" text;

alter table "public"."bsi_statements" add column "file_url" text;

alter table "public"."bsi_statements" add column "uploaded_at" timestamp with time zone;

alter table "public"."bsi_transactions" drop column "clerk_id";

alter table "public"."bsi_transactions" drop column "clerk_organization_id";

alter table "public"."bsi_transactions" drop column "deal_id";

alter table "public"."bsi_transactions" drop column "instrument_id";

alter table "public"."bsi_transactions" drop column "investor_id";

alter table "public"."document_files" drop column "category";

alter table "public"."document_files" drop column "name";

alter table "public"."document_files" drop column "status";

alter table "public"."document_files" add column "document_category" document_category;

alter table "public"."document_files" add column "document_name" text;

alter table "public"."document_files" add column "document_status" document_status;

alter sequence "public"."bsi_transaction_document_files_id_seq" owned by "public"."bsi_transaction_document_files"."id";

alter sequence "public"."bsi_transactions_deals_id_seq" owned by "public"."bsi_transactions_deals"."id";

alter sequence "public"."bsi_transactions_instruments_id_seq" owned by "public"."bsi_transactions_instruments"."id";

alter sequence "public"."bsi_transactions_investors_id_seq" owned by "public"."bsi_transactions_investors"."id";

drop sequence if exists "public"."transaction_references_id_seq";

CREATE UNIQUE INDEX bsi_transaction_document_files_pkey ON public.bsi_transaction_document_files USING btree (id);

CREATE UNIQUE INDEX bsi_transactions_deals_pkey ON public.bsi_transactions_deals USING btree (id);

CREATE UNIQUE INDEX bsi_transactions_instruments_pkey ON public.bsi_transactions_instruments USING btree (id);

CREATE UNIQUE INDEX bsi_transactions_investors_pkey ON public.bsi_transactions_investors USING btree (id);

CREATE UNIQUE INDEX bsi_transactions_pkey ON public.bsi_transactions USING btree (id);

CREATE UNIQUE INDEX document_roles_files_pkey ON public.document_roles_files USING btree (id);

CREATE INDEX idx_bsi_statements_file_path ON public.bsi_statements USING btree (file_path);

CREATE INDEX idx_bsi_statements_uploaded_at ON public.bsi_statements USING btree (uploaded_at);

CREATE INDEX idx_bsi_transaction_document_files_document_file_id ON public.bsi_transaction_document_files USING btree (document_file_id);

CREATE INDEX idx_bsi_transaction_document_files_transaction_id ON public.bsi_transaction_document_files USING btree (transaction_id);

CREATE INDEX idx_bsi_transactions_deals_deal_id ON public.bsi_transactions_deals USING btree (deal_id);

CREATE INDEX idx_bsi_transactions_deals_transaction_id ON public.bsi_transactions_deals USING btree (transaction_id);

CREATE INDEX idx_bsi_transactions_instruments_instrument_id ON public.bsi_transactions_instruments USING btree (instrument_id);

CREATE INDEX idx_bsi_transactions_instruments_transaction_id ON public.bsi_transactions_instruments USING btree (transaction_id);

CREATE INDEX idx_bsi_transactions_investors_investor_id ON public.bsi_transactions_investors USING btree (clerk_user_id);

CREATE INDEX idx_bsi_transactions_investors_org_id ON public.bsi_transactions_investors USING btree (clerk_org_id);

CREATE INDEX idx_bsi_transactions_investors_transaction_id ON public.bsi_transactions_investors USING btree (transaction_id);

CREATE UNIQUE INDEX unique_transaction_deal ON public.bsi_transactions_deals USING btree (transaction_id, deal_id);

CREATE UNIQUE INDEX unique_transaction_document ON public.bsi_transaction_document_files USING btree (transaction_id, document_file_id);

CREATE UNIQUE INDEX unique_transaction_instrument ON public.bsi_transactions_instruments USING btree (transaction_id, instrument_id);

CREATE UNIQUE INDEX unique_transaction_investor ON public.bsi_transactions_investors USING btree (transaction_id, clerk_user_id);

alter table "public"."bsi_transaction_document_files" add constraint "bsi_transaction_document_files_pkey" PRIMARY KEY using index "bsi_transaction_document_files_pkey";

alter table "public"."bsi_transactions" add constraint "bsi_transactions_pkey" PRIMARY KEY using index "bsi_transactions_pkey";

alter table "public"."bsi_transactions_deals" add constraint "bsi_transactions_deals_pkey" PRIMARY KEY using index "bsi_transactions_deals_pkey";

alter table "public"."bsi_transactions_instruments" add constraint "bsi_transactions_instruments_pkey" PRIMARY KEY using index "bsi_transactions_instruments_pkey";

alter table "public"."bsi_transactions_investors" add constraint "bsi_transactions_investors_pkey" PRIMARY KEY using index "bsi_transactions_investors_pkey";

alter table "public"."document_roles_files" add constraint "document_roles_files_pkey" PRIMARY KEY using index "document_roles_files_pkey";

alter table "public"."bsi_distributions" add constraint "bsi_distributions_clerk_user_id_fkey" FOREIGN KEY (clerk_user_id) REFERENCES auth_clerk_users(id) not valid;

alter table "public"."bsi_distributions" validate constraint "bsi_distributions_clerk_user_id_fkey";

alter table "public"."bsi_transaction_document_files" add constraint "fk_document_file" FOREIGN KEY (document_file_id) REFERENCES document_files(id) ON DELETE CASCADE not valid;

alter table "public"."bsi_transaction_document_files" validate constraint "fk_document_file";

alter table "public"."bsi_transaction_document_files" add constraint "fk_transaction" FOREIGN KEY (transaction_id) REFERENCES bsi_transactions(id) ON DELETE CASCADE not valid;

alter table "public"."bsi_transaction_document_files" validate constraint "fk_transaction";

alter table "public"."bsi_transaction_document_files" add constraint "unique_transaction_document" UNIQUE using index "unique_transaction_document";

alter table "public"."bsi_transactions" add constraint "positive_transaction_amount" CHECK ((transaction_amount > (0)::numeric)) not valid;

alter table "public"."bsi_transactions" validate constraint "positive_transaction_amount";

alter table "public"."bsi_transactions_deals" add constraint "fk_deal" FOREIGN KEY (deal_id) REFERENCES deal(id) ON DELETE RESTRICT not valid;

alter table "public"."bsi_transactions_deals" validate constraint "fk_deal";

alter table "public"."bsi_transactions_deals" add constraint "fk_transaction" FOREIGN KEY (transaction_id) REFERENCES bsi_transactions(id) ON DELETE CASCADE not valid;

alter table "public"."bsi_transactions_deals" validate constraint "fk_transaction";

alter table "public"."bsi_transactions_deals" add constraint "positive_deal_amount" CHECK ((amount > (0)::numeric)) not valid;

alter table "public"."bsi_transactions_deals" validate constraint "positive_deal_amount";

alter table "public"."bsi_transactions_deals" add constraint "unique_transaction_deal" UNIQUE using index "unique_transaction_deal";

alter table "public"."bsi_transactions_instruments" add constraint "fk_instrument" FOREIGN KEY (instrument_id) REFERENCES bs_debt_instruments(id) ON DELETE RESTRICT not valid;

alter table "public"."bsi_transactions_instruments" validate constraint "fk_instrument";

alter table "public"."bsi_transactions_instruments" add constraint "fk_transaction" FOREIGN KEY (transaction_id) REFERENCES bsi_transactions(id) ON DELETE CASCADE not valid;

alter table "public"."bsi_transactions_instruments" validate constraint "fk_transaction";

alter table "public"."bsi_transactions_instruments" add constraint "positive_instrument_amount" CHECK ((amount > (0)::numeric)) not valid;

alter table "public"."bsi_transactions_instruments" validate constraint "positive_instrument_amount";

alter table "public"."bsi_transactions_instruments" add constraint "unique_transaction_instrument" UNIQUE using index "unique_transaction_instrument";

alter table "public"."bsi_transactions_investors" add constraint "bsi_transactions_investors_clerk_user_id_fkey" FOREIGN KEY (clerk_user_id) REFERENCES auth_clerk_users(id) ON DELETE RESTRICT not valid;

alter table "public"."bsi_transactions_investors" validate constraint "bsi_transactions_investors_clerk_user_id_fkey";

alter table "public"."bsi_transactions_investors" add constraint "fk_org" FOREIGN KEY (clerk_org_id) REFERENCES auth_clerk_orgs(id) ON DELETE SET NULL not valid;

alter table "public"."bsi_transactions_investors" validate constraint "fk_org";

alter table "public"."bsi_transactions_investors" add constraint "fk_transaction" FOREIGN KEY (transaction_id) REFERENCES bsi_transactions(id) ON DELETE CASCADE not valid;

alter table "public"."bsi_transactions_investors" validate constraint "fk_transaction";

alter table "public"."bsi_transactions_investors" add constraint "unique_transaction_investor" UNIQUE using index "unique_transaction_investor";

alter table "public"."document_roles_files" add constraint "document_roles_files_document_files_id_fkey" FOREIGN KEY (document_files_id) REFERENCES document_files(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."document_roles_files" validate constraint "document_roles_files_document_files_id_fkey";

alter table "public"."document_roles_files" add constraint "document_roles_files_document_roles_id_fkey" FOREIGN KEY (document_roles_id) REFERENCES document_roles(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."document_roles_files" validate constraint "document_roles_files_document_roles_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.check_deal_allocation_sum()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    total_allocated DECIMAL(15,2);
    transaction_total DECIMAL(15,2);
BEGIN
    -- For DELETE trigger, use OLD instead of NEW
    IF TG_OP = 'DELETE' THEN
        -- Calculate sum of all deal allocations for this transaction
        SELECT COALESCE(SUM(amount), 0) INTO total_allocated
        FROM bsi_transactions_deals
        WHERE transaction_id = OLD.transaction_id;

        -- Get the transaction amount
        SELECT transaction_amount INTO transaction_total
        FROM bsi_transactions
        WHERE id = OLD.transaction_id;
    ELSE
        -- Calculate sum of all deal allocations for this transaction
        SELECT COALESCE(SUM(amount), 0) INTO total_allocated
        FROM bsi_transactions_deals
        WHERE transaction_id = NEW.transaction_id;

        -- Get the transaction amount
        SELECT transaction_amount INTO transaction_total
        FROM bsi_transactions
        WHERE id = NEW.transaction_id;
    END IF;

    -- Check if the sum matches (within 1 cent tolerance)
    IF ABS(total_allocated - transaction_total) > 0.01 THEN
        RAISE EXCEPTION 'Deal allocations sum (%) must equal transaction amount (%)', 
            total_allocated, transaction_total;
    END IF;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.check_investor_allocation_sum()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    total_allocated DECIMAL(15,2);
    transaction_total DECIMAL(15,2);
BEGIN
    -- For DELETE trigger, use OLD instead of NEW
    IF TG_OP = 'DELETE' THEN
        -- Calculate sum of all investor allocations for this transaction
        SELECT COALESCE(SUM(amount), 0) INTO total_allocated
        FROM bsi_transactions_investors
        WHERE transaction_id = OLD.transaction_id;

        -- Get the transaction amount
        SELECT transaction_amount INTO transaction_total
        FROM bsi_transactions
        WHERE id = OLD.transaction_id;
    ELSE
        -- Calculate sum of all investor allocations for this transaction
        SELECT COALESCE(SUM(amount), 0) INTO total_allocated
        FROM bsi_transactions_investors
        WHERE transaction_id = NEW.transaction_id;

        -- Get the transaction amount
        SELECT transaction_amount INTO transaction_total
        FROM bsi_transactions
        WHERE id = NEW.transaction_id;
    END IF;

    -- Check if the sum matches (within 1 cent tolerance)
    IF ABS(total_allocated - transaction_total) > 0.01 THEN
        RAISE EXCEPTION 'Investor allocations sum (%) must equal transaction amount (%)', 
            total_allocated, transaction_total;
    END IF;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
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
   FROM (bsi_transaction_document_files tdf
     JOIN document_files df ON ((tdf.document_file_id = df.id)));


grant delete on table "public"."bsi_transaction_document_files" to "anon";

grant insert on table "public"."bsi_transaction_document_files" to "anon";

grant references on table "public"."bsi_transaction_document_files" to "anon";

grant select on table "public"."bsi_transaction_document_files" to "anon";

grant trigger on table "public"."bsi_transaction_document_files" to "anon";

grant truncate on table "public"."bsi_transaction_document_files" to "anon";

grant update on table "public"."bsi_transaction_document_files" to "anon";

grant delete on table "public"."bsi_transaction_document_files" to "authenticated";

grant insert on table "public"."bsi_transaction_document_files" to "authenticated";

grant references on table "public"."bsi_transaction_document_files" to "authenticated";

grant select on table "public"."bsi_transaction_document_files" to "authenticated";

grant trigger on table "public"."bsi_transaction_document_files" to "authenticated";

grant truncate on table "public"."bsi_transaction_document_files" to "authenticated";

grant update on table "public"."bsi_transaction_document_files" to "authenticated";

grant delete on table "public"."bsi_transaction_document_files" to "service_role";

grant insert on table "public"."bsi_transaction_document_files" to "service_role";

grant references on table "public"."bsi_transaction_document_files" to "service_role";

grant select on table "public"."bsi_transaction_document_files" to "service_role";

grant trigger on table "public"."bsi_transaction_document_files" to "service_role";

grant truncate on table "public"."bsi_transaction_document_files" to "service_role";

grant update on table "public"."bsi_transaction_document_files" to "service_role";

grant delete on table "public"."bsi_transactions_deals" to "anon";

grant insert on table "public"."bsi_transactions_deals" to "anon";

grant references on table "public"."bsi_transactions_deals" to "anon";

grant select on table "public"."bsi_transactions_deals" to "anon";

grant trigger on table "public"."bsi_transactions_deals" to "anon";

grant truncate on table "public"."bsi_transactions_deals" to "anon";

grant update on table "public"."bsi_transactions_deals" to "anon";

grant delete on table "public"."bsi_transactions_deals" to "authenticated";

grant insert on table "public"."bsi_transactions_deals" to "authenticated";

grant references on table "public"."bsi_transactions_deals" to "authenticated";

grant select on table "public"."bsi_transactions_deals" to "authenticated";

grant trigger on table "public"."bsi_transactions_deals" to "authenticated";

grant truncate on table "public"."bsi_transactions_deals" to "authenticated";

grant update on table "public"."bsi_transactions_deals" to "authenticated";

grant delete on table "public"."bsi_transactions_deals" to "service_role";

grant insert on table "public"."bsi_transactions_deals" to "service_role";

grant references on table "public"."bsi_transactions_deals" to "service_role";

grant select on table "public"."bsi_transactions_deals" to "service_role";

grant trigger on table "public"."bsi_transactions_deals" to "service_role";

grant truncate on table "public"."bsi_transactions_deals" to "service_role";

grant update on table "public"."bsi_transactions_deals" to "service_role";

grant delete on table "public"."bsi_transactions_instruments" to "anon";

grant insert on table "public"."bsi_transactions_instruments" to "anon";

grant references on table "public"."bsi_transactions_instruments" to "anon";

grant select on table "public"."bsi_transactions_instruments" to "anon";

grant trigger on table "public"."bsi_transactions_instruments" to "anon";

grant truncate on table "public"."bsi_transactions_instruments" to "anon";

grant update on table "public"."bsi_transactions_instruments" to "anon";

grant delete on table "public"."bsi_transactions_instruments" to "authenticated";

grant insert on table "public"."bsi_transactions_instruments" to "authenticated";

grant references on table "public"."bsi_transactions_instruments" to "authenticated";

grant select on table "public"."bsi_transactions_instruments" to "authenticated";

grant trigger on table "public"."bsi_transactions_instruments" to "authenticated";

grant truncate on table "public"."bsi_transactions_instruments" to "authenticated";

grant update on table "public"."bsi_transactions_instruments" to "authenticated";

grant delete on table "public"."bsi_transactions_instruments" to "service_role";

grant insert on table "public"."bsi_transactions_instruments" to "service_role";

grant references on table "public"."bsi_transactions_instruments" to "service_role";

grant select on table "public"."bsi_transactions_instruments" to "service_role";

grant trigger on table "public"."bsi_transactions_instruments" to "service_role";

grant truncate on table "public"."bsi_transactions_instruments" to "service_role";

grant update on table "public"."bsi_transactions_instruments" to "service_role";

grant delete on table "public"."bsi_transactions_investors" to "anon";

grant insert on table "public"."bsi_transactions_investors" to "anon";

grant references on table "public"."bsi_transactions_investors" to "anon";

grant select on table "public"."bsi_transactions_investors" to "anon";

grant trigger on table "public"."bsi_transactions_investors" to "anon";

grant truncate on table "public"."bsi_transactions_investors" to "anon";

grant update on table "public"."bsi_transactions_investors" to "anon";

grant delete on table "public"."bsi_transactions_investors" to "authenticated";

grant insert on table "public"."bsi_transactions_investors" to "authenticated";

grant references on table "public"."bsi_transactions_investors" to "authenticated";

grant select on table "public"."bsi_transactions_investors" to "authenticated";

grant trigger on table "public"."bsi_transactions_investors" to "authenticated";

grant truncate on table "public"."bsi_transactions_investors" to "authenticated";

grant update on table "public"."bsi_transactions_investors" to "authenticated";

grant delete on table "public"."bsi_transactions_investors" to "service_role";

grant insert on table "public"."bsi_transactions_investors" to "service_role";

grant references on table "public"."bsi_transactions_investors" to "service_role";

grant select on table "public"."bsi_transactions_investors" to "service_role";

grant trigger on table "public"."bsi_transactions_investors" to "service_role";

grant truncate on table "public"."bsi_transactions_investors" to "service_role";

grant update on table "public"."bsi_transactions_investors" to "service_role";

grant delete on table "public"."document_roles_files" to "anon";

grant insert on table "public"."document_roles_files" to "anon";

grant references on table "public"."document_roles_files" to "anon";

grant select on table "public"."document_roles_files" to "anon";

grant trigger on table "public"."document_roles_files" to "anon";

grant truncate on table "public"."document_roles_files" to "anon";

grant update on table "public"."document_roles_files" to "anon";

grant delete on table "public"."document_roles_files" to "authenticated";

grant insert on table "public"."document_roles_files" to "authenticated";

grant references on table "public"."document_roles_files" to "authenticated";

grant select on table "public"."document_roles_files" to "authenticated";

grant trigger on table "public"."document_roles_files" to "authenticated";

grant truncate on table "public"."document_roles_files" to "authenticated";

grant update on table "public"."document_roles_files" to "authenticated";

grant delete on table "public"."document_roles_files" to "service_role";

grant insert on table "public"."document_roles_files" to "service_role";

grant references on table "public"."document_roles_files" to "service_role";

grant select on table "public"."document_roles_files" to "service_role";

grant trigger on table "public"."document_roles_files" to "service_role";

grant truncate on table "public"."document_roles_files" to "service_role";

grant update on table "public"."document_roles_files" to "service_role";

create policy "Balance sheet investors can select their statements"
on "public"."bsi_statements"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM auth_clerk_users acu
  WHERE ((acu.clerk_user_id = (auth.jwt() ->> 'sub'::text)) AND ((acu.role = 'admin'::user_role_internal) OR ((acu.role = 'balance_sheet_investor'::user_role_internal) AND (bsi_statements.auth_clerk_users_id = acu.id)))))));


create policy "Users can link documents to their transactions"
on "public"."bsi_transaction_document_files"
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
on "public"."bsi_transaction_document_files"
as permissive
for delete
to public
using (((EXISTS ( SELECT 1
   FROM document_files df
  WHERE ((df.id = bsi_transaction_document_files.document_file_id) AND (df.uploaded_by = (auth.uid())::text)))) OR (EXISTS ( SELECT 1
   FROM auth_clerk_users
  WHERE ((auth_clerk_users.clerk_user_id = (auth.uid())::text) AND (auth_clerk_users.role = 'admin'::user_role_internal))))));


create policy "Users can view documents for their transactions"
on "public"."bsi_transaction_document_files"
as permissive
for select
to public
using (((EXISTS ( SELECT 1
   FROM (bsi_transactions t
     JOIN bsi_transactions_investors ti ON ((t.id = ti.transaction_id)))
  WHERE ((t.id = bsi_transaction_document_files.transaction_id) AND (ti.clerk_user_id IN ( SELECT auth_clerk_users.id
           FROM auth_clerk_users
          WHERE (auth_clerk_users.clerk_user_id = (auth.uid())::text)))))) OR (EXISTS ( SELECT 1
   FROM auth_clerk_users
  WHERE ((auth_clerk_users.clerk_user_id = (auth.uid())::text) AND (auth_clerk_users.role = 'admin'::user_role_internal))))));


create policy "Users can view transaction deal allocations"
on "public"."bsi_transactions_deals"
as permissive
for select
to public
using (((EXISTS ( SELECT 1
   FROM (bsi_transactions t
     JOIN bsi_transactions_investors ti ON ((t.id = ti.transaction_id)))
  WHERE ((t.id = bsi_transactions_deals.transaction_id) AND (ti.clerk_user_id IN ( SELECT auth_clerk_users.id
           FROM auth_clerk_users
          WHERE (auth_clerk_users.clerk_user_id = (auth.uid())::text)))))) OR (EXISTS ( SELECT 1
   FROM auth_clerk_users
  WHERE ((auth_clerk_users.clerk_user_id = (auth.uid())::text) AND (auth_clerk_users.role = 'admin'::user_role_internal))))));


create policy "Users can view transaction instrument allocations"
on "public"."bsi_transactions_instruments"
as permissive
for select
to public
using (((EXISTS ( SELECT 1
   FROM (bsi_transactions t
     JOIN bsi_transactions_investors ti ON ((t.id = ti.transaction_id)))
  WHERE ((t.id = bsi_transactions_instruments.transaction_id) AND (ti.clerk_user_id IN ( SELECT auth_clerk_users.id
           FROM auth_clerk_users
          WHERE (auth_clerk_users.clerk_user_id = (auth.uid())::text)))))) OR (EXISTS ( SELECT 1
   FROM auth_clerk_users
  WHERE ((auth_clerk_users.clerk_user_id = (auth.uid())::text) AND (auth_clerk_users.role = 'admin'::user_role_internal))))));


create policy "Users can view their transaction allocations"
on "public"."bsi_transactions_investors"
as permissive
for select
to public
using (((clerk_user_id IN ( SELECT auth_clerk_users.id
   FROM auth_clerk_users
  WHERE (auth_clerk_users.clerk_user_id = (auth.uid())::text))) OR (EXISTS ( SELECT 1
   FROM auth_clerk_users
  WHERE ((auth_clerk_users.clerk_user_id = (auth.uid())::text) AND (auth_clerk_users.role = 'admin'::user_role_internal))))));


create policy "Admin can manage document role assignments"
on "public"."document_roles_files"
as permissive
for all
to authenticated
using ((EXISTS ( SELECT 1
   FROM auth_clerk_users acu
  WHERE ((acu.clerk_user_id = (auth.uid())::text) AND (acu.role = 'admin'::user_role_internal)))));


create policy "Allow auth select"
on "public"."borrower"
as permissive
for select
to authenticated, anon
using (true);


create policy "Admin can select all statements"
on "public"."bsi_statements"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM auth_clerk_users acu
  WHERE ((acu.clerk_user_id = (auth.jwt() ->> 'sub'::text)) AND (acu.role = 'admin'::user_role_internal)))));


create policy "Admins can delete statements"
on "public"."bsi_statements"
as permissive
for delete
to authenticated
using ((EXISTS ( SELECT 1
   FROM auth_clerk_users p
  WHERE ((p.clerk_user_id = (auth.jwt() ->> 'sub'::text)) AND (p.role = 'admin'::user_role_internal)))));


create policy "Admins can insert statements"
on "public"."bsi_statements"
as permissive
for insert
to authenticated
with check ((EXISTS ( SELECT 1
   FROM auth_clerk_users p
  WHERE ((p.clerk_user_id = (auth.jwt() ->> 'sub'::text)) AND (p.role = 'admin'::user_role_internal)))));


create policy "Admins can update statements"
on "public"."bsi_statements"
as permissive
for update
to authenticated
using ((EXISTS ( SELECT 1
   FROM auth_clerk_users p
  WHERE ((p.clerk_user_id = (auth.jwt() ->> 'sub'::text)) AND (p.role = 'admin'::user_role_internal)))))
with check ((EXISTS ( SELECT 1
   FROM auth_clerk_users p
  WHERE ((p.clerk_user_id = (auth.jwt() ->> 'sub'::text)) AND (p.role = 'admin'::user_role_internal)))));


create policy "Allow auth select"
on "public"."guarantor"
as permissive
for select
to authenticated, anon
using (true);


create policy "Allow auth select"
on "public"."property"
as permissive
for select
to authenticated, anon
using (true);


CREATE TRIGGER validate_deal_allocation_sum_delete AFTER DELETE ON public.bsi_transactions_deals FOR EACH ROW EXECUTE FUNCTION check_deal_allocation_sum();

CREATE TRIGGER validate_deal_allocation_sum_insert AFTER INSERT ON public.bsi_transactions_deals FOR EACH ROW EXECUTE FUNCTION check_deal_allocation_sum();

CREATE TRIGGER validate_deal_allocation_sum_update AFTER UPDATE OF amount ON public.bsi_transactions_deals FOR EACH ROW EXECUTE FUNCTION check_deal_allocation_sum();

CREATE TRIGGER validate_investor_allocation_sum_delete AFTER DELETE ON public.bsi_transactions_investors FOR EACH ROW EXECUTE FUNCTION check_investor_allocation_sum();

CREATE TRIGGER validate_investor_allocation_sum_insert AFTER INSERT ON public.bsi_transactions_investors FOR EACH ROW EXECUTE FUNCTION check_investor_allocation_sum();


