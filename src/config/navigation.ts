// Centralized navigation configuration
// This file is the single source of truth for all sidebar and breadcrumb routes
// Updating a route here will automatically update both sidebar navigation and breadcrumbs

import {
  Building,
  Home,
  FileBarChart2,
  ArrowLeftRight,
  FileSpreadsheet,
  CreditCard,
  FileSignature,
  ArrowDownLeft,
  ArrowUpRight,
  ListTree,
  PieChart,
  BarChart3,
  Upload,
  type LucideIcon,
} from "lucide-react";

// ============================================================================
// ROUTE SEGMENTS - Define URL segments and their display labels
// ============================================================================

export const ROUTE_SEGMENTS = {
  // Top-level sections
  dashboard: { path: "dashboard", label: "Dashboard" },
  balanceSheet: { path: "balance-sheet", label: "Asset Management" },
  platformSettings: { path: "platform-settings", label: "Platform Settings" },

  // Balance Sheet sub-sections
  investorPortfolio: {
    path: "investor-portfolio",
    label: "Balance Sheet",
  },
  transactions: { path: "transactions", label: "Transactions" },
  documents: { path: "documents", label: "Documents" },
  deals: { path: "deals", label: "Deals" },

  // Investor Portfolio pages
  analytics: { path: "analytics", label: "Analytics" },

  // Transaction tabs
  allTransactions: { path: "all", label: "All Transactions" },
  investments: { path: "investments", label: "Investments" },
  distributions: { path: "distributions", label: "Distributions" },

  // Document tabs
  statements: { path: "statements", label: "Statements" },
  payments: { path: "payments", label: "Payments" },
  agreements: { path: "agreements", label: "Agreements" },

  // Platform Settings sub-sections
  integrations: { path: "integrations", label: "Integrations" },

  // Integration pages
  brex: { path: "brex", label: "Brex" },
  ofb: { path: "ofb", label: "Import Transactions" },
  templateEditor: { path: "template-editor", label: "Template Studio" },
} as const;

// ============================================================================
// ROUTE PATHS - Full URL paths constructed from segments
// ============================================================================

export const ROUTES = {
  // Dashboard
  dashboard: `/${ROUTE_SEGMENTS.dashboard.path}`,

  // Balance Sheet - Investor Portfolio
  investorPortfolio: {
    analytics: `/${ROUTE_SEGMENTS.balanceSheet.path}/${ROUTE_SEGMENTS.investorPortfolio.path}/${ROUTE_SEGMENTS.analytics.path}`,
    deals: `/${ROUTE_SEGMENTS.balanceSheet.path}/${ROUTE_SEGMENTS.investorPortfolio.path}/${ROUTE_SEGMENTS.deals.path}`,
  },

  // Balance Sheet - Transactions
  transactions: {
    all: `/${ROUTE_SEGMENTS.balanceSheet.path}/${ROUTE_SEGMENTS.transactions.path}?tab=all`,
    investments: `/${ROUTE_SEGMENTS.balanceSheet.path}/${ROUTE_SEGMENTS.transactions.path}?tab=investments`,
    distributions: `/${ROUTE_SEGMENTS.balanceSheet.path}/${ROUTE_SEGMENTS.transactions.path}?tab=distributions`,
    new: `/${ROUTE_SEGMENTS.balanceSheet.path}/${ROUTE_SEGMENTS.transactions.path}/new`,
    base: `/${ROUTE_SEGMENTS.balanceSheet.path}/${ROUTE_SEGMENTS.transactions.path}`,
  },

  // Balance Sheet - Documents
  documents: {
    statements: `/${ROUTE_SEGMENTS.balanceSheet.path}/${ROUTE_SEGMENTS.documents.path}?tab=statements`,
    payments: `/${ROUTE_SEGMENTS.balanceSheet.path}/${ROUTE_SEGMENTS.documents.path}?tab=payments`,
    agreements: `/${ROUTE_SEGMENTS.balanceSheet.path}/${ROUTE_SEGMENTS.documents.path}?tab=agreements`,
    base: `/${ROUTE_SEGMENTS.balanceSheet.path}/${ROUTE_SEGMENTS.documents.path}`,
  },

  // Platform Settings - Integrations
  integrations: {
    brex: `/${ROUTE_SEGMENTS.platformSettings.path}/${ROUTE_SEGMENTS.integrations.path}/${ROUTE_SEGMENTS.brex.path}`,
    ofb: `/${ROUTE_SEGMENTS.platformSettings.path}/${ROUTE_SEGMENTS.integrations.path}/${ROUTE_SEGMENTS.ofb.path}`,
    templateEditor: `/${ROUTE_SEGMENTS.platformSettings.path}/${ROUTE_SEGMENTS.integrations.path}/${ROUTE_SEGMENTS.templateEditor.path}`,
    base: `/${ROUTE_SEGMENTS.platformSettings.path}/${ROUTE_SEGMENTS.integrations.path}`,
  },
} as const;

