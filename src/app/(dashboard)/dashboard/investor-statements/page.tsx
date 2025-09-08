import { InvestorStatementsList } from "@/components/dashboard/bsi-statements-table";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Investor Statements - Balance Sheet Lender Portal",
  description: "View and download your investor statements",
};

export default async function InvestorStatementsPage() {
  const supabase = createServerComponentClient({ cookies });

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Get user profile to check if they're a balance sheet investor or admin
  const { data: authUserProfile, error: profileError } = await supabase
    .from("auth_clerk_users")
    .select("clerk_role")
    .eq("clerk_user_id", user.id)
    .single();

  // Check if the user is a Balance Sheet Investor (type_id = 12)
  const isInvestor = authUserProfile?.clerk_role === "Balance Sheet Investor";

  // Check if user is admin
  const { data: userData } = await supabase
    .from("auth_clerk_users")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = userData?.role === "admin";

  // If neither investor nor admin, redirect to dashboard
  if (!isInvestor && !isAdmin) {
    redirect("/dashboard");
  }

  // Get user's organizations if they are a balance sheet investor
  let userOrgs = null;
  if (isInvestor) {
    const { data: orgsData } = await supabase
      .from("user_clerk_org_members")
      .select("org_id")
      .eq("user_id", user.id);

    userOrgs = orgsData;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Investor Statements</h1>

      {/* If user belongs to organizations, show statements for each organization */}
      {userOrgs && userOrgs.length > 0 && (
        <div className="mb-8 space-y-8">
          <h2 className="text-2xl font-semibold">Your Individual Statements</h2>
          <InvestorStatementsList investorId={authUserProfile?.id} />

          <h2 className="text-2xl font-semibold mt-12">
            Your Organization Statements
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            As a member of organizations, you can also view statements for those
            entities.
          </p>

          {/* We'll only show statements for ALL organizations in one list */}
          <InvestorStatementsList />
        </div>
      )}

      {/* If user doesn't belong to organizations or is admin, show a single statements view */}
      {(!userOrgs || userOrgs.length === 0 || isAdmin) && (
        <InvestorStatementsList
          investorId={isInvestor ? authUserProfile?.id : undefined}
        />
      )}
    </div>
  );
}
