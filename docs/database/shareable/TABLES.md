# Database Tables

**Total Tables:** 72
**Database:** brrrr-loans-dev
**Schema:** public

| # | Table Name | Description |
|---|------------|-------------|
| 1 | `_function_backups_20251118` | Backup table used for rollback on 2025-11-18. Can be dropped after confirming... |
| 2 | `api_brex_transfers` | - |
| 3 | `api_brex_transfers_vendors` | Junction table linking Brex transfers to vendors. Supports automatic and manu... |
| 4 | `api_brex_vendors` | - |
| 5 | `api_brex_vendors_clerk_orgs` | - |
| 6 | `api_brex_vendors_clerk_users` | - |
| 7 | `api_ofb_transfers` | - |
| 8 | `api_ofb_transfers_vendors` | - |
| 9 | `api_ofb_vendors` | - |
| 10 | `api_ofb_vendors_clerk_orgs` | - |
| 11 | `api_ofb_vendors_clerk_users` | - |
| 12 | `appraisal` | appraisal data |
| 13 | `auth_clerk_orgs` | - |
| 14 | `auth_clerk_orgs_members` | Clerk organization memberships. Access clerk_user_id through user_id -> auth_... |
| 15 | `auth_clerk_orgs_themes` | Organization theme customizations |
| 16 | `auth_clerk_users` | User profiles integrated with Clerk authentication - renamed from auth_user_p... |
| 17 | `bank_accounts` | Stores bank account configurations for integrations (OFB, Brex, etc.) |
| 18 | `borrower` | - |
| 19 | `bs_debt_instruments` | - |
| 20 | `bs_debt_instruments_deals` | - |
| 21 | `bsi_deals_clerk_orgs` | - |
| 22 | `bsi_deals_clerk_users` | Balance Sheet Investor deals - links deals to authenticated users. Previously... |
| 23 | `bsi_distributions` | - |
| 24 | `bsi_distributions_transactions` | Junction table linking distributions to transactions. Many:1 relationship - m... |
| 25 | `bsi_statements` | - |
| 26 | `bsi_statements_transactions` | Junction table linking statements to transactions. Supports Many:Many - one s... |
| 27 | `bsi_transactions` | - |
| 28 | `bsi_transactions_api_brex_transfers` | - |
| 29 | `bsi_transactions_api_ofb_transfers` | - |
| 30 | `bsi_transactions_deals` | - |
| 31 | `bsi_transactions_document_files` | - |
| 32 | `bsi_transactions_instruments` | - |
| 33 | `bsi_transactions_investors` | - |
| 34 | `cba_requests` | - |
| 35 | `cba_requests_guarantors` | junction table for a many-to-many relationship |
| 36 | `company` | - |
| 37 | `company_contact` | - |
| 38 | `company_member` | - |
| 39 | `company_roles` | - |
| 40 | `company_roles_defined` | - |
| 41 | `constants` | - |
| 42 | `contact` | - |
| 43 | `contact_contact_types` | Junction table linking contacts to their contact types (many-to-many) |
| 44 | `contact_types` | - |
| 45 | `countries` | Full list of countries. |
| 46 | `custom_loan_fees` | - |
| 47 | `deal` | - |
| 48 | `deal_appraisals` | - |
| 49 | `deal_guarantors` | Junction table linking deals to guarantors (many-to-many) |
| 50 | `deal_property` | - |
| 51 | `deal_role_types` | Lookup table defining roles that parties can play on a specific deal (e.g., B... |
| 52 | `deal_roles` | Junction table linking deals to parties (contacts or users) with their role o... |
| 53 | `document_files` | Storing documents used for loans |
| 54 | `document_investors` | - |
| 55 | `document_roles` | - |
| 56 | `document_roles_files` | - |
| 57 | `fee` | Table for the fee options used for loan pricing |
| 58 | `form_submissions` | - |
| 59 | `guarantor` | Borrower linked to a deal |
| 60 | `loan_application` | - |
| 61 | `milestone_templates` | - |
| 62 | `milestones` | Stages for each deal |
| 63 | `payroll_ledger` | - |
| 64 | `payroll_ledger_fees_1099` | - |
| 65 | `property` | - |
| 66 | `property_income` | - |
| 67 | `property_reapi` | Property search records returned by a RealEstateAPI endpoint |
| 68 | `roles` | - |
| 69 | `select_uw_outcomes` | dropdown values - underwriting decisions |
| 70 | `task_templates` | - |
| 71 | `tasks` | Tasks that need to be completed during the Loan Review Process |
| 72 | `users_roles` | - |
