drop policy "Public can view roles" on "public"."roles";

drop policy "Service role can delete roles" on "public"."roles";

drop policy "Service role can insert roles" on "public"."roles";

drop policy "Service role can update roles" on "public"."roles";

drop policy "Public can view users_roles" on "public"."users_roles";

drop policy "Service role can delete users_roles" on "public"."users_roles";

drop policy "Service role can insert users_roles" on "public"."users_roles";

drop policy "Service role can update users_roles" on "public"."users_roles";

revoke delete on table "public"."roles" from "anon";

revoke insert on table "public"."roles" from "anon";

revoke references on table "public"."roles" from "anon";

revoke select on table "public"."roles" from "anon";

revoke trigger on table "public"."roles" from "anon";

revoke truncate on table "public"."roles" from "anon";

revoke update on table "public"."roles" from "anon";

revoke delete on table "public"."roles" from "authenticated";

revoke insert on table "public"."roles" from "authenticated";

revoke references on table "public"."roles" from "authenticated";

revoke select on table "public"."roles" from "authenticated";

revoke trigger on table "public"."roles" from "authenticated";

revoke truncate on table "public"."roles" from "authenticated";

revoke update on table "public"."roles" from "authenticated";

revoke delete on table "public"."roles" from "service_role";

revoke insert on table "public"."roles" from "service_role";

revoke references on table "public"."roles" from "service_role";

revoke select on table "public"."roles" from "service_role";

revoke trigger on table "public"."roles" from "service_role";

revoke truncate on table "public"."roles" from "service_role";

revoke update on table "public"."roles" from "service_role";

revoke delete on table "public"."users_roles" from "anon";

revoke insert on table "public"."users_roles" from "anon";

revoke references on table "public"."users_roles" from "anon";

revoke select on table "public"."users_roles" from "anon";

revoke trigger on table "public"."users_roles" from "anon";

revoke truncate on table "public"."users_roles" from "anon";

revoke update on table "public"."users_roles" from "anon";

revoke delete on table "public"."users_roles" from "authenticated";

revoke insert on table "public"."users_roles" from "authenticated";

revoke references on table "public"."users_roles" from "authenticated";

revoke select on table "public"."users_roles" from "authenticated";

revoke trigger on table "public"."users_roles" from "authenticated";

revoke truncate on table "public"."users_roles" from "authenticated";

revoke update on table "public"."users_roles" from "authenticated";

revoke delete on table "public"."users_roles" from "service_role";

revoke insert on table "public"."users_roles" from "service_role";

revoke references on table "public"."users_roles" from "service_role";

revoke select on table "public"."users_roles" from "service_role";

revoke trigger on table "public"."users_roles" from "service_role";

revoke truncate on table "public"."users_roles" from "service_role";

revoke update on table "public"."users_roles" from "service_role";

alter table "public"."users_roles" drop constraint "users_roles_role_id_fkey";

alter table "public"."users_roles" drop constraint "users_roles_user_id_fkey";

alter table "public"."roles" drop constraint "roles_pkey";

alter table "public"."users_roles" drop constraint "users_roles_pkey";

drop index if exists "public"."roles_pkey";

drop index if exists "public"."users_roles_pkey";

drop index if exists "public"."users_roles_role_id_idx";

drop index if exists "public"."users_roles_user_id_idx";

drop table "public"."roles";

drop table "public"."users_roles";


  create table "public"."weweb_auth_roles" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "created_at" timestamp with time zone default CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone default CURRENT_TIMESTAMP
      );


alter table "public"."weweb_auth_roles" enable row level security;


  create table "public"."weweb_auth_users_roles" (
    "id" uuid not null default gen_random_uuid(),
    "role_id" uuid not null,
    "user_id" uuid not null,
    "created_at" timestamp with time zone default CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone default CURRENT_TIMESTAMP
      );


alter table "public"."weweb_auth_users_roles" enable row level security;

CREATE UNIQUE INDEX roles_pkey ON public.weweb_auth_roles USING btree (id);

CREATE UNIQUE INDEX users_roles_pkey ON public.weweb_auth_users_roles USING btree (id);

CREATE INDEX users_roles_role_id_idx ON public.weweb_auth_users_roles USING btree (role_id);

CREATE INDEX users_roles_user_id_idx ON public.weweb_auth_users_roles USING btree (user_id);

alter table "public"."weweb_auth_roles" add constraint "roles_pkey" PRIMARY KEY using index "roles_pkey";

alter table "public"."weweb_auth_users_roles" add constraint "users_roles_pkey" PRIMARY KEY using index "users_roles_pkey";

