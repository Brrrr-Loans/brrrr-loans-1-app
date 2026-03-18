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

// Source columns: id, organization_id, name, subject, preview_text, from_address, reply_to, liveblocks_room_id, editor_json, email_output_html, email_output_text, styles, status, published_at, schema_version, created_at, updated_at, blocknote_document, uuid
const sqlFile = readFileSync(
  resolve(process.env.HOME, "Downloads/email_templates_rows (2).sql"),
  "utf-8"
);

console.log("Parsing email_templates...");

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

console.log(`Found ${rows.length} email template rows`);

let inserted = 0;
let errors = 0;

for (let i = 0; i < rows.length; i++) {
  const v = parseRow(rows[i]);
  if (v.length < 18) {
    console.log(`  Skipping row ${i}: only ${v.length} values`);
    continue;
  }

  let editorJson, styles, blocknoteDoc;
  try { editorJson = v[8] ? JSON.parse(v[8]) : {}; } catch { editorJson = {}; }
  try { styles = v[11] ? JSON.parse(v[11]) : {}; } catch { styles = {}; }
  try { blocknoteDoc = v[17] ? JSON.parse(v[17]) : null; } catch { blocknoteDoc = null; }

  const row = {
    id: parseInt(v[0]),
    organization_id: v[1], // Keep original UUID
    org_id: 1, // Map to Brrrr Funder LLC
    name: v[2] || "Untitled Template",
    subject: v[3] || "",
    preview_text: v[4] || "",
    from_address: v[5],
    reply_to: v[6],
    liveblocks_room_id: v[7],
    editor_json: editorJson,
    email_output_html: v[9],
    email_output_text: v[10],
    styles,
    status: v[12] || "draft",
    published_at: v[13],
    schema_version: parseInt(v[14]) || 1,
    created_at: v[15],
    updated_at: v[16],
    blocknote_document: blocknoteDoc,
    uuid: v[18],
  };

  const { error } = await supabase
    .from("email_templates")
    .upsert(row, { onConflict: "id" });

  if (error) {
    console.log(`  ❌ id=${v[0]} (${v[2]}): ${error.message.substring(0, 120)}`);
    errors++;
  } else {
    inserted++;
  }
}

console.log(`\n✅ Inserted: ${inserted}`);
console.log(`❌ Errors: ${errors}`);

const { count } = await supabase
  .from("email_templates")
  .select("*", { count: "exact", head: true });
console.log(`Total email_templates rows: ${count}`);
