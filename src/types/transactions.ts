/**
 * Shared transaction types for the application
 * This file ensures type consistency across all transaction-related components
 */

export interface TransactionWithDetails {
  id: number;
  transaction_amount: number | null;
  transaction_date: string | null;
  transaction_method: string | null;
  transaction_status: string | null;
  reference_number: string | null;
  external_memo: string | null;
  ledger_entry_type: string | null;
  // Additional fields from database
  clerk_org_id?: number | null;
  clerk_user_id?: number | null;
  created_at?: string | null;
  internal_memo?: string | null;
  is_recurring?: boolean | null;
  recurring_frequency?: string | null;
  source_batch_id?: number | null;
  updated_at?: string | null;
  
  // Brex transfer data
  brex_link?: Array<{
    brex_transfer_id: string;
    brex_transfer: {
      brex_transfer_id: string;
      display_name: string;
      payment_type: string;
      status: string;
      process_date: string;
      amount: number;
      counterparty_id: string | null;
    };
  }>;
  
  // Vendor matches to investors
  vendor_org_match?: Array<{
    brex_vendor: {
      name: string;
      brex_vendor_id: string;
    };
    clerk_org: {
      id: number;
      clerk_org_name: string;
    } | null;
  }>;
  
  vendor_user_match?: Array<{
    brex_vendor: {
      name: string;
      brex_vendor_id: string;
    };
    clerk_user: {
      id: number;
      full_name: string;
      email: string;
    } | null;
  }>;
  
  // Related deals
  deals?: Array<{
    deal_id: number;
    allocation_amount: number;
    deal: {
      deal_name: string;
      loan_number: string;
      loan_amount_total: number;
    };
  }>;
  
  // Related investors (can be users OR orgs)
  investors?: Array<{
    clerk_user_id: number | null;
    clerk_org_id: number | null;
    allocation_amount: number;
    auth_clerk_users: {
      full_name: string;
      email: string;
    } | null;
    auth_clerk_orgs: {
      id: number;
      clerk_org_name: string;
    } | null;
  }>;
  
  // Related documents
  documents?: Array<{
    document_file_id: number;
    document_files: {
      id: number;
      document_name: string;
      document_category: string;
      uploaded_at: string;
    };
  }>;
  
  // Direct user/org links (for OFB-synced transactions)
  direct_user?: {
    id: number;
    full_name: string;
    email: string;
  } | null;
  
  direct_org?: {
    id: number;
    clerk_org_name: string;
  } | null;
}

