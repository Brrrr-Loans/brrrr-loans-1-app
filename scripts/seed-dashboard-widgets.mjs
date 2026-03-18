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

// Source columns: id, slot, widget_type, title, subtitle, trend_label, trend_description, value_format, value_prefix, value_suffix, chart_type, x_axis_key, y_axis_key, sql_query, created_at, updated_at, updated_by, icon
const sqlFile = readFileSync(
  resolve(process.env.HOME, "Downloads/dashboard_widgets_rows (3).sql"),
  "utf-8"
);

console.log("Parsing dashboard_widgets...");

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

console.log(`Found ${rows.length} widget rows`);

let inserted = 0;
let errors = 0;

for (let i = 0; i < rows.length; i++) {
  const v = parseRow(rows[i]);
  if (v.length < 14) {
    console.log(`  Skipping row ${i}: only ${v.length} values`);
    continue;
  }

  const row = {
    id: parseInt(v[0]),
    slot: v[1],
    widget_type: v[2],
    title: v[3],
    subtitle: v[4],
    trend_label: v[5],
    trend_description: v[6],
    value_format: v[7],
    value_prefix: v[8],
    value_suffix: v[9],
    chart_type: v[10],
    x_axis_key: v[11],
    y_axis_key: v[12],
    sql_query: v[13],
    created_at: v[14] || new Date().toISOString(),
    updated_at: v[15] || new Date().toISOString(),
    updated_by: v[16],
    icon: v[17],
  };

  const { error } = await supabase
    .from("dashboard_widgets")
    .upsert(row, { onConflict: "id" });

  if (error) {
    console.log(`  ❌ id=${v[0]} (${v[3]}): ${error.message.substring(0, 120)}`);
    errors++;
  } else {
    inserted++;
    console.log(`  ✅ ${v[1]}: ${v[3]}`);
  }
}

console.log(`\n✅ Inserted: ${inserted}`);
console.log(`❌ Errors: ${errors}`);

const { count } = await supabase
  .from("dashboard_widgets")
  .select("*", { count: "exact", head: true });
console.log(`Total dashboard_widgets rows: ${count}`);
