-- Row Level Security Policies for Multi-layered Access Control
-- This ensures users can only access data they're authorized to see

-- ============================================================================
-- BSI_DEALS TABLE POLICIES
-- ============================================================================

-- Policy: Users can only view deals they're associated with
CREATE POLICY "Users can view their associated deals" ON "public"."bsi_deals"
FOR SELECT TO authenticated
USING (
  contact_id IN (
    SELECT c.id 
    FROM contact c
    JOIN auth_user_profile aup ON c.email_address = aup.email
    WHERE aup.clerk_id = (auth.jwt() ->> 'sub'::text)
  )
);

-- Policy: Users can insert deals only for themselves
CREATE POLICY "Users can insert deals for themselves" ON "public"."bsi_deals"
FOR INSERT TO authenticated
WITH CHECK (
  contact_id IN (
    SELECT c.id 
    FROM contact c
    JOIN auth_user_profile aup ON c.email_address = aup.email
    WHERE aup.clerk_id = (auth.jwt() ->> 'sub'::text)
  )
);

-- ============================================================================
-- DEAL TABLE POLICIES
-- ============================================================================

-- Policy: Users can view deals they have access to through bsi_deals
CREATE POLICY "Users can view accessible deals" ON "public"."deal"
FOR SELECT TO authenticated
USING (
  id IN (
    SELECT bd.deal_id
    FROM bsi_deals bd
    JOIN contact c ON bd.contact_id = c.id
    JOIN auth_user_profile aup ON c.email_address = aup.email
    WHERE aup.clerk_id = (auth.jwt() ->> 'sub'::text)
  )
);

-- ============================================================================
-- BSI_DISTRIBUTIONS TABLE POLICIES
-- ============================================================================

-- Policy: Users can only view distributions for their deals
CREATE POLICY "Users can view their distributions" ON "public"."bsi_distributions"
FOR SELECT TO authenticated
USING (
  deal_id IN (
    SELECT bd.deal_id
    FROM bsi_deals bd
    JOIN contact c ON bd.contact_id = c.id
    JOIN auth_user_profile aup ON c.email_address = aup.email
    WHERE aup.clerk_id = (auth.jwt() ->> 'sub'::text)
  )
);

-- ============================================================================
-- BSI_TRANSACTIONS TABLE POLICIES
-- ============================================================================

-- Policy: Users can view transactions they're associated with
CREATE POLICY "Users can view their transactions" ON "public"."bsi_transactions"
FOR SELECT TO authenticated
USING (
  -- User's clerk_id matches transaction clerk_id
  clerk_id = (auth.jwt() ->> 'sub'::text)
  OR
  -- User is associated through investor_id
  investor_id IN (
    SELECT c.id
    FROM contact c
    JOIN auth_user_profile aup ON c.email_address = aup.email
    WHERE aup.clerk_id = (auth.jwt() ->> 'sub'::text)
  )
  OR
  -- User is associated through deal_id
  deal_id IN (
    SELECT bd.deal_id
    FROM bsi_deals bd
    JOIN contact c ON bd.contact_id = c.id
    JOIN auth_user_profile aup ON c.email_address = aup.email
    WHERE aup.clerk_id = (auth.jwt() ->> 'sub'::text)
  )
);

-- ============================================================================
-- BSI_STATEMENTS TABLE POLICIES
-- ============================================================================

-- Policy: Users can only view their own statements
CREATE POLICY "Users can view their statements" ON "public"."bsi_statements"
FOR SELECT TO authenticated
USING (
  contact_id IN (
    SELECT c.id 
    FROM contact c
    JOIN auth_user_profile aup ON c.email_address = aup.email
    WHERE aup.clerk_id = (auth.jwt() ->> 'sub'::text)
  )
);

-- ============================================================================
-- DOCUMENT_FILES TABLE POLICIES (if exists)
-- ============================================================================

-- Policy: Users can view documents for deals they have access to
-- Note: Adjust table name if different
CREATE POLICY "Users can view accessible documents" ON "public"."document_files"
FOR SELECT TO authenticated
USING (
  deal_id IN (
    SELECT bd.deal_id
    FROM bsi_deals bd
    JOIN contact c ON bd.contact_id = c.id
    JOIN auth_user_profile aup ON c.email_address = aup.email
    WHERE aup.clerk_id = (auth.jwt() ->> 'sub'::text)
  )
);

-- ============================================================================
-- CONTACT TABLE POLICIES
-- ============================================================================

