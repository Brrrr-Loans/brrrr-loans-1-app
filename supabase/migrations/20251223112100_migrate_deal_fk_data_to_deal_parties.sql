-- Migration: Migrate deal FK data to deal_parties before dropping columns
-- This MUST run after 20251223111854_rename_to_deal_party_tables.sql
-- This MUST run before 20251223112249_drop_deal_party_fk_columns_and_create_deals_guarantors.sql

-- ============================================
-- Role ID Mapping (from deal_party_roles table):
-- 4 = broker
-- 5 = loan_processor
-- 6 = account_executive
-- 7 = title_agent
-- 8 = escrow_agent
-- 10 = closing_agent
-- 11 = insurance_agent
-- 13 = appraisal_poc
-- 14 = loan_buyer
-- ============================================

-- ============================================
-- STEP 1: Migrate contact FKs from deal table to deal_parties
-- ============================================

-- broker_id → deal_parties (role: broker)
INSERT INTO deal_parties (deal_id, contact_id, deal_party_roles_id, is_primary, notes, created_at)
SELECT 
  d.id as deal_id,
  d.broker_id as contact_id,
  (SELECT id FROM deal_party_roles WHERE code = 'broker') as deal_party_roles_id,
  true as is_primary,
  'Migrated from deal.broker_id' as notes,
  now() as created_at
FROM deal d
WHERE d.broker_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- title_company_contact_id → deal_parties (role: title_agent)
INSERT INTO deal_parties (deal_id, contact_id, deal_party_roles_id, is_primary, notes, created_at)
SELECT 
  d.id as deal_id,
  d.title_company_contact_id as contact_id,
  (SELECT id FROM deal_party_roles WHERE code = 'title_agent') as deal_party_roles_id,
  true as is_primary,
  'Migrated from deal.title_company_contact_id' as notes,
  now() as created_at
FROM deal d
WHERE d.title_company_contact_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- insurance_carrier_contact_id → deal_parties (role: insurance_agent)
INSERT INTO deal_parties (deal_id, contact_id, deal_party_roles_id, is_primary, notes, created_at)
SELECT 
  d.id as deal_id,
  d.insurance_carrier_contact_id as contact_id,
  (SELECT id FROM deal_party_roles WHERE code = 'insurance_agent') as deal_party_roles_id,
  true as is_primary,
  'Migrated from deal.insurance_carrier_contact_id' as notes,
  now() as created_at
FROM deal d
WHERE d.insurance_carrier_contact_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- closing_agent_contact_id → deal_parties (role: closing_agent)
INSERT INTO deal_parties (deal_id, contact_id, deal_party_roles_id, is_primary, notes, created_at)
SELECT 
  d.id as deal_id,
  d.closing_agent_contact_id as contact_id,
  (SELECT id FROM deal_party_roles WHERE code = 'closing_agent') as deal_party_roles_id,
  true as is_primary,
  'Migrated from deal.closing_agent_contact_id' as notes,
  now() as created_at
FROM deal d
WHERE d.closing_agent_contact_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- appraisal_poc_contact_id → deal_parties (role: appraisal_poc)
INSERT INTO deal_parties (deal_id, contact_id, deal_party_roles_id, is_primary, notes, created_at)
SELECT 
  d.id as deal_id,
  d.appraisal_poc_contact_id as contact_id,
  (SELECT id FROM deal_party_roles WHERE code = 'appraisal_poc') as deal_party_roles_id,
  true as is_primary,
  'Migrated from deal.appraisal_poc_contact_id' as notes,
  now() as created_at
FROM deal d
WHERE d.appraisal_poc_contact_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- loan_buyer_contact_id → deal_parties (role: loan_buyer)
INSERT INTO deal_parties (deal_id, contact_id, deal_party_roles_id, is_primary, notes, created_at)
SELECT 
  d.id as deal_id,
  d.loan_buyer_contact_id as contact_id,
  (SELECT id FROM deal_party_roles WHERE code = 'loan_buyer') as deal_party_roles_id,
  true as is_primary,
  'Migrated from deal.loan_buyer_contact_id' as notes,
  now() as created_at
FROM deal d
WHERE d.loan_buyer_contact_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- escrow_contact_id → deal_parties (role: escrow_agent)
INSERT INTO deal_parties (deal_id, contact_id, deal_party_roles_id, is_primary, notes, created_at)
SELECT 
  d.id as deal_id,
  d.escrow_contact_id as contact_id,
  (SELECT id FROM deal_party_roles WHERE code = 'escrow_agent') as deal_party_roles_id,
  true as is_primary,
  'Migrated from deal.escrow_contact_id' as notes,
  now() as created_at
