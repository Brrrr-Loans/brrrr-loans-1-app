-- Update RLS policies for document_investors to be more permissive for testing
-- This allows any authenticated user (with a valid JWT) to manage document_investors

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view document_investors" ON document_investors;
DROP POLICY IF EXISTS "Admins can insert document_investors" ON document_investors;
DROP POLICY IF EXISTS "Admins can update document_investors" ON document_investors;
DROP POLICY IF EXISTS "Admins can delete document_investors" ON document_investors;

-- Create permissive policies that just require authentication (JWT exists)
CREATE POLICY "Authenticated users can view document_investors" 
  ON document_investors FOR SELECT 
  USING (auth.jwt() IS NOT NULL);

CREATE POLICY "Authenticated users can insert document_investors" 
  ON document_investors FOR INSERT 
  WITH CHECK (auth.jwt() IS NOT NULL);

CREATE POLICY "Authenticated users can update document_investors" 
  ON document_investors FOR UPDATE 
  USING (auth.jwt() IS NOT NULL);

CREATE POLICY "Authenticated users can delete document_investors" 
  ON document_investors FOR DELETE 
  USING (auth.jwt() IS NOT NULL);
