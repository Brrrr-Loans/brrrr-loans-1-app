


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


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



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
    'fee',
    'distribution',
    'return'
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
    'pending_approval',
    'processed',
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


CREATE OR REPLACE FUNCTION "public"."auth_clerk_orgs_after_insert_seed_dap"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  PERFORM public.seed_document_access_permissions_for_org(NEW.id);
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."auth_clerk_orgs_after_insert_seed_dap"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."auto_match_transfer_to_vendor"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    -- If the transfer has a counterparty_id, try to match it to a vendor
    IF NEW.counterparty_id IS NOT NULL THEN
        -- Insert automatic match if vendor exists
        INSERT INTO api_brex_transfers_vendors (
            brex_transfer_id,
            brex_vendor_id,
            match_method,
            created_at
        )
        SELECT 
            NEW.brex_transfer_id,
            v.id,
            'automatic',
            NOW()
        FROM api_brex_vendors v
        WHERE v.brex_vendor_id = NEW.counterparty_id
        -- Only insert if no match exists yet (don't override manual matches)
        AND NOT EXISTS (
            SELECT 1 FROM api_brex_transfers_vendors atv
            WHERE atv.brex_transfer_id = NEW.brex_transfer_id
        )
        ON CONFLICT (brex_transfer_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."auto_match_transfer_to_vendor"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."auto_match_transfer_to_vendor"() IS 'Automatically creates junction table records for transfers with matching counterparty_id. Does not override existing manual matches.';



CREATE OR REPLACE FUNCTION "public"."can_access_deal_document"("p_deal_id" bigint, "p_document_category_id" bigint, "p_action" "text" DEFAULT 'view'::"text") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    SET "row_security" TO 'off'
    AS $$
  SELECT
    CASE
      WHEN p_action NOT IN ('view','insert','upload','delete') THEN false
      ELSE (
        public.is_internal_admin()
        OR (
          public.get_active_org_id() IS NOT NULL

          -- Must be member of active org
          AND EXISTS (
            SELECT 1
            FROM public.auth_clerk_orgs_members m
            WHERE m.auth_clerk_users_id = public.get_current_user_id()
              AND m.clerk_org_id = public.get_active_org_id()
          )

          -- Deal must belong to active org if mapped
          AND (
            NOT EXISTS (
              SELECT 1
              FROM public.bsi_deals_clerk_orgs dorg
              WHERE dorg.deal_id = p_deal_id
            )
            OR EXISTS (
              SELECT 1
              FROM public.bsi_deals_clerk_orgs dorg
              WHERE dorg.deal_id = p_deal_id
                AND dorg.clerk_org_id = public.get_active_org_id()
            )
          )

          -- Org-admin bypass only after deal↔org validation
          AND (
            public.is_org_admin(public.get_active_org_id())
            OR EXISTS (
              SELECT 1
              FROM public.deal_roles dr
              JOIN public.document_access_permissions dap
                ON dap.clerk_org_id = public.get_active_org_id()
               AND dap.deal_role_types_id = dr.deal_role_types_id
               AND dap.document_categories_id = p_document_category_id
              WHERE dr.deal_id = p_deal_id
                AND dr.auth_clerk_users_id = public.get_current_user_id()
                AND (
                  (p_action = 'view'   AND dap.can_view)
                  OR (p_action = 'insert' AND dap.can_insert)
                  OR (p_action = 'upload' AND dap.can_upload)
                  OR (p_action = 'delete' AND dap.can_delete)
                )
            )
          )
        )
      )
    END;
$$;


ALTER FUNCTION "public"."can_access_deal_document"("p_deal_id" bigint, "p_document_category_id" bigint, "p_action" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."can_access_deal_document"("p_deal_id" bigint, "p_document_category_id" bigint, "p_action" "text") IS 'Org-scoped deal document access. Validates active-org membership, deal↔org mapping, then checks permissions matrix (or org-admin bypass).';



CREATE OR REPLACE FUNCTION "public"."can_access_deal_document"("p_deal_id" bigint, "p_document_category_code" "text", "p_action" "text" DEFAULT 'view'::"text") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT public.can_access_deal_document(
    p_deal_id, 
    (SELECT id FROM public.document_categories WHERE code = p_document_category_code),
    p_action
  );
$$;


ALTER FUNCTION "public"."can_access_deal_document"("p_deal_id" bigint, "p_document_category_code" "text", "p_action" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."can_access_deal_document"("p_deal_id" bigint, "p_document_category_code" "text", "p_action" "text") IS 'Check if current user can perform an action on a document category (by code) for a specific deal - backward compatible';



CREATE OR REPLACE FUNCTION "public"."can_access_document"("p_document_file_id" bigint, "p_action" "text" DEFAULT 'view'::"text") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    SET "row_security" TO 'off'
    AS $$
  WITH df AS (
    SELECT id, document_category_id, uploaded_by, uploaded_at
    FROM public.document_files
    WHERE id = p_document_file_id
  )
  SELECT
    CASE
      WHEN p_action NOT IN ('view','insert','upload','delete') THEN false
      ELSE (
        public.is_internal_admin()

        -- org admins: full VIEW access to docs explicitly linked to the active org
        OR (
          p_action = 'view'
          AND public.is_org_admin(public.get_active_org_id())
          AND EXISTS (
            SELECT 1
            FROM public.document_files_clerk_orgs dfco
            WHERE dfco.document_file_id = p_document_file_id
              AND dfco.clerk_org_id = public.get_active_org_id()
          )
        )

        -- uploader can view
        OR (
          p_action = 'view'
          AND EXISTS (
            SELECT 1 FROM df
            WHERE df.uploaded_by = public.get_clerk_user_id()
          )
        )

        -- uploader can upload to their own fresh doc (uploaded_at IS NULL means not yet uploaded)
        OR (
          p_action = 'upload'
          AND EXISTS (
            SELECT 1 FROM df
            WHERE df.uploaded_by = public.get_clerk_user_id()
              AND df.uploaded_at IS NULL
          )
        )

        -- direct user link can view (view-only by design)
        OR (
          p_action = 'view'
          AND EXISTS (
            SELECT 1
            FROM public.document_files_clerk_users dfcu
            WHERE dfcu.document_file_id = p_document_file_id
              AND dfcu.clerk_user_id = public.get_current_user_id()
          )
        )

        -- direct org link can view (must be member of active org)
        OR (
          p_action = 'view'
          AND public.get_active_org_id() IS NOT NULL
          AND EXISTS (
            SELECT 1
            FROM public.document_files_clerk_orgs dfco
            JOIN public.auth_clerk_orgs_members m
              ON m.clerk_org_id = dfco.clerk_org_id
             AND m.auth_clerk_users_id = public.get_current_user_id()
            WHERE dfco.document_file_id = p_document_file_id
              AND dfco.clerk_org_id = public.get_active_org_id()
          )
        )

        -- deal-derived permission (covers docs linked to borrower/guarantor/company/property)
        OR EXISTS (
          SELECT 1
          FROM df
          JOIN public.document_file_deal_ids(p_document_file_id) d ON true
          WHERE df.document_category_id IS NOT NULL
            AND public.can_access_deal_document(d.deal_id, df.document_category_id, p_action)
        )
      )
    END;
$$;


ALTER FUNCTION "public"."can_access_document"("p_document_file_id" bigint, "p_action" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."can_access_document"("p_document_file_id" bigint, "p_action" "text") IS 'Canonical document access check. Uploader can upload to their own fresh doc (uploaded_at IS NULL). Deal-derived permissions for other actions.';



CREATE OR REPLACE FUNCTION "public"."check_deal_allocation_sum"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
DECLARE
    total_allocated DECIMAL(15,2);
    transaction_total DECIMAL(15,2);
BEGIN
    IF TG_OP = 'DELETE' THEN
        -- For DELETE, use OLD record
        SELECT COALESCE(SUM(allocation_amount), 0) INTO total_allocated
        FROM public.bsi_transactions_deals
        WHERE transaction_id = OLD.transaction_id;

        SELECT transaction_amount INTO transaction_total
        FROM public.bsi_transactions
        WHERE id = OLD.transaction_id;
    ELSE
        -- For INSERT/UPDATE, use NEW record
        SELECT COALESCE(SUM(allocation_amount), 0) INTO total_allocated
        FROM public.bsi_transactions_deals
        WHERE transaction_id = NEW.transaction_id;

        SELECT transaction_amount INTO transaction_total
        FROM public.bsi_transactions
        WHERE id = NEW.transaction_id;
    END IF;

    -- Validate: total allocations cannot exceed transaction amount
    -- Note: Using ABS() to handle negative transaction amounts (contributions)
    IF total_allocated > ABS(transaction_total) THEN
        RAISE EXCEPTION 'Total deal allocations (%) cannot exceed transaction amount (%)', 
            total_allocated, ABS(transaction_total);
    END IF;

    -- Return appropriate record based on operation
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$;


ALTER FUNCTION "public"."check_deal_allocation_sum"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."check_deal_allocation_sum"() IS 'Trigger function to validate deal allocations do not exceed transaction amount. Security: search_path fixed on 2025-11-18.';



CREATE OR REPLACE FUNCTION "public"."check_table_access"("p_table_name" "text", "p_action" "text", "p_user_owner_id" bigint DEFAULT NULL::bigint, "p_org_owner_id" bigint DEFAULT NULL::bigint, "p_deal_id" bigint DEFAULT NULL::bigint) RETURNS boolean
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_scope text;
BEGIN
  -- Admins bypass all checks
  IF public.is_admin() THEN
    RETURN true;
  END IF;
  
  -- First check if user has permission at all
  IF NOT public.has_table_permission(p_table_name, p_action) THEN
    RETURN false;
  END IF;
  
  -- Get the scope for this permission
  v_scope := public.get_table_scope(p_table_name, p_action);
  
  -- Apply scope restrictions
  CASE v_scope
    WHEN 'all' THEN
      RETURN true;
      
    WHEN 'own' THEN
      RETURN p_user_owner_id IS NOT NULL 
         AND p_user_owner_id = public.get_current_user_id();
         
    WHEN 'org' THEN
      RETURN p_org_owner_id IS NOT NULL 
         AND p_org_owner_id = ANY(public.get_current_user_org_ids());
         
    WHEN 'deal' THEN
      RETURN p_deal_id IS NOT NULL 
         AND EXISTS (
           SELECT 1 FROM public.deal_roles dr
           WHERE dr.deal_id = p_deal_id
           AND dr.auth_clerk_users_id = public.get_current_user_id()
         );
         
    ELSE
      RETURN false;
  END CASE;
END;
$$;


ALTER FUNCTION "public"."check_table_access"("p_table_name" "text", "p_action" "text", "p_user_owner_id" bigint, "p_org_owner_id" bigint, "p_deal_id" bigint) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."check_table_access"("p_table_name" "text", "p_action" "text", "p_user_owner_id" bigint, "p_org_owner_id" bigint, "p_deal_id" bigint) IS 'Combined permission + scope check. Pass owner IDs based on table structure.';



CREATE OR REPLACE FUNCTION "public"."check_user_deal_role"("p_deal_id" bigint) RETURNS boolean
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    SET "row_security" TO 'off'
    AS $$
DECLARE
  v_user_id bigint;
  v_has_role boolean;
BEGIN
  -- Get current user's internal ID
  SELECT id INTO v_user_id
  FROM public.auth_clerk_users
  WHERE clerk_user_id = (SELECT auth.jwt() ->> 'sub');
  
  IF v_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if user has any role on this deal
  SELECT EXISTS (
    SELECT 1 FROM public.deal_roles
    WHERE deal_id = p_deal_id
    AND auth_clerk_users_id = v_user_id
  ) INTO v_has_role;
  
  RETURN v_has_role;
END;
$$;


ALTER FUNCTION "public"."check_user_deal_role"("p_deal_id" bigint) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."check_user_deal_role"("p_deal_id" bigint) IS 'Checks if user has any role on a deal. Uses SECURITY DEFINER + row_security=off to bypass RLS.';



CREATE OR REPLACE FUNCTION "public"."count_pending_brex_transfer_syncs"() RETURNS bigint
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    v_count bigint;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM public.api_brex_transfers at
    WHERE at.counterparty_id IS NOT NULL
    AND (
        EXISTS (
            SELECT 1 FROM public.api_brex_vendors av
            JOIN public.api_brex_vendors_clerk_users avcu ON avcu.brex_vendor_id = av.id
            WHERE av.brex_vendor_id = at.counterparty_id
        )
        OR EXISTS (
            SELECT 1 FROM public.api_brex_vendors av
            JOIN public.api_brex_vendors_clerk_orgs avco ON avco.brex_vendor_id = av.id
            WHERE av.brex_vendor_id = at.counterparty_id
        )
    )
    AND NOT EXISTS (
        SELECT 1 FROM public.bsi_transactions_api_brex_transfers btbt
        WHERE btbt.brex_transfer_id = at.brex_transfer_id
    );
    
    RETURN v_count;
END;
$$;


ALTER FUNCTION "public"."count_pending_brex_transfer_syncs"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."count_pending_brex_transfer_syncs"() IS 'Returns the count of Brex transfers that are matched to vendors but have not yet been synced to bsi_transactions. Security: search_path fixed on 2025-11-18.';



CREATE OR REPLACE FUNCTION "public"."create_document_with_deal_link"("p_document_name" "text", "p_document_category_id" bigint, "p_deal_id" bigint, "p_storage_bucket" "text", "p_original_filename" "text", "p_file_type" "text" DEFAULT NULL::"text", "p_file_size" bigint DEFAULT NULL::bigint) RETURNS TABLE("document_file_id" bigint, "storage_bucket" "text", "storage_path" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    SET "row_security" TO 'off'
    AS $$
DECLARE
  v_doc_id bigint;
  v_active_org_id bigint;
  v_active_org_clerk_id text;
  v_path text;
BEGIN
  -- 1) Bucket whitelist
  IF p_storage_bucket <> 'documents' THEN
    RAISE EXCEPTION 'Invalid storage_bucket: must be documents';
  END IF;

  -- 2) Validate org context exists
  v_active_org_id := public.get_active_org_id();
  IF v_active_org_id IS NULL THEN
    RAISE EXCEPTION 'No active org context';
  END IF;

  -- 3) Clerk org id string from JWT (adjust claim name if needed)
  v_active_org_clerk_id := (auth.jwt() ->> 'org_id');
  IF v_active_org_clerk_id IS NULL THEN
    RAISE EXCEPTION 'Missing org_id in JWT';
  END IF;

  -- 4) Permission check (insert doc for deal/category)
  IF NOT public.can_access_deal_document(p_deal_id, p_document_category_id, 'insert') THEN
    RAISE EXCEPTION 'Permission denied: cannot insert documents for this deal/category';
  END IF;

  -- 5) Create doc row first (storage_path set after we get id)
  INSERT INTO public.document_files (
    document_name,
    document_category_id,
    storage_bucket,
    storage_path,
    file_type,
    file_size,
    uploaded_by
  ) VALUES (
    p_document_name,
    p_document_category_id,
    p_storage_bucket,
    NULL,  -- set after we have the id
    p_file_type,
    p_file_size,
    public.get_clerk_user_id()
  ) RETURNING id INTO v_doc_id;

  -- 6) Deterministic path: orgs/<clerk_org_id>/df/<doc_id>/<filename>
  v_path := format('orgs/%s/df/%s/%s', v_active_org_clerk_id, v_doc_id, p_original_filename);

  UPDATE public.document_files
  SET storage_path = v_path
  WHERE id = v_doc_id;

  -- 7) Create deal link
  INSERT INTO public.document_files_deals (document_file_id, deal_id)
  VALUES (v_doc_id, p_deal_id);

  -- 8) Return result for client to use for upload
  RETURN QUERY SELECT v_doc_id, p_storage_bucket, v_path;
END;
$$;


ALTER FUNCTION "public"."create_document_with_deal_link"("p_document_name" "text", "p_document_category_id" bigint, "p_deal_id" bigint, "p_storage_bucket" "text", "p_original_filename" "text", "p_file_type" "text", "p_file_size" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_document_with_subject_link"("p_document_name" "text", "p_document_category_id" bigint, "p_storage_bucket" "text", "p_original_filename" "text", "p_subject_type" "text", "p_subject_id" bigint DEFAULT NULL::bigint, "p_file_type" "text" DEFAULT NULL::"text", "p_file_size" bigint DEFAULT NULL::bigint) RETURNS TABLE("document_file_id" bigint, "storage_bucket" "text", "storage_path" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    SET "row_security" TO 'off'
    AS $$
DECLARE
  v_doc_id bigint;
  v_active_org_id bigint;
  v_active_org_clerk_id text;
  v_path text;
BEGIN
  -- 1) Bucket whitelist
  IF p_storage_bucket <> 'documents' THEN
    RAISE EXCEPTION 'Invalid storage_bucket: must be documents';
  END IF;

  -- 2) Validate org context exists
  v_active_org_id := public.get_active_org_id();
  IF v_active_org_id IS NULL THEN
    RAISE EXCEPTION 'No active org context';
  END IF;

  -- 3) Clerk org id string from JWT
  v_active_org_clerk_id := (auth.jwt() ->> 'org_id');
  IF v_active_org_clerk_id IS NULL THEN
    RAISE EXCEPTION 'Missing org_id in JWT';
  END IF;

  -- 4) Permission check: only org admins or internal admins can upload pre-deal docs
  IF NOT (public.is_internal_admin() OR public.is_org_admin(v_active_org_id)) THEN
    RAISE EXCEPTION 'Permission denied: must be org admin or internal admin for pre-deal uploads';
  END IF;

  -- 5) Validate subject type if provided
  IF p_subject_type IS NOT NULL AND p_subject_type NOT IN ('borrower', 'guarantor') THEN
    RAISE EXCEPTION 'Invalid subject_type: must be borrower or guarantor';
  END IF;

  IF p_subject_type IS NOT NULL AND p_subject_id IS NULL THEN
    RAISE EXCEPTION 'subject_id required when subject_type is provided';
  END IF;

  -- 6) Create doc row first (storage_path set after we get id)
  INSERT INTO public.document_files (
    document_name,
    document_category_id,
    storage_bucket,
    storage_path,
    file_type,
    file_size,
    uploaded_by
  ) VALUES (
    p_document_name,
    p_document_category_id,
    p_storage_bucket,
    NULL,
    p_file_type,
    p_file_size,
    public.get_clerk_user_id()
  ) RETURNING id INTO v_doc_id;

  -- 7) Deterministic path: orgs/<clerk_org_id>/df/<doc_id>/<filename>
  v_path := format('orgs/%s/df/%s/%s', v_active_org_clerk_id, v_doc_id, p_original_filename);

  UPDATE public.document_files
  SET storage_path = v_path
  WHERE id = v_doc_id;

  -- 8) Create org ownership link
  INSERT INTO public.document_files_clerk_orgs (document_file_id, clerk_org_id)
  VALUES (v_doc_id, v_active_org_id);

  -- 9) Create subject link if provided
  IF p_subject_type = 'borrower' THEN
    INSERT INTO public.document_files_borrowers (document_file_id, borrower_id)
    VALUES (v_doc_id, p_subject_id);
  ELSIF p_subject_type = 'guarantor' THEN
    INSERT INTO public.document_files_guarantors (document_file_id, guarantor_id)
    VALUES (v_doc_id, p_subject_id);
  END IF;

  -- 10) Return result for client to use for upload
  RETURN QUERY SELECT v_doc_id, p_storage_bucket, v_path;
END;
$$;


ALTER FUNCTION "public"."create_document_with_subject_link"("p_document_name" "text", "p_document_category_id" bigint, "p_storage_bucket" "text", "p_original_filename" "text", "p_subject_type" "text", "p_subject_id" bigint, "p_file_type" "text", "p_file_size" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."debug_jwt"() RETURNS json
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
  SELECT auth.jwt()::json;
$$;


ALTER FUNCTION "public"."debug_jwt"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."debug_list_policies"("p_table" "text") RETURNS TABLE("policyname" "text", "cmd" "text", "qual" "text", "with_check" "text")
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_catalog'
    SET "row_security" TO 'off'
    AS $$
  SELECT policyname, cmd, qual, with_check
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename = p_table
  ORDER BY policyname;
$$;


ALTER FUNCTION "public"."debug_list_policies"("p_table" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."debug_list_policies"("p_table" "text") IS 'Debug helper to list RLS policies for a table. Remove after debugging.';



CREATE OR REPLACE FUNCTION "public"."document_file_deal_ids"("p_document_file_id" bigint) RETURNS TABLE("deal_id" bigint)
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    SET "row_security" TO 'off'
    AS $$
  SELECT DISTINCT d.deal_id
  FROM (
    -- direct doc <-> deal links
    SELECT dfd.deal_id
    FROM public.document_files_deals dfd
    WHERE dfd.document_file_id = p_document_file_id

    UNION ALL

    -- doc <-> guarantor, guarantor <-> deal
    SELECT dg.deal_id
    FROM public.document_files_guarantors dfg
    JOIN public.deal_guarantors dg ON dg.guarantor_id = dfg.guarantor_id
    WHERE dfg.document_file_id = p_document_file_id

    UNION ALL

    -- doc <-> borrower, borrower <-> guarantor, guarantor <-> deal
    SELECT dg.deal_id
    FROM public.document_files_borrowers dfb
    JOIN public.guarantor g ON g.borrower_id = dfb.borrower_id
    JOIN public.deal_guarantors dg ON dg.guarantor_id = g.id
    WHERE dfb.document_file_id = p_document_file_id

    UNION ALL

    -- doc <-> property, property <-> deal
    SELECT dp.deal_id
    FROM public.document_files_properties dfp
    JOIN public.deal_property dp ON dp.property_id = dfp.property_id
    WHERE dfp.document_file_id = p_document_file_id

    UNION ALL

    -- doc <-> company, company_roles <-> deal
    SELECT cr.deal_id
    FROM public.document_files_companies dfc
    JOIN public.company_roles cr ON cr.co_id = dfc.company_id
    WHERE dfc.document_file_id = p_document_file_id
      AND cr.deal_id IS NOT NULL
  ) d;
$$;


ALTER FUNCTION "public"."document_file_deal_ids"("p_document_file_id" bigint) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."document_file_deal_ids"("p_document_file_id" bigint) IS 'Returns all deal_ids linked to a document via any path (direct, guarantor, borrower, property, company).';



CREATE OR REPLACE FUNCTION "public"."finalize_document_upload"("p_document_file_id" bigint, "p_file_size" bigint DEFAULT NULL::bigint) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    SET "row_security" TO 'off'
    AS $$
BEGIN
  -- Only the uploader can finalize their own fresh doc
  IF NOT EXISTS (
    SELECT 1 FROM public.document_files
    WHERE id = p_document_file_id
      AND uploaded_by = public.get_clerk_user_id()
      AND uploaded_at IS NULL
  ) THEN
    RAISE EXCEPTION 'Permission denied or document already finalized';
  END IF;

  UPDATE public.document_files
  SET uploaded_at = now(),
      file_size = COALESCE(p_file_size, file_size)
  WHERE id = p_document_file_id;

  RETURN true;
END;
$$;


ALTER FUNCTION "public"."finalize_document_upload"("p_document_file_id" bigint, "p_file_size" bigint) OWNER TO "postgres";


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


COMMENT ON FUNCTION "public"."format_address"("street" "text", "suite_apt" "text", "city" "text", "state" "text", "postal_code" "text", "country" "text") IS 'Format address with 6 parameters. Security: search_path fixed on 2025-11-18.';



CREATE OR REPLACE FUNCTION "public"."format_address"("po_box" "text", "street" "text", "apt_suite" "text", "city" "text", "state" "text", "postal_code" "text", "country" "text") RETURNS "text"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
DECLARE
    formatted_address text;
BEGIN
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

    RETURN formatted_address;
END;
$$;


ALTER FUNCTION "public"."format_address"("po_box" "text", "street" "text", "apt_suite" "text", "city" "text", "state" "text", "postal_code" "text", "country" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."format_address"("po_box" "text", "street" "text", "apt_suite" "text", "city" "text", "state" "text", "postal_code" "text", "country" "text") IS 'Format address with 7 parameters including PO Box. Security: search_path fixed on 2025-11-18.';



CREATE OR REPLACE FUNCTION "public"."format_deal_name"("property_id" bigint) RETURNS "text"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
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


COMMENT ON FUNCTION "public"."format_deal_name"("property_id" bigint) IS 'Format deal name from property address. Security: search_path fixed on 2025-11-18.';



CREATE OR REPLACE FUNCTION "public"."generate_tag_slug"("tag_name" "text") RETURNS "text"
    LANGUAGE "plpgsql" IMMUTABLE
    SET "search_path" TO 'public'
    AS $$
BEGIN
    -- Convert to lowercase, replace spaces with hyphens, remove special chars
    RETURN lower(regexp_replace(regexp_replace(trim(tag_name), '\s+', '-', 'g'), '[^a-z0-9\-]', '', 'g'));
END;
$$;


ALTER FUNCTION "public"."generate_tag_slug"("tag_name" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."generate_tag_slug"("tag_name" "text") IS 'Generates a URL-safe slug from a tag name for normalization';



CREATE OR REPLACE FUNCTION "public"."get_accessible_transaction_ids"() RETURNS TABLE("transaction_id" bigint)
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  -- Transactions where user is directly associated
  SELECT ti.transaction_id
  FROM bsi_transactions_investors ti
  WHERE ti.clerk_user_id = get_current_user_id()
  
  UNION
  
  -- Transactions where user's org is associated
  SELECT ti.transaction_id
  FROM bsi_transactions_investors ti
  WHERE ti.clerk_org_id = ANY(get_current_user_org_ids());
$$;


ALTER FUNCTION "public"."get_accessible_transaction_ids"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_active_org_id"() RETURNS bigint
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  -- Clerk stores the active org in 'org_id' claim when user switches orgs
  SELECT co.id
  FROM public.auth_clerk_orgs co
  WHERE co.clerk_org_id = (auth.jwt() ->> 'org_id')
  LIMIT 1;
$$;


ALTER FUNCTION "public"."get_active_org_id"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_active_org_id"() IS 'Returns the database ID of the active org from Clerk JWT org_id claim. Returns NULL if no org context.';



CREATE OR REPLACE FUNCTION "public"."get_clerk_user_id"() RETURNS "text"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
  SELECT COALESCE(
    auth.jwt() ->> 'sub',
    auth.jwt() ->> 'user_id'
  );
$$;


ALTER FUNCTION "public"."get_clerk_user_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_co_investor_org_ids"() RETURNS bigint[]
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT ARRAY_AGG(DISTINCT ti.clerk_org_id)
  FROM bsi_transactions_investors ti
  WHERE ti.transaction_id IN (SELECT transaction_id FROM get_accessible_transaction_ids())
  AND ti.clerk_org_id IS NOT NULL;
$$;


ALTER FUNCTION "public"."get_co_investor_org_ids"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_co_investor_user_ids"() RETURNS bigint[]
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT ARRAY_AGG(DISTINCT ti.clerk_user_id)
  FROM bsi_transactions_investors ti
  WHERE ti.transaction_id IN (SELECT transaction_id FROM get_accessible_transaction_ids())
  AND ti.clerk_user_id IS NOT NULL;
$$;


ALTER FUNCTION "public"."get_co_investor_user_ids"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_complete_schema"() RETURNS "jsonb"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
DECLARE
    result jsonb;
BEGIN
    -- Get all enums
    WITH enum_types AS (
        SELECT 
            t.typname as enum_name,
            array_agg(e.enumlabel ORDER BY e.enumsortorder) as enum_values
        FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
        WHERE n.nspname = 'public'
        GROUP BY t.typname
    )
    SELECT jsonb_build_object(
        'enums',
        COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'name', enum_name,
                    'values', to_jsonb(enum_values)
                )
            ),
            '[]'::jsonb
        )
    )
    FROM enum_types
    INTO result;

    -- Get all tables with their details
    WITH RECURSIVE 
    columns_info AS (
        SELECT 
            c.oid as table_oid,
            c.relname as table_name,
            a.attname as column_name,
            format_type(a.atttypid, a.atttypmod) as column_type,
            a.attnotnull as notnull,
            pg_get_expr(d.adbin, d.adrelid) as column_default,
            CASE 
                WHEN a.attidentity != '' THEN true
                WHEN pg_get_expr(d.adbin, d.adrelid) LIKE 'nextval%' THEN true
                ELSE false
            END as is_identity,
            EXISTS (
                SELECT 1 FROM pg_constraint con 
                WHERE con.conrelid = c.oid 
                AND con.contype = 'p' 
                AND a.attnum = ANY(con.conkey)
            ) as is_pk
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        LEFT JOIN pg_attribute a ON a.attrelid = c.oid
        LEFT JOIN pg_attrdef d ON d.adrelid = c.oid AND d.adnum = a.attnum
        WHERE n.nspname = 'public' 
        AND c.relkind = 'r'
        AND a.attnum > 0 
        AND NOT a.attisdropped
    ),
    fk_info AS (
        SELECT 
            c.oid as table_oid,
            jsonb_agg(
                jsonb_build_object(
                    'name', con.conname,
                    'column', col.attname,
                    'foreign_schema', fs.nspname,
                    'foreign_table', ft.relname,
                    'foreign_column', fcol.attname,
                    'on_delete', CASE con.confdeltype
                        WHEN 'a' THEN 'NO ACTION'
                        WHEN 'c' THEN 'CASCADE'
                        WHEN 'r' THEN 'RESTRICT'
                        WHEN 'n' THEN 'SET NULL'
                        WHEN 'd' THEN 'SET DEFAULT'
                        ELSE NULL
                    END
                )
            ) as foreign_keys
        FROM pg_class c
        JOIN pg_constraint con ON con.conrelid = c.oid
        JOIN pg_attribute col ON col.attrelid = con.conrelid AND col.attnum = ANY(con.conkey)
        JOIN pg_class ft ON ft.oid = con.confrelid
        JOIN pg_namespace fs ON fs.oid = ft.relnamespace
        JOIN pg_attribute fcol ON fcol.attrelid = con.confrelid AND fcol.attnum = ANY(con.confkey)
        WHERE con.contype = 'f'
        GROUP BY c.oid
    ),
    index_info AS (
        SELECT 
            c.oid as table_oid,
            jsonb_agg(
                jsonb_build_object(
                    'name', i.relname,
                    'using', am.amname,
                    'columns', (
                        SELECT jsonb_agg(a.attname ORDER BY array_position(ix.indkey, a.attnum))
                        FROM unnest(ix.indkey) WITH ORDINALITY as u(attnum, ord)
                        JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum = u.attnum
                    )
                )
            ) as indexes
        FROM pg_class c
        JOIN pg_index ix ON ix.indrelid = c.oid
        JOIN pg_class i ON i.oid = ix.indexrelid
        JOIN pg_am am ON am.oid = i.relam
        WHERE NOT ix.indisprimary
        GROUP BY c.oid
    ),
    policy_info AS (
        SELECT 
            c.oid as table_oid,
            jsonb_agg(
                jsonb_build_object(
                    'name', pol.polname,
                    'command', CASE pol.polcmd
                        WHEN 'r' THEN 'SELECT'
                        WHEN 'a' THEN 'INSERT'
                        WHEN 'w' THEN 'UPDATE'
                        WHEN 'd' THEN 'DELETE'
                        WHEN '*' THEN 'ALL'
                    END,
                    'roles', (
                        SELECT string_agg(quote_ident(r.rolname), ', ')
                        FROM pg_roles r
                        WHERE r.oid = ANY(pol.polroles)
                    ),
                    'using', pg_get_expr(pol.polqual, pol.polrelid),
                    'check', pg_get_expr(pol.polwithcheck, pol.polrelid)
                )
            ) as policies
        FROM pg_class c
        JOIN pg_policy pol ON pol.polrelid = c.oid
        GROUP BY c.oid
    ),
    trigger_info AS (
        SELECT 
            c.oid as table_oid,
            jsonb_agg(
                jsonb_build_object(
                    'name', t.tgname,
                    'timing', CASE 
                        WHEN t.tgtype & 2 = 2 THEN 'BEFORE'
                        WHEN t.tgtype & 4 = 4 THEN 'AFTER'
                        WHEN t.tgtype & 64 = 64 THEN 'INSTEAD OF'
                    END,
                    'events', (
                        CASE WHEN t.tgtype & 1 = 1 THEN 'INSERT'
                             WHEN t.tgtype & 8 = 8 THEN 'DELETE'
                             WHEN t.tgtype & 16 = 16 THEN 'UPDATE'
                             WHEN t.tgtype & 32 = 32 THEN 'TRUNCATE'
                        END
                    ),
                    'statement', pg_get_triggerdef(t.oid)
                )
            ) as triggers
        FROM pg_class c
        JOIN pg_trigger t ON t.tgrelid = c.oid
        WHERE NOT t.tgisinternal
        GROUP BY c.oid
    ),
    table_info AS (
        SELECT DISTINCT 
            c.table_oid,
            c.table_name,
            jsonb_agg(
                jsonb_build_object(
                    'name', c.column_name,
                    'type', c.column_type,
                    'notnull', c.notnull,
                    'default', c.column_default,
                    'identity', c.is_identity,
                    'is_pk', c.is_pk
                ) ORDER BY c.column_name
            ) as columns,
            COALESCE(fk.foreign_keys, '[]'::jsonb) as foreign_keys,
            COALESCE(i.indexes, '[]'::jsonb) as indexes,
            COALESCE(p.policies, '[]'::jsonb) as policies,
            COALESCE(t.triggers, '[]'::jsonb) as triggers
        FROM columns_info c
        LEFT JOIN fk_info fk ON fk.table_oid = c.table_oid
        LEFT JOIN index_info i ON i.table_oid = c.table_oid
        LEFT JOIN policy_info p ON p.table_oid = c.table_oid
        LEFT JOIN trigger_info t ON t.table_oid = c.table_oid
        GROUP BY c.table_oid, c.table_name, fk.foreign_keys, i.indexes, p.policies, t.triggers
    )
    SELECT result || jsonb_build_object(
        'tables',
        COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'name', table_name,
                    'columns', columns,
                    'foreign_keys', foreign_keys,
                    'indexes', indexes,
                    'policies', policies,
                    'triggers', triggers
                )
            ),
            '[]'::jsonb
        )
    )
    FROM table_info
    INTO result;

    -- Get all functions
    WITH function_info AS (
        SELECT 
            p.proname AS name,
            pg_get_functiondef(p.oid) AS definition
        FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'public'
        AND p.prokind = 'f'
    )
    SELECT result || jsonb_build_object(
        'functions',
        COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'name', name,
                    'definition', definition
                )
            ),
            '[]'::jsonb
        )
    )
    FROM function_info
    INTO result;

    RETURN result;
