/**
 * Import auth_clerk_users and auth_clerk_orgs to DEV
 * Then update clerk_user_ids with Dev Clerk IDs
 */

import { createClient } from '@supabase/supabase-js';

const PROD_URL = 'https://gsxggtsgqskhchcbrmhe.supabase.co';
const PROD_KEY = process.env.PROD_SUPABASE_SERVICE_KEY || '';

const DEV_URL = 'https://cjbevtvvlthelhbjlqmp.supabase.co';
const DEV_KEY = process.env.DEV_SUPABASE_SERVICE_KEY || '';

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

  console.log('🚀 Import Users to DEV\n');

  // ============================================
  // STEP 1: Import auth_clerk_users
  // ============================================
  console.log('📦 Step 1: Importing auth_clerk_users...');
  
  const { data: prodUsers, error: usersError } = await prod.from('auth_clerk_users').select('*');
  
  if (usersError) {
    console.error('  ❌ Error fetching:', usersError.message);
    return;
  }
  
  if (prodUsers && prodUsers.length > 0) {
    // Transform: replace clerk_user_id with dev IDs where available
    // Exclude generated columns: full_name
    const usersToInsert = prodUsers.map(user => {
      const devClerkId = CLERK_DEV_IDS[user.email];
      const { full_name, ...rest } = user; // Remove generated column
      return {
        ...rest,
        clerk_user_id: devClerkId || user.clerk_user_id, // Use dev ID if available
      };
    });
    
    // Insert users
    const { error } = await dev.from('auth_clerk_users').upsert(usersToInsert, { onConflict: 'id' });
    
    if (error) {
      console.log(`  ❌ Error: ${error.message}`);
    } else {
      console.log(`  ✅ Imported ${prodUsers.length} users`);
      
      // Show which ones got dev IDs
      const withDevIds = usersToInsert.filter(u => CLERK_DEV_IDS[u.email]);
      console.log(`  📋 ${withDevIds.length} users mapped to Dev Clerk IDs`);
    }
  }

  // ============================================
  // STEP 2: Import auth_clerk_orgs
  // ============================================
  console.log('\n📦 Step 2: Importing auth_clerk_orgs...');
  
  const { data: prodOrgs, error: orgsError } = await prod.from('auth_clerk_orgs').select('*');
  
  if (orgsError) {
    console.error('  ❌ Error fetching:', orgsError.message);
  } else if (prodOrgs && prodOrgs.length > 0) {
    // Map created_by_clerk_user_id to dev clerk IDs
    // First, get the dev user IDs by email
    const { data: devUsers } = await dev.from('auth_clerk_users').select('email, clerk_user_id');
    const devUserMap = new Map<string, string>();
    if (devUsers) {
      for (const u of devUsers) {
        devUserMap.set(u.email, u.clerk_user_id);
      }
    }
    
    // Also look up prod users to map clerk_user_ids
    const { data: allProdUsers } = await prod.from('auth_clerk_users').select('clerk_user_id, email');
    const prodToDevClerkId = new Map<string, string>();
    if (allProdUsers) {
      for (const u of allProdUsers) {
        const devClerkId = devUserMap.get(u.email) || CLERK_DEV_IDS[u.email];
        if (devClerkId) {
          prodToDevClerkId.set(u.clerk_user_id, devClerkId);
        }
      }
    }
    
    const orgsToInsert = prodOrgs.map(org => ({
      ...org,
      created_by_clerk_user_id: prodToDevClerkId.get(org.created_by_clerk_user_id) || org.created_by_clerk_user_id,
    }));
    
    const { error } = await dev.from('auth_clerk_orgs').upsert(orgsToInsert, { onConflict: 'id' });
    
    if (error) {
      console.log(`  ❌ Error: ${error.message}`);
    } else {
      console.log(`  ✅ Imported ${prodOrgs.length} orgs`);
    }
  }

  // ============================================
  // STEP 3: Import auth_clerk_orgs_members
  // ============================================
  console.log('\n📦 Step 3: Importing auth_clerk_orgs_members...');
  
  const { data: prodMembers, error: membersError } = await prod.from('auth_clerk_orgs_members').select('*');
  
  if (membersError) {
    console.error('  ❌ Error fetching:', membersError.message);
  } else if (prodMembers && prodMembers.length > 0) {
    const { error } = await dev.from('auth_clerk_orgs_members').upsert(prodMembers, { onConflict: 'id' });
    
    if (error) {
      console.log(`  ❌ Error: ${error.message}`);
    } else {
      console.log(`  ✅ Imported ${prodMembers.length} org members`);
    }
  }

  // ============================================
  // VERIFICATION
  // ============================================
  console.log('\n📊 Verification:');
  
  const { count: userCount } = await dev.from('auth_clerk_users').select('*', { count: 'exact', head: true });
  const { count: orgCount } = await dev.from('auth_clerk_orgs').select('*', { count: 'exact', head: true });
  const { count: memberCount } = await dev.from('auth_clerk_orgs_members').select('*', { count: 'exact', head: true });
  
  console.log(`  - Users: ${userCount}`);
  console.log(`  - Orgs: ${orgCount}`);
  console.log(`  - Org Members: ${memberCount}`);
  
  // Check akraut@brrrr.com specifically
  const { data: akraut } = await dev
    .from('auth_clerk_users')
    .select('email, clerk_user_id, role, is_internal_yn')
    .eq('email', 'akraut@brrrr.com')
    .single();
  
  if (akraut) {
    console.log(`\n  akraut@brrrr.com:`);
    console.log(`    clerk_user_id: ${akraut.clerk_user_id}`);
    console.log(`    role: ${akraut.role}`);
    console.log(`    is_internal_yn: ${akraut.is_internal_yn}`);
  }

  console.log('\n✅ Complete!');
}

main().catch(console.error);

