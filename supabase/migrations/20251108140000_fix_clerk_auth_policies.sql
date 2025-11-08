-- Migration: Fix Clerk Authentication in RLS Policies
-- Problem: Policies were using auth.uid() which returns Supabase UUID
-- Solution: Use auth.jwt() ->> 'sub' to get Clerk user ID string

-- ============================================================================
-- FIX BSI_TRANSACTIONS_INVESTORS RLS POLICY
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their transaction allocations" ON "public"."bsi_transactions_investors";

CREATE POLICY "Users can view their transaction allocations" 
ON "public"."bsi_transactions_investors"
FOR SELECT 
TO public
USING (
  clerk_user_id IN (
    SELECT auth_clerk_users.id
    FROM auth_clerk_users
    WHERE auth_clerk_users.clerk_user_id = (auth.jwt() ->> 'sub'::text)
  ) 
  OR 
  EXISTS (
    SELECT 1
    FROM auth_clerk_users
    WHERE auth_clerk_users.clerk_user_id = (auth.jwt() ->> 'sub'::text)
    AND auth_clerk_users.role = 'admin'::user_role_internal
  )
);

-- ============================================================================
-- FIX BSI_TRANSACTIONS_DEALS RLS POLICY
-- ============================================================================

DROP POLICY IF EXISTS "Users can view transaction deal allocations" ON "public"."bsi_transactions_deals";

CREATE POLICY "Users can view transaction deal allocations"
ON "public"."bsi_transactions_deals"
FOR SELECT
TO public  
USING (
  EXISTS (
    SELECT 1
    FROM bsi_transactions t
    JOIN bsi_transactions_investors ti ON t.id = ti.transaction_id
    WHERE t.id = bsi_transactions_deals.transaction_id
    AND ti.clerk_user_id IN (
      SELECT auth_clerk_users.id
      FROM auth_clerk_users
      WHERE auth_clerk_users.clerk_user_id = (auth.jwt() ->> 'sub'::text)
    )
  ) 
  OR 
  EXISTS (
    SELECT 1
    FROM auth_clerk_users
    WHERE auth_clerk_users.clerk_user_id = (auth.jwt() ->> 'sub'::text)
    AND auth_clerk_users.role = 'admin'::user_role_internal
  )
);

-- ============================================================================
-- FIX ADMIN POLICIES ON BSI_TRANSACTIONS
-- ============================================================================

DROP POLICY IF EXISTS "Admins can delete transactions" ON "public"."bsi_transactions";
DROP POLICY IF EXISTS "Admins can update transactions" ON "public"."bsi_transactions";

CREATE POLICY "Admins can delete transactions"
ON "public"."bsi_transactions"
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM auth_clerk_users p
    WHERE p.clerk_user_id = (auth.jwt() ->> 'sub'::text)
    AND p.role = 'admin'::user_role_internal
  )
);

CREATE POLICY "Admins can update transactions"
ON "public"."bsi_transactions"
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM auth_clerk_users p
    WHERE p.clerk_user_id = (auth.jwt() ->> 'sub'::text)
    AND p.role = 'admin'::user_role_internal
  )
);

