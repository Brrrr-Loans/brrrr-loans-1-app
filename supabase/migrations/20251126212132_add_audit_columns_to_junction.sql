-- Migration: Add soft delete and audit trail columns to api_brex_transfers_vendors
-- Tracks who created, updated, and deleted matches

-- Add audit columns
ALTER TABLE api_brex_transfers_vendors
ADD COLUMN created_by_user_id bigint,
ADD COLUMN updated_at timestamp with time zone,
ADD COLUMN updated_by_user_id bigint,
ADD COLUMN deleted_at timestamp with time zone,
ADD COLUMN deleted_by_user_id bigint;

-- Add foreign key constraints
ALTER TABLE api_brex_transfers_vendors
ADD CONSTRAINT api_brex_transfers_vendors_created_by_user_id_fkey 
FOREIGN KEY (created_by_user_id) REFERENCES auth_clerk_users(id) ON DELETE SET NULL;

ALTER TABLE api_brex_transfers_vendors
ADD CONSTRAINT api_brex_transfers_vendors_updated_by_user_id_fkey 
FOREIGN KEY (updated_by_user_id) REFERENCES auth_clerk_users(id) ON DELETE SET NULL;

ALTER TABLE api_brex_transfers_vendors
ADD CONSTRAINT api_brex_transfers_vendors_deleted_by_user_id_fkey 
FOREIGN KEY (deleted_by_user_id) REFERENCES auth_clerk_users(id) ON DELETE SET NULL;

-- Add index for soft delete queries (filter out deleted)
CREATE INDEX IF NOT EXISTS api_brex_transfers_vendors_deleted_at_idx 
ON api_brex_transfers_vendors(deleted_at) 
WHERE deleted_at IS NULL;

-- Add index for audit queries
CREATE INDEX IF NOT EXISTS api_brex_transfers_vendors_created_by_user_id_idx 
ON api_brex_transfers_vendors(created_by_user_id);

-- Update comment
COMMENT ON TABLE api_brex_transfers_vendors IS 
'Junction table linking Brex transfers to vendors. Supports automatic and manual matching with full audit trail (created/updated/deleted by). Uses soft delete to preserve transaction history.';

-- Add column comments
COMMENT ON COLUMN api_brex_transfers_vendors.created_by_user_id IS 'User who created this match (NULL for automatic matches)';
COMMENT ON COLUMN api_brex_transfers_vendors.updated_by_user_id IS 'User who last updated this match';
COMMENT ON COLUMN api_brex_transfers_vendors.deleted_at IS 'Soft delete timestamp';
COMMENT ON COLUMN api_brex_transfers_vendors.deleted_by_user_id IS 'User who soft-deleted this match';

