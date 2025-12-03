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

console.log('🔍 Quick Verification');
console.log('====================\n');

async function quickCheck() {
  // Check 1: Duplicate table gone?
  try {
    const { error } = await supabase.from('auth_user_profiles').select('count(*)', { count: 'exact', head: true });
    if (error && error.code === 'PGRST116') {
      console.log('✅ Duplicate table removed');
    } else {
      console.log('❌ Duplicate table still exists');
    }
  } catch {
    console.log('✅ Duplicate table removed');
  }
  
  // Check 2: clerk_role column added?
  try {
    const { error } = await supabase.from('auth_user_profile').select('clerk_role').limit(1);
    if (error && error.message.includes('does not exist')) {
      console.log('❌ clerk_role column still missing');
    } else {
      console.log('✅ clerk_role column added');
    }
  } catch {
    console.log('❌ clerk_role column test failed');
  }
  
  // Check 3: Full query works?
  try {
    const { error } = await supabase.from('auth_user_profile').select('id, clerk_id, role, clerk_role').limit(1);
    if (error) {
      console.log('❌ Full query failed:', error.message);
    } else {
      console.log('✅ All columns accessible');
    }
  } catch {
    console.log('❌ Full query test failed');
  }
}

quickCheck();