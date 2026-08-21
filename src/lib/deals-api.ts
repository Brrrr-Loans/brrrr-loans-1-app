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
};

type ApiDealRow = {
  deal_id?: number;
  deal?: PortalDeal | PortalDeal[] | null;
};

export function unwrapApiDeals(payload: unknown): PortalDeal[] {
  if (!Array.isArray(payload)) return [];

  const deals: PortalDeal[] = [];
  const seen = new Set<number>();

  for (const row of payload) {
    if (!row || typeof row !== "object") continue;
    const nested = (row as ApiDealRow).deal;
    const deal = Array.isArray(nested) ? nested[0] : nested;
    if (deal && typeof deal.id === "number" && !seen.has(deal.id)) {
      seen.add(deal.id);
      deals.push(deal);
    }
  }

  return deals;
}

export async function fetchPortalDeals(options: {
  clerkOrgId?: string | null;
  impersonatedUserId?: number | null;
}): Promise<PortalDeal[]> {
  const params = new URLSearchParams();
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
