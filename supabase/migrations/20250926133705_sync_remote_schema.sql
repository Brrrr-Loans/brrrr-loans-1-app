

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "http" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "moddatetime" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgaudit" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "wrappers" WITH SCHEMA "extensions";






CREATE TYPE "public"."amortization_type" AS ENUM (
    'fixed_rate',
    'adjustable_rate'
);


ALTER TYPE "public"."amortization_type" OWNER TO "postgres";


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


ALTER TYPE "public"."appraisal_order_status" OWNER TO "postgres";


CREATE TYPE "public"."appraisal_order_type" AS ENUM (
    'commercial',
    'residential'
);


ALTER TYPE "public"."appraisal_order_type" OWNER TO "postgres";


COMMENT ON TYPE "public"."appraisal_order_type" IS 'commercial appraisal v residential appraisal';



CREATE TYPE "public"."citizenship" AS ENUM (
    'U.S. Citizen',
    'Permanent Resident',
    'Non-Permanent Resident',
    'Foreign National'
);


ALTER TYPE "public"."citizenship" OWNER TO "postgres";


CREATE TYPE "public"."clerk_org_role" AS ENUM (
    'admin',
    'member',
    'viewer'
);


ALTER TYPE "public"."clerk_org_role" OWNER TO "postgres";


COMMENT ON TYPE "public"."clerk_org_role" IS 'Organization-level roles: admin (can manage org), member (standard access), viewer (read-only access). Business function roles are defined in user_role_internal enum.';



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


ALTER TYPE "public"."company_role" OWNER TO "postgres";


CREATE TYPE "public"."condo_type" AS ENUM (
    'warrantable',
    'non_warrantable'
);


ALTER TYPE "public"."condo_type" OWNER TO "postgres";


COMMENT ON TYPE "public"."condo_type" IS 'warrantability';



CREATE TYPE "public"."constant_types" AS ENUM (
    'Text',
    'Numeric',
    'Boolean'
);


ALTER TYPE "public"."constant_types" OWNER TO "postgres";


COMMENT ON TYPE "public"."constant_types" IS 'Types of constants that can be defined';



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


ALTER TYPE "public"."contact_type" OWNER TO "postgres";


CREATE TYPE "public"."continents" AS ENUM (
    'africa',
    'antarctica',
    'asia',
    'europe',
    'oceania',
    'north_america',
    'south_america'
);


ALTER TYPE "public"."continents" OWNER TO "postgres";


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


ALTER TYPE "public"."country_enum" OWNER TO "postgres";


CREATE TYPE "public"."credit_check_status" AS ENUM (
    'Payment Needed',
    'Paid',
    'Approved',
    'Denied',
    'Frozen',
    'Under Review'
);


ALTER TYPE "public"."credit_check_status" OWNER TO "postgres";


COMMENT ON TYPE "public"."credit_check_status" IS 'Status of credit check for a borrower or guarantor';



CREATE TYPE "public"."deal_disposition_1" AS ENUM (
    'active',
    'dead',
    'on_hold'
);


ALTER TYPE "public"."deal_disposition_1" OWNER TO "postgres";


CREATE TYPE "public"."deal_stage_1" AS ENUM (
    'lead',
    'scenario',
    'deal'
);


ALTER TYPE "public"."deal_stage_1" OWNER TO "postgres";


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


ALTER TYPE "public"."deal_stage_2" OWNER TO "postgres";


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


ALTER TYPE "public"."deal_status_primary" OWNER TO "postgres";


CREATE TYPE "public"."deal_status_primary__old_version_to_be_dropped" AS ENUM (
    'Prequal',
    'Scenario',
    'Active',
    'Complete',
    'Dead/Archived'
);


ALTER TYPE "public"."deal_status_primary__old_version_to_be_dropped" OWNER TO "postgres";


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


ALTER TYPE "public"."debt_instrument_type" OWNER TO "postgres";


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


ALTER TYPE "public"."document_category" OWNER TO "postgres";


CREATE TYPE "public"."document_role" AS ENUM (
    'Loan Officer',
    'Loan Opener',
    'Processor',
    'Broker',
    'Borrower',
    'Borrower/Broker',
    'Processor/Broker'
);


ALTER TYPE "public"."document_role" OWNER TO "postgres";


CREATE TYPE "public"."document_status" AS ENUM (
    'approved',
    'pending_review',
    'pending_submission',
    'pending_exception',
    'rejected_items_needed',
    'rejected_revisions_needed',
    'rejected_signature_needed'
);


ALTER TYPE "public"."document_status" OWNER TO "postgres";


CREATE TYPE "public"."entity_type" AS ENUM (
    'corp',
    'general_partnership',
    'limited_liability_company',
    'limited_liability_partnership',
    'limited_partnership',
    's_corp',
    'sole_proprietorship'
);


ALTER TYPE "public"."entity_type" OWNER TO "postgres";


COMMENT ON TYPE "public"."entity_type" IS 'company tax classification';



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


ALTER TYPE "public"."fee_type" OWNER TO "postgres";


COMMENT ON TYPE "public"."fee_type" IS 'Types of loan fees';



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


ALTER TYPE "public"."lead_source" OWNER TO "postgres";


CREATE TYPE "public"."lease_length" AS ENUM (
    'N/A',
    'STR',
    'Unoccupied',
    '12',
    '24',
    '36'
);


ALTER TYPE "public"."lease_length" OWNER TO "postgres";


CREATE TYPE "public"."ledger_entry_type" AS ENUM (
    'contribution',
    'redemption',
    'interest',
    'fee'
);


ALTER TYPE "public"."ledger_entry_type" OWNER TO "postgres";


CREATE TYPE "public"."loan_accrual_type" AS ENUM (
    '30/360',
    '30/365',
    'Actual 360',
    'Actual 365'
);


ALTER TYPE "public"."loan_accrual_type" OWNER TO "postgres";


CREATE TYPE "public"."loan_amortization" AS ENUM (
    'interest_only',
    '300',
    '360'
);


ALTER TYPE "public"."loan_amortization" OWNER TO "postgres";


CREATE TYPE "public"."loan_program" AS ENUM (
    'BPL Program A',
    'BPL Program B'
);


ALTER TYPE "public"."loan_program" OWNER TO "postgres";


COMMENT ON TYPE "public"."loan_program" IS 'List of loan programs';



CREATE TYPE "public"."loan_structure_dscr" AS ENUM (
    '30_yr_fixed',
    '5/1_arm',
    '7/1_arm',
    '10/1_arm_io',
    '5/6_arm',
    '10/6_arm'
);


ALTER TYPE "public"."loan_structure_dscr" OWNER TO "postgres";


COMMENT ON TYPE "public"."loan_structure_dscr" IS 'loan_structure_dscr_bplmortgagetrust';



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


ALTER TYPE "public"."loan_term_months" OWNER TO "postgres";


COMMENT ON TYPE "public"."loan_term_months" IS 'term duration (months)';



CREATE TYPE "public"."loan_type_1" AS ENUM (
    'dscr',
    'rtl'
);


ALTER TYPE "public"."loan_type_1" OWNER TO "postgres";


CREATE TYPE "public"."loan_type_2" AS ENUM (
    'bridge',
    'bridge_plus_rehab'
);


ALTER TYPE "public"."loan_type_2" OWNER TO "postgres";


CREATE TYPE "public"."ltv_scores" AS (
	"ltv_1" numeric,
	"ltv_2" numeric,
	"ltv_3" numeric,
	"ltv_4" numeric,
	"ltv_5" numeric,
	"ltv_6" numeric,
	"ltv_7" numeric
);


ALTER TYPE "public"."ltv_scores" OWNER TO "postgres";


CREATE TYPE "public"."marital_status" AS ENUM (
    'Married',
    'Separated',
    'Unmarried'
);


ALTER TYPE "public"."marital_status" OWNER TO "postgres";


CREATE TYPE "public"."max_ltv_scores" AS (
	"purchase_ltv" numeric,
	"delayed_purchase_ltv" numeric,
	"refinance_rt_ltv" numeric,
	"refinance_co_ltv" numeric
);


ALTER TYPE "public"."max_ltv_scores" OWNER TO "postgres";


CREATE TYPE "public"."milestone_status" AS ENUM (
    'to_do',
    'in_progress',
    'completed'
);


ALTER TYPE "public"."milestone_status" OWNER TO "postgres";


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


ALTER TYPE "public"."ppp_structure" OWNER TO "postgres";


COMMENT ON TYPE "public"."ppp_structure" IS 'pre-payment penalty structure';



CREATE TYPE "public"."ppp_structure_1" AS ENUM (
    'declining',
    'fixed',
    'minimum_interest'
);


ALTER TYPE "public"."ppp_structure_1" OWNER TO "postgres";


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


ALTER TYPE "public"."ppp_term" OWNER TO "postgres";


COMMENT ON TYPE "public"."ppp_term" IS 'prepayment penalty duration (months)';



CREATE TYPE "public"."professional_license" AS ENUM (
    'Appraiser',
    'Certified Public Accountant (CPA)',
    'General Contractor',
    'Lender',
    'Mortgage (NMLS)',
    'Real Estate Broker',
    'Property Manager'
);


ALTER TYPE "public"."professional_license" OWNER TO "postgres";


CREATE TYPE "public"."project_status" AS ENUM (
    'Sold',
    'Held',
    'In Progress'
);


ALTER TYPE "public"."project_status" OWNER TO "postgres";


COMMENT ON TYPE "public"."project_status" IS 'Status of a project in a borrower''s track record';



CREATE TYPE "public"."project_type" AS ENUM (
    'fix_and_flip',
    'ground_up',
    'rental',
    'stabilized_bridge'
);


ALTER TYPE "public"."project_type" OWNER TO "postgres";


COMMENT ON TYPE "public"."project_type" IS 'investment strategy or loan purpose';



CREATE TYPE "public"."property_appraisal_status" AS ENUM (
    'Payment Needed',
    'Paid',
    'Ordered',
    'Received',
    'Revision Needed',
    'Revision Requested',
    'Completed'
);


ALTER TYPE "public"."property_appraisal_status" OWNER TO "postgres";


COMMENT ON TYPE "public"."property_appraisal_status" IS 'Status of appraisal for a property';



CREATE TYPE "public"."property_lease_term_status" AS ENUM (
    'active',
    'expired',
    'month_to_month'
);


ALTER TYPE "public"."property_lease_term_status" OWNER TO "postgres";


CREATE TYPE "public"."property_occupancy" AS ENUM (
    'Vacant',
    'Tenant Occupied',
    'Owner Occupied'
);


ALTER TYPE "public"."property_occupancy" OWNER TO "postgres";


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


ALTER TYPE "public"."property_type" OWNER TO "postgres";


CREATE TYPE "public"."residence_ownership" AS ENUM (
    'Own',
    'Rent'
);


ALTER TYPE "public"."residence_ownership" OWNER TO "postgres";


CREATE TYPE "public"."task_status" AS ENUM (
    'not_started',
    'in_progress',
    'completed'
);


ALTER TYPE "public"."task_status" OWNER TO "postgres";


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


ALTER TYPE "public"."transaction_method" OWNER TO "postgres";


CREATE TYPE "public"."transaction_reference_type" AS ENUM (
    'federal_reference_number',
    'imad',
    'omad'
);


ALTER TYPE "public"."transaction_reference_type" OWNER TO "postgres";


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
    'scheduled'
);


ALTER TYPE "public"."transaction_status" OWNER TO "postgres";


CREATE TYPE "public"."transaction_type" AS ENUM (
    'purchase',
    'delayed_purchase',
    'refinance_rate_term',
    'refinance_cash_out'
);


ALTER TYPE "public"."transaction_type" OWNER TO "postgres";


CREATE TYPE "public"."true_false" AS ENUM (
    'true',
    'false'
);


ALTER TYPE "public"."true_false" OWNER TO "postgres";


CREATE TYPE "public"."us_states" AS ENUM (
    'AL',
    'AK',
    'AZ',
    'AR',
    'CA',
    'CO',
    'CT',
    'DC',
    'DE',
    'FL',
    'GA',
    'HI',
    'ID',
    'IL',
    'IN',
    'IA',
    'KS',
    'KY',
    'LA',
    'ME',
    'MD',
    'MA',
    'MI',
    'MN',
    'MS',
    'MO',
    'MT',
    'NE',
    'NV',
    'NH',
    'NJ',
    'NM',
    'NY',
    'NC',
    'ND',
    'OH',
    'OK',
    'OR',
    'PA',
    'PR',
    'RI',
    'SC',
    'SD',
    'TN',
    'TX',
    'UT',
    'VT',
    'VA',
    'WA',
    'WV',
    'WI',
    'WY'
);


ALTER TYPE "public"."us_states" OWNER TO "postgres";


CREATE TYPE "public"."us_states_long" AS ENUM (
    'alabama',
    'alaska',
    'arizona',
    'arkansas',
    'california',
    'colorado',
    'connecticut',
    'delaware',
    'district_of_columbia',
    'florida',
    'georgia',
    'hawaii',
    'idaho',
    'illinois',
    'indiana',
    'iowa',
    'kansas',
    'kentucky',
    'louisiana',
    'maine',
    'maryland',
    'massachusetts',
    'michigan',
    'minnesota',
    'mississippi',
    'missouri',
    'montana',
    'nebraska',
    'nevada',
    'new_hampshire',
    'new_jersey',
    'new_mexico',
    'new_york',
    'north_carolina',
    'north_dakota',
    'ohio',
    'oklahoma',
    'oregon',
    'pennsylvania',
    'rhode_island',
    'south_carolina',
    'south_dakota',
    'tennessee',
    'texas',
    'utah',
    'vermont',
    'virginia',
    'washington',
    'west_virginia',
    'wisconsin',
    'wyoming'
);


ALTER TYPE "public"."us_states_long" OWNER TO "postgres";


CREATE TYPE "public"."user_role_internal" AS ENUM (
    'admin',
    'account_executive',
    'loan_processor',
    'balance_sheet_investor',
    'loan_opener'
);


ALTER TYPE "public"."user_role_internal" OWNER TO "postgres";


COMMENT ON TYPE "public"."user_role_internal" IS 'internal user roles ';



CREATE TYPE "public"."vesting_type" AS ENUM (
    'entity',
    'Individual'
);


ALTER TYPE "public"."vesting_type" OWNER TO "postgres";


COMMENT ON TYPE "public"."vesting_type" IS 'the loan will close (title will vest) in the name of a(n):';



CREATE TYPE "public"."warrantability" AS ENUM (
    'warrantable',
    'non-warrantable'
);


ALTER TYPE "public"."warrantability" OWNER TO "postgres";


CREATE TYPE "public"."yes_no" AS ENUM (
    'yes',
    'no'
);


ALTER TYPE "public"."yes_no" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."format_address"("street" "text" DEFAULT NULL::"text", "suite_apt" "text" DEFAULT NULL::"text", "city" "text" DEFAULT NULL::"text", "state" "text" DEFAULT NULL::"text", "postal_code" "text" DEFAULT NULL::"text", "country" "text" DEFAULT 'United States'::"text") RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
  RETURN TRIM(CONCAT_WS(', ',
    NULLIF(CONCAT_WS(' ', street, suite_apt), ''),
    NULLIF(city, ''),
    NULLIF(state, ''),
    NULLIF(postal_code, ''),
    NULLIF(country, '')
  ));
END;
$$;


