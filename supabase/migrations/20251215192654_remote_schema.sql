drop trigger if exists "validate_deal_allocation_sum_update" on "public"."bsi_transactions_deals";

drop policy "Admins can view all organization memberships" on "public"."auth_clerk_orgs_members";

drop policy "Users can view their own organization memberships" on "public"."auth_clerk_orgs_members";

drop policy "Admin can select all bsi_deals" on "public"."bsi_deals";

drop policy "Only admins can link orgs to deals" on "public"."bsi_deals_orgs";

drop policy "Only admins can unlink orgs from deals" on "public"."bsi_deals_orgs";

drop policy "Only admins can update deal-org links" on "public"."bsi_deals_orgs";

drop policy "Org members can read linked deals" on "public"."bsi_deals_orgs";

drop policy "Users can view appraisals for their deals" on "public"."appraisal";

drop policy "Org members and admins can read instrument-deal links" on "public"."bs_debt_instruments_deals";

drop policy "Users can view their transaction allocations" on "public"."bsi_transactions_investors";

drop policy "Users can view CBA requests for their deals" on "public"."cba_requests";

drop policy "Users can view fees for their deals" on "public"."custom_loan_fees";

drop policy "Users can view deal appraisals for their deals" on "public"."deal_appraisals";

drop policy "Users can view property data for their deals" on "public"."deal_property";

drop policy "Users can view roles for their deals" on "public"."deal_roles";

drop policy "Users can view milestones for their deals" on "public"."milestones";

drop policy "Users can view payroll submissions for their deals" on "public"."payroll_ledger";

drop policy "Users can view property income for their deals" on "public"."property_income";

drop policy "Users can view tasks for their deals" on "public"."tasks";

revoke delete on table "public"."bsi_deals" from "anon";

revoke insert on table "public"."bsi_deals" from "anon";

revoke references on table "public"."bsi_deals" from "anon";

revoke select on table "public"."bsi_deals" from "anon";

revoke trigger on table "public"."bsi_deals" from "anon";

revoke truncate on table "public"."bsi_deals" from "anon";

revoke update on table "public"."bsi_deals" from "anon";

revoke delete on table "public"."bsi_deals" from "authenticated";

revoke insert on table "public"."bsi_deals" from "authenticated";

revoke references on table "public"."bsi_deals" from "authenticated";

revoke select on table "public"."bsi_deals" from "authenticated";

revoke trigger on table "public"."bsi_deals" from "authenticated";

revoke truncate on table "public"."bsi_deals" from "authenticated";

revoke update on table "public"."bsi_deals" from "authenticated";

revoke delete on table "public"."bsi_deals" from "service_role";

revoke insert on table "public"."bsi_deals" from "service_role";

revoke references on table "public"."bsi_deals" from "service_role";

revoke select on table "public"."bsi_deals" from "service_role";

revoke trigger on table "public"."bsi_deals" from "service_role";

revoke truncate on table "public"."bsi_deals" from "service_role";

revoke update on table "public"."bsi_deals" from "service_role";

revoke delete on table "public"."bsi_deals_orgs" from "anon";

revoke insert on table "public"."bsi_deals_orgs" from "anon";

revoke references on table "public"."bsi_deals_orgs" from "anon";

revoke select on table "public"."bsi_deals_orgs" from "anon";

revoke trigger on table "public"."bsi_deals_orgs" from "anon";

revoke truncate on table "public"."bsi_deals_orgs" from "anon";

revoke update on table "public"."bsi_deals_orgs" from "anon";

revoke delete on table "public"."bsi_deals_orgs" from "authenticated";

revoke insert on table "public"."bsi_deals_orgs" from "authenticated";

revoke references on table "public"."bsi_deals_orgs" from "authenticated";

revoke select on table "public"."bsi_deals_orgs" from "authenticated";

revoke trigger on table "public"."bsi_deals_orgs" from "authenticated";

revoke truncate on table "public"."bsi_deals_orgs" from "authenticated";

revoke update on table "public"."bsi_deals_orgs" from "authenticated";

revoke delete on table "public"."bsi_deals_orgs" from "service_role";

revoke insert on table "public"."bsi_deals_orgs" from "service_role";

revoke references on table "public"."bsi_deals_orgs" from "service_role";

revoke select on table "public"."bsi_deals_orgs" from "service_role";

revoke trigger on table "public"."bsi_deals_orgs" from "service_role";

revoke truncate on table "public"."bsi_deals_orgs" from "service_role";

revoke update on table "public"."bsi_deals_orgs" from "service_role";

alter table "public"."bsi_deals" drop constraint "bsi_deals_auth_clerk_users_id_fkey";

alter table "public"."bsi_deals" drop constraint "bsi_deals_deal_id_fkey";

alter table "public"."bsi_deals_orgs" drop constraint "bsi_deals_orgs_clerk_org_id_fkey";

alter table "public"."bsi_deals_orgs" drop constraint "bsi_deals_orgs_deal_id_clerk_org_id_key";

alter table "public"."bsi_deals_orgs" drop constraint "bsi_deals_orgs_deal_id_fkey";

alter table "public"."bsi_distributions" drop constraint "bsi_distributions_statement_id_fkey";

alter table "public"."bsi_transactions_deals" drop constraint "positive_deal_amount";

alter table "public"."bsi_transactions_instruments" drop constraint "positive_instrument_amount";

alter table "public"."bsi_transactions_investors" drop constraint "bsi_transactions_investors_amount_positive";

drop function if exists "public"."debug_jwt"();

drop function if exists "public"."debug_jwt_claims"();

drop view if exists "public"."storage_objects_view";

alter table "public"."bsi_deals" drop constraint "bsi_deals_pkey";

alter table "public"."bsi_deals_orgs" drop constraint "bsi_deals_orgs_pkey";

drop index if exists "public"."idx_bsi_distributions_statement_id";

drop index if exists "public"."idx_document_investors_investor";

drop index if exists "public"."idx_document_investors_path";

drop index if exists "public"."bsi_deals_orgs_deal_id_clerk_org_id_key";

drop index if exists "public"."bsi_deals_orgs_pkey";

drop index if exists "public"."bsi_deals_pkey";

drop index if exists "public"."idx_bsi_deals_auth_clerk_users_id";

drop index if exists "public"."idx_bsi_deals_deal_auth_user";

drop index if exists "public"."idx_bsi_deals_orgs_clerk_org_id";

drop index if exists "public"."idx_bsi_deals_orgs_deal_id";

drop index if exists "public"."idx_deals_orgs_clerk_org_id";

drop index if exists "public"."idx_deals_orgs_deal_id";

-- ============================================================
-- DATA MIGRATION: Save existing data before dropping tables
-- ============================================================
CREATE TEMP TABLE _migrate_bsi_deals AS 
SELECT id, deal_id, auth_clerk_users_id FROM public.bsi_deals;

CREATE TEMP TABLE _migrate_bsi_deals_orgs AS 
SELECT id, deal_id, clerk_org_id FROM public.bsi_deals_orgs;

-- Log migration counts
DO $$
BEGIN
  RAISE NOTICE 'Data migration: Saved % rows from bsi_deals', (SELECT COUNT(*) FROM _migrate_bsi_deals);
  RAISE NOTICE 'Data migration: Saved % rows from bsi_deals_orgs', (SELECT COUNT(*) FROM _migrate_bsi_deals_orgs);
END $$;

drop table "public"."bsi_deals";

drop table "public"."bsi_deals_orgs";

create table "public"."api_ofb_transfers" (
    "id" bigint generated by default as identity not null,
    "ofb_transfer_id" text not null,
    "counterparty_name" text,
    "counterparty_account_number" text,
    "counterparty_routing_number" text,
    "description" text,
    "amount" numeric,
    "process_date" date,
    "payment_type" text,
    "status" text,
    "check_number" text,
    "display_name" text,
    "import_source" text,
    "import_batch_id" uuid,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone,
    "raw_data" jsonb,
    "record_transfer_name" text,
    "transfer_entered_by" text,
    "transfer_created_at" timestamp with time zone,
    "bank_trace_number" text,
    "fed_reference_number" text,
    "approver_one_name" text,
    "approver_one_timestamp" timestamp with time zone,
    "originating_account_name" text,
    "originating_account_number" text,
    "counterparty_address_line_1" text,
    "counterparty_address_line_2" text,
    "counterparty_address_line_3" text,
    "counterparty_beneficiary_bank_name" text,
    "external_memo_lines" text[],
    "currency" text default 'USD'::text
);


alter table "public"."api_ofb_transfers" enable row level security;

create table "public"."api_ofb_transfers_vendors" (
    "id" bigint generated by default as identity not null,
    "ofb_transfer_id" text not null,
    "ofb_vendor_id" bigint not null,
    "match_method" text default 'manual'::text,
    "match_notes" text,
    "created_at" timestamp with time zone not null default now(),
    "created_by_user_id" bigint,
    "updated_at" timestamp with time zone,
    "updated_by_user_id" bigint,
    "deleted_at" timestamp with time zone,
    "deleted_by_user_id" bigint
);


