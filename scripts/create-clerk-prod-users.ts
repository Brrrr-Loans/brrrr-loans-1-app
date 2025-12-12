/**
 * Migration Script: Create Clerk Production Users from Supabase Records
 * 
 * This script:
 * 1. Finds all Supabase users not in Clerk Production
 * 2. Creates them in Clerk Production via API
 * 3. Updates Supabase with the new production clerk_user_id
 * 
 * Usage:
 *   npx tsx scripts/create-clerk-prod-users.ts
 * 
 * Required env vars:
 *   - CLERK_SECRET_KEY (production sk_live_...)
 *   - SUPABASE_SERVICE_ROLE_KEY
 *   - NEXT_PUBLIC_SUPABASE_URL
 */

import { createClient } from "@supabase/supabase-js";

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!CLERK_SECRET_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing required environment variables");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface SupabaseUser {
  id: number;
  clerk_user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
}

interface ClerkUser {
  id: string;
  email_addresses: Array<{ email_address: string }>;
}

// Emails of users already in Clerk Production (from previous migration)
const ALREADY_MIGRATED = new Set([
  "akraut@brrrr.com",
  "clesnik@brrrr.com", 
  "jkraut@brrrr.com",
]);

async function fetchClerkProductionEmails(): Promise<Set<string>> {
  const emails = new Set<string>();
  let offset = 0;
  const limit = 100;

  console.log("📥 Fetching existing Clerk Production users...");

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
      throw new Error(`Clerk API error: ${response.status}`);
    }

    const users: ClerkUser[] = await response.json();
    if (users.length === 0) break;

    for (const user of users) {
      const email = user.email_addresses[0]?.email_address?.toLowerCase();
      if (email) emails.add(email);
    }

    if (users.length < limit) break;
    offset += limit;
  }

  console.log(`✅ Found ${emails.size} users in Clerk Production`);
  return emails;
}

async function fetchSupabaseUsers(): Promise<SupabaseUser[]> {
  console.log("📥 Fetching Supabase users...");
  
  const { data, error } = await supabase
    .from("auth_clerk_users")
    .select("id, clerk_user_id, email, first_name, last_name, phone_number");

  if (error) throw new Error(`Supabase error: ${error.message}`);
  
  console.log(`✅ Found ${data?.length || 0} users in Supabase`);
  return data || [];
}

async function createClerkUser(user: SupabaseUser): Promise<string | null> {
  // Generate a temporary password (user will need to reset)
  const tempPassword = `Temp${Math.random().toString(36).slice(2)}!${Date.now()}`;

  const payload: Record<string, unknown> = {
    email_address: [user.email],
    first_name: user.first_name || "User",
    last_name: user.last_name || "",
    password: tempPassword,
    skip_password_checks: true,
    skip_password_requirement: false,
  };

  // Add phone if available
  if (user.phone_number) {
    payload.phone_number = [user.phone_number];
  }

  const response = await fetch("https://api.clerk.com/v1/users", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${CLERK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error(`   ❌ Failed to create: ${JSON.stringify(errorData)}`);
    return null;
  }

  const createdUser = await response.json();
  return createdUser.id;
}

async function updateSupabaseClerkId(
  supabaseId: number,
  newClerkId: string,
  email: string
): Promise<boolean> {
  // First, fetch the user's image from Clerk
  const response = await fetch(`https://api.clerk.com/v1/users/${newClerkId}`, {
    headers: {
      Authorization: `Bearer ${CLERK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
  });

  let imageUrl: string | null = null;
  let hasImage = false;
  
  if (response.ok) {
    const clerkUser = await response.json();
    imageUrl = clerkUser.image_url || null;
    hasImage = clerkUser.has_image || false;
  }

  const { error } = await supabase
    .from("auth_clerk_users")
    .update({
      clerk_user_id: newClerkId,
      image_url: imageUrl,
      has_image: hasImage,
      updated_at: new Date().toISOString(),
    })
    .eq("id", supabaseId);

  if (error) {
    console.error(`   ❌ Failed to update Supabase for ${email}: ${error.message}`);
    return false;
  }

  return true;
}

async function migrateUsers() {
  console.log("\n🚀 Starting User Migration to Clerk Production\n");
  console.log("=".repeat(60));

  // Get existing Clerk Production emails
  const clerkEmails = await fetchClerkProductionEmails();
  
  // Get all Supabase users
  const supabaseUsers = await fetchSupabaseUsers();

  // Find users to migrate
  const usersToMigrate = supabaseUsers.filter((user) => {
    const email = user.email?.toLowerCase();
    return email && !clerkEmails.has(email) && !ALREADY_MIGRATED.has(email);
  });

  console.log(`\n📊 Found ${usersToMigrate.length} users to migrate\n`);

  if (usersToMigrate.length === 0) {
    console.log("✅ All users already migrated!");
    return;
  }

  const results = {
    created: 0,
    failed: 0,
    skipped: 0,
  };

  for (const user of usersToMigrate) {
    console.log(`\n🔄 Migrating: ${user.email}`);
    console.log(`   Name: ${user.first_name} ${user.last_name}`);
    console.log(`   Old Clerk ID: ${user.clerk_user_id}`);

    // Create user in Clerk Production
    const newClerkId = await createClerkUser(user);
    
    if (!newClerkId) {
      results.failed++;
      continue;
    }

    console.log(`   New Clerk ID: ${newClerkId}`);

    // Update Supabase with new Clerk ID
    const updated = await updateSupabaseClerkId(user.id, newClerkId, user.email);
    
    if (updated) {
      console.log(`   ✅ Successfully migrated!`);
      results.created++;
    } else {
      results.failed++;
    }

    // Rate limiting - Clerk has limits
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📋 Migration Summary\n");
  console.log(`   Total to migrate:  ${usersToMigrate.length}`);
  console.log(`   Created & linked:  ${results.created}`);
  console.log(`   Failed:            ${results.failed}`);
  console.log("\n✅ Migration complete!\n");

  if (results.created > 0) {
    console.log("⚠️  Note: Users were created with temporary passwords.");
    console.log("   They will need to use 'Forgot Password' to set their own password.\n");
  }
}

migrateUsers().catch((error) => {
  console.error("❌ Migration failed:", error);
  process.exit(1);
});

