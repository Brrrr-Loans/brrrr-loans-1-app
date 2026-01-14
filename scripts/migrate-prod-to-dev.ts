/**
 * Script to migrate data from Production Supabase to Development Supabase
 * 
 * Usage:
 *   npx tsx scripts/migrate-prod-to-dev.ts
 * 
 * Environment Variables Required:
 *   PROD_SUPABASE_URL - Production Supabase URL
 *   PROD_SUPABASE_SERVICE_KEY - Production service role key
 *   DEV_SUPABASE_URL - Development Supabase URL  
 *   DEV_SUPABASE_SERVICE_KEY - Development service role key
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Configuration - UPDATE THESE VALUES
const PROD_SUPABASE_URL = 'https://gsxggtsgqskhchcbrmhe.supabase.co';
const PROD_SUPABASE_SERVICE_KEY = process.env.PROD_SUPABASE_SERVICE_KEY || '';

const DEV_SUPABASE_URL = 'https://cjbevtvvlthelhbjlqmp.supabase.co';
const DEV_SUPABASE_SERVICE_KEY = process.env.DEV_SUPABASE_SERVICE_KEY || '';

// Tables to migrate in dependency order (parents before children)
const TABLES_TO_MIGRATE = [
  // Lookup tables (no FKs)
  'countries',
  'constants', 
  'fee',
  'contact_types',
  'document_roles',
  'select_uw_outcomes',
  'milestone_templates',
  'weweb_auth_roles',
  
  // Core tables
  'auth_clerk_users',
  'auth_clerk_orgs',
  'auth_clerk_orgs_members',
  'borrower',
  'company',
  'company_member',
  'contact',
  'property',
  
  // Deal related
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
  
  // Balance sheet / investor tables
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
  
  // API integrations
  'api_brex_vendors',
  'api_brex_vendors_clerk_users',
  'api_brex_vendors_clerk_orgs',
  'api_brex_transfers',
  'api_brex_transfers_vendors',
  'bsi_transactions_api_brex_transfers',
];

async function migrateTable(
  prodClient: SupabaseClient,
  devClient: SupabaseClient,
  tableName: string
): Promise<{ success: boolean; count: number; error?: string }> {
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
    
    // Clear existing data in dev (be careful!)
    const { error: deleteError } = await devClient
      .from(tableName)
      .delete()
      .neq('id', -999999); // Delete all rows
    
    if (deleteError && !deleteError.message.includes('row-level security')) {
      console.warn(`  ⚠️  Warning clearing dev table: ${deleteError.message}`);
    }
    
    // Insert data in batches of 100
    const batchSize = 100;
    let insertedCount = 0;
    
    for (let i = 0; i < prodData.length; i += batchSize) {
      const batch = prodData.slice(i, i + batchSize);
      
      const { error: insertError } = await devClient
        .from(tableName)
        .upsert(batch, { onConflict: 'id' });
      
      if (insertError) {
        console.error(`  ❌ Error inserting batch ${i / batchSize + 1}: ${insertError.message}`);
        return { success: false, count: insertedCount, error: insertError.message };
      }
      
      insertedCount += batch.length;
    }
    
    console.log(`  ✅ Migrated ${insertedCount} rows`);
    return { success: true, count: insertedCount };
    
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`  ❌ Unexpected error: ${errorMsg}`);
    return { success: false, count: 0, error: errorMsg };
  }
}

async function main() {
  console.log('🚀 Starting Production → Development Data Migration\n');
  console.log(`📌 Production: ${PROD_SUPABASE_URL}`);
  console.log(`📌 Development: ${DEV_SUPABASE_URL}\n`);
  
  if (!PROD_SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing PROD_SUPABASE_SERVICE_KEY environment variable');
    console.log('\nSet it with:');
    console.log('  export PROD_SUPABASE_SERVICE_KEY="your-prod-service-key"');
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
  
  for (const table of TABLES_TO_MIGRATE) {
    results[table] = await migrateTable(prodClient, devClient, table);
  }
  
  // Summary
  console.log('\n\n📊 Migration Summary');
  console.log('='.repeat(50));
  
  let successCount = 0;
  let failCount = 0;
  let totalRows = 0;
  
  for (const [table, result] of Object.entries(results)) {
    const status = result.success ? '✅' : '❌';
    console.log(`  ${status} ${table}: ${result.count} rows${result.error ? ` (${result.error})` : ''}`);
    
    if (result.success) {
      successCount++;
      totalRows += result.count;
    } else {
      failCount++;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`✅ Successful: ${successCount} tables`);
  console.log(`❌ Failed: ${failCount} tables`);
  console.log(`📊 Total rows migrated: ${totalRows}`);
  
  if (failCount > 0) {
    console.log('\n⚠️  Some tables failed to migrate. Check the errors above.');
  } else {
    console.log('\n🎉 Migration complete!');
    console.log('\n📝 Next step: Update auth_clerk_users.clerk_user_id with dev Clerk IDs');
  }
}

main().catch(console.error);

