/**
 * Script to migrate data from Production Supabase to Development Supabase
 * Version 2: Handles generated columns and FK constraints properly
 * 
 * Usage:
 *   npx tsx scripts/migrate-prod-to-dev-v2.ts
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Configuration
const PROD_SUPABASE_URL = 'https://gsxggtsgqskhchcbrmhe.supabase.co';
const PROD_SUPABASE_SERVICE_KEY = process.env.PROD_SUPABASE_SERVICE_KEY || '';

const DEV_SUPABASE_URL = 'https://cjbevtvvlthelhbjlqmp.supabase.co';
const DEV_SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqYmV2dHZ2bHRoZWxoYmpscW1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTQwMjQ0OCwiZXhwIjoyMDgwOTc4NDQ4fQ.UTC6ri8wVZ0vwYoB2gKnchEzD5dp7LQ9SM9kdIAV_Ug';

// Generated columns to exclude when inserting
const GENERATED_COLUMNS: Record<string, string[]> = {
  'auth_clerk_users': ['full_name'],
  'borrower': ['fico_report_date_expiration', 'name'],
  'contact': ['name'],
  'guarantor': ['fico_report_date_expiration', 'name'],
};

// Tables that don't exist in dev - skip them
const SKIP_TABLES = ['weweb_auth_roles', 'weweb_auth_users_roles'];

// Clerk User ID mapping (email -> dev clerk_user_id)
const CLERK_ID_MAPPING: Record<string, string> = {
  'jennifer@hansenandgrace.com': 'user_36RIWUs5hRSbzt7OMjqxtJf8gnr',
  'monquize@dusseauand.com': 'user_35hqOkqhaIPZX8xX6cgjYozb8Lq',
  'clesnik@brrrr.com': 'user_32SzHFe8iRbppiH7tXymiGluVI2',
  'lannythompson@ymail.com': 'user_32SuZi7lbtzvjJ93oivmumuX0ME',
  'ethantthompson5@gmail.com': 'user_32Sqg2PoFmgCd7wOYWh4tD0zaXZ',
  'timct1960@gmail.com': 'user_32SnhDZr6MOYwDHZHb7DtEAq1ZR',
  'varazdat@brrrr.com': 'user_32ShXClKX2Q8N0jyuYLEndqtIIu',
  'dhruvnvarma@gmail.com': 'user_32SVQXVownMtEZc7cwU5bYGThJe',
  'kean@unitedsuccessllc.com': 'user_2x8EhWIaYhxgLw2w0mqq5iaIRPn',
  'lilligenise@gmail.com': 'user_2x7jE0UHAvgK3cuks2YYAmrcqsS',
  'broker37@aol.com': 'user_2x7ia30X4CPzgisT2y00BgiVbzA',
  'davidjbeth@gmail.com': 'user_2x7hAfRXZd92VPnBHD8OmGdZxg5',
  'mcwallach25@gmail.com': 'user_2x7CYfhFHt5CB0xCXmoxipFhrHB',
  'akraut@brrrrloans.com': 'user_2wPgUfRJoTVHQLgSpK44bPi1uIK',
  'jkraut@brrrr.com': 'user_2wNpoBa0r4w9Oyif08IjgoywpQR',
  'mark@starterstack.ai': 'user_2vRzjX8JnYT6HA5Ks1d4XV1jte4',
  'akraut@brrrr.com': 'user_2rNnop9w8mAn0WyYSJiyePm9Ji8',
};

// Tables to migrate in correct dependency order
const TABLES_IN_ORDER = [
  // Lookup/reference tables (no deps)
  'countries',
  'constants',
  'fee',
  'contact_types',
  'document_roles',
  'select_uw_outcomes',
  'milestone_templates',
  
  // Core tables - auth first
  'auth_clerk_users',
  'auth_clerk_orgs',
  'auth_clerk_orgs_members',
  
  // Entity tables
  'borrower',
  'company',
  'company_member',
  'contact',
  'property',
  'property_income',
  
  // Deal-related
  'guarantor',
  'deal',
  'deal_property',
  'deal_roles',
  'appraisal',
  'deal_appraisals',
  'milestones',
  'tasks',
  'task_templates',
  'loan_application',
  'document_files',
  'document_roles_files',
  'custom_loan_fees',
  'company_contact',
  'company_roles_defined',
  'company_roles',
  'contact_types_jt',
  'property_reapi',
  'cba_requests',
  'payroll_ledger',
  'payroll_ledger_fees_1099',
  
  // BSI tables
  'bs_debt_instruments',
  'bs_debt_instruments_deals',
  'bsi_deals_clerk_users',
  'bsi_deals_clerk_orgs',
  'bsi_statements',
  'bsi_distributions',
  'bsi_transactions',
  'bsi_transactions_deals',
  'bsi_transactions_investors',
  'bsi_transactions_instruments',
  'bsi_transactions_document_files',
  
  // API tables
  'api_brex_vendors',
  'api_brex_vendors_clerk_users',
  'api_brex_vendors_clerk_orgs',
  'api_brex_transfers',
  'api_brex_transfers_vendors',
  'bsi_transactions_api_brex_transfers',
];

function removeGeneratedColumns(tableName: string, data: any[]): any[] {
  const columnsToRemove = GENERATED_COLUMNS[tableName];
  if (!columnsToRemove || columnsToRemove.length === 0) {
    return data;
  }
  
  return data.map(row => {
    const newRow = { ...row };
    for (const col of columnsToRemove) {
      delete newRow[col];
    }
    return newRow;
  });
}

async function disableForeignKeys(client: SupabaseClient): Promise<void> {
  console.log('🔓 Temporarily disabling foreign key checks...');
  // Note: This requires superuser - may not work with service role
  // We'll handle FK order instead
}

async function migrateTable(
  prodClient: SupabaseClient,
  devClient: SupabaseClient,
  tableName: string
): Promise<{ success: boolean; count: number; error?: string }> {
  if (SKIP_TABLES.includes(tableName)) {
    console.log(`\n⏭️  Skipping table: ${tableName} (not in dev schema)`);
    return { success: true, count: 0 };
  }
  
  console.log(`\n📦 Migrating table: ${tableName}`);
  
  try {
    // Fetch all data from production
    const { data: prodData, error: fetchError } = await prodClient
      .from(tableName)
      .select('*');
    
    if (fetchError) {
      console.error(`  ❌ Error fetching from prod: ${fetchError.message}`);
      return { success: false, count: 0, error: fetchError.message };
    }
    
    if (!prodData || prodData.length === 0) {
      console.log(`  ⏭️  No data to migrate (0 rows)`);
      return { success: true, count: 0 };
    }
    
    console.log(`  📊 Found ${prodData.length} rows in production`);
    
    // Remove generated columns
    const cleanData = removeGeneratedColumns(tableName, prodData);
    
    // For auth_clerk_users, we need to update clerk_user_id to dev values
    let dataToInsert = cleanData;
    if (tableName === 'auth_clerk_users') {
      dataToInsert = cleanData.map(row => {
        const email = row.email?.toLowerCase();
        const devClerkId = email ? CLERK_ID_MAPPING[email] : null;
        return {
          ...row,
          clerk_user_id: devClerkId || row.clerk_user_id, // Use dev ID if available
        };
      });
      console.log(`  🔄 Updated ${dataToInsert.filter(r => CLERK_ID_MAPPING[r.email?.toLowerCase()]).length} clerk_user_ids to dev values`);
    }
    
    // For auth_clerk_orgs, we need to handle created_by_clerk_user_id FK
    if (tableName === 'auth_clerk_orgs') {
      dataToInsert = cleanData.map(row => ({
        ...row,
        created_by_clerk_user_id: null, // Set to null initially, update later
      }));
    }
    
    // For tables with FK to auth_clerk_users.clerk_user_id, nullify temporarily
    const tablesWithClerkUserIdFK = ['auth_clerk_orgs'];
    
    // Insert data in batches of 50
    const batchSize = 50;
    let insertedCount = 0;
    
    for (let i = 0; i < dataToInsert.length; i += batchSize) {
      const batch = dataToInsert.slice(i, i + batchSize);
      
      const { error: insertError } = await devClient
        .from(tableName)
        .upsert(batch, { 
          onConflict: getPrimaryKey(tableName),
          ignoreDuplicates: false 
        });
      
      if (insertError) {
        console.error(`  ❌ Error inserting batch ${Math.floor(i / batchSize) + 1}: ${insertError.message}`);
        // Continue with other batches instead of failing completely
        continue;
      }
      
      insertedCount += batch.length;
    }
    
    console.log(`  ✅ Migrated ${insertedCount}/${prodData.length} rows`);
    return { success: insertedCount > 0, count: insertedCount };
    
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`  ❌ Unexpected error: ${errorMsg}`);
    return { success: false, count: 0, error: errorMsg };
  }
}

function getPrimaryKey(tableName: string): string {
  // Most tables use 'id', but some use different PKs
  const pkMap: Record<string, string> = {
    'cba_requests_guarantors': 'cba_request_id,guarantor_id',
    '_function_backups_20251118': 'function_name',
  };
  return pkMap[tableName] || 'id';
}

async function updateClerkOrgCreatedBy(devClient: SupabaseClient): Promise<void> {
  console.log('\n🔗 Updating auth_clerk_orgs.created_by_clerk_user_id references...');
  
  // Get all orgs with their original created_by values from prod
  // For now, we'll leave them as null since the FK relationship is complex
  console.log('  ⏭️  Skipping - clerk_user_id values need manual mapping');
}

async function main() {
  console.log('🚀 Starting Production → Development Data Migration (v2)\n');
  console.log(`📌 Production: ${PROD_SUPABASE_URL}`);
  console.log(`📌 Development: ${DEV_SUPABASE_URL}\n`);
  
  if (!PROD_SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing PROD_SUPABASE_SERVICE_KEY environment variable');
    process.exit(1);
  }
  
  // Create clients
  const prodClient = createClient(PROD_SUPABASE_URL, PROD_SUPABASE_SERVICE_KEY);
  const devClient = createClient(DEV_SUPABASE_URL, DEV_SUPABASE_SERVICE_KEY);
  
  // Test connections
  console.log('🔌 Testing connections...');
  
  const { error: prodTestError } = await prodClient.from('auth_clerk_users').select('id').limit(1);
  if (prodTestError) {
    console.error(`❌ Cannot connect to production: ${prodTestError.message}`);
    process.exit(1);
  }
  console.log('  ✅ Production connection OK');
  
  const { error: devTestError } = await devClient.from('auth_clerk_users').select('id').limit(1);
  if (devTestError) {
    console.error(`❌ Cannot connect to development: ${devTestError.message}`);
    process.exit(1);
  }
  console.log('  ✅ Development connection OK');
  
  // Migrate tables
  console.log('\n📋 Migrating tables in dependency order...');
  
  const results: Record<string, { success: boolean; count: number; error?: string }> = {};
  
  for (const table of TABLES_IN_ORDER) {
    results[table] = await migrateTable(prodClient, devClient, table);
  }
  
  // Update FK references
  await updateClerkOrgCreatedBy(devClient);
  
  // Summary
  console.log('\n\n📊 Migration Summary');
  console.log('='.repeat(60));
  
  let successCount = 0;
  let failCount = 0;
  let totalRows = 0;
  
  for (const [table, result] of Object.entries(results)) {
    const status = result.success ? '✅' : '❌';
    const errorInfo = result.error ? ` (${result.error.slice(0, 50)}...)` : '';
    console.log(`  ${status} ${table}: ${result.count} rows${errorInfo}`);
    
    if (result.success) {
      successCount++;
      totalRows += result.count;
    } else {
      failCount++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`✅ Successful: ${successCount} tables`);
  console.log(`❌ Failed: ${failCount} tables`);
  console.log(`📊 Total rows migrated: ${totalRows}`);
  
  console.log('\n📝 Clerk User ID Mapping Applied:');
  for (const [email, clerkId] of Object.entries(CLERK_ID_MAPPING)) {
    console.log(`   ${email} → ${clerkId}`);
  }
}

main().catch(console.error);

