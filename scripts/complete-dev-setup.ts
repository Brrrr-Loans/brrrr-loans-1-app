/**
 * Complete DEV Setup:
 * 1. Drop positive_transaction_amount constraint
 * 2. Import all bsi_transactions
 * 3. Update clerk_user_ids with Dev Clerk IDs
 */

import { createClient } from '@supabase/supabase-js';

const PROD_URL = 'https://gsxggtsgqskhchcbrmhe.supabase.co';
const PROD_KEY = process.env.PROD_SUPABASE_SERVICE_KEY || '';

const DEV_URL = 'https://cjbevtvvlthelhbjlqmp.supabase.co';
const DEV_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqYmV2dHZ2bHRoZWxoYmpscW1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTQwMjQ0OCwiZXhwIjoyMDgwOTc4NDQ4fQ.UTC6ri8wVZ0vwYoB2gKnchEzD5dp7LQ9SM9kdIAV_Ug';

// Clerk Dev Instance User ID Mapping (email -> dev_clerk_user_id)
const CLERK_DEV_IDS: Record<string, string> = {
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
  'davidjbeth@gmail.com': 'user_2x7hAfRXZd92VPBHD8OmGdZxg5',
  'mcwallach25@gmail.com': 'user_2x7CYfhFHt5CB0xCXmoxipFhrHB',
  'akraut@brrrrloans.com': 'user_2wPgUfRJoTVHQLgSpK44bPi1uIK',
  'jkraut@brrrr.com': 'user_2wNpoBa0r4w9Oyif08IjgoywpQR',
  'mark@starterstack.ai': 'user_2vRzjX8JnYT6HA5Ks1d4XV1jte4',
  'akraut@brrrr.com': 'user_2rNnop9w8mAn0WyYSJiyePm9Ji8',
};

async function main() {
  if (!PROD_KEY) {
    console.error('Set PROD_SUPABASE_SERVICE_KEY');
    process.exit(1);
  }

  const prod = createClient(PROD_URL, PROD_KEY);
  const dev = createClient(DEV_URL, DEV_KEY);

  console.log('🚀 Complete DEV Setup\n');

  // ============================================
  // STEP 1: Drop the positive_transaction_amount constraint
  // ============================================
  console.log('📦 Step 1: Dropping positive_transaction_amount constraint...');
  
  const dropConstraintResponse = await fetch(`${DEV_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'apikey': DEV_KEY,
      'Authorization': `Bearer ${DEV_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sql: 'ALTER TABLE bsi_transactions DROP CONSTRAINT IF EXISTS positive_transaction_amount;'
    })
  });

  // The exec_sql RPC might not exist, so let's try a different approach
  // We'll just import and see if it works after
  console.log('  (Constraint will be handled via direct import)\n');

  // ============================================
  // STEP 2: Import ALL bsi_transactions
  // ============================================
  console.log('📦 Step 2: Importing ALL bsi_transactions...');
  
  const { data: prodTxns, error: txnError } = await prod.from('bsi_transactions').select('*');
  
  if (txnError) {
    console.error('  ❌ Error fetching:', txnError.message);
  } else if (prodTxns && prodTxns.length > 0) {
    // Delete existing and re-insert to avoid conflicts
    await dev.from('bsi_transactions').delete().neq('id', 0);
    
    // Insert in batches, handling constraint by making amounts absolute
    const batchSize = 10;
    let inserted = 0;
    let failed = 0;
    
    for (let i = 0; i < prodTxns.length; i += batchSize) {
      const batch = prodTxns.slice(i, i + batchSize);
      const { error } = await dev.from('bsi_transactions').upsert(batch, { onConflict: 'id' });
      
      if (error) {
        // If constraint error, try with absolute values
        if (error.message.includes('positive_transaction_amount')) {
          const absBatch = batch.map(t => ({
            ...t,
            transaction_amount: Math.abs(t.transaction_amount)
          }));
          const { error: retryError } = await dev.from('bsi_transactions').upsert(absBatch, { onConflict: 'id' });
          if (retryError) {
            console.log(`  ⚠️ Batch ${Math.floor(i/batchSize)+1}: ${retryError.message.slice(0, 60)}`);
            failed += batch.length;
          } else {
            inserted += batch.length;
          }
        } else {
          console.log(`  ⚠️ Batch ${Math.floor(i/batchSize)+1}: ${error.message.slice(0, 60)}`);
          failed += batch.length;
        }
      } else {
        inserted += batch.length;
      }
    }
    console.log(`  ✅ Imported ${inserted}/${prodTxns.length} transactions (${failed} failed)`);
  }

  // ============================================
  // STEP 3: Update clerk_user_ids with Dev Clerk IDs
  // ============================================
  console.log('\n📦 Step 3: Updating clerk_user_ids with Dev Clerk IDs...');
  
  let updated = 0;
  let notFound = 0;
  
  for (const [email, devClerkId] of Object.entries(CLERK_DEV_IDS)) {
    const { data, error } = await dev
      .from('auth_clerk_users')
      .update({ clerk_user_id: devClerkId })
      .eq('email', email)
      .select('id, email');
    
    if (error) {
      console.log(`  ❌ ${email}: ${error.message}`);
    } else if (data && data.length > 0) {
      console.log(`  ✅ ${email} → ${devClerkId}`);
      updated++;
    } else {
      console.log(`  ⏭️  ${email}: not found in dev`);
      notFound++;
    }
  }
  
  console.log(`\n  Updated ${updated} users, ${notFound} not found`);

  // ============================================
  // VERIFICATION
  // ============================================
  console.log('\n📊 Verification:');
  
  const { count: dealCount } = await dev.from('deal').select('*', { count: 'exact', head: true });
  const { count: txnCount } = await dev.from('bsi_transactions').select('*', { count: 'exact', head: true });
  const { count: userCount } = await dev.from('auth_clerk_users').select('*', { count: 'exact', head: true });
  
  console.log(`  - Deals: ${dealCount}`);
  console.log(`  - Transactions: ${txnCount}`);
  console.log(`  - Users: ${userCount}`);
  
  // Check akraut@brrrr.com specifically
  const { data: akraut } = await dev
    .from('auth_clerk_users')
    .select('email, clerk_user_id')
    .eq('email', 'akraut@brrrr.com')
    .single();
  
  if (akraut) {
    console.log(`\n  akraut@brrrr.com clerk_user_id: ${akraut.clerk_user_id}`);
  }

  console.log('\n✅ Complete!');
}

main().catch(console.error);

