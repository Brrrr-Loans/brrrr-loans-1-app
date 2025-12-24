-- Drop is_primary column from deal_roles table

ALTER TABLE deal_roles DROP COLUMN IF EXISTS is_primary;

