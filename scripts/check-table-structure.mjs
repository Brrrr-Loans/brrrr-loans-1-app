#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL) {
  console.error('❌ Missing required environment variable');
  console.error('Set either NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL in your .env.local file');
  console.error('Find it in: Supabase Dashboard > Project Settings > API > Project URL');
  process.exit(1);
}

if (!SUPABASE_ANON_KEY) {
  console.error('❌ Missing required environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY');
  console.error('Add it to your .env.local file');
  console.error('Find it in: Supabase Dashboard > Project Settings > API > anon/public key');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkTableStructure() {
  console.log('🔍 Checking Table Structure\n');
  
  const tables = ['auth_user_profile', 'auth_user_profiles'];
  
  for (const table of tables) {
    console.log(`📋 Table: ${table}`);
    console.log('='.repeat(40));
    
    try {
      // Try to get basic info first
      const { count, error: countError } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        console.log(`❌ Cannot access table: ${countError.message}\n`);
        continue;
      }
      
      console.log(`📊 Record count: ${count || 0}`);
      
      // Test specific columns we need
      const columnsToTest = [
        'id',
        'email', 
        'first_name',
        'last_name',
        'clerk_id',
        'clerk_role',
        'is_internal_yn',
        'is_active_yn',
        'role',
        'contact_id'
      ];
      
      console.log('\n🔍 Testing column existence:');
      const existingColumns = [];
      
      for (const column of columnsToTest) {
        try {
          const { error } = await supabase
            .from(table)
            .select(column)
            .limit(1);
          
          if (error) {
            if (error.message.includes('does not exist')) {
              console.log(`  ❌ ${column}: missing`);
            } else {
              console.log(`  ⚠️  ${column}: ${error.message}`);
            }
          } else {
            console.log(`  ✅ ${column}: exists`);
            existingColumns.push(column);
          }
        } catch (err) {
          console.log(`  ❌ ${column}: ${err.message}`);
        }
      }
      
      console.log(`\n✅ Existing columns: ${existingColumns.join(', ')}`);
      
    } catch (err) {
      console.log(`❌ Error checking table: ${err.message}`);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
  }
}

checkTableStructure();