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

// Source columns: id, template_id, name, variable_type, position, created_at, updated_at, path
const sqlFile = readFileSync(
  resolve(process.env.HOME, "Downloads/document_template_variables_rows (1).sql"),
  "utf-8"
);

console.log("Parsing document_template_variables...");

// Extract VALUES
const valuesStart = sqlFile.indexOf("VALUES (");
const content = sqlFile.substring(valuesStart + 7);

const rows = [];
let depth = 0;
let currentRow = "";
let inString = false;

for (let i = 0; i < content.length; i++) {
  const ch = content[i];
  if (ch === "'" && !inString) { inString = true; currentRow += ch; }
  else if (ch === "'" && inString) {
    if (content[i + 1] === "'") { currentRow += "''"; i++; }
    else { inString = false; currentRow += ch; }
  }
  else if (ch === "(" && !inString) { depth++; if (depth === 1) { currentRow = ""; continue; } currentRow += ch; }
  else if (ch === ")" && !inString) { depth--; if (depth === 0) { rows.push(currentRow); currentRow = ""; } else { currentRow += ch; } }
  else { currentRow += ch; }
}

function parseRow(rowStr) {
  const values = [];
  let cur = "";
  let inStr = false;
  let i = 0;
  while (i < rowStr.length) {
    if (rowStr[i] === "'" && !inStr) { inStr = true; cur = ""; i++; }
    else if (rowStr[i] === "'" && inStr) {
      if (rowStr[i + 1] === "'") { cur += "'"; i += 2; }
      else { values.push(cur); inStr = false; i++; }
    }
    else if (inStr) { cur += rowStr[i]; i++; }
    else if (rowStr.substring(i, i + 4) === "null") { values.push(null); i += 4; }
    else { i++; }
  }
  return values;
}

console.log(`Found ${rows.length} variable rows`);

let inserted = 0;
let errors = 0;

for (let i = 0; i < rows.length; i++) {
  const v = parseRow(rows[i]);
  if (v.length < 7) continue;

  // Source: id, template_id, name, variable_type, position, created_at, updated_at, path
  const row = {
    id_uuid: v[0],
    template_id: v[1],
    name: v[2],
    variable_type: v[3],
    position: parseInt(v[4]) || 0,
    created_at: v[5] || new Date().toISOString(),
    updated_at: v[6] || new Date().toISOString(),
    path: v[7],
  };

  const { error } = await supabase
    .from("document_template_variables")
    .upsert(row, { onConflict: "id_uuid" });

  if (error) {
    console.log(`  ❌ ${v[2]}: ${error.message.substring(0, 100)}`);
    errors++;
  } else {
    inserted++;
  }
}

console.log(`\n✅ Inserted: ${inserted}`);
console.log(`❌ Errors: ${errors}`);

const { count } = await supabase
  .from("document_template_variables")
  .select("*", { count: "exact", head: true });
console.log(`Total rows: ${count}`);