ALTER FUNCTION "public"."format_address"("street" "text", "suite_apt" "text", "city" "text", "state" "text", "postal_code" "text", "country" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."format_address"("po_box" "text", "street" "text", "apt_suite" "text", "city" "text", "state" "text", "postal_code" "text", "country" "text") RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    formatted_address text;
BEGIN
    -- Initialize an array to hold address components (excluding country)
    formatted_address := TRIM(BOTH ', ' FROM
        array_to_string(
            ARRAY_REMOVE(
                ARRAY[
                    NULLIF(street, ''),
                    NULLIF(apt_suite, ''),
                    NULLIF(city, ''),
                    CASE
                        WHEN COALESCE(state, '') <> '' AND COALESCE(postal_code, '') <> '' THEN
                            state || ' ' || postal_code
                        WHEN COALESCE(state, '') <> '' THEN
                            state
                        WHEN COALESCE(postal_code, '') <> '' THEN
                            postal_code
                        ELSE
                            NULL
                    END,
                    -- Removed country from array
                    CASE 
                        WHEN COALESCE(po_box, '') <> '' THEN
                            'PO Box ' || po_box 
                        ELSE 
                            NULL 
                    END
                ],
                NULL
            ),
            ', '
        )
    );

    -- Return the formatted address
    RETURN formatted_address;
END;
$$;


ALTER FUNCTION "public"."format_address"("po_box" "text", "street" "text", "apt_suite" "text", "city" "text", "state" "text", "postal_code" "text", "country" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."format_address"("po_box" "text", "street" "text", "apt_suite" "text", "city" "text", "state" "text", "postal_code" "text", "country" "text") IS 'Formats address components excluding country - updated on 2025-01-03';



CREATE OR REPLACE FUNCTION "public"."format_deal_name"("property_id" bigint) RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    formatted_name text;
BEGIN
    SELECT 
        CONCAT_WS(', ', 
            p.address_street, 
            p.address_suite_apt, 
            p.address_city || ', ' || p.address_state || ' ' || p.address_postal_code
        )
    INTO formatted_name
    FROM public.property p
    WHERE p.id = property_id;

    RETURN formatted_name;
END;
$$;


ALTER FUNCTION "public"."format_deal_name"("property_id" bigint) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."format_deal_name"("property_id" bigint) IS 'Formats deal name from property address excluding country - updated on 2025-01-03';



CREATE OR REPLACE FUNCTION "public"."get_jsonb_array_element"("array_value" "jsonb", "index" integer) RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    RETURN (
        with elements as (
          with x as (
            select jsonb_array_elements_text(array_value) AS element) 
            select x.element, row_number() over() as element_index from x
          ) 
        select elements.element from elements where elements.element_index = index);
END;
$$;


ALTER FUNCTION "public"."get_jsonb_array_element"("array_value" "jsonb", "index" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_numeric_constant"("constant_name" "text") RETURNS numeric
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    result numeric;
BEGIN
    -- Retrieve the constant record based on the given name
    SELECT numeric_value INTO result
    FROM public.constants
    WHERE name = constant_name;

    -- Check if the constant record exists
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Constant with name % not found', constant_name;
    END IF;

    return result;
END;
$$;


ALTER FUNCTION "public"."get_numeric_constant"("constant_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_state_code"("state_name" "text") RETURNS "public"."us_states"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$BEGIN
    state_name := LOWER(state_name); -- Convert input to lowercase
    CASE state_name
        WHEN 'alabama' THEN RETURN 'AL';
        WHEN 'alaska' THEN RETURN 'AK';
        WHEN 'arizona' THEN RETURN 'AZ';
        WHEN 'arkansas' THEN RETURN 'AR';
        WHEN 'california' THEN RETURN 'CA';
        WHEN 'colorado' THEN RETURN 'CO';
        WHEN 'connecticut' THEN RETURN 'CT';
        WHEN 'delaware' THEN RETURN 'DE';
        WHEN 'florida' THEN RETURN 'FL';
        WHEN 'georgia' THEN RETURN 'GA';
        WHEN 'hawaii' THEN RETURN 'HI';
        WHEN 'idaho' THEN RETURN 'ID';
        WHEN 'illinois' THEN RETURN 'IL';
        WHEN 'indiana' THEN RETURN 'IN';
        WHEN 'iowa' THEN RETURN 'IA';
        WHEN 'kansas' THEN RETURN 'KS';
        WHEN 'kentucky' THEN RETURN 'KY';
        WHEN 'louisiana' THEN RETURN 'LA';
        WHEN 'maine' THEN RETURN 'ME';
        WHEN 'maryland' THEN RETURN 'MD';
        WHEN 'massachusetts' THEN RETURN 'MA';
        WHEN 'michigan' THEN RETURN 'MI';
        WHEN 'minnesota' THEN RETURN 'MN';
        WHEN 'mississippi' THEN RETURN 'MS';
        WHEN 'missouri' THEN RETURN 'MO';
        WHEN 'montana' THEN RETURN 'MT';
        WHEN 'nebraska' THEN RETURN 'NE';
        WHEN 'nevada' THEN RETURN 'NV';
        WHEN 'new_hampshire' THEN RETURN 'NH';
        WHEN 'new_jersey' THEN RETURN 'NJ';
        WHEN 'new_mexico' THEN RETURN 'NM';
        WHEN 'new_york' THEN RETURN 'NY';
        WHEN 'north_carolina' THEN RETURN 'NC';
        WHEN 'north_dakota' THEN RETURN 'ND';
        WHEN 'ohio' THEN RETURN 'OH';
        WHEN 'oklahoma' THEN RETURN 'OK';
        WHEN 'oregon' THEN RETURN 'OR';
        WHEN 'pennsylvania' THEN RETURN 'PA';
        WHEN 'rhode_island' THEN RETURN 'RI';
        WHEN 'south_carolina' THEN RETURN 'SC';
        WHEN 'south_dakota' THEN RETURN 'SD';
        WHEN 'tennessee' THEN RETURN 'TN';
        WHEN 'texas' THEN RETURN 'TX';
        WHEN 'utah' THEN RETURN 'UT';
        WHEN 'vermont' THEN RETURN 'VT';
        WHEN 'virginia' THEN RETURN 'VA';
        WHEN 'washington' THEN RETURN 'WA';
        WHEN 'west_virginia' THEN RETURN 'WV';
        WHEN 'wisconsin' THEN RETURN 'WI';
        WHEN 'wyoming' THEN RETURN 'WY';
        ELSE RETURN NULL;
    END CASE;
END;$$;


ALTER FUNCTION "public"."get_state_code"("state_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_text_constant"("constant_name" "text") RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    result text;
BEGIN
    -- Retrieve the constant record based on the given name
    SELECT text_value INTO result
    FROM public.constants
    WHERE name = constant_name;

    -- Check if the constant record exists
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Constant with name % not found', constant_name;
    END IF;

    return result;
END;
$$;


ALTER FUNCTION "public"."get_text_constant"("constant_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_yesno_constant"("constant_name" "text") RETURNS "public"."yes_no"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    result yes_no;
BEGIN
    -- Retrieve the constant record based on the given name
    SELECT yes_no_value INTO result
    FROM public.constants
    WHERE name = constant_name;

    -- Check if the constant record exists
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Constant with name % not found', constant_name;
    END IF;

    return result;
END;
$$;


ALTER FUNCTION "public"."get_yesno_constant"("constant_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_deal_changes"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  IF NEW.property_id IS NOT NULL THEN
    -- Use the format_deal_name function for consistency
    NEW.deal_name := public.format_deal_name(NEW.property_id);
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_deal_changes"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_deal"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$declare 
  program_a_id int8;
  program_b_id int8;
begin

  insert into loan_program_a (loan_amount)
  values (0)
  returning id into program_a_id;

  insert into loan_program_b (loan_amount)
  values (0)
  returning id into program_b_id;

  NEW.program_a_id := program_a_id;
  NEW.program_b_id := program_b_id;
  return NEW;
end;$$;


ALTER FUNCTION "public"."handle_new_deal"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_loan_application"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  guarantor_count int;
  company_member_count int;
  company_member_borrower_id int;
  company_member_company_id int;
  company_member_guarantor_index text;
  counter int;
  new_deal_id bigint;
  new_company_id bigint;
  new_primary_borrower_id bigint;
  new_second_borrower_id bigint;
  new_third_borrower_id bigint;
  new_fourth_borrower_id bigint;
  new_primary_guarantor_id bigint;
  new_second_guarantor_id bigint;
  new_third_guarantor_id bigint;
  new_fourth_guarantor_id bigint;
  new_property_id bigint;
  submission_data JSONB;
BEGIN
  submission_data := NEW.submission::JSONB;
  BEGIN
  -- Create the property
    new_property_id := create_property_from_submission(submission_data);

  -- Create the deal
    new_deal_id := create_deal_from_submission(submission_data, new_property_id);

  -- Create the borrowers and set them as guarantors on the deal
    guarantor_count := CAST(NULLIF(submission_data->>'numberGuarantors', '') AS numeric);
    IF guarantor_count > 0 THEN
      new_primary_borrower_id = create_submission_borrower(
        submission_data->>'primaryGuarantorFirstName',
        submission_data->>'primaryGuarantorMiddleName',
        submission_data->>'primaryGuarantorLastName',
        submission_data->>'primaryGuarantorEmail',
        submission_data->>'primaryGuarantorCellPhone',
        submission_data->>'primaryGuarantorAlternatePhone',
        CAST(NULLIF(submission_data->>'primaryGuarantorCitizenship', '') AS citizenship),
        submission_data->>'primaryGuarantorSSN',
        TO_DATE(submission_data->>'primaryGuarantorDateOfBirth', 'YYYY-MM-DD'),
        submission_data->>'primaryGuarantorAddress',
        submission_data->>'primaryGuarantorAddressLine2',
        submission_data->>'primaryGuarantorCity',
        CAST(NULLIF(submission_data->>'primaryGuarantorState', '') AS us_states_long),
        submission_data->>'primaryGuarantorPostalCode',
        submission_data->>'primaryGuarantorCounty',
        submission_data->>'primaryGuarantorCountry',
        CAST(NULLIF(submission_data->>'primaryGuarantorFICO', '') as numeric),
        CAST(NULLIF(submission_data->>'primaryGuarantorRentalsOwned', '') as numeric),
        CAST(NULLIF(submission_data->>'primaryGuarantorFixAndFlip', '') as numeric),
        CAST(NULLIF(submission_data->>'primaryGuarantorGroundUp', '') as numeric),
        CAST(submission_data->>'primaryGuarantorExperienced' as yes_no)
      );

      new_primary_guarantor_id = create_submission_guarantor(new_deal_id, new_primary_borrower_id, 
        submission_data->>'primaryGuarantorFirstName',
        submission_data->>'primaryGuarantorMiddleName',
        submission_data->>'primaryGuarantorLastName',
        submission_data->>'primaryGuarantorEmail',
        submission_data->>'primaryGuarantorCellPhone'
      );
    END IF;

    IF guarantor_count > 1 THEN
      new_second_borrower_id = create_submission_borrower(
        submission_data->>'secondGuarantorFirstName',
        submission_data->>'secondGuarantorMiddleName',
        submission_data->>'secondGuarantorLastName',
        submission_data->>'secondGuarantorEmail',
        submission_data->>'secondGuarantorCellPhone',
        submission_data->>'secondGuarantorAlternatePhone',
        CAST(NULLIF(submission_data->>'secondGuarantorCitizenship', '') AS citizenship),
        submission_data->>'secondGuarantorSSN',
        TO_DATE(submission_data->>'secondGuarantorDateOfBirth', 'YYYY-MM-DD'),
        submission_data->>'secondGuarantorAddress',
        submission_data->>'secondGuarantorAddressLine2',
        submission_data->>'secondGuarantorCity',
        CAST(NULLIF(submission_data->>'secondGuarantorState', '') AS us_states_long),
        submission_data->>'secondGuarantorPostalCode',
        submission_data->>'secondGuarantorCounty',
        submission_data->>'secondGuarantorCountry',
        CAST(NULLIF(submission_data->>'secondGuarantorFICO', '') as numeric),
        CAST(NULLIF(submission_data->>'secondGuarantorRentalsOwned', '') as numeric),
        CAST(NULLIF(submission_data->>'secondGuarantorFixAndFlip', '') as numeric),
        CAST(NULLIF(submission_data->>'secondGuarantorGroundUp', '') as numeric),
        CAST(submission_data->>'secondGuarantorExperienced' as yes_no)
      );

      new_second_guarantor_id = create_submission_guarantor(new_deal_id, new_second_borrower_id, 
        submission_data->>'secondGuarantorFirstName',
        submission_data->>'secondGuarantorMiddleName',
        submission_data->>'secondGuarantorLastName',
        submission_data->>'secondGuarantorEmail',
        submission_data->>'secondGuarantorCellPhone'
      );
    END IF;

    IF guarantor_count > 2 THEN
      new_third_borrower_id = create_submission_borrower(
        submission_data->>'thirdGuarantorFirstName',
        submission_data->>'thirdGuarantorMiddleName',
        submission_data->>'thirdGuarantorLastName',
        submission_data->>'thirdGuarantorEmail',
        submission_data->>'thirdGuarantorCellPhone',
        submission_data->>'thirdGuarantorAlternatePhone',
        CAST(NULLIF(submission_data->>'thirdGuarantorCitizenship', '') AS citizenship),
        submission_data->>'thirdGuarantorSSN',
        TO_DATE(submission_data->>'thirdGuarantorDateOfBirth', 'YYYY-MM-DD'),
        submission_data->>'thirdGuarantorAddress',
        submission_data->>'thirdGuarantorAddressLine2',
        submission_data->>'thirdGuarantorCity',
        CAST(NULLIF(submission_data->>'thirdGuarantorState', '') AS us_states_long),
        submission_data->>'thirdGuarantorPostalCode',
        submission_data->>'thirdGuarantorCounty',
        submission_data->>'thirdGuarantorCountry',
        CAST(NULLIF(submission_data->>'thirdGuarantorFICO', '') as numeric),
        CAST(NULLIF(submission_data->>'thirdGuarantorRentalsOwned', '') as numeric),
        CAST(NULLIF(submission_data->>'thirdGuarantorFixAndFlip', '') as numeric),
        CAST(NULLIF(submission_data->>'thirdGuarantorGroundUp', '') as numeric),
        CAST(submission_data->>'thirdGuarantorExperienced' as yes_no)
      );

      new_third_guarantor_id = create_submission_guarantor(new_deal_id, new_third_borrower_id, 
        submission_data->>'thirdGuarantorFirstName',
        submission_data->>'thirdGuarantorMiddleName',
        submission_data->>'thirdGuarantorLastName',
        submission_data->>'thirdGuarantorEmail',
        submission_data->>'thirdGuarantorCellPhone'
      );
    END IF;

    IF guarantor_count > 3 THEN
      new_fourth_borrower_id = create_submission_borrower(
        submission_data->>'fourthGuarantorFirstName',
        submission_data->>'fourthGuarantorMiddleName',
        submission_data->>'fourthGuarantorLastName',
        submission_data->>'fourthGuarantorEmail',
        submission_data->>'fourthGuarantorCellPhone',
        submission_data->>'fourthGuarantorAlternatePhone',
        CAST(NULLIF(submission_data->>'fourthGuarantorCitizenship', '') AS citizenship),
        submission_data->>'fourthGuarantorSSN',
        TO_DATE(submission_data->>'fourthGuarantorDateOfBirth', 'YYYY-MM-DD'),
        submission_data->>'fourthGuarantorAddress',
        submission_data->>'fourthGuarantorAddressLine2',
        submission_data->>'fourthGuarantorCity',
        CAST(NULLIF(submission_data->>'fourthGuarantorState', '') AS us_states_long),
        submission_data->>'fourthGuarantorPostalCode',
        submission_data->>'fourthGuarantorCounty',
        submission_data->>'fourthGuarantorCountry',
        CAST(NULLIF(submission_data->>'fourthGuarantorFICO', '') as numeric),
        CAST(NULLIF(submission_data->>'fourthGuarantorRentalsOwned', '') as numeric),
        CAST(NULLIF(submission_data->>'fourthGuarantorFixAndFlip', '') as numeric),
        CAST(NULLIF(submission_data->>'fourthGuarantorGroundUp', '') as numeric),
        CAST(submission_data->>'fourthGuarantorExperienced' as yes_no)
      );

      new_fourth_guarantor_id = create_submission_guarantor(new_deal_id, new_fourth_borrower_id, 
        submission_data->>'fourthGuarantorFirstName',
        submission_data->>'fourthGuarantorMiddleName',
        submission_data->>'fourthGuarantorLastName',
        submission_data->>'fourthGuarantorEmail',
        submission_data->>'fourthGuarantorCellPhone'
      );
    END IF;


    IF submission_data->>'vestingEntityType' = 'Entity' THEN
      new_company_id := create_company_from_submission(submission_data);
      company_member_count := submission_data->>'numberCompanyMembers';

      IF new_company_id IS NOT NULL AND company_member_count > 0 THEN 
        counter := 1;

        WHILE counter <= company_member_count LOOP
          
          company_member_company_id := null;
          company_member_borrower_id := null;
          company_member_guarantor_index := null;

          IF get_jsonb_array_element(submission_data->'companyOwnerType', counter) = 'Entity' THEN
          -- get the company member type, if company, create a company and get the id. 
          insert into company (co_name, co_entity_type, co_ein, co_ppb_address_street, co_ppb_address_suite_apt,
            co_ppb_address_city, co_ppb_address_state_long, co_ppb_address_postal_code, co_ppb_address_country, co_role)
            values(
              get_jsonb_array_element(submission_data->'companyOwnerEntityName', counter),
              CAST(get_jsonb_array_element(submission_data->'companyOwnerEntityType', counter) AS entity_type),
              get_jsonb_array_element(submission_data->'companyOwnerEIN', counter),
              get_jsonb_array_element(submission_data->'companyOwnerStreetAddress', counter),
              get_jsonb_array_element(submission_data->'companyOwnerAddressLine2', counter),
              get_jsonb_array_element(submission_data->'companyOwnerCity', counter),
              CAST(get_jsonb_array_element(submission_data->'companyOwnerState', counter) AS us_states_long),
              get_jsonb_array_element(submission_data->'companyOwnerPostalCode', counter),
              CAST(get_jsonb_array_element(submission_data->'companyOwnerCountry', counter) AS country_enum),
              'Borrowing Entity'::company_role
            )
          returning co_id into company_member_company_id;
         
          ELSE
          -- if individual, check if is guarantor. if so get the guarantor number 
            IF get_jsonb_array_element(submission_data->'companyOwnerIsGuarantor', counter) = 'Yes' THEN
              company_member_guarantor_index := split_part(
                get_jsonb_array_element(submission_data->'companyOwnerGuarantorId', counter), ':', 1);
              company_member_borrower_id := CASE company_member_guarantor_index
                                              WHEN '1' THEN new_primary_borrower_id
                                              WHEN '2' THEN new_second_borrower_id
                                              WHEN '3' THEN new_third_borrower_id
                                              WHEN '4' THEN new_fourth_borrower_id
                                              ELSE null
                                            END;
            ELSE
              insert into borrower (first_name, middle_name, last_name, email_address, cell_phone, social_security_number,
                primary_residence_address_street, primary_residence_address_suite_apt, primary_residence_address_city, primary_residence_address_state_long, primary_residence_address_postal_code, primary_residence_address_country)
              values(
                get_jsonb_array_element(submission_data->'companyOwnerFirstName', counter),
                get_jsonb_array_element(submission_data->'companyOwnerMiddleName', counter),
                get_jsonb_array_element(submission_data->'companyOwnerLastName', counter),
                get_jsonb_array_element(submission_data->'companyOwnerEmail', counter),
                get_jsonb_array_element(submission_data->'companyOwnerCellPhone', counter),
                get_jsonb_array_element(submission_data->'companyOwnerTaxId', counter),
                get_jsonb_array_element(submission_data->'companyOwnerStreetAddress', counter),
                get_jsonb_array_element(submission_data->'companyOwnerAddressLine2', counter),
                get_jsonb_array_element(submission_data->'companyOwnerCity', counter),
                CAST(get_jsonb_array_element(submission_data->'companyOwnerState', counter) AS us_states_long),
                get_jsonb_array_element(submission_data->'companyOwnerPostalCode', counter),
                get_jsonb_array_element(submission_data->'companyOwnerCountry', counter)
              )
              returning id into company_member_borrower_id;
            END IF;
          END IF;
          -- create the member with the appropriate ids
          insert into company_member (member_company_id, 
            --member_name, 
            member_ownership_percentage, member_title, 
            member_borrower_id, member_owning_company_id, member_type, member_name_first, member_name_last, member_is_guarantor)
          values(
            new_company_id,
            --get_jsonb_array_element(submission_data->'companyOwnerName', counter),
            CAST(NULLIF(get_jsonb_array_element(submission_data->'companyOwnerOwnership', counter), '') AS double precision)/100,
            get_jsonb_array_element(submission_data->'companyOwnerTitle', counter),
            company_member_borrower_id,
            company_member_company_id,
            CAST(NULLIF(get_jsonb_array_element(submission_data->'companyOwnerType', counter), '') AS vesting_type),
            get_jsonb_array_element(submission_data->'companyOwnerFirstName', counter),
            get_jsonb_array_element(submission_data->'companyOwnerLastName', counter),
            CAST(NULLIF(get_jsonb_array_element(submission_data->'companyOwnerIsGuarantor', counter), '') AS yes_no)
          );
          counter := counter + 1;
        END LOOP;
      END IF;

    END IF;

    -- update the deal with the parties
    UPDATE deal SET
      company_id = new_company_id,
      primary_guarantor_id = new_primary_guarantor_id,
      second_guarantor_id = new_second_guarantor_id,
      third_guarantor_id = new_third_guarantor_id,
      fourth_guarantor_id = new_fourth_guarantor_id
    WHERE id = new_deal_id;
    
    IF new_deal_id IS NOT NULL THEN
      UPDATE loan_application SET 
        application_deal_id = new_deal_id,
        status = 'DEAL CREATED',
        reprocess = false 
      WHERE id = NEW.id;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
    -- Log the error (optional)
      UPDATE loan_application SET 
        status = 'ERROR',
        reprocess = false , 
        error_message = SQLERRM 
      WHERE id = NEW.id;
      RAISE LOG 'Error processing loan application submission: %', SQLERRM;
  END;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_loan_application"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$begin
  insert into public.user_profile (id, email, first_name, last_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'last_name', new.raw_user_meta_data->>'avatar_url');
  return new;
  return new;
end;$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_property_changes"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
  -- Function implementation stays the same, just adding secure search_path
  -- This function needs to be retrieved and recreated with the same logic
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_property_changes"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_user_profile_changes"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$DECLARE contactid bigint;
BEGIN
    --Update deal table:
    --RAISE log 'Running handle_user_profile_changes function with ID: %', NEW.id;
    select id into contactid from contact where user_profile_id = NEW.id;
    UPDATE deal SET guarantor_fico_score = NEW.fico_score_mid_actual, guarantor_citizenship = NEW.citizenship, 
    guarantor_first_time_home_buyer = NEW.first_time_home_buyer, guarantor_mortgage_debt = NEW.mortgage_debt
    where primary_guarantor_id = contactid and deal.locked = false;

RETURN NEW;
END;$$;


ALTER FUNCTION "public"."handle_user_profile_changes"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."ltv"("transaction_type" "public"."transaction_type", "as_is_value" numeric, "purchase_price" numeric, "loan_amount" numeric) RETURNS numeric
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    result NUMERIC;
BEGIN
    result := CASE
        WHEN transaction_type IN ('Refinance Rate/Term', 'Refinance Cash Out') THEN (100 * (loan_amount / as_is_value))
        WHEN purchase_price < as_is_value AND transaction_type IN ('Purchase', 'Delayed Purchase') THEN (100 * (loan_amount / purchase_price))
        WHEN purchase_price >= as_is_value AND transaction_type IN ('Purchase', 'Delayed Purchase') THEN (100 * (loan_amount / as_is_value))
    END;
    RETURN result;
END;
$$;


ALTER FUNCTION "public"."ltv"("transaction_type" "public"."transaction_type", "as_is_value" numeric, "purchase_price" numeric, "loan_amount" numeric) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_property_address"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE 
  new_address text;
BEGIN
  IF length(new.address_state_long::text) > 2 THEN
    new.address_state := get_state_code(new.address_state_long::text);
  END IF;

  -- Pass null for country parameter to exclude it from formatting
  new_address := format_address(new.address_street, new.address_suite_apt, new.address_city, new.address_state::text, new.address_postal_code, null, null);
  
  new.address = new_address;
  return new;
END;
$$;


ALTER FUNCTION "public"."update_property_address"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."document_files" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text",
    "public_notes" "text",
    "private_notes" "text",
    "status" "public"."document_status",
    "category" "public"."document_category",
    "deal_id" bigint,
    "borrower_id" bigint,
    "entity_id" bigint,
    "property_id" bigint,
    "guarantor_id" bigint,
    "effective_date" "date",
    "expiration_date" "date",
    "is_required" boolean,
    "uploaded_by" "text",
    "uploaded_at" timestamp with time zone,
    "file_url" "text",
    "file_size" bigint,
    "file_type" "text",
    "file_path" "text"
);


ALTER TABLE "public"."document_files" OWNER TO "postgres";


COMMENT ON TABLE "public"."document_files" IS 'Storing documents used for loans';



COMMENT ON COLUMN "public"."document_files"."name" IS 'document name';



COMMENT ON COLUMN "public"."document_files"."property_id" IS 'The Property Associated with a document';



COMMENT ON COLUMN "public"."document_files"."is_required" IS 'Is the document a required document?';



ALTER TABLE "public"."document_files" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."Documents_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."tasks" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deal_id" bigint,
    "task_name" character varying DEFAULT ''::character varying NOT NULL,
    "due_date" "date",
    "assigned_to" bigint,
    "status" "public"."task_status",
    "milestone_id" bigint,
    "task_description" "text",
    "task_order" numeric,
    "date_reached" "date",
    "date_completed" "date",
    "task_complete" boolean,
    "days_until_due" numeric,
    "task_action" "text"
);


ALTER TABLE "public"."tasks" OWNER TO "postgres";


COMMENT ON TABLE "public"."tasks" IS 'Tasks that need to be completed during the Loan Review Process';



COMMENT ON COLUMN "public"."tasks"."days_until_due" IS 'The number of days after which a task is due after its parent milestone turns to "In Progress"';



ALTER TABLE "public"."tasks" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."Tasks_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."appraisal" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "date_report_effective" "date",
    "date_report_expiration" "date",
    "updated_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text"),
    "property_id" bigint,
    "deal_id" bigint,
    "document_id" bigint,
    "date_report_ordered" "date",
    "date_report_received" "date",
    "date_inspection_completed" "date",
    "date_inspection_scheduled" "date",
    "value_conclusion_as_is" numeric,
    "value_conclusion_as_repaired" numeric,
    "value_conclusion_fair_market_rent" numeric,
    "file_number_amc" "text",
    "file_number" "text",
    "co_appraisal" bigint,
    "co_amc" bigint,
    "appraiser_id" bigint,
    "date_amc_vendor_assign" timestamp with time zone,
    "date_amc_vendor_accept" timestamp with time zone,
    "order_type" "public"."appraisal_order_type",
    "order_status" "public"."appraisal_order_status"
);


ALTER TABLE "public"."appraisal" OWNER TO "postgres";


COMMENT ON TABLE "public"."appraisal" IS 'appraisal data';



COMMENT ON COLUMN "public"."appraisal"."property_id" IS 'property record linked to the appraisal record';



COMMENT ON COLUMN "public"."appraisal"."deal_id" IS 'deal record linked to the appraisal record';



COMMENT ON COLUMN "public"."appraisal"."order_type" IS 'commercial appraisal v residential appraisal';



COMMENT ON COLUMN "public"."appraisal"."order_status" IS 'appraisal order status';



ALTER TABLE "public"."appraisal" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."appraisal_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."auth_clerk_orgs" (
    "id" bigint NOT NULL,
    "clerk_org_id" "text" NOT NULL,
    "clerk_org_name" "text" NOT NULL,
    "clerk_org_slug" "text" NOT NULL,
    "created_by_clerk_user_id" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."auth_clerk_orgs" OWNER TO "postgres";


COMMENT ON COLUMN "public"."auth_clerk_orgs"."created_by_clerk_user_id" IS 'Clerk user ID of the user who created this organization';



CREATE TABLE IF NOT EXISTS "public"."auth_clerk_orgs_members" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "auth_clerk_users_id" bigint,
    "clerk_org_id" bigint NOT NULL,
    "clerk_org_role" "public"."clerk_org_role" DEFAULT 'member'::"public"."clerk_org_role" NOT NULL
);


ALTER TABLE "public"."auth_clerk_orgs_members" OWNER TO "postgres";


COMMENT ON TABLE "public"."auth_clerk_orgs_members" IS 'Clerk organization memberships. Access clerk_user_id through user_id -> auth_clerk_users.clerk_user_id relationship';



COMMENT ON COLUMN "public"."auth_clerk_orgs_members"."auth_clerk_users_id" IS 'foreign key to auth_clerk_users.id';



COMMENT ON COLUMN "public"."auth_clerk_orgs_members"."clerk_org_role" IS 'Organization-specific role: admin (manage org), member (standard access), viewer (read-only access). Business roles are in auth_clerk_users.role column.';



CREATE TABLE IF NOT EXISTS "public"."auth_clerk_users" (
    "email" character varying(255),
    "updated_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text"),
    "clerk_username" "text",
    "first_name" "text",
    "last_name" "text",
    "full_name" "text" GENERATED ALWAYS AS (TRIM(BOTH FROM ((COALESCE("first_name", ''::"text") || ' '::"text") || COALESCE("last_name", ''::"text")))) STORED,
    "avatar_url" "text",
    "website" "text",
    "role" "public"."user_role_internal",
    "is_active_yn" boolean DEFAULT true,
    "deactivation_date" "date",
    "invitation_date" "date",
    "activated_date" "date",
    "id" bigint NOT NULL,
    "cell_phone" "text",
    "office_phone_extension" "text",
    "is_internal_yn" boolean DEFAULT false NOT NULL,
    "office_phone" "text",
    "clerk_user_id" "text",
    "contact_id" bigint,
    "create_organization_enabled" boolean DEFAULT false,
    "delete_self_enabled" boolean DEFAULT false,
    "is_locked" boolean DEFAULT false,
    "is_banned" boolean DEFAULT false,
    "last_active_at" timestamp with time zone,
    "last_sign_in_at" timestamp with time zone,
    "legal_accepted_at" timestamp with time zone,
    "has_image" boolean DEFAULT false,
    "image_url" "text",
    "email_verified" boolean DEFAULT false,
    "email_verified_at" timestamp with time zone,
    "phone_number" "text",
    CONSTRAINT "clerk_username_length" CHECK (("char_length"("clerk_username") >= 3))
);


ALTER TABLE "public"."auth_clerk_users" OWNER TO "postgres";


COMMENT ON TABLE "public"."auth_clerk_users" IS 'User profiles integrated with Clerk authentication - renamed from auth_user_profile on 2025-01-03';



COMMENT ON COLUMN "public"."auth_clerk_users"."clerk_username" IS 'Clerk username - renamed from username on 2025-01-03';



COMMENT ON COLUMN "public"."auth_clerk_users"."role" IS 'User role: ADMIN, ACCOUNT_EXECUTIVE, LOAN_PROCESSOR, BALANCE_SHEET_INVESTOR, or LOAN_OPENER';



COMMENT ON COLUMN "public"."auth_clerk_users"."is_active_yn" IS 'Whether the user account is active';



COMMENT ON COLUMN "public"."auth_clerk_users"."cell_phone" IS 'cell phone number';



COMMENT ON COLUMN "public"."auth_clerk_users"."office_phone_extension" IS 'office phone number extension';



COMMENT ON COLUMN "public"."auth_clerk_users"."is_internal_yn" IS 'Whether the user is an internal employee';



COMMENT ON COLUMN "public"."auth_clerk_users"."office_phone" IS 'office phone number';



COMMENT ON COLUMN "public"."auth_clerk_users"."clerk_user_id" IS 'Clerk user ID - renamed from clerk_id on 2025-01-03';



COMMENT ON COLUMN "public"."auth_clerk_users"."contact_id" IS 'foreign key to contact_id';



COMMENT ON COLUMN "public"."auth_clerk_users"."phone_number" IS 'Primary phone number from Clerk authentication';



CREATE TABLE IF NOT EXISTS "public"."borrower" (
    "id" bigint NOT NULL,
    "primary_residence_address_street" "text",
    "primary_residence_address_suite_apt" "text",
    "primary_residence_address_city" "text",
    "primary_residence_address_state" "public"."us_states",
    "primary_residence_address_postal_code" "text",
    "primary_residence_address_country" "text",
    "primary_residence_occupancy_start_date" "date",
    "primary_residence_ownership" "public"."residence_ownership",
    "previous_residence_address_street" "text",
    "previous_residence_address_suite_apt" "text",
    "previous_residence_address_city" "text",
    "previous_residence_address_state" "public"."us_states",
    "previous_residence_address_postal_code" "text",
    "previous_residence_address_country" "text",
    "mailing_address_is_primary_residence" boolean,
    "mailing_address_street" "text",
    "mailing_address_suite_apt" "text",
    "mailing_address_po_box" "text",
    "mailing_address_city" "text",
    "mailing_address_state" "public"."us_states",
    "mailing_address_postal_code" "text",
    "mailing_address_country" "text",
    "date_of_birth" "date",
    "social_security_number" "text",
    "citizenship" "public"."citizenship",
    "marital_status" "public"."marital_status",
    "fico_score_mid_estimate" smallint,
    "fico_score_mid_actual" smallint,
    "fico_report_date_pulled" "date",
    "exp_ground_ups_sold" smallint DEFAULT 0,
    "exp_flips_sold" smallint DEFAULT 0,
    "exp_rentals_owned" smallint DEFAULT 0,
    "exp_professional_license" "public"."professional_license",
    "created_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text"),
    "updated_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text"),
    "mortgage_debt" numeric,
    "fico_report_date_expiration" "date" GENERATED ALWAYS AS (("fico_report_date_pulled" + 91)) STORED,
    "first_time_home_buyer" "public"."yes_no",
    "fico_report_score_equifax" smallint,
    "fico_report_score_experian" smallint,
    "fico_report_score_transunion" smallint,
    "primary_residence_address_state_long" "public"."us_states_long",
    "previous_residence_address_state_long" "public"."us_states_long",
    "mailing_address_state_long" "public"."us_states_long",
    "has_experience" "public"."yes_no",
    "credit_check" "public"."credit_check_status",
    "first_name" "text",
    "middle_name" "text",
    "last_name" "text",
    "name" "text" GENERATED ALWAYS AS ((("first_name" || ' '::"text") || "last_name")) STORED,
    "email_address" "text",
    "cell_phone" "text",
    "home_phone" "text",
    "office_phone" "text",
    "primary_residence_address_county" "text",
    "previous_residence_occupancy_start_date" "date",
    "previous_residence_occupancy_end_date" "date"
);


