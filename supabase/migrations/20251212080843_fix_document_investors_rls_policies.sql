-- Fix RLS policies for document_investors table to use Clerk auth

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to view document_investors" ON document_investors;
DROP POLICY IF EXISTS "Allow authenticated users to manage document_investors" ON document_investors;

-- Policy: All authenticated users can read document_investors
CREATE POLICY "Users can view document_investors" 
  ON document_investors FOR SELECT 
  USING (true);

-- Policy: Only admins can insert document_investors
CREATE POLICY "Admins can insert document_investors" 
  ON document_investors FOR INSERT 
  WITH CHECK (is_admin());

-- Policy: Only admins can update document_investors
CREATE POLICY "Admins can update document_investors" 
  ON document_investors FOR UPDATE 
  USING (is_admin());

-- Policy: Only admins can delete document_investors
CREATE POLICY "Admins can delete document_investors" 
  ON document_investors FOR DELETE 
  USING (is_admin());
