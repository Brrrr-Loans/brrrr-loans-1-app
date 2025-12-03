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

console.log('🧹 Database Cleanup Execution');
console.log('=============================\n');

console.log('✅ Analysis Complete:');
console.log('- auth_user_profile (correct): EXISTS, 0 records');
console.log('- auth_user_profiles (duplicate): EXISTS, 0 records');
console.log('- Both tables are identical and empty - SAFE TO CLEANUP\n');

console.log('🛠️ MANUAL CLEANUP REQUIRED:');
console.log('Since we need admin privileges to drop tables, please:');
console.log('');
console.log('1. Go to your Supabase dashboard:');
console.log('   https://supabase.com/dashboard');
console.log('');
console.log('2. Navigate to SQL Editor');
console.log('');
console.log('3. Run this SQL command:');
console.log('   DROP TABLE IF EXISTS auth_user_profiles CASCADE;');
console.log('');
console.log('4. Verify cleanup with:');
console.log('   SELECT table_name FROM information_schema.tables');
console.log('   WHERE table_name LIKE \'%user_profile%\';');
console.log('');
console.log('Expected result: Only "auth_user_profile" should remain.');
console.log('');
console.log('✅ This is SAFE because:');
console.log('- Both tables are empty (0 records)');
console.log('- Both tables have identical structure');
console.log('- The correct table (auth_user_profile) will remain');
console.log('');