ALTER TABLE "public"."borrower" OWNER TO "postgres";


ALTER TABLE "public"."borrower" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."borrower_profile_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."bs_debt_instruments" (
    "id" bigint NOT NULL,
    "instrument_type" "public"."debt_instrument_type" NOT NULL,
    "target_yield_pct" numeric,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deal_id" bigint NOT NULL
);


ALTER TABLE "public"."bs_debt_instruments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bs_debt_instruments_deals" (
    "id" bigint NOT NULL,
    "instrument_id" bigint NOT NULL,
    "deal_id" bigint NOT NULL
);


ALTER TABLE "public"."bs_debt_instruments_deals" OWNER TO "postgres";


COMMENT ON COLUMN "public"."bs_debt_instruments_deals"."instrument_id" IS 'foreign key to debt_instruments_id';



COMMENT ON COLUMN "public"."bs_debt_instruments_deals"."deal_id" IS 'foreign key to deal_id';



ALTER TABLE "public"."bs_debt_instruments_deals" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."bs_debt_instruments_deals_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."bsi_deals" (
    "deal_id" bigint NOT NULL,
    "id" bigint NOT NULL,
    "auth_clerk_users_id" bigint
);


ALTER TABLE "public"."bsi_deals" OWNER TO "postgres";


COMMENT ON TABLE "public"."bsi_deals" IS 'Balance Sheet Investor deals - links deals to authenticated users. Previously had redundant contact_id and contact_types_id columns removed in this migration.';



COMMENT ON COLUMN "public"."bsi_deals"."auth_clerk_users_id" IS 'Foreign key to auth_clerk_users for direct user association with deals';



ALTER TABLE "public"."bsi_deals" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."bsi_deals_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."bsi_deals_orgs" (
    "id" bigint NOT NULL,
    "deal_id" bigint NOT NULL,
    "clerk_org_id" bigint NOT NULL
);


ALTER TABLE "public"."bsi_deals_orgs" OWNER TO "postgres";


ALTER TABLE "public"."bsi_deals_orgs" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."bsi_deals_orgs_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."bsi_distributions" (
    "id" bigint NOT NULL,
    "deal_id" bigint,
    "rate_of_return_pct" numeric(5,4) NOT NULL,
    "interest_amount" numeric(15,2) NOT NULL,
    "servicing_fee" numeric(15,2) DEFAULT 0.00 NOT NULL,
    "wire_fee" numeric(15,2) DEFAULT 0.00 NOT NULL,
    "deposit_amount" numeric(15,2) NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "bsi_contact_id" bigint,
    "capital_contribution" numeric NOT NULL,
    "loan_amount_snapshot" numeric NOT NULL,
    "upb_close" numeric,
    "statement_id" "uuid" NOT NULL,
    "principal_amount" numeric NOT NULL,
    "instrument_id" bigint,
    "clerk_org_id" bigint,
    "clerk_org_member_id" bigint,
    "user_id" bigint
);


ALTER TABLE "public"."bsi_distributions" OWNER TO "postgres";


COMMENT ON COLUMN "public"."bsi_distributions"."clerk_org_member_id" IS 'fkey auth_clerk_orgs_members_id';



COMMENT ON COLUMN "public"."bsi_distributions"."user_id" IS 'fkey auth_user_profile_id';



ALTER TABLE "public"."bsi_distributions" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."bsi_distributions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."bsi_statements" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "statement_date" "date" NOT NULL,
    "statement_period_start" "date" NOT NULL,
    "statement_period_end" "date" NOT NULL,
    "total_upb_open" numeric NOT NULL,
    "total_upb_close" numeric NOT NULL,
    "total_interest" numeric NOT NULL,
    "total_principal" numeric,
    "total_fees" numeric NOT NULL,
    "clerk_org_id" bigint,
    "deposit_amount" numeric,
    "auth_clerk_users_id" bigint
);


ALTER TABLE "public"."bsi_statements" OWNER TO "postgres";


COMMENT ON COLUMN "public"."bsi_statements"."deposit_amount" IS 'amount paid to balance sheet investor (bsi)';



COMMENT ON COLUMN "public"."bsi_statements"."auth_clerk_users_id" IS 'Foreign key to auth_clerk_users for role-based authentication and RLS policy enforcement';



CREATE TABLE IF NOT EXISTS "public"."bsi_transactions" (
    "id" bigint NOT NULL,
    "investor_id" bigint,
    "transaction_amount" numeric(15,2),
    "transaction_date" timestamp with time zone DEFAULT "now"() NOT NULL,
    "transaction_method" "public"."transaction_method",
    "transaction_status" "public"."transaction_status",
    "reference_number" "text",
    "reference_type" "public"."transaction_reference_type",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "deal_id" bigint,
    "ledger_entry_type" "public"."ledger_entry_type" DEFAULT 'contribution'::"public"."ledger_entry_type" NOT NULL,
    "instrument_id" bigint,
    "clerk_id" "text",
    "clerk_organization_id" "text",
    "clerk_org_id" bigint
);


ALTER TABLE "public"."bsi_transactions" OWNER TO "postgres";


ALTER TABLE "public"."bsi_transactions" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."bsi_transactions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."bsi_transactions_references" (
    "id" bigint NOT NULL,
    "transaction_id" bigint NOT NULL,
    "reference_type" "public"."transaction_reference_type" NOT NULL,
    "reference_value" "text" NOT NULL
);


ALTER TABLE "public"."bsi_transactions_references" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cba_requests" (
    "id" bigint NOT NULL,
    "submitted_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "completed_at" timestamp with time zone,
    "deal_id" bigint,
    "uw_prequal_result_credit" bigint,
    "uw_prequal_result_background" bigint,
    "submitted_by" bigint NOT NULL
);


ALTER TABLE "public"."cba_requests" OWNER TO "postgres";


COMMENT ON COLUMN "public"."cba_requests"."deal_id" IS 'foreign key';



COMMENT ON COLUMN "public"."cba_requests"."uw_prequal_result_credit" IS 'foreign key to select_uw_outcomes_id';



COMMENT ON COLUMN "public"."cba_requests"."uw_prequal_result_background" IS 'foreign key to select_uw_outcomes_id';



COMMENT ON COLUMN "public"."cba_requests"."submitted_by" IS 'foreign key - select the user_profile_id of the individual who submitted the request';



CREATE TABLE IF NOT EXISTS "public"."cba_requests_guarantors" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "cba_request_id" bigint NOT NULL,
    "guarantor_id" bigint NOT NULL
);


ALTER TABLE "public"."cba_requests_guarantors" OWNER TO "postgres";


COMMENT ON TABLE "public"."cba_requests_guarantors" IS 'junction table for a many-to-many relationship';



ALTER TABLE "public"."cba_requests" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."cba_submission_credit_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."company" (
    "co_id" bigint NOT NULL,
    "co_name" "text",
    "co_ein" "text",
    "co_website" "text",
    "co_ppb_address_street" "text",
    "co_ppb_address_suite_apt" "text",
    "co_ppb_address_city" "text",
    "co_ppb_address_postal_code" "text",
    "co_ppb_address_country" "public"."country_enum" DEFAULT 'United States'::"public"."country_enum",
    "co_phone" "text",
    "co_fax" "text",
    "co_logo" "text",
    "co_role" "public"."company_role",
    "co_ppb_address_state" "public"."us_states",
    "created_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text"),
    "updated_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text"),
    "co_date_established" "date",
    "co_state_of_formation" "public"."us_states",
    "co_bank_of_business_account" "text",
    "co_bank_account_balance" numeric,
    "co_entity_type" "public"."entity_type",
    "co_ppb_address_state_long" "public"."us_states_long",
    "co_state_of_formation_long" "public"."us_states_long",
    "primary_guarantor_id" bigint
);


ALTER TABLE "public"."company" OWNER TO "postgres";


COMMENT ON COLUMN "public"."company"."co_ppb_address_street" IS 'principal place of business - street';



COMMENT ON COLUMN "public"."company"."co_ppb_address_suite_apt" IS 'principal place of business - suite/apt/bldg';



COMMENT ON COLUMN "public"."company"."co_ppb_address_city" IS 'principal place of business - city';



COMMENT ON COLUMN "public"."company"."co_ppb_address_postal_code" IS 'principal place of business - postal code';



COMMENT ON COLUMN "public"."company"."co_ppb_address_country" IS 'principal place of business - country';



COMMENT ON COLUMN "public"."company"."co_ppb_address_state" IS 'principal place of business - state';



COMMENT ON COLUMN "public"."company"."co_date_established" IS 'entity date of formation in state of formation';



COMMENT ON COLUMN "public"."company"."co_state_of_formation" IS 'entity domestic state of formation';



COMMENT ON COLUMN "public"."company"."co_bank_of_business_account" IS 'business account - bank name';



COMMENT ON COLUMN "public"."company"."co_bank_account_balance" IS 'business account - current balance';



COMMENT ON COLUMN "public"."company"."co_entity_type" IS 'entity legal structure';



COMMENT ON COLUMN "public"."company"."primary_guarantor_id" IS 'The company member who will serve as the Primary Guarantor';



CREATE TABLE IF NOT EXISTS "public"."company_contact" (
    "id" bigint NOT NULL,
    "co_id" bigint,
    "contact_id" bigint,
    "deal_id" bigint
);


ALTER TABLE "public"."company_contact" OWNER TO "postgres";


ALTER TABLE "public"."company_contact" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."company_contact_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE "public"."company" ALTER COLUMN "co_id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."company_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."company_member" (
    "member_id" bigint NOT NULL,
    "member_company_id" bigint,
    "member_ownership_percentage" double precision,
    "member_created_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text"),
    "member_updated_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text"),
    "member_title" "text",
    "member_borrower_id" bigint,
    "member_name_first" "text",
    "member_name_last" "text",
    "member_type" "public"."vesting_type",
    "member_owning_company_id" bigint,
    "member_is_guarantor" "public"."yes_no"
);


ALTER TABLE "public"."company_member" OWNER TO "postgres";


ALTER TABLE "public"."company_member" ALTER COLUMN "member_id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."company_member_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."company_roles_defined" (
    "id" bigint NOT NULL,
    "co_role" "public"."company_role" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text"),
    "deal_id" bigint
);


ALTER TABLE "public"."company_roles_defined" OWNER TO "postgres";


COMMENT ON COLUMN "public"."company_roles_defined"."co_role" IS 'company role';



ALTER TABLE "public"."company_roles_defined" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."company_role_mm_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."company_roles" (
    "id" bigint NOT NULL,
    "co_id" bigint NOT NULL,
    "role_id" bigint NOT NULL,
    "deal_id" bigint
);


ALTER TABLE "public"."company_roles" OWNER TO "postgres";


ALTER TABLE "public"."company_roles" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."company_roles_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."constants" (
    "id" bigint NOT NULL,
    "name" "text",
    "description" "text",
    "type" "public"."constant_types",
    "active" boolean,
    "text_value" "text",
    "numeric_value" numeric,
    "yes_no_value" "public"."yes_no",
    "created_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text"),
    "updated_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text")
);


ALTER TABLE "public"."constants" OWNER TO "postgres";


ALTER TABLE "public"."constants" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."constants_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."contact" (
    "id" bigint NOT NULL,
    "first_name" "text",
    "last_name" "text",
    "email_address" "text",
    "cell_phone" "text",
    "home_phone" "text",
    "office_phone" "text",
    "portal_access" boolean DEFAULT false,
    "company_id" bigint,
    "contact_type" "public"."contact_type",
    "profile_picture" "text",
    "created_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text"),
    "updated_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text"),
    "name" "text" GENERATED ALWAYS AS ((("first_name" || ' '::"text") || "last_name")) STORED,
    "contact_types" "public"."contact_type"[],
    "middle_name" "text",
    "user_id" bigint
);


ALTER TABLE "public"."contact" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."contact_types_jt" (
    "id" bigint NOT NULL,
    "contact_id" bigint,
    "contact_types_id" bigint
);


ALTER TABLE "public"."contact_types_jt" OWNER TO "postgres";


ALTER TABLE "public"."contact_types_jt" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."contact_contact_types_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE "public"."contact" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."contact_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."contact_types" (
    "id" bigint NOT NULL,
    "name" "text"
);


ALTER TABLE "public"."contact_types" OWNER TO "postgres";


ALTER TABLE "public"."contact_types" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."contact_types_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."countries" (
    "id" bigint NOT NULL,
    "name" "text",
    "iso2" "text" NOT NULL,
    "iso3" "text",
    "local_name" "text",
    "continent" "public"."continents"
);


