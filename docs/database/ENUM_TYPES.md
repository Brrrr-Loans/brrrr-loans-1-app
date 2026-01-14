# Database Enumerated Types

**Database:** brrrr-loans-dev  
**Schema:** public  
**Generated:** 2026-01-13  
**Total Enums:** 55

---

## Table of Contents

1. [Amortization & Loan Structure](#amortization--loan-structure)
2. [Appraisal](#appraisal)
3. [Contacts & Companies](#contacts--companies)
4. [Deal Pipeline](#deal-pipeline)
5. [Documents](#documents)
6. [Financial](#financial)
7. [Geography](#geography)
8. [Property](#property)
9. [Transactions](#transactions)
10. [User & Roles](#user--roles)
11. [Utility Types](#utility-types)

---

## Amortization & Loan Structure

### `amortization_type`

```sql
CREATE TYPE "public"."amortization_type" AS ENUM (
    'fixed_rate',
    'adjustable_rate'
);
```

### `loan_accrual_type`

```sql
CREATE TYPE "public"."loan_accrual_type" AS ENUM (
    '30/360',
    '30/365',
    'Actual 360',
    'Actual 365'
);
```

### `loan_amortization`

```sql
CREATE TYPE "public"."loan_amortization" AS ENUM (
    'interest_only',
    '300',
    '360'
);
```

### `loan_program`

```sql
CREATE TYPE "public"."loan_program" AS ENUM (
    'BPL Program A',
    'BPL Program B'
);
```

### `loan_structure_dscr`

```sql
CREATE TYPE "public"."loan_structure_dscr" AS ENUM (
    '30_yr_fixed',
    '5/1_arm',
    '7/1_arm',
    '10/1_arm_io',
    '5/6_arm',
    '10/6_arm'
);
```

### `loan_term_months`

```sql
CREATE TYPE "public"."loan_term_months" AS ENUM (
    '6',
    '12',
    '15',
    '18',
    '24',
    '36',
    '48',
    '60',
    '72',
    '84',
    '96',
    '108',
    '120',
    '300',
    '360'
);
```

### `loan_type_1`

```sql
CREATE TYPE "public"."loan_type_1" AS ENUM (
    'dscr',
    'rtl'
);
```

### `loan_type_2`

```sql
CREATE TYPE "public"."loan_type_2" AS ENUM (
    'bridge',
    'bridge_plus_rehab'
);
```

### `ppp_structure`

```sql
CREATE TYPE "public"."ppp_structure" AS ENUM (
    'Declining',
    'Fixed 5%',
    'Fixed 4%',
    'Fixed 3%',
    'Fixed 2%',
    'Fixed 1%',
    'Interest',
    'Minimum Interest'
);
```

### `ppp_structure_1`

```sql
CREATE TYPE "public"."ppp_structure_1" AS ENUM (
    'declining',
    'fixed',
    'minimum_interest'
);
```

### `ppp_term`

```sql
CREATE TYPE "public"."ppp_term" AS ENUM (
    '0',
    '12',
    '24',
    '36',
    '48',
    '60',
    '72',
    '84',
    '96',
    '108',
    '120'
);
```

---

## Appraisal

### `appraisal_order_status`

```sql
CREATE TYPE "public"."appraisal_order_status" AS ENUM (
    'accepted_by_vendor',
    'action_required',
    'appraiser_waiting_for_contract',
    'appraiser_waiting_for_lease',
    'appraiser_waiting_for_questionnaire',
    'assigned_to_vendor',
    'awaiting_confirmation_for_appointment',
    'awaiting_fee_approval_from_client',
    'awaiting_info_from_client',
    'awaiting_trip_fee_approval_to_proceed',
    'cancelled',
    'completed',
    'declined_by_vendor',
    'file_in_review',
    'in_progress',
    'inspected',
    'inspection_scheduled',
    'left_message_with_contact',
    'on_hold',
    'order_Is_due_today',
    'payment_pending',
    'please_submit_report_order_past_due',
    'reconsideration_requested',
    'reconsideration_requested_urgent',
    'report_accepted',
    'report_accepted_awaiting_payment',
    'revision_requested',
    'revision_requested_urgent',
    'unassigned',
    'unassigned_awaiting_bids'
);
```

### `appraisal_order_type`

```sql
CREATE TYPE "public"."appraisal_order_type" AS ENUM (
    'commercial',
    'residential'
);
```

### `property_appraisal_status`

```sql
CREATE TYPE "public"."property_appraisal_status" AS ENUM (
    'Payment Needed',
    'Paid',
    'Ordered',
    'Received',
    'Revision Needed',
    'Revision Requested',
    'Completed'
);
```

---

## Contacts & Companies

### `citizenship`

```sql
CREATE TYPE "public"."citizenship" AS ENUM (
    'U.S. Citizen',
    'Permanent Resident',
    'Non-Permanent Resident',
    'Foreign National'
);
```

### `company_role`

```sql
CREATE TYPE "public"."company_role" AS ENUM (
    'Borrowing Entity',
    'Broker',
    'Insurance',
    'Legal',
    'Title',
    'Appraisal',
    'Appraisal Management Company',
    'Lender',
    'Loan Buyer',
    'Balance Sheet Investor',
    'Environmental',
    'Escrow',
    'Entity Member (Layer)'
);
```

### `contact_type`

```sql
CREATE TYPE "public"."contact_type" AS ENUM (
    'Appraisal Administration',
    'Appraisal Management Company',
    'Appraiser',
    'Borrower',
    'Borrower Assistant',
    'Broker',
    'Broker Loan Processor',
    'General Contractor',
    'Entity Member',
    'Escrow',
    'Insurance',
    'Balance Sheet Investor',
    'Lender',
    'Point of Contact',
    'Referring Party',
    'Title',
    'Transaction Coordinator',
    'Loan Buyer'
);
```

### `entity_type`

```sql
CREATE TYPE "public"."entity_type" AS ENUM (
    'corp',
    'general_partnership',
    'limited_liability_company',
    'limited_liability_partnership',
    'limited_partnership',
    's_corp',
    'sole_proprietorship'
);
```

### `marital_status`

```sql
CREATE TYPE "public"."marital_status" AS ENUM (
    'Married',
    'Separated',
    'Unmarried'
);
```

### `professional_license`

```sql
CREATE TYPE "public"."professional_license" AS ENUM (
    'Appraiser',
    'Certified Public Accountant (CPA)',
    'General Contractor',
    'Lender',
    'Mortgage (NMLS)',
    'Real Estate Broker',
    'Property Manager'
);
```

### `residence_ownership`

```sql
CREATE TYPE "public"."residence_ownership" AS ENUM (
    'Own',
    'Rent'
);
```

### `vesting_type`

```sql
CREATE TYPE "public"."vesting_type" AS ENUM (
    'entity',
    'Individual'
);
```

---

## Deal Pipeline

### `deal_disposition_1`

```sql
CREATE TYPE "public"."deal_disposition_1" AS ENUM (
    'active',
    'dead',
    'on_hold'
);
```

### `deal_stage_1`

```sql
CREATE TYPE "public"."deal_stage_1" AS ENUM (
    'lead',
    'scenario',
    'deal'
);
```

### `deal_stage_2`

```sql
CREATE TYPE "public"."deal_stage_2" AS ENUM (
    'loan_setup',
    'processing_1',
    'appraisal_review',
    'processing_2',
    'qc_1',
    'underwriting',
    'conditionally_approved',
    'qc_2',
    'clear_to_close',
    'closed_and_funded'
);
```

### `deal_status_primary`

```sql
CREATE TYPE "public"."deal_status_primary" AS ENUM (
    'Scenario',
    'Loan Setup',
    'Pre-Qual Review (PQR)',
    'Processing I',
    'Appraisal Review',
    'Processing II',
    'Pre-Submission Review (PSR)',
    'Underwriting',
    'Conditionally Approved',
    'Clear to Close',
    'Closed & Funded'
);
```

### `deal_status_primary__old_version_to_be_dropped` ⚠️ DEPRECATED

```sql
CREATE TYPE "public"."deal_status_primary__old_version_to_be_dropped" AS ENUM (
    'Prequal',
    'Scenario',
    'Active',
    'Complete',
    'Dead/Archived'
);
```

### `lead_source`

```sql
CREATE TYPE "public"."lead_source" AS ENUM (
    'biggerpockets',
    'broker',
    'brrrr.com_chat',
    'brrrr.com_form_submission',
    'direct_mail_marketing',
    'email_marketing',
    'event_conference_tradeshow',
    'existing_client',
    'podcast',
    'search_engine',
    'referral',
    'social_media',
    'other',
    'reia'
);
```

### `milestone_status`

```sql
CREATE TYPE "public"."milestone_status" AS ENUM (
    'to_do',
    'in_progress',
    'completed'
);
```

### `task_status`

```sql
CREATE TYPE "public"."task_status" AS ENUM (
    'not_started',
    'in_progress',
    'completed'
);
```

---

## Documents

### `document_category`

```sql
CREATE TYPE "public"."document_category" AS ENUM (
    'application',
    'appraisal',
    'assets',
    'closing',
    'credit_and_background',
    'construction',
    'environmental',
    'experience',
    'id',
    'insurance',
    'pricing',
    'property',
    'seasoning',
    'servicing',
    'title',
    'entity'
);
```

### `document_role`

```sql
CREATE TYPE "public"."document_role" AS ENUM (
    'Loan Officer',
    'Loan Opener',
    'Processor',
    'Broker',
    'Borrower',
    'Borrower/Broker',
    'Processor/Broker'
);
```

### `document_status`

```sql
CREATE TYPE "public"."document_status" AS ENUM (
    'approved',
    'pending_review',
    'pending_submission',
    'pending_exception',
    'rejected_items_needed',
    'rejected_revisions_needed',
    'rejected_signature_needed'
);
```

---

## Financial

### `credit_check_status`

```sql
CREATE TYPE "public"."credit_check_status" AS ENUM (
    'Payment Needed',
    'Paid',
    'Approved',
    'Denied',
    'Frozen',
    'Under Review'
);
```

### `debt_instrument_type`

```sql
CREATE TYPE "public"."debt_instrument_type" AS ENUM (
    'mortgage_note',
    'bridge_loan',
    'construction_loan',
    'rehab_loan',
    'senior_debt',
    'convertible_note',
    'mortgage_pool',
    'asset_backed_security',
    'other'
);
```

### `fee_type`

```sql
CREATE TYPE "public"."fee_type" AS ENUM (
    'lender_fee',
    'broker_fee',
    'appraisal_fee',
    'title_fee',
    'property_tax_-_city/town',
    'property_tax_-_county',
    'property_tax_-_school',
    'lender_holdback',
    'lender_reserve',
    'insurance _premium',
    'credit_and_background_fee',
    'judgment',
    'lien',
    'recording_and_transfer_fee',
    'transfer_tax',
    'lender_escrow'
);
```

### `ledger_entry_type`

```sql
CREATE TYPE "public"."ledger_entry_type" AS ENUM (
    'contribution',
    'redemption',
    'interest',
    'fee',
    'distribution'
);
```

---

## Geography

### `continents`

```sql
CREATE TYPE "public"."continents" AS ENUM (
    'africa',
    'antarctica',
    'asia',
    'europe',
    'oceania',
    'north_america',
    'south_america'
);
```

### `country_enum`

```sql
CREATE TYPE "public"."country_enum" AS ENUM (
    'Bonaire, Sint Eustatius and Saba',
    'Curaçao',
    'Guernsey',
    'Isle of Man',
    'Jersey',
    'Åland Islands',
    'Montenegro',
    'Saint Barthélemy',
    'Saint Martin (French part)',
    'Serbia',
    'Sint Maarten (Dutch part)',
    'South Sudan',
    'Timor-Leste',
    'American Samoa',
    'Andorra',
    'Angola',
    'Anguilla',
    'Antarctica',
    'Antigua and Barbuda',
    'Argentina',
    'Armenia',
    'Aruba',
    'Australia',
    'Austria',
    'Azerbaijan',
    'Bahamas',
    'Bahrain',
    'Bangladesh',
    'Barbados',
    'Belarus',
    'Belgium',
    'Belize',
    'Benin',
    'Bermuda',
    'Bhutan',
    'Bolivia',
    'Bosnia and Herzegovina',
    'Botswana',
    'Bouvet Island',
    'Brazil',
    'British Indian Ocean Territory',
    'Brunei Darussalam',
    'Bulgaria',
    'Burkina Faso',
    'Burundi',
    'Cambodia',
    'Cameroon',
    'Canada',
    'Cape Verde',
    'Cayman Islands',
    'Central African Republic',
    'Chad',
    'Chile',
    'China',
    'Christmas Island',
    'Cocos (Keeling) Islands',
    'Colombia',
    'Comoros',
    'Congo',
    'Congo, the Democratic Republic of the',
    'Cook Islands',
    'Costa Rica',
    'Cote DIvoire',
    'Croatia',
    'Cuba',
    'Cyprus',
    'Czech Republic',
    'Denmark',
    'Djibouti',
    'Dominica',
    'Dominican Republic',
    'Ecuador',
    'Egypt',
    'El Salvador',
    'Equatorial Guinea',
    'Eritrea',
    'Estonia',
    'Ethiopia',
    'Falkland Islands (Malvinas)',
    'Faroe Islands',
    'Fiji',
    'Finland',
    'France',
    'French Guiana',
    'French Polynesia',
    'French Southern Territories',
    'Gabon',
    'Gambia',
    'Georgia',
    'Germany',
    'Ghana',
    'Gibraltar',
    'Greece',
    'Greenland',
    'Grenada',
    'Guadeloupe',
    'Guam',
    'Guatemala',
    'Guinea',
    'Guinea-Bissau',
    'Guyana',
    'Haiti',
    'Heard Island and Mcdonald Islands',
    'Holy See (Vatican City State)',
    'Honduras',
    'Hong Kong',
    'Hungary',
    'Iceland',
    'India',
    'Indonesia',
    'Iran, Islamic Republic of',
    'Iraq',
    'Ireland',
    'Israel',
    'Italy',
    'Jamaica',
    'Japan',
    'Jordan',
    'Kazakhstan',
    'Kenya',
    'Kiribati',
    'Korea, Democratic People''s Republic of',
    'Korea, Republic of',
    'Kuwait',
    'Kyrgyzstan',
    'Lao People''s Democratic Republic',
    'Latvia',
    'Lebanon',
    'Lesotho',
    'Liberia',
    'Libya',
    'Liechtenstein',
    'Lithuania',
    'Luxembourg',
    'Macao',
    'Macedonia, the Former Yugoslav Republic of',
    'Madagascar',
    'Malawi',
    'Malaysia',
    'Maldives',
    'Mali',
    'Malta',
    'Marshall Islands',
    'Martinique',
    'Mauritania',
    'Mauritius',
    'Mayotte',
    'Mexico',
    'Micronesia, Federated States of',
    'Moldova, Republic of',
    'Monaco',
    'Mongolia',
    'Albania',
    'Montserrat',
    'Morocco',
    'Mozambique',
    'Myanmar',
    'Namibia',
    'Nauru',
    'Nepal',
    'Netherlands',
    'New Caledonia',
    'New Zealand',
    'Nicaragua',
    'Niger',
    'Nigeria',
    'Niue',
    'Norfolk Island',
    'Northern Mariana Islands',
    'Norway',
    'Oman',
    'Pakistan',
    'Palau',
    'Palestine, State of',
    'Panama',
    'Papua New Guinea',
    'Paraguay',
    'Peru',
    'Philippines',
    'Pitcairn',
    'Poland',
    'Portugal',
    'Puerto Rico',
    'Qatar',
    'Reunion',
    'Romania',
    'Russian Federation',
    'Rwanda',
    'Saint Helena, Ascension and Tristan da Cunha',
    'Saint Kitts and Nevis',
    'Saint Lucia',
    'Saint Pierre and Miquelon',
    'Saint Vincent and the Grenadines',
    'Samoa',
    'San Marino',
    'Sao Tome and Principe',
    'Saudi Arabia',
    'Senegal',
    'Seychelles',
    'Sierra Leone',
    'Singapore',
    'Slovakia',
    'Slovenia',
    'Solomon Islands',
    'Somalia',
    'South Africa',
    'South Georgia and the South Sandwich Islands',
    'Spain',
    'Sri Lanka',
    'Sudan',
    'Suriname',
    'Svalbard and Jan Mayen',
    'Swaziland',
    'Sweden',
    'Switzerland',
    'Syrian Arab Republic',
    'Taiwan (Province of China)',
    'Tajikistan',
    'Tanzania, United Republic of',
    'Thailand',
    'Togo',
    'Tokelau',
    'Tonga',
    'Trinidad and Tobago',
    'Tunisia',
    'Turkey',
    'Turkmenistan',
    'Turks and Caicos Islands',
    'Tuvalu',
    'Uganda',
    'Ukraine',
    'United Arab Emirates',
    'United Kingdom',
    'United States',
    'United States Minor Outlying Islands',
    'Uruguay',
    'Uzbekistan',
    'Vanuatu',
    'Venezuela',
    'Viet Nam',
    'Virgin Islands (British)',
    'Virgin Islands (U.S.)',
    'Wallis and Futuna',
    'Western Sahara',
    'Yemen',
    'Zambia',
    'Zimbabwe',
    'Afghanistan',
    'Algeria'
);
```

### `us_states`

```sql
CREATE TYPE "public"."us_states" AS ENUM (
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DC', 'DE', 'FL',
    'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME',
    'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH',
    'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'PR',
    'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV',
    'WI', 'WY'
);
```

### `us_states_long`

```sql
CREATE TYPE "public"."us_states_long" AS ENUM (
    'alabama', 'alaska', 'arizona', 'arkansas', 'california',
    'colorado', 'connecticut', 'delaware', 'district_of_columbia',
    'florida', 'georgia', 'hawaii', 'idaho', 'illinois', 'indiana',
    'iowa', 'kansas', 'kentucky', 'louisiana', 'maine', 'maryland',
    'massachusetts', 'michigan', 'minnesota', 'mississippi', 'missouri',
    'montana', 'nebraska', 'nevada', 'new_hampshire', 'new_jersey',
    'new_mexico', 'new_york', 'north_carolina', 'north_dakota', 'ohio',
    'oklahoma', 'oregon', 'pennsylvania', 'rhode_island', 'south_carolina',
    'south_dakota', 'tennessee', 'texas', 'utah', 'vermont', 'virginia',
    'washington', 'west_virginia', 'wisconsin', 'wyoming'
);
```

---

## Property

### `condo_type`

```sql
CREATE TYPE "public"."condo_type" AS ENUM (
    'warrantable',
    'non_warrantable'
);
```

### `lease_length`

```sql
CREATE TYPE "public"."lease_length" AS ENUM (
    'N/A',
    'STR',
    'Unoccupied',
    '12',
    '24',
    '36'
);
```

### `project_status`

```sql
CREATE TYPE "public"."project_status" AS ENUM (
    'Sold',
    'Held',
    'In Progress'
);
```

### `project_type`

```sql
CREATE TYPE "public"."project_type" AS ENUM (
    'fix_and_flip',
    'ground_up',
    'rental',
    'stabilized_bridge'
);
```

### `property_lease_term_status`

```sql
CREATE TYPE "public"."property_lease_term_status" AS ENUM (
    'active',
    'expired',
    'month_to_month'
);
```

### `property_occupancy`

```sql
CREATE TYPE "public"."property_occupancy" AS ENUM (
    'Vacant',
    'Tenant Occupied',
    'Owner Occupied'
);
```

### `property_type`

```sql
CREATE TYPE "public"."property_type" AS ENUM (
    'Single Family',
    'Condominium',
    'Condominium Warrantable',
    'Condominium Non-Warrantable',
    'Multifamily 2-4',
    'Multifamily 5-10',
    'Townhome/PUD',
    'Multifamily 11+',
    'Mixed Use 2-4',
    'Mixed Use 5-10',
    'Mixed Use 11+',
    'Other'
);
```

### `warrantability`

```sql
CREATE TYPE "public"."warrantability" AS ENUM (
    'warrantable',
    'non-warrantable'
);
```

---

## Transactions

### `transaction_method`

```sql
CREATE TYPE "public"."transaction_method" AS ENUM (
    'ach',
    'billpay',
    'cash',
    'check',
    'credit_card',
    'cryptocurrency',
    'debit_card',
    'internal',
    'rtp',
    'wire',
    'other'
);
```

### `transaction_reference_type`

```sql
CREATE TYPE "public"."transaction_reference_type" AS ENUM (
    'federal_reference_number',
    'imad',
    'omad'
);
```

### `transaction_status`

```sql
CREATE TYPE "public"."transaction_status" AS ENUM (
    'canceled',
    'completed',
    'failed',
    'initiated',
    'on_hold',
    'owed',
    'pending',
    'processing',
    'refunded',
    'returned',
    'scheduled',
    'pending_approval',
    'processed'
);
```

### `transaction_type`

```sql
CREATE TYPE "public"."transaction_type" AS ENUM (
    'purchase',
    'delayed_purchase',
    'refinance_rate_term',
    'refinance_cash_out'
);
```

---

## User & Roles

### `clerk_org_role`

```sql
CREATE TYPE "public"."clerk_org_role" AS ENUM (
    'admin',
    'member',
    'viewer'
);
```

### `user_role_internal`

```sql
CREATE TYPE "public"."user_role_internal" AS ENUM (
    'admin',
    'account_executive',
    'loan_processor',
    'balance_sheet_investor',
    'loan_opener'
);
```

---

## Utility Types

### `constant_types`

```sql
CREATE TYPE "public"."constant_types" AS ENUM (
    'Text',
    'Numeric',
    'Boolean'
);
```

### `true_false`

```sql
CREATE TYPE "public"."true_false" AS ENUM (
    'true',
    'false'
);
```

### `yes_no`

```sql
CREATE TYPE "public"."yes_no" AS ENUM (
    'yes',
    'no'
);
```

---

## Notes

- **Deprecated enum:** `deal_status_primary__old_version_to_be_dropped` should be removed in a future migration.
- **Enum modifications since initial schema:**
  - `ledger_entry_type`: Added `distribution` value
  - `transaction_status`: Added `pending_approval` and `processed` values
