-- Migration: Fix RLS policies to use updated table and column names
-- Date: 2025-01-03
-- Description: Update all RLS policies to reference auth_clerk_users table and clerk_user_id column

-- Drop existing admin policies that might exist (using IF EXISTS to avoid errors)
DROP POLICY IF EXISTS "Admin can view all bsi_deals" ON "public"."bsi_deals";
DROP POLICY IF EXISTS "Admin can view all deals" ON "public"."deal";
DROP POLICY IF EXISTS "Admin can view all distributions" ON "public"."bsi_distributions";
DROP POLICY IF EXISTS "Admin can view all statements" ON "public"."bsi_statements";
DROP POLICY IF EXISTS "Admin can view all contacts" ON "public"."contact";
DROP POLICY IF EXISTS "Admin can view all documents" ON "public"."document_files";
-- Note: auth_user_profiles policies will be handled separately since table was renamed

-- Recreate admin policies with correct table and column names
CREATE POLICY "Admin can view all bsi_deals" ON "public"."bsi_deals"
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth_clerk_users acu
    WHERE acu.clerk_user_id = (auth.jwt() ->> 'sub')
    AND acu.role = 'admin'
  )
);

CREATE POLICY "Admin can view all deals" ON "public"."deal"
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth_clerk_users acu
    WHERE acu.clerk_user_id = (auth.jwt() ->> 'sub')
    AND acu.role = 'admin'
  )
);

CREATE POLICY "Admin can view all distributions" ON "public"."bsi_distributions"
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth_clerk_users acu
    WHERE acu.clerk_user_id = (auth.jwt() ->> 'sub')
    AND acu.role = 'admin'
  )
);

CREATE POLICY "Admin can view all statements" ON "public"."bsi_statements"
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth_clerk_users acu
    WHERE acu.clerk_user_id = (auth.jwt() ->> 'sub')
    AND acu.role = 'admin'
  )
);

CREATE POLICY "Admin can view all contacts" ON "public"."contact"
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth_clerk_users acu
    WHERE acu.clerk_user_id = (auth.jwt() ->> 'sub')
    AND acu.role = 'admin'
  )
);

CREATE POLICY "Admin can view all documents" ON "public"."document_files"
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth_clerk_users acu
    WHERE acu.clerk_user_id = (auth.jwt() ->> 'sub')
    AND acu.role = 'admin'
  )
);

-- Update user profile policies to use new table name
CREATE POLICY "Users can view their profile" ON "public"."auth_clerk_users"
FOR SELECT TO authenticated
USING (clerk_user_id = (auth.jwt() ->> 'sub'));

CREATE POLICY "Users can update their profile" ON "public"."auth_clerk_users"
FOR UPDATE TO authenticated
USING (clerk_user_id = (auth.jwt() ->> 'sub'))
WITH CHECK (clerk_user_id = (auth.jwt() ->> 'sub'));

-- Add comment to document the fix
COMMENT ON POLICY "Admin can view all deals" ON "public"."deal" IS 'Updated to use auth_clerk_users table and clerk_user_id column - fixed on 2025-01-03';
