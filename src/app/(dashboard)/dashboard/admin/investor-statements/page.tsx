import { InvestorStatementsAdmin } from "@/components/dashboard/investor-statements-table-admin";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Manage Investor Statements - Admin Dashboard",
  description: "Upload and manage investor statements",
};

export default async function InvestorStatementsAdminPage() {
  const supabase = createServerComponentClient({ cookies });

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Check if the user is an admin
  const { data: userData } = await supabase
    .from("auth_user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = userData?.role === "admin";

  if (!isAdmin) {
    // If not an admin, redirect to dashboard
    redirect("/dashboard");
  }

  return (
    <div className="container mx-auto py-8">
      <InvestorStatementsAdmin />
    </div>
  );
}
