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

const sqlFile = readFileSync(
  resolve(process.env.HOME, "Downloads/document_templates_rows (1).sql"),
  "utf-8"
);

console.log("Parsing document_templates rows...");

// Source columns: id, organization_id, name, updated_at, archived_at, archived_by, created_at, gjs_data, html_content, user_id
// Target columns: id_uuid, organization_id, org_id, name, updated_at, archived_at, archived_by, created_at, gjs_data, html_content, user_id

// Parse the VALUES section
const valuesStart = sqlFile.indexOf("VALUES (");
if (valuesStart === -1) {
  console.error("Could not find VALUES");
  process.exit(1);
}

// Split rows by the pattern '), ('
// But we need to handle the case where '), (' appears inside string values
// Use a state machine approach
const content = sqlFile.substring(valuesStart + 7); // after "VALUES "
const rows = [];
let depth = 0;
let currentRow = "";
let inString = false;

for (let i = 0; i < content.length; i++) {
  const ch = content[i];
  
  if (ch === "'" && !inString) {
    inString = true;
    currentRow += ch;
  } else if (ch === "'" && inString) {
    if (content[i + 1] === "'") {
      currentRow += "''";
      i++;
    } else {
      inString = false;
      currentRow += ch;
    }
  } else if (ch === "(" && !inString) {
    depth++;
    if (depth === 1) {
      currentRow = "";
      continue;
    }
    currentRow += ch;
  } else if (ch === ")" && !inString) {
    depth--;
    if (depth === 0) {
      rows.push(currentRow);
      currentRow = "";
    } else {
      currentRow += ch;
    }
  } else {
    currentRow += ch;
  }
}

console.log(`Found ${rows.length} template rows`);

// Parse each row into fields
function parseRow(rowStr) {
  const values = [];
  let current = "";
  let inStr = false;
  let i = 0;
  
  while (i < rowStr.length) {
    if (rowStr[i] === "'" && !inStr) {
      inStr = true;
      current = "";
      i++;
    } else if (rowStr[i] === "'" && inStr) {
      if (rowStr[i + 1] === "'") {
        current += "'";
        i += 2;
      } else {
        values.push(current);
        inStr = false;
        i++;
      }
    } else if (inStr) {
      current += rowStr[i];
      i++;
    } else if (rowStr.substring(i, i + 4) === "null") {
      values.push(null);
      i += 4;
    } else {
      i++;
    }
  }
  
  return values;
}

let inserted = 0;
let errors = 0;

for (let i = 0; i < rows.length; i++) {
  const values = parseRow(rows[i]);
  
  if (values.length < 9) {
    console.log(`  Skipping row ${i}: only ${values.length} values`);
    continue;
  }
  
  // Source: id, organization_id, name, updated_at, archived_at, archived_by, created_at, gjs_data, html_content, user_id
  const sourceId = values[0]; // UUID
  const orgUuid = values[1]; // Keep original
  const name = values[2];
  const updatedAt = values[3];
  const archivedAt = values[4];
  const archivedBy = values[5];
  const createdAt = values[6];
  let gjsData = values[7];
  const htmlContent = values[8];
  const userId = values[9];

  // Parse gjs_data as JSON
  let gjsJson;
  try {
    gjsJson = gjsData ? JSON.parse(gjsData) : {};
  } catch {
    gjsJson = {};
  }

  const row = {
    id_uuid: sourceId,
    organization_id: orgUuid,
    org_id: 1, // Map to Brrrr Funder LLC
    name: name || "Untitled",
    updated_at: updatedAt || new Date().toISOString(),
    archived_at: archivedAt,
    archived_by: archivedBy,
    created_at: createdAt || new Date().toISOString(),
    gjs_data: gjsJson,
    html_content: htmlContent || "",
    user_id: userId || "system",
  };

  const { error } = await supabase
    .from("document_templates")
    .upsert(row, { onConflict: "id_uuid" });

  if (error) {
    console.log(`  ❌ Row ${i} (${name}): ${error.message.substring(0, 100)}`);
    errors++;
  } else {
    inserted++;
  }
}

console.log(`\n✅ Inserted: ${inserted}`);
console.log(`❌ Errors: ${errors}`);

const { count } = await supabase
  .from("document_templates")
  .select("*", { count: "exact", head: true });
console.log(`Total document_templates rows: ${count}`);