alter table "public"."api_ofb_transfers_vendors" enable row level security;

create table "public"."api_ofb_vendors" (
    "id" bigint generated by default as identity not null,
    "name" text,
    "email" text,
    "account_number" text,
    "routing_number" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone,
    "payment_instrument_id" text,
    "bank_account_type" text,
    "payment_account_address_line1" text,
    "payment_account_address_line2" text,
    "payment_account_city" text,
    "payment_account_state" text,
    "payment_account_postal_code" text,
    "payment_account_country" text,
    "phone" text,
    "vendor_type" text,
    "synced_at" timestamp with time zone,
    "raw_payload" jsonb
);


alter table "public"."api_ofb_vendors" enable row level security;

create table "public"."api_ofb_vendors_clerk_orgs" (
    "id" bigint generated by default as identity not null,
    "ofb_vendor_id" bigint not null,
    "clerk_org_id" bigint not null,
    "match_confidence" numeric,
    "match_method" text default 'manual'::text,
    "match_notes" text,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."api_ofb_vendors_clerk_orgs" enable row level security;

create table "public"."api_ofb_vendors_clerk_users" (
    "id" bigint generated by default as identity not null,
    "ofb_vendor_id" bigint not null,
    "clerk_user_id" bigint not null,
    "match_confidence" numeric,
    "match_method" text default 'manual'::text,
    "match_notes" text,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."api_ofb_vendors_clerk_users" enable row level security;

create table "public"."bank_accounts" (
    "id" bigint generated by default as identity not null,
    "bank_name" text not null,
    "bank_code" text not null,
    "account_name" text not null,
    "account_number_last4" text,
    "account_type" text default 'checking'::text,
    "routing_number" text,
    "integration_type" text not null default 'csv'::text,
    "api_credentials" jsonb,
    "csv_column_mapping" jsonb,
    "display_color" text,
    "is_active" boolean default true,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone
);


alter table "public"."bank_accounts" enable row level security;

create table "public"."bsi_deals_clerk_orgs" (
    "id" bigint generated by default as identity not null,
    "deal_id" bigint not null,
    "clerk_org_id" bigint not null
);


alter table "public"."bsi_deals_clerk_orgs" enable row level security;

create table "public"."bsi_deals_clerk_users" (
    "deal_id" bigint not null,
    "id" bigint generated by default as identity not null,
    "clerk_user_id" bigint
);


alter table "public"."bsi_deals_clerk_users" enable row level security;

-- ============================================================
-- DATA MIGRATION: Restore data to new tables
-- ============================================================

-- Migrate bsi_deals → bsi_deals_clerk_users
-- Column mapping: auth_clerk_users_id → clerk_user_id
-- Only migrate records where deal_id exists in deal table
INSERT INTO public.bsi_deals_clerk_users (id, deal_id, clerk_user_id)
SELECT m.id, m.deal_id, m.auth_clerk_users_id
FROM _migrate_bsi_deals m
WHERE EXISTS (SELECT 1 FROM public.deal d WHERE d.id = m.deal_id);

-- Migrate bsi_deals_orgs → bsi_deals_clerk_orgs (same columns)
-- Only migrate records where deal_id exists in deal table (skip orphaned records)
INSERT INTO public.bsi_deals_clerk_orgs (id, deal_id, clerk_org_id)
SELECT m.id, m.deal_id, m.clerk_org_id
FROM _migrate_bsi_deals_orgs m
WHERE EXISTS (SELECT 1 FROM public.deal d WHERE d.id = m.deal_id);

-- Reset sequences to max id + 1
SELECT setval(
  pg_get_serial_sequence('public.bsi_deals_clerk_users', 'id'),
  COALESCE((SELECT MAX(id) FROM public.bsi_deals_clerk_users), 0) + 1,
  false
);

SELECT setval(
  pg_get_serial_sequence('public.bsi_deals_clerk_orgs', 'id'),
  COALESCE((SELECT MAX(id) FROM public.bsi_deals_clerk_orgs), 0) + 1,
  false
);

-- Log migration results
DO $$
BEGIN
  RAISE NOTICE 'Data migration: Inserted % rows into bsi_deals_clerk_users', (SELECT COUNT(*) FROM public.bsi_deals_clerk_users);
  RAISE NOTICE 'Data migration: Inserted % rows into bsi_deals_clerk_orgs', (SELECT COUNT(*) FROM public.bsi_deals_clerk_orgs);
END $$;

-- Clean up temp tables
DROP TABLE IF EXISTS _migrate_bsi_deals;
DROP TABLE IF EXISTS _migrate_bsi_deals_orgs;

-- ============================================================

create table "public"."bsi_transactions_api_ofb_transfers" (
    "id" bigint generated by default as identity not null,
    "transaction_id" bigint not null,
    "ofb_transfer_id" text not null,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."bsi_transactions_api_ofb_transfers" enable row level security;

alter table "public"."bsi_transactions" add column "clerk_user_id" bigint;

alter table "public"."bsi_transactions" alter column "ledger_entry_type" drop not null;

-- Column renames: amount → allocation_amount (may already be done on some environments)
DO $$
BEGIN
  -- bsi_transactions_deals
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'bsi_transactions_deals' AND column_name = 'amount') THEN
    ALTER TABLE public.bsi_transactions_deals DROP COLUMN amount;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'bsi_transactions_deals' AND column_name = 'allocation_amount') THEN
    ALTER TABLE public.bsi_transactions_deals ADD COLUMN allocation_amount numeric(15,2);
  END IF;
  
  -- bsi_transactions_instruments
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'bsi_transactions_instruments' AND column_name = 'amount') THEN
    ALTER TABLE public.bsi_transactions_instruments DROP COLUMN amount;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'bsi_transactions_instruments' AND column_name = 'allocation_amount') THEN
    ALTER TABLE public.bsi_transactions_instruments ADD COLUMN allocation_amount numeric(15,2);
  END IF;
  
  -- bsi_transactions_investors
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'bsi_transactions_investors' AND column_name = 'amount') THEN
    ALTER TABLE public.bsi_transactions_investors DROP COLUMN amount;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'bsi_transactions_investors' AND column_name = 'allocation_amount') THEN
    ALTER TABLE public.bsi_transactions_investors ADD COLUMN allocation_amount numeric;
  END IF;
END $$;

alter table "public"."bsi_transactions_investors" alter column "clerk_user_id" drop not null;

CREATE UNIQUE INDEX api_ofb_transfers_ofb_transfer_id_key ON public.api_ofb_transfers USING btree (ofb_transfer_id);

CREATE UNIQUE INDEX api_ofb_transfers_pkey ON public.api_ofb_transfers USING btree (id);

CREATE UNIQUE INDEX api_ofb_transfers_vendors_pkey ON public.api_ofb_transfers_vendors USING btree (id);

CREATE UNIQUE INDEX api_ofb_vendors_clerk_orgs_pkey ON public.api_ofb_vendors_clerk_orgs USING btree (id);

CREATE UNIQUE INDEX api_ofb_vendors_clerk_users_pkey ON public.api_ofb_vendors_clerk_users USING btree (id);

CREATE UNIQUE INDEX api_ofb_vendors_pkey ON public.api_ofb_vendors USING btree (id);

CREATE UNIQUE INDEX bank_accounts_bank_code_key ON public.bank_accounts USING btree (bank_code);

CREATE UNIQUE INDEX bank_accounts_pkey ON public.bank_accounts USING btree (id);

CREATE UNIQUE INDEX bsi_transactions_api_ofb_transfers_pkey ON public.bsi_transactions_api_ofb_transfers USING btree (id);

CREATE INDEX idx_bank_accounts_bank_code ON public.bank_accounts USING btree (bank_code);

CREATE INDEX idx_bank_accounts_is_active ON public.bank_accounts USING btree (is_active);

CREATE INDEX idx_bsi_ofb_transfers_ofb_transfer_id ON public.bsi_transactions_api_ofb_transfers USING btree (ofb_transfer_id);

CREATE INDEX idx_bsi_ofb_transfers_transaction_id ON public.bsi_transactions_api_ofb_transfers USING btree (transaction_id);

CREATE INDEX idx_bsi_transactions_clerk_user_id ON public.bsi_transactions USING btree (clerk_user_id) WHERE (clerk_user_id IS NOT NULL);

CREATE INDEX idx_ofb_transfers_counterparty_name ON public.api_ofb_transfers USING btree (counterparty_name);

CREATE INDEX idx_ofb_transfers_import_batch_id ON public.api_ofb_transfers USING btree (import_batch_id);

CREATE INDEX idx_ofb_transfers_process_date ON public.api_ofb_transfers USING btree (process_date);

CREATE INDEX idx_ofb_transfers_vendors_deleted_at ON public.api_ofb_transfers_vendors USING btree (deleted_at);

CREATE INDEX idx_ofb_transfers_vendors_vendor_id ON public.api_ofb_transfers_vendors USING btree (ofb_vendor_id);

CREATE INDEX idx_ofb_vendors_name ON public.api_ofb_vendors USING btree (name);

