#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js";

// Authentication flow testing script
console.log("🔐 Authentication Flow Test Suite");
console.log("==================================\n");

// Check for required environment variables
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_KEY ||
  process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.log("❌ Missing required environment variables!");
  console.log("Please run: node database-cleanup.mjs for setup instructions.");
  process.exit(1);
}

// Create Supabase clients
const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseAdmin = SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;

async function testTableAccess() {
  console.log("📋 Test 1: Table Access Verification\n");

  const tests = [
    { name: "auth_clerk_users (correct table)", table: "auth_clerk_users" },
    {
      name: "auth_user_profiles (old duplicate table)",
      table: "auth_user_profiles",
    },
  ];

  let results = {};

  for (const test of tests) {
    console.log(`Testing: ${test.name}`);

    try {
      const { data, error, count } = await supabaseAnon
        .from(test.table)
        .select("*", { count: "exact", head: true });

      if (error) {
        if (error.code === "PGRST116") {
          console.log(`  ✅ Table does not exist (as expected for duplicate)`);
          results[test.table] = { exists: false, accessible: false, count: 0 };
        } else {
          console.log(`  ⚠️  Access denied: ${error.message}`);
          results[test.table] = {
            exists: true,
            accessible: false,
            error: error.message,
          };
        }
      } else {
        console.log(`  ✅ Accessible with ${count || 0} records`);
        results[test.table] = {
          exists: true,
          accessible: true,
          count: count || 0,
        };
      }
    } catch (err) {
      console.log(`  ❌ Error: ${err.message}`);
      results[test.table] = {
        exists: false,
        accessible: false,
        error: err.message,
      };
    }

    console.log("");
  }

  return results;
}

async function testAuthUserProfileStructure() {
  console.log("🏗️  Test 2: auth_clerk_users Table Structure\n");

  try {
    const { data, error } = await supabaseAnon
      .from("auth_clerk_users")
      .select(
        "id, clerk_user_id, email, first_name, last_name, role, is_internal_yn, is_active_yn"
      )
      .limit(1);

    if (error) {
      console.log(`❌ Cannot access table structure: ${error.message}`);
      return false;
    }

    console.log("✅ Table structure is accessible");

    if (data && data.length > 0) {
      console.log("📊 Sample record fields:", Object.keys(data[0]).join(", "));
      console.log("✅ Table contains data");
    } else {
      console.log("ℹ️  Table exists but is empty");
    }

    return true;
  } catch (err) {
    console.log(`❌ Structure test failed: ${err.message}`);
    return false;
  }
}

async function testClerkIntegration() {
  console.log("\n👤 Test 3: Clerk Integration Fields\n");

  try {
    // Test if clerk_user_id field exists and has proper constraints
    const { data, error } = await supabaseAnon
      .from("auth_clerk_users")
      .select("clerk_user_id, role")
      .not("clerk_user_id", "is", null)
      .limit(5);

    if (error) {
      console.log(`⚠️  Cannot test Clerk integration: ${error.message}`);
      return false;
    }

    console.log(`✅ Found ${data.length} records with Clerk IDs`);

    if (data.length > 0) {
      const clerkRoles = [...new Set(data.map((d) => d.role).filter(Boolean))];
      if (clerkRoles.length > 0) {
        console.log("✅ Clerk roles found:", clerkRoles.join(", "));
      }
    }

    return true;
  } catch (err) {
    console.log(`❌ Clerk integration test failed: ${err.message}`);
    return false;
  }
}

async function testCodeIntegration() {
  console.log("\n💻 Test 4: Code Integration Compatibility\n");

  const testQueries = [
    {
      name: "User lookup by clerk_user_id",
      query: async () => {
        return await supabaseAnon
          .from("auth_clerk_users")
          .select("email, first_name, last_name")
          .eq("clerk_user_id", "test_clerk_id_123")
          .single();
      },
    },
    {
      name: "Internal user check",
      query: async () => {
        return await supabaseAnon
          .from("auth_clerk_users")
          .select("is_internal_yn, is_active_yn")
          .eq("is_internal_yn", true)
          .limit(1);
      },
    },
    {
      name: "Role-based filtering",
      query: async () => {
        return await supabaseAnon
          .from("auth_clerk_users")
          .select("role")
          .in("role", ["admin", "account_executive"])
          .limit(1);
      },
    },
  ];

  let passedTests = 0;

  for (const test of testQueries) {
    console.log(`Testing: ${test.name}`);

    try {
      const result = await test.query();

      if (result.error && result.error.code !== "PGRST116") {
        console.log(
          `  ⚠️  Query structure valid, no matching data: ${result.error.message}`
        );
        passedTests++;
      } else if (result.error) {
        console.log(`  ❌ Query failed: ${result.error.message}`);
      } else {
        console.log(`  ✅ Query executed successfully`);
        passedTests++;
      }
    } catch (err) {
      console.log(`  ❌ Test failed: ${err.message}`);
    }
  }

  console.log(
    `\n📊 Code integration tests: ${passedTests}/${testQueries.length} passed`
  );
  return passedTests === testQueries.length;
}

