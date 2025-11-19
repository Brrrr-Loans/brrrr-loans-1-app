/**
 * TypeScript types for Brex API responses
 * These types match the structure returned by the Brex Payments API
 */

/**
 * Database row type for api_brex_vendors (matches actual column names)
 */
export interface BrexVendor {
  id: string;
  name?: string;
  email?: string;
  payment_instrument_id?: string;
  routing_number?: string;
  account_number?: string;
  bank_account_type?: string; // RENAMED: Bank account type (CHECKING, SAVINGS)
  payment_account_address_line1?: string; // RENAMED: From payment_accounts[0].address[0]
  payment_account_address_line2?: string; // RENAMED
  payment_account_city?: string; // RENAMED
  payment_account_state?: string; // RENAMED
  payment_account_postal_code?: string; // RENAMED
  payment_account_country?: string; // RENAMED
  phone?: string;
  vendor_type?: string; // Not in Brex API - for manual categorization
  [key: string]: unknown; // Allow for additional fields from API
}

export interface BrexVendorsResponse {
  items: BrexVendor[];
  next_cursor?: string;
}

export interface BrexTransfer {
  id: string;
  counterparty?: {
    type?: string;
    payment_instrument_id?: string;
    id?: string;
    routing_number?: string;
    account_number?: string;
    name?: string;
    fed_reference_number?: string;
  };
  description?: string;
  payment_type?: string;
  amount?: {
    amount?: number;
    currency?: string;
  };
  process_date?: string;
  originating_account?: {
    type?: string;
    id?: string;
    routing_number?: string;
    account_number?: string;
    name?: string;
  };
  status?: string;
  cancellation_reason?: string;
  estimated_delivery_date?: string;
  creator_user_id?: string;
  created_at?: string;
  display_name?: string;
  external_memo?: string;
  is_ppro_enabled?: boolean;
  [key: string]: unknown; // Allow for additional fields from API
}

export interface BrexTransfersResponse {
  items: BrexTransfer[];
  next_cursor?: string;
}

/**
 * Database row type for api_brex_vendors table
 * Note: Column names reflect actual API nesting (payment_accounts[0].address[0])
 * Updated: 2025-11-19 to match renamed columns
 */
export interface ApiBrexVendorRow {
  id: number;
  brex_vendor_id: string;
  name: string | null;
  email: string | null;
  payment_instrument_id: string | null;
  routing_number: string | null;
  account_number: string | null;
  bank_account_type: string | null; // RENAMED: Bank account type (CHECKING, SAVINGS, etc.)
  payment_account_address_line1: string | null; // RENAMED: From payment_accounts[0].address[0]
  payment_account_address_line2: string | null; // RENAMED
  payment_account_city: string | null; // RENAMED
  payment_account_state: string | null; // RENAMED
  payment_account_postal_code: string | null; // RENAMED
  payment_account_country: string | null; // RENAMED
  phone: string | null;
  vendor_type: string | null; // Not in Brex API - for manual categorization
  created_at: string;
  updated_at: string | null;
  synced_at: string | null;
  raw_payload: Record<string, unknown> | null;
}

/**
 * Database types for api_brex_transfers table
 */
export interface ApiBrexTransferRow {
  id: number;
  brex_transfer_id: string;
  counterparty_id: string | null;
  counterparty_type: string | null;
  counterparty_payment_instrument_id: string | null;
  counterparty_routing_number: string | null;
  counterparty_account_number: string | null;
  counterparty_name: string | null;
  description: string | null;
  payment_type: string | null;
  amount: number | null;
  amount_cents: number | null;
  currency: string | null;
  process_date: string | null;
  originating_account_type: string | null;
  originating_account_id: string | null;
  originating_account_number: string | null;
  originating_account_name: string | null;
  status: string | null;
  cancellation_reason: string | null;
  estimated_delivery_date: string | null;
  creator_user_id: string | null;
  brex_created_at: string | null;
  display_name: string | null;
  external_memo: string | null;
  is_ppro_enabled: boolean | null;
  fed_reference_number: string | null;
  created_at: string;
  updated_at: string | null;
  synced_at: string | null;
  sync_status: string;
  sync_error_message: string | null;
  raw_payload: Record<string, unknown> | null;
}