CREATE UNIQUE INDEX unique_bsi_ofb_transfer ON public.bsi_transactions_api_ofb_transfers USING btree (transaction_id, ofb_transfer_id);

CREATE UNIQUE INDEX unique_ofb_transfer_vendor ON public.api_ofb_transfers_vendors USING btree (ofb_transfer_id);

CREATE UNIQUE INDEX unique_ofb_vendor_clerk_org ON public.api_ofb_vendors_clerk_orgs USING btree (ofb_vendor_id, clerk_org_id);

CREATE UNIQUE INDEX unique_ofb_vendor_clerk_user ON public.api_ofb_vendors_clerk_users USING btree (ofb_vendor_id, clerk_user_id);

CREATE UNIQUE INDEX bsi_deals_orgs_deal_id_clerk_org_id_key ON public.bsi_deals_clerk_orgs USING btree (deal_id, clerk_org_id);

CREATE UNIQUE INDEX bsi_deals_orgs_pkey ON public.bsi_deals_clerk_orgs USING btree (id);

CREATE UNIQUE INDEX bsi_deals_pkey ON public.bsi_deals_clerk_users USING btree (id);

CREATE INDEX idx_bsi_deals_auth_clerk_users_id ON public.bsi_deals_clerk_users USING btree (clerk_user_id);

CREATE INDEX idx_bsi_deals_deal_auth_user ON public.bsi_deals_clerk_users USING btree (deal_id, clerk_user_id);

CREATE INDEX idx_bsi_deals_orgs_clerk_org_id ON public.bsi_deals_clerk_orgs USING btree (clerk_org_id);

CREATE INDEX idx_bsi_deals_orgs_deal_id ON public.bsi_deals_clerk_orgs USING btree (deal_id);

CREATE INDEX idx_deals_orgs_clerk_org_id ON public.bsi_deals_clerk_orgs USING btree (clerk_org_id);

CREATE INDEX idx_deals_orgs_deal_id ON public.bsi_deals_clerk_orgs USING btree (deal_id);

alter table "public"."api_ofb_transfers" add constraint "api_ofb_transfers_pkey" PRIMARY KEY using index "api_ofb_transfers_pkey";

alter table "public"."api_ofb_transfers_vendors" add constraint "api_ofb_transfers_vendors_pkey" PRIMARY KEY using index "api_ofb_transfers_vendors_pkey";

alter table "public"."api_ofb_vendors" add constraint "api_ofb_vendors_pkey" PRIMARY KEY using index "api_ofb_vendors_pkey";

alter table "public"."api_ofb_vendors_clerk_orgs" add constraint "api_ofb_vendors_clerk_orgs_pkey" PRIMARY KEY using index "api_ofb_vendors_clerk_orgs_pkey";

alter table "public"."api_ofb_vendors_clerk_users" add constraint "api_ofb_vendors_clerk_users_pkey" PRIMARY KEY using index "api_ofb_vendors_clerk_users_pkey";

alter table "public"."bank_accounts" add constraint "bank_accounts_pkey" PRIMARY KEY using index "bank_accounts_pkey";

alter table "public"."bsi_deals_clerk_orgs" add constraint "bsi_deals_orgs_pkey" PRIMARY KEY using index "bsi_deals_orgs_pkey";

alter table "public"."bsi_deals_clerk_users" add constraint "bsi_deals_pkey" PRIMARY KEY using index "bsi_deals_pkey";

alter table "public"."bsi_transactions_api_ofb_transfers" add constraint "bsi_transactions_api_ofb_transfers_pkey" PRIMARY KEY using index "bsi_transactions_api_ofb_transfers_pkey";

alter table "public"."api_ofb_transfers" add constraint "api_ofb_transfers_ofb_transfer_id_key" UNIQUE using index "api_ofb_transfers_ofb_transfer_id_key";

alter table "public"."api_ofb_transfers_vendors" add constraint "api_ofb_transfers_vendors_created_by_user_id_fkey" FOREIGN KEY (created_by_user_id) REFERENCES auth_clerk_users(id) ON DELETE SET NULL not valid;

alter table "public"."api_ofb_transfers_vendors" validate constraint "api_ofb_transfers_vendors_created_by_user_id_fkey";

alter table "public"."api_ofb_transfers_vendors" add constraint "api_ofb_transfers_vendors_deleted_by_user_id_fkey" FOREIGN KEY (deleted_by_user_id) REFERENCES auth_clerk_users(id) ON DELETE SET NULL not valid;

alter table "public"."api_ofb_transfers_vendors" validate constraint "api_ofb_transfers_vendors_deleted_by_user_id_fkey";

alter table "public"."api_ofb_transfers_vendors" add constraint "api_ofb_transfers_vendors_ofb_transfer_id_fkey" FOREIGN KEY (ofb_transfer_id) REFERENCES api_ofb_transfers(ofb_transfer_id) ON DELETE CASCADE not valid;

alter table "public"."api_ofb_transfers_vendors" validate constraint "api_ofb_transfers_vendors_ofb_transfer_id_fkey";

alter table "public"."api_ofb_transfers_vendors" add constraint "api_ofb_transfers_vendors_ofb_vendor_id_fkey" FOREIGN KEY (ofb_vendor_id) REFERENCES api_ofb_vendors(id) ON DELETE CASCADE not valid;

alter table "public"."api_ofb_transfers_vendors" validate constraint "api_ofb_transfers_vendors_ofb_vendor_id_fkey";

alter table "public"."api_ofb_transfers_vendors" add constraint "api_ofb_transfers_vendors_updated_by_user_id_fkey" FOREIGN KEY (updated_by_user_id) REFERENCES auth_clerk_users(id) ON DELETE SET NULL not valid;

alter table "public"."api_ofb_transfers_vendors" validate constraint "api_ofb_transfers_vendors_updated_by_user_id_fkey";

alter table "public"."api_ofb_transfers_vendors" add constraint "unique_ofb_transfer_vendor" UNIQUE using index "unique_ofb_transfer_vendor";

alter table "public"."api_ofb_vendors_clerk_orgs" add constraint "api_ofb_vendors_clerk_orgs_clerk_org_id_fkey" FOREIGN KEY (clerk_org_id) REFERENCES auth_clerk_orgs(id) ON DELETE CASCADE not valid;

alter table "public"."api_ofb_vendors_clerk_orgs" validate constraint "api_ofb_vendors_clerk_orgs_clerk_org_id_fkey";

alter table "public"."api_ofb_vendors_clerk_orgs" add constraint "api_ofb_vendors_clerk_orgs_ofb_vendor_id_fkey" FOREIGN KEY (ofb_vendor_id) REFERENCES api_ofb_vendors(id) ON DELETE CASCADE not valid;

alter table "public"."api_ofb_vendors_clerk_orgs" validate constraint "api_ofb_vendors_clerk_orgs_ofb_vendor_id_fkey";

alter table "public"."api_ofb_vendors_clerk_orgs" add constraint "unique_ofb_vendor_clerk_org" UNIQUE using index "unique_ofb_vendor_clerk_org";

alter table "public"."api_ofb_vendors_clerk_users" add constraint "api_ofb_vendors_clerk_users_clerk_user_id_fkey" FOREIGN KEY (clerk_user_id) REFERENCES auth_clerk_users(id) ON DELETE CASCADE not valid;

alter table "public"."api_ofb_vendors_clerk_users" validate constraint "api_ofb_vendors_clerk_users_clerk_user_id_fkey";

alter table "public"."api_ofb_vendors_clerk_users" add constraint "api_ofb_vendors_clerk_users_ofb_vendor_id_fkey" FOREIGN KEY (ofb_vendor_id) REFERENCES api_ofb_vendors(id) ON DELETE CASCADE not valid;

alter table "public"."api_ofb_vendors_clerk_users" validate constraint "api_ofb_vendors_clerk_users_ofb_vendor_id_fkey";

alter table "public"."api_ofb_vendors_clerk_users" add constraint "unique_ofb_vendor_clerk_user" UNIQUE using index "unique_ofb_vendor_clerk_user";

alter table "public"."bank_accounts" add constraint "bank_accounts_bank_code_key" UNIQUE using index "bank_accounts_bank_code_key";

alter table "public"."bank_accounts" add constraint "valid_integration_type" CHECK ((integration_type = ANY (ARRAY['api'::text, 'csv'::text]))) not valid;

alter table "public"."bank_accounts" validate constraint "valid_integration_type";

alter table "public"."bsi_deals_clerk_orgs" add constraint "bsi_deals_clerk_orgs_clerk_org_id_fkey" FOREIGN KEY (clerk_org_id) REFERENCES auth_clerk_orgs(id) ON DELETE CASCADE not valid;

alter table "public"."bsi_deals_clerk_orgs" validate constraint "bsi_deals_clerk_orgs_clerk_org_id_fkey";

alter table "public"."bsi_deals_clerk_orgs" add constraint "bsi_deals_clerk_orgs_deal_id_fkey" FOREIGN KEY (deal_id) REFERENCES deal(id) not valid;