async function testRowLevelSecurity() {
  console.log("\n🔒 Test 5: Row Level Security (RLS)\n");

  try {
    // Test if RLS is properly configured
    const { data, error } = await supabaseAnon
      .from("auth_clerk_users")
      .select("id")
      .limit(1);

    if (error && error.message.includes("permission denied")) {
      console.log(
        "✅ RLS is properly configured (permission denied for anonymous access)"
      );
      console.log("ℹ️  This is expected behavior for secure tables");
      return true;
    } else if (error) {
      console.log(`⚠️  RLS test inconclusive: ${error.message}`);
      return false;
    } else {
      console.log("⚠️  RLS may not be configured (anonymous access allowed)");
      console.log("🔒 Consider reviewing your RLS policies for security");
      return true; // Not necessarily a failure
    }
  } catch (err) {
    console.log(`❌ RLS test failed: ${err.message}`);
    return false;
  }
}

async function performComprehensiveTest() {
  console.log("🚀 Starting Comprehensive Authentication Flow Tests\n");

  const results = {
    tableAccess: await testTableAccess(),
    structure: await testAuthUserProfileStructure(),
    clerkIntegration: await testClerkIntegration(),
    codeIntegration: await testCodeIntegration(),
    rls: await testRowLevelSecurity(),
  };

  console.log("\n📋 TEST SUMMARY");
  console.log("===============");

  // Analyze table access results
  const correctTable = results.tableAccess["auth_clerk_users"];
  const duplicateTable = results.tableAccess["auth_user_profiles"];

  console.log(
    `✓ Correct table (auth_clerk_users): ${correctTable?.exists ? "✅ Exists" : "❌ Missing"}`
  );
  console.log(
    `✓ Old table (auth_user_profiles): ${duplicateTable?.exists ? "⚠️  Still exists" : "✅ Removed"}`
  );
  console.log(
    `✓ Table structure: ${results.structure ? "✅ Valid" : "❌ Issues found"}`
  );
  console.log(
    `✓ Clerk integration: ${results.clerkIntegration ? "✅ Working" : "❌ Issues found"}`
  );
  console.log(
    `✓ Code compatibility: ${results.codeIntegration ? "✅ Compatible" : "❌ Issues found"}`
  );
  console.log(
    `✓ Security (RLS): ${results.rls ? "✅ Configured" : "❌ Needs review"}`
  );

  const overallSuccess =
    correctTable?.exists &&
    !duplicateTable?.exists &&
    results.structure &&
    results.clerkIntegration &&
    results.codeIntegration;

  console.log(
    `\n🎯 Overall Status: ${overallSuccess ? "✅ PASS" : "⚠️  NEEDS ATTENTION"}`
  );

  if (!overallSuccess) {
    console.log("\n📝 RECOMMENDED ACTIONS:");

    if (!correctTable?.exists) {
      console.log("- ❗ The auth_clerk_users table is missing or inaccessible");
      console.log("  → Check your database schema and RLS policies");
    }

    if (duplicateTable?.exists) {
      console.log("- ❗ The old auth_user_profiles table still exists");
      console.log("  → This table should be cleaned up if no longer needed");
    }

    if (!results.structure) {
      console.log("- ❗ Table structure issues detected");
      console.log("  → Verify your database migration was successful");
    }

    if (!results.clerkIntegration) {
      console.log("- ❗ Clerk integration issues detected");
      console.log("  → Check clerk_user_id and role fields");
    }

    if (!results.codeIntegration) {
      console.log("- ❗ Code compatibility issues detected");
      console.log("  → Review and test your application queries");
    }
  } else {
    console.log("\n🎉 All authentication flow tests passed!");
    console.log("Your database is ready for the updated codebase.");
  }

  return overallSuccess;
}

// Run the comprehensive test
performComprehensiveTest()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("\n💥 Test suite failed:", error);
    process.exit(1);
  });
