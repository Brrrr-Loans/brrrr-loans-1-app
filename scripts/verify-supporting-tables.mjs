import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";
function loadEnv() {
  try {
    const content = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8");
    const env = {};
    for (const line of content.split("\n")) {
      const t = line.trim();
      if (t && !t.startsWith("#") && t.includes("=")) {
        const [k, ...v] = t.split("=");
        env[k] = v.join("=").replace(/^["']|["']$/g, "");
      }
    }
    return env;
  } catch { return {}; }
}
const env = loadEnv();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

console.log("=".repeat(60));
console.log("Verifying Supporting Tables");
console.log("=".repeat(60));

const tables = [
  "document_statuses",
  "document_templates",
  "document_template_variables",
  "document_types",
  "email_templates",
  "dashboard_widgets",
];

for (const table of tables) {
  const { data, error } = await supabase.from(table).select("*", { count: "exact", head: true });
  if (error) {
    console.log(`  ❌ ${table}: ${error.message}`);
  } else {
    const { count } = await supabase.from(table).select("*", { count: "exact", head: true });
    console.log(`  ✅ ${table}: ${count ?? 0} rows`);
  }
}

console.log("\nDocument statuses:");
const { data: statuses } = await supabase.from("document_statuses").select("*").order("display_order");
statuses?.forEach(s => console.log(`  [${s.id}] ${s.code}: ${s.label} (${s.color})`));
console.log("\n" + "=".repeat(60));
