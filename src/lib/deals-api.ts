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

export async function fetchPortalDeals(options: {
  clerkOrgId?: string | null;
  impersonatedUserId?: number | null;
}): Promise<PortalDeal[]> {
  const params = new URLSearchParams();
  // When impersonating, show the target user's full deal set. The org switcher
  // is the admin's Clerk org, not the impersonated user's; sending clerk_org_id
  // would filter (or return []) against the wrong organization, while Analytics
  // still shows the full portfolio.
  if (options.impersonatedUserId) {
    params.set("impersonate_user_id", String(options.impersonatedUserId));
  } else if (options.clerkOrgId) {
    params.set("clerk_org_id", options.clerkOrgId);
  }

  const query = params.toString();
  const response = await fetch(`/api/deals${query ? `?${query}` : ""}`);
  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload &&
      typeof payload === "object" &&
      "error" in payload &&
      typeof (payload as { error: unknown }).error === "string"
        ? (payload as { error: string }).error
        : `Failed to load deals (${response.status})`;
    throw new Error(message);
  }

  return unwrapApiDeals(payload);
}