FROM deal d
WHERE d.escrow_contact_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- ============================================
-- STEP 2: Migrate auth_clerk_users FKs from deal table to deal_parties
-- ============================================

-- account_executive_id → deal_parties (role: account_executive, as user)
INSERT INTO deal_parties (deal_id, auth_clerk_users_id, deal_party_roles_id, is_primary, notes, created_at)
SELECT 
  d.id as deal_id,
  d.account_executive_id as auth_clerk_users_id,
  (SELECT id FROM deal_party_roles WHERE code = 'account_executive') as deal_party_roles_id,
  true as is_primary,
  'Migrated from deal.account_executive_id' as notes,
  now() as created_at
FROM deal d
WHERE d.account_executive_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- loan_processor_id → deal_parties (role: loan_processor, as user)
INSERT INTO deal_parties (deal_id, auth_clerk_users_id, deal_party_roles_id, is_primary, notes, created_at)
SELECT 
  d.id as deal_id,
  d.loan_processor_id as auth_clerk_users_id,
  (SELECT id FROM deal_party_roles WHERE code = 'loan_processor') as deal_party_roles_id,
  true as is_primary,
  'Migrated from deal.loan_processor_id' as notes,
  now() as created_at
FROM deal d
WHERE d.loan_processor_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- loan_opener_id → deal_parties (we need to add a role for this)
-- First, ensure loan_opener role exists
INSERT INTO deal_party_roles (code, name, description, allows_multiple, display_order, is_active)
VALUES ('loan_opener', 'Loan Opener', 'Internal user who opens/initiates the loan', false, 19, true)
ON CONFLICT (code) DO NOTHING;

-- Now migrate the data
INSERT INTO deal_parties (deal_id, auth_clerk_users_id, deal_party_roles_id, is_primary, notes, created_at)
SELECT 
  d.id as deal_id,
  d.loan_opener_id as auth_clerk_users_id,
  (SELECT id FROM deal_party_roles WHERE code = 'loan_opener') as deal_party_roles_id,
  true as is_primary,
  'Migrated from deal.loan_opener_id' as notes,
  now() as created_at
FROM deal d
WHERE d.loan_opener_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- ============================================
-- STEP 3: Migrate guarantor FKs to deals_guarantors (will be created later)
-- We'll use a temp table to store the data until deals_guarantors is created
-- ============================================

-- Create temp table to hold guarantor assignments
CREATE TABLE IF NOT EXISTS _temp_guarantor_migrations (
  deal_id bigint NOT NULL,
  guarantor_id bigint NOT NULL,
  is_primary boolean DEFAULT false,
  display_order int,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- primary_guarantor_id
INSERT INTO _temp_guarantor_migrations (deal_id, guarantor_id, is_primary, display_order, notes)
SELECT 
  id as deal_id,
  primary_guarantor_id as guarantor_id,
  true as is_primary,
  1 as display_order,
  'Migrated from deal.primary_guarantor_id' as notes
FROM deal
WHERE primary_guarantor_id IS NOT NULL;

-- second_guarantor_id
INSERT INTO _temp_guarantor_migrations (deal_id, guarantor_id, is_primary, display_order, notes)
SELECT 
  id as deal_id,
  second_guarantor_id as guarantor_id,
  false as is_primary,
  2 as display_order,
  'Migrated from deal.second_guarantor_id' as notes
FROM deal
WHERE second_guarantor_id IS NOT NULL;

-- third_guarantor_id
INSERT INTO _temp_guarantor_migrations (deal_id, guarantor_id, is_primary, display_order, notes)
SELECT 
  id as deal_id,
  third_guarantor_id as guarantor_id,
  false as is_primary,
  3 as display_order,
  'Migrated from deal.third_guarantor_id' as notes
FROM deal
WHERE third_guarantor_id IS NOT NULL;

-- fourth_guarantor_id
INSERT INTO _temp_guarantor_migrations (deal_id, guarantor_id, is_primary, display_order, notes)
SELECT 
  id as deal_id,
  fourth_guarantor_id as guarantor_id,
  false as is_primary,
  4 as display_order,
  'Migrated from deal.fourth_guarantor_id' as notes
FROM deal
WHERE fourth_guarantor_id IS NOT NULL;

-- Also migrate guarantor.deal_id relationships
INSERT INTO _temp_guarantor_migrations (deal_id, guarantor_id, is_primary, display_order, notes)
SELECT 
  g.deal_id,
  g.id as guarantor_id,
  false as is_primary,
  5 as display_order,
  'Migrated from guarantor.deal_id' as notes
FROM guarantor g
WHERE g.deal_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- We'll move this data to deals_guarantors in the next migration