alter table "public"."bsi_deals_clerk_orgs" validate constraint "bsi_deals_clerk_orgs_deal_id_fkey";

alter table "public"."bsi_deals_clerk_orgs" add constraint "bsi_deals_orgs_deal_id_clerk_org_id_key" UNIQUE using index "bsi_deals_orgs_deal_id_clerk_org_id_key";

alter table "public"."bsi_deals_clerk_users" add constraint "bsi_deals_clerk_users_clerk_user_id_fkey" FOREIGN KEY (clerk_user_id) REFERENCES auth_clerk_users(id) not valid;

alter table "public"."bsi_deals_clerk_users" validate constraint "bsi_deals_clerk_users_clerk_user_id_fkey";

alter table "public"."bsi_deals_clerk_users" add constraint "bsi_deals_clerk_users_deal_id_fkey" FOREIGN KEY (deal_id) REFERENCES deal(id) not valid;

alter table "public"."bsi_deals_clerk_users" validate constraint "bsi_deals_clerk_users_deal_id_fkey";

alter table "public"."bsi_transactions" add constraint "bsi_transactions_clerk_user_id_fkey" FOREIGN KEY (clerk_user_id) REFERENCES auth_clerk_users(id) not valid;

alter table "public"."bsi_transactions" validate constraint "bsi_transactions_clerk_user_id_fkey";

alter table "public"."bsi_transactions_api_ofb_transfers" add constraint "bsi_transactions_api_ofb_transfers_ofb_transfer_id_fkey" FOREIGN KEY (ofb_transfer_id) REFERENCES api_ofb_transfers(ofb_transfer_id) ON DELETE CASCADE not valid;

alter table "public"."bsi_transactions_api_ofb_transfers" validate constraint "bsi_transactions_api_ofb_transfers_ofb_transfer_id_fkey";

alter table "public"."bsi_transactions_api_ofb_transfers" add constraint "bsi_transactions_api_ofb_transfers_transaction_id_fkey" FOREIGN KEY (transaction_id) REFERENCES bsi_transactions(id) ON DELETE CASCADE not valid;

alter table "public"."bsi_transactions_api_ofb_transfers" validate constraint "bsi_transactions_api_ofb_transfers_transaction_id_fkey";

alter table "public"."bsi_transactions_api_ofb_transfers" add constraint "unique_bsi_ofb_transfer" UNIQUE using index "unique_bsi_ofb_transfer";

alter table "public"."bsi_transactions_investors" add constraint "chk_has_user_or_org" CHECK (((clerk_user_id IS NOT NULL) OR (clerk_org_id IS NOT NULL))) not valid;

alter table "public"."bsi_transactions_investors" validate constraint "chk_has_user_or_org";

alter table "public"."bsi_transactions_deals" add constraint "positive_deal_amount" CHECK ((allocation_amount > (0)::numeric)) not valid;

alter table "public"."bsi_transactions_deals" validate constraint "positive_deal_amount";

alter table "public"."bsi_transactions_instruments" add constraint "positive_instrument_amount" CHECK ((allocation_amount > (0)::numeric)) not valid;

alter table "public"."bsi_transactions_instruments" validate constraint "positive_instrument_amount";

alter table "public"."bsi_transactions_investors" add constraint "bsi_transactions_investors_amount_positive" CHECK ((allocation_amount > (0)::numeric)) not valid;

