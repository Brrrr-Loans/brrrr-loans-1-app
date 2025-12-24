-- Migration: Rename and restructure deal party tables for consistency
-- deal_role_types → deal_party_roles
-- deal_contacts → deal_parties (with enhanced structure)

-- ============================================
-- STEP 1: Rename deal_role_types → deal_party_roles
-- ============================================

ALTER TABLE deal_role_types RENAME TO deal_party_roles;

-- Update comments
COMMENT ON TABLE deal_party_roles IS 'Lookup table defining roles that parties can play on a specific deal (e.g., Broker, Title Agent, Guarantor)';
COMMENT ON COLUMN deal_party_roles.code IS 'Snake_case identifier for programmatic use (stable, use in code/APIs)';
COMMENT ON COLUMN deal_party_roles.name IS 'Human-readable display name';
COMMENT ON COLUMN deal_party_roles.allows_multiple IS 'Whether a deal can have multiple parties in this role';
COMMENT ON COLUMN deal_party_roles.display_order IS 'Sort order for UI display';

-- Rename the RLS policy
ALTER POLICY "Allow read access for authenticated users" ON deal_party_roles 
  RENAME TO "deal_party_roles_select_authenticated";

-- ============================================
-- STEP 2: Rename deal_contacts → deal_parties
-- ============================================

ALTER TABLE deal_contacts RENAME TO deal_parties;

-- Update comments
COMMENT ON TABLE deal_parties IS 'Junction table linking deals to parties (contacts or users) with their role on that specific deal';

-- ============================================
-- STEP 3: Restructure deal_parties table
-- ============================================

-- Drop the incorrect contact_types_id column (should reference deal_party_roles, not contact_types)
ALTER TABLE deal_parties DROP COLUMN IF EXISTS contact_types_id;

-- Add deal_party_roles_id column (the correct reference)
ALTER TABLE deal_parties 
  ADD COLUMN deal_party_roles_id bigint REFERENCES deal_party_roles(id);

-- Add auth_clerk_users_id column (for internal users)
ALTER TABLE deal_parties 
  ADD COLUMN auth_clerk_users_id bigint REFERENCES auth_clerk_users(id) ON DELETE CASCADE;

-- Add additional useful columns
ALTER TABLE deal_parties 
  ADD COLUMN is_primary boolean DEFAULT false,
  ADD COLUMN notes text,
  ADD COLUMN created_at timestamptz DEFAULT now();

-- Update existing FK constraints with better names
ALTER TABLE deal_parties 
  DROP CONSTRAINT IF EXISTS deal_roles_deal_id_fkey;

ALTER TABLE deal_parties 
  DROP CONSTRAINT IF EXISTS deal_roles_contact_id_fkey;

ALTER TABLE deal_parties 
  DROP CONSTRAINT IF EXISTS deal_contacts_deal_id_fkey;

ALTER TABLE deal_parties 
  DROP CONSTRAINT IF EXISTS deal_contacts_contact_id_fkey;

-- Re-add FK constraints with consistent naming
ALTER TABLE deal_parties
  ADD CONSTRAINT deal_parties_deal_id_fkey 
    FOREIGN KEY (deal_id) REFERENCES deal(id) ON DELETE CASCADE;

ALTER TABLE deal_parties
  ADD CONSTRAINT deal_parties_contact_id_fkey 
    FOREIGN KEY (contact_id) REFERENCES contact(id) ON DELETE CASCADE;

-- Add CHECK constraint: party must be either contact OR user (mutually exclusive)
ALTER TABLE deal_parties
  ADD CONSTRAINT deal_parties_has_party CHECK (
    (contact_id IS NOT NULL AND auth_clerk_users_id IS NULL) OR
    (contact_id IS NULL AND auth_clerk_users_id IS NOT NULL) OR
    (contact_id IS NULL AND auth_clerk_users_id IS NULL) -- Allow during migration
  );

-- Add unique constraints to prevent duplicate role assignments
CREATE UNIQUE INDEX IF NOT EXISTS deal_parties_unique_contact_role 
  ON deal_parties (deal_id, deal_party_roles_id, contact_id) 
  WHERE contact_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS deal_parties_unique_user_role 
  ON deal_parties (deal_id, deal_party_roles_id, auth_clerk_users_id) 
  WHERE auth_clerk_users_id IS NOT NULL;

-- Add index for common queries
CREATE INDEX IF NOT EXISTS deal_parties_deal_id_idx ON deal_parties(deal_id);
CREATE INDEX IF NOT EXISTS deal_parties_contact_id_idx ON deal_parties(contact_id) WHERE contact_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS deal_parties_user_id_idx ON deal_parties(auth_clerk_users_id) WHERE auth_clerk_users_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS deal_parties_role_id_idx ON deal_parties(deal_party_roles_id);

-- ============================================
-- STEP 4: Update RLS policies for deal_parties
-- ============================================

-- Drop old policies (may have old names from deal_contacts/deal_roles)
DROP POLICY IF EXISTS "deal_contacts_select" ON deal_parties;
DROP POLICY IF EXISTS "deal_roles_select" ON deal_parties;

-- Create new RLS policies
CREATE POLICY "deal_parties_select_authenticated" ON deal_parties 
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "deal_parties_insert_authenticated" ON deal_parties 
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "deal_parties_update_authenticated" ON deal_parties 
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "deal_parties_delete_authenticated" ON deal_parties 
  FOR DELETE TO authenticated USING (true);

-- ============================================
-- STEP 5: Add comments
-- ============================================

COMMENT ON COLUMN deal_parties.deal_id IS 'The deal this party is associated with';
COMMENT ON COLUMN deal_parties.deal_party_roles_id IS 'The role this party plays on the deal';
COMMENT ON COLUMN deal_parties.contact_id IS 'Reference to contact table (for external parties)';
COMMENT ON COLUMN deal_parties.auth_clerk_users_id IS 'Reference to auth_clerk_users table (for internal users/logged-in parties)';
COMMENT ON COLUMN deal_parties.is_primary IS 'Whether this is the primary party for this role on the deal';
COMMENT ON COLUMN deal_parties.notes IS 'Optional notes about this party assignment';

