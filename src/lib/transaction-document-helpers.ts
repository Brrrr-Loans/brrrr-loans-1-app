import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { validateTransaction } from "./transaction-validation";

/**
 * Upload a document for a transaction
 */
export async function uploadTransactionDocument(
  supabase: SupabaseClient<Database>,
  transactionId: number,
  file: File,
  documentType: string,
  uploadedBy: string,
  orgId?: string | null
) {
  try {
    // 1. Generate unique file path with organization/user-based structure
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-_]/g, "_");

    // Use organization-based path if available, otherwise user-based
    const basePath = orgId
      ? `organizations/${orgId}/transactions`
      : `users/${uploadedBy}/transactions`;

    const filePath = `${basePath}/${transactionId}/${timestamp}_${sanitizedFileName}`;

    // 2. Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from("transaction-documents")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // 3. Create document record in document_files table
    const { data: documentData, error: documentError } = await supabase
      .from("document_files")
      .insert({
        document_name: file.name,
        document_category: mapDocumentTypeToCategory(documentType),
        document_status: "pending_review",
        file_path: filePath,
        file_type: file.type,
        file_size: file.size,
        uploaded_by: uploadedBy,
        uploaded_at: new Date().toISOString(),
        // Note: We're not setting deal_id here since this is for transactions
        // which can have multiple deals
      })
      .select()
      .single();

    if (documentError) {
      // Cleanup: delete uploaded file if database insert fails
      await supabase.storage.from("transaction-documents").remove([filePath]);
      throw documentError;
    }

    // 4. Create link in junction table
    const { error: junctionError } = await supabase
      .from("bsi_transactions_document_files")
      .insert({
        transaction_id: transactionId,
        document_file_id: documentData.id,
      })
      .select()
      .single();

    if (junctionError) {
      // Cleanup: delete document record and file if junction insert fails
      await supabase.from("document_files").delete().eq("id", documentData.id);
      await supabase.storage.from("transaction-documents").remove([filePath]);
      throw junctionError;
    }

    return { data: documentData, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Map transaction document types to document_files categories
 */
function mapDocumentTypeToCategory(
  documentType: string
): Database["public"]["Enums"]["document_category"] {
  const mappings: Record<
    string,
    Database["public"]["Enums"]["document_category"]
  > = {
    wire_confirmation: "closing",
    bank_statement: "assets",
    invoice: "application",
    receipt: "closing",
    other: "application",
  };

  return mappings[documentType] || "application";
}

/**
 * Download a transaction document
 */
export async function downloadTransactionDocument(
  supabase: SupabaseClient<Database>,
  filePath: string,
  fileName: string
) {
  const { data, error } = await supabase.storage
    .from("transaction-documents")
    .download(filePath);

  if (error) throw error;

  // Create download link
  const url = window.URL.createObjectURL(data);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

/**
 * Create a transaction with multiple deals and investors
 */
export async function createMultiPartyTransaction(
  supabase: SupabaseClient<Database>,
  transaction: {
    amount: number;
    date: string;
    method: string;
    type: string;
    notes?: string;
    referenceNumber?: string;
  },
  dealAllocations: Array<{ dealId: number; amount: number }>,
  investorAllocations: Array<{
    investorId: number;
    amount: number;
    orgId?: number;
  }>
) {
  // Validate the transaction before creating
  const validation = validateTransaction({
    amount: transaction.amount,
    dealAllocations,
    investorAllocations,
  });

  if (!validation.isValid) {
    throw new Error(
      `Transaction validation failed: ${validation.errors.join(", ")}`
    );
  }

  // Start a transaction
  const { data: txData, error: txError } = await supabase
    .from("bsi_transactions")
    .insert({
      transaction_amount: transaction.amount,
      transaction_date: transaction.date,
      transaction_method:
        transaction.method as Database["public"]["Enums"]["transaction_method"],
      ledger_entry_type:
        transaction.type as Database["public"]["Enums"]["ledger_entry_type"],
      external_memo: transaction.notes,
      reference_number: transaction.referenceNumber,
    })
    .select()
    .single();

  if (txError) throw txError;

  // Insert deal allocations
  if (dealAllocations.length > 0) {
    const { error: dealError } = await supabase
      .from("bsi_transactions_deals")
      .insert(
        dealAllocations.map((allocation) => ({
          transaction_id: txData.id,
          deal_id: allocation.dealId,
          allocation_amount: allocation.amount,
        }))
      );

    if (dealError) throw dealError;
  }

  // Insert investor allocations
  if (investorAllocations.length > 0) {
    const { error: investorError } = await supabase
      .from("bsi_transactions_investors")
      .insert(
        investorAllocations.map((allocation) => ({
          transaction_id: txData.id,
          clerk_user_id: allocation.investorId,
          clerk_org_id: allocation.orgId,
          amount: allocation.amount,
        }))
      );

    if (investorError) throw investorError;
  }

  return txData;
}

/**
 * Get all documents for a transaction
 */
export async function getTransactionDocuments(
  supabase: SupabaseClient<Database>,
  transactionId: number
) {
  const { data, error } = await supabase
    .from("transaction_documents_view")
    .select("*")
    .eq("transaction_id", transactionId)
    .order("uploaded_at", { ascending: false });

  return { data, error };
}

/**
 * Get transaction with all related entities
 */
export async function getTransactionWithRelations(
  supabase: SupabaseClient<Database>,
  transactionId: number
) {
  // Get transaction
  const { data: transaction, error: txError } = await supabase
    .from("bsi_transactions")
    .select("*")
    .eq("id", transactionId)
    .single();

  if (txError) throw txError;

  // Get related deals
  const { data: deals } = await supabase
    .from("bsi_transactions_deals")
    .select(
      `
      *,
      deal:deal_id (
        id,
        deal_name,
        loan_number
      )
    `
    )
    .eq("transaction_id", transactionId);

  // Get related investors
  const { data: investors } = await supabase
    .from("bsi_transactions_investors")
    .select(
      `
      *,
      investor:investor_id (
        id,
        first_name,
        last_name,
        email
      ),
      organization:clerk_org_id (
        id,
        clerk_org_name
      )
    `
    )
    .eq("transaction_id", transactionId);

  // Get documents
  const { data: documents } = await supabase
    .from("transaction_documents_view")
    .select("*")
    .eq("transaction_id", transactionId);

  return {
    ...transaction,
    deals: deals || [],
    investors: investors || [],
    documents: documents || [],
  };
}