// ============================================================================
// SIDEBAR NAVIGATION ITEMS
// ============================================================================

export interface NavSubItem {
  name: string;
  url: string;
  icon: LucideIcon;
}

export interface NavItem {
  name: string;
  icon: LucideIcon;
  url?: string;
  disabled?: boolean;
  items?: NavSubItem[];
}

export const MAIN_NAV_ITEMS = [
  {
    title: ROUTE_SEGMENTS.dashboard.label,
    url: ROUTES.dashboard,
    icon: Home,
  },
] as const;

export const BALANCE_SHEET_NAV_ITEMS: NavItem[] = [
  {
    name: ROUTE_SEGMENTS.investorPortfolio.label,
    icon: PieChart,
    items: [
      {
        name: ROUTE_SEGMENTS.analytics.label,
        url: ROUTES.investorPortfolio.analytics,
        icon: BarChart3,
      },
      {
        name: ROUTE_SEGMENTS.deals.label,
        url: ROUTES.investorPortfolio.deals,
        icon: Building,
      },
    ],
  },
  {
    name: ROUTE_SEGMENTS.documents.label,
    icon: FileBarChart2,
    items: [
      {
        name: ROUTE_SEGMENTS.statements.label,
        url: ROUTES.documents.statements,
        icon: FileSpreadsheet,
      },
      {
        name: ROUTE_SEGMENTS.payments.label,
        url: ROUTES.documents.payments,
        icon: CreditCard,
      },
      {
        name: ROUTE_SEGMENTS.agreements.label,
        url: ROUTES.documents.agreements,
        icon: FileSignature,
      },
    ],
  },
  {
    name: ROUTE_SEGMENTS.transactions.label,
    icon: ArrowLeftRight,
    items: [
      {
        name: ROUTE_SEGMENTS.allTransactions.label,
        url: ROUTES.transactions.all,
        icon: ListTree,
      },
      {
        name: ROUTE_SEGMENTS.investments.label,
        url: ROUTES.transactions.investments,
        icon: ArrowDownLeft,
      },
      {
        name: ROUTE_SEGMENTS.distributions.label,
        url: ROUTES.transactions.distributions,
        icon: ArrowUpRight,
      },
    ],
  },
];

export const TOOLS_NAV_ITEMS: NavItem[] = [
  {
    name: "Import Transactions",
    url: "/tools/import-transactions",
    icon: Upload,
  },
];

// ============================================================================
// BREADCRUMB CONFIGURATION
// ============================================================================

export interface BreadcrumbSegment {
  label: string;
  href?: string;
}

/**
 * Get breadcrumb segments for a given pathname
 * Returns an array of breadcrumb segments with labels and optional hrefs
 */
