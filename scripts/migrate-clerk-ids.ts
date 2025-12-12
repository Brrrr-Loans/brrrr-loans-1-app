/**
 * Migration Script: Update clerk_user_id from Development to Production
 * 
 * This script:
 * 1. Fetches all users from Clerk Production
 * 2. Matches them to existing Supabase records by email
 * 3. Updates the clerk_user_id to the new production ID
 * 
 * Usage:
 *   npx tsx scripts/migrate-clerk-ids.ts
 * 
 * Required env vars:
 *   - CLERK_SECRET_KEY (production sk_live_...)
 *   - SUPABASE_SERVICE_ROLE_KEY
 *   - NEXT_PUBLIC_SUPABASE_URL
 */

import { createClient } from "@supabase/supabase-js";

// Load environment variables
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!CLERK_SECRET_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing required environment variables:");
  console.error("  CLERK_SECRET_KEY:", CLERK_SECRET_KEY ? "✓" : "✗");
  console.error("  NEXT_PUBLIC_SUPABASE_URL:", SUPABASE_URL ? "✓" : "✗");
  console.error("  SUPABASE_SERVICE_ROLE_KEY:", SUPABASE_SERVICE_ROLE_KEY ? "✓" : "✗");
  process.exit(1);
}

// Initialize Supabase client with service role
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface ClerkUser {
  id: string;
  email_addresses: Array<{ email_address: string }>;
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
  has_image: boolean;
}

interface SupabaseUser {
  id: number;
  clerk_user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
}

async function fetchClerkUsers(): Promise<ClerkUser[]> {
  const allUsers: ClerkUser[] = [];
  let offset = 0;
  const limit = 100;

  console.log("📥 Fetching users from Clerk Production...");

  while (true) {
    const response = await fetch(
      `https://api.clerk.com/v1/users?limit=${limit}&offset=${offset}`,
      {
        headers: {
          Authorization: `Bearer ${CLERK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Clerk API error: ${response.status} ${response.statusText}`);
    }

    const users: ClerkUser[] = await response.json();
    
    if (users.length === 0) break;
    
    allUsers.push(...users);
    console.log(`   Fetched ${allUsers.length} users...`);
    
    if (users.length < limit) break;
    offset += limit;
  }

  console.log(`✅ Total Clerk users: ${allUsers.length}`);
  return allUsers;
}

async function fetchSupabaseUsers(): Promise<SupabaseUser[]> {
  console.log("📥 Fetching users from Supabase...");
  
  const { data, error } = await supabase
    .from("auth_clerk_users")
    .select("id, clerk_user_id, email, first_name, last_name");

  if (error) {
    throw new Error(`Supabase error: ${error.message}`);
  }

  console.log(`✅ Total Supabase users: ${data?.length || 0}`);
  return data || [];
}

async function migrateClerkIds() {
  console.log("\n🚀 Starting Clerk ID Migration\n");
  console.log("=".repeat(50));

  // Fetch all users
  const clerkUsers = await fetchClerkUsers();
  const supabaseUsers = await fetchSupabaseUsers();

  // Create email -> Clerk user map
  const clerkUsersByEmail = new Map<string, ClerkUser>();
  for (const user of clerkUsers) {
    const email = user.email_addresses[0]?.email_address?.toLowerCase();
    if (email) {
      clerkUsersByEmail.set(email, user);
    }
  }

  // Track results
  const results = {
    matched: 0,
    updated: 0,
    alreadyCorrect: 0,
    notFoundInClerk: 0,
    errors: 0,
  };

  console.log("\n📊 Processing migrations...\n");

  for (const sbUser of supabaseUsers) {
    const email = sbUser.email?.toLowerCase();
    const clerkUser = clerkUsersByEmail.get(email);

    if (!clerkUser) {
      console.log(`⚠️  No Clerk user found for: ${email}`);
      results.notFoundInClerk++;
      continue;
    }

    results.matched++;
    const oldClerkId = sbUser.clerk_user_id;
    const newClerkId = clerkUser.id;

    // Check if already correct
    if (oldClerkId === newClerkId) {
      console.log(`✓  Already correct: ${email}`);
      results.alreadyCorrect++;
      continue;
    }

    // Update the clerk_user_id
    console.log(`🔄 Updating: ${email}`);
    console.log(`   Old ID: ${oldClerkId}`);
    console.log(`   New ID: ${newClerkId}`);

    const { error } = await supabase
      .from("auth_clerk_users")
      .update({
        clerk_user_id: newClerkId,
        image_url: clerkUser.image_url,
        has_image: clerkUser.has_image,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sbUser.id);

    if (error) {
      console.error(`   ❌ Error: ${error.message}`);
      results.errors++;
    } else {
      console.log(`   ✅ Updated successfully`);
      results.updated++;
    }
  }

  // Print summary
  console.log("\n" + "=".repeat(50));
  console.log("📋 Migration Summary\n");
  console.log(`   Total Supabase users: ${supabaseUsers.length}`);
  console.log(`   Matched to Clerk:     ${results.matched}`);
  console.log(`   Already correct:      ${results.alreadyCorrect}`);
  console.log(`   Updated:              ${results.updated}`);
  console.log(`   Not found in Clerk:   ${results.notFoundInClerk}`);
  console.log(`   Errors:               ${results.errors}`);
  console.log("\n✅ Migration complete!\n");
}

// Run the migration
migrateClerkIds().catch((error) => {
  console.error("❌ Migration failed:", error);
  process.exit(1);
});

