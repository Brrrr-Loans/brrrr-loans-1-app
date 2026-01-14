/**
 * Full Import from Production to Development Supabase
 * Imports tables in correct dependency order
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const PROD_URL = 'https://gsxggtsgqskhchcbrmhe.supabase.co';
const PROD_KEY = process.env.PROD_SUPABASE_SERVICE_KEY || '';

const DEV_URL = 'https://cjbevtvvlthelhbjlqmp.supabase.co';
const DEV_KEY = process.env.DEV_SUPABASE_SERVICE_KEY || '';

// Generated columns to exclude
const GENERATED_COLS: Record<string, string[]> = {
  'borrower': ['fico_report_date_expiration', 'name'],
  'contact': ['name'],
  'guarantor': ['fico_report_date_expiration', 'name'],
};

async function importTable(
  prod: SupabaseClient,
  dev: SupabaseClient,
  table: string,
  transform?: (data: any[]) => any[]
): Promise<number> {
  const { data, error: fetchError } = await prod.from(table).select('*');
  
  if (fetchError) {
    console.log(`  ❌ Fetch error: ${fetchError.message}`);
    return 0;
  }
  
  if (!data || data.length === 0) {
    console.log(`  ⏭️  No data`);
    return 0;
  }

  // Remove generated columns
  let cleanData = data;
  if (GENERATED_COLS[table]) {
    cleanData = data.map(row => {
      const newRow = { ...row };
      for (const col of GENERATED_COLS[table]) {
        delete newRow[col];
      }
      return newRow;
    });
  }

  // Apply transform if provided
  if (transform) {
    cleanData = transform(cleanData);
  }

  // Insert in batches
  const batchSize = 20;
  let inserted = 0;
  
  // Determine primary key column
  const pkColumn = table === 'company' ? 'co_id' : 
                   table === 'company_member' ? 'member_id' : 'id';
  
  for (let i = 0; i < cleanData.length; i += batchSize) {
    const batch = cleanData.slice(i, i + batchSize);
    const { error } = await dev.from(table).upsert(batch, { 
      onConflict: pkColumn,
      ignoreDuplicates: false 
    });
    
    if (error) {
      console.log(`  ⚠️ Batch ${Math.floor(i/batchSize)+1}: ${error.message.slice(0, 80)}`);
    } else {
      inserted += batch.length;
    }
  }
  
  console.log(`  ✅ ${inserted}/${data.length} rows`);
  return inserted;
}

async function main() {
  if (!PROD_KEY) {
    console.error('Set PROD_SUPABASE_SERVICE_KEY');
    process.exit(1);
  }

  const prod = createClient(PROD_URL, PROD_KEY);
  const dev = createClient(DEV_URL, DEV_KEY);

  console.log('🚀 Full Import to DEV\n');

  // Phase 1: Core entity tables
  console.log('📦 Phase 1: Core entities');
  
  console.log('  borrower:');
  await importTable(prod, dev, 'borrower');
  
  console.log('  company:');
  await importTable(prod, dev, 'company', (data) => 
    data.map(row => ({ ...row, primary_guarantor_id: null }))
  );
  
  console.log('  company_member:');
  await importTable(prod, dev, 'company_member');
  
  console.log('  contact:');
  await importTable(prod, dev, 'contact', (data) =>
    data.map(row => ({ ...row, user_id: null }))
  );
  
  console.log('  property:');
  await importTable(prod, dev, 'property', (data) =>
    data.map(row => ({ ...row, hoa_contact: null }))
  );
  
  console.log('  guarantor:');
  await importTable(prod, dev, 'guarantor', (data) =>
    data.map(row => ({ ...row, deal_id: null }))
  );

  // Phase 2: Deals
  console.log('\n📦 Phase 2: Deals');
  console.log('  deal:');
  await importTable(prod, dev, 'deal', (data) =>
    data.map(row => ({
      ...row,
      account_executive_id: null,
      loan_processor_id: null,
      loan_opener_id: null,
      broker_id: null,
      title_company_contact_id: null,
      closing_agent_contact_id: null,
      appraisal_poc_contact_id: null,
      insurance_carrier_contact_id: null,
      loan_buyer_contact_id: null,
      escrow_contact_id: null,
      primary_guarantor_id: null,
      second_guarantor_id: null,
      third_guarantor_id: null,
      fourth_guarantor_id: null,
    }))
  );

  // Phase 3: BSI tables
  console.log('\n📦 Phase 3: BSI tables');
  
  console.log('  bsi_deals_clerk_users:');
  await importTable(prod, dev, 'bsi_deals_clerk_users', (data) =>
    data.map(row => ({ ...row, clerk_user_id: null }))
  );
  
  console.log('  bs_debt_instruments:');
  await importTable(prod, dev, 'bs_debt_instruments');
  
  console.log('  bsi_transactions:');
  await importTable(prod, dev, 'bsi_transactions');

  console.log('\n✅ Import complete!');
  
  // Verify
  const { count } = await dev.from('deal').select('*', { count: 'exact', head: true });
  console.log(`\n📊 Verification: ${count} deals in DEV`);
}

main().catch(console.error);

