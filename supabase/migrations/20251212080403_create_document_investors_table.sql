-- Create table for document-investor associations
-- This stores which investors (orgs or users) are associated with each document

CREATE TABLE IF NOT EXISTS document_investors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_path TEXT NOT NULL,
  bucket_name TEXT NOT NULL,
  investor_type TEXT NOT NULL CHECK (investor_type IN ('org', 'user')),
  investor_id TEXT NOT NULL, -- clerk_org_id or clerk_user_id
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by TEXT, -- clerk_user_id of who created this association
  UNIQUE(document_path, bucket_name, investor_type, investor_id)
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_document_investors_path ON document_investors(document_path, bucket_name);
CREATE INDEX IF NOT EXISTS idx_document_investors_investor ON document_investors(investor_type, investor_id);

-- Enable RLS
ALTER TABLE document_investors ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view document_investors for documents they have access to
-- For simplicity, allow authenticated users to view all (admins can see all, regular users' access is controlled at app level)
CREATE POLICY "Allow authenticated users to view document_investors" 
  ON document_investors FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Policy: Only admins can insert/update/delete (controlled at app level via canUpload check)
CREATE POLICY "Allow authenticated users to manage document_investors" 
  ON document_investors FOR ALL 
  USING (auth.role() = 'authenticated');
