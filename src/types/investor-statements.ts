export interface InvestorStatement {
  id: string;
  created_at: string;
  investor_id: number;
  statement_date: string; // date in ISO format
  statement_period_start: string; // date in ISO format
  statement_period_end: string; // date in ISO format
  total_upb_open: number;
  total_upb_close: number;
  total_interest: number;
  total_principal: number | null;
  clerk_user_id: string | null;
  clerk_organization_id: string | null;
  org_id: string | null; // Organization ID for shared statements
  // File fields
  file_path?: string | null;
  file_name?: string | null;
  file_type?: string | null;
  file_size?: number | null;
  file_url?: string | null;
  uploaded_at?: string | null;
}
