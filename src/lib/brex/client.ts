/**
 * Brex Payments API Client
 * Handles authentication and API calls to Brex Payments API
 */

const BREX_API_URL =
  process.env.BREX_API_URL || "https://platform.brexapis.com";
const BREX_API_KEY = process.env.BREX_API_KEY;

if (!BREX_API_KEY) {
  throw new Error("BREX_API_KEY environment variable is required");
}

export interface BrexApiError {
  message: string;
  status?: number;
  code?: string;
}

export class BrexApiClientError extends Error {
  status?: number;
  code?: string;

  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = "BrexApiClientError";
    this.status = status;
    this.code = code;
  }

  /**
   * Check if this error is an authentication error (401 or 403)
   */
  isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }
}

/**
 * Helper function to check if an error is a Brex authentication error
 */
export function isBrexAuthError(error: unknown): boolean {
  return (
    error instanceof BrexApiClientError && error.isAuthError()
  );
}

/**
 * Base fetch function with authentication and error handling
 */
async function brexFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${BREX_API_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Authorization": `Bearer ${BREX_API_KEY}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorMessage = `Brex API error: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      // If response is not JSON, use default message
    }
    
    // Provide more specific error messages for authentication errors
    if (response.status === 401) {
      errorMessage = "Invalid or Revoked Token - Please check your BREX_API_KEY environment variable";
    } else if (response.status === 403) {
      errorMessage = "Access Forbidden - Your API key may not have the required permissions";
    }
    
    throw new BrexApiClientError(
      errorMessage,
      response.status,
      response.status.toString()
    );
  }

  return response;
}

/**
 * Fetch with retry logic
 */
async function fetchWithRetry(
  endpoint: string,
  options: RequestInit = {},
  maxRetries = 3,
  retryDelay = 1000
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await brexFetch(endpoint, options);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on client errors (4xx)
      if (
        error instanceof BrexApiClientError &&
        error.status &&
        error.status >= 400 &&
        error.status < 500
      ) {
        throw error;
      }

      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, retryDelay * Math.pow(2, attempt))
        );
      }
    }
  }

  throw lastError || new Error("Failed to fetch after retries");
}

/**
 * List Vendors endpoint
 * https://developer.brex.com/openapi/payments_api/#operation/listVendors
 */
export interface BrexVendor {
  id: string;
  company_name?: string;
  email?: string;
  phone?: string;
  payment_accounts?: Array<{
    details?: {
      type?: string;
      payment_instrument_id?: string;
      routing_number?: string;
      account_number?: string;
      account_type?: string;
      account_class?: string;
      beneficiary_name?: string;
    };
    address?: Array<{
      line1?: string;
      line2?: string;
      city?: string;
      state?: string;
      postal_code?: string;
      country?: string;
    }>;
  }>;
  [key: string]: unknown; // Allow for additional fields
}

export interface BrexVendorsResponse {
  items: BrexVendor[];
  next_cursor?: string;
}

export async function listVendors(
  limit = 100,
  cursor?: string
): Promise<BrexVendorsResponse> {
  const params = new URLSearchParams({
    limit: limit.toString(),
  });

  if (cursor) {
    params.append("cursor", cursor);
  }

  const response = await fetchWithRetry(`/v1/vendors?${params.toString()}`);
  return response.json();
}

/**
 * List all vendors with pagination
 */
export async function listAllVendors(): Promise<BrexVendor[]> {
  const allVendors: BrexVendor[] = [];
  let cursor: string | undefined;

  do {
    const response = await listVendors(100, cursor);
    allVendors.push(...response.items);
    cursor = response.next_cursor;
  } while (cursor);

  return allVendors;
}

/**
 * List Transfers endpoint
 * https://developer.brex.com/openapi/payments_api/#operation/listTransfers
 */
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
  [key: string]: unknown; // Allow for additional fields
}

export interface BrexTransfersResponse {
  items: BrexTransfer[];
  next_cursor?: string;
}

export async function listTransfers(
  limit = 100,
  cursor?: string,
  startDate?: string,
  endDate?: string
): Promise<BrexTransfersResponse> {
  const params = new URLSearchParams({
    limit: limit.toString(),
  });

  if (cursor) {
    params.append("cursor", cursor);
  }

  if (startDate) {
    params.append("start_date", startDate);
  }

  if (endDate) {
    params.append("end_date", endDate);
  }

  const response = await fetchWithRetry(`/v1/transfers?${params.toString()}`);
  return response.json();
}

/**
 * List all transfers with pagination
 */
export async function listAllTransfers(
  startDate?: string,
  endDate?: string
): Promise<BrexTransfer[]> {
  const allTransfers: BrexTransfer[] = [];
  let cursor: string | undefined;

  do {
    const response = await listTransfers(100, cursor, startDate, endDate);
    allTransfers.push(...response.items);
    cursor = response.next_cursor;
  } while (cursor);

  return allTransfers;
}

/**
 * Validate Brex API token by making a lightweight API call
 */
export async function validateBrexToken(): Promise<{ valid: boolean; error?: string }> {
  try {
    // Use a lightweight endpoint to validate the token
    // The vendors endpoint with limit=1 is a good choice as it's fast
    const response = await brexFetch("/v1/vendors?limit=1");
    return { valid: response.ok };
  } catch (error) {
    if (error instanceof BrexApiClientError && error.isAuthError()) {
      return {
        valid: false,
        error: error.message,
      };
    }
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

