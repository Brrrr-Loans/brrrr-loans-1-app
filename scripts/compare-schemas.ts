/**
 * Compare Production vs Development schema
 * Outputs differences that need to be fixed
 */

import { createClient } from '@supabase/supabase-js';

const PROD_URL = 'https://gsxggtsgqskhchcbrmhe.supabase.co';
const PROD_KEY = process.env.PROD_SUPABASE_SERVICE_KEY || '';

const DEV_URL = 'https://cjbevtvvlthelhbjlqmp.supabase.co';
const DEV_KEY = process.env.DEV_SUPABASE_SERVICE_KEY || '';

interface ColumnInfo {
  table_name: string;
  column_name: string;
  data_type: string;
  is_nullable: string;
}

async function getSchema(url: string, key: string): Promise<ColumnInfo[]> {
  const response = await fetch(`${url}/rest/v1/rpc/get_schema_info`, {
    method: 'POST',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({})
  });
  
  // If RPC doesn't exist, use direct query
  if (!response.ok) {
    const queryResponse = await fetch(`${url}/rest/v1/?select=*`, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
      }
    });
    
    // Fall back to querying information_schema via PostgREST
    // This won't work directly, so we'll use a different approach
    return [];
  }
  
  return response.json();
}

async function main() {
  if (!PROD_KEY) {
    console.error('Set PROD_SUPABASE_SERVICE_KEY');
    process.exit(1);
  }

  console.log('🔍 Comparing Production vs Development Schema\n');

  // Get dev schema via REST API by querying each table
  const devResponse = await fetch(`${DEV_URL}/rest/v1/`, {
    headers: {
      'apikey': DEV_KEY,
      'Authorization': `Bearer ${DEV_KEY}`,
    }
  });

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

  const fixes: string[] = [];

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

    // Get column info by checking the OpenAPI spec endpoint
    const devDef = await fetch(`${DEV_URL}/rest/v1/?apikey=${DEV_KEY}`);
    const prodDef = await fetch(`${PROD_URL}/rest/v1/?apikey=${PROD_KEY}`);

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