ALTER TABLE "public"."countries" OWNER TO "postgres";


COMMENT ON TABLE "public"."countries" IS 'Full list of countries.';



COMMENT ON COLUMN "public"."countries"."name" IS 'Full country name.';



COMMENT ON COLUMN "public"."countries"."iso2" IS 'ISO 3166-1 alpha-2 code.';



COMMENT ON COLUMN "public"."countries"."iso3" IS 'ISO 3166-1 alpha-3 code.';



COMMENT ON COLUMN "public"."countries"."local_name" IS 'Local variation of the name.';



ALTER TABLE "public"."countries" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."countries_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."custom_loan_fees" (
    "id" bigint NOT NULL,
    "deal_id" bigint NOT NULL,
    "fee_category" "public"."fee_type",
    "fee_description" "text",
    "fee_amount" numeric,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."custom_loan_fees" OWNER TO "postgres";


ALTER TABLE "public"."custom_loan_fees" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."custom_loan_fees_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."deal" (
    "id" bigint NOT NULL,
    "deal_name" "text",
    "vesting_type" "public"."vesting_type",
    "guarantor_count" smallint DEFAULT '1'::smallint,
    "lead_source_type" "public"."lead_source",
    "property_id" bigint,
    "company_id" bigint,
    "created_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text"),
    "updated_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text"),
    "note_date" "date",
    "mid_fico" smallint DEFAULT '0'::smallint,
    "pricing_is_locked" boolean DEFAULT false NOT NULL,
    "broker_id" bigint,
    "lead_source_name" "text",
    "loan_number" "text" NOT NULL,
    "declaration_1_lawsuits" boolean,
    "declaration_2_bankruptcy" boolean,
    "declaration_3_felony" boolean DEFAULT false,
    "declaration_5_license" boolean DEFAULT false,
    "declaration_1_lawsuits_explanation" "text",
    "declaration_2_bankruptcy_explanation" "text",
    "declaration_3_felony_explanation" "text",
    "recourse_type" "text" DEFAULT 'full_recourse'::"text",
    "transaction_type" "public"."transaction_type",
    "payoff_mtg1_amount" numeric,
    "loan_structure_dscr" "public"."loan_structure_dscr",
    "guarantor_fico_score" smallint,
    "title_company_contact_id" bigint,
    "title_company_id" bigint,
    "insurance_carrier_contact_id" bigint,
    "closing_agent_contact_id" bigint,
    "appraisal_poc_contact_id" bigint,
    "insurance_carrier_company_id" bigint,
    "cash_out_purpose" "text",
    "target_closing_date" "date",
    "date_of_purchase" "date",
    "loan_amount_total" numeric,
    "construction_holdback" numeric,
    "loan_amount_initial" numeric,
    "loan_term" "public"."loan_term_months",
    "title_file_number" "text",
    "deal_type" "public"."loan_type_1",
    "project_type" "public"."project_type",
    "deal_stage_1" "public"."deal_stage_1",
    "deal_stage_2" "public"."deal_stage_2",
    "deal_disposition_1" "public"."deal_disposition_1",
    "loan_type_rtl" "public"."loan_type_2",
    "renovation_cost" numeric,
    "renovation_completed" "date",
    "recently_renovated" "public"."yes_no",
    "purchase_price" numeric,
    "account_executive_id" bigint,
    "funding_date" "date",
    "loan_sale_date" "date",
    "pricing_file_path" "text",
    "pricing_file_url" "text",
    "second_guarantor_id" bigint,
    "third_guarantor_id" bigint,
    "fourth_guarantor_id" bigint,
    "primary_guarantor_id" bigint,
    "loan_buyer_contact_id" bigint,
    "loan_buyer_company_id" bigint,
    "loan_processor_id" bigint,
    "loan_opener_id" bigint,
    "note_rate" numeric,
    "cost_of_capital" numeric,
    "broker_company_id" bigint,
    "escrow_company_id" bigint,
    "escrow_contact_id" bigint,
    "ltv_asis" numeric,
    "ltv_after_repair" numeric,
    "io_period" numeric,
    "ppp_term" "public"."ppp_term",
    "ppp_structure_1" "public"."ppp_structure_1"
);


ALTER TABLE "public"."deal" OWNER TO "postgres";


COMMENT ON COLUMN "public"."deal"."note_date" IS 'actual closing date';



COMMENT ON COLUMN "public"."deal"."declaration_5_license" IS 'Are you a licensed General Contractor, Real Estate Broker / Sales Person, Lender, Appraiser or involved in any other real estate related activities?';



COMMENT ON COLUMN "public"."deal"."target_closing_date" IS 'projected closing date';



COMMENT ON COLUMN "public"."deal"."date_of_purchase" IS 'acquisition date / purchase date';



COMMENT ON COLUMN "public"."deal"."construction_holdback" IS 'lender holdback: construction financed';



COMMENT ON COLUMN "public"."deal"."title_file_number" IS 'issuing office file number';



COMMENT ON COLUMN "public"."deal"."deal_type" IS 'Deal Type';



COMMENT ON COLUMN "public"."deal"."funding_date" IS 'date on which funding authorization is issued';



COMMENT ON COLUMN "public"."deal"."loan_sale_date" IS 'date of loan sale';



COMMENT ON COLUMN "public"."deal"."note_rate" IS 'interest rate charged to the borrower';



COMMENT ON COLUMN "public"."deal"."ltv_asis" IS 'loan to value as is = (initial loan amount / lesser of as is value and purchase price)';



COMMENT ON COLUMN "public"."deal"."ltv_after_repair" IS 'loan to value after repair value (total loan amount / after repair value)';



COMMENT ON COLUMN "public"."deal"."io_period" IS 'duration of interest only period expressed as a number of months (e.g., 120)';



COMMENT ON COLUMN "public"."deal"."ppp_term" IS 'pre-payment penalty term';



COMMENT ON COLUMN "public"."deal"."ppp_structure_1" IS 'pre-payment penalty structure';



CREATE TABLE IF NOT EXISTS "public"."deal_appraisals" (
    "id" bigint NOT NULL,
    "deal_id" bigint,
    "appraisal_id" bigint,
    "property_id" bigint
);


ALTER TABLE "public"."deal_appraisals" OWNER TO "postgres";


COMMENT ON COLUMN "public"."deal_appraisals"."property_id" IS 'Foreign key to property table - renamed from property_Id for consistent naming';



ALTER TABLE "public"."deal_appraisals" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."deal_appraisals_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE "public"."deal" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."deal_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."deal_property" (
    "id" bigint NOT NULL,
    "deal_id" bigint NOT NULL,
    "property_id" bigint NOT NULL
);


ALTER TABLE "public"."deal_property" OWNER TO "postgres";


ALTER TABLE "public"."deal_property" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."deal_property_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."deal_roles" (
    "id" bigint NOT NULL,
    "deal_id" bigint,
    "contact_id" bigint,
    "contact_types_id" bigint
);


ALTER TABLE "public"."deal_roles" OWNER TO "postgres";


ALTER TABLE "public"."deal_roles" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."deal_roles_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE "public"."bs_debt_instruments" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."debt_instruments_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."document_roles" (
    "id" bigint NOT NULL,
    "role_name" "text" NOT NULL
);


ALTER TABLE "public"."document_roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."document_roles_assigned" (
    "document_id" bigint NOT NULL,
    "role_id" bigint NOT NULL
);


ALTER TABLE "public"."document_roles_assigned" OWNER TO "postgres";


ALTER TABLE "public"."document_roles" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."document_roles_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."fee" (
    "id" bigint NOT NULL,
    "category" "text" NOT NULL,
    "program" "public"."loan_program",
    "fee_amount_bps" numeric NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."fee" OWNER TO "postgres";


COMMENT ON TABLE "public"."fee" IS 'Table for the fee options used for loan pricing';



COMMENT ON COLUMN "public"."fee"."fee_amount_bps" IS 'fee amount %';



ALTER TABLE "public"."fee" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."fee_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."guarantor" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "borrower_id" bigint,
    "deal_id" bigint,
    "first_name" "text",
    "middle_name" "text",
    "last_name" "text",
    "name" "text" GENERATED ALWAYS AS ((("first_name" || ' '::"text") || "last_name")) STORED,
    "email_address" "text",
    "cell_phone" "text",
    "home_phone" "text",
    "office_phone" "text",
    "primary_residence_address_street" "text",
    "primary_residence_address_suite_apt" "text",
    "primary_residence_address_city" "text",
    "primary_residence_address_state" "public"."us_states",
    "primary_residence_address_state_long" "public"."us_states_long",
    "primary_residence_address_postal_code" "text",
    "primary_residence_address_country" "text",
    "primary_residence_occupancy_start_date" "date",
    "primary_residence_ownership" "public"."residence_ownership",
    "previous_residence_address_street" "text",
    "previous_residence_address_suite_apt" "text",
    "previous_residence_address_city" "text",
    "previous_residence_address_state" "public"."us_states",
    "previous_residence_address_state_long" "public"."us_states_long",
    "previous_residence_address_postal_code" "text",
    "previous_residence_address_country" "text",
    "mailing_address_is_primary_residence" boolean,
    "mailing_address_street" "text",
    "mailing_address_suite_apt" "text",
    "mailing_address_po_box" "text",
    "mailing_address_city" "text",
    "mailing_address_state" "public"."us_states",
    "mailing_address_state_long" "public"."us_states_long",
    "mailing_address_postal_code" "text",
    "mailing_address_country" "text",
    "date_of_birth" "date",
    "social_security_number" "text",
    "citizenship" "public"."citizenship",
    "marital_status" "public"."marital_status",
    "mortgage_debt" numeric,
    "fico_score_mid_estimate" smallint,
    "fico_score_mid_actual" smallint,
    "fico_report_date_pulled" "date",
    "fico_report_date_expiration" "date" GENERATED ALWAYS AS (("fico_report_date_pulled" + 91)) STORED,
    "fico_report_score_equifax" smallint,
    "fico_report_score_experian" smallint,
    "fico_report_score_transunion" smallint,
    "first_time_home_buyer" "public"."yes_no",
    "exp_ground_ups_sold" smallint DEFAULT 0,
    "exp_flips_sold" smallint DEFAULT 0,
    "exp_rentals_owned" smallint DEFAULT 0,
    "exp_professional_license" "public"."professional_license",
    "has_experience" "public"."yes_no",
    "credit_check" "public"."credit_check_status"
);


ALTER TABLE "public"."guarantor" OWNER TO "postgres";


COMMENT ON TABLE "public"."guarantor" IS 'Borrower linked to a deal';



ALTER TABLE "public"."guarantor" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."guarantor_guarantor_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."loan_application" (
    "id" bigint NOT NULL,
    "submission" "jsonb",
    "status" "text",
    "application_deal_id" bigint,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "error_message" "text",
    "reprocess" boolean DEFAULT false
);


ALTER TABLE "public"."loan_application" OWNER TO "postgres";


ALTER TABLE "public"."loan_application" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."loan_application_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."milestone_templates" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "milestone_name" "text" NOT NULL,
    "milestone_order" numeric,
    "status" "public"."milestone_status",
    "types_applied_to" "text",
    "subject_property_state" "public"."us_states",
    "vesting_type" "public"."vesting_type",
    "email_template_subject" "text",
    "email_template_body" "text"
);


ALTER TABLE "public"."milestone_templates" OWNER TO "postgres";


COMMENT ON COLUMN "public"."milestone_templates"."status" IS 'The default status when new milestones are created for a deal.';



COMMENT ON COLUMN "public"."milestone_templates"."subject_property_state" IS 'state(s) in which the subject property is located';



ALTER TABLE "public"."milestone_templates" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."milestone_templates_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."milestones" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deal_id" bigint NOT NULL,
    "milestone_order" numeric,
    "status" "public"."milestone_status",
    "date_reached" "date",
    "date_completed" "date",
    "milestone_template_id" bigint,
    "email_subject" "text",
    "email_body" "text",
    "email_sent" boolean,
    "date_email_sent" "date"
);


ALTER TABLE "public"."milestones" OWNER TO "postgres";


COMMENT ON TABLE "public"."milestones" IS 'Stages for each deal';



COMMENT ON COLUMN "public"."milestones"."milestone_order" IS 'The order each milestone needs to be completed in.';



COMMENT ON COLUMN "public"."milestones"."status" IS 'Current status of milestone';



COMMENT ON COLUMN "public"."milestones"."date_reached" IS 'The date a deal reached the milestone';



ALTER TABLE "public"."milestones" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."milestones_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."payroll_submission" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "income_bpc_usd" numeric,
    "income_bpc_pct" numeric,
    "income_lpc_usd" numeric,
    "income_lpc_pct" numeric,
    "income_lpc_trailing_yn" boolean,
    "income_lpc_trailing_usd" numeric,
    "income_lpc_trailing_pct" numeric,
    "income_lpc_promo_usd" numeric,
    "expense_ace_corp_return_usd" numeric DEFAULT 0.00,
    "expense_ace_corp_override_usd" numeric DEFAULT 0.00,
    "expense_misc_ppcc_usd" numeric DEFAULT 0.00,
    "income_net_usd" numeric,
    "comp_ae_formula_output_usd" numeric,
    "comp_ae_formula_output_pct" numeric,
    "comp_ae_final_usd" numeric,
    "comp_lp_formula_output_usd" numeric,
    "comp_lp_formula_output_pct" numeric,
    "comp_lp_final_usd" numeric,
    "income_bpc_received_yn" boolean,
    "income_bpc_received_datetime" timestamp with time zone,
    "deal_id" bigint
);


ALTER TABLE "public"."payroll_submission" OWNER TO "postgres";


COMMENT ON TABLE "public"."payroll_submission" IS 'user submission data by deal record';



COMMENT ON COLUMN "public"."payroll_submission"."deal_id" IS 'foreign key to deal record';



CREATE TABLE IF NOT EXISTS "public"."payroll_submission_fees_1099" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "payroll_submission_id" bigint,
    "broker_id" bigint,
    "expense_1099_broker_fee_usd" numeric,
    "expense_1099_broker_fee_pct" numeric,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone
);


ALTER TABLE "public"."payroll_submission_fees_1099" OWNER TO "postgres";


COMMENT ON TABLE "public"."payroll_submission_fees_1099" IS 'junction table to associate one or more broker fee(s) and referral fee(s) to payroll submission record(s)';



ALTER TABLE "public"."payroll_submission" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."payroll_submission_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE "public"."auth_clerk_users" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."profile_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."property" (
    "id" bigint NOT NULL,
    "property_type" "public"."property_type",
    "year_built" bigint,
    "sq_footage_gla_aiv" bigint,
    "address_street" "text",
    "address_suite_apt" "text",
    "address_city" "text",
    "address_state" "public"."us_states",
    "address_postal_code" "text",
    "address_country" "text" DEFAULT 'United States'::"text",
    "units" smallint,
    "expense_annual_property_tax" numeric,
    "expense_annual_insurance_hoi" numeric,
    "expense_annual_insurance_flood" numeric,
    "expense_annual_management" numeric,
    "expense_annual_association_hoa" numeric,
    "purchase_price" numeric,
    "renovation_cost" numeric,
    "renovation_completed" "date",
    "created_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text"),
    "updated_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text"),
    "address" "text",
    "short_term_rental" "public"."yes_no",
    "declining_market" "public"."yes_no",
    "rural" "public"."yes_no",
    "flood_zone" "public"."yes_no",
    "recently_renovated" "public"."yes_no",
    "purchase_date" "date",
    "rehab_completed_post_acquisition" numeric,
    "value_aiv_estimate" numeric,
    "hoa_contact_phone" "text",
    "hoa_contact_person" "text",
    "hoa_contact_email" "text",
    "inspection" "public"."yes_no",
    "sq_footage_lot_aiv" bigint,
    "value_aiv_appraised" numeric,
    "value_arv_estimate" numeric,
    "value_arv_appraised" numeric,
    "warrantability" "public"."warrantability",
    "latitude" numeric,
    "longitude" numeric,
    "hoa_contact" bigint,
    "address_state_long" "public"."us_states_long",
    "bedrooms_aiv" numeric,
    "bedrooms_arv" numeric,
    "bathrooms_aiv" numeric,
    "bathrooms_arv" numeric,
    "sq_footage_gla_arv" bigint,
    "sq_footage_lot_arv" bigint,
    "address_county" "text",
    "hoa_name" "text",
    "occupancy" "public"."property_occupancy",
    "income_monthly_gross_rent" numeric,
    "income_monthly_fair_market_rent" numeric,
    "sale_price" numeric,
    "sale_date" "date",
    "photo_url" "text"
);


ALTER TABLE "public"."property" OWNER TO "postgres";


COMMENT ON COLUMN "public"."property"."sq_footage_gla_aiv" IS 'gross living area as is';



COMMENT ON COLUMN "public"."property"."expense_annual_property_tax" IS 'annual property tax';



COMMENT ON COLUMN "public"."property"."expense_annual_insurance_hoi" IS 'annual insurance premium - homeowner''s';



COMMENT ON COLUMN "public"."property"."expense_annual_insurance_flood" IS 'annual insurance premium - flood';



COMMENT ON COLUMN "public"."property"."expense_annual_management" IS 'annual property management cost';



COMMENT ON COLUMN "public"."property"."expense_annual_association_hoa" IS 'annual homeowner''s association dues';



COMMENT ON COLUMN "public"."property"."value_aiv_estimate" IS 'as is value - estimate';



COMMENT ON COLUMN "public"."property"."sq_footage_lot_aiv" IS 'lot size as is';



COMMENT ON COLUMN "public"."property"."value_aiv_appraised" IS 'as is value - appraised';



COMMENT ON COLUMN "public"."property"."value_arv_estimate" IS 'after repair value - estimate';



COMMENT ON COLUMN "public"."property"."value_arv_appraised" IS 'after repair value - appraised';



COMMENT ON COLUMN "public"."property"."bedrooms_aiv" IS 'number of bedrooms as is';



COMMENT ON COLUMN "public"."property"."bedrooms_arv" IS 'number of bedrooms as repaired';



COMMENT ON COLUMN "public"."property"."bathrooms_aiv" IS 'number of bathrooms as is';



COMMENT ON COLUMN "public"."property"."bathrooms_arv" IS 'number of bathrooms as repaired';



COMMENT ON COLUMN "public"."property"."sq_footage_gla_arv" IS 'gross living area as repaired';



COMMENT ON COLUMN "public"."property"."sq_footage_lot_arv" IS 'lot size as repaired';



COMMENT ON COLUMN "public"."property"."photo_url" IS 'link to property photo';