END;
$$;


ALTER FUNCTION "public"."get_complete_schema"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_complete_schema"() IS 'Returns complete schema information as JSON. Security: search_path fixed on 2025-11-18.';



CREATE OR REPLACE FUNCTION "public"."get_current_user_id"() RETURNS bigint
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT id FROM auth_clerk_users 
  WHERE clerk_user_id = (auth.jwt() ->> 'sub'::text)
  LIMIT 1;
$$;


ALTER FUNCTION "public"."get_current_user_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_current_user_org_ids"() RETURNS bigint[]
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT ARRAY_AGG(m.clerk_org_id)
  FROM auth_clerk_orgs_members m
  JOIN auth_clerk_users u ON u.id = m.auth_clerk_users_id
  WHERE u.clerk_user_id = (auth.jwt() ->> 'sub'::text);
$$;


ALTER FUNCTION "public"."get_current_user_org_ids"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."document_files" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "document_name" "text",
    "public_notes" "text",
    "private_notes" "text",
    "document_status" "public"."document_status",
    "effective_date" "date",
    "expiration_date" "date",
    "is_required" boolean,
    "uploaded_by" "text",
    "uploaded_at" timestamp with time zone,
    "file_size" bigint,
    "file_type" "text",
    "storage_bucket" "text",
    "storage_path" "text",
    "tags" "text"[] DEFAULT ARRAY[]::"text"[],
    "period_start" "date",
    "period_end" "date",
    "document_category_id" bigint
);


ALTER TABLE "public"."document_files" OWNER TO "postgres";


COMMENT ON TABLE "public"."document_files" IS 'Storing documents used for loans';



COMMENT ON COLUMN "public"."document_files"."document_name" IS 'document name';



COMMENT ON COLUMN "public"."document_files"."is_required" IS 'Is the document a required document?';



COMMENT ON COLUMN "public"."document_files"."storage_bucket" IS 'Supabase storage bucket name (e.g., investors, transaction-documents)';



COMMENT ON COLUMN "public"."document_files"."storage_path" IS 'Full path within the storage bucket';



COMMENT ON COLUMN "public"."document_files"."tags" IS 'DEPRECATED: Use document_files_tags junction table instead. This column will be removed in a future migration.';



COMMENT ON COLUMN "public"."document_files"."period_start" IS 'Start date of the period covered by this document (e.g., first day of statement period)';



COMMENT ON COLUMN "public"."document_files"."period_end" IS 'End date of the period covered by this document (e.g., last day of statement period)';



CREATE OR REPLACE FUNCTION "public"."get_deal_documents"("p_deal_id" bigint) RETURNS SETOF "public"."document_files"
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public'
    AS $$
  SELECT df.*
  FROM public.document_files df
  JOIN public.deal_document_participants ddp
    ON ddp.document_file_id = df.id
  WHERE ddp.deal_id = p_deal_id
  ORDER BY df.created_at DESC;
$$;


ALTER FUNCTION "public"."get_deal_documents"("p_deal_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_deal_documents_with_sources"("p_deal_id" bigint) RETURNS TABLE("document_file_id" bigint, "document_name" "text", "storage_bucket" "text", "storage_path" "text", "created_at" timestamp with time zone, "sources" "text"[])
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public'
    AS $$
  SELECT
    df.id,
    df.document_name,
    df.storage_bucket,
    df.storage_path,
    df.created_at,
    array_agg(DISTINCT ddp.source_table ORDER BY ddp.source_table) AS sources
  FROM public.document_files df
  JOIN public.deal_document_participants ddp
    ON ddp.document_file_id = df.id
  WHERE ddp.deal_id = p_deal_id
  GROUP BY df.id, df.document_name, df.storage_bucket, df.storage_path, df.created_at
  ORDER BY df.created_at DESC;
$$;


ALTER FUNCTION "public"."get_deal_documents_with_sources"("p_deal_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_effective_role"("p_org_id" bigint DEFAULT NULL::bigint) RETURNS "text"
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_role text;
  v_clerk_user_id text;
  v_active_org_id bigint;
BEGIN
  -- Get current user's Clerk ID
  v_clerk_user_id := public.get_clerk_user_id();
  
  IF v_clerk_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Determine org context: use provided org_id, or get from JWT
  v_active_org_id := COALESCE(p_org_id, public.get_active_org_id());

  IF v_active_org_id IS NOT NULL THEN
    -- Org context: look up clerk_member_role
    SELECT com.clerk_member_role INTO v_role
    FROM public.auth_clerk_orgs_members com
    JOIN public.auth_clerk_users acu ON com.auth_clerk_users_id = acu.id
    WHERE acu.clerk_user_id = v_clerk_user_id
      AND com.clerk_org_id = v_active_org_id;
    
    -- If found org membership with role, return it
    IF v_role IS NOT NULL THEN
      RETURN v_role;
    END IF;
  END IF;

  -- Fallback: Personal context - use personal_role
  SELECT acu.personal_role INTO v_role
  FROM public.auth_clerk_users acu
  WHERE acu.clerk_user_id = v_clerk_user_id;
  
  RETURN v_role;
END;
$$;


ALTER FUNCTION "public"."get_effective_role"("p_org_id" bigint) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_effective_role"("p_org_id" bigint) IS 'Returns user role based on context. If org_id provided (or in JWT), returns clerk_member_role. Falls back to personal_role.';



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


CREATE OR REPLACE FUNCTION "public"."get_table_scope"("p_table_name" "text", "p_action" "text", "p_org_id" bigint DEFAULT NULL::bigint) RETURNS "text"
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_role text;
  v_scope text;
BEGIN
  -- Admins get 'all' scope
  IF public.is_admin() THEN
    RETURN 'all';
  END IF;
  
  v_role := public.get_effective_role(p_org_id);
  
  SELECT rp.scope_type INTO v_scope
  FROM public.rbac_permissions rp
  WHERE rp.role = v_role
    AND rp.resource_type = 'table'
    AND rp.resource_name = p_table_name
    AND rp.is_active = true
    AND (
      (p_action = 'select' AND rp.can_select) OR
      (p_action = 'insert' AND rp.can_insert) OR
      (p_action = 'update' AND rp.can_update) OR
      (p_action = 'delete' AND rp.can_delete)
    )
  ORDER BY rp.priority
  LIMIT 1;
  
  RETURN v_scope;
END;
$$;


ALTER FUNCTION "public"."get_table_scope"("p_table_name" "text", "p_action" "text", "p_org_id" bigint) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_table_scope"("p_table_name" "text", "p_action" "text", "p_org_id" bigint) IS 'Returns the scope_type for a given table/action. Used for row-level filtering.';



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


CREATE OR REPLACE FUNCTION "public"."get_user_org_ids"() RETURNS "text"[]
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT COALESCE(
    ARRAY_AGG(co.clerk_org_id::text),
    ARRAY[]::TEXT[]
  )
  FROM public.auth_clerk_orgs_members com
  JOIN public.auth_clerk_orgs co ON com.clerk_org_id = co.id
  JOIN public.auth_clerk_users cu ON com.auth_clerk_users_id = cu.id
  WHERE cu.clerk_user_id = public.get_clerk_user_id();
$$;


ALTER FUNCTION "public"."get_user_org_ids"() OWNER TO "postgres";


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
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF NEW.property_id IS NOT NULL THEN
    NEW.deal_name := public.format_deal_name(NEW.property_id);
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_deal_changes"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."handle_deal_changes"() IS 'Trigger function to update deal_name when property changes. Security: search_path fixed on 2025-11-18.';



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


CREATE OR REPLACE FUNCTION "public"."has_permission"("p_required_role" "text") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT 
    -- Internal admins can do everything
    public.is_internal_admin()
    OR
    -- Check if effective role matches
    public.get_effective_role() = p_required_role;
$$;


ALTER FUNCTION "public"."has_permission"("p_required_role" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."has_permission"("p_required_role" "text") IS 'Check if current user has the required role (internal admins always pass)';



CREATE OR REPLACE FUNCTION "public"."has_role"("p_role" "text", "p_org_id" bigint DEFAULT NULL::bigint) RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT public.get_effective_role(p_org_id) = p_role;
$$;


ALTER FUNCTION "public"."has_role"("p_role" "text", "p_org_id" bigint) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."has_role"("p_role" "text", "p_org_id" bigint) IS 'Check if current user has the specified role in the given context (org or personal)';



CREATE OR REPLACE FUNCTION "public"."has_storage_permission"("p_bucket_name" "text", "p_action" "text") RETURNS boolean
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_role text;
  v_has_permission boolean := false;
BEGIN
  IF public.is_admin() THEN
    RETURN true;
  END IF;
  
  v_role := public.get_effective_role();
  
  SELECT true INTO v_has_permission
  FROM public.rbac_permissions rp
  WHERE rp.role = v_role
    AND rp.resource_type = 'storage_bucket'
    AND rp.resource_name = p_bucket_name
    AND rp.is_active = true
    AND (
      (p_action = 'select' AND rp.can_select) OR
      (p_action = 'insert' AND rp.can_insert) OR
      (p_action = 'update' AND rp.can_update) OR
      (p_action = 'delete' AND rp.can_delete)
    )
  LIMIT 1;
  
  RETURN COALESCE(v_has_permission, false);
END;
$$;


ALTER FUNCTION "public"."has_storage_permission"("p_bucket_name" "text", "p_action" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."has_storage_permission"("p_bucket_name" "text", "p_action" "text") IS 'Permission check for storage buckets. Consults rbac_permissions.';



CREATE OR REPLACE FUNCTION "public"."has_table_permission"("p_table_name" "text", "p_action" "text", "p_org_id" bigint DEFAULT NULL::bigint) RETURNS boolean
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_role text;
  v_has_permission boolean := false;
BEGIN
  -- Internal admins bypass all permission checks
  IF public.is_admin() THEN
    RETURN true;
  END IF;
  
  -- Get the user's effective role based on context
  v_role := public.get_effective_role(p_org_id);
  
  IF v_role IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check permission matrix for exact match
  SELECT true INTO v_has_permission
  FROM public.rbac_permissions rp
  WHERE rp.role = v_role
    AND rp.resource_type = 'table'
    AND rp.resource_name = p_table_name
    AND rp.is_active = true
    AND (
      (p_action = 'select' AND rp.can_select) OR
      (p_action = 'insert' AND rp.can_insert) OR
      (p_action = 'update' AND rp.can_update) OR
      (p_action = 'delete' AND rp.can_delete)
    )
  LIMIT 1;
  
  RETURN COALESCE(v_has_permission, false);
END;
$$;


ALTER FUNCTION "public"."has_table_permission"("p_table_name" "text", "p_action" "text", "p_org_id" bigint) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."has_table_permission"("p_table_name" "text", "p_action" "text", "p_org_id" bigint) IS 'Universal permission check. Consults rbac_permissions table to determine if user has specified action on table.';



CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.auth_clerk_users
    WHERE clerk_user_id = public.get_clerk_user_id()
    AND personal_role = 'admin'
    AND is_internal_yn = true
  );
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."is_admin"() IS 'Returns true if user has personal_role=admin AND is_internal_yn=true. Equivalent to is_internal_admin().';



CREATE OR REPLACE FUNCTION "public"."is_internal_admin"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.auth_clerk_users
    WHERE clerk_user_id = public.get_clerk_user_id()
    AND personal_role = 'admin'
    AND is_internal_yn = true
  );
$$;


ALTER FUNCTION "public"."is_internal_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_org_admin"("p_org_id" bigint DEFAULT NULL::bigint) RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.auth_clerk_orgs_members com
    JOIN public.auth_clerk_users acu ON com.auth_clerk_users_id = acu.id
    WHERE acu.clerk_user_id = public.get_clerk_user_id()
      AND com.clerk_org_id = COALESCE(p_org_id, public.get_active_org_id())
      AND com.clerk_org_role = 'admin'
  );
$$;


ALTER FUNCTION "public"."is_org_admin"("p_org_id" bigint) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."is_org_admin"("p_org_id" bigint) IS 'Returns true if user is admin of specified org. Returns false (not NULL) when p_org_id is NULL.';



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


CREATE OR REPLACE FUNCTION "public"."refresh_deal_document_participants"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    SET "row_security" TO 'off'
    AS $$
BEGIN
  -- Only internal admins can run this
  IF NOT public.is_internal_admin() THEN
    RAISE EXCEPTION 'Permission denied: internal admin only';
  END IF;

  -- Clear and rebuild
  TRUNCATE TABLE public.deal_document_participants;

  -- Direct deal links
  INSERT INTO public.deal_document_participants (deal_id, document_file_id, source_table, source_pk)
  SELECT deal_id, document_file_id, 'document_files_deals', id
  FROM public.document_files_deals
  ON CONFLICT DO NOTHING;

  -- Guarantor path
  INSERT INTO public.deal_document_participants (deal_id, document_file_id, source_table, source_pk)
  SELECT dg.deal_id, dfg.document_file_id, 'document_files_guarantors', dfg.id
  FROM public.document_files_guarantors dfg
  JOIN public.deal_guarantors dg ON dg.guarantor_id = dfg.guarantor_id
  ON CONFLICT DO NOTHING;

  -- Borrower path
  INSERT INTO public.deal_document_participants (deal_id, document_file_id, source_table, source_pk)
  SELECT dg.deal_id, dfb.document_file_id, 'document_files_borrowers', dfb.id
  FROM public.document_files_borrowers dfb
  JOIN public.guarantor g ON g.borrower_id = dfb.borrower_id
  JOIN public.deal_guarantors dg ON dg.guarantor_id = g.id
  ON CONFLICT DO NOTHING;

  -- Property path
  INSERT INTO public.deal_document_participants (deal_id, document_file_id, source_table, source_pk)
  SELECT dp.deal_id, dfp.document_file_id, 'document_files_properties', dfp.id
  FROM public.document_files_properties dfp
  JOIN public.deal_property dp ON dp.property_id = dfp.property_id
  ON CONFLICT DO NOTHING;

  -- Company path
  INSERT INTO public.deal_document_participants (deal_id, document_file_id, source_table, source_pk)
  SELECT cr.deal_id, dfc.document_file_id, 'document_files_companies', dfc.id
  FROM public.document_files_companies dfc
  JOIN public.company_roles cr ON cr.co_id = dfc.company_id
  WHERE cr.deal_id IS NOT NULL
  ON CONFLICT DO NOTHING;
END;
$$;


ALTER FUNCTION "public"."refresh_deal_document_participants"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."reset_org_document_permissions"("p_org_id" bigint) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    SET "row_security" TO 'off'
    AS $$
BEGIN
  -- Only org admins or internal admins can reset
  IF NOT (public.is_internal_admin() OR public.is_org_admin(p_org_id)) THEN
    RAISE EXCEPTION 'Permission denied: must be org admin or internal admin';
  END IF;

  -- Delete existing permissions for this org
  DELETE FROM public.document_access_permissions
  WHERE clerk_org_id = p_org_id;

  -- Re-seed from template
  PERFORM public.seed_document_access_permissions_for_org(p_org_id);
END;
$$;


ALTER FUNCTION "public"."reset_org_document_permissions"("p_org_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."seed_document_access_permissions_for_org"("p_org_id" bigint) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    SET "row_security" TO 'off'
    AS $$
BEGIN
  -- Only seed if the global template table exists
  IF to_regclass('public.document_access_permissions_global') IS NOT NULL THEN
    INSERT INTO public.document_access_permissions
      (clerk_org_id, deal_role_types_id, document_categories_id, can_view, can_insert, can_upload, can_delete, created_at)
    SELECT
      p_org_id,
      g.deal_role_types_id,
      g.document_categories_id,
      g.can_view,
      g.can_insert,
      g.can_upload,
      g.can_delete,
      now()
    FROM public.document_access_permissions_global g
    ON CONFLICT (clerk_org_id, deal_role_types_id, document_categories_id) DO NOTHING;
  END IF;
END;
$$;


ALTER FUNCTION "public"."seed_document_access_permissions_for_org"("p_org_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_matched_api_brex_transfers_to_bsi_transactions"() RETURNS TABLE("inserted_count" bigint, "updated_count" bigint, "error_count" bigint, "errors" "jsonb")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    v_inserted_count bigint := 0;
    v_updated_count bigint := 0;
    v_error_count bigint := 0;
    v_errors jsonb := '[]'::jsonb;
    v_transfer_record RECORD;
    v_transaction_id bigint;
    v_existing_transaction_id bigint;
    v_error_message text;
    v_transaction_method text;
    v_transaction_status text;
    v_ledger_entry_type text;
    v_fed_reference_number text;
    v_amount_dollars numeric;
BEGIN
    -- Loop through all transfers that are matched to vendors via junction table
    FOR v_transfer_record IN
        SELECT DISTINCT
            at.id as transfer_db_id,
            at.brex_transfer_id,
            at.amount,
            at.amount_cents,
            at.process_date,
            at.status,
            at.external_memo,
            at.payment_type,
            at.fed_reference_number,
            at.raw_payload,
            atv.brex_vendor_id as matched_vendor_id,
            -- Get matched clerk_user_id from the vendor
            (SELECT avcu.clerk_user_id 
             FROM api_brex_vendors_clerk_users avcu
             WHERE avcu.brex_vendor_id = atv.brex_vendor_id
             LIMIT 1) as clerk_user_id,
            -- Get matched clerk_org_id from the vendor
            (SELECT avco.clerk_org_id 
             FROM api_brex_vendors_clerk_orgs avco
             WHERE avco.brex_vendor_id = atv.brex_vendor_id
             LIMIT 1) as clerk_org_id
        FROM api_brex_transfers at
        -- Join with junction table to get vendor match
        INNER JOIN api_brex_transfers_vendors atv ON atv.brex_transfer_id = at.brex_transfer_id
        -- IMPORTANT: Only process active matches (not soft-deleted)
        WHERE atv.deleted_at IS NULL
        -- Only process if vendor has clerk match (user or org)
        AND (
            EXISTS (
                SELECT 1 FROM api_brex_vendors_clerk_users avcu
                WHERE avcu.brex_vendor_id = atv.brex_vendor_id
            )
            OR EXISTS (
                SELECT 1 FROM api_brex_vendors_clerk_orgs avco
                WHERE avco.brex_vendor_id = atv.brex_vendor_id
            )
        )
    LOOP
        BEGIN
            -- Extract fed_reference_number
            v_fed_reference_number := COALESCE(
                v_transfer_record.fed_reference_number,
                (v_transfer_record.raw_payload->'counterparty'->>'fed_reference_number')::text
            );

            -- Convert amount from cents to dollars
            IF v_transfer_record.amount_cents IS NOT NULL THEN
                v_amount_dollars := v_transfer_record.amount_cents / 100.0;
            ELSIF v_transfer_record.amount IS NOT NULL THEN
                v_amount_dollars := v_transfer_record.amount / 100.0;
            ELSE
                v_amount_dollars := NULL;
            END IF;
            
            -- Determine ledger_entry_type based on direction (from investor perspective)
            -- Negative = money sent out (contribution/investment)
            -- Positive = money received back (distribution/return)
            IF v_amount_dollars IS NOT NULL THEN
                IF v_amount_dollars < 0 THEN
                    v_ledger_entry_type := 'contribution';
                ELSE
                    v_ledger_entry_type := 'distribution';
                END IF;
            ELSE
                v_ledger_entry_type := 'contribution';
            END IF;

            -- Map payment_type to transaction_method
            CASE v_transfer_record.payment_type
                WHEN 'ACH' THEN v_transaction_method := 'ach';
                WHEN 'DOMESTIC_WIRE' THEN v_transaction_method := 'wire';
                WHEN 'INTERNATIONAL_WIRE' THEN v_transaction_method := 'wire';
                WHEN 'CHEQUE' THEN v_transaction_method := 'check';
                ELSE v_transaction_method := 'other';
            END CASE;

            -- Map status to transaction_status
            CASE UPPER(TRIM(v_transfer_record.status))
                WHEN 'PROCESSING' THEN v_transaction_status := 'processing';
                WHEN 'COMPLETED' THEN v_transaction_status := 'completed';
                WHEN 'FAILED' THEN v_transaction_status := 'failed';
                WHEN 'CANCELLED', 'CANCELED' THEN v_transaction_status := 'canceled';
                WHEN 'PENDING' THEN v_transaction_status := 'pending';
                WHEN 'SCHEDULED' THEN v_transaction_status := 'scheduled';
                WHEN 'INITIATED' THEN v_transaction_status := 'initiated';
                WHEN 'PROCESSED' THEN v_transaction_status := 'processed';
                ELSE 
                    v_transaction_status := COALESCE(
                        LOWER((v_transfer_record.raw_payload->>'status')::text),
                        'pending'
                    );
            END CASE;

            -- Check if transaction already exists via junction table
            SELECT t.id INTO v_existing_transaction_id
            FROM bsi_transactions t
            JOIN bsi_transactions_api_brex_transfers btbt ON btbt.transaction_id = t.id
            WHERE btbt.brex_transfer_id = v_transfer_record.brex_transfer_id;

            IF v_existing_transaction_id IS NOT NULL THEN
                -- UPDATE existing transaction with latest Brex data
                -- Use ABS() because transaction_amount must be positive (direction is in ledger_entry_type)
                -- Also update clerk_user_id and clerk_org_id in case they were missing
                UPDATE bsi_transactions SET
                    transaction_amount = ABS(v_amount_dollars),
                    transaction_status = v_transaction_status::transaction_status,
                    transaction_date = COALESCE(v_transfer_record.process_date::timestamp with time zone, transaction_date),
                    ledger_entry_type = v_ledger_entry_type::ledger_entry_type,
                    clerk_user_id = COALESCE(clerk_user_id, v_transfer_record.clerk_user_id),
                    clerk_org_id = COALESCE(clerk_org_id, v_transfer_record.clerk_org_id),
                    updated_at = NOW()
                WHERE id = v_existing_transaction_id;
                
                v_updated_count := v_updated_count + 1;
            ELSE
                -- INSERT new transaction
                -- Use ABS() because transaction_amount must be positive (direction is in ledger_entry_type)
                -- FIX: Include clerk_user_id and clerk_org_id directly on the transaction
                INSERT INTO bsi_transactions (
                    transaction_amount,
                    transaction_date,
                    transaction_method,
                    transaction_status,
                    reference_number,
                    external_memo,
                    ledger_entry_type,
                    clerk_user_id,
                    clerk_org_id,
                    created_at,
                    updated_at
                )
                VALUES (
                    ABS(v_amount_dollars),
                    COALESCE(v_transfer_record.process_date::timestamp with time zone, NOW()),
                    v_transaction_method::transaction_method,
                    v_transaction_status::transaction_status,
                    v_fed_reference_number,
                    v_transfer_record.external_memo,
                    v_ledger_entry_type::ledger_entry_type,
                    v_transfer_record.clerk_user_id,
                    v_transfer_record.clerk_org_id,
                    NOW(),
                    NOW()
                )
                RETURNING id INTO v_transaction_id;

                -- Create investor allocation if clerk match exists
                -- allocation_amount must be positive (absolute value)
                IF v_transfer_record.clerk_user_id IS NOT NULL THEN
                    INSERT INTO bsi_transactions_investors (
                        transaction_id,
                        clerk_user_id,
                        clerk_org_id,
                        allocation_amount,
                        created_at
                    )
                    VALUES (
                        v_transaction_id,
                        v_transfer_record.clerk_user_id,
                        v_transfer_record.clerk_org_id,
                        ABS(v_amount_dollars),
                        NOW()
                    );
                END IF;

                -- Create junction table record linking transaction to transfer
                INSERT INTO bsi_transactions_api_brex_transfers (
                    transaction_id,
                    brex_transfer_id,
                    created_at
                )
                VALUES (
                    v_transaction_id,
                    v_transfer_record.brex_transfer_id,
                    NOW()
                );

                v_inserted_count := v_inserted_count + 1;
            END IF;

        EXCEPTION WHEN OTHERS THEN
            v_error_count := v_error_count + 1;
            v_error_message := SQLERRM;
            v_errors := v_errors || jsonb_build_object(
                'brex_transfer_id', v_transfer_record.brex_transfer_id,
                'error', v_error_message
            );
        END;
    END LOOP;

    RETURN QUERY SELECT v_inserted_count, v_updated_count, v_error_count, v_errors;
END;
$$;


ALTER FUNCTION "public"."sync_matched_api_brex_transfers_to_bsi_transactions"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."sync_matched_api_brex_transfers_to_bsi_transactions"() IS 'Syncs matched Brex transfers to bsi_transactions. Uses ABS() for transaction_amount since the table requires positive values. Direction is captured via ledger_entry_type: negative Brex amounts = contribution, positive = distribution.';



CREATE OR REPLACE FUNCTION "public"."sync_transaction_to_investors"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Only create investor record if clerk_user_id or clerk_org_id is set on the transaction
  IF NEW.clerk_user_id IS NOT NULL OR NEW.clerk_org_id IS NOT NULL THEN
    -- Check if record already exists for this transaction
    IF NOT EXISTS (
      SELECT 1 FROM bsi_transactions_investors 
      WHERE transaction_id = NEW.id
    ) THEN
      INSERT INTO bsi_transactions_investors (
        transaction_id,
        clerk_user_id,
        clerk_org_id,
        allocation_amount,
        created_at
      ) VALUES (
        NEW.id,
        NEW.clerk_user_id,
        NEW.clerk_org_id,
        NEW.transaction_amount,
        NOW()
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."sync_transaction_to_investors"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_transaction_to_investors_on_update"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Only act if clerk_user_id or clerk_org_id changed from NULL to a value
  IF (OLD.clerk_user_id IS NULL AND NEW.clerk_user_id IS NOT NULL) OR 
     (OLD.clerk_org_id IS NULL AND NEW.clerk_org_id IS NOT NULL) THEN
    -- Check if record already exists
    IF NOT EXISTS (
      SELECT 1 FROM bsi_transactions_investors 
      WHERE transaction_id = NEW.id
    ) THEN
      INSERT INTO bsi_transactions_investors (
        transaction_id,
        clerk_user_id,
        clerk_org_id,
        allocation_amount,
        created_at
      ) VALUES (
        NEW.id,
        NEW.clerk_user_id,
        NEW.clerk_org_id,
        NEW.transaction_amount,
        NOW()
      );
    ELSE
      -- Update existing record if it exists but has NULL values
      UPDATE bsi_transactions_investors
      SET 
        clerk_user_id = COALESCE(clerk_user_id, NEW.clerk_user_id),
        clerk_org_id = COALESCE(clerk_org_id, NEW.clerk_org_id)
      WHERE transaction_id = NEW.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."sync_transaction_to_investors_on_update"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."tg_set_updated_at_document_access_permissions"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by_user_id = public.get_current_user_id();
  NEW.updated_by_clerk_sub = public.get_clerk_user_id();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."tg_set_updated_at_document_access_permissions"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trg_ddp_from_company_roles"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    SET "row_security" TO 'off'
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.deal_id IS NOT NULL THEN
      INSERT INTO public.deal_document_participants (deal_id, document_file_id, source_table, source_pk)
      SELECT NEW.deal_id, dfc.document_file_id, 'document_files_companies', dfc.id
      FROM public.document_files_companies dfc
      WHERE dfc.company_id = NEW.co_id
      ON CONFLICT DO NOTHING;
    END IF;
    RETURN NEW;

  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.deal_id IS NOT NULL THEN
      DELETE FROM public.deal_document_participants ddp
      WHERE ddp.deal_id = OLD.deal_id
        AND ddp.source_table = 'document_files_companies'
        AND ddp.source_pk IN (
          SELECT dfc.id
          FROM public.document_files_companies dfc
          WHERE dfc.company_id = OLD.co_id
        );
    END IF;
    RETURN OLD;

  ELSIF TG_OP = 'UPDATE' THEN
    -- remove old deal mapping if deal_id changed or company changed
    IF OLD.deal_id IS NOT NULL AND (OLD.deal_id IS DISTINCT FROM NEW.deal_id OR OLD.co_id IS DISTINCT FROM NEW.co_id) THEN
      DELETE FROM public.deal_document_participants ddp
      WHERE ddp.deal_id = OLD.deal_id
        AND ddp.source_table = 'document_files_companies'
        AND ddp.source_pk IN (
          SELECT dfc.id
          FROM public.document_files_companies dfc
          WHERE dfc.company_id = OLD.co_id
        );
    END IF;

    -- add new mapping
    IF NEW.deal_id IS NOT NULL THEN
      INSERT INTO public.deal_document_participants (deal_id, document_file_id, source_table, source_pk)
      SELECT NEW.deal_id, dfc.document_file_id, 'document_files_companies', dfc.id
      FROM public.document_files_companies dfc
      WHERE dfc.company_id = NEW.co_id
      ON CONFLICT DO NOTHING;
    END IF;

    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."trg_ddp_from_company_roles"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trg_ddp_from_deal_guarantors"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    SET "row_security" TO 'off'
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- docs directly linked to this guarantor
    INSERT INTO public.deal_document_participants (deal_id, document_file_id, source_table, source_pk)
    SELECT NEW.deal_id, dfg.document_file_id, 'document_files_guarantors', dfg.id
    FROM public.document_files_guarantors dfg
    WHERE dfg.guarantor_id = NEW.guarantor_id
    ON CONFLICT DO NOTHING;

    -- docs linked to the borrower of this guarantor
    INSERT INTO public.deal_document_participants (deal_id, document_file_id, source_table, source_pk)
    SELECT NEW.deal_id, dfb.document_file_id, 'document_files_borrowers', dfb.id
    FROM public.guarantor g
    JOIN public.document_files_borrowers dfb
      ON dfb.borrower_id = g.borrower_id
    WHERE g.id = NEW.guarantor_id
    ON CONFLICT DO NOTHING;

    RETURN NEW;

  ELSIF TG_OP = 'DELETE' THEN
    -- remove guarantor-linked ddp rows for this deal
    DELETE FROM public.deal_document_participants ddp
    WHERE ddp.deal_id = OLD.deal_id
      AND ddp.source_table = 'document_files_guarantors'
      AND ddp.source_pk IN (
        SELECT dfg.id
        FROM public.document_files_guarantors dfg
        WHERE dfg.guarantor_id = OLD.guarantor_id
      );

    -- remove borrower-linked ddp rows for this deal (borrower derived via this guarantor)
    DELETE FROM public.deal_document_participants ddp
    WHERE ddp.deal_id = OLD.deal_id
      AND ddp.source_table = 'document_files_borrowers'
      AND ddp.source_pk IN (
        SELECT dfb.id
        FROM public.guarantor g
        JOIN public.document_files_borrowers dfb
          ON dfb.borrower_id = g.borrower_id
        WHERE g.id = OLD.guarantor_id
      );

    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."trg_ddp_from_deal_guarantors"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trg_ddp_from_deal_property"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    SET "row_security" TO 'off'
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.deal_document_participants (deal_id, document_file_id, source_table, source_pk)
    SELECT NEW.deal_id, dfp.document_file_id, 'document_files_properties', dfp.id
    FROM public.document_files_properties dfp
    WHERE dfp.property_id = NEW.property_id
    ON CONFLICT DO NOTHING;

    RETURN NEW;

  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM public.deal_document_participants ddp
    WHERE ddp.deal_id = OLD.deal_id
      AND ddp.source_table = 'document_files_properties'
      AND ddp.source_pk IN (
        SELECT dfp.id
        FROM public.document_files_properties dfp
        WHERE dfp.property_id = OLD.property_id
      );

    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."trg_ddp_from_deal_property"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trg_ddp_from_document_files_borrowers"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    SET "row_security" TO 'off'
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.deal_document_participants (deal_id, document_file_id, source_table, source_pk)
    SELECT dg.deal_id, NEW.document_file_id, 'document_files_borrowers', NEW.id
    FROM public.guarantor g
    JOIN public.deal_guarantors dg ON dg.guarantor_id = g.id
    WHERE g.borrower_id = NEW.borrower_id
    ON CONFLICT DO NOTHING;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM public.deal_document_participants
    WHERE document_file_id = OLD.document_file_id
      AND source_table = 'document_files_borrowers'
      AND source_pk = OLD.id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."trg_ddp_from_document_files_borrowers"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trg_ddp_from_document_files_companies"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    SET "row_security" TO 'off'
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.deal_document_participants (deal_id, document_file_id, source_table, source_pk)
    SELECT cr.deal_id, NEW.document_file_id, 'document_files_companies', NEW.id
    FROM public.company_roles cr
    WHERE cr.co_id = NEW.company_id
      AND cr.deal_id IS NOT NULL
    ON CONFLICT DO NOTHING;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM public.deal_document_participants
    WHERE document_file_id = OLD.document_file_id
      AND source_table = 'document_files_companies'
      AND source_pk = OLD.id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."trg_ddp_from_document_files_companies"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trg_ddp_from_document_files_deals"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    SET "row_security" TO 'off'
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.deal_document_participants (deal_id, document_file_id, source_table, source_pk)
    VALUES (NEW.deal_id, NEW.document_file_id, 'document_files_deals', NEW.id)
    ON CONFLICT DO NOTHING;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM public.deal_document_participants
    WHERE deal_id = OLD.deal_id
      AND document_file_id = OLD.document_file_id
      AND source_table = 'document_files_deals'
      AND source_pk = OLD.id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."trg_ddp_from_document_files_deals"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trg_ddp_from_document_files_guarantors"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    SET "row_security" TO 'off'
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.deal_document_participants (deal_id, document_file_id, source_table, source_pk)
    SELECT dg.deal_id, NEW.document_file_id, 'document_files_guarantors', NEW.id
    FROM public.deal_guarantors dg
    WHERE dg.guarantor_id = NEW.guarantor_id
    ON CONFLICT DO NOTHING;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM public.deal_document_participants
    WHERE document_file_id = OLD.document_file_id
      AND source_table = 'document_files_guarantors'
      AND source_pk = OLD.id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."trg_ddp_from_document_files_guarantors"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trg_ddp_from_document_files_properties"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    SET "row_security" TO 'off'
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.deal_document_participants (deal_id, document_file_id, source_table, source_pk)
    SELECT dp.deal_id, NEW.document_file_id, 'document_files_properties', NEW.id
    FROM public.deal_property dp
    WHERE dp.property_id = NEW.property_id
    ON CONFLICT DO NOTHING;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM public.deal_document_participants
    WHERE document_file_id = OLD.document_file_id
      AND source_table = 'document_files_properties'
      AND source_pk = OLD.id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."trg_ddp_from_document_files_properties"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_document_tags_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_document_tags_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_property_address"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
DECLARE 
  new_address text;
BEGIN
  IF length(NEW.address_state_long::text) > 2 THEN
    NEW.address_state := public.get_state_code(NEW.address_state_long::text);
  END IF;

  new_address := public.format_address(NEW.address_street, NEW.address_suite_apt, NEW.address_city, NEW.address_state::text, NEW.address_postal_code, null);
  
  NEW.address = new_address;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_property_address"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."update_property_address"() IS 'Trigger function to format and update property address. Security: search_path fixed on 2025-11-18.';



CREATE OR REPLACE FUNCTION "public"."user_has_transaction_access"("transaction_id_param" bigint) RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.auth_clerk_users acu
    WHERE acu.clerk_user_id = (auth.jwt() ->> 'sub'::text)
    AND (
      EXISTS (
        SELECT 1 FROM public.bsi_transactions_investors bti
        WHERE bti.transaction_id = transaction_id_param
        AND bti.clerk_user_id = acu.id
      )
      OR
      EXISTS (
        SELECT 1 FROM public.bsi_transactions_deals btd
        JOIN public.bsi_deals bd ON btd.deal_id = bd.deal_id
        WHERE btd.transaction_id = transaction_id_param
        AND bd.auth_clerk_users_id = acu.id
      )
    )
  );
$$;


ALTER FUNCTION "public"."user_has_transaction_access"("transaction_id_param" bigint) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."user_has_transaction_access"("transaction_id_param" bigint) IS 'Check if current user has access to a specific transaction. Used for access control. Security: search_path fixed on 2025-11-18.';



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



CREATE TABLE IF NOT EXISTS "public"."_function_backups_20251118" (
    "function_name" "text" NOT NULL,
    "function_definition" "text" NOT NULL,
    "backed_up_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."_function_backups_20251118" OWNER TO "postgres";


COMMENT ON TABLE "public"."_function_backups_20251118" IS 'Backup of function definitions before applying search_path security fixes on 2025-11-18. Used for rollback if needed.';



CREATE TABLE IF NOT EXISTS "public"."api_brex_transfers" (
    "id" bigint NOT NULL,
    "brex_transfer_id" "text" NOT NULL,
    "counterparty_id" "text",
    "counterparty_type" "text",
    "counterparty_payment_instrument_id" "text",
    "counterparty_routing_number" "text",
    "counterparty_account_number" "text",
    "counterparty_name" "text",
    "description" "text",
    "payment_type" "text",
    "amount" numeric(15,2),
    "amount_cents" bigint,
    "currency" "text",
    "process_date" "date",
    "originating_account_type" "text",
    "originating_account_id" "text",
    "originating_account_number" "text",
    "originating_account_name" "text",
    "status" "text",
    "cancellation_reason" "text",
    "estimated_delivery_date" "date",
    "creator_user_id" "text",
    "brex_created_at" timestamp with time zone,
    "display_name" "text",
    "external_memo" "text",
    "is_ppro_enabled" boolean,
    "fed_reference_number" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "synced_at" timestamp with time zone,
    "sync_status" "text" DEFAULT 'pending'::"text",
    "sync_error_message" "text",
    "raw_payload" "jsonb"
);


ALTER TABLE "public"."api_brex_transfers" OWNER TO "postgres";


ALTER TABLE "public"."api_brex_transfers" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."api_brex_transfers_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."api_brex_transfers_vendors" (
    "id" bigint NOT NULL,
    "brex_transfer_id" "text" NOT NULL,
    "brex_vendor_id" bigint NOT NULL,
    "match_method" "text" DEFAULT 'manual'::"text",
    "match_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by_user_id" bigint,
    "updated_at" timestamp with time zone,
    "updated_by_user_id" bigint,
    "deleted_at" timestamp with time zone,
    "deleted_by_user_id" bigint
);


ALTER TABLE "public"."api_brex_transfers_vendors" OWNER TO "postgres";


COMMENT ON TABLE "public"."api_brex_transfers_vendors" IS 'Junction table linking Brex transfers to vendors. Supports automatic and manual matching with full audit trail (created/updated/deleted by). Uses soft delete to preserve transaction history.';



COMMENT ON COLUMN "public"."api_brex_transfers_vendors"."created_by_user_id" IS 'User who created this match (NULL for automatic matches)';



COMMENT ON COLUMN "public"."api_brex_transfers_vendors"."updated_by_user_id" IS 'User who last updated this match';



COMMENT ON COLUMN "public"."api_brex_transfers_vendors"."deleted_at" IS 'Soft delete timestamp';



COMMENT ON COLUMN "public"."api_brex_transfers_vendors"."deleted_by_user_id" IS 'User who soft-deleted this match';



ALTER TABLE "public"."api_brex_transfers_vendors" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."api_brex_transfers_vendors_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."api_brex_vendors" (
    "id" bigint NOT NULL,
    "brex_vendor_id" "text" NOT NULL,
    "name" "text",
    "email" "text",
    "payment_instrument_id" "text",
    "routing_number" "text",
    "account_number" "text",
    "bank_account_type" "text",
    "payment_account_address_line1" "text",
    "payment_account_address_line2" "text",
    "payment_account_city" "text",
    "payment_account_state" "text",
    "payment_account_postal_code" "text",
    "payment_account_country" "text",
    "phone" "text",
    "vendor_type" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "synced_at" timestamp with time zone,
    "raw_payload" "jsonb"
);


ALTER TABLE "public"."api_brex_vendors" OWNER TO "postgres";


COMMENT ON COLUMN "public"."api_brex_vendors"."payment_instrument_id" IS 'Brex payment instrument ID from payment_accounts[0].details.payment_instrument_id';



COMMENT ON COLUMN "public"."api_brex_vendors"."bank_account_type" IS 'Bank account type (CHECKING, SAVINGS, etc.) from payment_accounts[0].details.account_type';



COMMENT ON COLUMN "public"."api_brex_vendors"."payment_account_address_line1" IS 'Address line 1 from payment_accounts[0].address[0] in Brex API response';



COMMENT ON COLUMN "public"."api_brex_vendors"."payment_account_address_line2" IS 'Address line 2 from payment_accounts[0].address[0] in Brex API response';



COMMENT ON COLUMN "public"."api_brex_vendors"."vendor_type" IS 'Not provided by Brex API. Reserved for manual categorization (e.g., supplier, contractor, landlord)';



CREATE TABLE IF NOT EXISTS "public"."api_brex_vendors_clerk_orgs" (
    "id" bigint NOT NULL,
    "brex_vendor_id" bigint NOT NULL,
    "clerk_org_id" bigint NOT NULL,
    "match_confidence" numeric(3,2),
    "match_method" "text",
    "match_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."api_brex_vendors_clerk_orgs" OWNER TO "postgres";


ALTER TABLE "public"."api_brex_vendors_clerk_orgs" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."api_brex_vendors_clerk_orgs_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."api_brex_vendors_clerk_users" (
    "id" bigint NOT NULL,
    "brex_vendor_id" bigint NOT NULL,
    "clerk_user_id" bigint NOT NULL,
    "match_confidence" numeric(3,2),
    "match_method" "text",
    "match_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."api_brex_vendors_clerk_users" OWNER TO "postgres";


ALTER TABLE "public"."api_brex_vendors_clerk_users" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."api_brex_vendors_clerk_users_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE "public"."api_brex_vendors" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."api_brex_vendors_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."api_ofb_transfers" (
    "id" bigint NOT NULL,
    "ofb_transfer_id" "text" NOT NULL,
    "counterparty_name" "text",
    "counterparty_account_number" "text",
    "counterparty_routing_number" "text",
    "description" "text",
    "amount" numeric,
    "process_date" "date",
    "payment_type" "text",
    "status" "text",
    "check_number" "text",
    "display_name" "text",
    "import_source" "text",
    "import_batch_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "raw_data" "jsonb",
    "record_transfer_name" "text",
    "transfer_entered_by" "text",
    "transfer_created_at" timestamp with time zone,
    "bank_trace_number" "text",
    "fed_reference_number" "text",
    "approver_one_name" "text",
    "approver_one_timestamp" timestamp with time zone,
    "originating_account_name" "text",
    "originating_account_number" "text",
    "counterparty_address_line_1" "text",
    "counterparty_address_line_2" "text",
    "counterparty_address_line_3" "text",
    "counterparty_beneficiary_bank_name" "text",
    "external_memo_lines" "text"[],
    "currency" "text" DEFAULT 'USD'::"text"
);


ALTER TABLE "public"."api_ofb_transfers" OWNER TO "postgres";


ALTER TABLE "public"."api_ofb_transfers" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."api_ofb_transfers_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."api_ofb_transfers_vendors" (
    "id" bigint NOT NULL,
    "ofb_transfer_id" "text" NOT NULL,
    "ofb_vendor_id" bigint NOT NULL,
    "match_method" "text" DEFAULT 'manual'::"text",
    "match_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by_user_id" bigint,
    "updated_at" timestamp with time zone,
    "updated_by_user_id" bigint,
    "deleted_at" timestamp with time zone,
    "deleted_by_user_id" bigint
);


ALTER TABLE "public"."api_ofb_transfers_vendors" OWNER TO "postgres";


ALTER TABLE "public"."api_ofb_transfers_vendors" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."api_ofb_transfers_vendors_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."api_ofb_vendors" (
    "id" bigint NOT NULL,
    "name" "text",
    "email" "text",
    "account_number" "text",
    "routing_number" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "payment_instrument_id" "text",
    "bank_account_type" "text",
    "payment_account_address_line1" "text",
    "payment_account_address_line2" "text",
    "payment_account_city" "text",
    "payment_account_state" "text",
    "payment_account_postal_code" "text",
    "payment_account_country" "text",
    "phone" "text",
    "vendor_type" "text",
    "synced_at" timestamp with time zone,
    "raw_payload" "jsonb"
);


ALTER TABLE "public"."api_ofb_vendors" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."api_ofb_vendors_clerk_orgs" (
    "id" bigint NOT NULL,
    "ofb_vendor_id" bigint NOT NULL,
    "clerk_org_id" bigint NOT NULL,
    "match_confidence" numeric,
    "match_method" "text" DEFAULT 'manual'::"text",
    "match_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."api_ofb_vendors_clerk_orgs" OWNER TO "postgres";


ALTER TABLE "public"."api_ofb_vendors_clerk_orgs" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."api_ofb_vendors_clerk_orgs_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."api_ofb_vendors_clerk_users" (
    "id" bigint NOT NULL,
    "ofb_vendor_id" bigint NOT NULL,
    "clerk_user_id" bigint NOT NULL,
    "match_confidence" numeric,
    "match_method" "text" DEFAULT 'manual'::"text",
    "match_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."api_ofb_vendors_clerk_users" OWNER TO "postgres";


ALTER TABLE "public"."api_ofb_vendors_clerk_users" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."api_ofb_vendors_clerk_users_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE "public"."api_ofb_vendors" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."api_ofb_vendors_id_seq"
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
    "clerk_org_role" "public"."clerk_org_role" DEFAULT 'member'::"public"."clerk_org_role" NOT NULL,
    "clerk_member_role" "text"
);


ALTER TABLE "public"."auth_clerk_orgs_members" OWNER TO "postgres";


COMMENT ON TABLE "public"."auth_clerk_orgs_members" IS 'Clerk organization memberships. Access clerk_user_id through user_id -> auth_clerk_users.clerk_user_id relationship';



COMMENT ON COLUMN "public"."auth_clerk_orgs_members"."auth_clerk_users_id" IS 'foreign key to auth_clerk_users.id';



COMMENT ON COLUMN "public"."auth_clerk_orgs_members"."clerk_org_role" IS 'Organization-specific role: admin (manage org), member (standard access), viewer (read-only access). Business roles are in auth_clerk_users.role column.';



COMMENT ON COLUMN "public"."auth_clerk_orgs_members"."clerk_member_role" IS 'Functional role within this specific org. Different from clerk_org_role which is coarse privilege (admin/member/viewer). Example values: admin, account_executive, loan_processor, balance_sheet_investor, loan_opener, broker, borrower';



CREATE TABLE IF NOT EXISTS "public"."auth_clerk_orgs_themes" (
    "id" bigint NOT NULL,
    "org_id" bigint NOT NULL,
    "name" "text" NOT NULL,
    "is_default" boolean DEFAULT false NOT NULL,
    "tokens_light" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "tokens_dark" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "radius" "jsonb" DEFAULT '{"radius": "0.5rem"}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by_user_id" bigint
);


ALTER TABLE "public"."auth_clerk_orgs_themes" OWNER TO "postgres";


COMMENT ON TABLE "public"."auth_clerk_orgs_themes" IS 'Organization theme customizations';



COMMENT ON COLUMN "public"."auth_clerk_orgs_themes"."tokens_light" IS 'JSONB object containing CSS variable values for light mode (e.g., {"background": "#ffffff", "foreground": "#0a0a0a"})';



COMMENT ON COLUMN "public"."auth_clerk_orgs_themes"."tokens_dark" IS 'JSONB object containing CSS variable values for dark mode';



COMMENT ON COLUMN "public"."auth_clerk_orgs_themes"."radius" IS 'JSONB object containing radius values (e.g., {"radius": "0.5rem"})';



ALTER TABLE "public"."auth_clerk_orgs_themes" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."auth_clerk_orgs_themes_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."auth_clerk_users" (
    "email" character varying(255),
    "updated_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text"),
    "clerk_username" "text",
    "first_name" "text",
    "last_name" "text",
    "full_name" "text" GENERATED ALWAYS AS (TRIM(BOTH FROM ((COALESCE("first_name", ''::"text") || ' '::"text") || COALESCE("last_name", ''::"text")))) STORED,
    "avatar_url" "text",
    "website" "text",
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
    "personal_role" "text",
    CONSTRAINT "clerk_username_length" CHECK (("char_length"("clerk_username") >= 3))
);


