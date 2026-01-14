drop policy "org_themes_admin_all" on "public"."auth_clerk_orgs_themes";

drop policy "org_themes_member_read" on "public"."auth_clerk_orgs_themes";


  create policy "Admins can manage bsi_distributions_transactions"
  on "public"."bsi_distributions_transactions"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.auth_clerk_users
  WHERE ((auth_clerk_users.clerk_user_id = ( SELECT (auth.jwt() ->> 'sub'::text))) AND (auth_clerk_users.role = 'admin'::public.user_role_internal)))));



  create policy "Admins can manage bsi_statements_transactions"
  on "public"."bsi_statements_transactions"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.auth_clerk_users
  WHERE ((auth_clerk_users.clerk_user_id = ( SELECT (auth.jwt() ->> 'sub'::text))) AND (auth_clerk_users.role = 'admin'::public.user_role_internal)))));



