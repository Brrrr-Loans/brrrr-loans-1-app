-- ============================================================
-- DROP SAFE DUPLICATE INDEXES
-- Only dropping indexes/constraints without FK dependencies
-- ============================================================

-- 1. Plain indexes (no FK dependencies)
DROP INDEX IF EXISTS idx_members_clerk_org_id;
DROP INDEX IF EXISTS idx_user_profile_role;
DROP INDEX IF EXISTS idx_auth_clerk_users_clerk_user_id;
DROP INDEX IF EXISTS idx_user_profile_clerk_id;
DROP INDEX IF EXISTS idx_deals_orgs_clerk_org_id;
DROP INDEX IF EXISTS idx_deals_orgs_deal_id;

-- 2. Redundant unique constraints on id columns (pkey covers these)
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS "Tasks_id_key";
ALTER TABLE cba_requests DROP CONSTRAINT IF EXISTS cba_submission_credit_id_key;

-- 3. Duplicate unique constraint on loan_number
ALTER TABLE deal DROP CONSTRAINT IF EXISTS deal_loan_number_unique;