ALTER TABLE "public"."auth_clerk_users" OWNER TO "postgres";


COMMENT ON TABLE "public"."auth_clerk_users" IS 'User profiles integrated with Clerk authentication - renamed from auth_user_profile on 2025-01-03';



COMMENT ON COLUMN "public"."auth_clerk_users"."clerk_username" IS 'Clerk username - renamed from username on 2025-01-03';



COMMENT ON COLUMN "public"."auth_clerk_users"."is_active_yn" IS 'Whether the user account is active';



COMMENT ON COLUMN "public"."auth_clerk_users"."cell_phone" IS 'cell phone number';



COMMENT ON COLUMN "public"."auth_clerk_users"."office_phone_extension" IS 'office phone number extension';



COMMENT ON COLUMN "public"."auth_clerk_users"."is_internal_yn" IS 'Whether the user is an internal employee';



COMMENT ON COLUMN "public"."auth_clerk_users"."office_phone" IS 'office phone number';



COMMENT ON COLUMN "public"."auth_clerk_users"."clerk_user_id" IS 'Clerk user ID - renamed from clerk_id on 2025-01-03';



COMMENT ON COLUMN "public"."auth_clerk_users"."contact_id" IS 'foreign key to contact_id';



COMMENT ON COLUMN "public"."auth_clerk_users"."phone_number" IS 'Primary phone number from Clerk authentication';



COMMENT ON COLUMN "public"."auth_clerk_users"."personal_role" IS 'User role when NOT in an org context (personal scope). Example values: admin, account_executive, loan_processor, balance_sheet_investor, loan_opener, borrower, broker';



CREATE TABLE IF NOT EXISTS "public"."bank_accounts" (
    "id" bigint NOT NULL,
    "bank_name" "text" NOT NULL,
    "bank_code" "text" NOT NULL,
    "account_name" "text" NOT NULL,
    "account_number_last4" "text",
    "account_type" "text" DEFAULT 'checking'::"text",
    "routing_number" "text",
    "integration_type" "text" DEFAULT 'csv'::"text" NOT NULL,
    "api_credentials" "jsonb",
    "csv_column_mapping" "jsonb",
    "display_color" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone,
    CONSTRAINT "valid_integration_type" CHECK (("integration_type" = ANY (ARRAY['api'::"text", 'csv'::"text"])))
);


ALTER TABLE "public"."bank_accounts" OWNER TO "postgres";


ALTER TABLE "public"."bank_accounts" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."bank_accounts_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



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
    "email_address" "text",
    "cell_phone" "text",
    "home_phone" "text",
    "office_phone" "text",
    "primary_residence_address_county" "text",
    "previous_residence_occupancy_start_date" "date",
    "previous_residence_occupancy_end_date" "date",
    "name" "text" GENERATED ALWAYS AS (
CASE
    WHEN (("middle_name" IS NOT NULL) AND ("middle_name" <> ''::"text")) THEN (((("first_name" || ' '::"text") || "middle_name") || ' '::"text") || "last_name")
    ELSE (("first_name" || ' '::"text") || "last_name")
END) STORED
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



CREATE TABLE IF NOT EXISTS "public"."bsi_deals_clerk_orgs" (
    "id" bigint NOT NULL,
    "deal_id" bigint NOT NULL,
    "clerk_org_id" bigint NOT NULL
);


ALTER TABLE "public"."bsi_deals_clerk_orgs" OWNER TO "postgres";


ALTER TABLE "public"."bsi_deals_clerk_orgs" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."bsi_deals_clerk_orgs_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."bsi_deals_clerk_users" (
    "deal_id" bigint NOT NULL,
    "id" bigint NOT NULL,
    "clerk_user_id" bigint
);


ALTER TABLE "public"."bsi_deals_clerk_users" OWNER TO "postgres";


ALTER TABLE "public"."bsi_deals_clerk_users" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."bsi_deals_clerk_users_id_seq"
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
    "principal_amount" numeric NOT NULL,
    "instrument_id" bigint,
    "clerk_org_id" bigint,
    "clerk_org_member_id" bigint,
    "clerk_user_id" bigint NOT NULL,
    "statement_id" bigint
);


ALTER TABLE "public"."bsi_distributions" OWNER TO "postgres";


COMMENT ON COLUMN "public"."bsi_distributions"."clerk_org_member_id" IS 'fkey auth_clerk_orgs_members_id';



COMMENT ON COLUMN "public"."bsi_distributions"."clerk_user_id" IS 'fkey to auth_clerk_users_id';



ALTER TABLE "public"."bsi_distributions" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."bsi_distributions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."bsi_distributions_transactions" (
    "id" bigint NOT NULL,
    "distribution_id" bigint NOT NULL,
    "transaction_id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."bsi_distributions_transactions" OWNER TO "postgres";


COMMENT ON TABLE "public"."bsi_distributions_transactions" IS 'Junction table linking distributions to transactions. Many:1 relationship - multiple distributions from different deals roll up into one transaction (wire payment). Each distribution can only be linked to one transaction.';



ALTER TABLE "public"."bsi_distributions_transactions" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."bsi_distributions_transactions_id_seq"
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
    "auth_clerk_users_id" bigint,
    "file_path" "text",
    "file_name" "text",
    "file_type" "text",
    "file_size" bigint,
    "file_url" "text",
    "uploaded_at" timestamp with time zone
);


ALTER TABLE "public"."bsi_statements" OWNER TO "postgres";


COMMENT ON COLUMN "public"."bsi_statements"."deposit_amount" IS 'amount paid to balance sheet investor (bsi)';



COMMENT ON COLUMN "public"."bsi_statements"."auth_clerk_users_id" IS 'Foreign key to auth_clerk_users for role-based authentication and RLS policy enforcement';



COMMENT ON COLUMN "public"."bsi_statements"."file_path" IS 'Path to file in Supabase Storage bucket';



COMMENT ON COLUMN "public"."bsi_statements"."file_url" IS 'Public URL for file access (only for public buckets)';



CREATE TABLE IF NOT EXISTS "public"."bsi_statements_transactions" (
    "id" bigint NOT NULL,
    "statement_id" bigint NOT NULL,
    "transaction_id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."bsi_statements_transactions" OWNER TO "postgres";


COMMENT ON TABLE "public"."bsi_statements_transactions" IS 'Junction table linking statements to transactions. Supports Many:Many - one statement can be paid by multiple transactions, and one transaction can pay multiple statements (batch payments).';



ALTER TABLE "public"."bsi_statements_transactions" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."bsi_statements_transactions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."bsi_transactions_document_files" (
    "id" bigint NOT NULL,
    "transaction_id" bigint NOT NULL,
    "document_file_id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."bsi_transactions_document_files" OWNER TO "postgres";


COMMENT ON TABLE "public"."bsi_transactions_document_files" IS 'Junction table linking BSI transactions to document files';



CREATE SEQUENCE IF NOT EXISTS "public"."bsi_transaction_document_files_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."bsi_transaction_document_files_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."bsi_transaction_document_files_id_seq" OWNED BY "public"."bsi_transactions_document_files"."id";



CREATE TABLE IF NOT EXISTS "public"."bsi_transactions" (
    "id" bigint NOT NULL,
    "transaction_amount" numeric(15,2),
    "transaction_date" timestamp with time zone DEFAULT "now"() NOT NULL,
    "transaction_method" "public"."transaction_method",
    "transaction_status" "public"."transaction_status",
    "reference_number" "text",
    "reference_type" "public"."transaction_reference_type",
    "external_memo" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "ledger_entry_type" "public"."ledger_entry_type" DEFAULT 'contribution'::"public"."ledger_entry_type",
    "clerk_user_id" bigint,
    "clerk_org_id" bigint
);


ALTER TABLE "public"."bsi_transactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bsi_transactions_api_brex_transfers" (
    "id" bigint NOT NULL,
    "transaction_id" bigint NOT NULL,
    "brex_transfer_id" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."bsi_transactions_api_brex_transfers" OWNER TO "postgres";


ALTER TABLE "public"."bsi_transactions_api_brex_transfers" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."bsi_transactions_api_brex_transfers_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."bsi_transactions_api_ofb_transfers" (
    "id" bigint NOT NULL,
    "transaction_id" bigint NOT NULL,
    "ofb_transfer_id" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."bsi_transactions_api_ofb_transfers" OWNER TO "postgres";


ALTER TABLE "public"."bsi_transactions_api_ofb_transfers" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."bsi_transactions_api_ofb_transfers_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."bsi_transactions_deals" (
    "id" bigint NOT NULL,
    "transaction_id" bigint NOT NULL,
    "deal_id" bigint NOT NULL,
    "allocation_amount" numeric(15,2),
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "positive_deal_amount" CHECK (("allocation_amount" > (0)::numeric))
);


ALTER TABLE "public"."bsi_transactions_deals" OWNER TO "postgres";


COMMENT ON TABLE "public"."bsi_transactions_deals" IS 'Join table linking transactions to multiple deals with allocation amounts';



COMMENT ON COLUMN "public"."bsi_transactions_deals"."allocation_amount" IS 'Amount of the transaction allocated to this specific deal';



CREATE SEQUENCE IF NOT EXISTS "public"."bsi_transactions_deals_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."bsi_transactions_deals_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."bsi_transactions_deals_id_seq" OWNED BY "public"."bsi_transactions_deals"."id";



ALTER TABLE "public"."bsi_transactions" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."bsi_transactions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."bsi_transactions_instruments" (
    "id" bigint NOT NULL,
    "transaction_id" bigint NOT NULL,
    "instrument_id" bigint NOT NULL,
    "allocation_amount" numeric(15,2),
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "positive_instrument_amount" CHECK (("allocation_amount" > (0)::numeric))
);


ALTER TABLE "public"."bsi_transactions_instruments" OWNER TO "postgres";


COMMENT ON TABLE "public"."bsi_transactions_instruments" IS 'Join table linking transactions to multiple debt instruments with allocation amounts';



COMMENT ON COLUMN "public"."bsi_transactions_instruments"."allocation_amount" IS 'Amount of the transaction allocated to this specific instrument';



CREATE SEQUENCE IF NOT EXISTS "public"."bsi_transactions_instruments_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."bsi_transactions_instruments_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."bsi_transactions_instruments_id_seq" OWNED BY "public"."bsi_transactions_instruments"."id";



CREATE TABLE IF NOT EXISTS "public"."bsi_transactions_investors" (
    "id" bigint NOT NULL,
    "transaction_id" bigint NOT NULL,
    "clerk_user_id" bigint,
    "clerk_org_id" bigint,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "allocation_amount" numeric,
    CONSTRAINT "bsi_transactions_investors_amount_positive" CHECK (("allocation_amount" > (0)::numeric)),
    CONSTRAINT "check_user_or_org_exists" CHECK ((("clerk_user_id" IS NOT NULL) OR ("clerk_org_id" IS NOT NULL))),
    CONSTRAINT "chk_has_user_or_org" CHECK ((("clerk_user_id" IS NOT NULL) OR ("clerk_org_id" IS NOT NULL)))
);


ALTER TABLE "public"."bsi_transactions_investors" OWNER TO "postgres";


COMMENT ON TABLE "public"."bsi_transactions_investors" IS 'Join table linking transactions to multiple investors with allocation amounts';



COMMENT ON COLUMN "public"."bsi_transactions_investors"."allocation_amount" IS 'Amount of the transaction allocated to this specific investor';



CREATE SEQUENCE IF NOT EXISTS "public"."bsi_transactions_investors_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."bsi_transactions_investors_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."bsi_transactions_investors_id_seq" OWNED BY "public"."bsi_transactions_investors"."id";



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


COMMENT ON TABLE "public"."company" IS 'Company records. Supports anonymous INSERT via public intake forms (Security Advisor warning is intentional).';



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
    "profile_picture" "text",
    "created_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text"),
    "updated_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text"),
    "middle_name" "text",
    "user_id" bigint,
    "name" "text" GENERATED ALWAYS AS (
CASE
    WHEN (("middle_name" IS NOT NULL) AND ("middle_name" <> ''::"text")) THEN (((("first_name" || ' '::"text") || "middle_name") || ' '::"text") || "last_name")
    ELSE (("first_name" || ' '::"text") || "last_name")
END) STORED
);


