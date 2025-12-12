-- Step 1: Delete the empty PROD duplicate rows (they have no FK references)
DELETE FROM auth_clerk_users WHERE id IN (35, 41, 38, 48, 46, 37);

-- Step 2: Make the FK constraint deferrable
ALTER TABLE auth_clerk_orgs 
  DROP CONSTRAINT IF EXISTS user_clerk_orgs_created_by_clerk_user_id_fkey;

ALTER TABLE auth_clerk_orgs 
  ADD CONSTRAINT user_clerk_orgs_created_by_clerk_user_id_fkey 
  FOREIGN KEY (created_by_clerk_user_id) 
  REFERENCES auth_clerk_users(clerk_user_id) 
  DEFERRABLE INITIALLY DEFERRED;

-- Step 3: Update DEV rows with PROD clerk_user_ids in a transaction
BEGIN;

-- broker37@aol.com (id=23)
UPDATE auth_clerk_users SET clerk_user_id = 'user_36TZm8DhGc6q5GyVW1RrJYQUwaS', updated_at = NOW() WHERE id = 23;
UPDATE auth_clerk_orgs SET created_by_clerk_user_id = 'user_36TZm8DhGc6q5GyVW1RrJYQUwaS' WHERE created_by_clerk_user_id = 'user_2x7ia30X4CPzgisT2y00BgiVbzA';

-- dhruvnvarma@gmail.com (id=31)
UPDATE auth_clerk_users SET clerk_user_id = 'user_36TZmXDvL7GxcqMZ2KCRjy9t4WG', updated_at = NOW() WHERE id = 31;
UPDATE auth_clerk_orgs SET created_by_clerk_user_id = 'user_36TZmXDvL7GxcqMZ2KCRjy9t4WG' WHERE created_by_clerk_user_id = 'user_32SVQXVownMtEZc7cwU5bYGThJe';

-- ethantthompson5@gmail.com (id=28)
UPDATE auth_clerk_users SET clerk_user_id = 'user_36TZmCdzpKFwa8w8248la4o7gxy', updated_at = NOW() WHERE id = 28;
UPDATE auth_clerk_orgs SET created_by_clerk_user_id = 'user_36TZmCdzpKFwa8w8248la4o7gxy' WHERE created_by_clerk_user_id = 'user_32Sqg2PoFmgCd7wOYWh4tD0zaXZ';

-- kean@unitedsuccessllc.com (id=25)
UPDATE auth_clerk_users SET clerk_user_id = 'user_36TZmo0oih2I1kMKJo66eYZVMPd', updated_at = NOW() WHERE id = 25;
UPDATE auth_clerk_orgs SET created_by_clerk_user_id = 'user_36TZmo0oih2I1kMKJo66eYZVMPd' WHERE created_by_clerk_user_id = 'user_2x8EhWIaYhxgLw2w0mqq5iaIRPn';

-- lilligenise@gmail.com (id=24)
UPDATE auth_clerk_users SET clerk_user_id = 'user_36TZmlVZoouBEbqwR7QLw1E19Bm', updated_at = NOW() WHERE id = 24;
UPDATE auth_clerk_orgs SET created_by_clerk_user_id = 'user_36TZmlVZoouBEbqwR7QLw1E19Bm' WHERE created_by_clerk_user_id = 'user_2x7jE0UHAvgK3cuks2YYAmrcqsS';

-- varazdat@brrrr.com (id=27)
UPDATE auth_clerk_users SET clerk_user_id = 'user_36TZmECP4kvW5nJN52eC6n3fALt', updated_at = NOW() WHERE id = 27;
UPDATE auth_clerk_orgs SET created_by_clerk_user_id = 'user_36TZmECP4kvW5nJN52eC6n3fALt' WHERE created_by_clerk_user_id = 'user_32ShXClKX2Q8N0jyuYLEndqtIIu';

COMMIT;

-- Step 4: Restore constraint
ALTER TABLE auth_clerk_orgs 
  DROP CONSTRAINT user_clerk_orgs_created_by_clerk_user_id_fkey;

ALTER TABLE auth_clerk_orgs 
  ADD CONSTRAINT user_clerk_orgs_created_by_clerk_user_id_fkey 
  FOREIGN KEY (created_by_clerk_user_id) 
  REFERENCES auth_clerk_users(clerk_user_id);
