-- Migration: Align contact_types columns with deal_party_roles structure and rename tables for consistency

-- ============================================
-- STEP 1: Add missing columns to contact_types
-- ============================================

ALTER TABLE contact_types 
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS allows_multiple boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS display_order int;

-- is_active and created_at already exist, but ensure they have correct defaults
-- (they were already added in earlier migration)

-- Update column comments
COMMENT ON COLUMN contact_types.description IS 'Description of this contact type';
COMMENT ON COLUMN contact_types.allows_multiple IS 'Whether a contact can have multiple instances of this type';
COMMENT ON COLUMN contact_types.display_order IS 'Sort order for UI display';

-- ============================================
-- STEP 2: Rename contacts_contact_types → contact_contact_types
-- ============================================

ALTER TABLE contacts_contact_types RENAME TO contact_contact_types;

-- Update RLS policies
DROP POLICY IF EXISTS "contacts_contact_types_select_authenticated" ON contact_contact_types;
DROP POLICY IF EXISTS "contacts_contact_types_insert_authenticated" ON contact_contact_types;
DROP POLICY IF EXISTS "contacts_contact_types_update_authenticated" ON contact_contact_types;
DROP POLICY IF EXISTS "contacts_contact_types_delete_authenticated" ON contact_contact_types;

CREATE POLICY "contact_contact_types_select_authenticated" ON contact_contact_types 
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "contact_contact_types_insert_authenticated" ON contact_contact_types 
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "contact_contact_types_update_authenticated" ON contact_contact_types 
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "contact_contact_types_delete_authenticated" ON contact_contact_types 
  FOR DELETE TO authenticated USING (true);

COMMENT ON TABLE contact_contact_types IS 'Junction table linking contacts to their contact types (many-to-many)';

-- ============================================
-- STEP 3: Rename deal_parties → deal_roles
-- ============================================

ALTER TABLE deal_parties RENAME TO deal_roles;

-- Update RLS policies
DROP POLICY IF EXISTS "deal_parties_select_authenticated" ON deal_roles;
DROP POLICY IF EXISTS "deal_parties_insert_authenticated" ON deal_roles;
DROP POLICY IF EXISTS "deal_parties_update_authenticated" ON deal_roles;
DROP POLICY IF EXISTS "deal_parties_delete_authenticated" ON deal_roles;
DROP POLICY IF EXISTS "Admin can manage deal roles" ON deal_roles;
DROP POLICY IF EXISTS "Users can view roles for their deals" ON deal_roles;

CREATE POLICY "deal_roles_select_authenticated" ON deal_roles 
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "deal_roles_insert_authenticated" ON deal_roles 
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "deal_roles_update_authenticated" ON deal_roles 
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "deal_roles_delete_authenticated" ON deal_roles 
  FOR DELETE TO authenticated USING (true);

COMMENT ON TABLE deal_roles IS 'Junction table linking deals to parties (contacts or users) with their role on that specific deal';

-- ============================================
-- STEP 4: Rename deal_party_roles → deal_role_types
-- ============================================

ALTER TABLE deal_party_roles RENAME TO deal_role_types;

-- Update RLS policy
DROP POLICY IF EXISTS "deal_party_roles_select_authenticated" ON deal_role_types;

CREATE POLICY "deal_role_types_select_authenticated" ON deal_role_types 
  FOR SELECT TO authenticated USING (true);

COMMENT ON TABLE deal_role_types IS 'Lookup table defining roles that parties can play on a specific deal (e.g., Broker, Title Agent, Guarantor)';

-- ============================================
-- STEP 5: Rename FK column in deal_roles to match new table name
-- ============================================

ALTER TABLE deal_roles RENAME COLUMN deal_party_roles_id TO deal_role_types_id;

-- Update FK constraint
ALTER TABLE deal_roles DROP CONSTRAINT IF EXISTS deal_parties_deal_party_roles_id_fkey;
ALTER TABLE deal_roles 
  ADD CONSTRAINT deal_roles_deal_role_types_id_fkey 
  FOREIGN KEY (deal_role_types_id) REFERENCES deal_role_types(id);

-- ============================================
-- STEP 6: Rename deals_guarantors → deal_guarantors
-- ============================================

ALTER TABLE deals_guarantors RENAME TO deal_guarantors;

-- Update RLS policies
DROP POLICY IF EXISTS "deals_guarantors_select_authenticated" ON deal_guarantors;
DROP POLICY IF EXISTS "deals_guarantors_insert_authenticated" ON deal_guarantors;
DROP POLICY IF EXISTS "deals_guarantors_update_authenticated" ON deal_guarantors;
DROP POLICY IF EXISTS "deals_guarantors_delete_authenticated" ON deal_guarantors;

CREATE POLICY "deal_guarantors_select_authenticated" ON deal_guarantors 
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "deal_guarantors_insert_authenticated" ON deal_guarantors 
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "deal_guarantors_update_authenticated" ON deal_guarantors 
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "deal_guarantors_delete_authenticated" ON deal_guarantors 
  FOR DELETE TO authenticated USING (true);

COMMENT ON TABLE deal_guarantors IS 'Junction table linking deals to guarantors (many-to-many)';

-- ============================================
-- STEP 7: Update index names to match new table names
-- ============================================

-- deal_roles indexes (renamed from deal_parties)
ALTER INDEX IF EXISTS deal_parties_deal_id_idx RENAME TO deal_roles_deal_id_idx;
ALTER INDEX IF EXISTS deal_parties_contact_id_idx RENAME TO deal_roles_contact_id_idx;
ALTER INDEX IF EXISTS deal_parties_user_id_idx RENAME TO deal_roles_user_id_idx;
ALTER INDEX IF EXISTS deal_parties_role_id_idx RENAME TO deal_roles_role_types_id_idx;
ALTER INDEX IF EXISTS deal_parties_unique_contact_role RENAME TO deal_roles_unique_contact_role;
ALTER INDEX IF EXISTS deal_parties_unique_user_role RENAME TO deal_roles_unique_user_role;

-- deal_guarantors indexes (renamed from deals_guarantors)
ALTER INDEX IF EXISTS deals_guarantors_deal_id_idx RENAME TO deal_guarantors_deal_id_idx;
ALTER INDEX IF EXISTS deals_guarantors_guarantor_id_idx RENAME TO deal_guarantors_guarantor_id_idx;

-- ============================================
-- STEP 8: Update constraint names
-- ============================================

-- deal_roles constraints
ALTER TABLE deal_roles RENAME CONSTRAINT deal_parties_has_party TO deal_roles_has_party;
ALTER TABLE deal_roles RENAME CONSTRAINT deal_parties_deal_id_fkey TO deal_roles_deal_id_fkey;
ALTER TABLE deal_roles RENAME CONSTRAINT deal_parties_contact_id_fkey TO deal_roles_contact_id_fkey;
ALTER TABLE deal_roles RENAME CONSTRAINT deal_parties_auth_clerk_users_id_fkey TO deal_roles_auth_clerk_users_id_fkey;

-- deal_guarantors constraints
ALTER TABLE deal_guarantors RENAME CONSTRAINT deals_guarantors_unique TO deal_guarantors_unique;