ALTER TABLE "public"."contact" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."contact_contact_types" (
    "id" bigint NOT NULL,
    "contact_id" bigint NOT NULL,
    "contact_types_id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."contact_contact_types" OWNER TO "postgres";


COMMENT ON TABLE "public"."contact_contact_types" IS 'Junction table linking contacts to their contact types (many-to-many)';



COMMENT ON COLUMN "public"."contact_contact_types"."contact_id" IS 'Foreign key to contact.id';



COMMENT ON COLUMN "public"."contact_contact_types"."contact_types_id" IS 'Foreign key to contact_types.id';



ALTER TABLE "public"."contact_contact_types" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
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
    "name" "text",
    "code" "text" NOT NULL,
    "description" "text",
    "allows_multiple" boolean DEFAULT true,
    "display_order" integer,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."contact_types" OWNER TO "postgres";


COMMENT ON COLUMN "public"."contact_types"."code" IS 'Snake_case identifier for programmatic use (stable, use in code/APIs)';



COMMENT ON COLUMN "public"."contact_types"."description" IS 'Description of this contact type';



COMMENT ON COLUMN "public"."contact_types"."allows_multiple" IS 'Whether a contact can have multiple instances of this type';



COMMENT ON COLUMN "public"."contact_types"."display_order" IS 'Sort order for UI display';



COMMENT ON COLUMN "public"."contact_types"."is_active" IS 'Whether this contact type is active and available for selection';



COMMENT ON COLUMN "public"."contact_types"."created_at" IS 'Timestamp when this record was created';



COMMENT ON COLUMN "public"."contact_types"."updated_at" IS 'Timestamp when this record was last updated';



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
    "title_company_id" bigint,
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
    "funding_date" "date",
    "loan_sale_date" "date",
    "pricing_file_path" "text",
    "pricing_file_url" "text",
    "loan_buyer_company_id" bigint,
    "note_rate" numeric,
    "cost_of_capital" numeric,
    "broker_company_id" bigint,
    "escrow_company_id" bigint,
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



CREATE TABLE IF NOT EXISTS "public"."deal_document_participants" (
    "deal_id" bigint NOT NULL,
    "document_file_id" bigint NOT NULL,
    "source_table" "text" NOT NULL,
    "source_pk" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."deal_document_participants" OWNER TO "postgres";


COMMENT ON TABLE "public"."deal_document_participants" IS 'Denormalized table linking documents to deals via any path. Maintained by triggers.';



CREATE TABLE IF NOT EXISTS "public"."deal_guarantors" (
    "id" bigint NOT NULL,
    "deal_id" bigint NOT NULL,
    "guarantor_id" bigint NOT NULL,
    "is_primary" boolean DEFAULT false,
    "display_order" integer,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."deal_guarantors" OWNER TO "postgres";


COMMENT ON TABLE "public"."deal_guarantors" IS 'Junction table linking deals to guarantors (many-to-many)';



COMMENT ON COLUMN "public"."deal_guarantors"."deal_id" IS 'The deal this guarantor is associated with';



COMMENT ON COLUMN "public"."deal_guarantors"."guarantor_id" IS 'Reference to guarantor table';



COMMENT ON COLUMN "public"."deal_guarantors"."is_primary" IS 'Whether this is the primary guarantor for the deal';



COMMENT ON COLUMN "public"."deal_guarantors"."display_order" IS 'Order of guarantors (1 = primary, 2 = secondary, etc.)';



COMMENT ON COLUMN "public"."deal_guarantors"."notes" IS 'Optional notes about this guarantor assignment';



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



CREATE TABLE IF NOT EXISTS "public"."deal_role_types" (
    "id" bigint NOT NULL,
    "code" "text" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "allows_multiple" boolean DEFAULT true,
    "display_order" integer,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."deal_role_types" OWNER TO "postgres";


COMMENT ON TABLE "public"."deal_role_types" IS 'Lookup table defining roles that parties can play on a specific deal (e.g., Broker, Title Agent, Guarantor)';



COMMENT ON COLUMN "public"."deal_role_types"."code" IS 'Snake_case identifier for programmatic use (stable, use in code/APIs)';



COMMENT ON COLUMN "public"."deal_role_types"."name" IS 'Human-readable display name';



COMMENT ON COLUMN "public"."deal_role_types"."allows_multiple" IS 'Whether a deal can have multiple parties in this role';



COMMENT ON COLUMN "public"."deal_role_types"."display_order" IS 'Sort order for UI display';



ALTER TABLE "public"."deal_role_types" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."deal_role_types_id_seq"
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
    "deal_role_types_id" bigint,
    "auth_clerk_users_id" bigint,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "deal_roles_has_party" CHECK (((("contact_id" IS NOT NULL) AND ("auth_clerk_users_id" IS NULL)) OR (("contact_id" IS NULL) AND ("auth_clerk_users_id" IS NOT NULL)) OR (("contact_id" IS NULL) AND ("auth_clerk_users_id" IS NULL))))
);


ALTER TABLE "public"."deal_roles" OWNER TO "postgres";


COMMENT ON TABLE "public"."deal_roles" IS 'Assigns roles (borrower, broker, loan processor, etc.) to contacts/users for specific deals. Used for permission checks on deal operations.';



COMMENT ON COLUMN "public"."deal_roles"."deal_id" IS 'The deal this party is associated with';



COMMENT ON COLUMN "public"."deal_roles"."contact_id" IS 'Reference to contact table (for external parties)';



COMMENT ON COLUMN "public"."deal_roles"."deal_role_types_id" IS 'The role this party plays on the deal';



COMMENT ON COLUMN "public"."deal_roles"."auth_clerk_users_id" IS 'Reference to auth_clerk_users table (for internal users/logged-in parties)';



COMMENT ON COLUMN "public"."deal_roles"."notes" IS 'Optional notes about this party assignment';



ALTER TABLE "public"."deal_roles" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."deal_roles_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE "public"."deal_guarantors" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."deals_guarantors_id_seq"
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



CREATE TABLE IF NOT EXISTS "public"."document_access_permissions" (
    "id" bigint NOT NULL,
    "clerk_org_id" bigint NOT NULL,
    "deal_role_types_id" bigint NOT NULL,
    "document_categories_id" bigint NOT NULL,
    "can_view" boolean DEFAULT false NOT NULL,
    "can_insert" boolean DEFAULT false NOT NULL,
    "can_upload" boolean DEFAULT false NOT NULL,
    "can_delete" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_by_user_id" bigint,
    "updated_by_clerk_sub" "text"
);


ALTER TABLE "public"."document_access_permissions" OWNER TO "postgres";


COMMENT ON TABLE "public"."document_access_permissions" IS 'Org-scoped permission matrix. Each org has its own copy, seeded from document_access_permissions_global template.';



CREATE TABLE IF NOT EXISTS "public"."document_access_permissions_global" (
    "id" bigint NOT NULL,
    "deal_role_types_id" bigint NOT NULL,
    "document_categories_id" bigint NOT NULL,
    "can_view" boolean DEFAULT false,
    "can_insert" boolean DEFAULT false,
    "can_upload" boolean DEFAULT false,
    "can_delete" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."document_access_permissions_global" OWNER TO "postgres";


COMMENT ON TABLE "public"."document_access_permissions_global" IS 'Permission matrix defining which deal roles can access which document categories';



COMMENT ON COLUMN "public"."document_access_permissions_global"."can_view" IS 'Can view/download documents in this category';



COMMENT ON COLUMN "public"."document_access_permissions_global"."can_insert" IS 'Can create new document records in this category';



COMMENT ON COLUMN "public"."document_access_permissions_global"."can_upload" IS 'Can upload/replace files for documents in this category';



COMMENT ON COLUMN "public"."document_access_permissions_global"."can_delete" IS 'Can delete documents in this category';



ALTER TABLE "public"."document_access_permissions_global" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."document_access_permissions_global_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE "public"."document_access_permissions" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."document_access_permissions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."document_categories" (
    "id" bigint NOT NULL,
    "code" "text" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "storage_folder" "text" NOT NULL,
    "icon" "text",
    "default_display_order" integer,
    "is_active" boolean DEFAULT true,
    "is_internal_only" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."document_categories" OWNER TO "postgres";


COMMENT ON TABLE "public"."document_categories" IS 'Lookup table for document categories with metadata for UI and storage';



COMMENT ON COLUMN "public"."document_categories"."code" IS 'Snake_case identifier matching existing document_category enum values';



COMMENT ON COLUMN "public"."document_categories"."storage_folder" IS 'Folder name used in Supabase Storage paths';



COMMENT ON COLUMN "public"."document_categories"."default_display_order" IS 'System default sort order; users can override via user_pref_document_categories_order';



COMMENT ON COLUMN "public"."document_categories"."is_internal_only" IS 'If true, only visible to internal admins (e.g., internal notes)';



ALTER TABLE "public"."document_categories" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."document_categories_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."document_categories_user_order" (
    "id" bigint NOT NULL,
    "clerk_user_id" "text" NOT NULL,
    "document_categories_id" bigint NOT NULL,
    "display_order" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."document_categories_user_order" OWNER TO "postgres";


COMMENT ON TABLE "public"."document_categories_user_order" IS 'Per-user custom display order for document categories (drag-and-drop reordering)';



COMMENT ON COLUMN "public"."document_categories_user_order"."clerk_user_id" IS 'Clerk user ID string (not FK - users may not exist in auth_clerk_users yet)';



COMMENT ON COLUMN "public"."document_categories_user_order"."display_order" IS 'User-customized sort order (overrides document_categories.default_display_order)';



CREATE TABLE IF NOT EXISTS "public"."document_files_borrowers" (
    "id" bigint NOT NULL,
    "document_file_id" bigint NOT NULL,
    "borrower_id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "text"
);


ALTER TABLE "public"."document_files_borrowers" OWNER TO "postgres";


ALTER TABLE "public"."document_files_borrowers" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."document_files_borrowers_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."document_files_clerk_orgs" (
    "id" bigint NOT NULL,
    "document_file_id" bigint NOT NULL,
    "clerk_org_id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "text"
);


ALTER TABLE "public"."document_files_clerk_orgs" OWNER TO "postgres";


ALTER TABLE "public"."document_files_clerk_orgs" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."document_files_clerk_orgs_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."document_files_clerk_users" (
    "id" bigint NOT NULL,
    "document_file_id" bigint NOT NULL,
    "clerk_user_id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "text"
);


ALTER TABLE "public"."document_files_clerk_users" OWNER TO "postgres";


ALTER TABLE "public"."document_files_clerk_users" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."document_files_clerk_users_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."document_files_companies" (
    "id" bigint NOT NULL,
    "document_file_id" bigint NOT NULL,
    "company_id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "text"
);


ALTER TABLE "public"."document_files_companies" OWNER TO "postgres";


ALTER TABLE "public"."document_files_companies" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."document_files_companies_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."document_files_deals" (
    "id" bigint NOT NULL,
    "document_file_id" bigint NOT NULL,
    "deal_id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "text"
);


ALTER TABLE "public"."document_files_deals" OWNER TO "postgres";


ALTER TABLE "public"."document_files_deals" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."document_files_deals_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."document_files_guarantors" (
    "id" bigint NOT NULL,
    "document_file_id" bigint NOT NULL,
    "guarantor_id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "text"
);


ALTER TABLE "public"."document_files_guarantors" OWNER TO "postgres";


ALTER TABLE "public"."document_files_guarantors" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."document_files_guarantors_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."document_files_properties" (
    "id" bigint NOT NULL,
    "document_file_id" bigint NOT NULL,
    "property_id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "text"
);


ALTER TABLE "public"."document_files_properties" OWNER TO "postgres";


ALTER TABLE "public"."document_files_properties" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."document_files_properties_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."document_files_tags" (
    "id" bigint NOT NULL,
    "document_file_id" bigint NOT NULL,
    "document_tag_id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "created_by" bigint
);


ALTER TABLE "public"."document_files_tags" OWNER TO "postgres";


COMMENT ON TABLE "public"."document_files_tags" IS 'Junction table linking documents to tags (many-to-many)';



ALTER TABLE "public"."document_files_tags" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."document_files_tags_id_seq"
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


CREATE TABLE IF NOT EXISTS "public"."document_roles_files" (
    "id" bigint NOT NULL,
    "document_files_id" bigint NOT NULL,
    "document_roles_id" bigint NOT NULL
);


ALTER TABLE "public"."document_roles_files" OWNER TO "postgres";


ALTER TABLE "public"."document_roles_files" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."document_roles_files_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE "public"."document_roles" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."document_roles_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."document_tags" (
    "id" bigint NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "description" "text",
    "color" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "created_by" bigint,
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."document_tags" OWNER TO "postgres";


COMMENT ON TABLE "public"."document_tags" IS 'Master list of document tags with normalization and metadata';



COMMENT ON COLUMN "public"."document_tags"."name" IS 'Display name shown in UI';



COMMENT ON COLUMN "public"."document_tags"."slug" IS 'Normalized lowercase version for matching (prevents duplicates like Statement vs statement)';



COMMENT ON COLUMN "public"."document_tags"."color" IS 'Optional hex color code for tag badge display';



ALTER TABLE "public"."document_tags" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."document_tags_id_seq"
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



CREATE TABLE IF NOT EXISTS "public"."form_submissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "lender_slug" "text" NOT NULL,
    "form_slug" "text" NOT NULL,
    "form_version" integer NOT NULL,
    "status" "text" DEFAULT 'received'::"text" NOT NULL,
    "payload" "jsonb" NOT NULL,
    "uuid" "uuid",
    "error_code" "text",
    "error_detail" "text",
    "ip_hash" "text",
    "user_agent" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "validated_at" timestamp with time zone,
    "processed_at" timestamp with time zone
);


ALTER TABLE "public"."form_submissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."guarantor" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "borrower_id" bigint,
    "first_name" "text",
    "middle_name" "text",
    "last_name" "text",
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
    "credit_check" "public"."credit_check_status",
    "name" "text" GENERATED ALWAYS AS (
CASE
    WHEN (("middle_name" IS NOT NULL) AND ("middle_name" <> ''::"text")) THEN (((("first_name" || ' '::"text") || "middle_name") || ' '::"text") || "last_name")
    ELSE (("first_name" || ' '::"text") || "last_name")
END) STORED
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


COMMENT ON TABLE "public"."loan_application" IS 'Loan application records. Supports anonymous INSERT via public intake forms (Security Advisor warning is intentional).';



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



CREATE TABLE IF NOT EXISTS "public"."payroll_ledger" (
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


ALTER TABLE "public"."payroll_ledger" OWNER TO "postgres";


COMMENT ON TABLE "public"."payroll_ledger" IS 'user submission data by deal record';



COMMENT ON COLUMN "public"."payroll_ledger"."deal_id" IS 'foreign key to deal record';



CREATE TABLE IF NOT EXISTS "public"."payroll_ledger_fees_1099" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "payroll_ledger_id" bigint,
    "payee_id" bigint,
    "fee_amount_usd" numeric,
    "fee_amount_pct" numeric,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone
);


ALTER TABLE "public"."payroll_ledger_fees_1099" OWNER TO "postgres";


COMMENT ON TABLE "public"."payroll_ledger_fees_1099" IS 'junction table to associate one or more broker fee(s) and referral fee(s) to payroll submission record(s)';



ALTER TABLE "public"."payroll_ledger" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."payroll_ledger_id_seq"
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


COMMENT ON TABLE "public"."property_reapi" IS 'Property data from RealEstateAPI. Supports authenticated INSERT for property lookups (Security Advisor warning is intentional).';



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



CREATE TABLE IF NOT EXISTS "public"."rbac_permissions" (
    "id" bigint NOT NULL,
    "role" "text" NOT NULL,
    "resource_type" "text" NOT NULL,
    "resource_name" "text" NOT NULL,
    "can_select" boolean DEFAULT false,
    "can_insert" boolean DEFAULT false,
    "can_update" boolean DEFAULT false,
    "can_delete" boolean DEFAULT false,
    "scope_type" "text",
    "scope_filter" "text",
    "description" "text",
    "priority" integer DEFAULT 100,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "rbac_permissions_resource_type_check" CHECK (("resource_type" = ANY (ARRAY['table'::"text", 'storage_bucket'::"text", 'api_endpoint'::"text"]))),
    CONSTRAINT "rbac_permissions_scope_type_check" CHECK (("scope_type" = ANY (ARRAY['all'::"text", 'own'::"text", 'org'::"text", 'deal'::"text", 'custom'::"text"])))
);


ALTER TABLE "public"."rbac_permissions" OWNER TO "postgres";


COMMENT ON TABLE "public"."rbac_permissions" IS 'Centralized permission matrix. Single source of truth for all role-based access control.';



COMMENT ON COLUMN "public"."rbac_permissions"."role" IS 'Role name from personal_role or clerk_member_role (e.g., admin, balance_sheet_investor, borrower)';



COMMENT ON COLUMN "public"."rbac_permissions"."resource_type" IS 'Type of resource: table, storage_bucket, or api_endpoint';



COMMENT ON COLUMN "public"."rbac_permissions"."resource_name" IS 'Name of the resource (table name, bucket name, or API path)';



COMMENT ON COLUMN "public"."rbac_permissions"."scope_type" IS 'Scope modifier: all (full access), own (user-owned rows), org (org-owned rows), deal (deal-linked rows), custom (use scope_filter)';



COMMENT ON COLUMN "public"."rbac_permissions"."scope_filter" IS 'SQL expression for custom scope filtering. Used when scope_type=custom.';



COMMENT ON COLUMN "public"."rbac_permissions"."priority" IS 'Priority for conflict resolution. Lower number = higher priority.';



ALTER TABLE "public"."rbac_permissions" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."rbac_permissions_id_seq"
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



ALTER TABLE "public"."document_categories_user_order" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."user_pref_document_categories_order_id_seq"
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



CREATE OR REPLACE VIEW "public"."view_document_categories_user_order" WITH ("security_invoker"='true') AS
 SELECT "dc"."id",
    "dc"."code",
    "dc"."name",
    "dc"."description",
    "dc"."storage_folder",
    "dc"."icon",
    "dc"."is_internal_only",
    COALESCE("udco"."display_order", "dc"."default_display_order") AS "display_order",
        CASE
            WHEN ("udco"."id" IS NOT NULL) THEN true
            ELSE false
        END AS "is_custom_order"
   FROM ("public"."document_categories" "dc"
     LEFT JOIN "public"."document_categories_user_order" "udco" ON ((("dc"."id" = "udco"."document_categories_id") AND ("udco"."clerk_user_id" = "public"."get_clerk_user_id"()))))
  WHERE ("dc"."is_active" = true)
  ORDER BY COALESCE("udco"."display_order", "dc"."default_display_order");


ALTER VIEW "public"."view_document_categories_user_order" OWNER TO "postgres";


COMMENT ON VIEW "public"."view_document_categories_user_order" IS 'Document categories with user-specific display order (falls back to system default). SECURITY INVOKER enforced.';



CREATE OR REPLACE VIEW "public"."view_rbac_permissions_summary" WITH ("security_invoker"='true') AS
 SELECT "role",
    "resource_type",
    "count"(*) AS "resource_count",
    "sum"(
        CASE
            WHEN "can_select" THEN 1
            ELSE 0
        END) AS "select_count",
    "sum"(
        CASE
            WHEN "can_insert" THEN 1
            ELSE 0
        END) AS "insert_count",
    "sum"(
        CASE
            WHEN "can_update" THEN 1
            ELSE 0
        END) AS "update_count",
    "sum"(
        CASE
            WHEN "can_delete" THEN 1
            ELSE 0
        END) AS "delete_count",
    "array_agg"(DISTINCT "scope_type") FILTER (WHERE ("scope_type" IS NOT NULL)) AS "scopes"
   FROM "public"."rbac_permissions"
  WHERE ("is_active" = true)
  GROUP BY "role", "resource_type"
  ORDER BY "role", "resource_type";


ALTER VIEW "public"."view_rbac_permissions_summary" OWNER TO "postgres";


COMMENT ON VIEW "public"."view_rbac_permissions_summary" IS 'Aggregated view of permissions by role and resource type for auditing. SECURITY INVOKER respects underlying RLS.';



CREATE OR REPLACE VIEW "public"."view_storage_objects" WITH ("security_invoker"='true') AS
 SELECT "id",
    "name",
    "bucket_id",
    "owner",
    "created_at",
    "updated_at",
    "metadata"
   FROM "storage"."objects" "o"
  WHERE "public"."is_internal_admin"();


ALTER VIEW "public"."view_storage_objects" OWNER TO "postgres";


COMMENT ON VIEW "public"."view_storage_objects" IS 'Admin-only view of storage objects. Access controlled by is_internal_admin() function. SECURITY INVOKER enforced.';



CREATE OR REPLACE VIEW "public"."view_transaction_documents" WITH ("security_invoker"='true') AS
 SELECT "tdf"."id",
    "tdf"."transaction_id",
    "tdf"."document_file_id",
    "df"."document_name",
    "df"."document_category_id",
    "dc"."code" AS "document_category_code",
    "dc"."name" AS "document_category_name",
    "df"."document_status",
    "df"."file_type",
    "df"."file_size",
    "df"."storage_bucket",
    "df"."storage_path",
    "df"."uploaded_at",
    "df"."uploaded_by",
    "tdf"."created_at"
   FROM (("public"."bsi_transactions_document_files" "tdf"
     JOIN "public"."document_files" "df" ON (("tdf"."document_file_id" = "df"."id")))
     LEFT JOIN "public"."document_categories" "dc" ON (("df"."document_category_id" = "dc"."id")));


ALTER VIEW "public"."view_transaction_documents" OWNER TO "postgres";


COMMENT ON VIEW "public"."view_transaction_documents" IS 'Joins transaction document files with document metadata. SECURITY INVOKER ensures RLS is enforced for the calling user.';



CREATE TABLE IF NOT EXISTS "public"."weweb_auth_roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."weweb_auth_roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."weweb_auth_users_roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "role_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."weweb_auth_users_roles" OWNER TO "postgres";


ALTER TABLE ONLY "public"."bsi_transactions_deals" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."bsi_transactions_deals_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."bsi_transactions_document_files" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."bsi_transaction_document_files_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."bsi_transactions_instruments" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."bsi_transactions_instruments_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."bsi_transactions_investors" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."bsi_transactions_investors_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."document_files"
    ADD CONSTRAINT "Documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "Tasks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."_function_backups_20251118"
    ADD CONSTRAINT "_function_backups_20251118_pkey" PRIMARY KEY ("function_name");



ALTER TABLE ONLY "public"."api_brex_transfers"
    ADD CONSTRAINT "api_brex_transfers_brex_transfer_id_key" UNIQUE ("brex_transfer_id");



ALTER TABLE ONLY "public"."api_brex_transfers"
    ADD CONSTRAINT "api_brex_transfers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."api_brex_transfers_vendors"
    ADD CONSTRAINT "api_brex_transfers_vendors_brex_transfer_id_key" UNIQUE ("brex_transfer_id");



ALTER TABLE ONLY "public"."api_brex_transfers_vendors"
    ADD CONSTRAINT "api_brex_transfers_vendors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."api_brex_vendors"
    ADD CONSTRAINT "api_brex_vendors_brex_vendor_id_key" UNIQUE ("brex_vendor_id");



ALTER TABLE ONLY "public"."api_brex_vendors_clerk_orgs"
    ADD CONSTRAINT "api_brex_vendors_clerk_orgs_brex_vendor_id_clerk_org_id_key" UNIQUE ("brex_vendor_id", "clerk_org_id");



ALTER TABLE ONLY "public"."api_brex_vendors_clerk_orgs"
    ADD CONSTRAINT "api_brex_vendors_clerk_orgs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."api_brex_vendors_clerk_users"
    ADD CONSTRAINT "api_brex_vendors_clerk_users_brex_vendor_id_clerk_user_id_key" UNIQUE ("brex_vendor_id", "clerk_user_id");



ALTER TABLE ONLY "public"."api_brex_vendors_clerk_users"
    ADD CONSTRAINT "api_brex_vendors_clerk_users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."api_brex_vendors"
    ADD CONSTRAINT "api_brex_vendors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."api_ofb_transfers"
    ADD CONSTRAINT "api_ofb_transfers_ofb_transfer_id_key" UNIQUE ("ofb_transfer_id");



ALTER TABLE ONLY "public"."api_ofb_transfers"
    ADD CONSTRAINT "api_ofb_transfers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."api_ofb_transfers_vendors"
    ADD CONSTRAINT "api_ofb_transfers_vendors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."api_ofb_vendors_clerk_orgs"
    ADD CONSTRAINT "api_ofb_vendors_clerk_orgs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."api_ofb_vendors_clerk_users"
    ADD CONSTRAINT "api_ofb_vendors_clerk_users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."api_ofb_vendors"
    ADD CONSTRAINT "api_ofb_vendors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."appraisal"
    ADD CONSTRAINT "appraisal_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bank_accounts"
    ADD CONSTRAINT "bank_accounts_bank_code_key" UNIQUE ("bank_code");



ALTER TABLE ONLY "public"."bank_accounts"
    ADD CONSTRAINT "bank_accounts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."borrower"
    ADD CONSTRAINT "borrower_profile_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bs_debt_instruments_deals"
    ADD CONSTRAINT "bs_debt_instruments_deals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bsi_deals_clerk_orgs"
    ADD CONSTRAINT "bsi_deals_orgs_deal_id_clerk_org_id_key" UNIQUE ("deal_id", "clerk_org_id");



ALTER TABLE ONLY "public"."bsi_deals_clerk_orgs"
    ADD CONSTRAINT "bsi_deals_orgs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bsi_deals_clerk_users"
    ADD CONSTRAINT "bsi_deals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bsi_distributions"
    ADD CONSTRAINT "bsi_distributions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bsi_distributions_transactions"
    ADD CONSTRAINT "bsi_distributions_transactions_distribution_id_key" UNIQUE ("distribution_id");



ALTER TABLE ONLY "public"."bsi_distributions_transactions"
    ADD CONSTRAINT "bsi_distributions_transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bsi_statements"
    ADD CONSTRAINT "bsi_statements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bsi_statements_transactions"
    ADD CONSTRAINT "bsi_statements_transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bsi_statements_transactions"
    ADD CONSTRAINT "bsi_statements_transactions_statement_id_transaction_id_key" UNIQUE ("statement_id", "transaction_id");



ALTER TABLE ONLY "public"."bsi_transactions_document_files"
    ADD CONSTRAINT "bsi_transaction_document_files_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bsi_transactions_api_brex_transfers"
    ADD CONSTRAINT "bsi_transactions_api_brex_transfers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bsi_transactions_api_brex_transfers"
    ADD CONSTRAINT "bsi_transactions_api_brex_transfers_transaction_id_brex_transfe" UNIQUE ("transaction_id", "brex_transfer_id");



ALTER TABLE ONLY "public"."bsi_transactions_api_ofb_transfers"
    ADD CONSTRAINT "bsi_transactions_api_ofb_transfers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bsi_transactions_deals"
    ADD CONSTRAINT "bsi_transactions_deals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bsi_transactions_instruments"
    ADD CONSTRAINT "bsi_transactions_instruments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bsi_transactions_investors"
    ADD CONSTRAINT "bsi_transactions_investors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bsi_transactions"
    ADD CONSTRAINT "bsi_transactions_pkey" PRIMARY KEY ("id");



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



ALTER TABLE ONLY "public"."contact"
    ADD CONSTRAINT "contact_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contact_types"
    ADD CONSTRAINT "contact_types_code_unique" UNIQUE ("code");



ALTER TABLE ONLY "public"."contact_types"
    ADD CONSTRAINT "contact_types_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contact_contact_types"
    ADD CONSTRAINT "contacts_contact_types_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contact_contact_types"
    ADD CONSTRAINT "contacts_contact_types_unique_assignment" UNIQUE ("contact_id", "contact_types_id");



ALTER TABLE ONLY "public"."countries"
    ADD CONSTRAINT "countries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."custom_loan_fees"
    ADD CONSTRAINT "custom_loan_fees_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."deal_appraisals"
    ADD CONSTRAINT "deal_appraisals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."deal_document_participants"
    ADD CONSTRAINT "deal_document_participants_pkey" PRIMARY KEY ("deal_id", "document_file_id", "source_table", "source_pk");



ALTER TABLE ONLY "public"."deal_guarantors"
    ADD CONSTRAINT "deal_guarantors_unique" UNIQUE ("deal_id", "guarantor_id");



ALTER TABLE ONLY "public"."deal"
    ADD CONSTRAINT "deal_loan_number_key" UNIQUE ("loan_number");



ALTER TABLE ONLY "public"."deal"
    ADD CONSTRAINT "deal_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."deal_property"
    ADD CONSTRAINT "deal_property_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."deal_role_types"
    ADD CONSTRAINT "deal_role_types_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."deal_role_types"
    ADD CONSTRAINT "deal_role_types_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."deal_roles"
    ADD CONSTRAINT "deal_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."deal_guarantors"
    ADD CONSTRAINT "deals_guarantors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bs_debt_instruments"
    ADD CONSTRAINT "debt_instruments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."document_access_permissions_global"
    ADD CONSTRAINT "document_access_permissions_global_unique" UNIQUE ("deal_role_types_id", "document_categories_id");



ALTER TABLE ONLY "public"."document_access_permissions_global"
    ADD CONSTRAINT "document_access_permissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."document_access_permissions"
    ADD CONSTRAINT "document_access_permissions_pkey1" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."document_access_permissions"
    ADD CONSTRAINT "document_access_permissions_unique" UNIQUE ("clerk_org_id", "deal_role_types_id", "document_categories_id");



ALTER TABLE ONLY "public"."document_categories"
    ADD CONSTRAINT "document_categories_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."document_categories"
    ADD CONSTRAINT "document_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."document_files_borrowers"
    ADD CONSTRAINT "document_files_borrowers_document_file_id_borrower_id_key" UNIQUE ("document_file_id", "borrower_id");



ALTER TABLE ONLY "public"."document_files_borrowers"
    ADD CONSTRAINT "document_files_borrowers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."document_files_clerk_orgs"
    ADD CONSTRAINT "document_files_clerk_orgs_document_file_id_clerk_org_id_key" UNIQUE ("document_file_id", "clerk_org_id");



ALTER TABLE ONLY "public"."document_files_clerk_orgs"
    ADD CONSTRAINT "document_files_clerk_orgs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."document_files_clerk_users"
    ADD CONSTRAINT "document_files_clerk_users_document_file_id_clerk_user_id_key" UNIQUE ("document_file_id", "clerk_user_id");



ALTER TABLE ONLY "public"."document_files_clerk_users"
    ADD CONSTRAINT "document_files_clerk_users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."document_files_companies"
    ADD CONSTRAINT "document_files_companies_document_file_id_company_id_key" UNIQUE ("document_file_id", "company_id");



ALTER TABLE ONLY "public"."document_files_companies"
    ADD CONSTRAINT "document_files_companies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."document_files_deals"
    ADD CONSTRAINT "document_files_deals_document_file_id_deal_id_key" UNIQUE ("document_file_id", "deal_id");



ALTER TABLE ONLY "public"."document_files_deals"
    ADD CONSTRAINT "document_files_deals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."document_files_guarantors"
    ADD CONSTRAINT "document_files_guarantors_document_file_id_guarantor_id_key" UNIQUE ("document_file_id", "guarantor_id");



ALTER TABLE ONLY "public"."document_files_guarantors"
    ADD CONSTRAINT "document_files_guarantors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."document_files_properties"
    ADD CONSTRAINT "document_files_properties_document_file_id_property_id_key" UNIQUE ("document_file_id", "property_id");



