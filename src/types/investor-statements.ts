export interface InvestorStatement {
  id: string;
  created_at: string;
  auth_clerk_users_id: number | null;
  clerk_org_id: number | null;
  statement_date: string; // date in ISO format
  statement_period_start: string; // date in ISO format
  statement_period_end: string; // date in ISO format
  total_upb_open: number;
  total_upb_close: number;
  total_interest: number;
  total_principal: number | null;
  total_fees: number;
  deposit_amount: number | null;
  // File fields
  file_path?: string | null;
  file_name?: string | null;
  file_type?: string | null;
  file_size?: number | null;
  file_url?: string | null;
  uploaded_at?: string | null;
}
