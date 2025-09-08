export const dynamic = "force-dynamic";

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { DealDetailsWrapper } from "@/components/deals/protected-deal-details";
import { DocumentsListWrapper } from "@/components/documents/list-protected-documents";
import { DistributionsListWrapper } from "@/components/distributions/protected-distributions-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { SiteHeader } from "@/components/layout/site-header";
import { notFound } from "next/navigation";
import type { Database } from "@/types/supabase";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DealPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = createServerComponentClient<Database>({ cookies });

  // Fetch basic deal data
  const { data: deal, error } = await supabase
    .from("deal")
    .select("*")
    .eq("id", parseInt(id))
    .single();

  if (error || !deal) {
    notFound();
  }

  return (
    <>
      <SiteHeader dealName={deal.deal_name || `Deal #${id}`} />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
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

            <DealDetailsWrapper dealId={id} deal={deal} />

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
    </>
  );
}
