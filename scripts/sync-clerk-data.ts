/**
 * One-time script to sync existing Clerk users and organizations to Supabase
 * Run this to sync data that was created before webhooks were properly configured
 */

import { createClerkClient } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "../src/lib/supabase-server";

// Initialize Clerk client
const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

async function syncExistingClerkData() {
  const supabase = createServiceRoleClient();

  console.log("🚀 Starting sync of existing Clerk data...");

  try {
    // 1. Sync all users
    console.log("\n📧 Syncing users...");
    const usersResponse = await clerkClient.users.getUserList({ limit: 100 });
    const users = usersResponse.data || usersResponse; // Handle both v5 and v6 formats

    for (const user of users) {
      const primaryEmail = user.emailAddresses?.[0]?.emailAddress;
      if (!primaryEmail) continue;

      // Extract phone number (primary phone number)
      const primaryPhone = user.phoneNumbers?.[0]?.phoneNumber || null;

      // Generate username from email (recommended best practice)
      const username = primaryEmail.split("@")[0].toLowerCase();

      // Map Clerk roles to valid database enum values
      const customRole = user.publicMetadata?.role as string;

      let dbRole: string;

      // Map Clerk's built-in and custom roles to database enum
      if (customRole === "admin" || customRole === "Admin") {
        dbRole = "admin";
      } else if (customRole === "account_executive") {
        dbRole = "account_executive";
      } else if (customRole === "loan_processor") {
        dbRole = "loan_processor";
      } else if (customRole === "loan_opener") {
        dbRole = "loan_opener";
      } else if (customRole === "balance_sheet_investor") {
        dbRole = "balance_sheet_investor";
      } else {
        // Default for external users (including users with no custom role set)
        dbRole = "balance_sheet_investor";
      }

      // Upsert user (idempotent - safe for re-runs)
      const { error } = await supabase
        .from("auth_clerk_users")
        .upsert(
          {
            clerk_user_id: user.id,
            email: primaryEmail,
            clerk_username: username,
            first_name: user.firstName || null,
            last_name: user.lastName || null,
            phone_number: primaryPhone,
            role: dbRole as
              | "admin"
              | "account_executive"
              | "loan_processor"
              | "loan_opener"
              | "balance_sheet_investor"
              | null,
            is_internal_yn: false,
            is_active_yn: true,
            image_url: user.imageUrl || null,
            has_image: user.hasImage || false,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "clerk_user_id" }
        );

      if (error) {
        console.error(`  ❌ Error syncing user ${primaryEmail}:`, error);
      } else {
        console.log(`  ✅ Synced user: ${primaryEmail}`);
      }
    }

    // 2. Sync all organizations
    console.log("\n🏢 Syncing organizations...");
    const orgsResponse = await clerkClient.organizations.getOrganizationList({
      limit: 100,
    });
    const orgs = orgsResponse.data || orgsResponse; // Handle both v5 and v6 formats

    for (const org of orgs) {
      // Upsert organization (idempotent)
      const { error } = await supabase
        .from("auth_clerk_orgs")
        .upsert(
          {
            clerk_org_id: org.id,
            clerk_org_name: org.name,
            clerk_org_slug: org.slug,
            created_by_clerk_user_id: org.createdBy || "",
            updated_at: new Date().toISOString(),
          },
          { onConflict: "clerk_org_id" }
        );

      if (error) {
        console.error(`  ❌ Error syncing org ${org.name}:`, error);
      } else {
        console.log(`  ✅ Synced org: ${org.name}`);
      }
    }

    // 3. Sync organization memberships
    console.log("\n👥 Syncing organization memberships...");
    for (const org of orgs) {
      const membershipsResponse =
        await clerkClient.organizations.getOrganizationMembershipList({
          organizationId: org.id,
          limit: 100,
        });
      const memberships = membershipsResponse.data || membershipsResponse; // Handle both v5 and v6 formats

      for (const membership of memberships) {
        // Skip if no public user data
        if (!membership.publicUserData?.userId) {
          console.log(`  ⚠️  Skipping membership - missing public user data`);
          continue;
        }

        // Get our internal user ID
        const { data: user } = await supabase
          .from("auth_clerk_users")
          .select("id")
          .eq("clerk_user_id", membership.publicUserData.userId)
          .single();

        // Get our internal org ID
        const { data: orgData } = await supabase
          .from("auth_clerk_orgs")
          .select("id")
          .eq("clerk_org_id", org.id)
          .single();

        if (!user || !orgData) {
          console.log(`  ⚠️  Skipping membership - missing user or org data`);
          continue;
        }

        // Upsert membership (idempotent)
        const { error } = await supabase
          .from("auth_clerk_orgs_members")
          .upsert(
            {
              auth_clerk_users_id: user.id,
              clerk_org_id: orgData.id,
              clerk_org_role: membership.role as "admin" | "member",
            },
            { onConflict: "auth_clerk_users_id,clerk_org_id" }
          );

        if (error) {
          console.error(`  ❌ Error syncing membership:`, error);
        } else {
          console.log(`  ✅ Synced membership: ${membership.publicUserData?.identifier} → ${org.name}`);
        }
      }
    }

    console.log("\n🎉 Sync completed successfully!");

    // Show final counts
    const { data: userCount } = await supabase
      .from("auth_clerk_users")
      .select("id", { count: "exact" });
    const { data: orgCount } = await supabase
      .from("auth_clerk_orgs")
      .select("id", { count: "exact" });
    const { data: memberCount } = await supabase
      .from("auth_clerk_orgs_members")
      .select("id", { count: "exact" });

    console.log(`\n📊 Final counts:
  • Users: ${userCount?.length || 0}
  • Organizations: ${orgCount?.length || 0}
  • Memberships: ${memberCount?.length || 0}`);
  } catch (error) {
    console.error("❌ Sync failed:", error);
    throw error;
  }
}

// Run the sync if this script is executed directly
if (require.main === module) {
  syncExistingClerkData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { syncExistingClerkData };
