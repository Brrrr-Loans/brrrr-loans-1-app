-- Add code column to contact_types table
ALTER TABLE contact_types 
ADD COLUMN code text;

-- Populate code column with snake_case versions of name
-- Using regexp_replace to: lowercase, replace spaces with underscores, remove parentheses and special chars
UPDATE contact_types 
SET code = lower(
  regexp_replace(
    regexp_replace(
      regexp_replace(name, '\s*\([^)]*\)\s*', '', 'g'),  -- Remove parenthetical text like (POC)
      '[^a-zA-Z0-9\s]', '', 'g'  -- Remove special characters
    ),
    '\s+', '_', 'g'  -- Replace spaces with underscores
  )
);

-- Add NOT NULL and UNIQUE constraints after population
ALTER TABLE contact_types 
ALTER COLUMN code SET NOT NULL;

ALTER TABLE contact_types 
ADD CONSTRAINT contact_types_code_unique UNIQUE (code);

-- Add comment for documentation
COMMENT ON COLUMN contact_types.code IS 'Snake_case identifier for programmatic use (stable, use in code/APIs)';
