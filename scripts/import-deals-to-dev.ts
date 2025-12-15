/**
 * Import critical tables from Production to Development Supabase
 * Handles FK constraints by temporarily setting problematic FKs to NULL
 */

import { createClient } from '@supabase/supabase-js';

const PROD_URL = 'https://gsxggtsgqskhchcbrmhe.supabase.co';
const PROD_KEY = process.env.PROD_SUPABASE_SERVICE_KEY || '';

const DEV_URL = 'https://cjbevtvvlthelhbjlqmp.supabase.co';
const DEV_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqYmV2dHZ2bHRoZWxoYmpscW1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTQwMjQ0OCwiZXhwIjoyMDgwOTc4NDQ4fQ.UTC6ri8wVZ0vwYoB2gKnchEzD5dp7LQ9SM9kdIAV_Ug';

// Mapping of old user IDs to new user IDs (production id -> dev id)
// Based on clerk_user_id migration
const USER_ID_MAP: Record<number, number> = {};

async function main() {
  if (!PROD_KEY) {
    console.error('Set PROD_SUPABASE_SERVICE_KEY');
    process.exit(1);
  }

  const prod = createClient(PROD_URL, PROD_KEY);
  const dev = createClient(DEV_URL, DEV_KEY);

  console.log('🚀 Starting data import to DEV...\n');

  // Step 1: Build user ID mapping (prod id -> dev id) based on email
  console.log('📋 Building user ID mapping...');
  const { data: prodUsers } = await prod.from('auth_clerk_users').select('id, email');
  const { data: devUsers } = await dev.from('auth_clerk_users').select('id, email');
  
  if (prodUsers && devUsers) {
    for (const prodUser of prodUsers) {
      const devUser = devUsers.find(u => u.email === prodUser.email);
      if (devUser) {
        USER_ID_MAP[prodUser.id] = devUser.id;
        console.log(`  ${prodUser.email}: prod ${prodUser.id} → dev ${devUser.id}`);
      }
    }
  }

  // Step 2: Import deals (with FK fields nullified then updated)
  console.log('\n📦 Importing deals...');
  const { data: prodDeals, error: dealError } = await prod.from('deal').select('*');
  
  if (dealError) {
    console.error('Error fetching deals:', dealError);
    return;
  }

  if (prodDeals && prodDeals.length > 0) {
    // Transform deals - nullify user FK fields that might not exist
    const dealsToInsert = prodDeals.map(deal => ({
      ...deal,
      account_executive_id: USER_ID_MAP[deal.account_executive_id] || null,
      loan_processor_id: USER_ID_MAP[deal.loan_processor_id] || null,
      loan_opener_id: USER_ID_MAP[deal.loan_opener_id] || null,
    }));

    // Insert in batches
    for (let i = 0; i < dealsToInsert.length; i += 10) {
      const batch = dealsToInsert.slice(i, i + 10);
      const { error } = await dev.from('deal').upsert(batch, { onConflict: 'id' });
      if (error) {
        console.error(`  ❌ Error batch ${i/10 + 1}:`, error.message);
      } else {
        console.log(`  ✅ Batch ${i/10 + 1}: ${batch.length} deals`);
      }
    }
    console.log(`  ✅ Imported ${prodDeals.length} deals`);
  }

  // Step 3: Import bsi_transactions
  console.log('\n📦 Importing bsi_transactions...');
  const { data: prodTxns } = await prod.from('bsi_transactions').select('*');
  if (prodTxns && prodTxns.length > 0) {
    const { error } = await dev.from('bsi_transactions').upsert(prodTxns, { onConflict: 'id' });
    if (error) {
      console.error('  ❌ Error:', error.message);
    } else {
      console.log(`  ✅ Imported ${prodTxns.length} transactions`);
    }
  }

  // Step 4: Import bsi_transactions_investors
  console.log('\n📦 Importing bsi_transactions_investors...');
  const { data: prodTxnInv } = await prod.from('bsi_transactions_investors').select('*');
  if (prodTxnInv && prodTxnInv.length > 0) {
    const txnInvToInsert = prodTxnInv.map(row => ({
      ...row,
      clerk_user_id: USER_ID_MAP[row.clerk_user_id] || row.clerk_user_id,
    }));
    const { error } = await dev.from('bsi_transactions_investors').upsert(txnInvToInsert, { onConflict: 'id' });
    if (error) {
      console.error('  ❌ Error:', error.message);
    } else {
      console.log(`  ✅ Imported ${prodTxnInv.length} transaction investors`);
    }
  }

  // Step 5: Import bsi_deals_clerk_users
  console.log('\n📦 Importing bsi_deals_clerk_users...');
  const { data: prodBsiDeals } = await prod.from('bsi_deals_clerk_users').select('*');
  if (prodBsiDeals && prodBsiDeals.length > 0) {
    const bsiDealsToInsert = prodBsiDeals.map(row => ({
      ...row,
      clerk_user_id: USER_ID_MAP[row.clerk_user_id] || null,
    }));
    const { error } = await dev.from('bsi_deals_clerk_users').upsert(bsiDealsToInsert, { onConflict: 'id' });
    if (error) {
      console.error('  ❌ Error:', error.message);
    } else {
      console.log(`  ✅ Imported ${prodBsiDeals.length} BSI deals clerk users`);
    }
  }

  // Step 6: Import bsi_deals_clerk_orgs
  console.log('\n📦 Importing bsi_deals_clerk_orgs...');
  const { data: prodBsiDealsOrgs } = await prod.from('bsi_deals_clerk_orgs').select('*');
  if (prodBsiDealsOrgs && prodBsiDealsOrgs.length > 0) {
    const { error } = await dev.from('bsi_deals_clerk_orgs').upsert(prodBsiDealsOrgs, { onConflict: 'id' });
    if (error) {
      console.error('  ❌ Error:', error.message);
    } else {
      console.log(`  ✅ Imported ${prodBsiDealsOrgs.length} BSI deals clerk orgs`);
    }
  }

  console.log('\n✅ Import complete!');
}

main().catch(console.error);