-- Policy: Users can view their own contact information
CREATE POLICY "Users can view their contact info" ON "public"."contact"
FOR SELECT TO authenticated
USING (
  email_address IN (
    SELECT aup.email
    FROM auth_user_profile aup
    WHERE aup.clerk_id = (auth.jwt() ->> 'sub'::text)
  )
);

-- Policy: Users can update their own contact information
CREATE POLICY "Users can update their contact info" ON "public"."contact"
FOR UPDATE TO authenticated
USING (
  email_address IN (
    SELECT aup.email
    FROM auth_user_profile aup
    WHERE aup.clerk_id = (auth.jwt() ->> 'sub'::text)
  )
);

-- ============================================================================
-- AUTH_USER_PROFILE TABLE POLICIES
-- ============================================================================

-- Policy: Users can view their own profile
CREATE POLICY "Users can view their profile" ON "public"."auth_user_profile"
FOR SELECT TO authenticated
USING (
  clerk_id = (auth.jwt() ->> 'sub'::text)
);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update their profile" ON "public"."auth_user_profile"
FOR UPDATE TO authenticated
USING (
  clerk_id = (auth.jwt() ->> 'sub'::text)
);

-- ============================================================================
-- ADMIN BYPASS POLICIES
-- ============================================================================

-- Policy: Admin users can view all records (add to all tables as needed)
-- Note: This assumes admin users have role = 'admin'

CREATE POLICY "Admin can view all bsi_deals" ON "public"."bsi_deals"
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth_user_profile aup
    WHERE aup.clerk_id = (auth.jwt() ->> 'sub'::text)
    AND aup.role = 'admin'
  )
);

CREATE POLICY "Admin can view all deals" ON "public"."deal"
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth_user_profile aup
    WHERE aup.clerk_id = (auth.jwt() ->> 'sub'::text)
    AND aup.role = 'admin'
  )
);

CREATE POLICY "Admin can view all distributions" ON "public"."bsi_distributions"
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth_user_profile aup
    WHERE aup.clerk_id = (auth.jwt() ->> 'sub'::text)
    AND aup.role = 'admin'
  )
);

CREATE POLICY "Admin can view all transactions" ON "public"."bsi_transactions"
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth_user_profile aup
    WHERE aup.clerk_id = (auth.jwt() ->> 'sub'::text)
    AND aup.role = 'admin'
  )
);

CREATE POLICY "Admin can view all statements" ON "public"."bsi_statements"
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth_user_profile aup
    WHERE aup.clerk_id = (auth.jwt() ->> 'sub'::text)
    AND aup.role = 'admin'
  )
);

CREATE POLICY "Admin can view all contacts" ON "public"."contact"
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth_user_profile aup
    WHERE aup.clerk_id = (auth.jwt() ->> 'sub'::text)
    AND aup.role = 'admin'
  )
);

-- ============================================================================
-- STORAGE POLICIES
-- ============================================================================

-- Policy: Users can only access documents in folders named with their clerk_id
CREATE POLICY "User-specific document access" ON storage.objects
FOR ALL TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = (auth.jwt() ->> 'sub'::text)
);

-- Policy: Admin can access all documents
CREATE POLICY "Admin document access" ON storage.objects
FOR ALL TO authenticated
USING (
  bucket_id = 'documents' AND
  EXISTS (
    SELECT 1 FROM auth_user_profile aup
    WHERE aup.clerk_id = (auth.jwt() ->> 'sub'::text)
    AND aup.role = 'admin'
  )
);

-- ============================================================================
-- FUNCTIONS FOR POLICY HELPERS
-- ============================================================================

-- Function to get current user's contact_id
CREATE OR REPLACE FUNCTION auth.get_current_user_contact_id()
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT c.id
  FROM contact c
  JOIN auth_user_profile aup ON c.email_address = aup.email
  WHERE aup.clerk_id = (auth.jwt() ->> 'sub'::text)
  LIMIT 1;
$$;

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth_user_profile aup
    WHERE aup.clerk_id = (auth.jwt() ->> 'sub'::text)
    AND aup.role = 'admin'
  );
$$;

-- Function to get current user's contact type
CREATE OR REPLACE FUNCTION auth.get_current_user_contact_type()
RETURNS contact_type
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT c.contact_type
  FROM contact c
  JOIN auth_user_profile aup ON c.email_address = aup.email
  WHERE aup.clerk_id = (auth.jwt() ->> 'sub'::text)
  LIMIT 1;
$$;