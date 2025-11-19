export interface BsiTransaction {
  id: string; // bigint, primary key (Supabase returns as string)
  transaction_amount: string | null; // numeric(15,2), nullable
  transaction_date: string; // timestamp with time zone, not null
  transaction_method: string | null; // enum, nullable
  transaction_status: string | null; // enum, nullable
  reference_number: string | null; // text, nullable
  reference_type: string | null; // enum, nullable
  external_memo: string | null; // text, nullable
  created_at: string | null; // timestamp with time zone, nullable
  updated_at: string | null; // timestamp with time zone, nullable
  ledger_entry_type: string; // enum, not null
  clerk_org_id: string | null; // bigint, nullable
  clerk_organization_id: string | null; // text, nullable
  // Old single foreign keys are deprecated - use join tables instead
  investor_id?: string | null; // DEPRECATED - use bsi_transactions_investors
  deal_id?: string | null; // DEPRECATED - use bsi_transactions_deals
  instrument_id?: string | null; // DEPRECATED - use bsi_transactions_instruments
}

// Join table types
export interface BsiTransactionDeal {
  id: string;
  transaction_id: string;
  deal_id: string;
  amount: string | null;
  created_at: string;
}

export interface BsiTransactionInvestorAllocation {
  id: string;
  transaction_id: string;
  investor_id: string;
  clerk_org_id: number | null;
  amount: string | null;
  created_at: string;
}

export interface BsiTransactionInvestor {
  id: string;
  transaction_id: string;
  investor_id: string;
  clerk_org_id: number | null;
  amount: string | null;
  created_at: string;
}

export interface BsiTransactionInstrument {
  id: string;
  transaction_id: string;
  instrument_id: string;
  amount: string | null;
  created_at: string;
}

// Note: This interface is no longer used directly.
// Transaction documents now use the document_files table
// via the bsi_transactions_document_files junction table