CREATE TABLE IF NOT EXISTS "public"."property_reapi" (
    "id" bigint NOT NULL,
    "data_property_type" "text",
    "pi_year_built" bigint,
    "pi_gla_sqft_asis" bigint,
    "address_street" "text",
    "address_unit" "text",
    "address_city" "text",
    "address_state" "public"."us_states",
    "address_zip5" "text",
    "pi_units_count_asis" numeric,
    "tax_amount_annual" numeric,
    "pi_hoa_fees_annual" numeric,
    "created_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text"),
    "updated_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text"),
    "address_full" "text",
    "data_value_asis_est" numeric,
    "lot_size_sqft_asis" bigint,
    "value_arv_estimate" numeric,
    "pi_hoa_warrantability" "text",
    "pi_latitude" numeric,
    "pi_longitude" numeric,
    "address_county" "text",
    "pi_hoa_name" "text",
    "data_occupancy_oo_yn" "text",
    "pi_demo_fmr_1br" numeric,
    "pi_demo_fmr_2br" numeric,
    "data_last_sale_price" numeric,
    "property_id" bigint,
    "address_zip4" "text",
    "address_house" "text",
    "address_street_type" "text",
    "address_unit_type" "text",
    "address_predirection" "text",
    "address_jurisdiction" "text",
    "pi_basement_sqft" numeric,
    "pi_basement_sqft_finished" numeric,
    "pi_basement_type" "text",
    "pi_rooms_bathrooms_asis" numeric,
    "pi_rooms_bedrooms_asis" numeric,
    "pi_rooms_bathrooms_partial_asis" numeric,
    "pi_rooms_count_asis" numeric,
    "pi_buildings_count_asis" numeric,
    "pi_construction_method" "text",
    "pi_garage_type" "text",
    "pi_garage_sqft_asis" bigint,
    "data_last_sale_date" "date",
    "data_preforeclosure_yn" "text",
    "data_private_lender_yn" "text",
    "data_occupancy_vacant_yn" "text",
    "data_reapi_last_update" timestamp with time zone,
    "data_property_type_MFH2to4" "text",
    "data_property_type_MFH5plus" "text",
    "data_freeclear_yn" "text",
    "data_owner_mortgage_balance_est" numeric,
    "data_owner_mortgage_payment_est" numeric,
    "data_owner_equity$_est" numeric,
    "data_owner_equity%_est" numeric,
    "data_flood_zone_yn" "text",
    "data_flood_zone_description" "text",
    "data_flood_zone_type" "text",
    "data_owner_mortgage_arm_yn" "text",
    "data_owner_is_entity_yn" "text",
    "data_owner_is_bank_yn" "text",
    "data_owner_mortgage_maturitydate" "date",
    "data_mls_last_sale_date" "date",
    "data_mls_active" "text",
    "data_mls_last_status_date" "date",
    "data_mls_status" "text",
    "data_open_mortgage_balance_est" numeric,
    "data_mls_daysonmarket" bigint,
    "data_mls_cancelled" "text",
    "data_mls_failed" "text",
    "data_mls_failed_date" "date",
    "data_mls_listing_date" "date",
    "data_mls_listing_price" numeric,
    "data_mls_listing_price_sqft" numeric,
    "data_mls_pending" "text",
    "data_mls_sold" "text",
    "data_property_type_mobilehome_yn" "text",
    "data_mls_total_updates" double precision,
    "data_mls_type" "text",
    "reapi_id" bigint NOT NULL,
    "lot_apn" "text",
    "lot_apn_unformatted" "text",
    "lot_census_block" "text",
    "lot_census_block_group" "text",
    "lot_census_tract" "text",
    "lot_landuse" "text",
    "lot_legal_description" "text",
    "lot_legal_section" "text",
    "lot_size_acres_asis" numeric,
    "lot_legal_lot_number" "text",
    "lot_property_use" "text",
    "lot_subdivision" "text",
    "lot_zoning" "text",
    "lot_legal_block_number" "text",
    "tax_year" bigint,
    "data_owner_inherited_yn" "text",
    "data_owner_investorbuyer_yn" "text",
    "data_mls_sold_price" numeric,
    "data_lien_yn" "text",
    "data_taxlien_yn" "text",
    "data_auction_info" "text",
    "pi_demo_fmr_efficiency" numeric,
    "pi_demo_fmr_4br" numeric,
    "pi_demo_fmr_3br" numeric,
    "pi_demo_fmr_year" double precision,
    "data_reapi_loaded_at" timestamp with time zone,
    "pi_demo_suggested_rent" numeric,
    "pi_demo_hud_area_code" "text",
    "pi_demo_hud_area_name" "text",
    "pi_demo_hud_median_income" numeric,
    "api_response" "jsonb",
    CONSTRAINT "property_reapi_address_zip5_check" CHECK (("length"("address_zip5") = 5)),
    CONSTRAINT "property_reapi_pinfo_address_zip4_check" CHECK (("length"("address_zip4") = 4)),
    CONSTRAINT "property_reapi_tax_year_check" CHECK (("tax_year" = 4))
);


ALTER TABLE "public"."property_reapi" OWNER TO "postgres";


COMMENT ON TABLE "public"."property_reapi" IS 'Property search records returned by a RealEstateAPI endpoint';



COMMENT ON COLUMN "public"."property_reapi"."pi_gla_sqft_asis" IS 'sq footage of gross living area as is';



COMMENT ON COLUMN "public"."property_reapi"."tax_amount_annual" IS 'property tax amount annual';



COMMENT ON COLUMN "public"."property_reapi"."pi_hoa_fees_annual" IS 'annual homeowner''s association dues';



COMMENT ON COLUMN "public"."property_reapi"."data_value_asis_est" IS 'as is value - estimate';



COMMENT ON COLUMN "public"."property_reapi"."lot_size_sqft_asis" IS 'lot size (sq ft)';



COMMENT ON COLUMN "public"."property_reapi"."value_arv_estimate" IS 'after repair value - estimate';



COMMENT ON COLUMN "public"."property_reapi"."data_occupancy_oo_yn" IS 'property is owner occupied (true/false)';



COMMENT ON COLUMN "public"."property_reapi"."pi_demo_fmr_1br" IS 'fair market rent 1 bedroom';



COMMENT ON COLUMN "public"."property_reapi"."pi_demo_fmr_2br" IS 'fair market rent 2 bedroom';



COMMENT ON COLUMN "public"."property_reapi"."data_preforeclosure_yn" IS 'property in pre-foreclosure (true/false)';



COMMENT ON COLUMN "public"."property_reapi"."data_private_lender_yn" IS 'lender is private lender (true/false)';



COMMENT ON COLUMN "public"."property_reapi"."data_occupancy_vacant_yn" IS 'property is vacant (true/false)';



COMMENT ON COLUMN "public"."property_reapi"."data_reapi_last_update" IS 'data source last updated by provider (yyyy-mm-dddd hh:mm:ss)';



COMMENT ON COLUMN "public"."property_reapi"."data_property_type_MFH2to4" IS '2-4 unit multifamily (true/false)';



COMMENT ON COLUMN "public"."property_reapi"."data_property_type_MFH5plus" IS '5+ unit multifamily (true/false)';



COMMENT ON COLUMN "public"."property_reapi"."data_freeclear_yn" IS 'property is free and clear (true/false)';



COMMENT ON COLUMN "public"."property_reapi"."data_flood_zone_yn" IS 'property is in a flood zone (true/false)';



COMMENT ON COLUMN "public"."property_reapi"."data_owner_mortgage_arm_yn" IS 'existing mortgage is an adjustable rate mortgage (true/false)';



COMMENT ON COLUMN "public"."property_reapi"."data_owner_is_entity_yn" IS 'property owner is an entity (true/false)';



COMMENT ON COLUMN "public"."property_reapi"."data_owner_is_bank_yn" IS 'property is bank owned (true/false)';



COMMENT ON COLUMN "public"."property_reapi"."data_property_type_mobilehome_yn" IS 'property is a mobile home (true/false)';



COMMENT ON COLUMN "public"."property_reapi"."reapi_id" IS 'unique property id provided by RealEstateAPI';



COMMENT ON COLUMN "public"."property_reapi"."lot_apn" IS 'assessor''s parcel number formatted';



COMMENT ON COLUMN "public"."property_reapi"."lot_apn_unformatted" IS 'assessor''s parcel number unformatted';



COMMENT ON COLUMN "public"."property_reapi"."lot_size_acres_asis" IS 'lot size (acres)';



COMMENT ON COLUMN "public"."property_reapi"."lot_legal_lot_number" IS 'lot number per legal description';



COMMENT ON COLUMN "public"."property_reapi"."lot_legal_block_number" IS 'block number per legal description';



COMMENT ON COLUMN "public"."property_reapi"."tax_year" IS 'property tax year';



COMMENT ON COLUMN "public"."property_reapi"."data_owner_inherited_yn" IS 'owner acquired title by inheritance (true/false)';



COMMENT ON COLUMN "public"."property_reapi"."data_owner_investorbuyer_yn" IS 'owner is a real estate investor (true/false)';



COMMENT ON COLUMN "public"."property_reapi"."data_lien_yn" IS 'lien present (true/false)';



COMMENT ON COLUMN "public"."property_reapi"."data_taxlien_yn" IS 'tax lien present (true/false)';



COMMENT ON COLUMN "public"."property_reapi"."pi_demo_fmr_efficiency" IS 'fair market rent efficiency';



COMMENT ON COLUMN "public"."property_reapi"."pi_demo_fmr_4br" IS 'fair market rent 4 bedroom';



COMMENT ON COLUMN "public"."property_reapi"."pi_demo_fmr_3br" IS 'fair market rent 3 bedroom';



COMMENT ON COLUMN "public"."property_reapi"."pi_demo_fmr_year" IS 'fair market rent - year of demographics data provided by HUD';



COMMENT ON COLUMN "public"."property_reapi"."data_reapi_loaded_at" IS 'timestamp: api response body loaded at';



COMMENT ON COLUMN "public"."property_reapi"."api_response" IS 'json response body';



ALTER TABLE "public"."property_reapi" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."property_data_reapi_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE "public"."property" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."property_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."property_income" (
    "id" bigint NOT NULL,
    "unit" "text",
    "property_id" bigint NOT NULL,
    "lease_length" "public"."lease_length",
    "lease_rent" numeric,
    "market_rent_fmr" numeric,
    "created_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text"),
    "updated_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text"),
    "tenant_occupied" "public"."yes_no",
    "lease_term_begin" "date",
    "lease_term_end" "date",
    "tenant_name" "text",
    "lease_term_status" "public"."property_lease_term_status"
);


ALTER TABLE "public"."property_income" OWNER TO "postgres";


COMMENT ON COLUMN "public"."property_income"."lease_term_begin" IS 'first day of the initial lease term (effective date)';



COMMENT ON COLUMN "public"."property_income"."lease_term_end" IS 'last day of the initial lease term (expiration date)';



ALTER TABLE "public"."property_income" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."property_income_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."select_uw_outcomes" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "label" "text" DEFAULT ''::"text" NOT NULL,
    "description" "text" DEFAULT ''::"text"
);


ALTER TABLE "public"."select_uw_outcomes" OWNER TO "postgres";


COMMENT ON TABLE "public"."select_uw_outcomes" IS 'dropdown values - underwriting decisions';



CREATE TABLE IF NOT EXISTS "public"."task_templates" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "task_name" "text",
    "task_description" "text",
    "task_order" numeric,
    "status" "public"."task_status",
    "date_reached" "date",
    "due_date" "date",
    "date_completed" "date",
    "assigned_to" bigint,
    "types_applied_to" "text",
    "milestone_template_id" bigint,
    "days_until_due" numeric,
    "task_action" "text"
);


ALTER TABLE "public"."task_templates" OWNER TO "postgres";


COMMENT ON COLUMN "public"."task_templates"."types_applied_to" IS 'The deal/loan/property types a task applies to.';



COMMENT ON COLUMN "public"."task_templates"."days_until_due" IS 'The number of days after which a task is due after its parent milestone turns to "In Progress"';



ALTER TABLE "public"."task_templates" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."task_templates_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE SEQUENCE IF NOT EXISTS "public"."transaction_references_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."transaction_references_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."transaction_references_id_seq" OWNED BY "public"."bsi_transactions_references"."id";



ALTER TABLE "public"."auth_clerk_orgs" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."user_clerk_orgs_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE "public"."auth_clerk_orgs_members" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."user_org_memberships_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE "public"."select_uw_outcomes" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."uw_result_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE ONLY "public"."document_files"
    ADD CONSTRAINT "Documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "Tasks_id_key" UNIQUE ("id");



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "Tasks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."appraisal"
    ADD CONSTRAINT "appraisal_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."borrower"
    ADD CONSTRAINT "borrower_profile_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bs_debt_instruments_deals"
    ADD CONSTRAINT "bs_debt_instruments_deals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bsi_deals_orgs"
    ADD CONSTRAINT "bsi_deals_orgs_deal_id_clerk_org_id_key" UNIQUE ("deal_id", "clerk_org_id");



ALTER TABLE ONLY "public"."bsi_deals_orgs"
    ADD CONSTRAINT "bsi_deals_orgs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bsi_deals"
    ADD CONSTRAINT "bsi_deals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bsi_distributions"
    ADD CONSTRAINT "bsi_distributions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bsi_statements"
    ADD CONSTRAINT "bsi_statements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cba_requests"
    ADD CONSTRAINT "cba_submission_credit_id_key" UNIQUE ("id");



ALTER TABLE ONLY "public"."cba_requests"
    ADD CONSTRAINT "cba_submission_credit_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cba_requests_guarantors"
    ADD CONSTRAINT "cba_submissions_guarantors_pkey" PRIMARY KEY ("cba_request_id", "guarantor_id");



ALTER TABLE ONLY "public"."company_contact"
    ADD CONSTRAINT "company_contact_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."company_member"
    ADD CONSTRAINT "company_member_pkey" PRIMARY KEY ("member_id");



ALTER TABLE ONLY "public"."company"
    ADD CONSTRAINT "company_pkey" PRIMARY KEY ("co_id");



ALTER TABLE ONLY "public"."company_roles_defined"
    ADD CONSTRAINT "company_role_name_key" UNIQUE ("co_role");



ALTER TABLE ONLY "public"."company_roles_defined"
    ADD CONSTRAINT "company_role_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."company_roles"
    ADD CONSTRAINT "company_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."constants"
    ADD CONSTRAINT "constants_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."constants"
    ADD CONSTRAINT "constants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contact_types_jt"
    ADD CONSTRAINT "contact_contact_types_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contact"
    ADD CONSTRAINT "contact_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contact_types_jt"
    ADD CONSTRAINT "contact_types_jt_id_key" UNIQUE ("id");



ALTER TABLE ONLY "public"."contact_types"
    ADD CONSTRAINT "contact_types_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."countries"
    ADD CONSTRAINT "countries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."custom_loan_fees"
    ADD CONSTRAINT "custom_loan_fees_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."deal_appraisals"
    ADD CONSTRAINT "deal_appraisals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."deal"
    ADD CONSTRAINT "deal_loan_number_key" UNIQUE ("loan_number");



ALTER TABLE ONLY "public"."deal"
    ADD CONSTRAINT "deal_loan_number_unique" UNIQUE ("loan_number");



ALTER TABLE ONLY "public"."deal"
    ADD CONSTRAINT "deal_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."deal_property"
    ADD CONSTRAINT "deal_property_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."deal_roles"
    ADD CONSTRAINT "deal_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bs_debt_instruments"
    ADD CONSTRAINT "debt_instruments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."document_roles_assigned"
    ADD CONSTRAINT "document_roles_assigned_pkey" PRIMARY KEY ("document_id", "role_id");



ALTER TABLE ONLY "public"."document_roles"
    ADD CONSTRAINT "document_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."document_roles"
    ADD CONSTRAINT "document_roles_role_name_key" UNIQUE ("role_name");



ALTER TABLE ONLY "public"."fee"
    ADD CONSTRAINT "fee_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."guarantor"
    ADD CONSTRAINT "guarantor_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."loan_application"
    ADD CONSTRAINT "loan_application_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."milestone_templates"
    ADD CONSTRAINT "milestone_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."milestones"
    ADD CONSTRAINT "milestones_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payroll_submission_fees_1099"
    ADD CONSTRAINT "payroll_submission_fees_1099_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payroll_submission"
    ADD CONSTRAINT "payroll_submission_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."auth_clerk_users"
    ADD CONSTRAINT "profile_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."auth_clerk_users"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("clerk_username");



ALTER TABLE ONLY "public"."property_reapi"
    ADD CONSTRAINT "property_data_reapi_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."property_income"
    ADD CONSTRAINT "property_income_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."property"
    ADD CONSTRAINT "property_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."property_reapi"
    ADD CONSTRAINT "property_reapi_id_key" UNIQUE ("id");



ALTER TABLE ONLY "public"."task_templates"
    ADD CONSTRAINT "task_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."company_contact"
    ADD CONSTRAINT "unique_company_contact" UNIQUE ("co_id", "contact_id", "deal_id");



ALTER TABLE ONLY "public"."company_roles"
    ADD CONSTRAINT "unique_company_role_deal" UNIQUE ("co_id", "role_id", "deal_id");



ALTER TABLE ONLY "public"."deal_appraisals"
    ADD CONSTRAINT "unique_deal_appraisal" UNIQUE ("deal_id", "appraisal_id");



ALTER TABLE ONLY "public"."auth_clerk_orgs"
    ADD CONSTRAINT "user_clerk_orgs_clerk_organization_id_key" UNIQUE ("clerk_org_id");



ALTER TABLE ONLY "public"."auth_clerk_orgs"
    ADD CONSTRAINT "user_clerk_orgs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."auth_clerk_orgs"
    ADD CONSTRAINT "user_clerk_orgs_slug_key" UNIQUE ("clerk_org_slug");



ALTER TABLE ONLY "public"."auth_clerk_orgs_members"
    ADD CONSTRAINT "user_org_memberships_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."auth_clerk_users"
    ADD CONSTRAINT "user_profile_clerk_id_key" UNIQUE ("clerk_user_id");



ALTER TABLE ONLY "public"."select_uw_outcomes"
    ADD CONSTRAINT "uw_result_id_key" UNIQUE ("id");



ALTER TABLE ONLY "public"."select_uw_outcomes"
    ADD CONSTRAINT "uw_result_pkey" PRIMARY KEY ("id");



CREATE UNIQUE INDEX "auth_clerk_users_clerk_user_id_key" ON "public"."auth_clerk_users" USING "btree" ("clerk_user_id");



CREATE UNIQUE INDEX "auth_clerk_users_clerk_username_key" ON "public"."auth_clerk_users" USING "btree" ("clerk_username");



CREATE UNIQUE INDEX "bsi_distribution_payments_pkey" ON "public"."bsi_transactions" USING "btree" ("id");



CREATE UNIQUE INDEX "document_files_pkey" ON "public"."document_files" USING "btree" ("id");



CREATE INDEX "idx_auth_clerk_orgs_members_clerk_org_id" ON "public"."auth_clerk_orgs_members" USING "btree" ("clerk_org_id");



CREATE INDEX "idx_auth_clerk_users_clerk_user_id" ON "public"."auth_clerk_users" USING "btree" ("clerk_user_id");



CREATE INDEX "idx_auth_clerk_users_role" ON "public"."auth_clerk_users" USING "btree" ("role");



CREATE INDEX "idx_bsi_deals_auth_clerk_users_id" ON "public"."bsi_deals" USING "btree" ("auth_clerk_users_id");



CREATE INDEX "idx_bsi_deals_deal_auth_user" ON "public"."bsi_deals" USING "btree" ("deal_id", "auth_clerk_users_id");



CREATE INDEX "idx_bsi_deals_orgs_clerk_org_id" ON "public"."bsi_deals_orgs" USING "btree" ("clerk_org_id");



CREATE INDEX "idx_bsi_deals_orgs_deal_id" ON "public"."bsi_deals_orgs" USING "btree" ("deal_id");



CREATE INDEX "idx_bsi_statements_auth_clerk_users_id" ON "public"."bsi_statements" USING "btree" ("auth_clerk_users_id");



CREATE INDEX "idx_deal_loan_number" ON "public"."deal" USING "btree" ("loan_number");



CREATE INDEX "idx_deals_orgs_clerk_org_id" ON "public"."bsi_deals_orgs" USING "btree" ("clerk_org_id");



CREATE INDEX "idx_deals_orgs_deal_id" ON "public"."bsi_deals_orgs" USING "btree" ("deal_id");



CREATE INDEX "idx_debt_instruments_deals_deal_id" ON "public"."bs_debt_instruments_deals" USING "btree" ("deal_id");



CREATE INDEX "idx_distributions_clerk_org_id" ON "public"."bsi_distributions" USING "btree" ("clerk_org_id");



CREATE INDEX "idx_members_clerk_org_id" ON "public"."auth_clerk_orgs_members" USING "btree" ("clerk_org_id");



CREATE INDEX "idx_members_user_id" ON "public"."auth_clerk_orgs_members" USING "btree" ("auth_clerk_users_id");



CREATE INDEX "idx_statements_clerk_org_id" ON "public"."bsi_statements" USING "btree" ("clerk_org_id");



CREATE INDEX "idx_transactions_clerk_org_id" ON "public"."bsi_transactions" USING "btree" ("clerk_org_id");



CREATE INDEX "idx_user_profile_clerk_id" ON "public"."auth_clerk_users" USING "btree" ("clerk_user_id");



CREATE INDEX "idx_user_profile_email" ON "public"."auth_clerk_users" USING "btree" ("email");



CREATE INDEX "idx_user_profile_is_active_yn" ON "public"."auth_clerk_users" USING "btree" ("is_active_yn");



CREATE INDEX "idx_user_profile_is_banned" ON "public"."auth_clerk_users" USING "btree" ("is_banned");



CREATE INDEX "idx_user_profile_is_internal_yn" ON "public"."auth_clerk_users" USING "btree" ("is_internal_yn");



CREATE INDEX "idx_user_profile_is_locked" ON "public"."auth_clerk_users" USING "btree" ("is_locked");



CREATE INDEX "idx_user_profile_last_active_at" ON "public"."auth_clerk_users" USING "btree" ("last_active_at");



CREATE INDEX "idx_user_profile_last_sign_in_at" ON "public"."auth_clerk_users" USING "btree" ("last_sign_in_at");



CREATE INDEX "idx_user_profile_legal_accepted_at" ON "public"."auth_clerk_users" USING "btree" ("legal_accepted_at");



CREATE INDEX "idx_user_profile_role" ON "public"."auth_clerk_users" USING "btree" ("role");



CREATE OR REPLACE TRIGGER "handle_borrower_profile_changes_trigger" AFTER UPDATE OF "citizenship", "first_time_home_buyer", "mortgage_debt", "fico_score_mid_actual" ON "public"."borrower" FOR EACH ROW EXECUTE FUNCTION "public"."handle_user_profile_changes"();



CREATE OR REPLACE TRIGGER "handle_deal_changes_trigger" BEFORE INSERT OR UPDATE ON "public"."deal" FOR EACH ROW EXECUTE FUNCTION "public"."handle_deal_changes"();



