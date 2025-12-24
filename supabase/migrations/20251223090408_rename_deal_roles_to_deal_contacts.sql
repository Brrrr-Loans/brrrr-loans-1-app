-- Rename table: deal_roles -> deal_contacts
ALTER TABLE deal_roles RENAME TO deal_contacts;

-- Rename foreign key constraints to reflect new table name
ALTER TABLE deal_contacts 
  RENAME CONSTRAINT public_deal_roles_deal_id_fkey TO deal_contacts_deal_id_fkey;

ALTER TABLE deal_contacts 
  RENAME CONSTRAINT public_deal_roles_contact_id_fkey TO deal_contacts_contact_id_fkey;

ALTER TABLE deal_contacts 
  RENAME CONSTRAINT public_deal_roles_contact_types_id_fkey TO deal_contacts_contact_types_id_fkey;

-- Add table comment
COMMENT ON TABLE deal_contacts IS 'Junction table linking deals to contacts with their role on that specific deal';
