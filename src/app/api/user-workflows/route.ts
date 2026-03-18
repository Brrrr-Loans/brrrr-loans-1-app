import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getSupabaseClient } from "@/lib/supabase-server";
import type { UserPermissions, UserRole } from "@/types/auth";

/**
 * Multi-Step and Complex Workflows API
 * - Executes chains of user-related operations in a single call --> Uses Cases:
 *   - (1) Perform operations across multiple tables (e.g., an operation referencing values stored across multiple tables or outputs of formulas operating across multiple tables;
 *   - (2) Execute multi-step operations requiring the execution of a successive chain of events in a specifc order;
 *   - (3) Execute nested formulas;
 *   - (4) Execute conditional workflows and calculations;
 *   - (5) Execute modular workflows as constituent elements of a complex, overarching workflow to perform action(s) beyond the scope of each constituent workflow when executed in isolation;
 *
 * Examples:
 * GET /api/user-workflows?action=get-user-profile-with-permissions
 * GET /api/user-workflows?action=get-user-deals-and-distributions
 * POST /api/user-workflows with custom workflow definitions
 */

interface WorkflowResult {
  success: boolean;
  data?: unknown;
  error?: string;
  workflow: string;
  executedSteps: string[];
}

/**
 * Get complete user profile with permissions, contact info, and metadata
 */
async function getUserProfileWorkflow(userId: string): Promise<WorkflowResult> {
  const executedSteps: string[] = [];

  try {
    // Step 1: Get Clerk user data
    executedSteps.push("fetch-clerk-user");
    const user = await currentUser();
    if (!user) throw new Error("User not found in Clerk");

    // Step 2: Get Supabase profile
    executedSteps.push("fetch-supabase-profile");
    const supabase = await getSupabaseClient();
    const { data: profile, error: profileError } = await supabase
      .from("auth_clerk_users")
      .select("*")
      .eq("clerk_user_id", userId)
      .single();

    if (profileError) throw profileError;

    // Step 3: Get contact information
    executedSteps.push("fetch-contact-info");
    const { data: contact, error: contactError } = await supabase
      .from("contact")
      .select(
        `
        *,
        contact_types:contact_type_assignment(contact_type(*))
      `
      )
      .eq("auth_clerk_users_id", profile.id)
      .single();

    if (contactError) throw contactError;

    // Step 4: Calculate permissions
    executedSteps.push("calculate-permissions");

    // Validate and cast role to UserRole type
    const validRoles: UserRole[] = [
      "admin",
      "account_executive",
      "loan_processor",
      "balance_sheet_investor",
      "loan_opener",
    ];
    const userRole =
      typeof user.publicMetadata?.role === "string"
        ? (user.publicMetadata.role as string)
        : "balance_sheet_investor";
    const role: UserRole = validRoles.includes(userRole as UserRole)
      ? (userRole as UserRole)
      : "balance_sheet_investor";

    const permissions: UserPermissions = {
      userId: user.id,
      email: user.emailAddresses?.[0]?.emailAddress ?? "",
      contactType: "Balance Sheet Investor",
      role,
      contactId: contact?.id ?? 0,
      authUserProfileId: profile.id,
      canAccessDeals: true, // Calculate based on your business logic
      canAccessDistributions: true,
      canAccessDocuments: true,
      canAccessReports: true,
      canAccessAdminFeatures: role === "admin",
    };

    // Step 5: Get recent activity (optional)
    executedSteps.push("fetch-recent-activity");
    const { data: recentDeals } = await supabase
      .from("bsi_deals_clerk_users")
      .select("*, deal(*)")
      .eq("contact_id", contact?.id || 0)
      .limit(5);

    return {
      success: true,
      workflow: "get-user-profile-with-permissions",
      executedSteps,
      data: {
        clerkUser: {
          id: user.id,
          email: user.emailAddresses[0]?.emailAddress,
          firstName: user.firstName,
          lastName: user.lastName,
          metadata: user.publicMetadata,
        },
        profile,
        contact,
        permissions,
        recentDeals: recentDeals || [],
      },
    };
  } catch (error) {
    return {
      success: false,
      workflow: "get-user-profile-with-permissions",
      executedSteps,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get user's complete financial summary
 */
async function getUserFinancialSummaryWorkflow(
  userId: string
): Promise<WorkflowResult> {
  const executedSteps: string[] = [];

  try {
    // Step 1: Get user contact ID
    executedSteps.push("fetch-user-contact");
    const supabase = await getSupabaseClient();
    const { data: profile } = await supabase
      .from("auth_clerk_users")
      .select("id")
      .eq("clerk_user_id", userId)
      .single();

    if (!profile) throw new Error("User profile not found");

    const { data: contact } = await supabase
      .from("contact")
      .select("id")
      .eq("auth_clerk_users_id", profile.id)
      .single();

    if (!contact) throw new Error("Contact not found");

    // Step 2: Get all deals (note: bsi_deals_clerk_users is junction table, deal info comes from distributions)
    executedSteps.push("fetch-user-deals");
    const { data: deals } = await supabase
      .from("bsi_deals_clerk_users")
      .select("deal_id, contact_id")
      .eq("contact_id", contact.id);

    // Step 3: Get all distributions
    executedSteps.push("fetch-user-distributions");
    const { data: distributions } = await supabase
      .from("bsi_distributions")
      .select("*")
      .eq("user_id", profile.id);

    // Step 4: Get statements
    executedSteps.push("fetch-user-statements");
    const { data: statements } = await supabase
      .from("bsi_statements")
      .select("*")
      .eq("auth_clerk_users_id", profile.id);

    // Step 5: Calculate summary metrics
    executedSteps.push("calculate-summary-metrics");
    const totalInvested =
      distributions?.reduce(
        (sum, dist) => sum + (dist.capital_contribution || 0),
        0
      ) || 0;
    const totalDistributions =
      distributions?.reduce(
        (sum, dist) => sum + (dist.deposit_amount || 0),
        0
      ) || 0;
    const activeDealsCount = deals?.length || 0; // Simplified since we can't access deal status from junction table

    return {
      success: true,
      workflow: "get-user-financial-summary",
      executedSteps,
      data: {
        summary: {
          totalInvested,
          totalDistributions,
          activeDealsCount,
          totalDealsCount: deals?.length || 0,
          netPosition: totalInvested - totalDistributions,
        },
        deals: deals || [],
        distributions: distributions || [],
        statements: statements || [],
      },
    };
  } catch (error) {
    return {
      success: false,
      workflow: "get-user-financial-summary",
      executedSteps,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const action = url.searchParams.get("action");

    let result: WorkflowResult;

    switch (action) {
      case "get-user-profile-with-permissions":
        result = await getUserProfileWorkflow(userId);
        break;

      case "get-user-financial-summary":
        result = await getUserFinancialSummaryWorkflow(userId);
        break;

      default:
        return NextResponse.json(
          { error: "Invalid action parameter" },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Workflow API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Handle custom workflow definitions
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { workflow, steps } = await request.json();

    // Here you could implement custom workflow execution
    // based on the provided steps array

    return NextResponse.json({
      success: true,
      message: "Custom workflows not yet implemented",
      receivedWorkflow: workflow,
      receivedSteps: steps,
    });
  } catch (error) {
    console.error("Custom workflow error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
