"use client";

import { RouteProtection } from "@/components/auth/route-protection";
import { DealsDataTable } from "@/components/deals/components/deals-data-table";
import { SiteHeader } from "@/components/layout/site-header";

function DealsPageContent() {
  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Deals</h1>
                <p className="text-muted-foreground">
                  Manage your investment deals and track their performance.
                </p>
              </div>
            </div>
            <DealsDataTable />
          </div>
        </div>
      </div>
    </>
  );
}

export default function DealsPage() {
  return (
    <RouteProtection
      requiredContactTypes={[
        "Balance Sheet Investor",
        "Lender",
        "Borrower",
        "Broker",
        "Point of Contact",
      ]}
      requiredPermissions={["canAccessDeals"]}
    >
      <DealsPageContent />
    </RouteProtection>
  );
}