ALTER TABLE ONLY "public"."document_files_properties"
    ADD CONSTRAINT "document_files_properties_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."document_files"
    ADD CONSTRAINT "document_files_storage_bucket_storage_path_key" UNIQUE ("storage_bucket", "storage_path");



ALTER TABLE ONLY "public"."document_files_tags"
    ADD CONSTRAINT "document_files_tags_document_file_id_document_tag_id_key" UNIQUE ("document_file_id", "document_tag_id");



ALTER TABLE ONLY "public"."document_files_tags"
    ADD CONSTRAINT "document_files_tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."document_roles_files"
    ADD CONSTRAINT "document_roles_files_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."document_roles"
    ADD CONSTRAINT "document_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."document_roles"
    ADD CONSTRAINT "document_roles_role_name_key" UNIQUE ("role_name");



ALTER TABLE ONLY "public"."document_tags"
    ADD CONSTRAINT "document_tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."document_tags"
    ADD CONSTRAINT "document_tags_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."fee"
    ADD CONSTRAINT "fee_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."form_submissions"
    ADD CONSTRAINT "form_submissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."guarantor"
    ADD CONSTRAINT "guarantor_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."loan_application"
    ADD CONSTRAINT "loan_application_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."milestone_templates"
    ADD CONSTRAINT "milestone_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."milestones"
    ADD CONSTRAINT "milestones_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."auth_clerk_orgs_themes"
    ADD CONSTRAINT "org_themes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payroll_ledger_fees_1099"
    ADD CONSTRAINT "payroll_ledger_fees_1099_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payroll_ledger"
    ADD CONSTRAINT "payroll_ledger_pkey" PRIMARY KEY ("id");



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



ALTER TABLE ONLY "public"."rbac_permissions"
    ADD CONSTRAINT "rbac_permissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."rbac_permissions"
    ADD CONSTRAINT "rbac_permissions_unique" UNIQUE ("role", "resource_type", "resource_name");



ALTER TABLE ONLY "public"."weweb_auth_roles"
    ADD CONSTRAINT "roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."task_templates"
    ADD CONSTRAINT "task_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bsi_transactions_api_ofb_transfers"
    ADD CONSTRAINT "unique_bsi_ofb_transfer" UNIQUE ("transaction_id", "ofb_transfer_id");



ALTER TABLE ONLY "public"."company_contact"
    ADD CONSTRAINT "unique_company_contact" UNIQUE ("co_id", "contact_id", "deal_id");



ALTER TABLE ONLY "public"."company_roles"
    ADD CONSTRAINT "unique_company_role_deal" UNIQUE ("co_id", "role_id", "deal_id");



ALTER TABLE ONLY "public"."deal_appraisals"
    ADD CONSTRAINT "unique_deal_appraisal" UNIQUE ("deal_id", "appraisal_id");



ALTER TABLE ONLY "public"."auth_clerk_orgs_themes"
    ADD CONSTRAINT "unique_default_per_org" UNIQUE ("org_id", "is_default") DEFERRABLE INITIALLY DEFERRED;



ALTER TABLE ONLY "public"."api_ofb_transfers_vendors"
    ADD CONSTRAINT "unique_ofb_transfer_vendor" UNIQUE ("ofb_transfer_id");



ALTER TABLE ONLY "public"."api_ofb_vendors_clerk_orgs"
    ADD CONSTRAINT "unique_ofb_vendor_clerk_org" UNIQUE ("ofb_vendor_id", "clerk_org_id");



ALTER TABLE ONLY "public"."api_ofb_vendors_clerk_users"
    ADD CONSTRAINT "unique_ofb_vendor_clerk_user" UNIQUE ("ofb_vendor_id", "clerk_user_id");



ALTER TABLE ONLY "public"."bsi_transactions_deals"
    ADD CONSTRAINT "unique_transaction_deal" UNIQUE ("transaction_id", "deal_id");



ALTER TABLE ONLY "public"."bsi_transactions_document_files"
    ADD CONSTRAINT "unique_transaction_document" UNIQUE ("transaction_id", "document_file_id");



ALTER TABLE ONLY "public"."bsi_transactions_instruments"
    ADD CONSTRAINT "unique_transaction_instrument" UNIQUE ("transaction_id", "instrument_id");



ALTER TABLE ONLY "public"."bsi_transactions_investors"
    ADD CONSTRAINT "unique_transaction_investor" UNIQUE ("transaction_id", "clerk_user_id");



ALTER TABLE ONLY "public"."auth_clerk_orgs"
    ADD CONSTRAINT "user_clerk_orgs_clerk_organization_id_key" UNIQUE ("clerk_org_id");



ALTER TABLE ONLY "public"."auth_clerk_orgs"
    ADD CONSTRAINT "user_clerk_orgs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."auth_clerk_orgs"
    ADD CONSTRAINT "user_clerk_orgs_slug_key" UNIQUE ("clerk_org_slug");



ALTER TABLE ONLY "public"."auth_clerk_orgs_members"
    ADD CONSTRAINT "user_org_memberships_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."document_categories_user_order"
    ADD CONSTRAINT "user_pref_document_categories_order_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."auth_clerk_users"
    ADD CONSTRAINT "user_profile_clerk_id_key" UNIQUE ("clerk_user_id");



ALTER TABLE ONLY "public"."document_categories_user_order"
    ADD CONSTRAINT "userpref_doc_category_order_unique" UNIQUE ("clerk_user_id", "document_categories_id");



ALTER TABLE ONLY "public"."weweb_auth_users_roles"
    ADD CONSTRAINT "users_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."select_uw_outcomes"
    ADD CONSTRAINT "uw_result_id_key" UNIQUE ("id");



ALTER TABLE ONLY "public"."select_uw_outcomes"
    ADD CONSTRAINT "uw_result_pkey" PRIMARY KEY ("id");



CREATE INDEX "api_brex_transfers_brex_transfer_id_idx" ON "public"."api_brex_transfers" USING "btree" ("brex_transfer_id");



CREATE INDEX "api_brex_transfers_counterparty_id_idx" ON "public"."api_brex_transfers" USING "btree" ("counterparty_id");



CREATE INDEX "api_brex_transfers_process_date_idx" ON "public"."api_brex_transfers" USING "btree" ("process_date");



CREATE INDEX "api_brex_transfers_status_idx" ON "public"."api_brex_transfers" USING "btree" ("status");



CREATE INDEX "api_brex_transfers_synced_at_idx" ON "public"."api_brex_transfers" USING "btree" ("synced_at");



CREATE INDEX "api_brex_transfers_vendors_brex_transfer_id_idx" ON "public"."api_brex_transfers_vendors" USING "btree" ("brex_transfer_id");



CREATE INDEX "api_brex_transfers_vendors_brex_vendor_id_idx" ON "public"."api_brex_transfers_vendors" USING "btree" ("brex_vendor_id");



CREATE INDEX "api_brex_transfers_vendors_created_by_user_id_idx" ON "public"."api_brex_transfers_vendors" USING "btree" ("created_by_user_id");



CREATE INDEX "api_brex_transfers_vendors_deleted_at_idx" ON "public"."api_brex_transfers_vendors" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NULL);



CREATE INDEX "api_brex_vendors_account_number_idx" ON "public"."api_brex_vendors" USING "btree" ("account_number");



CREATE INDEX "api_brex_vendors_brex_vendor_id_idx" ON "public"."api_brex_vendors" USING "btree" ("brex_vendor_id");



CREATE INDEX "api_brex_vendors_clerk_orgs_brex_vendor_id_idx" ON "public"."api_brex_vendors_clerk_orgs" USING "btree" ("brex_vendor_id");



CREATE INDEX "api_brex_vendors_clerk_orgs_clerk_org_id_idx" ON "public"."api_brex_vendors_clerk_orgs" USING "btree" ("clerk_org_id");



CREATE INDEX "api_brex_vendors_clerk_users_brex_vendor_id_idx" ON "public"."api_brex_vendors_clerk_users" USING "btree" ("brex_vendor_id");



CREATE INDEX "api_brex_vendors_clerk_users_clerk_user_id_idx" ON "public"."api_brex_vendors_clerk_users" USING "btree" ("clerk_user_id");



CREATE INDEX "api_brex_vendors_name_idx" ON "public"."api_brex_vendors" USING "btree" ("name");



CREATE UNIQUE INDEX "auth_clerk_users_clerk_user_id_key" ON "public"."auth_clerk_users" USING "btree" ("clerk_user_id");



CREATE UNIQUE INDEX "auth_clerk_users_clerk_username_key" ON "public"."auth_clerk_users" USING "btree" ("clerk_username");



CREATE UNIQUE INDEX "bsi_distribution_payments_pkey" ON "public"."bsi_transactions" USING "btree" ("id");



CREATE INDEX "bsi_transactions_api_brex_transfers_brex_transfer_id_idx" ON "public"."bsi_transactions_api_brex_transfers" USING "btree" ("brex_transfer_id");



CREATE INDEX "bsi_transactions_api_brex_transfers_transaction_id_idx" ON "public"."bsi_transactions_api_brex_transfers" USING "btree" ("transaction_id");



CREATE INDEX "deal_guarantors_deal_id_idx" ON "public"."deal_guarantors" USING "btree" ("deal_id");



CREATE INDEX "deal_guarantors_guarantor_id_idx" ON "public"."deal_guarantors" USING "btree" ("guarantor_id");



CREATE INDEX "deal_roles_contact_id_idx" ON "public"."deal_roles" USING "btree" ("contact_id") WHERE ("contact_id" IS NOT NULL);



CREATE INDEX "deal_roles_deal_id_idx" ON "public"."deal_roles" USING "btree" ("deal_id");



CREATE INDEX "deal_roles_role_types_id_idx" ON "public"."deal_roles" USING "btree" ("deal_role_types_id");



CREATE UNIQUE INDEX "deal_roles_unique_contact_role" ON "public"."deal_roles" USING "btree" ("deal_id", "deal_role_types_id", "contact_id") WHERE ("contact_id" IS NOT NULL);



CREATE UNIQUE INDEX "deal_roles_unique_user_role" ON "public"."deal_roles" USING "btree" ("deal_id", "deal_role_types_id", "auth_clerk_users_id") WHERE ("auth_clerk_users_id" IS NOT NULL);



CREATE INDEX "deal_roles_user_id_idx" ON "public"."deal_roles" USING "btree" ("auth_clerk_users_id") WHERE ("auth_clerk_users_id" IS NOT NULL);



CREATE UNIQUE INDEX "document_files_pkey" ON "public"."document_files" USING "btree" ("id");



CREATE INDEX "form_submissions_created_at_idx" ON "public"."form_submissions" USING "btree" ("created_at" DESC);



CREATE INDEX "form_submissions_lender_form_idx" ON "public"."form_submissions" USING "btree" ("lender_slug", "form_slug");



CREATE INDEX "form_submissions_status_idx" ON "public"."form_submissions" USING "btree" ("status");



CREATE INDEX "idx_appraisal_doc" ON "public"."appraisal" USING "btree" ("document_id", "deal_id", "property_id");



CREATE INDEX "idx_auth_clerk_orgs_members_clerk_member_role" ON "public"."auth_clerk_orgs_members" USING "btree" ("clerk_member_role");



CREATE INDEX "idx_auth_clerk_orgs_members_clerk_org_id" ON "public"."auth_clerk_orgs_members" USING "btree" ("clerk_org_id");



CREATE INDEX "idx_auth_clerk_orgs_themes_default" ON "public"."auth_clerk_orgs_themes" USING "btree" ("org_id") WHERE ("is_default" = true);



CREATE INDEX "idx_auth_clerk_orgs_themes_org_id" ON "public"."auth_clerk_orgs_themes" USING "btree" ("org_id");



CREATE INDEX "idx_bank_accounts_bank_code" ON "public"."bank_accounts" USING "btree" ("bank_code");



CREATE INDEX "idx_bank_accounts_is_active" ON "public"."bank_accounts" USING "btree" ("is_active");



CREATE INDEX "idx_bsi_deals_auth_clerk_users_id" ON "public"."bsi_deals_clerk_users" USING "btree" ("clerk_user_id");



CREATE INDEX "idx_bsi_deals_deal_auth_user" ON "public"."bsi_deals_clerk_users" USING "btree" ("deal_id", "clerk_user_id");



CREATE INDEX "idx_bsi_deals_orgs_clerk_org_id" ON "public"."bsi_deals_clerk_orgs" USING "btree" ("clerk_org_id");



CREATE INDEX "idx_bsi_deals_orgs_deal_id" ON "public"."bsi_deals_clerk_orgs" USING "btree" ("deal_id");



CREATE INDEX "idx_bsi_distributions_transactions_distribution_id" ON "public"."bsi_distributions_transactions" USING "btree" ("distribution_id");



CREATE INDEX "idx_bsi_distributions_transactions_transaction_id" ON "public"."bsi_distributions_transactions" USING "btree" ("transaction_id");



CREATE INDEX "idx_bsi_ofb_transfers_ofb_transfer_id" ON "public"."bsi_transactions_api_ofb_transfers" USING "btree" ("ofb_transfer_id");



CREATE INDEX "idx_bsi_ofb_transfers_transaction_id" ON "public"."bsi_transactions_api_ofb_transfers" USING "btree" ("transaction_id");



CREATE INDEX "idx_bsi_statements_auth_clerk_users_id" ON "public"."bsi_statements" USING "btree" ("auth_clerk_users_id");



CREATE INDEX "idx_bsi_statements_file_path" ON "public"."bsi_statements" USING "btree" ("file_path");



CREATE INDEX "idx_bsi_statements_transactions_statement_id" ON "public"."bsi_statements_transactions" USING "btree" ("statement_id");



CREATE INDEX "idx_bsi_statements_transactions_transaction_id" ON "public"."bsi_statements_transactions" USING "btree" ("transaction_id");



CREATE INDEX "idx_bsi_statements_uploaded_at" ON "public"."bsi_statements" USING "btree" ("uploaded_at");



CREATE INDEX "idx_bsi_transaction_document_files_document_file_id" ON "public"."bsi_transactions_document_files" USING "btree" ("document_file_id");



CREATE INDEX "idx_bsi_transaction_document_files_transaction_id" ON "public"."bsi_transactions_document_files" USING "btree" ("transaction_id");



CREATE INDEX "idx_bsi_transactions_clerk_user_id" ON "public"."bsi_transactions" USING "btree" ("clerk_user_id") WHERE ("clerk_user_id" IS NOT NULL);



CREATE INDEX "idx_bsi_transactions_deals_deal_id" ON "public"."bsi_transactions_deals" USING "btree" ("deal_id");



CREATE INDEX "idx_bsi_transactions_deals_transaction_id" ON "public"."bsi_transactions_deals" USING "btree" ("transaction_id");



CREATE INDEX "idx_bsi_transactions_instruments_instrument_id" ON "public"."bsi_transactions_instruments" USING "btree" ("instrument_id");



CREATE INDEX "idx_bsi_transactions_instruments_transaction_id" ON "public"."bsi_transactions_instruments" USING "btree" ("transaction_id");



CREATE INDEX "idx_bsi_transactions_investors_investor_id" ON "public"."bsi_transactions_investors" USING "btree" ("clerk_user_id");



CREATE INDEX "idx_bsi_transactions_investors_org_id" ON "public"."bsi_transactions_investors" USING "btree" ("clerk_org_id");



CREATE INDEX "idx_bsi_transactions_investors_transaction_id" ON "public"."bsi_transactions_investors" USING "btree" ("transaction_id");



CREATE INDEX "idx_btd_txn" ON "public"."bsi_transactions_deals" USING "btree" ("transaction_id", "deal_id");



CREATE INDEX "idx_btdf_txn" ON "public"."bsi_transactions_document_files" USING "btree" ("transaction_id", "document_file_id");



CREATE INDEX "idx_cr_co_deal" ON "public"."company_roles" USING "btree" ("co_id", "deal_id") WHERE ("deal_id" IS NOT NULL);



CREATE INDEX "idx_ddp_deal" ON "public"."deal_document_participants" USING "btree" ("deal_id", "document_file_id");



CREATE INDEX "idx_ddp_doc" ON "public"."deal_document_participants" USING "btree" ("document_file_id");



CREATE INDEX "idx_deal_loan_number" ON "public"."deal" USING "btree" ("loan_number");



CREATE INDEX "idx_debt_instruments_deals_deal_id" ON "public"."bs_debt_instruments_deals" USING "btree" ("deal_id");



CREATE INDEX "idx_dfb_borr" ON "public"."document_files_borrowers" USING "btree" ("borrower_id", "document_file_id");



CREATE INDEX "idx_dfd_deal" ON "public"."document_files_deals" USING "btree" ("deal_id", "document_file_id");



CREATE INDEX "idx_dfg_guar" ON "public"."document_files_guarantors" USING "btree" ("guarantor_id", "document_file_id");



CREATE INDEX "idx_dg_guar" ON "public"."deal_guarantors" USING "btree" ("guarantor_id", "deal_id");



CREATE INDEX "idx_distributions_clerk_org_id" ON "public"."bsi_distributions" USING "btree" ("clerk_org_id");



CREATE INDEX "idx_doc_access_perm_category" ON "public"."document_access_permissions_global" USING "btree" ("document_categories_id");



CREATE INDEX "idx_doc_access_perm_lookup" ON "public"."document_access_permissions" USING "btree" ("clerk_org_id", "deal_role_types_id", "document_categories_id");



CREATE INDEX "idx_doc_access_perm_role" ON "public"."document_access_permissions_global" USING "btree" ("deal_role_types_id");



CREATE INDEX "idx_document_files_borrowers_borrower" ON "public"."document_files_borrowers" USING "btree" ("borrower_id");



CREATE INDEX "idx_document_files_borrowers_doc" ON "public"."document_files_borrowers" USING "btree" ("document_file_id");



CREATE INDEX "idx_document_files_bucket" ON "public"."document_files" USING "btree" ("storage_bucket");



CREATE INDEX "idx_document_files_clerk_orgs_doc" ON "public"."document_files_clerk_orgs" USING "btree" ("document_file_id");



CREATE INDEX "idx_document_files_clerk_orgs_org" ON "public"."document_files_clerk_orgs" USING "btree" ("clerk_org_id");



CREATE INDEX "idx_document_files_clerk_users_doc" ON "public"."document_files_clerk_users" USING "btree" ("document_file_id");



CREATE INDEX "idx_document_files_clerk_users_user" ON "public"."document_files_clerk_users" USING "btree" ("clerk_user_id");



CREATE INDEX "idx_document_files_companies_company" ON "public"."document_files_companies" USING "btree" ("company_id");



CREATE INDEX "idx_document_files_companies_doc" ON "public"."document_files_companies" USING "btree" ("document_file_id");



CREATE INDEX "idx_document_files_deals_deal" ON "public"."document_files_deals" USING "btree" ("deal_id");



CREATE INDEX "idx_document_files_deals_doc" ON "public"."document_files_deals" USING "btree" ("document_file_id");



CREATE INDEX "idx_document_files_document_category_id" ON "public"."document_files" USING "btree" ("document_category_id");



CREATE INDEX "idx_document_files_guarantors_doc" ON "public"."document_files_guarantors" USING "btree" ("document_file_id");



CREATE INDEX "idx_document_files_guarantors_guarantor" ON "public"."document_files_guarantors" USING "btree" ("guarantor_id");



CREATE INDEX "idx_document_files_period" ON "public"."document_files" USING "btree" ("period_start", "period_end");



CREATE INDEX "idx_document_files_properties_doc" ON "public"."document_files_properties" USING "btree" ("document_file_id");



CREATE INDEX "idx_document_files_properties_property" ON "public"."document_files_properties" USING "btree" ("property_id");



CREATE INDEX "idx_document_files_storage_location" ON "public"."document_files" USING "btree" ("storage_bucket", "storage_path");



CREATE INDEX "idx_document_files_tags" ON "public"."document_files" USING "gin" ("tags");



CREATE INDEX "idx_document_files_tags_created_by" ON "public"."document_files_tags" USING "btree" ("created_by");



CREATE INDEX "idx_document_files_tags_doc" ON "public"."document_files_tags" USING "btree" ("document_file_id");



CREATE INDEX "idx_document_files_tags_tag" ON "public"."document_files_tags" USING "btree" ("document_tag_id");



CREATE INDEX "idx_document_tags_created_by" ON "public"."document_tags" USING "btree" ("created_by");



CREATE INDEX "idx_document_tags_name" ON "public"."document_tags" USING "btree" ("name");



CREATE INDEX "idx_document_tags_slug" ON "public"."document_tags" USING "btree" ("slug");



CREATE INDEX "idx_dp_prop" ON "public"."deal_property" USING "btree" ("property_id", "deal_id");



CREATE INDEX "idx_members_user_id" ON "public"."auth_clerk_orgs_members" USING "btree" ("auth_clerk_users_id");



CREATE INDEX "idx_ofb_transfers_counterparty_name" ON "public"."api_ofb_transfers" USING "btree" ("counterparty_name");



CREATE INDEX "idx_ofb_transfers_import_batch_id" ON "public"."api_ofb_transfers" USING "btree" ("import_batch_id");



CREATE INDEX "idx_ofb_transfers_process_date" ON "public"."api_ofb_transfers" USING "btree" ("process_date");



CREATE INDEX "idx_ofb_transfers_vendors_deleted_at" ON "public"."api_ofb_transfers_vendors" USING "btree" ("deleted_at");



CREATE INDEX "idx_ofb_transfers_vendors_vendor_id" ON "public"."api_ofb_transfers_vendors" USING "btree" ("ofb_vendor_id");



CREATE INDEX "idx_ofb_vendors_name" ON "public"."api_ofb_vendors" USING "btree" ("name");



CREATE INDEX "idx_rbac_permissions_lookup" ON "public"."rbac_permissions" USING "btree" ("role", "resource_type", "resource_name") WHERE ("is_active" = true);



CREATE INDEX "idx_rbac_permissions_resource" ON "public"."rbac_permissions" USING "btree" ("resource_type", "resource_name") WHERE ("is_active" = true);



CREATE INDEX "idx_rbac_permissions_role" ON "public"."rbac_permissions" USING "btree" ("role") WHERE ("is_active" = true);



CREATE INDEX "idx_statements_clerk_org_id" ON "public"."bsi_statements" USING "btree" ("clerk_org_id");



CREATE INDEX "idx_transactions_clerk_org_id" ON "public"."bsi_transactions" USING "btree" ("clerk_org_id");



CREATE INDEX "idx_user_pref_doc_cat_order_clerk_user" ON "public"."document_categories_user_order" USING "btree" ("clerk_user_id");



CREATE INDEX "idx_user_profile_email" ON "public"."auth_clerk_users" USING "btree" ("email");



CREATE INDEX "idx_user_profile_is_active_yn" ON "public"."auth_clerk_users" USING "btree" ("is_active_yn");



CREATE INDEX "idx_user_profile_is_banned" ON "public"."auth_clerk_users" USING "btree" ("is_banned");



CREATE INDEX "idx_user_profile_is_internal_yn" ON "public"."auth_clerk_users" USING "btree" ("is_internal_yn");



CREATE INDEX "idx_user_profile_is_locked" ON "public"."auth_clerk_users" USING "btree" ("is_locked");



CREATE INDEX "idx_user_profile_last_active_at" ON "public"."auth_clerk_users" USING "btree" ("last_active_at");



CREATE INDEX "idx_user_profile_last_sign_in_at" ON "public"."auth_clerk_users" USING "btree" ("last_sign_in_at");



CREATE INDEX "idx_user_profile_legal_accepted_at" ON "public"."auth_clerk_users" USING "btree" ("legal_accepted_at");



CREATE INDEX "users_roles_role_id_idx" ON "public"."weweb_auth_users_roles" USING "btree" ("role_id");



CREATE INDEX "users_roles_user_id_idx" ON "public"."weweb_auth_users_roles" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "auto_match_transfer_to_vendor_trigger" AFTER INSERT OR UPDATE ON "public"."api_brex_transfers" FOR EACH ROW EXECUTE FUNCTION "public"."auto_match_transfer_to_vendor"();



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



CREATE OR REPLACE TRIGGER "trg_ddp_company_roles" AFTER INSERT OR DELETE OR UPDATE OF "deal_id", "co_id" ON "public"."company_roles" FOR EACH ROW EXECUTE FUNCTION "public"."trg_ddp_from_company_roles"();



CREATE OR REPLACE TRIGGER "trg_ddp_deal_guarantors" AFTER INSERT OR DELETE ON "public"."deal_guarantors" FOR EACH ROW EXECUTE FUNCTION "public"."trg_ddp_from_deal_guarantors"();



CREATE OR REPLACE TRIGGER "trg_ddp_deal_property" AFTER INSERT OR DELETE ON "public"."deal_property" FOR EACH ROW EXECUTE FUNCTION "public"."trg_ddp_from_deal_property"();



CREATE OR REPLACE TRIGGER "trg_ddp_document_files_borrowers" AFTER INSERT OR DELETE ON "public"."document_files_borrowers" FOR EACH ROW EXECUTE FUNCTION "public"."trg_ddp_from_document_files_borrowers"();



CREATE OR REPLACE TRIGGER "trg_ddp_document_files_companies" AFTER INSERT OR DELETE ON "public"."document_files_companies" FOR EACH ROW EXECUTE FUNCTION "public"."trg_ddp_from_document_files_companies"();



CREATE OR REPLACE TRIGGER "trg_ddp_document_files_deals" AFTER INSERT OR DELETE ON "public"."document_files_deals" FOR EACH ROW EXECUTE FUNCTION "public"."trg_ddp_from_document_files_deals"();



CREATE OR REPLACE TRIGGER "trg_ddp_document_files_guarantors" AFTER INSERT OR DELETE ON "public"."document_files_guarantors" FOR EACH ROW EXECUTE FUNCTION "public"."trg_ddp_from_document_files_guarantors"();



CREATE OR REPLACE TRIGGER "trg_ddp_document_files_properties" AFTER INSERT OR DELETE ON "public"."document_files_properties" FOR EACH ROW EXECUTE FUNCTION "public"."trg_ddp_from_document_files_properties"();



CREATE OR REPLACE TRIGGER "trg_document_access_permissions_updated_at" BEFORE UPDATE ON "public"."document_access_permissions" FOR EACH ROW EXECUTE FUNCTION "public"."tg_set_updated_at_document_access_permissions"();



CREATE OR REPLACE TRIGGER "trg_seed_dap_on_org_insert" AFTER INSERT ON "public"."auth_clerk_orgs" FOR EACH ROW EXECUTE FUNCTION "public"."auth_clerk_orgs_after_insert_seed_dap"();



CREATE OR REPLACE TRIGGER "trg_sync_transaction_to_investors" AFTER INSERT ON "public"."bsi_transactions" FOR EACH ROW EXECUTE FUNCTION "public"."sync_transaction_to_investors"();



CREATE OR REPLACE TRIGGER "trg_sync_transaction_to_investors_on_update" AFTER UPDATE ON "public"."bsi_transactions" FOR EACH ROW EXECUTE FUNCTION "public"."sync_transaction_to_investors_on_update"();



CREATE OR REPLACE TRIGGER "trigger_document_tags_updated_at" BEFORE UPDATE ON "public"."document_tags" FOR EACH ROW EXECUTE FUNCTION "public"."update_document_tags_updated_at"();



CREATE OR REPLACE TRIGGER "validate_deal_allocation_sum_delete" AFTER DELETE ON "public"."bsi_transactions_deals" FOR EACH ROW EXECUTE FUNCTION "public"."check_deal_allocation_sum"();



CREATE OR REPLACE TRIGGER "validate_deal_allocation_sum_insert" AFTER INSERT ON "public"."bsi_transactions_deals" FOR EACH ROW EXECUTE FUNCTION "public"."check_deal_allocation_sum"();



CREATE OR REPLACE TRIGGER "validate_deal_allocation_sum_update" AFTER UPDATE OF "allocation_amount" ON "public"."bsi_transactions_deals" FOR EACH ROW EXECUTE FUNCTION "public"."check_deal_allocation_sum"();