CREATE OR REPLACE TRIGGER "handle_property_changes_trigger" AFTER UPDATE ON "public"."property" FOR EACH ROW EXECUTE FUNCTION "public"."handle_property_changes"();



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."auth_clerk_users" FOR EACH ROW EXECUTE FUNCTION "extensions"."moddatetime"('updated_at');



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."borrower" FOR EACH ROW EXECUTE FUNCTION "extensions"."moddatetime"('updated_at');



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."company" FOR EACH ROW EXECUTE FUNCTION "extensions"."moddatetime"('updated_at');



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."company_member" FOR EACH ROW EXECUTE FUNCTION "extensions"."moddatetime"('member_updated_at');

ALTER TABLE "public"."company_member" DISABLE TRIGGER "handle_updated_at";



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."contact" FOR EACH ROW EXECUTE FUNCTION "extensions"."moddatetime"('updated_at');



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."deal" FOR EACH ROW EXECUTE FUNCTION "extensions"."moddatetime"('updated_at');



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."property" FOR EACH ROW EXECUTE FUNCTION "extensions"."moddatetime"('updated_at');



ALTER TABLE ONLY "public"."appraisal"
    ADD CONSTRAINT "appraisal_appraiser_id_fkey" FOREIGN KEY ("appraiser_id") REFERENCES "public"."contact"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."appraisal"
    ADD CONSTRAINT "appraisal_co_amc_fkey" FOREIGN KEY ("co_amc") REFERENCES "public"."company"("co_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."appraisal"
    ADD CONSTRAINT "appraisal_co_appraisal_fkey" FOREIGN KEY ("co_appraisal") REFERENCES "public"."company"("co_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."appraisal"
    ADD CONSTRAINT "appraisal_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "public"."deal"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."appraisal"
    ADD CONSTRAINT "appraisal_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."document_files"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."appraisal"
    ADD CONSTRAINT "appraisal_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "public"."property"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."auth_clerk_orgs_members"
    ADD CONSTRAINT "auth_clerk_orgs_members_auth_clerk_users_id_fkey" FOREIGN KEY ("auth_clerk_users_id") REFERENCES "public"."auth_clerk_users"("id");



ALTER TABLE ONLY "public"."auth_clerk_orgs_members"
    ADD CONSTRAINT "auth_clerk_orgs_members_clerk_org_fkey_fkey" FOREIGN KEY ("clerk_org_id") REFERENCES "public"."auth_clerk_orgs"("id");



ALTER TABLE ONLY "public"."bs_debt_instruments"
    ADD CONSTRAINT "bs_debt_instruments_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "public"."deal"("id");



ALTER TABLE ONLY "public"."bs_debt_instruments_deals"
    ADD CONSTRAINT "bs_debt_instruments_deals_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "public"."deal"("id");



ALTER TABLE ONLY "public"."bs_debt_instruments_deals"
    ADD CONSTRAINT "bs_debt_instruments_deals_instrument_id_fkey" FOREIGN KEY ("instrument_id") REFERENCES "public"."bs_debt_instruments"("id");



ALTER TABLE ONLY "public"."bsi_deals"
    ADD CONSTRAINT "bsi_deals_auth_clerk_users_id_fkey" FOREIGN KEY ("auth_clerk_users_id") REFERENCES "public"."auth_clerk_users"("id");



ALTER TABLE ONLY "public"."bsi_deals"
    ADD CONSTRAINT "bsi_deals_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "public"."deal"("id");



ALTER TABLE ONLY "public"."bsi_deals_orgs"
    ADD CONSTRAINT "bsi_deals_orgs_clerk_org_id_fkey" FOREIGN KEY ("clerk_org_id") REFERENCES "public"."auth_clerk_orgs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bsi_deals_orgs"
    ADD CONSTRAINT "bsi_deals_orgs_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "public"."bsi_deals"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bsi_distributions"
    ADD CONSTRAINT "bsi_distributions_bsi_contact_id_fkey" FOREIGN KEY ("bsi_contact_id") REFERENCES "public"."contact"("id");



ALTER TABLE ONLY "public"."bsi_distributions"
    ADD CONSTRAINT "bsi_distributions_clerk_org_id_fkey" FOREIGN KEY ("clerk_org_id") REFERENCES "public"."auth_clerk_orgs"("id");



ALTER TABLE ONLY "public"."bsi_distributions"
    ADD CONSTRAINT "bsi_distributions_clerk_org_member_id_fkey" FOREIGN KEY ("clerk_org_member_id") REFERENCES "public"."auth_clerk_orgs_members"("id");



ALTER TABLE ONLY "public"."bsi_distributions"
    ADD CONSTRAINT "bsi_distributions_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "public"."deal"("id");



ALTER TABLE ONLY "public"."bsi_distributions"
    ADD CONSTRAINT "bsi_distributions_instrument_id_fkey" FOREIGN KEY ("instrument_id") REFERENCES "public"."bs_debt_instruments"("id");



ALTER TABLE ONLY "public"."bsi_distributions"
    ADD CONSTRAINT "bsi_distributions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."auth_clerk_users"("id");



ALTER TABLE ONLY "public"."bsi_statements"
    ADD CONSTRAINT "bsi_statements_auth_clerk_users_id_fkey" FOREIGN KEY ("auth_clerk_users_id") REFERENCES "public"."auth_clerk_users"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."bsi_statements"
    ADD CONSTRAINT "bsi_statements_clerk_org_id_fkey" FOREIGN KEY ("clerk_org_id") REFERENCES "public"."auth_clerk_orgs"("id");



ALTER TABLE ONLY "public"."bsi_transactions"
    ADD CONSTRAINT "bsi_transactions_clerk_org_id_fkey" FOREIGN KEY ("clerk_org_id") REFERENCES "public"."auth_clerk_orgs"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."cba_requests"
    ADD CONSTRAINT "cba_submission_credit_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "public"."deal"("id");



ALTER TABLE ONLY "public"."cba_requests"
    ADD CONSTRAINT "cba_submission_credit_submitted_by_fkey" FOREIGN KEY ("submitted_by") REFERENCES "public"."auth_clerk_users"("id");



ALTER TABLE ONLY "public"."cba_requests"
    ADD CONSTRAINT "cba_submission_credit_uw_prequal_result_background_fkey" FOREIGN KEY ("uw_prequal_result_background") REFERENCES "public"."select_uw_outcomes"("id");



ALTER TABLE ONLY "public"."cba_requests"
    ADD CONSTRAINT "cba_submission_credit_uw_prequal_result_credit_fkey" FOREIGN KEY ("uw_prequal_result_credit") REFERENCES "public"."select_uw_outcomes"("id");



ALTER TABLE ONLY "public"."company_contact"
    ADD CONSTRAINT "company_contact_co_id_fkey" FOREIGN KEY ("co_id") REFERENCES "public"."company"("co_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."company_contact"
    ADD CONSTRAINT "company_contact_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."contact"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."company_contact"
    ADD CONSTRAINT "company_contact_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "public"."deal"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."company_member"
    ADD CONSTRAINT "company_member_member_borrower_id_fkey" FOREIGN KEY ("member_borrower_id") REFERENCES "public"."borrower"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."company_member"
    ADD CONSTRAINT "company_member_member_company_id_fkey" FOREIGN KEY ("member_company_id") REFERENCES "public"."company"("co_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."company_member"
    ADD CONSTRAINT "company_member_member_owning_company_id_fkey" FOREIGN KEY ("member_owning_company_id") REFERENCES "public"."company"("co_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."company"
    ADD CONSTRAINT "company_primary_guarantor_id_fkey" FOREIGN KEY ("primary_guarantor_id") REFERENCES "public"."company_member"("member_id") ON UPDATE CASCADE;



ALTER TABLE ONLY "public"."company_roles_defined"
    ADD CONSTRAINT "company_role_mm_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "public"."deal"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."company_roles"
    ADD CONSTRAINT "company_roles_co_id_fkey" FOREIGN KEY ("co_id") REFERENCES "public"."company"("co_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."company_roles"
    ADD CONSTRAINT "company_roles_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "public"."deal"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."company_roles"
    ADD CONSTRAINT "company_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."company_roles_defined"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."contact"
    ADD CONSTRAINT "contact_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."company"("co_id");



ALTER TABLE ONLY "public"."contact"
    ADD CONSTRAINT "contact_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."auth_clerk_users"("id");



ALTER TABLE ONLY "public"."deal"
    ADD CONSTRAINT "deal_appraisal_poc_contact_id_fkey" FOREIGN KEY ("appraisal_poc_contact_id") REFERENCES "public"."contact"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."deal_appraisals"
    ADD CONSTRAINT "deal_appraisals_appraisal_id_fkey" FOREIGN KEY ("appraisal_id") REFERENCES "public"."appraisal"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."deal_appraisals"
    ADD CONSTRAINT "deal_appraisals_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "public"."deal"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."deal_appraisals"
    ADD CONSTRAINT "deal_appraisals_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "public"."property"("id");



ALTER TABLE ONLY "public"."deal"
    ADD CONSTRAINT "deal_broker_company_id_fkey" FOREIGN KEY ("broker_company_id") REFERENCES "public"."company"("co_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."deal"
    ADD CONSTRAINT "deal_closing_agent_contact_id_fkey" FOREIGN KEY ("closing_agent_contact_id") REFERENCES "public"."contact"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."deal"
    ADD CONSTRAINT "deal_escrow_company_id_fkey" FOREIGN KEY ("escrow_company_id") REFERENCES "public"."company"("co_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."deal"
    ADD CONSTRAINT "deal_escrow_contact_id_fkey" FOREIGN KEY ("escrow_contact_id") REFERENCES "public"."contact"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."deal"
    ADD CONSTRAINT "deal_fourth_guarantor_id_fkey" FOREIGN KEY ("fourth_guarantor_id") REFERENCES "public"."guarantor"("id");



ALTER TABLE ONLY "public"."deal"
    ADD CONSTRAINT "deal_insurance_carrier_company_id_fkey" FOREIGN KEY ("insurance_carrier_company_id") REFERENCES "public"."company"("co_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."deal"
    ADD CONSTRAINT "deal_insurance_carrier_contact_id_fkey" FOREIGN KEY ("insurance_carrier_contact_id") REFERENCES "public"."contact"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."deal"
    ADD CONSTRAINT "deal_loan_buyer_company_id_fkey" FOREIGN KEY ("loan_buyer_company_id") REFERENCES "public"."company"("co_id");



ALTER TABLE ONLY "public"."deal"
    ADD CONSTRAINT "deal_loan_buyer_contact_id_fkey" FOREIGN KEY ("loan_buyer_contact_id") REFERENCES "public"."contact"("id");



ALTER TABLE ONLY "public"."deal"
    ADD CONSTRAINT "deal_loan_opener_id_fkey" FOREIGN KEY ("loan_opener_id") REFERENCES "public"."auth_clerk_users"("id");



ALTER TABLE ONLY "public"."deal"
    ADD CONSTRAINT "deal_loan_processor_id_fkey" FOREIGN KEY ("loan_processor_id") REFERENCES "public"."auth_clerk_users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."deal"
    ADD CONSTRAINT "deal_primary_guarantor_id_fkey" FOREIGN KEY ("primary_guarantor_id") REFERENCES "public"."guarantor"("id");



ALTER TABLE ONLY "public"."deal"
    ADD CONSTRAINT "deal_second_guarantor_id_fkey" FOREIGN KEY ("second_guarantor_id") REFERENCES "public"."guarantor"("id");



ALTER TABLE ONLY "public"."deal"
    ADD CONSTRAINT "deal_third_guarantor_id_fkey" FOREIGN KEY ("third_guarantor_id") REFERENCES "public"."guarantor"("id");



ALTER TABLE ONLY "public"."deal"
    ADD CONSTRAINT "deal_title_company_id_fkey" FOREIGN KEY ("title_company_id") REFERENCES "public"."company"("co_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."document_files"
    ADD CONSTRAINT "documents_borrower_id_fkey" FOREIGN KEY ("borrower_id") REFERENCES "public"."borrower"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."document_files"
    ADD CONSTRAINT "documents_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "public"."deal"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."document_files"
    ADD CONSTRAINT "documents_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "public"."company"("co_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."document_files"
    ADD CONSTRAINT "documents_guarantor_id_fkey" FOREIGN KEY ("guarantor_id") REFERENCES "public"."guarantor"("id");



ALTER TABLE ONLY "public"."document_files"
    ADD CONSTRAINT "documents_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "public"."property"("id");



ALTER TABLE ONLY "public"."document_roles_assigned"
    ADD CONSTRAINT "fk_document" FOREIGN KEY ("document_id") REFERENCES "public"."document_files"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."document_roles_assigned"
    ADD CONSTRAINT "fk_role" FOREIGN KEY ("role_id") REFERENCES "public"."document_roles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."guarantor"
    ADD CONSTRAINT "guarantor_borrower_id_fkey" FOREIGN KEY ("borrower_id") REFERENCES "public"."borrower"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."guarantor"
    ADD CONSTRAINT "guarantor_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "public"."deal"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."loan_application"
    ADD CONSTRAINT "loan_application_application_deal_id_fkey" FOREIGN KEY ("application_deal_id") REFERENCES "public"."deal"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."milestones"
    ADD CONSTRAINT "milestones_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "public"."deal"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."milestones"
    ADD CONSTRAINT "milestones_milestone_template_id_fkey" FOREIGN KEY ("milestone_template_id") REFERENCES "public"."milestone_templates"("id");



ALTER TABLE ONLY "public"."payroll_submission"
    ADD CONSTRAINT "payroll_submission_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "public"."deal"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."payroll_submission_fees_1099"
    ADD CONSTRAINT "payroll_submission_fees_1099_broker_id_fkey" FOREIGN KEY ("broker_id") REFERENCES "public"."contact"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."payroll_submission_fees_1099"
    ADD CONSTRAINT "payroll_submission_fees_1099_payroll_submission_id_fkey" FOREIGN KEY ("payroll_submission_id") REFERENCES "public"."payroll_submission"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."property"
    ADD CONSTRAINT "property_hoa_contact_fkey" FOREIGN KEY ("hoa_contact") REFERENCES "public"."contact"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."property_income"
    ADD CONSTRAINT "property_income_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "public"."property"("id");



ALTER TABLE ONLY "public"."property_reapi"
    ADD CONSTRAINT "property_reapi_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "public"."property"("id");



ALTER TABLE ONLY "public"."contact_types_jt"
    ADD CONSTRAINT "public_contact_contact_types_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."contact"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."contact_types_jt"
    ADD CONSTRAINT "public_contact_contact_types_contact_types_id_fkey" FOREIGN KEY ("contact_types_id") REFERENCES "public"."contact_types"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."custom_loan_fees"
    ADD CONSTRAINT "public_custom_loan_fees_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "public"."deal"("id");



ALTER TABLE ONLY "public"."deal"
    ADD CONSTRAINT "public_deal_account_executive_id_fkey" FOREIGN KEY ("account_executive_id") REFERENCES "public"."auth_clerk_users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."deal"
    ADD CONSTRAINT "public_deal_broker_id_fkey" FOREIGN KEY ("broker_id") REFERENCES "public"."contact"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."deal"
    ADD CONSTRAINT "public_deal_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."company"("co_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."deal_property"
    ADD CONSTRAINT "public_deal_property_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "public"."deal"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."deal"
    ADD CONSTRAINT "public_deal_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "public"."property"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."deal_property"
    ADD CONSTRAINT "public_deal_property_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "public"."property"("id");



ALTER TABLE ONLY "public"."deal_roles"
    ADD CONSTRAINT "public_deal_roles_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."contact"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."deal_roles"
    ADD CONSTRAINT "public_deal_roles_contact_types_id_fkey" FOREIGN KEY ("contact_types_id") REFERENCES "public"."contact_types"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."deal_roles"
    ADD CONSTRAINT "public_deal_roles_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "public"."deal"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."deal"
    ADD CONSTRAINT "public_deal_title_company_contact_id_fkey" FOREIGN KEY ("title_company_contact_id") REFERENCES "public"."contact"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."task_templates"
    ADD CONSTRAINT "task_templates_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "public"."auth_clerk_users"("id");



ALTER TABLE ONLY "public"."task_templates"
    ADD CONSTRAINT "task_templates_milestone_template_id_fkey" FOREIGN KEY ("milestone_template_id") REFERENCES "public"."milestone_templates"("id");



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "public"."auth_clerk_users"("id");



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "public"."deal"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_milestone_id_fkey" FOREIGN KEY ("milestone_id") REFERENCES "public"."milestones"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."auth_clerk_orgs"
    ADD CONSTRAINT "user_clerk_orgs_created_by_clerk_user_id_fkey" FOREIGN KEY ("created_by_clerk_user_id") REFERENCES "public"."auth_clerk_users"("clerk_user_id");



ALTER TABLE ONLY "public"."auth_clerk_users"
    ADD CONSTRAINT "user_profile_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."contact"("id");



CREATE POLICY "Admin and assigned users can manage tasks" ON "public"."tasks" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_users" "acu"
  WHERE (("acu"."clerk_user_id" = ("auth"."uid"())::"text") AND (("acu"."role" = 'admin'::"public"."user_role_internal") OR ("acu"."id" = "tasks"."assigned_to"))))));



CREATE POLICY "Admin can access all appraisals" ON "public"."appraisal" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_users" "acu"
  WHERE (("acu"."clerk_user_id" = ("auth"."uid"())::"text") AND ("acu"."role" = 'admin'::"public"."user_role_internal")))));



CREATE POLICY "Admin can delete deals" ON "public"."deal" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_users" "acu"
  WHERE (("acu"."clerk_user_id" = ("auth"."uid"())::"text") AND ("acu"."role" = 'admin'::"public"."user_role_internal")))));



CREATE POLICY "Admin can delete documents" ON "public"."document_files" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_users" "acu"
  WHERE (("acu"."clerk_user_id" = ("auth"."uid"())::"text") AND ("acu"."role" = 'admin'::"public"."user_role_internal")))));



CREATE POLICY "Admin can insert deals" ON "public"."deal" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_users" "acu"
  WHERE (("acu"."clerk_user_id" = ("auth"."uid"())::"text") AND ("acu"."role" = 'admin'::"public"."user_role_internal")))));



CREATE POLICY "Admin can insert documents" ON "public"."document_files" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_users" "acu"
  WHERE (("acu"."clerk_user_id" = ("auth"."uid"())::"text") AND ("acu"."role" = 'admin'::"public"."user_role_internal")))));



CREATE POLICY "Admin can manage CBA request guarantors" ON "public"."cba_requests_guarantors" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_users" "acu"
  WHERE (("acu"."clerk_user_id" = ("auth"."uid"())::"text") AND ("acu"."role" = 'admin'::"public"."user_role_internal")))));



CREATE POLICY "Admin can manage CBA requests" ON "public"."cba_requests" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_users" "acu"
  WHERE (("acu"."clerk_user_id" = ("auth"."uid"())::"text") AND ("acu"."role" = 'admin'::"public"."user_role_internal")))));



CREATE POLICY "Admin can manage UW outcomes" ON "public"."select_uw_outcomes" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_users" "acu"
  WHERE (("acu"."clerk_user_id" = ("auth"."uid"())::"text") AND ("acu"."role" = 'admin'::"public"."user_role_internal")))));



CREATE POLICY "Admin can manage company contacts" ON "public"."company_contact" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_users" "acu"
  WHERE (("acu"."clerk_user_id" = ("auth"."uid"())::"text") AND ("acu"."role" = 'admin'::"public"."user_role_internal")))));



CREATE POLICY "Admin can manage company members" ON "public"."company_member" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_users" "acu"
  WHERE (("acu"."clerk_user_id" = ("auth"."uid"())::"text") AND ("acu"."role" = 'admin'::"public"."user_role_internal")))));



CREATE POLICY "Admin can manage company role definitions" ON "public"."company_roles_defined" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_users" "acu"
  WHERE (("acu"."clerk_user_id" = ("auth"."uid"())::"text") AND ("acu"."role" = 'admin'::"public"."user_role_internal")))));



CREATE POLICY "Admin can manage company roles" ON "public"."company_roles" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_users" "acu"
  WHERE (("acu"."clerk_user_id" = ("auth"."uid"())::"text") AND ("acu"."role" = 'admin'::"public"."user_role_internal")))));



CREATE POLICY "Admin can manage constants" ON "public"."constants" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_users" "acu"
  WHERE (("acu"."clerk_user_id" = ("auth"."uid"())::"text") AND ("acu"."role" = 'admin'::"public"."user_role_internal")))));



CREATE POLICY "Admin can manage contact type junctions" ON "public"."contact_types_jt" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_users" "acu"
  WHERE (("acu"."clerk_user_id" = ("auth"."uid"())::"text") AND ("acu"."role" = 'admin'::"public"."user_role_internal")))));



CREATE POLICY "Admin can manage contact types" ON "public"."contact_types" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_users" "acu"
  WHERE (("acu"."clerk_user_id" = ("auth"."uid"())::"text") AND ("acu"."role" = 'admin'::"public"."user_role_internal")))));



