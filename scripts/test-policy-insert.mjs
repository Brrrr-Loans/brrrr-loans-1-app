import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

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
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function test() {
  console.log("Testing policy insert with BIGINT foreign keys...\n");

  // Get a sample org
  const { data: org } = await supabase
    .from("auth_clerk_orgs")
    .select("id")
    .limit(1)
    .single();

  if (!org) {
    console.log("No orgs found");
    return;
  }

  console.log(`Using org_id: ${org.id} (BIGINT)\n`);

  // Insert test policy
  const testPolicy = {
    org_id: org.id,
    resource_type: "feature",
    resource_name: "test_feature",
    action: "view",
    definition_json: {
      version: 3,
      allow_internal_users: true,
      conditions: [],
      connector: "AND",
    },
    compiled_config: {
      version: 3,
      allow_internal_users: true,
      conditions: [],
    },
    scope: "all",
    effect: "ALLOW",
  };

  const { data, error } = await supabase
    .from("organization_policies")
    .insert(testPolicy)
    .select()
    .single();

  if (error) {
    console.log("❌ Insert failed:", error.message);
    return;
  }

  console.log("✅ Test policy inserted successfully!");
  console.log(`   Policy ID: ${data.id}`);
  console.log(`   Org ID (BIGINT): ${data.org_id}`);
  console.log(`   Resource: ${data.resource_type}/${data.resource_name}`);
  console.log("\nForeign key constraint working correctly!\n");

  // Clean up
  await supabase.from("organization_policies").delete().eq("id", data.id);
  console.log("🗑️  Test policy cleaned up\n");
}

test().catch(console.error);
