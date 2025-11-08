export type ContactType =
  | "Appraisal Administration"
  | "Appraisal Management Company"
  | "Appraiser"
  | "Borrower"
  | "Borrower Assistant"
  | "Broker"
  | "Broker Loan Processor"
  | "General Contractor"
  | "Entity Member"
  | "Escrow"
  | "Insurance"
  | "Balance Sheet Investor"
  | "Lender"
  | "Point of Contact"
  | "Referring Party"
  | "Title"
  | "Transaction Coordinator"
  | "Loan Buyer";

export type UserRole =
  | "admin"
  | "account_executive"
  | "loan_processor"
  | "balance_sheet_investor"
  | "loan_opener";

export interface UserPermissions {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  contactType: ContactType;
  role: UserRole;
  contactId: number;
  authUserProfileId: number;
  canAccessDeals: boolean;
  canAccessDistributions: boolean;
  canAccessDocuments: boolean;
  canAccessAdminFeatures: boolean;
}

export class PermissionError extends Error {
  constructor(
    message: string,
    public code: string = "PERMISSION_DENIED"
  ) {
    super(message);
    this.name = "PermissionError";
  }
}
