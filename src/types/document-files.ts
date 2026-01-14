export type DocumentStatus =
  | "approved"
  | "pending_review"
  | "pending_submission"
  | "pending_exception"
  | "rejected_items_needed"
  | "rejected_revisions_needed"
  | "rejected_signature_needed";

export type DocumentCategory =
  | "application"
  | "appraisal"
  | "assets"
  | "closing"
  | "credit_and_background"
  | "construction"
  | "environmental"
  | "experience"
  | "id"
  | "insurance"
  | "pricing"
  | "property"
  | "seasoning"
  | "servicing"
  | "title"
  | "entity";

/**
 * Core document file record
 *
 * Documents are stored in Supabase Storage and tracked in this table.
 * Relationships to deals, borrowers, etc. are handled via junction tables:
 * - document_files_deals
 * - document_files_borrowers
 * - document_files_properties
 * - document_files_guarantors
 * - document_files_companies
 * - document_files_clerk_orgs
 * - document_files_clerk_users
 */
export interface DocumentFile {
  id: number;
  created_at: string;

  // Storage location (NEW - replaces file_path and file_url)
  storage_bucket: string | null;
  storage_path: string | null;

  // Document metadata
  document_name: string | null;
  document_status: DocumentStatus | null;
  document_category: DocumentCategory | null;

  // File metadata
  file_type: string | null;
  file_size: number | null;

  // Notes
  public_notes: string | null;
  private_notes: string | null;

  // Dates
  effective_date: string | null;
  expiration_date: string | null;

  // Flags
  is_required: boolean | null;

  // Upload info
  uploaded_by: string | null;
  uploaded_at: string | null;

  // Tags
  tags: string[] | null;
}

/**
 * Junction table types for many-to-many relationships
 */
export interface DocumentFileDeal {
  id: number;
  document_file_id: number;
  deal_id: number;
  created_at: string;
  created_by: string | null;
}

export interface DocumentFileBorrower {
  id: number;
  document_file_id: number;
  borrower_id: number;
  created_at: string;
  created_by: string | null;
}

export interface DocumentFileProperty {
  id: number;
  document_file_id: number;
  property_id: number;
  created_at: string;
  created_by: string | null;
}

export interface DocumentFileGuarantor {
  id: number;
  document_file_id: number;
  guarantor_id: number;
  created_at: string;
  created_by: string | null;
}

export interface DocumentFileCompany {
  id: number;
  document_file_id: number;
  company_id: number;
  created_at: string;
  created_by: string | null;
}

export interface DocumentFileClerkOrg {
  id: number;
  document_file_id: number;
  clerk_org_id: number;
  created_at: string;
  created_by: string | null;
}

export interface DocumentFileClerkUser {
  id: number;
  document_file_id: number;
  clerk_user_id: number;
  created_at: string;
  created_by: string | null;
}

/**
 * Document with all related entities (for queries with joins)
 */
export interface DocumentFileWithRelations extends DocumentFile {
  deals?: DocumentFileDeal[];
  borrowers?: DocumentFileBorrower[];
  properties?: DocumentFileProperty[];
  guarantors?: DocumentFileGuarantor[];
  companies?: DocumentFileCompany[];
  clerk_orgs?: DocumentFileClerkOrg[];
  clerk_users?: DocumentFileClerkUser[];
}

/**
 * Transaction document view (from transaction_documents_view)
 */
export interface TransactionDocumentView {
  transaction_id: number;
  junction_id: number;
  id: number;
  created_at: string | null;
  document_name: string | null;
  public_notes: string | null;
  private_notes: string | null;
  document_status: DocumentStatus | null;
  document_category: DocumentCategory | null;
  effective_date: string | null;
  expiration_date: string | null;
  is_required: boolean | null;
  uploaded_by: string | null;
  uploaded_at: string | null;
  file_size: number | null;
  file_type: string | null;
  storage_bucket: string | null;
  storage_path: string | null;
}
