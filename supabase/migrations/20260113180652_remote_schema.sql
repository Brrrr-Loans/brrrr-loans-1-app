alter table "public"."bsi_transactions" alter column "ledger_entry_type" drop default;

alter type "public"."ledger_entry_type" rename to "ledger_entry_type__old_version_to_be_dropped";

create type "public"."ledger_entry_type" as enum ('contribution', 'redemption', 'interest', 'fee', 'distribution', 'return');


  create table "public"."form_submissions" (
    "id" uuid not null default gen_random_uuid(),
    "lender_slug" text not null,
    "form_slug" text not null,
    "form_version" integer not null,
    "status" text not null default 'received'::text,
    "payload" jsonb not null,
    "application_id" uuid,
    "error_code" text,
    "error_detail" text,
    "ip_hash" text,
    "user_agent" text,
    "created_at" timestamp with time zone not null default now(),
    "validated_at" timestamp with time zone,
    "processed_at" timestamp with time zone
      );


alter table "public"."form_submissions" enable row level security;

alter table "public"."bsi_transactions" alter column ledger_entry_type type "public"."ledger_entry_type" using ledger_entry_type::text::"public"."ledger_entry_type";

alter table "public"."bsi_transactions" alter column "ledger_entry_type" set default 'contribution'::public.ledger_entry_type;

drop type "public"."ledger_entry_type__old_version_to_be_dropped";

drop type "public"."deal_status_primary__old_version_to_be_dropped";

CREATE INDEX form_submissions_created_at_idx ON public.form_submissions USING btree (created_at DESC);

CREATE INDEX form_submissions_lender_form_idx ON public.form_submissions USING btree (lender_slug, form_slug);

CREATE UNIQUE INDEX form_submissions_pkey ON public.form_submissions USING btree (id);

CREATE INDEX form_submissions_status_idx ON public.form_submissions USING btree (status);

CREATE INDEX idx_auth_clerk_orgs_themes_default ON public.auth_clerk_orgs_themes USING btree (org_id, is_default) WHERE (is_default = true);

CREATE INDEX idx_auth_clerk_orgs_themes_org_id ON public.auth_clerk_orgs_themes USING btree (org_id);

alter table "public"."form_submissions" add constraint "form_submissions_pkey" PRIMARY KEY using index "form_submissions_pkey";

grant delete on table "public"."form_submissions" to "anon";

grant insert on table "public"."form_submissions" to "anon";

grant references on table "public"."form_submissions" to "anon";

grant select on table "public"."form_submissions" to "anon";

grant trigger on table "public"."form_submissions" to "anon";

grant truncate on table "public"."form_submissions" to "anon";

grant update on table "public"."form_submissions" to "anon";

grant delete on table "public"."form_submissions" to "authenticated";

grant insert on table "public"."form_submissions" to "authenticated";

grant references on table "public"."form_submissions" to "authenticated";

grant select on table "public"."form_submissions" to "authenticated";

grant trigger on table "public"."form_submissions" to "authenticated";

grant truncate on table "public"."form_submissions" to "authenticated";

grant update on table "public"."form_submissions" to "authenticated";

grant delete on table "public"."form_submissions" to "service_role";

grant insert on table "public"."form_submissions" to "service_role";

grant references on table "public"."form_submissions" to "service_role";

grant select on table "public"."form_submissions" to "service_role";

grant trigger on table "public"."form_submissions" to "service_role";

grant truncate on table "public"."form_submissions" to "service_role";

grant update on table "public"."form_submissions" to "service_role";


  create policy "Org admins can delete themes"
  on "public"."auth_clerk_orgs_themes"
  as permissive
  for delete
  to public
using (((org_id = ANY (public.get_current_user_org_ids())) AND public.is_admin()));



  create policy "Org admins can insert themes"
  on "public"."auth_clerk_orgs_themes"
  as permissive
  for insert
  to public
with check (((org_id = ANY (public.get_current_user_org_ids())) AND public.is_admin()));



  create policy "Org admins can update themes"
  on "public"."auth_clerk_orgs_themes"
  as permissive
  for update
  to public
using (((org_id = ANY (public.get_current_user_org_ids())) AND public.is_admin()))
with check (((org_id = ANY (public.get_current_user_org_ids())) AND public.is_admin()));



  create policy "Users can view their org themes"
  on "public"."auth_clerk_orgs_themes"
  as permissive
  for select
  to public
using ((org_id = ANY (public.get_current_user_org_ids())));



  create policy "deny all public access"
  on "public"."form_submissions"
  as permissive
  for all
  to public
using (false);



