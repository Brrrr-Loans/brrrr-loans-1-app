-- Add missing columns to contact_types table

ALTER TABLE contact_types 
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

COMMENT ON COLUMN contact_types.is_active IS 'Whether this contact type is active and available for selection';
COMMENT ON COLUMN contact_types.created_at IS 'Timestamp when this record was created';
COMMENT ON COLUMN contact_types.updated_at IS 'Timestamp when this record was last updated';

