-- Migration: Add audit trail and soft delete columns to api_brex_transfers_vendors
-- Track who created, updated, and deleted matches

-- Add audit columns
ALTER TABLE api_brex_transfers_vendors
ADD COLUMN IF NOT EXISTS created_by_user_id bigint,
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS updated_by_user_id bigint,
ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS deleted_by_user_id bigint;

-- Add foreign key constraints (drop first if exists from earlier migration)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'api_brex_transfers_vendors_created_by_user_id_fkey') THEN
    ALTER TABLE api_brex_transfers_vendors
    ADD CONSTRAINT api_brex_transfers_vendors_created_by_user_id_fkey 
    FOREIGN KEY (created_by_user_id) REFERENCES auth_clerk_users(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'api_brex_transfers_vendors_updated_by_user_id_fkey') THEN
    ALTER TABLE api_brex_transfers_vendors
    ADD CONSTRAINT api_brex_transfers_vendors_updated_by_user_id_fkey 
    FOREIGN KEY (updated_by_user_id) REFERENCES auth_clerk_users(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'api_brex_transfers_vendors_deleted_by_user_id_fkey') THEN
    ALTER TABLE api_brex_transfers_vendors
    ADD CONSTRAINT api_brex_transfers_vendors_deleted_by_user_id_fkey 
    FOREIGN KEY (deleted_by_user_id) REFERENCES auth_clerk_users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create indexes for audit queries
CREATE INDEX IF NOT EXISTS api_brex_transfers_vendors_created_by_user_id_idx 
ON api_brex_transfers_vendors(created_by_user_id);

CREATE INDEX IF NOT EXISTS api_brex_transfers_vendors_deleted_at_idx 
ON api_brex_transfers_vendors(deleted_at);

-- Add comment
COMMENT ON COLUMN api_brex_transfers_vendors.created_by_user_id IS 'User who created the match (NULL for automatic matches)';
COMMENT ON COLUMN api_brex_transfers_vendors.updated_by_user_id IS 'User who last updated the match';
COMMENT ON COLUMN api_brex_transfers_vendors.deleted_at IS 'Soft delete timestamp';
COMMENT ON COLUMN api_brex_transfers_vendors.deleted_by_user_id IS 'User who soft-deleted the match';

