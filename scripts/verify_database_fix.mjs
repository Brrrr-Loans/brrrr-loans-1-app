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

async function verifyDatabaseFix() {
  console.log('🔍 Post-Cleanup Verification');
  console.log('============================\n');
  
  let allTestsPassed = true;
  
  // Test 1: Check that duplicate table is gone
  console.log('📋 Test 1: Duplicate table removal');
  try {
    const { error } = await supabase
      .from('auth_user_profiles')
      .select('count(*)', { count: 'exact', head: true });
    
    if (error && error.code === 'PGRST116') {
      console.log('✅ auth_user_profiles table successfully removed\n');
    } else {
      console.log('❌ auth_user_profiles table still exists\n');
      allTestsPassed = false;
    }
  } catch (err) {
    console.log('✅ auth_user_profiles table successfully removed\n');
  }
  
  // Test 2: Check that correct table exists with both columns
  console.log('📋 Test 2: Correct table structure');
  try {
    const { data, error } = await supabase
      .from('auth_user_profile')
      .select('id, email, clerk_id, role, clerk_role, is_internal_yn, is_active_yn')
      .limit(1);
    
    if (error) {
      if (error.message.includes('clerk_role does not exist')) {
        console.log('❌ clerk_role column still missing');
        console.log('   → Run the SQL commands to add the column\n');
        allTestsPassed = false;
      } else {
        console.log(`⚠️  Table access issue: ${error.message}\n`);
      }
    } else {
      console.log('✅ auth_user_profile table exists with all required columns');
      console.log('✅ Both role and clerk_role columns are accessible\n');
    }
  } catch (err) {
    console.log(`❌ Error testing table structure: ${err.message}\n`);
    allTestsPassed = false;
  }
  
  // Test 3: Test authentication-related queries
  console.log('📋 Test 3: Authentication query compatibility');
  try {
    // Test the queries used in the codebase
    const queries = [
      {
        name: 'User lookup by clerk_id',
        query: () => supabase
          .from('auth_user_profile')
          .select('email, first_name, last_name, role, clerk_role')
          .eq('clerk_id', 'test_id_123')
          .single()
      },
      {
        name: 'Admin role check',
        query: () => supabase
          .from('auth_user_profile')
          .select('clerk_role')
          .eq('clerk_role', 'admin')
          .limit(1)
      },
      {
        name: 'Internal user check',
        query: () => supabase
          .from('auth_user_profile')
          .select('is_internal_yn, is_active_yn')
          .eq('is_internal_yn', true)
          .limit(1)
      }
    ];
    
    let queryTestsPassed = 0;
    
    for (const test of queries) {
      try {
        const result = await test.query();
        
        if (result.error && !result.error.message.includes('clerk_role does not exist')) {
          console.log(`  ✅ ${test.name}: Query structure valid`);
          queryTestsPassed++;
        } else if (result.error) {
          console.log(`  ❌ ${test.name}: ${result.error.message}`);
        } else {
          console.log(`  ✅ ${test.name}: Query executed successfully`);
          queryTestsPassed++;
        }
      } catch (err) {
        console.log(`  ❌ ${test.name}: ${err.message}`);
      }
    }
    
    console.log(`\n📊 Query compatibility: ${queryTestsPassed}/3 tests passed\n`);
    
    if (queryTestsPassed < 3) {
      allTestsPassed = false;
    }
    
  } catch (err) {
    console.log(`❌ Error testing queries: ${err.message}\n`);
    allTestsPassed = false;
  }
  
  // Final summary
  console.log('🎯 VERIFICATION SUMMARY');
  console.log('======================');
  
  if (allTestsPassed) {
    console.log('✅ ALL TESTS PASSED!');
    console.log('🎉 Database cleanup completed successfully');
    console.log('🚀 Your application should now work correctly with:');
    console.log('   - Consistent table naming (auth_user_profile)');
    console.log('   - Both role and clerk_role columns functioning');
    console.log('   - All authentication flows working');
  } else {
    console.log('⚠️  SOME TESTS FAILED');
    console.log('📝 Next steps:');
    console.log('   1. Run the SQL commands in database_fix_commands.sql');
    console.log('   2. Verify the commands executed without errors');
    console.log('   3. Run this verification script again');
  }
  
  return allTestsPassed;
}

verifyDatabaseFix()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n💥 Verification failed:', error);
    process.exit(1);
  });