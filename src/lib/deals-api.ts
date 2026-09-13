export type PortalDealGuarantor = {
  is_primary: boolean | null;
  guarantor: { id?: number; name: string | null } | null;
};

export type PortalDeal = {
  id: number;
  deal_name: string | null;
  deal_stage_2: string | null;
  deal_disposition_1: string | null;
  loan_amount_total: number | null;
  funding_date: string | null;
  project_type: string | null;
  property_id: number | null;
  loan_number: string | null;
  property?:
    | { id?: number; address: string | null }
    | Array<{ id?: number; address: string | null }>
    | null;
  deal_guarantors?: PortalDealGuarantor[] | null;
};

type ApiDealRow = {
  deal_id?: number;
  deal?: PortalDeal | PortalDeal[] | null;
};

function firstNested<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

function isPortalDeal(value: unknown): value is PortalDeal {
  if (!value || typeof value !== "object") return false;
  return typeof (value as PortalDeal).id === "number";
}

export function propertyAddressFromDeal(deal: PortalDeal): string {
  const nested = firstNested(deal.property);
  if (nested?.address) return nested.address;
  if (deal.property_id) return `Property ID: ${deal.property_id}`;
  return "No property";
}

export function guarantorNameFromDeal(deal: PortalDeal): string {
  const list = deal.deal_guarantors || [];
  const primary = list.find((row) => row.is_primary);
  return (primary || list[0])?.guarantor?.name || "No guarantor";
}

export function unwrapApiDeals(payload: unknown): PortalDeal[] {
  if (!Array.isArray(payload)) return [];

  const deals: PortalDeal[] = [];
  const seen = new Set<number>();

  for (const row of payload) {
    if (!row || typeof row !== "object") continue;
    const nested = (row as ApiDealRow).deal;
    const deal = firstNested(nested) ?? (isPortalDeal(row) ? row : null);
    if (deal && typeof deal.id === "number" && !seen.has(deal.id)) {
      seen.add(deal.id);
      deals.push(deal);
    }
  }

  return deals;
}

export function wrapDealsForApi(
  deals: PortalDeal[]
): Array<{ deal_id: number; deal: PortalDeal }> {
  return deals.map((deal) => ({ deal_id: deal.id, deal }));
}

export type PortalDealQueryOptions = {
  clerkOrgId?: string | null;
  isImpersonating?: boolean;
};

/** Org filter only — never an identity override, never impersonate_user_id. */
export function buildPortalQuery(
  options: PortalDealQueryOptions
): URLSearchParams {
  const params = new URLSearchParams();
  if (!options.isImpersonating && options.clerkOrgId) {
    params.set("clerk_org_id", options.clerkOrgId);
  }
  return params;
}

function dealsApiErrorMessage(payload: unknown, status: number): string {
  if (
    payload &&
    typeof payload === "object" &&
    "error" in payload &&
    typeof (payload as { error: unknown }).error === "string"
  ) {
    return (payload as { error: string }).error;
  }
  return `Failed to load deals (${status})`;
}

export async function fetchPortalDeals(
  options: PortalDealQueryOptions
): Promise<PortalDeal[]> {
  // Impersonation is a server cookie. Clients only skip the admin's org filter
  // so the API can return the impersonated user's full deal set.
  const params = buildPortalQuery(options);
  const query = params.toString();
  const response = await fetch(`/api/deals${query ? `?${query}` : ""}`);
  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(dealsApiErrorMessage(payload, response.status));
  }

  return unwrapApiDeals(payload);
}
