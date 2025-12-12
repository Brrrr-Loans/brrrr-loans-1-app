/**
 * Script to fix production Clerk IDs in the database
 *
 * This script:
 * 1. Finds all users with dev Clerk IDs (user_2...) in production
 * 2. Looks up each user by email in Clerk Production
 * 3. Updates the clerk_user_id to the production value
 *
 * Prerequisites:
 * - CLERK_SECRET_KEY must be set to the PRODUCTION key (sk_live_...)
 * - NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must point to PRODUCTION
 *
 * Usage:
 *   npx tsx scripts/fix-prod-clerk-ids.ts
 *
 * Or dry-run first:
 *   DRY_RUN=true npx tsx scripts/fix-prod-clerk-ids.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Load environment variables from .env.local
function loadEnvFile() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...valueParts] = trimmed.split("=");
        const value = valueParts.join("=").replace(/^["']|["']$/g, "");
        if (key && !process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  }
}
loadEnvFile();

const DRY_RUN = process.env.DRY_RUN === "true";

// Clerk API helper
async function lookupClerkUserByEmail(
  email: string,
  clerkSecretKey: string
): Promise<{ id: string } | null> {
  const url = `https://api.clerk.com/v1/users?email_address=${encodeURIComponent(
    email
  )}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${clerkSecretKey}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Clerk API error: ${response.status} ${response.statusText}`
    );
  }

  const users = await response.json();

  if (!Array.isArray(users) || users.length === 0) {
    return null;
  }

  return { id: users[0].id };
}

async function main() {
  console.log("=".repeat(60));
  console.log("Fix Production Clerk IDs Script");
  console.log("=".repeat(60));
  console.log(`Mode: ${DRY_RUN ? "DRY RUN (no changes)" : "LIVE"}`);
  console.log("");

  // Validate environment
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const clerkSecretKey = process.env.CLERK_SECRET_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("❌ Missing Supabase environment variables");
    console.error(
      "   Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
    );
    process.exit(1);
  }

  if (!clerkSecretKey) {
    console.error("❌ Missing CLERK_SECRET_KEY");
    process.exit(1);
  }

  // Warn if using dev keys
  if (clerkSecretKey.startsWith("sk_test_")) {
    console.error("❌ CLERK_SECRET_KEY is a TEST key (sk_test_...)");
    console.error("   This script must use the PRODUCTION key (sk_live_...)");
    console.error("   to look up production Clerk IDs.");
    console.error("");
    console.error(
      "   Temporarily set CLERK_SECRET_KEY to your production key:"
    );
    console.error(
      "   CLERK_SECRET_KEY=sk_live_... npx tsx scripts/fix-prod-clerk-ids.ts"
    );
    process.exit(1);
  }

  // Check Supabase URL
  const isProdSupabase = supabaseUrl.includes("gsxggtsgqskhchcbrmhe");
  if (!isProdSupabase) {
    console.warn("⚠️  WARNING: Supabase URL doesn't look like production");
    console.warn(`   URL: ${supabaseUrl}`);
    console.warn("   Expected: gsxggtsgqskhchcbrmhe.supabase.co (production)");
    console.warn("");
    console.warn(
      "   To run against production, temporarily update .env.local or set:"
    );
    console.warn(
      "   NEXT_PUBLIC_SUPABASE_URL=https://gsxggtsgqskhchcbrmhe.supabase.co"
    );
    console.warn("");

    const readline = await import("readline");
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const answer = await new Promise<string>((resolve) => {
      rl.question("Continue anyway? (y/N): ", resolve);
    });
    rl.close();

    if (answer.toLowerCase() !== "y") {
      console.log("Aborted.");
      process.exit(0);
    }
  }

  console.log(`✓ Supabase URL: ${supabaseUrl}`);
  console.log(`✓ Clerk Key: ${clerkSecretKey.substring(0, 15)}...`);
  console.log("");

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Find users with dev Clerk IDs
  const { data: devUsers, error: fetchError } = await supabase
    .from("auth_clerk_users")
    .select("id, clerk_user_id, email, role, is_internal_yn")
    .like("clerk_user_id", "user_2%")
    .eq("is_active_yn", true);

  if (fetchError) {
    console.error("❌ Error fetching users:", fetchError);
    process.exit(1);
  }

  if (!devUsers || devUsers.length === 0) {
    console.log("✓ No users with dev Clerk IDs found. Nothing to fix!");
    return;
  }

  console.log(`Found ${devUsers.length} users with dev Clerk IDs:\n`);

  const results: {
    email: string;
    oldId: string;
    newId: string | null;
    status: string;
  }[] = [];

  for (const user of devUsers) {
    console.log(`Processing: ${user.email}`);
    console.log(`  Current ID: ${user.clerk_user_id}`);

    try {
      // Look up user by email in Clerk Production
      const clerkUser = await lookupClerkUserByEmail(
        user.email,
        clerkSecretKey
      );

      if (!clerkUser) {
        console.log(`  ⚠️  Not found in Clerk Production`);
        results.push({
          email: user.email,
          oldId: user.clerk_user_id,
          newId: null,
          status: "NOT_FOUND_IN_CLERK",
        });
        continue;
      }

      const prodClerkId = clerkUser.id;
      console.log(`  Prod ID: ${prodClerkId}`);

      if (prodClerkId === user.clerk_user_id) {
        console.log(`  ✓ Already correct`);
        results.push({
          email: user.email,
          oldId: user.clerk_user_id,
          newId: prodClerkId,
          status: "ALREADY_CORRECT",
        });
        continue;
      }

      if (DRY_RUN) {
        console.log(`  [DRY RUN] Would update to: ${prodClerkId}`);
        results.push({
          email: user.email,
          oldId: user.clerk_user_id,
          newId: prodClerkId,
          status: "WOULD_UPDATE",
        });
        continue;
      }

      // Update the clerk_user_id
      const { error: updateError } = await supabase
        .from("auth_clerk_users")
        .update({
          clerk_user_id: prodClerkId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) {
        console.log(`  ❌ Update failed: ${updateError.message}`);
        results.push({
          email: user.email,
          oldId: user.clerk_user_id,
          newId: prodClerkId,
          status: `ERROR: ${updateError.message}`,
        });
      } else {
        console.log(`  ✓ Updated successfully`);
        results.push({
          email: user.email,
          oldId: user.clerk_user_id,
          newId: prodClerkId,
          status: "UPDATED",
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.log(`  ❌ Error: ${message}`);
      results.push({
        email: user.email,
        oldId: user.clerk_user_id,
        newId: null,
        status: `ERROR: ${message}`,
      });
    }

    console.log("");
  }

  // Summary
  console.log("=".repeat(60));
  console.log("SUMMARY");
  console.log("=".repeat(60));
  console.log("");

  const updated = results.filter((r) => r.status === "UPDATED").length;
  const wouldUpdate = results.filter((r) => r.status === "WOULD_UPDATE").length;
  const notFound = results.filter(
    (r) => r.status === "NOT_FOUND_IN_CLERK"
  ).length;
  const errors = results.filter((r) => r.status.startsWith("ERROR")).length;
  const alreadyCorrect = results.filter(
    (r) => r.status === "ALREADY_CORRECT"
  ).length;

  if (DRY_RUN) {
    console.log(`Would update: ${wouldUpdate}`);
  } else {
    console.log(`Updated: ${updated}`);
  }
  console.log(`Already correct: ${alreadyCorrect}`);
  console.log(`Not found in Clerk: ${notFound}`);
  console.log(`Errors: ${errors}`);
  console.log("");

  if (notFound > 0) {
    console.log("Users not found in Clerk Production:");
    results
      .filter((r) => r.status === "NOT_FOUND_IN_CLERK")
      .forEach((r) => console.log(`  - ${r.email}`));
    console.log("");
    console.log(
      "These users either haven't signed up in production yet,\nor are using a different email address."
    );
  }

  if (DRY_RUN && wouldUpdate > 0) {
    console.log("");
    console.log("To apply changes, run without DRY_RUN:");
    console.log("  npx tsx scripts/fix-prod-clerk-ids.ts");
  }
}

main().catch(console.error);
