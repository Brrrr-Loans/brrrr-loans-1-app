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

// Read and execute the SQL file directly via RPC
const sqlFile = readFileSync(
  resolve(process.env.HOME, "Downloads/document_types_rows (1).sql"),
  "utf-8"
);

console.log("Seeding document_types...");

// Use the REST API to execute raw SQL via the management API
const response = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    apikey: env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
  },
});

// Alternative: Parse the INSERT statement and use supabase client
const insertMatch = sqlFile.match(/VALUES\s+(.*)/s);
if (!insertMatch) {
  console.error("Could not parse SQL file");
  process.exit(1);
}

// Parse the VALUES into individual rows
const valuesStr = insertMatch[1].replace(/;$/, "");
const rows = [];
const regex = /\('([^']*(?:''[^']*)*)'(?:,\s*'([^']*(?:''[^']*)*)')*\)/g;

// Simpler approach: split by "), (" pattern
const rowStrings = valuesStr.split(/\),\s*\(/);

for (const rowStr of rowStrings) {
  const clean = rowStr.replace(/^\(/, "").replace(/\)$/, "");
  // Extract values between single quotes, handling escaped quotes
  const values = [];
  let current = "";
  let inQuote = false;
  let i = 0;
  
  while (i < clean.length) {
    if (clean[i] === "'" && !inQuote) {
      inQuote = true;
      current = "";
      i++;
    } else if (clean[i] === "'" && inQuote) {
      if (clean[i + 1] === "'") {
        current += "'";
        i += 2;
      } else {
        values.push(current);
        inQuote = false;
        i++;
      }
    } else if (inQuote) {
      current += clean[i];
      i++;
    } else if (clean.substring(i, i + 4) === "null") {
      values.push(null);
      i += 4;
    } else {
      i++;
    }
  }
  
  if (values.length >= 5) {
    rows.push({
      id: parseInt(values[0]),
      document_category_id: values[1] ? parseInt(values[1]) : null,
      document_name: values[2],
      document_description: values[3],
      display_order: values[4] ? parseInt(values[4]) : 0,
      created_at: values[5] || new Date().toISOString(),
      archived_at: values[6],
      archived_by: values[7],
      ai_classification_prompt: values[8],
      label_format: values[9],
      label_format_resolved: values[10],
    });
  }
}

console.log(`Parsed ${rows.length} document type rows`);

// Insert in batches
const batchSize = 20;
let inserted = 0;

for (let i = 0; i < rows.length; i += batchSize) {
  const batch = rows.slice(i, i + batchSize);
  const { error } = await supabase.from("document_types").upsert(batch, {
    onConflict: "id",
  });
  
  if (error) {
    console.error(`Error inserting batch at row ${i}:`, error.message);
    // Try individual inserts for failed batch
    for (const row of batch) {
      const { error: singleError } = await supabase
        .from("document_types")
        .upsert(row, { onConflict: "id" });
      if (singleError) {
        console.error(`  Failed row id=${row.id}: ${singleError.message}`);
      } else {
        inserted++;
      }
    }
  } else {
    inserted += batch.length;
  }
}

console.log(`✅ Inserted ${inserted} document types`);

// Verify
const { count } = await supabase
  .from("document_types")
  .select("*", { count: "exact", head: true });
console.log(`Total document_types rows: ${count}`);
