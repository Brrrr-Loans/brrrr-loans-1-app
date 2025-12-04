export interface BsiDistribution {
  id: number; // bigint, primary key
  deal_id: number | null; // bigint, FK to deal
  rate_of_return_pct: string; // numeric(5,4)
  interest_amount: string; // numeric(15,2)
  servicing_fee: string; // numeric(15,2), default 0.00
  wire_fee: string; // numeric(15,2), default 0.00
  deposit_amount: string; // numeric(15,2)
  notes: string | null; // text, nullable
  created_at: string | null; // timestamp with time zone, nullable
  updated_at: string | null; // timestamp with time zone, nullable
  bsi_contact_id: number | null; // bigint, FK to contact
  capital_contribution: string; // numeric
  loan_amount_snapshot: string; // numeric
  upb_close: string | null; // numeric, nullable
  statement_id: number | null; // bigint, FK to bsi_statements
  principal_amount: string; // numeric
  instrument_id: number | null; // bigint, FK to bs_debt_instruments
  clerk_org_id: number | null; // bigint, FK to auth_clerk_orgs
  clerk_org_member_id: number | null; // bigint, FK to auth_clerk_orgs_members
  clerk_user_id: number; // bigint, FK to auth_clerk_users
}