alter table "public"."bsi_transactions_investors" validate constraint "bsi_transactions_investors_amount_positive";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_accessible_transaction_ids()
 RETURNS TABLE(transaction_id bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  -- Transactions where user is directly associated
  SELECT ti.transaction_id
  FROM bsi_transactions_investors ti
  WHERE ti.clerk_user_id = get_current_user_id()
  
  UNION
  
  -- Transactions where user's org is associated
  SELECT ti.transaction_id
  FROM bsi_transactions_investors ti
  WHERE ti.clerk_org_id = ANY(get_current_user_org_ids());
$function$
;

CREATE OR REPLACE FUNCTION public.get_co_investor_org_ids()
 RETURNS bigint[]
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT ARRAY_AGG(DISTINCT ti.clerk_org_id)
  FROM bsi_transactions_investors ti
  WHERE ti.transaction_id IN (SELECT transaction_id FROM get_accessible_transaction_ids())
  AND ti.clerk_org_id IS NOT NULL;
$function$
;

CREATE OR REPLACE FUNCTION public.get_co_investor_user_ids()
 RETURNS bigint[]
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT ARRAY_AGG(DISTINCT ti.clerk_user_id)
  FROM bsi_transactions_investors ti
  WHERE ti.transaction_id IN (SELECT transaction_id FROM get_accessible_transaction_ids())
  AND ti.clerk_user_id IS NOT NULL;
$function$
;

CREATE OR REPLACE FUNCTION public.get_current_user_id()
 RETURNS bigint
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT id FROM auth_clerk_users 
  WHERE clerk_user_id = (auth.jwt() ->> 'sub'::text)
  LIMIT 1;
$function$
;

CREATE OR REPLACE FUNCTION public.get_current_user_org_ids()
 RETURNS bigint[]
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT ARRAY_AGG(m.clerk_org_id)
  FROM auth_clerk_orgs_members m
  JOIN auth_clerk_users u ON u.id = m.auth_clerk_users_id
  WHERE u.clerk_user_id = (auth.jwt() ->> 'sub'::text);
$function$
;

CREATE OR REPLACE FUNCTION public.sync_transaction_to_investors()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Only create investor record if clerk_user_id or clerk_org_id is set on the transaction
  IF NEW.clerk_user_id IS NOT NULL OR NEW.clerk_org_id IS NOT NULL THEN
    -- Check if record already exists for this transaction
    IF NOT EXISTS (
      SELECT 1 FROM bsi_transactions_investors 
      WHERE transaction_id = NEW.id
    ) THEN
      INSERT INTO bsi_transactions_investors (
        transaction_id,
        clerk_user_id,
        clerk_org_id,
        allocation_amount,
        created_at
      ) VALUES (
        NEW.id,
        NEW.clerk_user_id,
        NEW.clerk_org_id,
        NEW.transaction_amount,
        NOW()
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.sync_transaction_to_investors_on_update()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Only act if clerk_user_id or clerk_org_id changed from NULL to a value
  IF (OLD.clerk_user_id IS NULL AND NEW.clerk_user_id IS NOT NULL) OR 
     (OLD.clerk_org_id IS NULL AND NEW.clerk_org_id IS NOT NULL) THEN
    -- Check if record already exists
    IF NOT EXISTS (
      SELECT 1 FROM bsi_transactions_investors 
      WHERE transaction_id = NEW.id
    ) THEN
      INSERT INTO bsi_transactions_investors (
        transaction_id,
        clerk_user_id,
        clerk_org_id,
        allocation_amount,
        created_at
      ) VALUES (
        NEW.id,
        NEW.clerk_user_id,
        NEW.clerk_org_id,
        NEW.transaction_amount,
        NOW()
      );
    ELSE
      -- Update existing record if it exists but has NULL values
      UPDATE bsi_transactions_investors
      SET 
        clerk_user_id = COALESCE(clerk_user_id, NEW.clerk_user_id),
        clerk_org_id = COALESCE(clerk_org_id, NEW.clerk_org_id)
      WHERE transaction_id = NEW.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_clerk_user_id()
 RETURNS text
 LANGUAGE sql
 STABLE
 SET search_path TO 'public', 'auth'
AS $function$
  SELECT COALESCE(
    auth.jwt() ->> 'sub',
    auth.jwt() ->> 'user_id'
  );
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_org_ids()
 RETURNS text[]
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  SELECT COALESCE(
    ARRAY_AGG(co.clerk_org_id::text),
    ARRAY[]::TEXT[]
  )
  FROM public.auth_clerk_orgs_members com
  JOIN public.auth_clerk_orgs co ON com.clerk_org_id = co.id
  JOIN public.auth_clerk_users cu ON com.auth_clerk_users_id = cu.id
  WHERE cu.clerk_user_id = public.get_clerk_user_id();
$function$
;

CREATE OR REPLACE FUNCTION public.is_internal_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.auth_clerk_users
    WHERE clerk_user_id = public.get_clerk_user_id()
    AND role = 'admin'
    AND is_internal_yn = true
  );
$function$
;

CREATE OR REPLACE FUNCTION public.sync_matched_api_brex_transfers_to_bsi_transactions()
 RETURNS TABLE(inserted_count bigint, updated_count bigint, error_count bigint, errors jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_inserted_count bigint := 0;
    v_updated_count bigint := 0;
    v_error_count bigint := 0;
    v_errors jsonb := '[]'::jsonb;
    v_transfer_record RECORD;
    v_transaction_id bigint;
    v_existing_transaction_id bigint;
    v_error_message text;
    v_transaction_method text;
    v_transaction_status text;
    v_ledger_entry_type text;
    v_fed_reference_number text;
    v_amount_dollars numeric;
BEGIN
    -- Loop through all transfers that are matched to vendors via junction table
    FOR v_transfer_record IN
        SELECT DISTINCT
            at.id as transfer_db_id,
            at.brex_transfer_id,
            at.amount,
            at.amount_cents,
            at.process_date,
            at.status,
            at.external_memo,
            at.payment_type,
            at.fed_reference_number,
            at.raw_payload,
            atv.brex_vendor_id as matched_vendor_id,
            -- Get matched clerk_user_id from the vendor
            (SELECT avcu.clerk_user_id 
             FROM api_brex_vendors_clerk_users avcu
             WHERE avcu.brex_vendor_id = atv.brex_vendor_id
             LIMIT 1) as clerk_user_id,
            -- Get matched clerk_org_id from the vendor
            (SELECT avco.clerk_org_id 
             FROM api_brex_vendors_clerk_orgs avco
             WHERE avco.brex_vendor_id = atv.brex_vendor_id
             LIMIT 1) as clerk_org_id
        FROM api_brex_transfers at
        -- Join with junction table to get vendor match
        INNER JOIN api_brex_transfers_vendors atv ON atv.brex_transfer_id = at.brex_transfer_id
        -- IMPORTANT: Only process active matches (not soft-deleted)
        WHERE atv.deleted_at IS NULL
        -- Only process if vendor has clerk match (user or org)
        AND (
            EXISTS (
                SELECT 1 FROM api_brex_vendors_clerk_users avcu
                WHERE avcu.brex_vendor_id = atv.brex_vendor_id
            )
            OR EXISTS (
                SELECT 1 FROM api_brex_vendors_clerk_orgs avco
                WHERE avco.brex_vendor_id = atv.brex_vendor_id
            )
        )
    LOOP
        BEGIN
            -- Extract fed_reference_number
            v_fed_reference_number := COALESCE(
                v_transfer_record.fed_reference_number,
                (v_transfer_record.raw_payload->'counterparty'->>'fed_reference_number')::text
            );

            -- Convert amount from cents to dollars
            IF v_transfer_record.amount_cents IS NOT NULL THEN
                v_amount_dollars := v_transfer_record.amount_cents / 100.0;
            ELSIF v_transfer_record.amount IS NOT NULL THEN
                v_amount_dollars := v_transfer_record.amount / 100.0;
            ELSE
                v_amount_dollars := NULL;
            END IF;
            
            -- Determine ledger_entry_type based on direction (from investor perspective)
            -- Negative = money sent out (contribution/investment)
            -- Positive = money received back (distribution/return)
            IF v_amount_dollars IS NOT NULL THEN
                IF v_amount_dollars < 0 THEN
                    v_ledger_entry_type := 'contribution';
                ELSE
                    v_ledger_entry_type := 'distribution';
                END IF;
            ELSE
                v_ledger_entry_type := 'contribution';
            END IF;

            -- Map payment_type to transaction_method
            CASE v_transfer_record.payment_type
                WHEN 'ACH' THEN v_transaction_method := 'ach';
                WHEN 'DOMESTIC_WIRE' THEN v_transaction_method := 'wire';
                WHEN 'INTERNATIONAL_WIRE' THEN v_transaction_method := 'wire';
                WHEN 'CHEQUE' THEN v_transaction_method := 'check';
                ELSE v_transaction_method := 'other';
            END CASE;

            -- Map status to transaction_status
            CASE UPPER(TRIM(v_transfer_record.status))
                WHEN 'PROCESSING' THEN v_transaction_status := 'processing';
                WHEN 'COMPLETED' THEN v_transaction_status := 'completed';
                WHEN 'FAILED' THEN v_transaction_status := 'failed';
                WHEN 'CANCELLED', 'CANCELED' THEN v_transaction_status := 'canceled';
                WHEN 'PENDING' THEN v_transaction_status := 'pending';
                WHEN 'SCHEDULED' THEN v_transaction_status := 'scheduled';
                WHEN 'INITIATED' THEN v_transaction_status := 'initiated';
                WHEN 'PROCESSED' THEN v_transaction_status := 'processed';
                ELSE 
                    v_transaction_status := COALESCE(
                        LOWER((v_transfer_record.raw_payload->>'status')::text),
                        'pending'
                    );
            END CASE;

            -- Check if transaction already exists via junction table
            SELECT t.id INTO v_existing_transaction_id
            FROM bsi_transactions t
            JOIN bsi_transactions_api_brex_transfers btbt ON btbt.transaction_id = t.id
            WHERE btbt.brex_transfer_id = v_transfer_record.brex_transfer_id;

            IF v_existing_transaction_id IS NOT NULL THEN
                -- UPDATE existing transaction with latest Brex data
                -- Use ABS() because transaction_amount must be positive (direction is in ledger_entry_type)
                -- Also update clerk_user_id and clerk_org_id in case they were missing
                UPDATE bsi_transactions SET
                    transaction_amount = ABS(v_amount_dollars),
                    transaction_status = v_transaction_status::transaction_status,
                    transaction_date = COALESCE(v_transfer_record.process_date::timestamp with time zone, transaction_date),
                    ledger_entry_type = v_ledger_entry_type::ledger_entry_type,
                    clerk_user_id = COALESCE(clerk_user_id, v_transfer_record.clerk_user_id),
                    clerk_org_id = COALESCE(clerk_org_id, v_transfer_record.clerk_org_id),
                    updated_at = NOW()
                WHERE id = v_existing_transaction_id;
                
                v_updated_count := v_updated_count + 1;
            ELSE
                -- INSERT new transaction
                -- Use ABS() because transaction_amount must be positive (direction is in ledger_entry_type)
                -- FIX: Include clerk_user_id and clerk_org_id directly on the transaction
                INSERT INTO bsi_transactions (
                    transaction_amount,
                    transaction_date,
                    transaction_method,
                    transaction_status,
                    reference_number,
                    external_memo,
                    ledger_entry_type,
                    clerk_user_id,
                    clerk_org_id,
                    created_at,
                    updated_at
                )
                VALUES (
                    ABS(v_amount_dollars),
                    COALESCE(v_transfer_record.process_date::timestamp with time zone, NOW()),
                    v_transaction_method::transaction_method,
                    v_transaction_status::transaction_status,
                    v_fed_reference_number,
                    v_transfer_record.external_memo,
                    v_ledger_entry_type::ledger_entry_type,
                    v_transfer_record.clerk_user_id,
                    v_transfer_record.clerk_org_id,
                    NOW(),
                    NOW()
                )
                RETURNING id INTO v_transaction_id;

                -- Create investor allocation if clerk match exists
                -- allocation_amount must be positive (absolute value)
                IF v_transfer_record.clerk_user_id IS NOT NULL THEN
                    INSERT INTO bsi_transactions_investors (
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
                        ABS(v_amount_dollars),
                        NOW()
                    );
                END IF;

                -- Create junction table record linking transaction to transfer
                INSERT INTO bsi_transactions_api_brex_transfers (
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
            END IF;

        EXCEPTION WHEN OTHERS THEN
            v_error_count := v_error_count + 1;
            v_error_message := SQLERRM;
            v_errors := v_errors || jsonb_build_object(
                'brex_transfer_id', v_transfer_record.brex_transfer_id,
                'error', v_error_message
            );
        END;
    END LOOP;

    RETURN QUERY SELECT v_inserted_count, v_updated_count, v_error_count, v_errors;
END;
$function$
;

grant delete on table "public"."api_ofb_transfers" to "anon";

grant insert on table "public"."api_ofb_transfers" to "anon";

grant references on table "public"."api_ofb_transfers" to "anon";

grant select on table "public"."api_ofb_transfers" to "anon";

grant trigger on table "public"."api_ofb_transfers" to "anon";

grant truncate on table "public"."api_ofb_transfers" to "anon";

grant update on table "public"."api_ofb_transfers" to "anon";

grant delete on table "public"."api_ofb_transfers" to "authenticated";

grant insert on table "public"."api_ofb_transfers" to "authenticated";

grant references on table "public"."api_ofb_transfers" to "authenticated";

grant select on table "public"."api_ofb_transfers" to "authenticated";

grant trigger on table "public"."api_ofb_transfers" to "authenticated";

grant truncate on table "public"."api_ofb_transfers" to "authenticated";

grant update on table "public"."api_ofb_transfers" to "authenticated";

grant delete on table "public"."api_ofb_transfers" to "service_role";

grant insert on table "public"."api_ofb_transfers" to "service_role";

grant references on table "public"."api_ofb_transfers" to "service_role";

grant select on table "public"."api_ofb_transfers" to "service_role";

grant trigger on table "public"."api_ofb_transfers" to "service_role";

grant truncate on table "public"."api_ofb_transfers" to "service_role";

grant update on table "public"."api_ofb_transfers" to "service_role";

grant delete on table "public"."api_ofb_transfers_vendors" to "anon";

grant insert on table "public"."api_ofb_transfers_vendors" to "anon";

grant references on table "public"."api_ofb_transfers_vendors" to "anon";

grant select on table "public"."api_ofb_transfers_vendors" to "anon";

grant trigger on table "public"."api_ofb_transfers_vendors" to "anon";

grant truncate on table "public"."api_ofb_transfers_vendors" to "anon";

grant update on table "public"."api_ofb_transfers_vendors" to "anon";

grant delete on table "public"."api_ofb_transfers_vendors" to "authenticated";

grant insert on table "public"."api_ofb_transfers_vendors" to "authenticated";

grant references on table "public"."api_ofb_transfers_vendors" to "authenticated";

grant select on table "public"."api_ofb_transfers_vendors" to "authenticated";

grant trigger on table "public"."api_ofb_transfers_vendors" to "authenticated";

grant truncate on table "public"."api_ofb_transfers_vendors" to "authenticated";

grant update on table "public"."api_ofb_transfers_vendors" to "authenticated";

grant delete on table "public"."api_ofb_transfers_vendors" to "service_role";

grant insert on table "public"."api_ofb_transfers_vendors" to "service_role";

grant references on table "public"."api_ofb_transfers_vendors" to "service_role";

grant select on table "public"."api_ofb_transfers_vendors" to "service_role";

grant trigger on table "public"."api_ofb_transfers_vendors" to "service_role";

grant truncate on table "public"."api_ofb_transfers_vendors" to "service_role";

grant update on table "public"."api_ofb_transfers_vendors" to "service_role";

grant delete on table "public"."api_ofb_vendors" to "anon";

grant insert on table "public"."api_ofb_vendors" to "anon";

grant references on table "public"."api_ofb_vendors" to "anon";

grant select on table "public"."api_ofb_vendors" to "anon";

grant trigger on table "public"."api_ofb_vendors" to "anon";

grant truncate on table "public"."api_ofb_vendors" to "anon";

grant update on table "public"."api_ofb_vendors" to "anon";

grant delete on table "public"."api_ofb_vendors" to "authenticated";

grant insert on table "public"."api_ofb_vendors" to "authenticated";

grant references on table "public"."api_ofb_vendors" to "authenticated";

grant select on table "public"."api_ofb_vendors" to "authenticated";

grant trigger on table "public"."api_ofb_vendors" to "authenticated";

grant truncate on table "public"."api_ofb_vendors" to "authenticated";

grant update on table "public"."api_ofb_vendors" to "authenticated";

grant delete on table "public"."api_ofb_vendors" to "service_role";

grant insert on table "public"."api_ofb_vendors" to "service_role";

grant references on table "public"."api_ofb_vendors" to "service_role";

grant select on table "public"."api_ofb_vendors" to "service_role";

grant trigger on table "public"."api_ofb_vendors" to "service_role";

grant truncate on table "public"."api_ofb_vendors" to "service_role";

grant update on table "public"."api_ofb_vendors" to "service_role";

grant delete on table "public"."api_ofb_vendors_clerk_orgs" to "anon";

grant insert on table "public"."api_ofb_vendors_clerk_orgs" to "anon";

grant references on table "public"."api_ofb_vendors_clerk_orgs" to "anon";

grant select on table "public"."api_ofb_vendors_clerk_orgs" to "anon";

grant trigger on table "public"."api_ofb_vendors_clerk_orgs" to "anon";

grant truncate on table "public"."api_ofb_vendors_clerk_orgs" to "anon";

grant update on table "public"."api_ofb_vendors_clerk_orgs" to "anon";

grant delete on table "public"."api_ofb_vendors_clerk_orgs" to "authenticated";

grant insert on table "public"."api_ofb_vendors_clerk_orgs" to "authenticated";

grant references on table "public"."api_ofb_vendors_clerk_orgs" to "authenticated";

grant select on table "public"."api_ofb_vendors_clerk_orgs" to "authenticated";

grant trigger on table "public"."api_ofb_vendors_clerk_orgs" to "authenticated";

grant truncate on table "public"."api_ofb_vendors_clerk_orgs" to "authenticated";

grant update on table "public"."api_ofb_vendors_clerk_orgs" to "authenticated";

grant delete on table "public"."api_ofb_vendors_clerk_orgs" to "service_role";

grant insert on table "public"."api_ofb_vendors_clerk_orgs" to "service_role";

grant references on table "public"."api_ofb_vendors_clerk_orgs" to "service_role";

grant select on table "public"."api_ofb_vendors_clerk_orgs" to "service_role";

grant trigger on table "public"."api_ofb_vendors_clerk_orgs" to "service_role";

grant truncate on table "public"."api_ofb_vendors_clerk_orgs" to "service_role";

grant update on table "public"."api_ofb_vendors_clerk_orgs" to "service_role";

grant delete on table "public"."api_ofb_vendors_clerk_users" to "anon";

grant insert on table "public"."api_ofb_vendors_clerk_users" to "anon";

grant references on table "public"."api_ofb_vendors_clerk_users" to "anon";

grant select on table "public"."api_ofb_vendors_clerk_users" to "anon";

grant trigger on table "public"."api_ofb_vendors_clerk_users" to "anon";

grant truncate on table "public"."api_ofb_vendors_clerk_users" to "anon";

grant update on table "public"."api_ofb_vendors_clerk_users" to "anon";

grant delete on table "public"."api_ofb_vendors_clerk_users" to "authenticated";

grant insert on table "public"."api_ofb_vendors_clerk_users" to "authenticated";

grant references on table "public"."api_ofb_vendors_clerk_users" to "authenticated";

grant select on table "public"."api_ofb_vendors_clerk_users" to "authenticated";

grant trigger on table "public"."api_ofb_vendors_clerk_users" to "authenticated";

grant truncate on table "public"."api_ofb_vendors_clerk_users" to "authenticated";

grant update on table "public"."api_ofb_vendors_clerk_users" to "authenticated";

grant delete on table "public"."api_ofb_vendors_clerk_users" to "service_role";

grant insert on table "public"."api_ofb_vendors_clerk_users" to "service_role";

grant references on table "public"."api_ofb_vendors_clerk_users" to "service_role";

grant select on table "public"."api_ofb_vendors_clerk_users" to "service_role";

grant trigger on table "public"."api_ofb_vendors_clerk_users" to "service_role";

grant truncate on table "public"."api_ofb_vendors_clerk_users" to "service_role";

grant update on table "public"."api_ofb_vendors_clerk_users" to "service_role";

grant delete on table "public"."bank_accounts" to "anon";

grant insert on table "public"."bank_accounts" to "anon";

grant references on table "public"."bank_accounts" to "anon";

grant select on table "public"."bank_accounts" to "anon";

grant trigger on table "public"."bank_accounts" to "anon";

grant truncate on table "public"."bank_accounts" to "anon";

grant update on table "public"."bank_accounts" to "anon";

grant delete on table "public"."bank_accounts" to "authenticated";

grant insert on table "public"."bank_accounts" to "authenticated";

grant references on table "public"."bank_accounts" to "authenticated";

grant select on table "public"."bank_accounts" to "authenticated";

grant trigger on table "public"."bank_accounts" to "authenticated";

grant truncate on table "public"."bank_accounts" to "authenticated";

grant update on table "public"."bank_accounts" to "authenticated";

grant delete on table "public"."bank_accounts" to "service_role";

grant insert on table "public"."bank_accounts" to "service_role";

grant references on table "public"."bank_accounts" to "service_role";

grant select on table "public"."bank_accounts" to "service_role";

grant trigger on table "public"."bank_accounts" to "service_role";

grant truncate on table "public"."bank_accounts" to "service_role";

grant update on table "public"."bank_accounts" to "service_role";

grant delete on table "public"."bsi_deals_clerk_orgs" to "anon";

grant insert on table "public"."bsi_deals_clerk_orgs" to "anon";

grant references on table "public"."bsi_deals_clerk_orgs" to "anon";

grant select on table "public"."bsi_deals_clerk_orgs" to "anon";

grant trigger on table "public"."bsi_deals_clerk_orgs" to "anon";

grant truncate on table "public"."bsi_deals_clerk_orgs" to "anon";

grant update on table "public"."bsi_deals_clerk_orgs" to "anon";

grant delete on table "public"."bsi_deals_clerk_orgs" to "authenticated";

grant insert on table "public"."bsi_deals_clerk_orgs" to "authenticated";

grant references on table "public"."bsi_deals_clerk_orgs" to "authenticated";

grant select on table "public"."bsi_deals_clerk_orgs" to "authenticated";

grant trigger on table "public"."bsi_deals_clerk_orgs" to "authenticated";

grant truncate on table "public"."bsi_deals_clerk_orgs" to "authenticated";

grant update on table "public"."bsi_deals_clerk_orgs" to "authenticated";

grant delete on table "public"."bsi_deals_clerk_orgs" to "service_role";

grant insert on table "public"."bsi_deals_clerk_orgs" to "service_role";

grant references on table "public"."bsi_deals_clerk_orgs" to "service_role";

grant select on table "public"."bsi_deals_clerk_orgs" to "service_role";

grant trigger on table "public"."bsi_deals_clerk_orgs" to "service_role";

grant truncate on table "public"."bsi_deals_clerk_orgs" to "service_role";

grant update on table "public"."bsi_deals_clerk_orgs" to "service_role";

grant delete on table "public"."bsi_deals_clerk_users" to "anon";

grant insert on table "public"."bsi_deals_clerk_users" to "anon";

grant references on table "public"."bsi_deals_clerk_users" to "anon";

grant select on table "public"."bsi_deals_clerk_users" to "anon";

grant trigger on table "public"."bsi_deals_clerk_users" to "anon";

grant truncate on table "public"."bsi_deals_clerk_users" to "anon";

grant update on table "public"."bsi_deals_clerk_users" to "anon";

grant delete on table "public"."bsi_deals_clerk_users" to "authenticated";

grant insert on table "public"."bsi_deals_clerk_users" to "authenticated";

grant references on table "public"."bsi_deals_clerk_users" to "authenticated";

grant select on table "public"."bsi_deals_clerk_users" to "authenticated";

grant trigger on table "public"."bsi_deals_clerk_users" to "authenticated";

grant truncate on table "public"."bsi_deals_clerk_users" to "authenticated";

grant update on table "public"."bsi_deals_clerk_users" to "authenticated";

grant delete on table "public"."bsi_deals_clerk_users" to "service_role";

grant insert on table "public"."bsi_deals_clerk_users" to "service_role";

grant references on table "public"."bsi_deals_clerk_users" to "service_role";

grant select on table "public"."bsi_deals_clerk_users" to "service_role";

grant trigger on table "public"."bsi_deals_clerk_users" to "service_role";

grant truncate on table "public"."bsi_deals_clerk_users" to "service_role";

grant update on table "public"."bsi_deals_clerk_users" to "service_role";

grant delete on table "public"."bsi_transactions_api_ofb_transfers" to "anon";

grant insert on table "public"."bsi_transactions_api_ofb_transfers" to "anon";

grant references on table "public"."bsi_transactions_api_ofb_transfers" to "anon";

grant select on table "public"."bsi_transactions_api_ofb_transfers" to "anon";

grant trigger on table "public"."bsi_transactions_api_ofb_transfers" to "anon";

grant truncate on table "public"."bsi_transactions_api_ofb_transfers" to "anon";

grant update on table "public"."bsi_transactions_api_ofb_transfers" to "anon";

grant delete on table "public"."bsi_transactions_api_ofb_transfers" to "authenticated";

grant insert on table "public"."bsi_transactions_api_ofb_transfers" to "authenticated";

grant references on table "public"."bsi_transactions_api_ofb_transfers" to "authenticated";

grant select on table "public"."bsi_transactions_api_ofb_transfers" to "authenticated";

grant trigger on table "public"."bsi_transactions_api_ofb_transfers" to "authenticated";

grant truncate on table "public"."bsi_transactions_api_ofb_transfers" to "authenticated";

grant update on table "public"."bsi_transactions_api_ofb_transfers" to "authenticated";

grant delete on table "public"."bsi_transactions_api_ofb_transfers" to "service_role";

grant insert on table "public"."bsi_transactions_api_ofb_transfers" to "service_role";

grant references on table "public"."bsi_transactions_api_ofb_transfers" to "service_role";

grant select on table "public"."bsi_transactions_api_ofb_transfers" to "service_role";

grant trigger on table "public"."bsi_transactions_api_ofb_transfers" to "service_role";

grant truncate on table "public"."bsi_transactions_api_ofb_transfers" to "service_role";

grant update on table "public"."bsi_transactions_api_ofb_transfers" to "service_role";

create policy "Admin can delete OFB transfers"
on "public"."api_ofb_transfers"
as permissive
for delete
to authenticated
using (is_admin());


create policy "Admin can insert OFB transfers"
on "public"."api_ofb_transfers"
as permissive
for insert
to authenticated
with check (is_admin());


create policy "Admin can update OFB transfers"
on "public"."api_ofb_transfers"
as permissive
for update
to authenticated
using (is_admin());


create policy "Admin can view all OFB transfers"
on "public"."api_ofb_transfers"
as permissive
for select
to authenticated
using (is_admin());


create policy "Admin can delete OFB transfer-vendor matches"
on "public"."api_ofb_transfers_vendors"
as permissive
for delete
to authenticated
using (is_admin());


create policy "Admin can insert OFB transfer-vendor matches"
on "public"."api_ofb_transfers_vendors"
as permissive
for insert
to authenticated
with check (is_admin());


create policy "Admin can update OFB transfer-vendor matches"
on "public"."api_ofb_transfers_vendors"
as permissive
for update
to authenticated
using (is_admin());


create policy "Admin can view all OFB transfer-vendor matches"
on "public"."api_ofb_transfers_vendors"
as permissive
for select
to authenticated
using (is_admin());


create policy "Admin can delete OFB vendors"
on "public"."api_ofb_vendors"
as permissive
for delete
to authenticated
using (is_admin());


create policy "Admin can insert OFB vendors"
on "public"."api_ofb_vendors"
as permissive
for insert
to authenticated
with check (is_admin());


create policy "Admin can update OFB vendors"
on "public"."api_ofb_vendors"
as permissive
for update
to authenticated
using (is_admin());


create policy "Admin can view all OFB vendors"
on "public"."api_ofb_vendors"
as permissive
for select
to authenticated
using (is_admin());


create policy "Admin can delete OFB vendor-org matches"
on "public"."api_ofb_vendors_clerk_orgs"
as permissive
for delete
to authenticated
using (is_admin());


create policy "Admin can insert OFB vendor-org matches"
on "public"."api_ofb_vendors_clerk_orgs"
as permissive
for insert
to authenticated
with check (is_admin());


create policy "Admin can update OFB vendor-org matches"
on "public"."api_ofb_vendors_clerk_orgs"
as permissive
for update
to authenticated
using (is_admin());


create policy "Admin can view all OFB vendor-org matches"
on "public"."api_ofb_vendors_clerk_orgs"
as permissive
for select
to authenticated
using (is_admin());


create policy "Admin can delete OFB vendor-user matches"
on "public"."api_ofb_vendors_clerk_users"
as permissive
for delete
to authenticated
using (is_admin());


create policy "Admin can insert OFB vendor-user matches"
on "public"."api_ofb_vendors_clerk_users"
as permissive
for insert
to authenticated
with check (is_admin());


create policy "Admin can update OFB vendor-user matches"
on "public"."api_ofb_vendors_clerk_users"
as permissive
for update
to authenticated
using (is_admin());


create policy "Admin can view all OFB vendor-user matches"
on "public"."api_ofb_vendors_clerk_users"
as permissive
for select
to authenticated
using (is_admin());


create policy "Users can view co-investor orgs"
on "public"."auth_clerk_orgs"
as permissive
for select
to authenticated
using ((id = ANY (get_co_investor_org_ids())));


create policy "Users can view org memberships"
on "public"."auth_clerk_orgs_members"
as permissive
for select
to authenticated
using ((is_admin() OR (auth_clerk_users_id = get_current_user_id())));


create policy "Users can view co-investor profiles"
on "public"."auth_clerk_users"
as permissive
for select
to authenticated
using ((id = ANY (get_co_investor_user_ids())));


create policy "bank_accounts_admin_only"
on "public"."bank_accounts"
as permissive
for all
to public
using (is_admin())
with check (is_admin());


create policy "Only admins can delete bsi_deals_clerk_orgs"
on "public"."bsi_deals_clerk_orgs"
as permissive
for delete
to authenticated
using ((EXISTS ( SELECT 1
   FROM auth_clerk_users p
  WHERE ((p.clerk_user_id = (auth.jwt() ->> 'sub'::text)) AND (p.role = 'admin'::user_role_internal)))));


create policy "Only admins can insert bsi_deals_clerk_orgs"
on "public"."bsi_deals_clerk_orgs"
as permissive
for insert
to authenticated
with check ((EXISTS ( SELECT 1
   FROM auth_clerk_users p
  WHERE ((p.clerk_user_id = (auth.jwt() ->> 'sub'::text)) AND (p.role = 'admin'::user_role_internal)))));


create policy "Only admins can update bsi_deals_clerk_orgs"
on "public"."bsi_deals_clerk_orgs"
as permissive
for update
to authenticated
using ((EXISTS ( SELECT 1
   FROM auth_clerk_users p
  WHERE ((p.clerk_user_id = (auth.jwt() ->> 'sub'::text)) AND (p.role = 'admin'::user_role_internal)))));


create policy "Org members can select bsi_deals_clerk_orgs"
on "public"."bsi_deals_clerk_orgs"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM (auth_clerk_users p
     JOIN auth_clerk_orgs_members m ON ((p.id = m.auth_clerk_users_id)))
  WHERE ((m.clerk_org_id = bsi_deals_clerk_orgs.clerk_org_id) AND (p.clerk_user_id = (auth.jwt() ->> 'sub'::text))))));


