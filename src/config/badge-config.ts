// src/config/status-config.ts
export const STATUS_CONFIG = {
  deal_stage_1: {
    lead: { color: "yellow", label: "Lead" },
    scenario: { color: "lime", label: "Scenario" },
    deal: { color: "green", label: "Deal" },
  },
  deal_stage_2: {
    loan_setup: { color: "pink", label: "Loan Setup" },
    processing_1: { color: "fuschia", label: "Processing I" },
    appraisal_review: { color: "violet", label: "Appraisal Review" },
    processing_2: { color: "indigo", label: "Processing II" },
    qc_1: { color: "blue", label: "QC 1" },
    underwriting: { color: "sky", label: "Underwriting" },
    conditionally_approved: { color: "cyan", label: "Conditionally Approved" },
    qc_2: { color: "teal", label: "QC 2" },
    clear_to_close: { color: "emerald", label: "Clear to Close" },
    closed_and_funded: { color: "green", label: "Funded" },
  },
  deal_disposition_1: {
    active: { color: "green", label: "Active" },
    dead: { color: "red", label: "Dead" },
    on_hold: { color: "amber", label: "On Hold" },
  },
  project_type: {
    fix_and_flip: { color: "cyan", label: "Fix & Flip" },
    ground_up: { color: "sky", label: "Ground Up" },
    rental: { color: "blue", label: "Rental" },
    stabilized_bridge: { color: "indigo", label: "Stabilized Bridge" },
  },
  document_status: {
    approved: { color: "green", label: "Approved" },
    pending_review: { color: "yellow", label: "Pending Review" },
    pending_submission: { color: "amber", label: "Pending Submission" },
    pending_exception: { color: "orange", label: "Pending Exception" },
    rejected_items_needed: { color: "red", label: "Items Needed" },
    rejected_revisions_needed: { color: "red", label: "Revisions Needed" },
    rejected_signature_needed: { color: "red", label: "Signature Needed" },
  },
  transaction_status: {
    completed: { color: "green", label: "Completed" },
    processing: { color: "blue", label: "Processing" },
    pending: { color: "yellow", label: "Pending" },
    scheduled: { color: "cyan", label: "Scheduled" },
    failed: { color: "red", label: "Failed" },
    canceled: { color: "zinc", label: "Canceled" },
    on_hold: { color: "amber", label: "On Hold" },
  },
  contact_type: {
    balance_sheet_investor: { color: "emerald", label: "Investor" },
    lender: { color: "blue", label: "Lender" },
    borrower: { color: "purple", label: "Borrower" },
    broker: { color: "orange", label: "Broker" },
    point_of_contact: { color: "cyan", label: "POC" },
    appraiser: { color: "teal", label: "Appraiser" },
    title: { color: "indigo", label: "Title" },
    insurance: { color: "sky", label: "Insurance" },
    escrow: { color: "violet", label: "Escrow" },
  },
  user_role: {
    admin: { color: "red", label: "Admin" },
    account_executive: { color: "blue", label: "Account Executive" },
    loan_processor: { color: "green", label: "Loan Processor" },
    balance_sheet_investor: { color: "teal", label: "Investor" },
    loan_opener: { color: "purple", label: "Loan Opener" },
  },

  // Risk levels (for future use)
  risk_level: {
    low: { color: "green", label: "Low Risk" },
    medium: { color: "yellow", label: "Medium Risk" },
    high: { color: "red", label: "High Risk" },
  },

  // General statuses (for future use)
  general_status: {
    active: { color: "green", label: "Active" },
    inactive: { color: "zinc", label: "Inactive" },
    pending: { color: "amber", label: "Pending" },
    complete: { color: "green", label: "Complete" },
    error: { color: "red", label: "Error" },
    warning: { color: "yellow", label: "Warning" },
    info: { color: "blue", label: "Info" },
  },
} as const;

export type BadgeConfigKey = keyof typeof STATUS_CONFIG;
export type BadgeValue<T extends BadgeConfigKey> =
  keyof (typeof STATUS_CONFIG)[T];

// Extract all possible color values from the STATUS_CONFIG
type ExtractColors<T> =
  T extends Record<string, { color: infer C; label: string }> ? C : never;

export type BadgeColor = ExtractColors<
  (typeof STATUS_CONFIG)[keyof typeof STATUS_CONFIG]
>;

// Utility function to get badge config safely
export function getBadgeConfig<T extends BadgeConfigKey>(
  category: T,
  value: string
): { color: BadgeColor; label: string } | null {
  const categoryConfig = STATUS_CONFIG[category];
  const config = categoryConfig?.[value as keyof typeof categoryConfig];
  return (config as { color: BadgeColor; label: string }) || null;
}

// Fallback function for unknown values
export function getBadgeConfigWithFallback<T extends BadgeConfigKey>(
  category: T,
  value: string,
  fallback: { color: BadgeColor; label: string } = {
    color: "zinc",
    label: value,
  }
): { color: BadgeColor; label: string } {
  return getBadgeConfig(category, value) || fallback;
}