export function getBreadcrumbSegments(
  pathname: string,
  searchParams?: URLSearchParams,
): BreadcrumbSegment[] {
  const path = pathname.replace(/\/$/, "");

  // Dashboard
  if (path === ROUTES.dashboard) {
    return [{ label: ROUTE_SEGMENTS.dashboard.label }];
  }

  // Balance Sheet - Investor Portfolio - Analytics
  if (path === ROUTES.investorPortfolio.analytics.split("?")[0]) {
    return [
      {
        label: ROUTE_SEGMENTS.balanceSheet.label,
        href: ROUTES.investorPortfolio.analytics,
      },
      {
        label: ROUTE_SEGMENTS.investorPortfolio.label,
        href: ROUTES.investorPortfolio.analytics,
      },
      { label: ROUTE_SEGMENTS.analytics.label },
    ];
  }

  // Balance Sheet - Investor Portfolio - Deals
  if (path === ROUTES.investorPortfolio.deals) {
    return [
      {
        label: ROUTE_SEGMENTS.balanceSheet.label,
        href: ROUTES.investorPortfolio.analytics,
      },
      {
        label: ROUTE_SEGMENTS.investorPortfolio.label,
        href: ROUTES.investorPortfolio.analytics,
      },
      { label: ROUTE_SEGMENTS.deals.label },
    ];
  }

  // Balance Sheet - Investor Portfolio - Deal Details (dynamic route)
  if (
    path.startsWith(ROUTES.investorPortfolio.deals + "/") &&
    path !== ROUTES.investorPortfolio.deals
  ) {
    return [
      {
        label: ROUTE_SEGMENTS.deals.label,
        href: ROUTES.investorPortfolio.deals,
      },
      // The deal name will be added by the component using dealName prop
    ];
  }

  // Balance Sheet - Transactions
  if (path === ROUTES.transactions.base) {
    const tab = searchParams?.get("tab") || "all";
    const tabLabel =
      tab === "investments"
        ? ROUTE_SEGMENTS.investments.label
        : tab === "distributions"
          ? ROUTE_SEGMENTS.distributions.label
          : ROUTE_SEGMENTS.allTransactions.label;

    return [
      {
        label: ROUTE_SEGMENTS.balanceSheet.label,
        href: ROUTES.transactions.all,
      },
      {
        label: ROUTE_SEGMENTS.transactions.label,
        href: ROUTES.transactions.all,
      },
      { label: tabLabel },
    ];
  }

  // Balance Sheet - Transactions - New
  if (path === ROUTES.transactions.new) {
    return [
      {
        label: ROUTE_SEGMENTS.balanceSheet.label,
        href: ROUTES.transactions.all,
      },
      {
        label: ROUTE_SEGMENTS.transactions.label,
        href: ROUTES.transactions.all,
      },
      { label: "New Transaction" },
    ];
  }

  // Balance Sheet - Transactions - Details (dynamic route)
  if (
    path.startsWith(ROUTES.transactions.base + "/") &&
    path !== ROUTES.transactions.new
  ) {
    const transactionId = path.split("/").pop();
    return [
      {
        label: ROUTE_SEGMENTS.balanceSheet.label,
        href: ROUTES.transactions.all,
      },
      {
        label: ROUTE_SEGMENTS.transactions.label,
        href: ROUTES.transactions.all,
      },
      { label: `Transaction #${transactionId}` },
    ];
  }

  // Balance Sheet - Documents
  if (path === ROUTES.documents.base) {
    const tab = searchParams?.get("tab") || "statements";
    const tabLabel =
      tab === "payments"
        ? ROUTE_SEGMENTS.payments.label
        : tab === "agreements"
          ? ROUTE_SEGMENTS.agreements.label
          : ROUTE_SEGMENTS.statements.label;

    return [
      { label: ROUTE_SEGMENTS.balanceSheet.label },
      { label: ROUTE_SEGMENTS.documents.label },
      { label: tabLabel },
    ];
  }

  // Tools - Import Transactions
  if (path.startsWith("/tools/import-transactions")) {
    return [
      { label: "Tools" },
      { label: "Import Transactions" },
    ];
  }

  // Legacy OFB route redirect
  if (path === ROUTES.integrations.ofb) {
    return [
      { label: "Tools" },
      { label: "Import Transactions" },
    ];
  }

  // Platform Settings - Integrations
  if (path.startsWith(ROUTES.integrations.base + "/")) {
    const integrationSlug = path.split("/").pop();
    const integrationLabel =
      integrationSlug === ROUTE_SEGMENTS.brex.path
        ? ROUTE_SEGMENTS.brex.label
        : integrationSlug === ROUTE_SEGMENTS.templateEditor.path
          ? ROUTE_SEGMENTS.templateEditor.label
          : integrationSlug;

    return [
      { label: ROUTE_SEGMENTS.platformSettings.label },
      { label: ROUTE_SEGMENTS.integrations.label },
      { label: integrationLabel || "" },
    ];
  }

  // Default: Generate from path segments
  const segments = path.split("/").filter(Boolean);
  if (segments.length === 0) {
    return [{ label: ROUTE_SEGMENTS.dashboard.label }];
  }

  const lastSegment = segments[segments.length - 1];
  return [
    {
      label:
        lastSegment.charAt(0).toUpperCase() +
        lastSegment.slice(1).replace(/-/g, " "),
    },
  ];
}

/**
 * Get document tab items for dropdown menus
 */
export const DOCUMENT_TAB_ITEMS = [
  { label: ROUTE_SEGMENTS.statements.label, href: ROUTES.documents.statements },
  { label: ROUTE_SEGMENTS.payments.label, href: ROUTES.documents.payments },
  { label: ROUTE_SEGMENTS.agreements.label, href: ROUTES.documents.agreements },
];

/**
 * Get integration items for dropdown menus
 */
export const INTEGRATION_ITEMS = [
  { label: ROUTE_SEGMENTS.brex.label, href: ROUTES.integrations.brex },
  { label: ROUTE_SEGMENTS.ofb.label, href: ROUTES.integrations.ofb },
  {
    label: ROUTE_SEGMENTS.templateEditor.label,
    href: ROUTES.integrations.templateEditor,
  },
];
