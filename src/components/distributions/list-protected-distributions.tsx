"use client";

import { DistributionsDataTable } from "./distributions-data-table";

// The API handles filtering distributions by user/org - no client-side permission check needed
export function DistributionsListWrapper() {
  return <DistributionsDataTable />;
}