create policy "Admin can select all bsi_deals_clerk_users"
on "public"."bsi_deals_clerk_users"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM auth_clerk_users acu
  WHERE ((acu.clerk_user_id = (auth.jwt() ->> 'sub'::text)) AND (acu.role = 'admin'::user_role_internal)))));


create policy "Users can view own transactions"
on "public"."bsi_transactions"
as permissive
for select
to authenticated
using ((is_admin() OR (id IN ( SELECT get_accessible_transaction_ids.transaction_id
   FROM get_accessible_transaction_ids() get_accessible_transaction_ids(transaction_id)))));


create policy "Admin can delete BSI-OFB transfer links"
on "public"."bsi_transactions_api_ofb_transfers"
as permissive
for delete
to authenticated
using (is_admin());


create policy "Admin can insert BSI-OFB transfer links"
on "public"."bsi_transactions_api_ofb_transfers"
as permissive
for insert
to authenticated
with check (is_admin());


create policy "Admin can update BSI-OFB transfer links"
on "public"."bsi_transactions_api_ofb_transfers"
as permissive
for update
to authenticated
using (is_admin());


create policy "Admin can view all BSI-OFB transfer links"
on "public"."bsi_transactions_api_ofb_transfers"
as permissive
for select
to authenticated
using (is_admin());


