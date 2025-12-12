-- Make the FK constraint deferrable temporarily
ALTER TABLE auth_clerk_orgs 
  DROP CONSTRAINT user_clerk_orgs_created_by_clerk_user_id_fkey;

ALTER TABLE auth_clerk_orgs 
  ADD CONSTRAINT user_clerk_orgs_created_by_clerk_user_id_fkey 
  FOREIGN KEY (created_by_clerk_user_id) 
  REFERENCES auth_clerk_users(clerk_user_id) 
  DEFERRABLE INITIALLY DEFERRED;

-- Now update in a transaction
BEGIN;

-- Update the user's clerk_user_id
UPDATE auth_clerk_users
SET 
  clerk_user_id = 'user_36SyenOL3VUjantAyBmwVbrKbYX',
  image_url = 'https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvdXBsb2FkZWQvaW1nXzM2VDQyRUQ0aG9LcUlsM1VMT1BzTXhBbWVHTiJ9',
  has_image = true,
  updated_at = NOW()
WHERE email = 'akraut@brrrr.com';

-- Update the org references
UPDATE auth_clerk_orgs
SET created_by_clerk_user_id = 'user_36SyenOL3VUjantAyBmwVbrKbYX'
WHERE created_by_clerk_user_id = 'user_2rNnop9w8mAn0WyYSJiyePm9Ji8';

COMMIT;

-- Restore the constraint to non-deferrable (optional, for performance)
ALTER TABLE auth_clerk_orgs 
  DROP CONSTRAINT user_clerk_orgs_created_by_clerk_user_id_fkey;

ALTER TABLE auth_clerk_orgs 
  ADD CONSTRAINT user_clerk_orgs_created_by_clerk_user_id_fkey 
  FOREIGN KEY (created_by_clerk_user_id) 
  REFERENCES auth_clerk_users(clerk_user_id);
