-- Delete PROD rows (no refs)
DELETE FROM auth_clerk_users WHERE id IN (62, 63);

-- Make FK deferrable
ALTER TABLE auth_clerk_orgs 
  DROP CONSTRAINT IF EXISTS user_clerk_orgs_created_by_clerk_user_id_fkey;

ALTER TABLE auth_clerk_orgs 
  ADD CONSTRAINT user_clerk_orgs_created_by_clerk_user_id_fkey 
  FOREIGN KEY (created_by_clerk_user_id) 
  REFERENCES auth_clerk_users(clerk_user_id) 
  DEFERRABLE INITIALLY DEFERRED;

BEGIN;

-- akraut@brrrrloans.com (id=20)
UPDATE auth_clerk_users SET clerk_user_id = 'user_36Tb19KBBP0IJe5SGUU0sfQcfFS', updated_at = NOW() WHERE id = 20;
UPDATE auth_clerk_orgs SET created_by_clerk_user_id = 'user_36Tb19KBBP0IJe5SGUU0sfQcfFS' WHERE created_by_clerk_user_id = 'user_2wPgUfRJoTVHQLgSpK44bPi1uIK';

-- mcwallach25@gmail.com (id=21)
UPDATE auth_clerk_users SET clerk_user_id = 'user_36Tb1Bm00zppnHaBAWljlD6ov5v', updated_at = NOW() WHERE id = 21;
UPDATE auth_clerk_orgs SET created_by_clerk_user_id = 'user_36Tb1Bm00zppnHaBAWljlD6ov5v' WHERE created_by_clerk_user_id = 'user_2x7CYfhFHt5CB0xCXmoxipFhrHB';

COMMIT;

-- Restore constraint
ALTER TABLE auth_clerk_orgs 
  DROP CONSTRAINT user_clerk_orgs_created_by_clerk_user_id_fkey;

ALTER TABLE auth_clerk_orgs 
  ADD CONSTRAINT user_clerk_orgs_created_by_clerk_user_id_fkey 
  FOREIGN KEY (created_by_clerk_user_id) 
  REFERENCES auth_clerk_users(clerk_user_id);
