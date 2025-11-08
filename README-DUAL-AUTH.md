# Dual Authentication Setup Guide

This branch contains the implementation for supporting **both Clerk and Supabase authentication** on the same database, allowing:
- **Next.js app** to use Clerk authentication
- **WeWeb app** to use Supabase authentication
- Both apps to share the same Supabase database

## Architecture Overview

```
┌─────────────────────┐         ┌─────────────────────┐
│   WeWeb App         │         │   Next.js App       │
│ (Supabase Auth)     │         │   (Clerk Auth)      │
└──────────┬──────────┘         └──────────┬──────────┘
           │                               │
           │ auth.uid() token              │ Clerk JWT token
           │                               │
           └───────────┬───────────────────┘
                       ↓
           ┌───────────────────────┐
           │  Supabase Database    │
           │  (Single Instance)    │
           │                       │
           │  ✓ Dual Auth RLS      │
           └───────────────────────┘
```

## Implementation Steps

### 1. Database Schema Changes

#### Add Supabase User ID Column

```sql
-- Add column to link Supabase auth users
ALTER TABLE auth_clerk_users
ADD COLUMN supabase_user_id uuid UNIQUE,
ADD CONSTRAINT auth_clerk_users_supabase_user_id_fkey 
  FOREIGN KEY (supabase_user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX idx_auth_clerk_users_supabase_user_id 
ON auth_clerk_users(supabase_user_id);

-- Add comments
COMMENT ON COLUMN auth_clerk_users.supabase_user_id IS 
  'Supabase auth.users UUID for WeWeb app users. NULL for Clerk-only users.';
```

### 2. Helper Functions

#### Get Current User ID (Either Auth Method)

```sql
-- Returns auth_clerk_users.id regardless of auth method
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS bigint
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT id 
  FROM auth_clerk_users
  WHERE 
    -- Clerk authentication (Next.js)
    clerk_user_id = (auth.jwt() ->> 'sub'::text)
    OR 
    -- Supabase authentication (WeWeb)
    supabase_user_id = auth.uid()
  LIMIT 1;
$$;

COMMENT ON FUNCTION public.get_current_user_id() IS 
  'Returns auth_clerk_users.id for current user via either Clerk or Supabase auth';
```

#### Check Transaction Access (Dual Auth)

```sql
-- Check if current user can access a transaction
CREATE OR REPLACE FUNCTION public.user_has_transaction_access_dual(
  transaction_id_param bigint
)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM auth_clerk_users acu
    WHERE (
      -- Check Clerk auth
      acu.clerk_user_id = (auth.jwt() ->> 'sub'::text)
      OR 
      -- Check Supabase auth
      acu.supabase_user_id = auth.uid()
    )
    AND (
      -- Check investor access
      EXISTS (
        SELECT 1 FROM bsi_transactions_investors bti
        WHERE bti.transaction_id = transaction_id_param
        AND bti.clerk_user_id = acu.id
      )
      OR
      -- Check deal access
      EXISTS (
        SELECT 1 FROM bsi_transactions_deals btd
        JOIN bsi_deals bd ON btd.deal_id = bd.deal_id
        WHERE btd.transaction_id = transaction_id_param
        AND bd.auth_clerk_users_id = acu.id
      )
    )
  );
$$;

COMMENT ON FUNCTION public.user_has_transaction_access_dual(bigint) IS 
  'Checks transaction access for users authenticated via Clerk or Supabase';
```

### 3. RLS Policy Examples

#### Transactions Table

```sql
-- Drop existing policy
DROP POLICY IF EXISTS "Users can view their transactions" 
ON "public"."bsi_transactions";

-- Create dual-auth policy
CREATE POLICY "Users can view their transactions - dual auth"
ON "public"."bsi_transactions"
FOR SELECT 
TO authenticated
USING (
  user_has_transaction_access_dual(id)
  OR
  -- Admin access (either auth method)
  EXISTS (
    SELECT 1 FROM auth_clerk_users acu
    WHERE (
      acu.clerk_user_id = (auth.jwt() ->> 'sub'::text)
      OR acu.supabase_user_id = auth.uid()
    )
    AND acu.role = 'admin'
  )
);
```

#### Generic Pattern for Other Tables

```sql
-- Template for updating any RLS policy
CREATE POLICY "policy_name_dual_auth"
ON "public"."table_name"
FOR SELECT 
TO authenticated
USING (
  -- Your existing access logic, but check both auth methods
  column_id IN (
    SELECT related.id
    FROM related_table related
    JOIN auth_clerk_users acu ON related.user_id = acu.id
    WHERE 
      acu.clerk_user_id = (auth.jwt() ->> 'sub'::text)  -- Clerk
      OR 
      acu.supabase_user_id = auth.uid()                  -- Supabase
  )
);
```