ALTER TABLE ONLY "public"."api_brex_transfers_vendors"
    ADD CONSTRAINT "api_brex_transfers_vendors_brex_transfer_id_fkey" FOREIGN KEY ("brex_transfer_id") REFERENCES "public"."api_brex_transfers"("brex_transfer_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."api_brex_transfers_vendors"
    ADD CONSTRAINT "api_brex_transfers_vendors_brex_vendor_id_fkey" FOREIGN KEY ("brex_vendor_id") REFERENCES "public"."api_brex_vendors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."api_brex_transfers_vendors"
    ADD CONSTRAINT "api_brex_transfers_vendors_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."auth_clerk_users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."api_brex_transfers_vendors"
    ADD CONSTRAINT "api_brex_transfers_vendors_deleted_by_user_id_fkey" FOREIGN KEY ("deleted_by_user_id") REFERENCES "public"."auth_clerk_users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."api_brex_transfers_vendors"
    ADD CONSTRAINT "api_brex_transfers_vendors_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "public"."auth_clerk_users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."api_brex_vendors_clerk_orgs"
    ADD CONSTRAINT "api_brex_vendors_clerk_orgs_brex_vendor_id_fkey" FOREIGN KEY ("brex_vendor_id") REFERENCES "public"."api_brex_vendors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."api_brex_vendors_clerk_orgs"
    ADD CONSTRAINT "api_brex_vendors_clerk_orgs_clerk_org_id_fkey" FOREIGN KEY ("clerk_org_id") REFERENCES "public"."auth_clerk_orgs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."api_brex_vendors_clerk_users"
    ADD CONSTRAINT "api_brex_vendors_clerk_users_brex_vendor_id_fkey" FOREIGN KEY ("brex_vendor_id") REFERENCES "public"."api_brex_vendors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."api_brex_vendors_clerk_users"
    ADD CONSTRAINT "api_brex_vendors_clerk_users_clerk_user_id_fkey" FOREIGN KEY ("clerk_user_id") REFERENCES "public"."auth_clerk_users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."api_ofb_transfers_vendors"
    ADD CONSTRAINT "api_ofb_transfers_vendors_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."auth_clerk_users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."api_ofb_transfers_vendors"
    ADD CONSTRAINT "api_ofb_transfers_vendors_deleted_by_user_id_fkey" FOREIGN KEY ("deleted_by_user_id") REFERENCES "public"."auth_clerk_users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."api_ofb_transfers_vendors"
    ADD CONSTRAINT "api_ofb_transfers_vendors_ofb_transfer_id_fkey" FOREIGN KEY ("ofb_transfer_id") REFERENCES "public"."api_ofb_transfers"("ofb_transfer_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."api_ofb_transfers_vendors"
    ADD CONSTRAINT "api_ofb_transfers_vendors_ofb_vendor_id_fkey" FOREIGN KEY ("ofb_vendor_id") REFERENCES "public"."api_ofb_vendors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."api_ofb_transfers_vendors"
    ADD CONSTRAINT "api_ofb_transfers_vendors_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "public"."auth_clerk_users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."api_ofb_vendors_clerk_orgs"
    ADD CONSTRAINT "api_ofb_vendors_clerk_orgs_clerk_org_id_fkey" FOREIGN KEY ("clerk_org_id") REFERENCES "public"."auth_clerk_orgs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."api_ofb_vendors_clerk_orgs"
    ADD CONSTRAINT "api_ofb_vendors_clerk_orgs_ofb_vendor_id_fkey" FOREIGN KEY ("ofb_vendor_id") REFERENCES "public"."api_ofb_vendors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."api_ofb_vendors_clerk_users"
    ADD CONSTRAINT "api_ofb_vendors_clerk_users_clerk_user_id_fkey" FOREIGN KEY ("clerk_user_id") REFERENCES "public"."auth_clerk_users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."api_ofb_vendors_clerk_users"
    ADD CONSTRAINT "api_ofb_vendors_clerk_users_ofb_vendor_id_fkey" FOREIGN KEY ("ofb_vendor_id") REFERENCES "public"."api_ofb_vendors"("id") ON DELETE CASCADE;



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



ALTER TABLE ONLY "public"."bsi_deals_clerk_orgs"
    ADD CONSTRAINT "bsi_deals_clerk_orgs_clerk_org_id_fkey" FOREIGN KEY ("clerk_org_id") REFERENCES "public"."auth_clerk_orgs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bsi_deals_clerk_orgs"
    ADD CONSTRAINT "bsi_deals_clerk_orgs_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "public"."deal"("id");



ALTER TABLE ONLY "public"."bsi_deals_clerk_users"
    ADD CONSTRAINT "bsi_deals_clerk_users_clerk_user_id_fkey" FOREIGN KEY ("clerk_user_id") REFERENCES "public"."auth_clerk_users"("id");



ALTER TABLE ONLY "public"."bsi_deals_clerk_users"
    ADD CONSTRAINT "bsi_deals_clerk_users_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "public"."deal"("id");



ALTER TABLE ONLY "public"."bsi_distributions"
    ADD CONSTRAINT "bsi_distributions_bsi_contact_id_fkey" FOREIGN KEY ("bsi_contact_id") REFERENCES "public"."contact"("id");



ALTER TABLE ONLY "public"."bsi_distributions"
    ADD CONSTRAINT "bsi_distributions_clerk_org_id_fkey" FOREIGN KEY ("clerk_org_id") REFERENCES "public"."auth_clerk_orgs"("id");



ALTER TABLE ONLY "public"."bsi_distributions"
    ADD CONSTRAINT "bsi_distributions_clerk_org_member_id_fkey" FOREIGN KEY ("clerk_org_member_id") REFERENCES "public"."auth_clerk_orgs_members"("id");



ALTER TABLE ONLY "public"."bsi_distributions"
    ADD CONSTRAINT "bsi_distributions_clerk_user_id_fkey" FOREIGN KEY ("clerk_user_id") REFERENCES "public"."auth_clerk_users"("id");



ALTER TABLE ONLY "public"."bsi_distributions"
    ADD CONSTRAINT "bsi_distributions_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "public"."deal"("id");



ALTER TABLE ONLY "public"."bsi_distributions"
    ADD CONSTRAINT "bsi_distributions_instrument_id_fkey" FOREIGN KEY ("instrument_id") REFERENCES "public"."bs_debt_instruments"("id");



ALTER TABLE ONLY "public"."bsi_distributions_transactions"
    ADD CONSTRAINT "bsi_distributions_transactions_distribution_id_fkey" FOREIGN KEY ("distribution_id") REFERENCES "public"."bsi_distributions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bsi_distributions_transactions"
    ADD CONSTRAINT "bsi_distributions_transactions_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "public"."bsi_transactions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bsi_statements"
    ADD CONSTRAINT "bsi_statements_auth_clerk_users_id_fkey" FOREIGN KEY ("auth_clerk_users_id") REFERENCES "public"."auth_clerk_users"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."bsi_statements"
    ADD CONSTRAINT "bsi_statements_clerk_org_id_fkey" FOREIGN KEY ("clerk_org_id") REFERENCES "public"."auth_clerk_orgs"("id");



ALTER TABLE ONLY "public"."bsi_statements_transactions"
    ADD CONSTRAINT "bsi_statements_transactions_statement_id_fkey" FOREIGN KEY ("statement_id") REFERENCES "public"."bsi_statements"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bsi_statements_transactions"
    ADD CONSTRAINT "bsi_statements_transactions_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "public"."bsi_transactions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bsi_transactions_api_brex_transfers"
    ADD CONSTRAINT "bsi_transactions_api_brex_transfers_brex_transfer_id_fkey" FOREIGN KEY ("brex_transfer_id") REFERENCES "public"."api_brex_transfers"("brex_transfer_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bsi_transactions_api_brex_transfers"
    ADD CONSTRAINT "bsi_transactions_api_brex_transfers_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "public"."bsi_transactions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bsi_transactions_api_ofb_transfers"
    ADD CONSTRAINT "bsi_transactions_api_ofb_transfers_ofb_transfer_id_fkey" FOREIGN KEY ("ofb_transfer_id") REFERENCES "public"."api_ofb_transfers"("ofb_transfer_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bsi_transactions_api_ofb_transfers"
    ADD CONSTRAINT "bsi_transactions_api_ofb_transfers_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "public"."bsi_transactions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bsi_transactions"
    ADD CONSTRAINT "bsi_transactions_clerk_org_id_fkey" FOREIGN KEY ("clerk_org_id") REFERENCES "public"."auth_clerk_orgs"("id");



ALTER TABLE ONLY "public"."bsi_transactions"
    ADD CONSTRAINT "bsi_transactions_clerk_user_id_fkey" FOREIGN KEY ("clerk_user_id") REFERENCES "public"."auth_clerk_users"("id");



ALTER TABLE ONLY "public"."bsi_transactions_investors"
    ADD CONSTRAINT "bsi_transactions_investors_clerk_user_id_fkey" FOREIGN KEY ("clerk_user_id") REFERENCES "public"."auth_clerk_users"("id") ON DELETE RESTRICT;



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



ALTER TABLE ONLY "public"."contact_contact_types"
    ADD CONSTRAINT "contacts_contact_types_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."contact"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."contact_contact_types"
    ADD CONSTRAINT "contacts_contact_types_contact_types_id_fkey" FOREIGN KEY ("contact_types_id") REFERENCES "public"."contact_types"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."deal_appraisals"
    ADD CONSTRAINT "deal_appraisals_appraisal_id_fkey" FOREIGN KEY ("appraisal_id") REFERENCES "public"."appraisal"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."deal_appraisals"
    ADD CONSTRAINT "deal_appraisals_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "public"."deal"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."deal_appraisals"
    ADD CONSTRAINT "deal_appraisals_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "public"."property"("id");



ALTER TABLE ONLY "public"."deal"
    ADD CONSTRAINT "deal_broker_company_id_fkey" FOREIGN KEY ("broker_company_id") REFERENCES "public"."company"("co_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."deal_document_participants"
    ADD CONSTRAINT "deal_document_participants_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "public"."deal"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."deal_document_participants"
    ADD CONSTRAINT "deal_document_participants_document_file_id_fkey" FOREIGN KEY ("document_file_id") REFERENCES "public"."document_files"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."deal"
    ADD CONSTRAINT "deal_escrow_company_id_fkey" FOREIGN KEY ("escrow_company_id") REFERENCES "public"."company"("co_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."deal"
    ADD CONSTRAINT "deal_insurance_carrier_company_id_fkey" FOREIGN KEY ("insurance_carrier_company_id") REFERENCES "public"."company"("co_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."deal"
    ADD CONSTRAINT "deal_loan_buyer_company_id_fkey" FOREIGN KEY ("loan_buyer_company_id") REFERENCES "public"."company"("co_id");



ALTER TABLE ONLY "public"."deal_roles"
    ADD CONSTRAINT "deal_roles_auth_clerk_users_id_fkey" FOREIGN KEY ("auth_clerk_users_id") REFERENCES "public"."auth_clerk_users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."deal_roles"
    ADD CONSTRAINT "deal_roles_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."contact"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."deal_roles"
    ADD CONSTRAINT "deal_roles_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "public"."deal"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."deal_roles"
    ADD CONSTRAINT "deal_roles_deal_role_types_id_fkey" FOREIGN KEY ("deal_role_types_id") REFERENCES "public"."deal_role_types"("id");



ALTER TABLE ONLY "public"."deal"
    ADD CONSTRAINT "deal_title_company_id_fkey" FOREIGN KEY ("title_company_id") REFERENCES "public"."company"("co_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."deal_guarantors"
    ADD CONSTRAINT "deals_guarantors_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "public"."deal"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."deal_guarantors"
    ADD CONSTRAINT "deals_guarantors_guarantor_id_fkey" FOREIGN KEY ("guarantor_id") REFERENCES "public"."guarantor"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."document_access_permissions"
    ADD CONSTRAINT "document_access_permissions_clerk_org_id_fkey" FOREIGN KEY ("clerk_org_id") REFERENCES "public"."auth_clerk_orgs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."document_access_permissions_global"
    ADD CONSTRAINT "document_access_permissions_deal_role_types_id_fkey" FOREIGN KEY ("deal_role_types_id") REFERENCES "public"."deal_role_types"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."document_access_permissions"
    ADD CONSTRAINT "document_access_permissions_deal_role_types_id_fkey1" FOREIGN KEY ("deal_role_types_id") REFERENCES "public"."deal_role_types"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."document_access_permissions_global"
    ADD CONSTRAINT "document_access_permissions_document_categories_id_fkey" FOREIGN KEY ("document_categories_id") REFERENCES "public"."document_categories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."document_access_permissions"
    ADD CONSTRAINT "document_access_permissions_document_categories_id_fkey1" FOREIGN KEY ("document_categories_id") REFERENCES "public"."document_categories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."document_access_permissions"
    ADD CONSTRAINT "document_access_permissions_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "public"."auth_clerk_users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."document_files_borrowers"
    ADD CONSTRAINT "document_files_borrowers_borrower_id_fkey" FOREIGN KEY ("borrower_id") REFERENCES "public"."borrower"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."document_files_borrowers"
    ADD CONSTRAINT "document_files_borrowers_document_file_id_fkey" FOREIGN KEY ("document_file_id") REFERENCES "public"."document_files"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."document_files_clerk_orgs"
    ADD CONSTRAINT "document_files_clerk_orgs_clerk_org_id_fkey" FOREIGN KEY ("clerk_org_id") REFERENCES "public"."auth_clerk_orgs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."document_files_clerk_orgs"
    ADD CONSTRAINT "document_files_clerk_orgs_document_file_id_fkey" FOREIGN KEY ("document_file_id") REFERENCES "public"."document_files"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."document_files_clerk_users"
    ADD CONSTRAINT "document_files_clerk_users_clerk_user_id_fkey" FOREIGN KEY ("clerk_user_id") REFERENCES "public"."auth_clerk_users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."document_files_clerk_users"
    ADD CONSTRAINT "document_files_clerk_users_document_file_id_fkey" FOREIGN KEY ("document_file_id") REFERENCES "public"."document_files"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."document_files_companies"
    ADD CONSTRAINT "document_files_companies_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."company"("co_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."document_files_companies"
    ADD CONSTRAINT "document_files_companies_document_file_id_fkey" FOREIGN KEY ("document_file_id") REFERENCES "public"."document_files"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."document_files_deals"
    ADD CONSTRAINT "document_files_deals_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "public"."deal"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."document_files_deals"
    ADD CONSTRAINT "document_files_deals_document_file_id_fkey" FOREIGN KEY ("document_file_id") REFERENCES "public"."document_files"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."document_files"
    ADD CONSTRAINT "document_files_document_category_id_fkey" FOREIGN KEY ("document_category_id") REFERENCES "public"."document_categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."document_files_guarantors"
    ADD CONSTRAINT "document_files_guarantors_document_file_id_fkey" FOREIGN KEY ("document_file_id") REFERENCES "public"."document_files"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."document_files_guarantors"
    ADD CONSTRAINT "document_files_guarantors_guarantor_id_fkey" FOREIGN KEY ("guarantor_id") REFERENCES "public"."guarantor"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."document_files_properties"
    ADD CONSTRAINT "document_files_properties_document_file_id_fkey" FOREIGN KEY ("document_file_id") REFERENCES "public"."document_files"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."document_files_properties"
    ADD CONSTRAINT "document_files_properties_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "public"."property"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."document_files_tags"
    ADD CONSTRAINT "document_files_tags_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."auth_clerk_users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."document_files_tags"
    ADD CONSTRAINT "document_files_tags_document_file_id_fkey" FOREIGN KEY ("document_file_id") REFERENCES "public"."document_files"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."document_files_tags"
    ADD CONSTRAINT "document_files_tags_document_tag_id_fkey" FOREIGN KEY ("document_tag_id") REFERENCES "public"."document_tags"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."document_roles_files"
    ADD CONSTRAINT "document_roles_files_document_files_id_fkey" FOREIGN KEY ("document_files_id") REFERENCES "public"."document_files"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."document_roles_files"
    ADD CONSTRAINT "document_roles_files_document_roles_id_fkey" FOREIGN KEY ("document_roles_id") REFERENCES "public"."document_roles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."document_tags"
    ADD CONSTRAINT "document_tags_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."auth_clerk_users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."bsi_transactions_deals"
    ADD CONSTRAINT "fk_deal" FOREIGN KEY ("deal_id") REFERENCES "public"."deal"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."bsi_transactions_document_files"
    ADD CONSTRAINT "fk_document_file" FOREIGN KEY ("document_file_id") REFERENCES "public"."document_files"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bsi_transactions_instruments"
    ADD CONSTRAINT "fk_instrument" FOREIGN KEY ("instrument_id") REFERENCES "public"."bs_debt_instruments"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."bsi_transactions_investors"
    ADD CONSTRAINT "fk_org" FOREIGN KEY ("clerk_org_id") REFERENCES "public"."auth_clerk_orgs"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."bsi_transactions_deals"
    ADD CONSTRAINT "fk_transaction" FOREIGN KEY ("transaction_id") REFERENCES "public"."bsi_transactions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bsi_transactions_investors"
    ADD CONSTRAINT "fk_transaction" FOREIGN KEY ("transaction_id") REFERENCES "public"."bsi_transactions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bsi_transactions_instruments"
    ADD CONSTRAINT "fk_transaction" FOREIGN KEY ("transaction_id") REFERENCES "public"."bsi_transactions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bsi_transactions_document_files"
    ADD CONSTRAINT "fk_transaction" FOREIGN KEY ("transaction_id") REFERENCES "public"."bsi_transactions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."guarantor"
    ADD CONSTRAINT "guarantor_borrower_id_fkey" FOREIGN KEY ("borrower_id") REFERENCES "public"."borrower"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."loan_application"
    ADD CONSTRAINT "loan_application_application_deal_id_fkey" FOREIGN KEY ("application_deal_id") REFERENCES "public"."deal"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."milestones"
    ADD CONSTRAINT "milestones_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "public"."deal"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."milestones"
    ADD CONSTRAINT "milestones_milestone_template_id_fkey" FOREIGN KEY ("milestone_template_id") REFERENCES "public"."milestone_templates"("id");



ALTER TABLE ONLY "public"."auth_clerk_orgs_themes"
    ADD CONSTRAINT "org_themes_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."auth_clerk_users"("id");



ALTER TABLE ONLY "public"."auth_clerk_orgs_themes"
    ADD CONSTRAINT "org_themes_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."auth_clerk_orgs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payroll_ledger"
    ADD CONSTRAINT "payroll_ledger_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "public"."deal"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."payroll_ledger_fees_1099"
    ADD CONSTRAINT "payroll_ledger_fees_1099_payee_id_fkey" FOREIGN KEY ("payee_id") REFERENCES "public"."contact"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."payroll_ledger_fees_1099"
    ADD CONSTRAINT "payroll_ledger_fees_1099_payroll_ledger_id_fkey" FOREIGN KEY ("payroll_ledger_id") REFERENCES "public"."payroll_ledger"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."property"
    ADD CONSTRAINT "property_hoa_contact_fkey" FOREIGN KEY ("hoa_contact") REFERENCES "public"."contact"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."property_income"
    ADD CONSTRAINT "property_income_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "public"."property"("id");



ALTER TABLE ONLY "public"."property_reapi"
    ADD CONSTRAINT "property_reapi_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "public"."property"("id");



ALTER TABLE ONLY "public"."custom_loan_fees"
    ADD CONSTRAINT "public_custom_loan_fees_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "public"."deal"("id");



ALTER TABLE ONLY "public"."deal"
    ADD CONSTRAINT "public_deal_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."company"("co_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."deal_property"
    ADD CONSTRAINT "public_deal_property_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "public"."deal"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."deal"
    ADD CONSTRAINT "public_deal_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "public"."property"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."deal_property"
    ADD CONSTRAINT "public_deal_property_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "public"."property"("id");



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



ALTER TABLE ONLY "public"."document_categories_user_order"
    ADD CONSTRAINT "user_pref_document_categories_order_document_categories_id_fkey" FOREIGN KEY ("document_categories_id") REFERENCES "public"."document_categories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."auth_clerk_users"
    ADD CONSTRAINT "user_profile_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."contact"("id");



ALTER TABLE ONLY "public"."weweb_auth_users_roles"
    ADD CONSTRAINT "weweb_auth_users_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."weweb_auth_roles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."weweb_auth_users_roles"
    ADD CONSTRAINT "weweb_auth_users_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Admin and assigned users can manage tasks" ON "public"."tasks" TO "authenticated" USING (("public"."is_admin"() OR ("public"."get_current_user_id"() = "assigned_to")));



CREATE POLICY "Admin can access all appraisals" ON "public"."appraisal" TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Admin can delete BSI-OFB transfer links" ON "public"."bsi_transactions_api_ofb_transfers" FOR DELETE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Admin can delete OFB transfer-vendor matches" ON "public"."api_ofb_transfers_vendors" FOR DELETE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Admin can delete OFB transfers" ON "public"."api_ofb_transfers" FOR DELETE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Admin can delete OFB vendor-org matches" ON "public"."api_ofb_vendors_clerk_orgs" FOR DELETE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Admin can delete OFB vendor-user matches" ON "public"."api_ofb_vendors_clerk_users" FOR DELETE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Admin can delete OFB vendors" ON "public"."api_ofb_vendors" FOR DELETE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Admin can insert BSI-OFB transfer links" ON "public"."bsi_transactions_api_ofb_transfers" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admin can insert OFB transfer-vendor matches" ON "public"."api_ofb_transfers_vendors" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admin can insert OFB transfers" ON "public"."api_ofb_transfers" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admin can insert OFB vendor-org matches" ON "public"."api_ofb_vendors_clerk_orgs" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admin can insert OFB vendor-user matches" ON "public"."api_ofb_vendors_clerk_users" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admin can insert OFB vendors" ON "public"."api_ofb_vendors" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admin can manage CBA request guarantors" ON "public"."cba_requests_guarantors" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admin can manage CBA requests" ON "public"."cba_requests" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admin can manage UW outcomes" ON "public"."select_uw_outcomes" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admin can manage borrower" ON "public"."borrower" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admin can manage company" ON "public"."company" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admin can manage company contacts" ON "public"."company_contact" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admin can manage company members" ON "public"."company_member" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admin can manage company role definitions" ON "public"."company_roles_defined" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admin can manage company roles" ON "public"."company_roles" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admin can manage constants" ON "public"."constants" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admin can manage contact type junctions" ON "public"."contact_contact_types" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admin can manage contact types" ON "public"."contact_types" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admin can manage contacts" ON "public"."contact" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admin can manage custom loan fees" ON "public"."custom_loan_fees" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admin can manage deal appraisals" ON "public"."deal_appraisals" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admin can manage deal properties" ON "public"."deal_property" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admin can manage distributions" ON "public"."bsi_distributions" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admin can manage document role assignments" ON "public"."document_roles_files" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admin can manage document roles" ON "public"."document_roles" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admin can manage document_tags" ON "public"."document_tags" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admin can manage fees" ON "public"."fee" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admin can manage instrument-deal links" ON "public"."bs_debt_instruments_deals" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admin can manage loan_application" ON "public"."loan_application" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admin can manage milestone templates" ON "public"."milestone_templates" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admin can manage milestones" ON "public"."milestones" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admin can manage payroll fees" ON "public"."payroll_ledger_fees_1099" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admin can manage payroll submissions" ON "public"."payroll_ledger" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admin can manage property" ON "public"."property" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admin can manage property income" ON "public"."property_income" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admin can manage task templates" ON "public"."task_templates" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admin can select all bsi_deals_clerk_users" ON "public"."bsi_deals_clerk_users" FOR SELECT TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Admin can select all statements" ON "public"."bsi_statements" FOR SELECT TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Admin can update BSI-OFB transfer links" ON "public"."bsi_transactions_api_ofb_transfers" FOR UPDATE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Admin can update OFB transfer-vendor matches" ON "public"."api_ofb_transfers_vendors" FOR UPDATE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Admin can update OFB transfers" ON "public"."api_ofb_transfers" FOR UPDATE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Admin can update OFB vendor-org matches" ON "public"."api_ofb_vendors_clerk_orgs" FOR UPDATE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Admin can update OFB vendor-user matches" ON "public"."api_ofb_vendors_clerk_users" FOR UPDATE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Admin can update OFB vendors" ON "public"."api_ofb_vendors" FOR UPDATE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Admin can view all BSI-OFB transfer links" ON "public"."bsi_transactions_api_ofb_transfers" FOR SELECT TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Admin can view all OFB transfer-vendor matches" ON "public"."api_ofb_transfers_vendors" FOR SELECT TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Admin can view all OFB transfers" ON "public"."api_ofb_transfers" FOR SELECT TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Admin can view all OFB vendor-org matches" ON "public"."api_ofb_vendors_clerk_orgs" FOR SELECT TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Admin can view all OFB vendor-user matches" ON "public"."api_ofb_vendors_clerk_users" FOR SELECT TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Admin can view all OFB vendors" ON "public"."api_ofb_vendors" FOR SELECT TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Admin full access deal_guarantors" ON "public"."deal_guarantors" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admin full access to deals" ON "public"."deal" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can delete instruments" ON "public"."bs_debt_instruments" FOR DELETE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Admins can delete statements" ON "public"."bsi_statements" FOR DELETE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Admins can delete transactions" ON "public"."bsi_transactions" FOR DELETE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Admins can insert instruments" ON "public"."bs_debt_instruments" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can insert statements" ON "public"."bsi_statements" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can insert transactions" ON "public"."bsi_transactions" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage RBAC permissions" ON "public"."rbac_permissions" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage bsi_distributions_transactions" ON "public"."bsi_distributions_transactions" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage bsi_statements_transactions" ON "public"."bsi_statements_transactions" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage orgs" ON "public"."auth_clerk_orgs" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage transfer-vendor matches" ON "public"."api_brex_transfers_vendors" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage users" ON "public"."auth_clerk_users" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage vendor-org matches" ON "public"."api_brex_vendors_clerk_orgs" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage vendor-user matches" ON "public"."api_brex_vendors_clerk_users" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage vendors" ON "public"."api_brex_vendors" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can read all instruments" ON "public"."bs_debt_instruments" FOR SELECT TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Admins can update instruments" ON "public"."bs_debt_instruments" FOR UPDATE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Admins can update statements" ON "public"."bsi_statements" FOR UPDATE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Admins can update transactions" ON "public"."bsi_transactions" FOR UPDATE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "All authenticated users can read UW outcomes" ON "public"."select_uw_outcomes" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "All authenticated users can read constants" ON "public"."constants" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "All authenticated users can read contact type junctions" ON "public"."contact_contact_types" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "All authenticated users can read contact types" ON "public"."contact_types" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "All authenticated users can read countries" ON "public"."countries" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "All authenticated users can read document roles" ON "public"."document_roles" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "All authenticated users can read fees" ON "public"."fee" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow API Insert" ON "public"."company" FOR INSERT TO "anon" WITH CHECK (true);



COMMENT ON POLICY "Allow API Insert" ON "public"."company" IS 'INTENTIONAL: Allows anonymous inserts for public form submissions. Security Advisor warning accepted.';



CREATE POLICY "Allow API Insert" ON "public"."loan_application" FOR INSERT TO "anon" WITH CHECK (true);



COMMENT ON POLICY "Allow API Insert" ON "public"."loan_application" IS 'INTENTIONAL: Allows anonymous inserts for public loan application form submissions. Security Advisor warning accepted.';



CREATE POLICY "Allow auth select" ON "public"."borrower" FOR SELECT TO "anon", "authenticated" USING (true);



CREATE POLICY "Allow auth select" ON "public"."guarantor" FOR SELECT TO "anon", "authenticated" USING (true);



CREATE POLICY "Allow auth select" ON "public"."property" FOR SELECT TO "anon", "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to select all property_reapi records" ON "public"."property_reapi" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow users to insert property records" ON "public"."property_reapi" FOR INSERT TO "authenticated" WITH CHECK (true);



COMMENT ON POLICY "Allow users to insert property records" ON "public"."property_reapi" IS 'INTENTIONAL: Allows authenticated users to insert property records from RealEstateAPI lookups. Security Advisor warning accepted.';



CREATE POLICY "Authenticated users can read active permissions" ON "public"."rbac_permissions" FOR SELECT TO "authenticated" USING (("is_active" = true));



CREATE POLICY "Authenticated users can read document_tags" ON "public"."document_tags" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can view function backups" ON "public"."_function_backups_20251118" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Balance sheet investors can insert their own statements" ON "public"."bsi_statements" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_users" "acu"
  WHERE (("acu"."clerk_user_id" = ("auth"."jwt"() ->> 'sub'::"text")) AND ("acu"."personal_role" = 'balance_sheet_investor'::"text") AND ("bsi_statements"."auth_clerk_users_id" = "acu"."id")))));



CREATE POLICY "Balance sheet investors can select their statements" ON "public"."bsi_statements" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_users" "acu"
  WHERE (("acu"."clerk_user_id" = ("auth"."jwt"() ->> 'sub'::"text")) AND (("acu"."personal_role" = 'admin'::"text") OR (("acu"."personal_role" = 'balance_sheet_investor'::"text") AND ("bsi_statements"."auth_clerk_users_id" = "acu"."id")))))));



CREATE POLICY "Enable read access for all users" ON "public"."deal" FOR SELECT USING (true);



CREATE POLICY "Internal users can manage deal guarantors" ON "public"."deal_guarantors" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Only admins can delete bsi_deals_clerk_orgs" ON "public"."bsi_deals_clerk_orgs" FOR DELETE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Only admins can insert bsi_deals_clerk_orgs" ON "public"."bsi_deals_clerk_orgs" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_admin"());



CREATE POLICY "Only admins can update bsi_deals_clerk_orgs" ON "public"."bsi_deals_clerk_orgs" FOR UPDATE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Only service_role can manage function backups" ON "public"."_function_backups_20251118" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Org admins can delete themes" ON "public"."auth_clerk_orgs_themes" FOR DELETE USING ((("org_id" = ANY ("public"."get_current_user_org_ids"())) AND "public"."is_admin"()));



CREATE POLICY "Org admins can insert themes" ON "public"."auth_clerk_orgs_themes" FOR INSERT WITH CHECK ((("org_id" = ANY ("public"."get_current_user_org_ids"())) AND "public"."is_admin"()));



CREATE POLICY "Org admins can manage own members" ON "public"."auth_clerk_orgs_members" TO "authenticated" USING ("public"."is_org_admin"("clerk_org_id")) WITH CHECK ("public"."is_org_admin"("clerk_org_id"));



CREATE POLICY "Org admins can update own org" ON "public"."auth_clerk_orgs" FOR UPDATE TO "authenticated" USING ("public"."is_org_admin"("id")) WITH CHECK ("public"."is_org_admin"("id"));



CREATE POLICY "Org admins can update themes" ON "public"."auth_clerk_orgs_themes" FOR UPDATE USING ((("org_id" = ANY ("public"."get_current_user_org_ids"())) AND "public"."is_admin"())) WITH CHECK ((("org_id" = ANY ("public"."get_current_user_org_ids"())) AND "public"."is_admin"()));



CREATE POLICY "Org admins view own deal links" ON "public"."bsi_deals_clerk_orgs" FOR SELECT TO "authenticated" USING ("public"."is_org_admin"("clerk_org_id"));



CREATE POLICY "Org members and admins can read distributions" ON "public"."bsi_distributions" FOR SELECT USING (("public"."is_admin"() OR (EXISTS ( SELECT 1
   FROM "public"."auth_clerk_orgs_members" "m"
  WHERE (("m"."auth_clerk_users_id" = "public"."get_current_user_id"()) AND ("m"."clerk_org_id" = "bsi_distributions"."clerk_org_id"))))));



CREATE POLICY "Org members and admins can read instrument-deal links" ON "public"."bs_debt_instruments_deals" FOR SELECT USING (("public"."is_admin"() OR (EXISTS ( SELECT 1
   FROM ("public"."bsi_deals_clerk_orgs" "dorg"
     JOIN "public"."auth_clerk_orgs_members" "m" ON (("m"."clerk_org_id" = "dorg"."clerk_org_id")))
  WHERE (("dorg"."deal_id" = "bs_debt_instruments_deals"."deal_id") AND ("m"."auth_clerk_users_id" = "public"."get_current_user_id"()))))));



CREATE POLICY "Org members can read linked distributions" ON "public"."bsi_distributions" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_orgs_members" "m"
  WHERE (("m"."auth_clerk_users_id" = "public"."get_current_user_id"()) AND ("m"."clerk_org_id" = "bsi_distributions"."clerk_org_id")))));



CREATE POLICY "Org members can read linked instrument-deals" ON "public"."bs_debt_instruments_deals" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."bsi_deals_clerk_orgs" "dorg"
     JOIN "public"."auth_clerk_orgs_members" "m" ON (("m"."clerk_org_id" = "dorg"."clerk_org_id")))
  WHERE (("dorg"."deal_id" = "bs_debt_instruments_deals"."deal_id") AND ("m"."auth_clerk_users_id" = "public"."get_current_user_id"())))));



CREATE POLICY "Org members can select bsi_deals_clerk_orgs" ON "public"."bsi_deals_clerk_orgs" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."auth_clerk_users" "p"
     JOIN "public"."auth_clerk_orgs_members" "m" ON (("p"."id" = "m"."auth_clerk_users_id")))
  WHERE (("m"."clerk_org_id" = "bsi_deals_clerk_orgs"."clerk_org_id") AND ("p"."clerk_user_id" = ("auth"."jwt"() ->> 'sub'::"text"))))));



CREATE POLICY "Public can view roles" ON "public"."weweb_auth_roles" FOR SELECT TO "anon", "authenticated" USING (true);



CREATE POLICY "Public can view users_roles" ON "public"."weweb_auth_users_roles" FOR SELECT TO "anon", "authenticated" USING (true);



CREATE POLICY "Return data for API insert" ON "public"."company" FOR SELECT USING (true);



CREATE POLICY "Service role can delete roles" ON "public"."weweb_auth_roles" FOR DELETE TO "service_role" USING (true);



CREATE POLICY "Service role can delete users_roles" ON "public"."weweb_auth_users_roles" FOR DELETE TO "service_role" USING (true);



CREATE POLICY "Service role can insert new users" ON "public"."auth_clerk_users" FOR INSERT TO "service_role" WITH CHECK (true);



CREATE POLICY "Service role can insert roles" ON "public"."weweb_auth_roles" FOR INSERT TO "service_role" WITH CHECK (true);



CREATE POLICY "Service role can insert users_roles" ON "public"."weweb_auth_users_roles" FOR INSERT TO "service_role" WITH CHECK (true);



CREATE POLICY "Service role can manage api_brex_transfers" ON "public"."api_brex_transfers" USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Service role can manage api_brex_vendors" ON "public"."api_brex_vendors" USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Service role can manage api_brex_vendors_clerk_orgs" ON "public"."api_brex_vendors_clerk_orgs" USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Service role can manage api_brex_vendors_clerk_users" ON "public"."api_brex_vendors_clerk_users" USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Service role can manage bsi_transactions_api_brex_transfers" ON "public"."bsi_transactions_api_brex_transfers" USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Service role can manage transfer-vendor matches" ON "public"."api_brex_transfers_vendors" USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Service role can read all profiles" ON "public"."auth_clerk_users" FOR SELECT TO "service_role" USING (true);