alter table "public"."weweb_auth_users_roles" add constraint "users_roles_role_id_fkey" FOREIGN KEY (role_id) REFERENCES public.weweb_auth_roles(id) ON DELETE CASCADE not valid;

alter table "public"."weweb_auth_users_roles" validate constraint "users_roles_role_id_fkey";

alter table "public"."weweb_auth_users_roles" add constraint "users_roles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."weweb_auth_users_roles" validate constraint "users_roles_user_id_fkey";

grant delete on table "public"."weweb_auth_roles" to "anon";

grant insert on table "public"."weweb_auth_roles" to "anon";

grant references on table "public"."weweb_auth_roles" to "anon";

grant select on table "public"."weweb_auth_roles" to "anon";

grant trigger on table "public"."weweb_auth_roles" to "anon";

grant truncate on table "public"."weweb_auth_roles" to "anon";

grant update on table "public"."weweb_auth_roles" to "anon";

grant delete on table "public"."weweb_auth_roles" to "authenticated";

grant insert on table "public"."weweb_auth_roles" to "authenticated";

grant references on table "public"."weweb_auth_roles" to "authenticated";

grant select on table "public"."weweb_auth_roles" to "authenticated";

grant trigger on table "public"."weweb_auth_roles" to "authenticated";

grant truncate on table "public"."weweb_auth_roles" to "authenticated";

grant update on table "public"."weweb_auth_roles" to "authenticated";

grant delete on table "public"."weweb_auth_roles" to "service_role";

grant insert on table "public"."weweb_auth_roles" to "service_role";

grant references on table "public"."weweb_auth_roles" to "service_role";

grant select on table "public"."weweb_auth_roles" to "service_role";

grant trigger on table "public"."weweb_auth_roles" to "service_role";

grant truncate on table "public"."weweb_auth_roles" to "service_role";

grant update on table "public"."weweb_auth_roles" to "service_role";

grant delete on table "public"."weweb_auth_users_roles" to "anon";

grant insert on table "public"."weweb_auth_users_roles" to "anon";

grant references on table "public"."weweb_auth_users_roles" to "anon";

grant select on table "public"."weweb_auth_users_roles" to "anon";

grant trigger on table "public"."weweb_auth_users_roles" to "anon";

grant truncate on table "public"."weweb_auth_users_roles" to "anon";

grant update on table "public"."weweb_auth_users_roles" to "anon";

grant delete on table "public"."weweb_auth_users_roles" to "authenticated";

grant insert on table "public"."weweb_auth_users_roles" to "authenticated";

grant references on table "public"."weweb_auth_users_roles" to "authenticated";

grant select on table "public"."weweb_auth_users_roles" to "authenticated";

grant trigger on table "public"."weweb_auth_users_roles" to "authenticated";

grant truncate on table "public"."weweb_auth_users_roles" to "authenticated";

grant update on table "public"."weweb_auth_users_roles" to "authenticated";

grant delete on table "public"."weweb_auth_users_roles" to "service_role";

grant insert on table "public"."weweb_auth_users_roles" to "service_role";

grant references on table "public"."weweb_auth_users_roles" to "service_role";

grant select on table "public"."weweb_auth_users_roles" to "service_role";

grant trigger on table "public"."weweb_auth_users_roles" to "service_role";

grant truncate on table "public"."weweb_auth_users_roles" to "service_role";

grant update on table "public"."weweb_auth_users_roles" to "service_role";


  create policy "Public can view roles"
  on "public"."weweb_auth_roles"
  as permissive
  for select
  to authenticated, anon
using (true);



  create policy "Service role can delete roles"
  on "public"."weweb_auth_roles"
  as permissive
  for delete
  to service_role
using (true);



  create policy "Service role can insert roles"
  on "public"."weweb_auth_roles"
  as permissive
  for insert
  to service_role
with check (true);



  create policy "Service role can update roles"
  on "public"."weweb_auth_roles"
  as permissive
  for update
  to service_role
using (true)
with check (true);



  create policy "Public can view users_roles"
  on "public"."weweb_auth_users_roles"
  as permissive
  for select
  to authenticated, anon
using (true);



  create policy "Service role can delete users_roles"
  on "public"."weweb_auth_users_roles"
  as permissive
  for delete
  to service_role
using (true);



  create policy "Service role can insert users_roles"
  on "public"."weweb_auth_users_roles"
  as permissive
  for insert
  to service_role
with check (true);



  create policy "Service role can update users_roles"
  on "public"."weweb_auth_users_roles"
  as permissive
  for update
  to service_role
using (true)
with check (true);



