-- Migration: Consolidate contact types into junction table
-- 1) Migrate data from contact.contact_type → contact_types_jt
-- 2) Rename contact_types_jt → contacts_contact_types
-- 3) Add constraints (unique, not null)
-- 4) Drop columns contact.contact_type & contact.contact_types
-- 5) Drop enum type contact_type

-- Step 1: Migrate existing data from contact.contact_type to junction table
-- Match enum values to contact_types.name to get the correct ID
INSERT INTO contact_types_jt (contact_id, contact_types_id)
SELECT 
  c.id as contact_id,
  ct.id as contact_types_id
FROM contact c
JOIN contact_types ct ON ct.name = c.contact_type::text
WHERE c.contact_type IS NOT NULL
ON CONFLICT DO NOTHING;

-- Step 2: Rename the junction table
ALTER TABLE contact_types_jt RENAME TO contacts_contact_types;

-- Step 3a: Rename the primary key constraint to match new table name
ALTER TABLE contacts_contact_types 
  RENAME CONSTRAINT contact_contact_types_pkey TO contacts_contact_types_pkey;

-- Step 3b: Rename the unique constraint
ALTER TABLE contacts_contact_types
  DROP CONSTRAINT IF EXISTS contact_types_jt_id_key;

-- Step 3c: Rename foreign key constraints
ALTER TABLE contacts_contact_types 
  RENAME CONSTRAINT public_contact_contact_types_contact_id_fkey TO contacts_contact_types_contact_id_fkey;

ALTER TABLE contacts_contact_types 
  RENAME CONSTRAINT public_contact_contact_types_contact_types_id_fkey TO contacts_contact_types_contact_types_id_fkey;

-- Step 3d: Add NOT NULL constraints to FK columns
ALTER TABLE contacts_contact_types 
  ALTER COLUMN contact_id SET NOT NULL;

ALTER TABLE contacts_contact_types 
  ALTER COLUMN contact_types_id SET NOT NULL;

-- Step 3e: Add unique constraint to prevent duplicate assignments
ALTER TABLE contacts_contact_types 
  ADD CONSTRAINT contacts_contact_types_unique_assignment 
  UNIQUE (contact_id, contact_types_id);

-- Step 3f: Add created_at column for audit trail
ALTER TABLE contacts_contact_types 
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- Step 4: Drop the redundant columns from contact table
ALTER TABLE contact DROP COLUMN IF EXISTS contact_type;
ALTER TABLE contact DROP COLUMN IF EXISTS contact_types;

-- Step 5: Drop the enum type (no longer needed)
DROP TYPE IF EXISTS contact_type;

-- Add table comment
COMMENT ON TABLE contacts_contact_types IS 'Junction table linking contacts to their contact types (many-to-many relationship)';
COMMENT ON COLUMN contacts_contact_types.contact_id IS 'Foreign key to contact.id';
COMMENT ON COLUMN contacts_contact_types.contact_types_id IS 'Foreign key to contact_types.id';