CREATE POLICY "Service role can update roles" ON "public"."weweb_auth_roles" FOR UPDATE TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role can update user profiles" ON "public"."auth_clerk_users" FOR UPDATE TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role can update users_roles" ON "public"."weweb_auth_users_roles" FOR UPDATE TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Users can link documents to their transactions" ON "public"."bsi_transactions_document_files" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."auth_clerk_users" "acu"
     JOIN "public"."bsi_transactions" "t" ON (("t"."clerk_user_id" = "acu"."id")))
  WHERE (("acu"."clerk_user_id" = ("auth"."jwt"() ->> 'sub'::"text")) AND ("t"."id" = "bsi_transactions_document_files"."transaction_id") AND (("acu"."personal_role" = 'admin'::"text") OR ("acu"."personal_role" = 'balance_sheet_investor'::"text"))))));



CREATE POLICY "Users can read own distributions" ON "public"."bsi_distributions" FOR SELECT TO "authenticated" USING (("clerk_user_id" = "public"."get_current_user_id"()));



CREATE POLICY "Users can read own instrument-deals" ON "public"."bs_debt_instruments_deals" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."bsi_deals_clerk_users" "du"
  WHERE (("du"."deal_id" = "bs_debt_instruments_deals"."deal_id") AND ("du"."clerk_user_id" = "public"."get_current_user_id"())))));



CREATE POLICY "Users can read their matched vendors" ON "public"."api_brex_vendors" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM ("public"."api_brex_vendors_clerk_users" "avcu"
     JOIN "public"."auth_clerk_users" "acu" ON (("avcu"."clerk_user_id" = "acu"."id")))
  WHERE (("avcu"."brex_vendor_id" = "api_brex_vendors"."id") AND ("acu"."clerk_user_id" = ("auth"."jwt"() ->> 'sub'::"text"))))) OR (EXISTS ( SELECT 1
   FROM ((("public"."api_brex_vendors_clerk_orgs" "avco"
     JOIN "public"."auth_clerk_orgs" "aco" ON (("avco"."clerk_org_id" = "aco"."id")))
     JOIN "public"."auth_clerk_orgs_members" "acom" ON (("acom"."clerk_org_id" = "aco"."id")))
     JOIN "public"."auth_clerk_users" "acu" ON (("acom"."auth_clerk_users_id" = "acu"."id")))
  WHERE (("avco"."brex_vendor_id" = "api_brex_vendors"."id") AND ("acu"."clerk_user_id" = ("auth"."jwt"() ->> 'sub'::"text")))))));



CREATE POLICY "Users can read their transaction transfer links" ON "public"."bsi_transactions_api_brex_transfers" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM (("public"."bsi_transactions" "bt"
     JOIN "public"."bsi_transactions_investors" "bti" ON (("bti"."transaction_id" = "bt"."id")))
     JOIN "public"."auth_clerk_users" "acu" ON (("bti"."clerk_user_id" = "acu"."id")))
  WHERE (("bt"."id" = "bsi_transactions_api_brex_transfers"."transaction_id") AND ("acu"."clerk_user_id" = ("auth"."jwt"() ->> 'sub'::"text"))))) OR (EXISTS ( SELECT 1
   FROM (((("public"."bsi_transactions" "bt"
     JOIN "public"."bsi_transactions_investors" "bti" ON (("bti"."transaction_id" = "bt"."id")))
     JOIN "public"."auth_clerk_orgs" "aco" ON (("bti"."clerk_org_id" = "aco"."id")))
     JOIN "public"."auth_clerk_orgs_members" "acom" ON (("acom"."clerk_org_id" = "aco"."id")))
     JOIN "public"."auth_clerk_users" "acu" ON (("acom"."auth_clerk_users_id" = "acu"."id")))
  WHERE (("bt"."id" = "bsi_transactions_api_brex_transfers"."transaction_id") AND ("acu"."clerk_user_id" = ("auth"."jwt"() ->> 'sub'::"text")))))));



CREATE POLICY "Users can read transfers for their matched vendors" ON "public"."api_brex_transfers" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM (("public"."api_brex_vendors" "av"
     JOIN "public"."api_brex_vendors_clerk_users" "avcu" ON (("avcu"."brex_vendor_id" = "av"."id")))
     JOIN "public"."auth_clerk_users" "acu" ON (("avcu"."clerk_user_id" = "acu"."id")))
  WHERE (("av"."brex_vendor_id" = "api_brex_transfers"."counterparty_id") AND ("acu"."clerk_user_id" = ("auth"."jwt"() ->> 'sub'::"text"))))) OR (EXISTS ( SELECT 1
   FROM (((("public"."api_brex_vendors" "av"
     JOIN "public"."api_brex_vendors_clerk_orgs" "avco" ON (("avco"."brex_vendor_id" = "av"."id")))
     JOIN "public"."auth_clerk_orgs" "aco" ON (("avco"."clerk_org_id" = "aco"."id")))
     JOIN "public"."auth_clerk_orgs_members" "acom" ON (("acom"."clerk_org_id" = "aco"."id")))
     JOIN "public"."auth_clerk_users" "acu" ON (("acom"."auth_clerk_users_id" = "acu"."id")))
  WHERE (("av"."brex_vendor_id" = "api_brex_transfers"."counterparty_id") AND ("acu"."clerk_user_id" = ("auth"."jwt"() ->> 'sub'::"text"))))) OR (EXISTS ( SELECT 1
   FROM ((("public"."api_brex_transfers_vendors" "atv"
     JOIN "public"."api_brex_vendors" "av" ON (("av"."id" = "atv"."brex_vendor_id")))
     JOIN "public"."api_brex_vendors_clerk_users" "avcu" ON (("avcu"."brex_vendor_id" = "av"."id")))
     JOIN "public"."auth_clerk_users" "acu" ON (("avcu"."clerk_user_id" = "acu"."id")))
  WHERE (("atv"."brex_transfer_id" = "api_brex_transfers"."brex_transfer_id") AND ("acu"."clerk_user_id" = ("auth"."jwt"() ->> 'sub'::"text"))))) OR (EXISTS ( SELECT 1
   FROM ((((("public"."api_brex_transfers_vendors" "atv"
     JOIN "public"."api_brex_vendors" "av" ON (("av"."id" = "atv"."brex_vendor_id")))
     JOIN "public"."api_brex_vendors_clerk_orgs" "avco" ON (("avco"."brex_vendor_id" = "av"."id")))
     JOIN "public"."auth_clerk_orgs" "aco" ON (("avco"."clerk_org_id" = "aco"."id")))
     JOIN "public"."auth_clerk_orgs_members" "acom" ON (("acom"."clerk_org_id" = "aco"."id")))
     JOIN "public"."auth_clerk_users" "acu" ON (("acom"."auth_clerk_users_id" = "acu"."id")))
  WHERE (("atv"."brex_transfer_id" = "api_brex_transfers"."brex_transfer_id") AND ("acu"."clerk_user_id" = ("auth"."jwt"() ->> 'sub'::"text")))))));



COMMENT ON POLICY "Users can read transfers for their matched vendors" ON "public"."api_brex_transfers" IS 'Users can see transfers matched to their vendors via counterparty_id (automatic) or via junction table (manual/automatic).';



CREATE POLICY "Users can select their own contact" ON "public"."contact" FOR SELECT TO "authenticated" USING (("email_address" = ("auth"."jwt"() ->> 'email'::"text")));



CREATE POLICY "Users can select their own profile" ON "public"."auth_clerk_users" FOR SELECT TO "authenticated" USING (("clerk_user_id" = ("auth"."jwt"() ->> 'sub'::"text")));



CREATE POLICY "Users can unlink their documents" ON "public"."bsi_transactions_document_files" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."auth_clerk_users" "acu"
     JOIN "public"."bsi_transactions" "t" ON (("t"."clerk_user_id" = "acu"."id")))
  WHERE (("acu"."clerk_user_id" = ("auth"."jwt"() ->> 'sub'::"text")) AND ("t"."id" = "bsi_transactions_document_files"."transaction_id") AND (("acu"."personal_role" = 'admin'::"text") OR ("acu"."personal_role" = 'balance_sheet_investor'::"text"))))));



CREATE POLICY "Users can update their profile" ON "public"."auth_clerk_users" FOR UPDATE TO "authenticated" USING (("clerk_user_id" = ("auth"."jwt"() ->> 'sub'::"text"))) WITH CHECK (("clerk_user_id" = ("auth"."jwt"() ->> 'sub'::"text")));



CREATE POLICY "Users can view CBA requests for their deals" ON "public"."cba_requests" FOR SELECT TO "authenticated" USING (("deal_id" IN ( SELECT "bd"."deal_id"
   FROM ((("public"."bsi_deals_clerk_users" "bd"
     JOIN "public"."bsi_deals_clerk_orgs" "bdo" ON (("bd"."id" = "bdo"."deal_id")))
     JOIN "public"."auth_clerk_orgs_members" "om" ON (("bdo"."clerk_org_id" = "om"."clerk_org_id")))
     JOIN "public"."auth_clerk_users" "acu" ON (("om"."auth_clerk_users_id" = "acu"."id")))
  WHERE ("acu"."clerk_user_id" = ("auth"."jwt"() ->> 'sub'::"text")))));



CREATE POLICY "Users can view appraisals for their deals" ON "public"."appraisal" FOR SELECT TO "authenticated" USING (("deal_id" IN ( SELECT "bd"."deal_id"
   FROM ((("public"."bsi_deals_clerk_users" "bd"
     JOIN "public"."bsi_deals_clerk_orgs" "bdo" ON (("bd"."id" = "bdo"."deal_id")))
     JOIN "public"."auth_clerk_orgs_members" "om" ON (("bdo"."clerk_org_id" = "om"."clerk_org_id")))
     JOIN "public"."auth_clerk_users" "acu" ON (("om"."auth_clerk_users_id" = "acu"."id")))
  WHERE ("acu"."clerk_user_id" = ("auth"."jwt"() ->> 'sub'::"text")))));



CREATE POLICY "Users can view co-investor orgs" ON "public"."auth_clerk_orgs" FOR SELECT TO "authenticated" USING (("id" = ANY ("public"."get_co_investor_org_ids"())));



CREATE POLICY "Users can view co-investor profiles" ON "public"."auth_clerk_users" FOR SELECT TO "authenticated" USING (("id" = ANY ("public"."get_co_investor_user_ids"())));



CREATE POLICY "Users can view deal appraisals for their deals" ON "public"."deal_appraisals" FOR SELECT TO "authenticated" USING (("deal_id" IN ( SELECT "bd"."deal_id"
   FROM ((("public"."bsi_deals_clerk_users" "bd"
     JOIN "public"."bsi_deals_clerk_orgs" "bdo" ON (("bd"."id" = "bdo"."deal_id")))
     JOIN "public"."auth_clerk_orgs_members" "om" ON (("bdo"."clerk_org_id" = "om"."clerk_org_id")))
     JOIN "public"."auth_clerk_users" "acu" ON (("om"."auth_clerk_users_id" = "acu"."id")))
  WHERE ("acu"."clerk_user_id" = ("auth"."jwt"() ->> 'sub'::"text")))));



CREATE POLICY "Users can view documents for their transactions" ON "public"."bsi_transactions_document_files" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_users" "acu"
  WHERE (("acu"."clerk_user_id" = ("auth"."jwt"() ->> 'sub'::"text")) AND (("acu"."personal_role" = 'admin'::"text") OR (EXISTS ( SELECT 1
           FROM "public"."bsi_transactions" "t"
          WHERE (("t"."id" = "bsi_transactions_document_files"."transaction_id") AND ("t"."clerk_user_id" = "acu"."id")))))))));



CREATE POLICY "Users can view fees for their deals" ON "public"."custom_loan_fees" FOR SELECT TO "authenticated" USING (("deal_id" IN ( SELECT "bd"."deal_id"
   FROM ((("public"."bsi_deals_clerk_users" "bd"
     JOIN "public"."bsi_deals_clerk_orgs" "bdo" ON (("bd"."id" = "bdo"."deal_id")))
     JOIN "public"."auth_clerk_orgs_members" "om" ON (("bdo"."clerk_org_id" = "om"."clerk_org_id")))
     JOIN "public"."auth_clerk_users" "acu" ON (("om"."auth_clerk_users_id" = "acu"."id")))
  WHERE ("acu"."clerk_user_id" = ("auth"."jwt"() ->> 'sub'::"text")))));



CREATE POLICY "Users can view org memberships" ON "public"."auth_clerk_orgs_members" FOR SELECT TO "authenticated" USING (("public"."is_admin"() OR ("auth_clerk_users_id" = "public"."get_current_user_id"())));



CREATE POLICY "Users can view own transactions" ON "public"."bsi_transactions" FOR SELECT TO "authenticated" USING (("public"."is_admin"() OR ("id" IN ( SELECT "get_accessible_transaction_ids"."transaction_id"
   FROM "public"."get_accessible_transaction_ids"() "get_accessible_transaction_ids"("transaction_id")))));



CREATE POLICY "Users can view payroll submissions for their deals" ON "public"."payroll_ledger" FOR SELECT TO "authenticated" USING (("deal_id" IN ( SELECT "bd"."deal_id"
   FROM ((("public"."bsi_deals_clerk_users" "bd"
     JOIN "public"."bsi_deals_clerk_orgs" "bdo" ON (("bd"."id" = "bdo"."deal_id")))
     JOIN "public"."auth_clerk_orgs_members" "om" ON (("bdo"."clerk_org_id" = "om"."clerk_org_id")))
     JOIN "public"."auth_clerk_users" "acu" ON (("om"."auth_clerk_users_id" = "acu"."id")))
  WHERE ("acu"."clerk_user_id" = ("auth"."jwt"() ->> 'sub'::"text")))));



CREATE POLICY "Users can view property data for their deals" ON "public"."deal_property" FOR SELECT TO "authenticated" USING (("deal_id" IN ( SELECT "bd"."deal_id"
   FROM ((("public"."bsi_deals_clerk_users" "bd"
     JOIN "public"."bsi_deals_clerk_orgs" "bdo" ON (("bd"."id" = "bdo"."deal_id")))
     JOIN "public"."auth_clerk_orgs_members" "om" ON (("bdo"."clerk_org_id" = "om"."clerk_org_id")))
     JOIN "public"."auth_clerk_users" "acu" ON (("om"."auth_clerk_users_id" = "acu"."id")))
  WHERE ("acu"."clerk_user_id" = ("auth"."jwt"() ->> 'sub'::"text")))));



CREATE POLICY "Users can view property income for their deals" ON "public"."property_income" FOR SELECT TO "authenticated" USING (("property_id" IN ( SELECT "dp"."property_id"
   FROM (((("public"."deal_property" "dp"
     JOIN "public"."bsi_deals_clerk_users" "bd" ON (("dp"."deal_id" = "bd"."deal_id")))
     JOIN "public"."bsi_deals_clerk_orgs" "bdo" ON (("bd"."id" = "bdo"."deal_id")))
     JOIN "public"."auth_clerk_orgs_members" "om" ON (("bdo"."clerk_org_id" = "om"."clerk_org_id")))
     JOIN "public"."auth_clerk_users" "acu" ON (("om"."auth_clerk_users_id" = "acu"."id")))
  WHERE ("acu"."clerk_user_id" = ("auth"."jwt"() ->> 'sub'::"text")))));



CREATE POLICY "Users can view their org themes" ON "public"."auth_clerk_orgs_themes" FOR SELECT USING (("org_id" = ANY ("public"."get_current_user_org_ids"())));



CREATE POLICY "Users can view their own organizations" ON "public"."auth_clerk_orgs" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."auth_clerk_orgs_members" "m"
     JOIN "public"."auth_clerk_users" "p" ON (("m"."auth_clerk_users_id" = "p"."id")))
  WHERE (("m"."clerk_org_id" = "auth_clerk_orgs"."id") AND ("p"."clerk_user_id" = ("auth"."jwt"() ->> 'sub'::"text"))))));



CREATE POLICY "Users can view their transaction allocations" ON "public"."bsi_transactions_investors" FOR SELECT TO "authenticated" USING (("public"."is_admin"() OR ("clerk_user_id" = "public"."get_current_user_id"()) OR ("clerk_org_id" = ANY ("public"."get_current_user_org_ids"()))));



CREATE POLICY "Users can view transaction deal allocations" ON "public"."bsi_transactions_deals" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_users" "acu"
  WHERE (("acu"."clerk_user_id" = ("auth"."jwt"() ->> 'sub'::"text")) AND (("acu"."personal_role" = 'admin'::"text") OR (EXISTS ( SELECT 1
           FROM "public"."bsi_transactions" "t"
          WHERE (("t"."id" = "bsi_transactions_deals"."transaction_id") AND ("t"."clerk_user_id" = "acu"."id")))))))));



CREATE POLICY "Users can view transaction instrument allocations" ON "public"."bsi_transactions_instruments" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."auth_clerk_users" "acu"
  WHERE (("acu"."clerk_user_id" = ("auth"."jwt"() ->> 'sub'::"text")) AND (("acu"."personal_role" = 'admin'::"text") OR (EXISTS ( SELECT 1
           FROM "public"."bsi_transactions" "t"
          WHERE (("t"."id" = "bsi_transactions_instruments"."transaction_id") AND ("t"."clerk_user_id" = "acu"."id")))))))));



CREATE POLICY "Users view deal_guarantors via role" ON "public"."deal_guarantors" FOR SELECT TO "authenticated" USING ("public"."check_user_deal_role"("deal_id"));



CREATE POLICY "Users view deals via role" ON "public"."deal" FOR SELECT TO "authenticated" USING ("public"."check_user_deal_role"("id"));



ALTER TABLE "public"."_function_backups_20251118" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."api_brex_transfers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."api_brex_transfers_vendors" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."api_brex_vendors" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."api_brex_vendors_clerk_orgs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."api_brex_vendors_clerk_users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."api_ofb_transfers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."api_ofb_transfers_vendors" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."api_ofb_vendors" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."api_ofb_vendors_clerk_orgs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."api_ofb_vendors_clerk_users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."appraisal" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."auth_clerk_orgs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."auth_clerk_orgs_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."auth_clerk_orgs_themes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."auth_clerk_users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bank_accounts" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "bank_accounts_admin_only" ON "public"."bank_accounts" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



ALTER TABLE "public"."borrower" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bs_debt_instruments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bs_debt_instruments_deals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bsi_deals_clerk_orgs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bsi_deals_clerk_users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bsi_distributions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bsi_distributions_transactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bsi_statements" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bsi_statements_transactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bsi_transactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bsi_transactions_api_brex_transfers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bsi_transactions_api_ofb_transfers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bsi_transactions_deals" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "bsi_transactions_delete_rbac" ON "public"."bsi_transactions" FOR DELETE TO "authenticated" USING ("public"."check_table_access"('bsi_transactions'::"text", 'delete'::"text", "clerk_user_id", NULL::bigint, NULL::bigint));



ALTER TABLE "public"."bsi_transactions_document_files" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "bsi_transactions_insert_rbac" ON "public"."bsi_transactions" FOR INSERT TO "authenticated" WITH CHECK ("public"."check_table_access"('bsi_transactions'::"text", 'insert'::"text", "clerk_user_id", NULL::bigint, NULL::bigint));



ALTER TABLE "public"."bsi_transactions_instruments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bsi_transactions_investors" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "bsi_transactions_select_rbac" ON "public"."bsi_transactions" FOR SELECT TO "authenticated" USING ("public"."check_table_access"('bsi_transactions'::"text", 'select'::"text", "clerk_user_id", NULL::bigint, NULL::bigint));



CREATE POLICY "bsi_transactions_update_rbac" ON "public"."bsi_transactions" FOR UPDATE TO "authenticated" USING ("public"."check_table_access"('bsi_transactions'::"text", 'update'::"text", "clerk_user_id", NULL::bigint, NULL::bigint)) WITH CHECK ("public"."check_table_access"('bsi_transactions'::"text", 'update'::"text", "clerk_user_id", NULL::bigint, NULL::bigint));



ALTER TABLE "public"."cba_requests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cba_requests_guarantors" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."company" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."company_contact" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."company_member" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."company_roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."company_roles_defined" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."constants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."contact" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."contact_contact_types" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."contact_types" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."countries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."custom_loan_fees" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "dap_global_internal_admin_read" ON "public"."document_access_permissions_global" FOR SELECT TO "authenticated" USING ("public"."is_internal_admin"());



CREATE POLICY "dap_internal_admin_all" ON "public"."document_access_permissions" TO "authenticated" USING ("public"."is_internal_admin"()) WITH CHECK ("public"."is_internal_admin"());



CREATE POLICY "dap_org_admin_manage" ON "public"."document_access_permissions" TO "authenticated" USING ("public"."is_org_admin"("clerk_org_id")) WITH CHECK ("public"."is_org_admin"("clerk_org_id"));



CREATE POLICY "ddp_select" ON "public"."deal_document_participants" FOR SELECT TO "authenticated" USING ("public"."can_access_document"("document_file_id", 'view'::"text"));



CREATE POLICY "ddp_write_admin_only" ON "public"."deal_document_participants" TO "authenticated" USING ("public"."is_internal_admin"()) WITH CHECK ("public"."is_internal_admin"());



ALTER TABLE "public"."deal" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."deal_appraisals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."deal_document_participants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."deal_guarantors" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."deal_property" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."deal_role_types" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "deal_role_types_select_authenticated" ON "public"."deal_role_types" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."deal_roles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "deal_roles_admin_all" ON "public"."deal_roles" TO "authenticated" USING ("public"."is_internal_admin"()) WITH CHECK ("public"."is_internal_admin"());



CREATE POLICY "deal_roles_delete_own" ON "public"."deal_roles" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."bsi_deals_clerk_users" "bdcu"
  WHERE (("bdcu"."deal_id" = "deal_roles"."deal_id") AND ("bdcu"."clerk_user_id" = "public"."get_current_user_id"())))));



CREATE POLICY "deal_roles_insert_own" ON "public"."deal_roles" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."bsi_deals_clerk_users" "bdcu"
  WHERE (("bdcu"."deal_id" = "deal_roles"."deal_id") AND ("bdcu"."clerk_user_id" = "public"."get_current_user_id"())))));



CREATE POLICY "deal_roles_select_own" ON "public"."deal_roles" FOR SELECT TO "authenticated" USING (((EXISTS ( SELECT 1
   FROM "public"."bsi_deals_clerk_users" "bdcu"
  WHERE (("bdcu"."deal_id" = "deal_roles"."deal_id") AND ("bdcu"."clerk_user_id" = "public"."get_current_user_id"())))) OR ("auth_clerk_users_id" = "public"."get_current_user_id"())));



CREATE POLICY "deal_roles_update_own" ON "public"."deal_roles" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."bsi_deals_clerk_users" "bdcu"
  WHERE (("bdcu"."deal_id" = "deal_roles"."deal_id") AND ("bdcu"."clerk_user_id" = "public"."get_current_user_id"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."bsi_deals_clerk_users" "bdcu"
  WHERE (("bdcu"."deal_id" = "deal_roles"."deal_id") AND ("bdcu"."clerk_user_id" = "public"."get_current_user_id"())))));



CREATE POLICY "deny all public access" ON "public"."form_submissions" USING (false);



CREATE POLICY "df_delete" ON "public"."document_files" FOR DELETE TO "authenticated" USING ("public"."can_access_document"("id", 'delete'::"text"));



CREATE POLICY "df_insert" ON "public"."document_files" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_internal_admin"());



CREATE POLICY "df_select" ON "public"."document_files" FOR SELECT TO "authenticated" USING ("public"."can_access_document"("id", 'view'::"text"));



CREATE POLICY "df_update" ON "public"."document_files" FOR UPDATE TO "authenticated" USING ("public"."is_internal_admin"()) WITH CHECK ("public"."is_internal_admin"());



CREATE POLICY "dfb_delete" ON "public"."document_files_borrowers" FOR DELETE TO "authenticated" USING ("public"."can_access_document"("document_file_id", 'delete'::"text"));



CREATE POLICY "dfb_insert" ON "public"."document_files_borrowers" FOR INSERT TO "authenticated" WITH CHECK (("public"."is_internal_admin"() OR (EXISTS ( SELECT 1
   FROM (("public"."document_files" "df"
     JOIN "public"."guarantor" "g" ON (("g"."borrower_id" = "document_files_borrowers"."borrower_id")))
     JOIN "public"."deal_guarantors" "dg" ON (("dg"."guarantor_id" = "g"."id")))
  WHERE (("df"."id" = "document_files_borrowers"."document_file_id") AND ("df"."document_category_id" IS NOT NULL) AND "public"."can_access_deal_document"("dg"."deal_id", "df"."document_category_id", 'insert'::"text"))))));



CREATE POLICY "dfb_select" ON "public"."document_files_borrowers" FOR SELECT TO "authenticated" USING ("public"."can_access_document"("document_file_id", 'view'::"text"));



CREATE POLICY "dfc_delete" ON "public"."document_files_companies" FOR DELETE TO "authenticated" USING ("public"."can_access_document"("document_file_id", 'delete'::"text"));



CREATE POLICY "dfc_insert" ON "public"."document_files_companies" FOR INSERT TO "authenticated" WITH CHECK (("public"."is_internal_admin"() OR (EXISTS ( SELECT 1
   FROM ("public"."document_files" "df"
     JOIN "public"."company_roles" "cr" ON ((("cr"."co_id" = "document_files_companies"."company_id") AND ("cr"."deal_id" IS NOT NULL))))
  WHERE (("df"."id" = "document_files_companies"."document_file_id") AND ("df"."document_category_id" IS NOT NULL) AND "public"."can_access_deal_document"("cr"."deal_id", "df"."document_category_id", 'insert'::"text"))))));



CREATE POLICY "dfc_select" ON "public"."document_files_companies" FOR SELECT TO "authenticated" USING ("public"."can_access_document"("document_file_id", 'view'::"text"));



CREATE POLICY "dfco_delete" ON "public"."document_files_clerk_orgs" FOR DELETE TO "authenticated" USING (("public"."is_internal_admin"() OR "public"."is_org_admin"("clerk_org_id")));



CREATE POLICY "dfco_insert" ON "public"."document_files_clerk_orgs" FOR INSERT TO "authenticated" WITH CHECK (("public"."is_internal_admin"() OR "public"."is_org_admin"("clerk_org_id")));



CREATE POLICY "dfco_select" ON "public"."document_files_clerk_orgs" FOR SELECT TO "authenticated" USING (("public"."is_internal_admin"() OR (EXISTS ( SELECT 1
   FROM "public"."auth_clerk_orgs_members" "m"
  WHERE (("m"."auth_clerk_users_id" = "public"."get_current_user_id"()) AND ("m"."clerk_org_id" = "document_files_clerk_orgs"."clerk_org_id"))))));



CREATE POLICY "dfcu_select" ON "public"."document_files_clerk_users" FOR SELECT TO "authenticated" USING (("public"."is_internal_admin"() OR ("clerk_user_id" = "public"."get_current_user_id"())));



CREATE POLICY "dfcu_write_admin_only" ON "public"."document_files_clerk_users" TO "authenticated" USING ("public"."is_internal_admin"()) WITH CHECK ("public"."is_internal_admin"());



CREATE POLICY "dfd_delete" ON "public"."document_files_deals" FOR DELETE TO "authenticated" USING ("public"."can_access_document"("document_file_id", 'delete'::"text"));



CREATE POLICY "dfd_insert" ON "public"."document_files_deals" FOR INSERT TO "authenticated" WITH CHECK (("public"."is_internal_admin"() OR (EXISTS ( SELECT 1
   FROM "public"."document_files" "df"
  WHERE (("df"."id" = "document_files_deals"."document_file_id") AND ("df"."document_category_id" IS NOT NULL) AND "public"."can_access_deal_document"("document_files_deals"."deal_id", "df"."document_category_id", 'insert'::"text"))))));



CREATE POLICY "dfd_select" ON "public"."document_files_deals" FOR SELECT TO "authenticated" USING ("public"."can_access_document"("document_file_id", 'view'::"text"));



CREATE POLICY "dfg_delete" ON "public"."document_files_guarantors" FOR DELETE TO "authenticated" USING ("public"."can_access_document"("document_file_id", 'delete'::"text"));



CREATE POLICY "dfg_insert" ON "public"."document_files_guarantors" FOR INSERT TO "authenticated" WITH CHECK (("public"."is_internal_admin"() OR (EXISTS ( SELECT 1
   FROM ("public"."document_files" "df"
     JOIN "public"."deal_guarantors" "dg" ON (("dg"."guarantor_id" = "document_files_guarantors"."guarantor_id")))
  WHERE (("df"."id" = "document_files_guarantors"."document_file_id") AND ("df"."document_category_id" IS NOT NULL) AND "public"."can_access_deal_document"("dg"."deal_id", "df"."document_category_id", 'insert'::"text"))))));



CREATE POLICY "dfg_select" ON "public"."document_files_guarantors" FOR SELECT TO "authenticated" USING ("public"."can_access_document"("document_file_id", 'view'::"text"));



CREATE POLICY "dfp_delete" ON "public"."document_files_properties" FOR DELETE TO "authenticated" USING ("public"."can_access_document"("document_file_id", 'delete'::"text"));



CREATE POLICY "dfp_insert" ON "public"."document_files_properties" FOR INSERT TO "authenticated" WITH CHECK (("public"."is_internal_admin"() OR (EXISTS ( SELECT 1
   FROM ("public"."document_files" "df"
     JOIN "public"."deal_property" "dp" ON (("dp"."property_id" = "document_files_properties"."property_id")))
  WHERE (("df"."id" = "document_files_properties"."document_file_id") AND ("df"."document_category_id" IS NOT NULL) AND "public"."can_access_deal_document"("dp"."deal_id", "df"."document_category_id", 'insert'::"text"))))));



CREATE POLICY "dfp_select" ON "public"."document_files_properties" FOR SELECT TO "authenticated" USING ("public"."can_access_document"("document_file_id", 'view'::"text"));



CREATE POLICY "dft_delete" ON "public"."document_files_tags" FOR DELETE TO "authenticated" USING ("public"."can_access_document"("document_file_id", 'delete'::"text"));



CREATE POLICY "dft_insert" ON "public"."document_files_tags" FOR INSERT TO "authenticated" WITH CHECK (("public"."is_internal_admin"() OR "public"."can_access_document"("document_file_id", 'insert'::"text")));



CREATE POLICY "dft_select" ON "public"."document_files_tags" FOR SELECT TO "authenticated" USING ("public"."can_access_document"("document_file_id", 'view'::"text"));



ALTER TABLE "public"."document_access_permissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."document_access_permissions_global" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."document_categories" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "document_categories_admin_all" ON "public"."document_categories" TO "authenticated" USING ("public"."is_internal_admin"()) WITH CHECK ("public"."is_internal_admin"());



CREATE POLICY "document_categories_select_authenticated" ON "public"."document_categories" FOR SELECT TO "authenticated" USING (("is_active" = true));



ALTER TABLE "public"."document_categories_user_order" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "document_categories_user_order_own" ON "public"."document_categories_user_order" TO "authenticated" USING (("clerk_user_id" = "public"."get_clerk_user_id"())) WITH CHECK (("clerk_user_id" = "public"."get_clerk_user_id"()));



ALTER TABLE "public"."document_files" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."document_files_borrowers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."document_files_clerk_orgs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."document_files_clerk_users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."document_files_companies" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."document_files_deals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."document_files_guarantors" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."document_files_properties" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."document_files_tags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."document_roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."document_roles_files" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."document_tags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."fee" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."form_submissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."guarantor" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."loan_application" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."milestone_templates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."milestones" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "milestones_delete_rbac" ON "public"."milestones" FOR DELETE TO "authenticated" USING ("public"."check_table_access"('milestones'::"text", 'delete'::"text", NULL::bigint, NULL::bigint, "deal_id"));