### 4. User Registration Triggers

#### Auto-create auth_clerk_users for Supabase users

```sql
-- Trigger function to handle new Supabase auth users
CREATE OR REPLACE FUNCTION public.handle_new_supabase_user()
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
BEGIN
  -- Create auth_clerk_users record for new Supabase auth user
  INSERT INTO public.auth_clerk_users (
    email,
    supabase_user_id,
    clerk_user_id,
    role,
    is_active_yn
  ) VALUES (
    NEW.email,
    NEW.id,              -- Supabase UUID
    NULL,                -- No Clerk ID
    'balance_sheet_investor',
    true
  )
  ON CONFLICT (supabase_user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_supabase_user();

COMMENT ON FUNCTION public.handle_new_supabase_user() IS 
  'Automatically creates auth_clerk_users record when Supabase user signs up via WeWeb';
```

### 5. Application Configuration

#### Next.js (Clerk Auth) - No Changes Needed

```typescript
// src/hooks/use-supabase.ts
// Existing configuration works as-is
const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  global: {
    headers: {
      Authorization: `Bearer ${clerkToken}`,
    },
  },
});
```

#### WeWeb Configuration

In WeWeb, use standard Supabase authentication:
- Enable Supabase Auth plugin
- Configure with your Supabase URL and anon key
- WeWeb automatically handles `auth.uid()`
- RLS policies will recognize WeWeb users via Supabase auth

## Migration Strategy

### Phase 1: Additive Changes (Safe)
1. ✅ Add `supabase_user_id` column (nullable)
2. ✅ Create helper functions
3. ✅ Add trigger for new users
4. ⚠️ Test: Verify Clerk auth still works

### Phase 2: Update RLS Policies (Medium Risk)
1. ⚠️ Update one table at a time
2. ⚠️ Test after each table update
3. ⚠️ Keep admin access working
4. ✅ Commit after each successful update

### Phase 3: Testing
1. Test Clerk login (Next.js)
2. Test Supabase login (WeWeb)
3. Test data access for both
4. Test RLS policies with both auth methods

## Rollback Plan

### Quick Rollback Migration

```sql
-- Revert to Clerk-only authentication
-- migrations/YYYYMMDDHHMMSS_rollback_to_clerk_only.sql

-- Remove trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_supabase_user();

-- Remove helper functions
DROP FUNCTION IF EXISTS public.user_has_transaction_access_dual(bigint);
DROP FUNCTION IF EXISTS public.get_current_user_id();

-- Remove column (only if no data)
ALTER TABLE auth_clerk_users 
DROP COLUMN IF EXISTS supabase_user_id;

-- Restore original RLS policies
-- (Re-run the current Clerk-only policies from main branch)
```

## Testing Checklist

### Clerk Authentication (Next.js)
- [ ] Login with Clerk works
- [ ] Transactions page loads
- [ ] Can view own transactions
- [ ] Can view deals
- [ ] Admin access works
- [ ] Document upload works

### Supabase Authentication (WeWeb)
- [ ] Signup creates auth_clerk_users record
- [ ] Login works
- [ ] Can query transactions
- [ ] RLS policies allow correct access
- [ ] No access to other users' data

### Edge Cases
- [ ] User exists in both systems (same email)
- [ ] Admin via Clerk can access all data
- [ ] Admin via Supabase can access all data
- [ ] Logout/re-login works for both

## Benefits

✅ **Single source of truth** - One database for all data
✅ **Shared data** - Both apps access same transactions, deals
✅ **Independent auth** - Each app uses preferred system
✅ **User flexibility** - Same user can access via either app
✅ **Cost effective** - One database to maintain
✅ **Data consistency** - No sync issues

## Considerations

⚠️ **Slightly complex RLS** - Must check both auth methods
⚠️ **User linking** - Handle when same user uses both apps
⚠️ **Testing overhead** - Test both auth paths
⚠️ **Performance** - OR conditions in policies (minimal impact)

## Support

For questions or issues:
1. Check the main branch for working Clerk-only version
2. Review RLS policies in `supabase/database/row_level_security_policies.sql`
3. Test with local Supabase first: `supabase start`

## References

- [Clerk + Supabase Integration](https://clerk.com/docs/integrations/databases/supabase)
- [Supabase Third-Party Auth](https://supabase.com/docs/guides/auth/third-party/overview)
- [WeWeb Supabase Auth](https://docs.weweb.io/plugins/auth-systems/supabase-auth.html)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)

