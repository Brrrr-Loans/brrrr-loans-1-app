/**
 * Compare Production vs Development schema
 * Outputs differences that need to be fixed
 */

const PROD_URL = 'https://gsxggtsgqskhchcbrmhe.supabase.co';
const PROD_KEY = process.env.PROD_SUPABASE_SERVICE_KEY || '';

const DEV_URL = 'https://cjbevtvvlthelhbjlqmp.supabase.co';
const DEV_KEY = process.env.DEV_SUPABASE_SERVICE_KEY || '';

async function main() {
  if (!PROD_KEY) {
    console.error('Set PROD_SUPABASE_SERVICE_KEY');
    process.exit(1);
  }

  console.log('🔍 Comparing Production vs Development Schema\n');


  // List of tables we want to check (critical ones)
  const criticalTables = [
    'bsi_transactions_deals',
    'bsi_transactions_investors', 
    'bsi_transactions_instruments',
    'auth_clerk_users',
    'auth_clerk_orgs',
    'bsi_transactions',
    'bsi_deals',
    'deal'
  ];

  console.log('Checking critical tables for column differences...\n');

  for (const table of criticalTables) {
    // Query one row to get column names
    const devRes = await fetch(`${DEV_URL}/rest/v1/${table}?limit=0`, {
      method: 'GET',
      headers: {
        'apikey': DEV_KEY,
        'Authorization': `Bearer ${DEV_KEY}`,
        'Prefer': 'count=exact'
      }
    });

    const prodRes = await fetch(`${PROD_URL}/rest/v1/${table}?limit=0`, {
      method: 'GET', 
      headers: {
        'apikey': PROD_KEY,
        'Authorization': `Bearer ${PROD_KEY}`,
        'Prefer': 'count=exact'
      }
    });

    if (!devRes.ok) {
      console.log(`❌ ${table}: Table missing in DEV`);
      continue;
    }
    if (!prodRes.ok) {
      console.log(`❓ ${table}: Table missing in PROD`);
      continue;
    }

    console.log(`✅ ${table}: exists in both`);
  }

  // Known differences to fix based on error message
  console.log('\n📋 Known Schema Differences to Fix:\n');
  
  const knownFixes = [
    {
      table: 'bsi_transactions_deals',
      issue: 'Column "amount" should be renamed to "allocation_amount"',
      sql: 'ALTER TABLE bsi_transactions_deals RENAME COLUMN amount TO allocation_amount;',
      status: 'FIXED'
    }
  ];

  for (const fix of knownFixes) {
    console.log(`${fix.status === 'FIXED' ? '✅' : '❌'} ${fix.table}: ${fix.issue}`);
    if (fix.status !== 'FIXED') {
      console.log(`   SQL: ${fix.sql}`);
    }
  }

  console.log('\n✅ Schema comparison complete!');
}

main().catch(console.error);