CREATE POLICY "milestones_insert_rbac" ON "public"."milestones" FOR INSERT TO "authenticated" WITH CHECK ("public"."check_table_access"('milestones'::"text", 'insert'::"text", NULL::bigint, NULL::bigint, "deal_id"));



CREATE POLICY "milestones_select_rbac" ON "public"."milestones" FOR SELECT TO "authenticated" USING ("public"."check_table_access"('milestones'::"text", 'select'::"text", NULL::bigint, NULL::bigint, "deal_id"));



CREATE POLICY "milestones_update_rbac" ON "public"."milestones" FOR UPDATE TO "authenticated" USING ("public"."check_table_access"('milestones'::"text", 'update'::"text", NULL::bigint, NULL::bigint, "deal_id")) WITH CHECK ("public"."check_table_access"('milestones'::"text", 'update'::"text", NULL::bigint, NULL::bigint, "deal_id"));



ALTER TABLE "public"."payroll_ledger" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payroll_ledger_fees_1099" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."property" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."property_income" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."property_reapi" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."rbac_permissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."select_uw_outcomes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."task_templates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tasks" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "tasks_delete_rbac" ON "public"."tasks" FOR DELETE TO "authenticated" USING ("public"."check_table_access"('tasks'::"text", 'delete'::"text", "assigned_to", NULL::bigint, "deal_id"));



CREATE POLICY "tasks_insert_rbac" ON "public"."tasks" FOR INSERT TO "authenticated" WITH CHECK ("public"."check_table_access"('tasks'::"text", 'insert'::"text", "assigned_to", NULL::bigint, "deal_id"));



CREATE POLICY "tasks_select_rbac" ON "public"."tasks" FOR SELECT TO "authenticated" USING ("public"."check_table_access"('tasks'::"text", 'select'::"text", "assigned_to", NULL::bigint, "deal_id"));



CREATE POLICY "tasks_update_rbac" ON "public"."tasks" FOR UPDATE TO "authenticated" USING ("public"."check_table_access"('tasks'::"text", 'update'::"text", "assigned_to", NULL::bigint, "deal_id")) WITH CHECK ("public"."check_table_access"('tasks'::"text", 'update'::"text", "assigned_to", NULL::bigint, "deal_id"));



ALTER TABLE "public"."weweb_auth_roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."weweb_auth_users_roles" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";
GRANT USAGE ON SCHEMA "public" TO "postgres";



GRANT ALL ON FUNCTION "public"."auth_clerk_orgs_after_insert_seed_dap"() TO "anon";
GRANT ALL ON FUNCTION "public"."auth_clerk_orgs_after_insert_seed_dap"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."auth_clerk_orgs_after_insert_seed_dap"() TO "service_role";



GRANT ALL ON FUNCTION "public"."auto_match_transfer_to_vendor"() TO "anon";
GRANT ALL ON FUNCTION "public"."auto_match_transfer_to_vendor"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."auto_match_transfer_to_vendor"() TO "service_role";



GRANT ALL ON FUNCTION "public"."can_access_deal_document"("p_deal_id" bigint, "p_document_category_id" bigint, "p_action" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."can_access_deal_document"("p_deal_id" bigint, "p_document_category_id" bigint, "p_action" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_access_deal_document"("p_deal_id" bigint, "p_document_category_id" bigint, "p_action" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."can_access_deal_document"("p_deal_id" bigint, "p_document_category_code" "text", "p_action" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."can_access_deal_document"("p_deal_id" bigint, "p_document_category_code" "text", "p_action" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_access_deal_document"("p_deal_id" bigint, "p_document_category_code" "text", "p_action" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."can_access_document"("p_document_file_id" bigint, "p_action" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."can_access_document"("p_document_file_id" bigint, "p_action" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_access_document"("p_document_file_id" bigint, "p_action" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_deal_allocation_sum"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_deal_allocation_sum"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_deal_allocation_sum"() TO "service_role";



GRANT ALL ON FUNCTION "public"."check_table_access"("p_table_name" "text", "p_action" "text", "p_user_owner_id" bigint, "p_org_owner_id" bigint, "p_deal_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."check_table_access"("p_table_name" "text", "p_action" "text", "p_user_owner_id" bigint, "p_org_owner_id" bigint, "p_deal_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_table_access"("p_table_name" "text", "p_action" "text", "p_user_owner_id" bigint, "p_org_owner_id" bigint, "p_deal_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."check_user_deal_role"("p_deal_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."check_user_deal_role"("p_deal_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_user_deal_role"("p_deal_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."count_pending_brex_transfer_syncs"() TO "anon";
GRANT ALL ON FUNCTION "public"."count_pending_brex_transfer_syncs"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."count_pending_brex_transfer_syncs"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_document_with_deal_link"("p_document_name" "text", "p_document_category_id" bigint, "p_deal_id" bigint, "p_storage_bucket" "text", "p_original_filename" "text", "p_file_type" "text", "p_file_size" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."create_document_with_deal_link"("p_document_name" "text", "p_document_category_id" bigint, "p_deal_id" bigint, "p_storage_bucket" "text", "p_original_filename" "text", "p_file_type" "text", "p_file_size" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_document_with_deal_link"("p_document_name" "text", "p_document_category_id" bigint, "p_deal_id" bigint, "p_storage_bucket" "text", "p_original_filename" "text", "p_file_type" "text", "p_file_size" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."create_document_with_subject_link"("p_document_name" "text", "p_document_category_id" bigint, "p_storage_bucket" "text", "p_original_filename" "text", "p_subject_type" "text", "p_subject_id" bigint, "p_file_type" "text", "p_file_size" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."create_document_with_subject_link"("p_document_name" "text", "p_document_category_id" bigint, "p_storage_bucket" "text", "p_original_filename" "text", "p_subject_type" "text", "p_subject_id" bigint, "p_file_type" "text", "p_file_size" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_document_with_subject_link"("p_document_name" "text", "p_document_category_id" bigint, "p_storage_bucket" "text", "p_original_filename" "text", "p_subject_type" "text", "p_subject_id" bigint, "p_file_type" "text", "p_file_size" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."debug_jwt"() TO "anon";
GRANT ALL ON FUNCTION "public"."debug_jwt"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."debug_jwt"() TO "service_role";



GRANT ALL ON FUNCTION "public"."debug_list_policies"("p_table" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."debug_list_policies"("p_table" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."debug_list_policies"("p_table" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."document_file_deal_ids"("p_document_file_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."document_file_deal_ids"("p_document_file_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."document_file_deal_ids"("p_document_file_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."finalize_document_upload"("p_document_file_id" bigint, "p_file_size" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."finalize_document_upload"("p_document_file_id" bigint, "p_file_size" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."finalize_document_upload"("p_document_file_id" bigint, "p_file_size" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."format_address"("street" "text", "suite_apt" "text", "city" "text", "state" "text", "postal_code" "text", "country" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."format_address"("street" "text", "suite_apt" "text", "city" "text", "state" "text", "postal_code" "text", "country" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."format_address"("street" "text", "suite_apt" "text", "city" "text", "state" "text", "postal_code" "text", "country" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."format_address"("po_box" "text", "street" "text", "apt_suite" "text", "city" "text", "state" "text", "postal_code" "text", "country" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."format_address"("po_box" "text", "street" "text", "apt_suite" "text", "city" "text", "state" "text", "postal_code" "text", "country" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."format_address"("po_box" "text", "street" "text", "apt_suite" "text", "city" "text", "state" "text", "postal_code" "text", "country" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."format_deal_name"("property_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."format_deal_name"("property_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."format_deal_name"("property_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_tag_slug"("tag_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."generate_tag_slug"("tag_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_tag_slug"("tag_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_accessible_transaction_ids"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_accessible_transaction_ids"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_accessible_transaction_ids"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_active_org_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_active_org_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_active_org_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_clerk_user_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_clerk_user_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_clerk_user_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_co_investor_org_ids"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_co_investor_org_ids"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_co_investor_org_ids"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_co_investor_user_ids"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_co_investor_user_ids"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_co_investor_user_ids"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_complete_schema"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_complete_schema"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_complete_schema"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_current_user_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_current_user_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_current_user_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_current_user_org_ids"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_current_user_org_ids"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_current_user_org_ids"() TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."document_files" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."document_files" TO "service_role";



GRANT ALL ON FUNCTION "public"."get_deal_documents"("p_deal_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."get_deal_documents"("p_deal_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_deal_documents"("p_deal_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_deal_documents_with_sources"("p_deal_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."get_deal_documents_with_sources"("p_deal_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_deal_documents_with_sources"("p_deal_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_effective_role"("p_org_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."get_effective_role"("p_org_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_effective_role"("p_org_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_jsonb_array_element"("array_value" "jsonb", "index" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_jsonb_array_element"("array_value" "jsonb", "index" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_jsonb_array_element"("array_value" "jsonb", "index" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_numeric_constant"("constant_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_numeric_constant"("constant_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_numeric_constant"("constant_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_state_code"("state_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_state_code"("state_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_state_code"("state_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_table_scope"("p_table_name" "text", "p_action" "text", "p_org_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."get_table_scope"("p_table_name" "text", "p_action" "text", "p_org_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_table_scope"("p_table_name" "text", "p_action" "text", "p_org_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_text_constant"("constant_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_text_constant"("constant_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_text_constant"("constant_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_org_ids"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_org_ids"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_org_ids"() TO "service_role";



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



GRANT ALL ON FUNCTION "public"."has_permission"("p_required_role" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_permission"("p_required_role" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_permission"("p_required_role" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_role"("p_role" "text", "p_org_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."has_role"("p_role" "text", "p_org_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_role"("p_role" "text", "p_org_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."has_storage_permission"("p_bucket_name" "text", "p_action" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_storage_permission"("p_bucket_name" "text", "p_action" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_storage_permission"("p_bucket_name" "text", "p_action" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_table_permission"("p_table_name" "text", "p_action" "text", "p_org_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."has_table_permission"("p_table_name" "text", "p_action" "text", "p_org_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_table_permission"("p_table_name" "text", "p_action" "text", "p_org_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_internal_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_internal_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_internal_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_org_admin"("p_org_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."is_org_admin"("p_org_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_org_admin"("p_org_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."ltv"("transaction_type" "public"."transaction_type", "as_is_value" numeric, "purchase_price" numeric, "loan_amount" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."ltv"("transaction_type" "public"."transaction_type", "as_is_value" numeric, "purchase_price" numeric, "loan_amount" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."ltv"("transaction_type" "public"."transaction_type", "as_is_value" numeric, "purchase_price" numeric, "loan_amount" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."refresh_deal_document_participants"() TO "anon";
GRANT ALL ON FUNCTION "public"."refresh_deal_document_participants"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."refresh_deal_document_participants"() TO "service_role";



GRANT ALL ON FUNCTION "public"."reset_org_document_permissions"("p_org_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."reset_org_document_permissions"("p_org_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."reset_org_document_permissions"("p_org_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."seed_document_access_permissions_for_org"("p_org_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."seed_document_access_permissions_for_org"("p_org_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."seed_document_access_permissions_for_org"("p_org_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_matched_api_brex_transfers_to_bsi_transactions"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_matched_api_brex_transfers_to_bsi_transactions"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_matched_api_brex_transfers_to_bsi_transactions"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_transaction_to_investors"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_transaction_to_investors"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_transaction_to_investors"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_transaction_to_investors_on_update"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_transaction_to_investors_on_update"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_transaction_to_investors_on_update"() TO "service_role";



GRANT ALL ON FUNCTION "public"."tg_set_updated_at_document_access_permissions"() TO "anon";
GRANT ALL ON FUNCTION "public"."tg_set_updated_at_document_access_permissions"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."tg_set_updated_at_document_access_permissions"() TO "service_role";



GRANT ALL ON FUNCTION "public"."trg_ddp_from_company_roles"() TO "anon";
GRANT ALL ON FUNCTION "public"."trg_ddp_from_company_roles"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trg_ddp_from_company_roles"() TO "service_role";



GRANT ALL ON FUNCTION "public"."trg_ddp_from_deal_guarantors"() TO "anon";
GRANT ALL ON FUNCTION "public"."trg_ddp_from_deal_guarantors"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trg_ddp_from_deal_guarantors"() TO "service_role";



GRANT ALL ON FUNCTION "public"."trg_ddp_from_deal_property"() TO "anon";
GRANT ALL ON FUNCTION "public"."trg_ddp_from_deal_property"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trg_ddp_from_deal_property"() TO "service_role";



GRANT ALL ON FUNCTION "public"."trg_ddp_from_document_files_borrowers"() TO "anon";
GRANT ALL ON FUNCTION "public"."trg_ddp_from_document_files_borrowers"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trg_ddp_from_document_files_borrowers"() TO "service_role";



GRANT ALL ON FUNCTION "public"."trg_ddp_from_document_files_companies"() TO "anon";
GRANT ALL ON FUNCTION "public"."trg_ddp_from_document_files_companies"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trg_ddp_from_document_files_companies"() TO "service_role";



GRANT ALL ON FUNCTION "public"."trg_ddp_from_document_files_deals"() TO "anon";
GRANT ALL ON FUNCTION "public"."trg_ddp_from_document_files_deals"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trg_ddp_from_document_files_deals"() TO "service_role";



GRANT ALL ON FUNCTION "public"."trg_ddp_from_document_files_guarantors"() TO "anon";
GRANT ALL ON FUNCTION "public"."trg_ddp_from_document_files_guarantors"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trg_ddp_from_document_files_guarantors"() TO "service_role";



GRANT ALL ON FUNCTION "public"."trg_ddp_from_document_files_properties"() TO "anon";
GRANT ALL ON FUNCTION "public"."trg_ddp_from_document_files_properties"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trg_ddp_from_document_files_properties"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_document_tags_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_document_tags_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_document_tags_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_property_address"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_property_address"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_property_address"() TO "service_role";



GRANT ALL ON FUNCTION "public"."user_has_transaction_access"("transaction_id_param" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."user_has_transaction_access"("transaction_id_param" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."user_has_transaction_access"("transaction_id_param" bigint) TO "service_role";



GRANT ALL ON SEQUENCE "public"."Documents_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."Documents_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."Documents_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."tasks" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."tasks" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."tasks" TO "service_role";



GRANT ALL ON SEQUENCE "public"."Tasks_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."Tasks_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."Tasks_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."_function_backups_20251118" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."_function_backups_20251118" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."_function_backups_20251118" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."api_brex_transfers" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."api_brex_transfers" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."api_brex_transfers" TO "service_role";



GRANT ALL ON SEQUENCE "public"."api_brex_transfers_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."api_brex_transfers_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."api_brex_transfers_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."api_brex_transfers_vendors" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."api_brex_transfers_vendors" TO "authenticated";
GRANT ALL ON TABLE "public"."api_brex_transfers_vendors" TO "service_role";



GRANT ALL ON SEQUENCE "public"."api_brex_transfers_vendors_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."api_brex_transfers_vendors_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."api_brex_transfers_vendors_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."api_brex_vendors" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."api_brex_vendors" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."api_brex_vendors" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."api_brex_vendors_clerk_orgs" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."api_brex_vendors_clerk_orgs" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."api_brex_vendors_clerk_orgs" TO "service_role";



GRANT ALL ON SEQUENCE "public"."api_brex_vendors_clerk_orgs_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."api_brex_vendors_clerk_orgs_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."api_brex_vendors_clerk_orgs_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."api_brex_vendors_clerk_users" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."api_brex_vendors_clerk_users" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."api_brex_vendors_clerk_users" TO "service_role";



GRANT ALL ON SEQUENCE "public"."api_brex_vendors_clerk_users_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."api_brex_vendors_clerk_users_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."api_brex_vendors_clerk_users_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."api_brex_vendors_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."api_brex_vendors_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."api_brex_vendors_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."api_ofb_transfers" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."api_ofb_transfers" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."api_ofb_transfers" TO "service_role";



GRANT ALL ON SEQUENCE "public"."api_ofb_transfers_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."api_ofb_transfers_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."api_ofb_transfers_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."api_ofb_transfers_vendors" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."api_ofb_transfers_vendors" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."api_ofb_transfers_vendors" TO "service_role";



GRANT ALL ON SEQUENCE "public"."api_ofb_transfers_vendors_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."api_ofb_transfers_vendors_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."api_ofb_transfers_vendors_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."api_ofb_vendors" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."api_ofb_vendors" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."api_ofb_vendors" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."api_ofb_vendors_clerk_orgs" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."api_ofb_vendors_clerk_orgs" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."api_ofb_vendors_clerk_orgs" TO "service_role";



GRANT ALL ON SEQUENCE "public"."api_ofb_vendors_clerk_orgs_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."api_ofb_vendors_clerk_orgs_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."api_ofb_vendors_clerk_orgs_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."api_ofb_vendors_clerk_users" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."api_ofb_vendors_clerk_users" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."api_ofb_vendors_clerk_users" TO "service_role";



GRANT ALL ON SEQUENCE "public"."api_ofb_vendors_clerk_users_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."api_ofb_vendors_clerk_users_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."api_ofb_vendors_clerk_users_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."api_ofb_vendors_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."api_ofb_vendors_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."api_ofb_vendors_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."appraisal" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."appraisal" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."appraisal" TO "service_role";



GRANT ALL ON SEQUENCE "public"."appraisal_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."appraisal_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."appraisal_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."auth_clerk_orgs" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."auth_clerk_orgs" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."auth_clerk_orgs" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."auth_clerk_orgs_members" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."auth_clerk_orgs_members" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."auth_clerk_orgs_members" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."auth_clerk_orgs_themes" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."auth_clerk_orgs_themes" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."auth_clerk_orgs_themes" TO "service_role";



GRANT ALL ON SEQUENCE "public"."auth_clerk_orgs_themes_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."auth_clerk_orgs_themes_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."auth_clerk_orgs_themes_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."auth_clerk_users" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."auth_clerk_users" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."auth_clerk_users" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."bank_accounts" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."bank_accounts" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."bank_accounts" TO "service_role";



GRANT ALL ON SEQUENCE "public"."bank_accounts_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."bank_accounts_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."bank_accounts_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."borrower" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."borrower" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."borrower" TO "service_role";



GRANT ALL ON SEQUENCE "public"."borrower_profile_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."borrower_profile_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."borrower_profile_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."bs_debt_instruments" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."bs_debt_instruments" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."bs_debt_instruments" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."bs_debt_instruments_deals" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."bs_debt_instruments_deals" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."bs_debt_instruments_deals" TO "service_role";



GRANT ALL ON SEQUENCE "public"."bs_debt_instruments_deals_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."bs_debt_instruments_deals_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."bs_debt_instruments_deals_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."bsi_deals_clerk_orgs" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."bsi_deals_clerk_orgs" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."bsi_deals_clerk_orgs" TO "service_role";



GRANT ALL ON SEQUENCE "public"."bsi_deals_clerk_orgs_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."bsi_deals_clerk_orgs_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."bsi_deals_clerk_orgs_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."bsi_deals_clerk_users" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."bsi_deals_clerk_users" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."bsi_deals_clerk_users" TO "service_role";



GRANT ALL ON SEQUENCE "public"."bsi_deals_clerk_users_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."bsi_deals_clerk_users_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."bsi_deals_clerk_users_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."bsi_distributions" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."bsi_distributions" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."bsi_distributions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."bsi_distributions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."bsi_distributions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."bsi_distributions_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."bsi_distributions_transactions" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."bsi_distributions_transactions" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."bsi_distributions_transactions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."bsi_distributions_transactions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."bsi_distributions_transactions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."bsi_distributions_transactions_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."bsi_statements" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."bsi_statements" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."bsi_statements" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."bsi_statements_transactions" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."bsi_statements_transactions" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."bsi_statements_transactions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."bsi_statements_transactions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."bsi_statements_transactions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."bsi_statements_transactions_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."bsi_transactions_document_files" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."bsi_transactions_document_files" TO "service_role";



GRANT ALL ON SEQUENCE "public"."bsi_transaction_document_files_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."bsi_transaction_document_files_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."bsi_transaction_document_files_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."bsi_transactions" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."bsi_transactions" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."bsi_transactions" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."bsi_transactions_api_brex_transfers" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."bsi_transactions_api_brex_transfers" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."bsi_transactions_api_brex_transfers" TO "service_role";



GRANT ALL ON SEQUENCE "public"."bsi_transactions_api_brex_transfers_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."bsi_transactions_api_brex_transfers_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."bsi_transactions_api_brex_transfers_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."bsi_transactions_api_ofb_transfers" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."bsi_transactions_api_ofb_transfers" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."bsi_transactions_api_ofb_transfers" TO "service_role";



GRANT ALL ON SEQUENCE "public"."bsi_transactions_api_ofb_transfers_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."bsi_transactions_api_ofb_transfers_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."bsi_transactions_api_ofb_transfers_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."bsi_transactions_deals" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."bsi_transactions_deals" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."bsi_transactions_deals" TO "service_role";



GRANT ALL ON SEQUENCE "public"."bsi_transactions_deals_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."bsi_transactions_deals_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."bsi_transactions_deals_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."bsi_transactions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."bsi_transactions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."bsi_transactions_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."bsi_transactions_instruments" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."bsi_transactions_instruments" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."bsi_transactions_instruments" TO "service_role";



GRANT ALL ON SEQUENCE "public"."bsi_transactions_instruments_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."bsi_transactions_instruments_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."bsi_transactions_instruments_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."bsi_transactions_investors" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."bsi_transactions_investors" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."bsi_transactions_investors" TO "service_role";



GRANT ALL ON SEQUENCE "public"."bsi_transactions_investors_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."bsi_transactions_investors_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."bsi_transactions_investors_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."cba_requests" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."cba_requests" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."cba_requests" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."cba_requests_guarantors" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."cba_requests_guarantors" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."cba_requests_guarantors" TO "service_role";



GRANT ALL ON SEQUENCE "public"."cba_submission_credit_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."cba_submission_credit_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."cba_submission_credit_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."company" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."company" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."company" TO "service_role";



GRANT SELECT("co_id") ON TABLE "public"."company" TO "anon";



GRANT SELECT("co_name") ON TABLE "public"."company" TO "anon";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."company_contact" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."company_contact" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."company_contact" TO "service_role";



GRANT ALL ON SEQUENCE "public"."company_contact_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."company_contact_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."company_contact_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."company_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."company_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."company_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."company_member" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."company_member" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."company_member" TO "service_role";



GRANT ALL ON SEQUENCE "public"."company_member_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."company_member_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."company_member_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."company_roles_defined" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."company_roles_defined" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."company_roles_defined" TO "service_role";



GRANT ALL ON SEQUENCE "public"."company_role_mm_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."company_role_mm_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."company_role_mm_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."company_roles" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."company_roles" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."company_roles" TO "service_role";



GRANT ALL ON SEQUENCE "public"."company_roles_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."company_roles_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."company_roles_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."constants" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."constants" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."constants" TO "service_role";



GRANT ALL ON SEQUENCE "public"."constants_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."constants_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."constants_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."contact" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."contact" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."contact" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."contact_contact_types" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."contact_contact_types" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."contact_contact_types" TO "service_role";



GRANT ALL ON SEQUENCE "public"."contact_contact_types_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."contact_contact_types_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."contact_contact_types_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."contact_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."contact_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."contact_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."contact_types" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."contact_types" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."contact_types" TO "service_role";



GRANT ALL ON SEQUENCE "public"."contact_types_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."contact_types_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."contact_types_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."countries" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."countries" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."countries" TO "service_role";



GRANT ALL ON SEQUENCE "public"."countries_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."countries_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."countries_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."custom_loan_fees" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."custom_loan_fees" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."custom_loan_fees" TO "service_role";



GRANT ALL ON SEQUENCE "public"."custom_loan_fees_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."custom_loan_fees_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."custom_loan_fees_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."deal" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."deal" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."deal" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."deal_appraisals" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."deal_appraisals" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."deal_appraisals" TO "service_role";



GRANT ALL ON SEQUENCE "public"."deal_appraisals_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."deal_appraisals_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."deal_appraisals_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."deal_document_participants" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."deal_document_participants" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."deal_document_participants" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."deal_guarantors" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."deal_guarantors" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."deal_guarantors" TO "service_role";



GRANT ALL ON SEQUENCE "public"."deal_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."deal_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."deal_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."deal_property" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."deal_property" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."deal_property" TO "service_role";



GRANT ALL ON SEQUENCE "public"."deal_property_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."deal_property_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."deal_property_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."deal_role_types" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."deal_role_types" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."deal_role_types" TO "service_role";



GRANT ALL ON SEQUENCE "public"."deal_role_types_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."deal_role_types_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."deal_role_types_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."deal_roles" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."deal_roles" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."deal_roles" TO "service_role";



GRANT ALL ON SEQUENCE "public"."deal_roles_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."deal_roles_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."deal_roles_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."deals_guarantors_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."deals_guarantors_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."deals_guarantors_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."debt_instruments_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."debt_instruments_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."debt_instruments_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."document_access_permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."document_access_permissions" TO "service_role";



GRANT ALL ON TABLE "public"."document_access_permissions_global" TO "service_role";
GRANT SELECT ON TABLE "public"."document_access_permissions_global" TO "authenticated";



GRANT ALL ON SEQUENCE "public"."document_access_permissions_global_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."document_access_permissions_global_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."document_access_permissions_global_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."document_access_permissions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."document_access_permissions_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."document_categories" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."document_categories" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."document_categories" TO "service_role";



GRANT ALL ON SEQUENCE "public"."document_categories_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."document_categories_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."document_categories_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."document_categories_user_order" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."document_categories_user_order" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."document_categories_user_order" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."document_files_borrowers" TO "anon";
GRANT ALL ON TABLE "public"."document_files_borrowers" TO "authenticated";
GRANT ALL ON TABLE "public"."document_files_borrowers" TO "service_role";



GRANT ALL ON SEQUENCE "public"."document_files_borrowers_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."document_files_borrowers_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."document_files_borrowers_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."document_files_clerk_orgs" TO "anon";
GRANT ALL ON TABLE "public"."document_files_clerk_orgs" TO "authenticated";
GRANT ALL ON TABLE "public"."document_files_clerk_orgs" TO "service_role";



GRANT ALL ON SEQUENCE "public"."document_files_clerk_orgs_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."document_files_clerk_orgs_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."document_files_clerk_orgs_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."document_files_clerk_users" TO "anon";
GRANT ALL ON TABLE "public"."document_files_clerk_users" TO "authenticated";
GRANT ALL ON TABLE "public"."document_files_clerk_users" TO "service_role";



GRANT ALL ON SEQUENCE "public"."document_files_clerk_users_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."document_files_clerk_users_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."document_files_clerk_users_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."document_files_companies" TO "anon";
GRANT ALL ON TABLE "public"."document_files_companies" TO "authenticated";
GRANT ALL ON TABLE "public"."document_files_companies" TO "service_role";



GRANT ALL ON SEQUENCE "public"."document_files_companies_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."document_files_companies_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."document_files_companies_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."document_files_deals" TO "anon";
GRANT ALL ON TABLE "public"."document_files_deals" TO "authenticated";
GRANT ALL ON TABLE "public"."document_files_deals" TO "service_role";



GRANT ALL ON SEQUENCE "public"."document_files_deals_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."document_files_deals_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."document_files_deals_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."document_files_guarantors" TO "anon";
GRANT ALL ON TABLE "public"."document_files_guarantors" TO "authenticated";
GRANT ALL ON TABLE "public"."document_files_guarantors" TO "service_role";



GRANT ALL ON SEQUENCE "public"."document_files_guarantors_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."document_files_guarantors_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."document_files_guarantors_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."document_files_properties" TO "anon";
GRANT ALL ON TABLE "public"."document_files_properties" TO "authenticated";
GRANT ALL ON TABLE "public"."document_files_properties" TO "service_role";



GRANT ALL ON SEQUENCE "public"."document_files_properties_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."document_files_properties_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."document_files_properties_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."document_files_tags" TO "anon";
GRANT ALL ON TABLE "public"."document_files_tags" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."document_files_tags" TO "service_role";



GRANT ALL ON SEQUENCE "public"."document_files_tags_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."document_files_tags_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."document_files_tags_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."document_roles" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."document_roles" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."document_roles" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."document_roles_files" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."document_roles_files" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."document_roles_files" TO "service_role";



GRANT ALL ON SEQUENCE "public"."document_roles_files_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."document_roles_files_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."document_roles_files_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."document_roles_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."document_roles_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."document_roles_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."document_tags" TO "anon";
GRANT ALL ON TABLE "public"."document_tags" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."document_tags" TO "service_role";



GRANT ALL ON SEQUENCE "public"."document_tags_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."document_tags_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."document_tags_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."fee" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."fee" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."fee" TO "service_role";



GRANT ALL ON SEQUENCE "public"."fee_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."fee_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."fee_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."form_submissions" TO "anon";
GRANT ALL ON TABLE "public"."form_submissions" TO "authenticated";
GRANT ALL ON TABLE "public"."form_submissions" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."guarantor" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."guarantor" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."guarantor" TO "service_role";



GRANT ALL ON SEQUENCE "public"."guarantor_guarantor_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."guarantor_guarantor_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."guarantor_guarantor_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."loan_application" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."loan_application" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."loan_application" TO "service_role";



GRANT ALL ON SEQUENCE "public"."loan_application_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."loan_application_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."loan_application_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."milestone_templates" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."milestone_templates" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."milestone_templates" TO "service_role";



GRANT ALL ON SEQUENCE "public"."milestone_templates_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."milestone_templates_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."milestone_templates_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."milestones" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."milestones" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."milestones" TO "service_role";



GRANT ALL ON SEQUENCE "public"."milestones_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."milestones_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."milestones_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."payroll_ledger" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."payroll_ledger" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."payroll_ledger" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."payroll_ledger_fees_1099" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."payroll_ledger_fees_1099" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."payroll_ledger_fees_1099" TO "service_role";



GRANT ALL ON SEQUENCE "public"."payroll_ledger_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."payroll_ledger_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."payroll_ledger_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."profile_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."profile_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."profile_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."property" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."property" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."property" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."property_reapi" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."property_reapi" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."property_reapi" TO "service_role";



GRANT ALL ON SEQUENCE "public"."property_data_reapi_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."property_data_reapi_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."property_data_reapi_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."property_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."property_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."property_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."property_income" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."property_income" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."property_income" TO "service_role";



GRANT ALL ON SEQUENCE "public"."property_income_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."property_income_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."property_income_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."rbac_permissions" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."rbac_permissions" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."rbac_permissions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."rbac_permissions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."rbac_permissions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."rbac_permissions_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."select_uw_outcomes" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."select_uw_outcomes" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."select_uw_outcomes" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."task_templates" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."task_templates" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."task_templates" TO "service_role";



GRANT ALL ON SEQUENCE "public"."task_templates_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."task_templates_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."task_templates_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_clerk_orgs_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_clerk_orgs_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_clerk_orgs_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_org_memberships_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_org_memberships_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_org_memberships_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_pref_document_categories_order_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_pref_document_categories_order_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_pref_document_categories_order_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."uw_result_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."uw_result_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."uw_result_id_seq" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."view_document_categories_user_order" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."view_document_categories_user_order" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."view_document_categories_user_order" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."view_rbac_permissions_summary" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."view_rbac_permissions_summary" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."view_rbac_permissions_summary" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."view_storage_objects" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."view_storage_objects" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."view_storage_objects" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."view_transaction_documents" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."view_transaction_documents" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."view_transaction_documents" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."weweb_auth_roles" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."weweb_auth_roles" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."weweb_auth_roles" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."weweb_auth_users_roles" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."weweb_auth_users_roles" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."weweb_auth_users_roles" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO "service_role";