CREATE POLICY "Admin can manage custom loan fees" ON "public"."custom_loan_fees" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_users" "acu"
  WHERE (("acu"."clerk_user_id" = ("auth"."uid"())::"text") AND ("acu"."role" = 'admin'::"public"."user_role_internal")))));



CREATE POLICY "Admin can manage deal appraisals" ON "public"."deal_appraisals" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_users" "acu"
  WHERE (("acu"."clerk_user_id" = ("auth"."uid"())::"text") AND ("acu"."role" = 'admin'::"public"."user_role_internal")))));



CREATE POLICY "Admin can manage deal properties" ON "public"."deal_property" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_users" "acu"
  WHERE (("acu"."clerk_user_id" = ("auth"."uid"())::"text") AND ("acu"."role" = 'admin'::"public"."user_role_internal")))));



CREATE POLICY "Admin can manage deal roles" ON "public"."deal_roles" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_users" "acu"
  WHERE (("acu"."clerk_user_id" = ("auth"."uid"())::"text") AND ("acu"."role" = 'admin'::"public"."user_role_internal")))));



CREATE POLICY "Admin can manage document role assignments" ON "public"."document_roles_assigned" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_users" "acu"
  WHERE (("acu"."clerk_user_id" = ("auth"."uid"())::"text") AND ("acu"."role" = 'admin'::"public"."user_role_internal")))));



CREATE POLICY "Admin can manage document roles" ON "public"."document_roles" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_users" "acu"
  WHERE (("acu"."clerk_user_id" = ("auth"."uid"())::"text") AND ("acu"."role" = 'admin'::"public"."user_role_internal")))));



CREATE POLICY "Admin can manage fees" ON "public"."fee" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_users" "acu"
  WHERE (("acu"."clerk_user_id" = ("auth"."uid"())::"text") AND ("acu"."role" = 'admin'::"public"."user_role_internal")))));



CREATE POLICY "Admin can manage milestone templates" ON "public"."milestone_templates" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_users" "acu"
  WHERE (("acu"."clerk_user_id" = ("auth"."uid"())::"text") AND ("acu"."role" = 'admin'::"public"."user_role_internal")))));



CREATE POLICY "Admin can manage milestones" ON "public"."milestones" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_users" "acu"
  WHERE (("acu"."clerk_user_id" = ("auth"."uid"())::"text") AND ("acu"."role" = 'admin'::"public"."user_role_internal")))));



CREATE POLICY "Admin can manage payroll fees" ON "public"."payroll_submission_fees_1099" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_users" "acu"
  WHERE (("acu"."clerk_user_id" = ("auth"."uid"())::"text") AND ("acu"."role" = 'admin'::"public"."user_role_internal")))));



CREATE POLICY "Admin can manage payroll submissions" ON "public"."payroll_submission" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_users" "acu"
  WHERE (("acu"."clerk_user_id" = ("auth"."uid"())::"text") AND ("acu"."role" = 'admin'::"public"."user_role_internal")))));



CREATE POLICY "Admin can manage property income" ON "public"."property_income" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_users" "acu"
  WHERE (("acu"."clerk_user_id" = ("auth"."uid"())::"text") AND ("acu"."role" = 'admin'::"public"."user_role_internal")))));



CREATE POLICY "Admin can manage task templates" ON "public"."task_templates" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_users" "acu"
  WHERE (("acu"."clerk_user_id" = ("auth"."uid"())::"text") AND ("acu"."role" = 'admin'::"public"."user_role_internal")))));



CREATE POLICY "Admin can manage transaction references" ON "public"."bsi_transactions_references" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_users" "acu"
  WHERE (("acu"."clerk_user_id" = ("auth"."uid"())::"text") AND ("acu"."role" = 'admin'::"public"."user_role_internal")))));



CREATE POLICY "Admin can read task templates" ON "public"."task_templates" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_users" "acu"
  WHERE (("acu"."clerk_user_id" = ("auth"."uid"())::"text") AND ("acu"."role" = 'admin'::"public"."user_role_internal")))));



CREATE POLICY "Admin can select all bsi_deals" ON "public"."bsi_deals" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_users" "acu"
  WHERE (("acu"."clerk_user_id" = ("auth"."uid"())::"text") AND ("acu"."role" = 'admin'::"public"."user_role_internal")))));



CREATE POLICY "Admin can select all contacts" ON "public"."contact" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_users" "acu"
  WHERE (("acu"."clerk_user_id" = ("auth"."uid"())::"text") AND ("acu"."role" = 'admin'::"public"."user_role_internal")))));



CREATE POLICY "Admin can select all deals" ON "public"."deal" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_users" "acu"
  WHERE (("acu"."clerk_user_id" = ("auth"."uid"())::"text") AND ("acu"."role" = 'admin'::"public"."user_role_internal")))));



CREATE POLICY "Admin can select all distributions" ON "public"."bsi_distributions" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_users" "acu"
  WHERE (("acu"."clerk_user_id" = ("auth"."uid"())::"text") AND ("acu"."role" = 'admin'::"public"."user_role_internal")))));



CREATE POLICY "Admin can select all documents" ON "public"."document_files" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_users" "acu"
  WHERE (("acu"."clerk_user_id" = ("auth"."uid"())::"text") AND ("acu"."role" = 'admin'::"public"."user_role_internal")))));



CREATE POLICY "Admin can select all statements" ON "public"."bsi_statements" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_users" "acu"
  WHERE (("acu"."clerk_user_id" = ("auth"."uid"())::"text") AND ("acu"."role" = 'admin'::"public"."user_role_internal")))));



CREATE POLICY "Admin can update deals" ON "public"."deal" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_users" "acu"
  WHERE (("acu"."clerk_user_id" = ("auth"."uid"())::"text") AND ("acu"."role" = 'admin'::"public"."user_role_internal"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_users" "acu"
  WHERE (("acu"."clerk_user_id" = ("auth"."uid"())::"text") AND ("acu"."role" = 'admin'::"public"."user_role_internal")))));



CREATE POLICY "Admin can update documents" ON "public"."document_files" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_users" "acu"
  WHERE (("acu"."clerk_user_id" = ("auth"."uid"())::"text") AND ("acu"."role" = 'admin'::"public"."user_role_internal"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_users" "acu"
  WHERE (("acu"."clerk_user_id" = ("auth"."uid"())::"text") AND ("acu"."role" = 'admin'::"public"."user_role_internal")))));



CREATE POLICY "Admins can delete distributions" ON "public"."bsi_distributions" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_users" "p"
  WHERE (("p"."clerk_user_id" = ("auth"."uid"())::"text") AND ("p"."role" = 'admin'::"public"."user_role_internal")))));



CREATE POLICY "Admins can delete instrument-deal links" ON "public"."bs_debt_instruments_deals" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_users" "p"
  WHERE (("p"."clerk_user_id" = ("auth"."uid"())::"text") AND ("p"."role" = 'admin'::"public"."user_role_internal")))));



CREATE POLICY "Admins can delete instruments" ON "public"."bs_debt_instruments" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_users" "p"
  WHERE (("p"."clerk_user_id" = ("auth"."uid"())::"text") AND ("p"."role" = 'admin'::"public"."user_role_internal")))));



CREATE POLICY "Admins can delete statements" ON "public"."bsi_statements" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_users" "p"
  WHERE (("p"."clerk_user_id" = ("auth"."uid"())::"text") AND ("p"."role" = 'admin'::"public"."user_role_internal")))));



CREATE POLICY "Admins can delete transactions" ON "public"."bsi_transactions" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_users" "p"
  WHERE (("p"."clerk_user_id" = ("auth"."uid"())::"text") AND ("p"."role" = 'admin'::"public"."user_role_internal")))));



CREATE POLICY "Admins can insert distributions" ON "public"."bsi_distributions" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_users" "p"
  WHERE (("p"."clerk_user_id" = ("auth"."uid"())::"text") AND ("p"."role" = 'admin'::"public"."user_role_internal")))));



CREATE POLICY "Admins can insert instrument-deal links" ON "public"."bs_debt_instruments_deals" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_users" "p"
  WHERE (("p"."clerk_user_id" = ("auth"."uid"())::"text") AND ("p"."role" = 'admin'::"public"."user_role_internal")))));



CREATE POLICY "Admins can insert instruments" ON "public"."bs_debt_instruments" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_users" "p"
  WHERE (("p"."clerk_user_id" = ("auth"."uid"())::"text") AND ("p"."role" = 'admin'::"public"."user_role_internal")))));



CREATE POLICY "Admins can insert statements" ON "public"."bsi_statements" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_users" "p"
  WHERE (("p"."clerk_user_id" = ("auth"."uid"())::"text") AND ("p"."role" = 'admin'::"public"."user_role_internal")))));



CREATE POLICY "Admins can insert transactions" ON "public"."bsi_transactions" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_users" "p"
  WHERE (("p"."clerk_user_id" = ("auth"."uid"())::"text") AND ("p"."role" = 'admin'::"public"."user_role_internal")))));



CREATE POLICY "Admins can read all instruments" ON "public"."bs_debt_instruments" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_users" "p"
  WHERE ("p"."clerk_user_id" = ("auth"."uid"())::"text"))));



CREATE POLICY "Admins can update distributions" ON "public"."bsi_distributions" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_users" "p"
  WHERE (("p"."clerk_user_id" = ("auth"."uid"())::"text") AND ("p"."role" = 'admin'::"public"."user_role_internal")))));



CREATE POLICY "Admins can update instrument-deal links" ON "public"."bs_debt_instruments_deals" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_users" "p"
  WHERE (("p"."clerk_user_id" = ("auth"."uid"())::"text") AND ("p"."role" = 'admin'::"public"."user_role_internal")))));



CREATE POLICY "Admins can update instruments" ON "public"."bs_debt_instruments" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_users" "p"
  WHERE (("p"."clerk_user_id" = ("auth"."uid"())::"text") AND ("p"."role" = 'admin'::"public"."user_role_internal")))));



CREATE POLICY "Admins can update statements" ON "public"."bsi_statements" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_users" "p"
  WHERE (("p"."clerk_user_id" = ("auth"."uid"())::"text") AND ("p"."role" = 'admin'::"public"."user_role_internal")))));



CREATE POLICY "Admins can update transactions" ON "public"."bsi_transactions" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_users" "p"
  WHERE (("p"."clerk_user_id" = ("auth"."uid"())::"text") AND ("p"."role" = 'admin'::"public"."user_role_internal")))));



CREATE POLICY "All authenticated users can read UW outcomes" ON "public"."select_uw_outcomes" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "All authenticated users can read constants" ON "public"."constants" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "All authenticated users can read contact type junctions" ON "public"."contact_types_jt" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "All authenticated users can read contact types" ON "public"."contact_types" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "All authenticated users can read countries" ON "public"."countries" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "All authenticated users can read document roles" ON "public"."document_roles" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "All authenticated users can read fees" ON "public"."fee" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow API Insert" ON "public"."company" FOR INSERT TO "anon" WITH CHECK (true);



CREATE POLICY "Allow API Insert" ON "public"."loan_application" FOR INSERT TO "anon" WITH CHECK (true);



CREATE POLICY "Allow auth select" ON "public"."borrower" FOR SELECT TO "anon", "authenticated" USING (true);



CREATE POLICY "Allow auth select" ON "public"."guarantor" FOR SELECT TO "anon", "authenticated" USING (true);



CREATE POLICY "Allow auth select" ON "public"."property" FOR SELECT TO "anon", "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to select all property_reapi records" ON "public"."property_reapi" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow users to insert property records" ON "public"."property_reapi" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable read access for all users" ON "public"."deal" FOR SELECT USING (true);



CREATE POLICY "Only admins can link orgs to deals" ON "public"."bsi_deals_orgs" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_users" "p"
  WHERE (("p"."clerk_user_id" = ("auth"."uid"())::"text") AND ("p"."role" = 'admin'::"public"."user_role_internal")))));



CREATE POLICY "Only admins can unlink orgs from deals" ON "public"."bsi_deals_orgs" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_users" "p"
  WHERE (("p"."clerk_user_id" = ("auth"."uid"())::"text") AND ("p"."role" = 'admin'::"public"."user_role_internal")))));



CREATE POLICY "Only admins can update deal-org links" ON "public"."bsi_deals_orgs" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_users" "p"
  WHERE (("p"."clerk_user_id" = ("auth"."uid"())::"text") AND ("p"."role" = 'admin'::"public"."user_role_internal")))));



CREATE POLICY "Org members and admins can read distributions" ON "public"."bsi_distributions" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."auth_clerk_users" "p"
     JOIN "public"."auth_clerk_orgs_members" "m" ON (("p"."id" = "m"."auth_clerk_users_id")))
  WHERE (("p"."clerk_user_id" = ("auth"."uid"())::"text") AND (("p"."role" = 'admin'::"public"."user_role_internal") OR ("m"."clerk_org_id" = "bsi_distributions"."clerk_org_id"))))));



CREATE POLICY "Org members and admins can read instrument-deal links" ON "public"."bs_debt_instruments_deals" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ((("public"."bsi_deals" "d"
     JOIN "public"."bsi_deals_orgs" "dorg" ON (("dorg"."deal_id" = "d"."id")))
     JOIN "public"."auth_clerk_orgs_members" "m" ON (("m"."clerk_org_id" = "dorg"."clerk_org_id")))
     JOIN "public"."auth_clerk_users" "p" ON (("p"."id" = "m"."auth_clerk_users_id")))
  WHERE (("d"."id" = "bs_debt_instruments_deals"."deal_id") AND ("p"."clerk_user_id" = ("auth"."uid"())::"text") AND (("p"."role" = 'admin'::"public"."user_role_internal") OR ("m"."clerk_org_id" = "dorg"."clerk_org_id"))))));



CREATE POLICY "Org members and admins can read statements" ON "public"."bsi_statements" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."auth_clerk_users" "p"
     JOIN "public"."auth_clerk_orgs_members" "m" ON (("p"."id" = "m"."auth_clerk_users_id")))
  WHERE (("p"."clerk_user_id" = ("auth"."uid"())::"text") AND (("p"."role" = 'admin'::"public"."user_role_internal") OR ("m"."clerk_org_id" = "bsi_statements"."clerk_org_id"))))));



CREATE POLICY "Org members and admins can read transactions" ON "public"."bsi_transactions" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."auth_clerk_users" "p"
     JOIN "public"."auth_clerk_orgs_members" "m" ON (("p"."id" = "m"."auth_clerk_users_id")))
  WHERE (("p"."clerk_user_id" = ("auth"."uid"())::"text") AND (("p"."role" = 'admin'::"public"."user_role_internal") OR ("m"."clerk_org_id" = "bsi_transactions"."clerk_org_id"))))));



CREATE POLICY "Org members can read linked deals" ON "public"."bsi_deals_orgs" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."auth_clerk_users" "p"
     JOIN "public"."auth_clerk_orgs_members" "m" ON (("p"."id" = "m"."auth_clerk_users_id")))
  WHERE (("m"."clerk_org_id" = "bsi_deals_orgs"."clerk_org_id") AND ("p"."clerk_user_id" = ("auth"."uid"())::"text")))));



CREATE POLICY "Org members can view transaction references" ON "public"."bsi_transactions_references" FOR SELECT TO "authenticated" USING (("transaction_id" IN ( SELECT "bt"."id"
   FROM (("public"."bsi_transactions" "bt"
     JOIN "public"."auth_clerk_orgs_members" "om" ON (("bt"."clerk_org_id" = "om"."clerk_org_id")))
     JOIN "public"."auth_clerk_users" "acu" ON (("om"."auth_clerk_users_id" = "acu"."id")))
  WHERE ("acu"."clerk_user_id" = ("auth"."uid"())::"text"))));



CREATE POLICY "Return data for API insert" ON "public"."company" FOR SELECT USING (true);



CREATE POLICY "Service role can insert new users" ON "public"."auth_clerk_users" FOR INSERT TO "service_role" WITH CHECK (true);



CREATE POLICY "Service role can read all profiles" ON "public"."auth_clerk_users" FOR SELECT TO "service_role" USING (true);



CREATE POLICY "Service role can update user profiles" ON "public"."auth_clerk_users" FOR UPDATE TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Users can select their own contact" ON "public"."contact" FOR SELECT TO "authenticated" USING (("email_address" = ("auth"."jwt"() ->> 'email'::"text")));



CREATE POLICY "Users can select their own documents" ON "public"."document_files" FOR SELECT TO "authenticated" USING (("uploaded_by" = ("auth"."uid"())::"text"));



CREATE POLICY "Users can select their own profile" ON "public"."auth_clerk_users" FOR SELECT TO "authenticated" USING (("clerk_user_id" = ("auth"."jwt"() ->> 'sub'::"text")));



CREATE POLICY "Users can update their profile" ON "public"."auth_clerk_users" FOR UPDATE TO "authenticated" USING (("clerk_user_id" = ("auth"."jwt"() ->> 'sub'::"text"))) WITH CHECK (("clerk_user_id" = ("auth"."jwt"() ->> 'sub'::"text")));



CREATE POLICY "Users can view CBA requests for their deals" ON "public"."cba_requests" FOR SELECT TO "authenticated" USING (("deal_id" IN ( SELECT "bd"."deal_id"
   FROM ((("public"."bsi_deals" "bd"
     JOIN "public"."bsi_deals_orgs" "bdo" ON (("bd"."id" = "bdo"."deal_id")))
     JOIN "public"."auth_clerk_orgs_members" "om" ON (("bdo"."clerk_org_id" = "om"."clerk_org_id")))
     JOIN "public"."auth_clerk_users" "acu" ON (("om"."auth_clerk_users_id" = "acu"."id")))
  WHERE ("acu"."clerk_user_id" = ("auth"."uid"())::"text"))));



CREATE POLICY "Users can view appraisals for their deals" ON "public"."appraisal" FOR SELECT TO "authenticated" USING (("deal_id" IN ( SELECT "bd"."deal_id"
   FROM ((("public"."bsi_deals" "bd"
     JOIN "public"."bsi_deals_orgs" "bdo" ON (("bd"."id" = "bdo"."deal_id")))
     JOIN "public"."auth_clerk_orgs_members" "om" ON (("bdo"."clerk_org_id" = "om"."clerk_org_id")))
     JOIN "public"."auth_clerk_users" "acu" ON (("om"."auth_clerk_users_id" = "acu"."id")))
  WHERE ("acu"."clerk_user_id" = ("auth"."uid"())::"text"))));



CREATE POLICY "Users can view deal appraisals for their deals" ON "public"."deal_appraisals" FOR SELECT TO "authenticated" USING (("deal_id" IN ( SELECT "bd"."deal_id"
   FROM ((("public"."bsi_deals" "bd"
     JOIN "public"."bsi_deals_orgs" "bdo" ON (("bd"."id" = "bdo"."deal_id")))
     JOIN "public"."auth_clerk_orgs_members" "om" ON (("bdo"."clerk_org_id" = "om"."clerk_org_id")))
     JOIN "public"."auth_clerk_users" "acu" ON (("om"."auth_clerk_users_id" = "acu"."id")))
  WHERE ("acu"."clerk_user_id" = ("auth"."uid"())::"text"))));



CREATE POLICY "Users can view distributions in their organizations" ON "public"."bsi_distributions" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."auth_clerk_orgs_members" "m"
     JOIN "public"."auth_clerk_users" "p" ON (("p"."id" = "m"."auth_clerk_users_id")))
  WHERE (("p"."clerk_user_id" = ("auth"."uid"())::"text") AND ("m"."clerk_org_id" = "bsi_distributions"."clerk_org_id")))));



CREATE POLICY "Users can view fees for their deals" ON "public"."custom_loan_fees" FOR SELECT TO "authenticated" USING (("deal_id" IN ( SELECT "bd"."deal_id"
   FROM ((("public"."bsi_deals" "bd"
     JOIN "public"."bsi_deals_orgs" "bdo" ON (("bd"."id" = "bdo"."deal_id")))
     JOIN "public"."auth_clerk_orgs_members" "om" ON (("bdo"."clerk_org_id" = "om"."clerk_org_id")))
     JOIN "public"."auth_clerk_users" "acu" ON (("om"."auth_clerk_users_id" = "acu"."id")))
  WHERE ("acu"."clerk_user_id" = ("auth"."uid"())::"text"))));



CREATE POLICY "Users can view milestones for their deals" ON "public"."milestones" FOR SELECT TO "authenticated" USING (("deal_id" IN ( SELECT "bd"."deal_id"
   FROM ((("public"."bsi_deals" "bd"
     JOIN "public"."bsi_deals_orgs" "bdo" ON (("bd"."id" = "bdo"."deal_id")))
     JOIN "public"."auth_clerk_orgs_members" "om" ON (("bdo"."clerk_org_id" = "om"."clerk_org_id")))
     JOIN "public"."auth_clerk_users" "acu" ON (("om"."auth_clerk_users_id" = "acu"."id")))
  WHERE ("acu"."clerk_user_id" = ("auth"."uid"())::"text"))));



