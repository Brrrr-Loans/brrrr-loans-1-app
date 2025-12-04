"use client";

import { DistributionsDataTable } from "./distributions-data-table";

interface DistributionsListProps {
  dealId?: string; // Optional - if provided, shows distributions for specific deal
}

// The API handles filtering distributions by user/org - no client-side permission check needed
export function DistributionsListWrapper({ dealId }: DistributionsListProps) {
  return <DistributionsDataTable />;
}
