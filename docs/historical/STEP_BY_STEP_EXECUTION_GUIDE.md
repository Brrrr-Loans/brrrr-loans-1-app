# Step-by-Step Execution Guide

## 🎯 **Overview**

This guide walks you through executing Steps 1 and 2 of the database cleanup and authentication testing process.

## 📋 **Prerequisites**

1. Access to your Supabase project dashboard
2. Node.js installed (already available in this workspace)
3. Your Supabase environment variables

---

## 🔧 **Step 1: Database Cleanup**

### **1.1 Get Your Supabase Credentials**

1. **Go to your Supabase Dashboard:**

   - Visit: [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project

2. **Navigate to API Settings:**
   - Go to `Settings` → `API`
   - Copy the following values:
     - **Project URL** (starts with `https://`)
     - **anon/public key** (starts with `eyJ`)
     - **service_role key** (starts with `eyJ`) - Optional but recommended

### **1.2 Set Environment Variables**

### **Option A: Export in your terminal (temporary)**

```bash
export NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
export SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### **Option B: Create a .env.local file (recommended)**

```bash
# Create .env.local in your project root
cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EOF

# Load the environment variables
source .env.local
```

### **1.3 Run Database Cleanup Analysis**

```bash
node database-cleanup.mjs
```

**Expected Output Scenarios:**

### **✅ Scenario A: No Cleanup Needed**

```text
🎉 GOOD NEWS: The duplicate table "auth_user_profiles" does not exist!
No cleanup needed. The table naming is already consistent.
```

### **⚠️ Scenario B: Manual Cleanup Required**

```text
⚠️ FOUND DUPLICATE TABLE: auth_user_profiles
This duplicate table contains X records.

🛑 MANUAL ACTION REQUIRED:
[Detailed SQL instructions will be shown]
```

### **1.4 Manual Database Cleanup (if needed)**

If the script detects a duplicate table, follow these steps:

1. **Go to Supabase SQL Editor:**

   - In your Supabase dashboard, go to `SQL Editor`

2. **Check duplicate table data:**

   ```sql
   SELECT COUNT(*) FROM auth_user_profiles;
   SELECT * FROM auth_user_profiles LIMIT 5;
   ```

3. **Backup data if needed:**

   ```sql
   -- Only if the duplicate table has important data
   CREATE TABLE auth_user_profiles_backup AS
   SELECT * FROM auth_user_profiles;
   ```

4. **Drop the duplicate table:**

   ```sql
   DROP TABLE IF EXISTS auth_user_profiles CASCADE;
   ```

5. **Verify cleanup:**

   ```sql
   SELECT table_name FROM information_schema.tables
   WHERE table_name LIKE '%user_profile%';
   ```

   **Expected result:** Only `auth_user_profile` should appear.

---

## 🔐 **Step 2: Authentication Flow Testing**

### **2.1 Run Comprehensive Tests**

```bash
node auth-flow-test.mjs
```

### **2.2 Test Results Analysis**

The test suite will check:

### **📋 Test 1: Table Access**

- ✅ `auth_user_profile` exists and is accessible
- ✅ `auth_user_profiles` does not exist

### **🏗️ Test 2: Table Structure**

- ✅ Required fields are present
- ✅ Data types are correct

### **👤 Test 3: Clerk Integration**

- ✅ `clerk_id` field works
- ✅ `clerk_role` field works

### **💻 Test 4: Code Compatibility**

- ✅ All query patterns work
- ✅ No breaking changes

### **🔒 Test 5: Security (RLS)**

- ✅ Row Level Security is properly configured

### **2.3 Test Your Application**

After the automated tests pass, manually test key features:

1. **Sign in/Sign up flows**
2. **User profile access**
3. **Role-based permissions**
4. **Any custom authentication logic**

---

## 🤔 **Step 3: Should You Recreate Database from Scratch?**

### **✅ NO RECREATION NEEDED IF:**

- ✅ Steps 1 & 2 complete successfully
- ✅ Your application works correctly
- ✅ You have production data you want to keep
- ✅ Authentication flows work properly

### **⚠️ CONSIDER RECREATION IF:**

- ❌ Multiple table naming inconsistencies
- ❌ Significant migration issues
- ❌ This is a development environment without important data
- ❌ You want a completely clean schema

### **🔄 Recreation Process (if needed):**

**If you decide to recreate:**

1. **Backup your data:**

   ```bash
   # Use Supabase CLI or pg_dump
   supabase db dump > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **Reset the database:**

   ```bash
   supabase db reset
   ```

3. **Run migrations:**

   ```bash
   supabase db push
   ```

4. **Restore data (if needed):**

   ```bash
   psql -d your_database -f backup_file.sql
   ```

---

## 📊 **Execution Summary**

### **For Most Cases (Recommended):**

```bash
# 1. Set environment variables (choose method above)
source .env.local  # or export commands

# 2. Run database cleanup analysis
node database-cleanup.mjs

# 3. Follow any manual cleanup instructions if shown

# 4. Run authentication tests
node auth-flow-test.mjs

# 5. Test your application manually
npm run dev  # or your start command
```

### **Expected Timeline:**

- ⏱️ **Environment setup:** 5 minutes
- ⏱️ **Database analysis:** 30 seconds
- ⏱️ **Manual cleanup (if needed):** 2-5 minutes
- ⏱️ **Authentication testing:** 1 minute
- ⏱️ **Application testing:** 10-15 minutes

### **Success Criteria:**

- ✅ `auth_user_profiles` table removed
- ✅ `auth_user_profile` table working
- ✅ All authentication tests pass
- ✅ Application sign-in/up flows work
- ✅ No console errors related to table names

---

## 🆘 **Troubleshooting**

### **Environment Variable Issues:**

```bash
# Check if variables are set
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### **Permission Issues:**

- Make sure you're using the service role key for administrative operations
- Check your RLS policies in Supabase dashboard

### **Connection Issues:**

- Verify your Supabase project is active
- Check your internet connection
- Confirm your API keys are correct

### **Need Help?**

- Check the script output for specific error messages
- Review your Supabase project logs
- Verify your database schema in the Supabase dashboard

---

## 🎉 **Next Steps After Success**

1. ✅ Update your documentation to use `auth_user_profile`
2. ✅ Deploy your updated codebase
3. ✅ Monitor for any authentication issues
4. ✅ Consider setting up automated tests for this scenario
5. ✅ Update your team about the table name standardization

---

**💡 Remember:** The code changes have already been applied successfully. These steps just verify and complete the database-side cleanup!
