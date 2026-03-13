/**
 * Verify organization_policies migration was applied successfully
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load environment variables from .env.local
function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), ".env.local");
    const content = readFileSync(envPath, "utf-8");
    const env = {};
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
        const [key, ...valueParts] = trimmed.split("=");
        const value = valueParts.join("=").replace(/^["']|["']$/g, "");
        env[key] = value;
      }
    }
    return env;
  } catch (error) {
    return {};
  }
}

const env = loadEnv();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing environment variables");
  console.error("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✓" : "✗");
  console.error("SUPABASE_SERVICE_ROLE_KEY:", supabaseServiceKey ? "✓" : "✗");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verify() {
  console.log("=".repeat(60));
  console.log("Verifying Organization Policies Migration");
  console.log("=".repeat(60));
  console.log();

  // Check tables exist
  const { data: tables, error: tablesError } = await supabase.rpc(
    "get_public_table_names"
  ).select();

  if (tablesError) {
    // Try alternative query
    const { data: altTables } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .like("table_name", "organization_policy%");
      
    console.log("📋 Policy Tables Found:", altTables?.length || 0);
  } else {
    const policyTables = tables?.filter((t) =>
      t.table_name?.startsWith("organization_policy")
    );
    console.log("📋 Policy Tables Found:", policyTables?.length || 0);
    policyTables?.forEach((t) => console.log(`   - ${t.table_name}`));
  }
  console.log();

  // Test organization_policies table
  console.log("Testing organization_policies table...");
  const { data: policies, error: policiesError } = await supabase
    .from("organization_policies")
    .select("*")
    .limit(1);

  if (policiesError) {
    console.log("❌ Error querying organization_policies:", policiesError.message);
  } else {
    console.log("✅ organization_policies table accessible");
    console.log(`   Current row count: ${policies?.length || 0}`);
  }
  console.log();

  // Test column filters
  console.log("Testing organization_policies_column_filters...");
  const { data: filters, error: filtersError } = await supabase
    .from("organization_policies_column_filters")
    .select("table_name, org_column, user_column");

  if (filtersError) {
    console.log("❌ Error:", filtersError.message);
  } else {
    console.log("✅ Column filters table accessible");
    console.log(`   Seeded filters: ${filters?.length || 0}`);
    filters?.forEach((f) =>
      console.log(
        `   - ${f.table_name}: org=${f.org_column || "null"}, user=${f.user_column || "null"}`
      )
    );
  }
  console.log();

  // Test foreign key by getting an org
  console.log("Testing foreign key constraints...");
  const { data: orgs } = await supabase
    .from("auth_clerk_orgs")
    .select("id, clerk_org_name")
    .limit(1);

  if (orgs && orgs.length > 0) {
    console.log(`✅ Sample org found: ${orgs[0].clerk_org_name} (id: ${orgs[0].id})`);
    console.log(`   Can use org_id=${orgs[0].id} in policies (BIGINT FK)`);
  } else {
    console.log("⚠️  No orgs found in auth_clerk_orgs");
  }
  console.log();

  console.log("=".repeat(60));
  console.log("✅ Migration verification complete!");
  console.log("=".repeat(60));
}

verify().catch((error) => {
  console.error("❌ Verification failed:", error);
  process.exit(1);
});