create policy "Users can view appraisals for their deals"
on "public"."appraisal"
as permissive
for select
to authenticated
using ((deal_id IN ( SELECT bd.deal_id
   FROM (((bsi_deals_clerk_users bd
     JOIN bsi_deals_clerk_orgs bdo ON ((bd.id = bdo.deal_id)))
     JOIN auth_clerk_orgs_members om ON ((bdo.clerk_org_id = om.clerk_org_id)))
     JOIN auth_clerk_users acu ON ((om.auth_clerk_users_id = acu.id)))
  WHERE (acu.clerk_user_id = (auth.jwt() ->> 'sub'::text)))));


create policy "Org members and admins can read instrument-deal links"
on "public"."bs_debt_instruments_deals"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM (((bsi_deals_clerk_users d
     JOIN bsi_deals_clerk_orgs dorg ON ((dorg.deal_id = d.id)))
     JOIN auth_clerk_orgs_members m ON ((m.clerk_org_id = dorg.clerk_org_id)))
     JOIN auth_clerk_users p ON ((p.id = m.auth_clerk_users_id)))
  WHERE ((d.id = bs_debt_instruments_deals.deal_id) AND (p.clerk_user_id = (auth.jwt() ->> 'sub'::text)) AND ((p.role = 'admin'::user_role_internal) OR (m.clerk_org_id = dorg.clerk_org_id))))));


