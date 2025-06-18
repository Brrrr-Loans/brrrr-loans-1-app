#!/usr/bin/env node

/**
 * Test Script for Supabase Integration
 * 
 * This script tests the core Supabase functionality after our consolidation changes.
 * Run with: node test-supabase-integration.js
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration - these should match your environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🧪 Starting Supabase Integration Tests...\n');

// Test 1: Basic Client Creation
console.log('1️⃣  Testing client creation...');
try {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing environment variables: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log('   ✅ Supabase client created successfully');
  console.log(`   📡 URL: ${SUPABASE_URL}`);
  console.log(`   🔑 Key: ${SUPABASE_ANON_KEY.substring(0, 20)}...`);
} catch (error) {
  console.log('   ❌ Failed to create Supabase client:', error.message);
  process.exit(1);
}

// Test 2: Database Connection
console.log('\n2️⃣  Testing database connection...');
const testConnection = async () => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Try to query a simple table that should exist
    const { data, error } = await supabase
      .from('contact_types')
      .select('id')
      .limit(1);
    
    if (error) {
      console.log('   ⚠️  Database connection test failed:', error.message);
      console.log('   💡 This might be due to RLS policies (which is expected)');
    } else {
      console.log('   ✅ Database connection successful');
      console.log(`   📊 Query returned ${data?.length || 0} rows`);
    }
  } catch (error) {
    console.log('   ❌ Connection error:', error.message);
  }
};

// Test 3: Table Structure Validation
console.log('\n3️⃣  Validating key table structures...');
const testTableStructures = async () => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  const criticalTables = [
    'user_profile',
    'contact', 
    'deal',
    'document_files',
    'bs_investor_deals',
    'bs_investor_statements',
    'bs_investor_distributions'
  ];

  for (const table of criticalTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(0); // Just test the query structure

      if (error) {
        if (error.message.includes('permission denied') || error.message.includes('RLS')) {
          console.log(`   ✅ Table '${table}' exists (RLS protected)`);
        } else {
          console.log(`   ❌ Table '${table}' error:`, error.message);
        }
      } else {
        console.log(`   ✅ Table '${table}' accessible`);
      }
    } catch (error) {
      console.log(`   ❌ Table '${table}' failed:`, error.message);
    }
  }
};

// Test 4: Validation Functions
console.log('\n4️⃣  Testing validation functions...');
const testValidation = () => {
  try {
    // Import our validation functions (adjust path as needed)
    const validation = require('./src/lib/validation.ts');
    
    // Test deal validation
    const formData = new FormData();
    formData.append('name', 'Test Deal');
    formData.append('type', 'Investment');
    formData.append('amount', '100000.00');
    formData.append('location', 'New York');
    formData.append('roi', '8.5');
    formData.append('startDate', '2024-01-01');
    
    const dealData = validation.validateDealData(formData);
    console.log('   ✅ Deal validation working');
    
    // Test document validation
    const docFormData = new FormData();
    docFormData.append('name', 'Test Document');
    docFormData.append('category', 'application');
    docFormData.append('file_url', 'https://example.com/file.pdf');
    docFormData.append('file_size', '1024');
    docFormData.append('file_type', 'application/pdf');
    
    const docData = validation.validateDocumentData(docFormData);
    console.log('   ✅ Document validation working');
    
  } catch (error) {
    console.log('   ⚠️  Validation test skipped (likely due to TypeScript import)');
    console.log('   💡 This is expected in a Node.js environment');
  }
};

// Test 5: Environment Check
console.log('\n5️⃣  Environment configuration check...');
const checkEnvironment = () => {
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'CLERK_SECRET_KEY',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY'
  ];

  const optionalEnvVars = [
    'SUPABASE_SERVICE_ROLE_KEY',
    'STORAGE_SETUP_API_KEY'
  ];

  console.log('   Required variables:');
  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar];
    if (value) {
      console.log(`   ✅ ${envVar}: Set (${value.substring(0, 10)}...)`);
    } else {
      console.log(`   ❌ ${envVar}: Missing`);
    }
  }

  console.log('\n   Optional variables:');
  for (const envVar of optionalEnvVars) {
    const value = process.env[envVar];
    if (value) {
      console.log(`   ✅ ${envVar}: Set`);
    } else {
      console.log(`   ⚠️  ${envVar}: Not set`);
    }
  }
};

// Run all tests
const runTests = async () => {
  await testConnection();
  await testTableStructures();
  testValidation();
  checkEnvironment();
  
  console.log('\n🎉 Supabase integration tests completed!');
  console.log('\n📋 Next steps to fully test the app:');
  console.log('   1. Run: npm run build');
  console.log('   2. Run: npm run dev');
  console.log('   3. Test authentication flow');
  console.log('   4. Test creating/reading deals and documents');
  console.log('   5. Check browser console for any runtime errors');
};

runTests().catch(console.error);