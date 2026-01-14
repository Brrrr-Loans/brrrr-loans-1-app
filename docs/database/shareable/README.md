# Brrrr Loans Database Schema

**Database:** brrrr-loans-dev  
**Provider:** Supabase (PostgreSQL)  
**Generated:** 2026-01-13  

---

## Overview

This package contains the complete database schema for the Brrrr Loans lending platform. The schema supports a multi-tenant SaaS application for managing loan origination, balance sheet investing, and document management.

### Quick Stats

| Component | Count |
|-----------|-------|
| Tables | 72 |
| Enum Types | 56 |
| Functions | 33 |

---

## Package Contents

| File | Description |
|------|-------------|
| `README.md` | This file - overview and documentation |
| `schema_full.sql` | Complete SQL schema dump (9,744 lines) |
| `TABLES.md` | List of all tables with descriptions |
| `ENUM_TYPES.md` | All enumerated types with values |
| `FUNCTIONS.md` | List of all database functions |

---

## Schema Domains

### 1. **Authentication & Authorization**
- `auth_clerk_users` - User profiles (Clerk integration)
- `auth_clerk_orgs` - Organizations
- `auth_clerk_orgs_members` - Organization memberships
- `auth_clerk_orgs_themes` - Organization theme customizations
- `roles` / `users_roles` - Role-based access control

### 2. **Deal/Loan Management**
- `deal` - Core deal/loan records
- `loan_application` - Loan application data
- `deal_property` - Properties associated with deals
- `deal_roles` - Parties involved in deals
- `deal_guarantors` - Guarantors for deals
- `milestones` - Deal stage tracking
- `tasks` - Task management for loan processing

### 3. **Contacts & Companies**
- `contact` - Individual contacts
- `contact_types` / `contact_contact_types` - Contact categorization
- `company` - Company records
- `company_contact` - Company-contact relationships
- `company_member` - Company membership
- `borrower` / `guarantor` - Loan participants

### 4. **Balance Sheet Investing (BSI)**
- `bsi_deals_clerk_*` - Investor-deal associations
- `bsi_transactions` - Investment transactions
- `bsi_distributions` - Distribution payments
- `bsi_statements` - Investor statements
- Junction tables for many-to-many relationships

### 5. **Documents**
- `document_files` - Document storage metadata
- `document_roles` / `document_roles_files` - Document access control
- `document_investors` - Investor document access

### 6. **Property & Appraisal**
- `property` - Property records
- `property_income` - Property income data
- `appraisal` - Appraisal records
- `deal_appraisals` - Deal-appraisal relationships

### 7. **External Integrations**
- `api_brex_*` - Brex banking integration
- `api_ofb_*` - OFB banking integration
- `bank_accounts` - Bank account configurations

### 8. **Reference Data**
- `countries` - Country lookup table
- `constants` - Application constants
- `fee` - Fee options for loan pricing
- `select_uw_outcomes` - Underwriting decision options

---

## Key Enum Types

| Enum | Purpose |
|------|---------|
| `deal_status_primary` | Loan pipeline stages |
| `loan_type_1` | DSCR vs RTL loans |
| `property_type` | Property classifications |
| `document_status` | Document review states |
| `transaction_status` | Transaction lifecycle states |
| `user_role_internal` | Internal user roles |
| `clerk_org_role` | Organization membership roles |

See `ENUM_TYPES.md` for complete enum definitions.

---

## Row-Level Security (RLS)

All tables have RLS enabled with policies based on:
- Clerk JWT authentication (`auth.jwt() ->> 'sub'`)
- Organization membership
- Admin role checks via `is_admin()` function
- Deal/transaction access via helper functions

---

## How to Use

### Import Schema to New Database

```sql
-- Connect to your PostgreSQL database
psql -h your-host -U postgres -d your-database -f schema_full.sql
```

### View in Supabase Studio

1. Create a new Supabase project
2. Go to SQL Editor
3. Paste contents of `schema_full.sql`
4. Execute

---

## Notes

- Schema uses Supabase-specific extensions (pg_cron, etc.)
- Clerk authentication integration required
- Storage bucket configurations not included
- Data not included (schema only)

---

## Contact

For questions about this schema, contact the Brrrr Loans development team.