create policy "Users can view their transaction allocations"
on "public"."bsi_transactions_investors"
as permissive
for select
to authenticated
using ((is_admin() OR (clerk_user_id = get_current_user_id()) OR (clerk_org_id = ANY (get_current_user_org_ids()))));


create policy "Users can view CBA requests for their deals"
on "public"."cba_requests"
as permissive
for select
to authenticated
using ((deal_id IN ( SELECT bd.deal_id
   FROM (((bsi_deals_clerk_users bd
     JOIN bsi_deals_clerk_orgs bdo ON ((bd.id = bdo.deal_id)))
     JOIN auth_clerk_orgs_members om ON ((bdo.clerk_org_id = om.clerk_org_id)))
     JOIN auth_clerk_users acu ON ((om.auth_clerk_users_id = acu.id)))
  WHERE (acu.clerk_user_id = (auth.jwt() ->> 'sub'::text)))));


create policy "Users can view fees for their deals"
on "public"."custom_loan_fees"
as permissive
for select
to authenticated
using ((deal_id IN ( SELECT bd.deal_id
   FROM (((bsi_deals_clerk_users bd
     JOIN bsi_deals_clerk_orgs bdo ON ((bd.id = bdo.deal_id)))
     JOIN auth_clerk_orgs_members om ON ((bdo.clerk_org_id = om.clerk_org_id)))
     JOIN auth_clerk_users acu ON ((om.auth_clerk_users_id = acu.id)))
  WHERE (acu.clerk_user_id = (auth.jwt() ->> 'sub'::text)))));


create policy "Users can view deal appraisals for their deals"
on "public"."deal_appraisals"
as permissive
for select
to authenticated
using ((deal_id IN ( SELECT bd.deal_id
   FROM (((bsi_deals_clerk_users bd
     JOIN bsi_deals_clerk_orgs bdo ON ((bd.id = bdo.deal_id)))
     JOIN auth_clerk_orgs_members om ON ((bdo.clerk_org_id = om.clerk_org_id)))
     JOIN auth_clerk_users acu ON ((om.auth_clerk_users_id = acu.id)))
  WHERE (acu.clerk_user_id = (auth.jwt() ->> 'sub'::text)))));


create policy "Users can view property data for their deals"
on "public"."deal_property"
as permissive
for select
to authenticated
using ((deal_id IN ( SELECT bd.deal_id
   FROM (((bsi_deals_clerk_users bd
     JOIN bsi_deals_clerk_orgs bdo ON ((bd.id = bdo.deal_id)))
     JOIN auth_clerk_orgs_members om ON ((bdo.clerk_org_id = om.clerk_org_id)))
     JOIN auth_clerk_users acu ON ((om.auth_clerk_users_id = acu.id)))
  WHERE (acu.clerk_user_id = (auth.jwt() ->> 'sub'::text)))));


create policy "Users can view roles for their deals"
on "public"."deal_roles"
as permissive
for select
to authenticated
using ((deal_id IN ( SELECT bd.deal_id
   FROM (((bsi_deals_clerk_users bd
     JOIN bsi_deals_clerk_orgs bdo ON ((bd.id = bdo.deal_id)))
     JOIN auth_clerk_orgs_members om ON ((bdo.clerk_org_id = om.clerk_org_id)))
     JOIN auth_clerk_users acu ON ((om.auth_clerk_users_id = acu.id)))
  WHERE (acu.clerk_user_id = (auth.jwt() ->> 'sub'::text)))));


create policy "Users can view milestones for their deals"
on "public"."milestones"
as permissive
for select
to authenticated
using ((deal_id IN ( SELECT bd.deal_id
   FROM (((bsi_deals_clerk_users bd
     JOIN bsi_deals_clerk_orgs bdo ON ((bd.id = bdo.deal_id)))
     JOIN auth_clerk_orgs_members om ON ((bdo.clerk_org_id = om.clerk_org_id)))
     JOIN auth_clerk_users acu ON ((om.auth_clerk_users_id = acu.id)))
  WHERE (acu.clerk_user_id = (auth.jwt() ->> 'sub'::text)))));


create policy "Users can view payroll submissions for their deals"
on "public"."payroll_ledger"
as permissive
for select
to authenticated
using ((deal_id IN ( SELECT bd.deal_id
   FROM (((bsi_deals_clerk_users bd
     JOIN bsi_deals_clerk_orgs bdo ON ((bd.id = bdo.deal_id)))
     JOIN auth_clerk_orgs_members om ON ((bdo.clerk_org_id = om.clerk_org_id)))
     JOIN auth_clerk_users acu ON ((om.auth_clerk_users_id = acu.id)))
  WHERE (acu.clerk_user_id = (auth.jwt() ->> 'sub'::text)))));


create policy "Users can view property income for their deals"
on "public"."property_income"
as permissive
for select
to authenticated
using ((property_id IN ( SELECT dp.property_id
   FROM ((((deal_property dp
     JOIN bsi_deals_clerk_users bd ON ((dp.deal_id = bd.deal_id)))
     JOIN bsi_deals_clerk_orgs bdo ON ((bd.id = bdo.deal_id)))
     JOIN auth_clerk_orgs_members om ON ((bdo.clerk_org_id = om.clerk_org_id)))
     JOIN auth_clerk_users acu ON ((om.auth_clerk_users_id = acu.id)))
  WHERE (acu.clerk_user_id = (auth.jwt() ->> 'sub'::text)))));


create policy "Users can view tasks for their deals"
on "public"."tasks"
as permissive
for select
to authenticated
using (((deal_id IN ( SELECT bd.deal_id
   FROM (((bsi_deals_clerk_users bd
     JOIN bsi_deals_clerk_orgs bdo ON ((bd.id = bdo.deal_id)))
     JOIN auth_clerk_orgs_members om ON ((bdo.clerk_org_id = om.clerk_org_id)))
     JOIN auth_clerk_users acu ON ((om.auth_clerk_users_id = acu.id)))
  WHERE (acu.clerk_user_id = (auth.jwt() ->> 'sub'::text)))) OR (assigned_to IN ( SELECT acu.id
   FROM auth_clerk_users acu
  WHERE (acu.clerk_user_id = (auth.jwt() ->> 'sub'::text))))));


CREATE TRIGGER trg_sync_transaction_to_investors AFTER INSERT ON public.bsi_transactions FOR EACH ROW EXECUTE FUNCTION sync_transaction_to_investors();

CREATE TRIGGER trg_sync_transaction_to_investors_on_update AFTER UPDATE ON public.bsi_transactions FOR EACH ROW EXECUTE FUNCTION sync_transaction_to_investors_on_update();

CREATE TRIGGER validate_deal_allocation_sum_update AFTER UPDATE OF allocation_amount ON public.bsi_transactions_deals FOR EACH ROW EXECUTE FUNCTION check_deal_allocation_sum();


