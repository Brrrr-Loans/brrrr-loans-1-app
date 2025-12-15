export const dynamic = "force-dynamic";

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { DealDetailsWrapper } from "../components/deal-details-protected";
import { DocumentsListWrapper } from "../components/list-protected-documents";
import { DistributionsListWrapper } from "@/components/distributions/list-protected-distributions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { notFound } from "next/navigation";
import type { Database, Tables } from "@/types/supabase";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DealPage({ params }: PageProps) {
  const { id } = await params;
  const cookieStore = cookies();
  const supabase = createServerComponentClient<Database>({
    cookies: () => cookieStore,
  });

  // Fetch basic deal data
  const { data: deal, error } = await supabase
    .from("deal")
    .select("*")
    .eq("id", Number.parseInt(id, 10))
    .single<Tables<"deal">>();

  if (error || !deal) {
    return notFound();
  }

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
  );
}