CREATE POLICY "Users can view payroll submissions for their deals" ON "public"."payroll_submission" FOR SELECT TO "authenticated" USING (("deal_id" IN ( SELECT "bd"."deal_id"
   FROM ((("public"."bsi_deals" "bd"
     JOIN "public"."bsi_deals_orgs" "bdo" ON (("bd"."id" = "bdo"."deal_id")))
     JOIN "public"."auth_clerk_orgs_members" "om" ON (("bdo"."clerk_org_id" = "om"."clerk_org_id")))
     JOIN "public"."auth_clerk_users" "acu" ON (("om"."auth_clerk_users_id" = "acu"."id")))
  WHERE ("acu"."clerk_user_id" = ("auth"."uid"())::"text"))));



CREATE POLICY "Users can view property data for their deals" ON "public"."deal_property" FOR SELECT TO "authenticated" USING (("deal_id" IN ( SELECT "bd"."deal_id"
   FROM ((("public"."bsi_deals" "bd"
     JOIN "public"."bsi_deals_orgs" "bdo" ON (("bd"."id" = "bdo"."deal_id")))
     JOIN "public"."auth_clerk_orgs_members" "om" ON (("bdo"."clerk_org_id" = "om"."clerk_org_id")))
     JOIN "public"."auth_clerk_users" "acu" ON (("om"."auth_clerk_users_id" = "acu"."id")))
  WHERE ("acu"."clerk_user_id" = ("auth"."uid"())::"text"))));



CREATE POLICY "Users can view property income for their deals" ON "public"."property_income" FOR SELECT TO "authenticated" USING (("property_id" IN ( SELECT "dp"."property_id"
   FROM (((("public"."deal_property" "dp"
     JOIN "public"."bsi_deals" "bd" ON (("dp"."deal_id" = "bd"."deal_id")))
     JOIN "public"."bsi_deals_orgs" "bdo" ON (("bd"."id" = "bdo"."deal_id")))
     JOIN "public"."auth_clerk_orgs_members" "om" ON (("bdo"."clerk_org_id" = "om"."clerk_org_id")))
     JOIN "public"."auth_clerk_users" "acu" ON (("om"."auth_clerk_users_id" = "acu"."id")))
  WHERE ("acu"."clerk_user_id" = ("auth"."uid"())::"text"))));



CREATE POLICY "Users can view roles for their deals" ON "public"."deal_roles" FOR SELECT TO "authenticated" USING (("deal_id" IN ( SELECT "bd"."deal_id"
   FROM ((("public"."bsi_deals" "bd"
     JOIN "public"."bsi_deals_orgs" "bdo" ON (("bd"."id" = "bdo"."deal_id")))
     JOIN "public"."auth_clerk_orgs_members" "om" ON (("bdo"."clerk_org_id" = "om"."clerk_org_id")))
     JOIN "public"."auth_clerk_users" "acu" ON (("om"."auth_clerk_users_id" = "acu"."id")))
  WHERE ("acu"."clerk_user_id" = ("auth"."uid"())::"text"))));



CREATE POLICY "Users can view tasks for their deals" ON "public"."tasks" FOR SELECT TO "authenticated" USING ((("deal_id" IN ( SELECT "bd"."deal_id"
   FROM ((("public"."bsi_deals" "bd"
     JOIN "public"."bsi_deals_orgs" "bdo" ON (("bd"."id" = "bdo"."deal_id")))
     JOIN "public"."auth_clerk_orgs_members" "om" ON (("bdo"."clerk_org_id" = "om"."clerk_org_id")))
     JOIN "public"."auth_clerk_users" "acu" ON (("om"."auth_clerk_users_id" = "acu"."id")))
  WHERE ("acu"."clerk_user_id" = ("auth"."uid"())::"text"))) OR ("assigned_to" IN ( SELECT "acu"."id"
   FROM "public"."auth_clerk_users" "acu"
  WHERE ("acu"."clerk_user_id" = ("auth"."uid"())::"text")))));



CREATE POLICY "Users can view their own organization memberships" ON "public"."auth_clerk_orgs_members" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_users" "p"
  WHERE (("p"."id" = "auth_clerk_orgs_members"."auth_clerk_users_id") AND ("p"."clerk_user_id" = ("auth"."uid"())::"text")))));



CREATE POLICY "Users can view their own organizations" ON "public"."auth_clerk_orgs" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."auth_clerk_orgs_members" "m"
     JOIN "public"."auth_clerk_users" "p" ON (("m"."auth_clerk_users_id" = "p"."id")))
  WHERE (("m"."clerk_org_id" = "auth_clerk_orgs"."id") AND ("p"."clerk_user_id" = ("auth"."uid"())::"text")))));



CREATE POLICY "Users can view their profile" ON "public"."auth_clerk_users" FOR SELECT TO "authenticated" USING (("clerk_user_id" = ("auth"."jwt"() ->> 'sub'::"text")));



ALTER TABLE "public"."appraisal" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."auth_clerk_orgs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."auth_clerk_orgs_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."auth_clerk_users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."borrower" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bs_debt_instruments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bs_debt_instruments_deals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bsi_deals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bsi_deals_orgs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bsi_distributions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bsi_statements" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bsi_transactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bsi_transactions_references" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cba_requests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cba_requests_guarantors" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."company" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."company_contact" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."company_member" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."company_roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."company_roles_defined" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."constants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."contact" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."contact_types" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."contact_types_jt" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."countries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."custom_loan_fees" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."deal" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."deal_appraisals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."deal_property" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."deal_roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."document_files" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."document_roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."document_roles_assigned" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."fee" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."guarantor" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."loan_application" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."milestone_templates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."milestones" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payroll_submission" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payroll_submission_fees_1099" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."property" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."property_income" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."property_reapi" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."select_uw_outcomes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."task_templates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tasks" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."appraisal";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."auth_clerk_users";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."borrower";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."cba_requests";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."company";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."company_member";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."contact";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."deal";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."document_files";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."fee";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."loan_application";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."milestones";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."payroll_submission";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."property";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."property_reapi";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."tasks";






GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";
GRANT USAGE ON SCHEMA "public" TO "postgres";






































































































































































































































































































































































































GRANT ALL ON FUNCTION "public"."format_address"("street" "text", "suite_apt" "text", "city" "text", "state" "text", "postal_code" "text", "country" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."format_address"("street" "text", "suite_apt" "text", "city" "text", "state" "text", "postal_code" "text", "country" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."format_address"("street" "text", "suite_apt" "text", "city" "text", "state" "text", "postal_code" "text", "country" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."format_address"("po_box" "text", "street" "text", "apt_suite" "text", "city" "text", "state" "text", "postal_code" "text", "country" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."format_address"("po_box" "text", "street" "text", "apt_suite" "text", "city" "text", "state" "text", "postal_code" "text", "country" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."format_address"("po_box" "text", "street" "text", "apt_suite" "text", "city" "text", "state" "text", "postal_code" "text", "country" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."format_deal_name"("property_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."format_deal_name"("property_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."format_deal_name"("property_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_jsonb_array_element"("array_value" "jsonb", "index" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_jsonb_array_element"("array_value" "jsonb", "index" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_jsonb_array_element"("array_value" "jsonb", "index" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_numeric_constant"("constant_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_numeric_constant"("constant_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_numeric_constant"("constant_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_state_code"("state_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_state_code"("state_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_state_code"("state_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_text_constant"("constant_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_text_constant"("constant_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_text_constant"("constant_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_yesno_constant"("constant_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_yesno_constant"("constant_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_yesno_constant"("constant_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_deal_changes"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_deal_changes"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_deal_changes"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_deal"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_deal"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_deal"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_loan_application"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_loan_application"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_loan_application"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_property_changes"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_property_changes"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_property_changes"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_user_profile_changes"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_user_profile_changes"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_user_profile_changes"() TO "service_role";



GRANT ALL ON FUNCTION "public"."ltv"("transaction_type" "public"."transaction_type", "as_is_value" numeric, "purchase_price" numeric, "loan_amount" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."ltv"("transaction_type" "public"."transaction_type", "as_is_value" numeric, "purchase_price" numeric, "loan_amount" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."ltv"("transaction_type" "public"."transaction_type", "as_is_value" numeric, "purchase_price" numeric, "loan_amount" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_property_address"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_property_address"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_property_address"() TO "service_role";




































GRANT ALL ON TABLE "public"."document_files" TO "anon";
GRANT ALL ON TABLE "public"."document_files" TO "authenticated";
GRANT ALL ON TABLE "public"."document_files" TO "service_role";



GRANT ALL ON SEQUENCE "public"."Documents_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."Documents_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."Documents_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."tasks" TO "anon";
GRANT ALL ON TABLE "public"."tasks" TO "authenticated";
GRANT ALL ON TABLE "public"."tasks" TO "service_role";



GRANT ALL ON SEQUENCE "public"."Tasks_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."Tasks_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."Tasks_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."appraisal" TO "anon";
GRANT ALL ON TABLE "public"."appraisal" TO "authenticated";
GRANT ALL ON TABLE "public"."appraisal" TO "service_role";



GRANT ALL ON SEQUENCE "public"."appraisal_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."appraisal_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."appraisal_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."auth_clerk_orgs" TO "anon";
GRANT ALL ON TABLE "public"."auth_clerk_orgs" TO "authenticated";
GRANT ALL ON TABLE "public"."auth_clerk_orgs" TO "service_role";



GRANT ALL ON TABLE "public"."auth_clerk_orgs_members" TO "anon";
GRANT ALL ON TABLE "public"."auth_clerk_orgs_members" TO "authenticated";
GRANT ALL ON TABLE "public"."auth_clerk_orgs_members" TO "service_role";



GRANT ALL ON TABLE "public"."auth_clerk_users" TO "anon";
GRANT ALL ON TABLE "public"."auth_clerk_users" TO "authenticated";
GRANT ALL ON TABLE "public"."auth_clerk_users" TO "service_role";



GRANT ALL ON TABLE "public"."borrower" TO "anon";
GRANT ALL ON TABLE "public"."borrower" TO "authenticated";
GRANT ALL ON TABLE "public"."borrower" TO "service_role";



GRANT ALL ON SEQUENCE "public"."borrower_profile_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."borrower_profile_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."borrower_profile_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."bs_debt_instruments" TO "anon";
GRANT ALL ON TABLE "public"."bs_debt_instruments" TO "authenticated";
GRANT ALL ON TABLE "public"."bs_debt_instruments" TO "service_role";



GRANT ALL ON TABLE "public"."bs_debt_instruments_deals" TO "anon";
GRANT ALL ON TABLE "public"."bs_debt_instruments_deals" TO "authenticated";
GRANT ALL ON TABLE "public"."bs_debt_instruments_deals" TO "service_role";



GRANT ALL ON SEQUENCE "public"."bs_debt_instruments_deals_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."bs_debt_instruments_deals_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."bs_debt_instruments_deals_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."bsi_deals" TO "anon";
GRANT ALL ON TABLE "public"."bsi_deals" TO "authenticated";
GRANT ALL ON TABLE "public"."bsi_deals" TO "service_role";



GRANT ALL ON SEQUENCE "public"."bsi_deals_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."bsi_deals_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."bsi_deals_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."bsi_deals_orgs" TO "anon";
GRANT ALL ON TABLE "public"."bsi_deals_orgs" TO "authenticated";
GRANT ALL ON TABLE "public"."bsi_deals_orgs" TO "service_role";



GRANT ALL ON SEQUENCE "public"."bsi_deals_orgs_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."bsi_deals_orgs_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."bsi_deals_orgs_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."bsi_distributions" TO "anon";
GRANT ALL ON TABLE "public"."bsi_distributions" TO "authenticated";
GRANT ALL ON TABLE "public"."bsi_distributions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."bsi_distributions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."bsi_distributions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."bsi_distributions_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."bsi_statements" TO "anon";
GRANT ALL ON TABLE "public"."bsi_statements" TO "authenticated";
GRANT ALL ON TABLE "public"."bsi_statements" TO "service_role";



GRANT ALL ON TABLE "public"."bsi_transactions" TO "anon";
GRANT ALL ON TABLE "public"."bsi_transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."bsi_transactions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."bsi_transactions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."bsi_transactions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."bsi_transactions_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."bsi_transactions_references" TO "anon";
GRANT ALL ON TABLE "public"."bsi_transactions_references" TO "authenticated";
GRANT ALL ON TABLE "public"."bsi_transactions_references" TO "service_role";



GRANT ALL ON TABLE "public"."cba_requests" TO "anon";
GRANT ALL ON TABLE "public"."cba_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."cba_requests" TO "service_role";



GRANT ALL ON TABLE "public"."cba_requests_guarantors" TO "anon";
GRANT ALL ON TABLE "public"."cba_requests_guarantors" TO "authenticated";
GRANT ALL ON TABLE "public"."cba_requests_guarantors" TO "service_role";



GRANT ALL ON SEQUENCE "public"."cba_submission_credit_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."cba_submission_credit_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."cba_submission_credit_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."company" TO "anon";
GRANT ALL ON TABLE "public"."company" TO "authenticated";
GRANT ALL ON TABLE "public"."company" TO "service_role";



GRANT SELECT("co_id") ON TABLE "public"."company" TO "anon";



GRANT SELECT("co_name") ON TABLE "public"."company" TO "anon";



GRANT ALL ON TABLE "public"."company_contact" TO "anon";
GRANT ALL ON TABLE "public"."company_contact" TO "authenticated";
GRANT ALL ON TABLE "public"."company_contact" TO "service_role";



GRANT ALL ON SEQUENCE "public"."company_contact_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."company_contact_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."company_contact_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."company_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."company_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."company_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."company_member" TO "anon";
GRANT ALL ON TABLE "public"."company_member" TO "authenticated";
GRANT ALL ON TABLE "public"."company_member" TO "service_role";



GRANT ALL ON SEQUENCE "public"."company_member_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."company_member_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."company_member_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."company_roles_defined" TO "anon";
GRANT ALL ON TABLE "public"."company_roles_defined" TO "authenticated";
GRANT ALL ON TABLE "public"."company_roles_defined" TO "service_role";



GRANT ALL ON SEQUENCE "public"."company_role_mm_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."company_role_mm_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."company_role_mm_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."company_roles" TO "anon";
GRANT ALL ON TABLE "public"."company_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."company_roles" TO "service_role";



GRANT ALL ON SEQUENCE "public"."company_roles_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."company_roles_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."company_roles_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."constants" TO "anon";
GRANT ALL ON TABLE "public"."constants" TO "authenticated";
GRANT ALL ON TABLE "public"."constants" TO "service_role";



GRANT ALL ON SEQUENCE "public"."constants_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."constants_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."constants_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."contact" TO "anon";
GRANT ALL ON TABLE "public"."contact" TO "authenticated";
GRANT ALL ON TABLE "public"."contact" TO "service_role";



GRANT ALL ON TABLE "public"."contact_types_jt" TO "anon";
GRANT ALL ON TABLE "public"."contact_types_jt" TO "authenticated";
GRANT ALL ON TABLE "public"."contact_types_jt" TO "service_role";



GRANT ALL ON SEQUENCE "public"."contact_contact_types_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."contact_contact_types_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."contact_contact_types_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."contact_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."contact_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."contact_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."contact_types" TO "anon";
GRANT ALL ON TABLE "public"."contact_types" TO "authenticated";
GRANT ALL ON TABLE "public"."contact_types" TO "service_role";



GRANT ALL ON SEQUENCE "public"."contact_types_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."contact_types_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."contact_types_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."countries" TO "anon";
GRANT ALL ON TABLE "public"."countries" TO "authenticated";
GRANT ALL ON TABLE "public"."countries" TO "service_role";



GRANT ALL ON SEQUENCE "public"."countries_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."countries_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."countries_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."custom_loan_fees" TO "anon";
GRANT ALL ON TABLE "public"."custom_loan_fees" TO "authenticated";
GRANT ALL ON TABLE "public"."custom_loan_fees" TO "service_role";



GRANT ALL ON SEQUENCE "public"."custom_loan_fees_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."custom_loan_fees_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."custom_loan_fees_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."deal" TO "anon";
GRANT ALL ON TABLE "public"."deal" TO "authenticated";
GRANT ALL ON TABLE "public"."deal" TO "service_role";



GRANT ALL ON TABLE "public"."deal_appraisals" TO "anon";
GRANT ALL ON TABLE "public"."deal_appraisals" TO "authenticated";
GRANT ALL ON TABLE "public"."deal_appraisals" TO "service_role";



GRANT ALL ON SEQUENCE "public"."deal_appraisals_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."deal_appraisals_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."deal_appraisals_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."deal_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."deal_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."deal_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."deal_property" TO "anon";
GRANT ALL ON TABLE "public"."deal_property" TO "authenticated";
GRANT ALL ON TABLE "public"."deal_property" TO "service_role";



GRANT ALL ON SEQUENCE "public"."deal_property_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."deal_property_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."deal_property_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."deal_roles" TO "anon";
GRANT ALL ON TABLE "public"."deal_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."deal_roles" TO "service_role";



GRANT ALL ON SEQUENCE "public"."deal_roles_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."deal_roles_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."deal_roles_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."debt_instruments_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."debt_instruments_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."debt_instruments_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."document_roles" TO "anon";
GRANT ALL ON TABLE "public"."document_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."document_roles" TO "service_role";



GRANT ALL ON TABLE "public"."document_roles_assigned" TO "anon";
GRANT ALL ON TABLE "public"."document_roles_assigned" TO "authenticated";
GRANT ALL ON TABLE "public"."document_roles_assigned" TO "service_role";



GRANT ALL ON SEQUENCE "public"."document_roles_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."document_roles_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."document_roles_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."fee" TO "anon";
GRANT ALL ON TABLE "public"."fee" TO "authenticated";
GRANT ALL ON TABLE "public"."fee" TO "service_role";



GRANT ALL ON SEQUENCE "public"."fee_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."fee_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."fee_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."guarantor" TO "anon";
GRANT ALL ON TABLE "public"."guarantor" TO "authenticated";
GRANT ALL ON TABLE "public"."guarantor" TO "service_role";



GRANT ALL ON SEQUENCE "public"."guarantor_guarantor_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."guarantor_guarantor_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."guarantor_guarantor_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."loan_application" TO "anon";
GRANT ALL ON TABLE "public"."loan_application" TO "authenticated";
GRANT ALL ON TABLE "public"."loan_application" TO "service_role";



GRANT ALL ON SEQUENCE "public"."loan_application_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."loan_application_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."loan_application_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."milestone_templates" TO "anon";
GRANT ALL ON TABLE "public"."milestone_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."milestone_templates" TO "service_role";



GRANT ALL ON SEQUENCE "public"."milestone_templates_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."milestone_templates_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."milestone_templates_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."milestones" TO "anon";
GRANT ALL ON TABLE "public"."milestones" TO "authenticated";
GRANT ALL ON TABLE "public"."milestones" TO "service_role";



GRANT ALL ON SEQUENCE "public"."milestones_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."milestones_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."milestones_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."payroll_submission" TO "anon";
GRANT ALL ON TABLE "public"."payroll_submission" TO "authenticated";
GRANT ALL ON TABLE "public"."payroll_submission" TO "service_role";



GRANT ALL ON TABLE "public"."payroll_submission_fees_1099" TO "anon";
GRANT ALL ON TABLE "public"."payroll_submission_fees_1099" TO "authenticated";
GRANT ALL ON TABLE "public"."payroll_submission_fees_1099" TO "service_role";



GRANT ALL ON SEQUENCE "public"."payroll_submission_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."payroll_submission_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."payroll_submission_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."profile_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."profile_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."profile_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."property" TO "anon";
GRANT ALL ON TABLE "public"."property" TO "authenticated";
GRANT ALL ON TABLE "public"."property" TO "service_role";



GRANT ALL ON TABLE "public"."property_reapi" TO "anon";
GRANT ALL ON TABLE "public"."property_reapi" TO "authenticated";
GRANT ALL ON TABLE "public"."property_reapi" TO "service_role";



GRANT ALL ON SEQUENCE "public"."property_data_reapi_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."property_data_reapi_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."property_data_reapi_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."property_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."property_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."property_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."property_income" TO "anon";
GRANT ALL ON TABLE "public"."property_income" TO "authenticated";
GRANT ALL ON TABLE "public"."property_income" TO "service_role";



GRANT ALL ON SEQUENCE "public"."property_income_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."property_income_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."property_income_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."select_uw_outcomes" TO "anon";
GRANT ALL ON TABLE "public"."select_uw_outcomes" TO "authenticated";
GRANT ALL ON TABLE "public"."select_uw_outcomes" TO "service_role";



GRANT ALL ON TABLE "public"."task_templates" TO "anon";
GRANT ALL ON TABLE "public"."task_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."task_templates" TO "service_role";



GRANT ALL ON SEQUENCE "public"."task_templates_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."task_templates_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."task_templates_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."transaction_references_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."transaction_references_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."transaction_references_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_clerk_orgs_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_clerk_orgs_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_clerk_orgs_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_org_memberships_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_org_memberships_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_org_memberships_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."uw_result_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."uw_result_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."uw_result_id_seq" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
