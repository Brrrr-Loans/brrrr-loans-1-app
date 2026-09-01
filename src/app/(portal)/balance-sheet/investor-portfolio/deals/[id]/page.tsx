export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { createServiceRoleClient } from "@/lib/supabase-server";
import { getCurrentUserData, getUserInvestmentOrgs } from "@/lib/auth-helpers";
import { isPlatformAdminIdentity } from "@/lib/internal-admin";
import { DealDetailsWrapper } from "../components/deal-details-protected";
import { DocumentsListWrapper } from "../components/list-protected-documents";
import { DistributionsListWrapper } from "@/components/distributions/list-protected-distributions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import type { Tables } from "@/types/supabase";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

function formatPropertyAddress(
  property:
    | {
        address?: string | null;
        address_street?: string | null;
        address_city?: string | null;
        address_state?: string | null;
      }
    | null
): string | undefined {
  if (!property) return undefined;
  if (property.address) return property.address;
  const parts = [
    property.address_street,
    property.address_city,
    property.address_state,
  ].filter(Boolean);
  return parts.length ? parts.join(", ") : undefined;
}

export default async function DealPage({ params }: PageProps) {
  const { id } = await params;
  const dealId = Number.parseInt(id, 10);
  if (Number.isNaN(dealId)) {
    return notFound();
  }

  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const supabase = createServiceRoleClient();
  const userData = await getCurrentUserData();
  const isPlatformAdmin = isPlatformAdminIdentity({
    clerkUserId: userId,
    email: userData?.email,
    personalRole: userData?.personal_role,
    isInternalYn: userData?.is_internal_yn,
  });
  let hasDealAccess = isPlatformAdmin;

  if (!hasDealAccess && userData?.id) {
    const { data: userLink } = await supabase
      .from("bsi_deals_clerk_users")
      .select("deal_id")
      .eq("deal_id", dealId)
      .eq("clerk_user_id", userData.id)
      .maybeSingle();

    if (userLink) {
      hasDealAccess = true;
    } else {
      const orgIds = await getUserInvestmentOrgs(userData.id);
      if (orgIds.length > 0) {
        const { data: orgLink } = await supabase
          .from("bsi_deals_clerk_orgs")
          .select("deal_id")
          .eq("deal_id", dealId)
          .in("clerk_org_id", orgIds)
          .limit(1)
          .maybeSingle();
        hasDealAccess = Boolean(orgLink);
      }
    }
  }

  if (!hasDealAccess) {
    return notFound();
  }

  const { data: deal, error } = await supabase
    .from("deal")
    .select("*")
    .eq("id", dealId)
    .maybeSingle<Tables<"deal">>();

  if (error || !deal) {
    return notFound();
  }

  let location: string | undefined;
  if (deal.property_id) {
    const { data: property } = await supabase
      .from("property")
      .select("address, address_street, address_city, address_state")
      .eq("id", deal.property_id)
      .maybeSingle();
    location = formatPropertyAddress(property);
  }

  const amount =
    deal.loan_amount_total != null
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }).format(Number(deal.loan_amount_total))
      : undefined;

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {deal.deal_name || `Deal #${id}`}
              </h1>
              <p className="text-muted-foreground">
                View and manage deal details, documents, and distributions.
              </p>
            </div>
          </div>

          <DealDetailsWrapper
            dealId={id}
            deal={{
              name: deal.deal_name,
              location,
              type: deal.deal_type || deal.project_type || undefined,
              status: deal.deal_disposition_1 || deal.deal_stage_2 || undefined,
              amount,
              date: deal.funding_date || deal.note_date || undefined,
              loanNumber: deal.loan_number,
            }}
          />

          <Tabs defaultValue="documents" className="w-full">
            <TabsList>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="distributions">Distributions</TabsTrigger>
            </TabsList>

            <TabsContent value="documents">
              <DocumentsListWrapper dealId={id} />
            </TabsContent>

            <TabsContent value="distributions">
              <DistributionsListWrapper dealId={id} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
