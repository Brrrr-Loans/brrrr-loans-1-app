"use client";

import {
  BuilderComponent,
  builder,
  useIsPreviewing,
  Builder,
} from "@builder.io/react";
import { BuilderContent } from "@builder.io/sdk";
import { useState, useEffect, use, Suspense } from "react";
import { Button } from "@/components/ui";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { Badge } from "@/components/ui";
// Import the component registry

// Initialize Builder.io
builder.init(process.env.NEXT_PUBLIC_BUILDER_API_KEY!);

interface BuilderDealsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Create a sample deals component that can be visually edited
const DealsHeader = () => (
  <div className="flex items-center justify-between">
    <h1 className="text-2xl font-bold tracking-tight">Deals</h1>
    <div className="flex gap-2">
      <Button variant="outline">Export</Button>
      <Button>New Deal</Button>
    </div>
  </div>
);

const SampleDealCard = ({
  title = "Sample Deal",
  amount = "$1,000,000",
  status = "Active",
}) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>Investment opportunity</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold">{amount}</span>
        <Badge variant={status === "Active" ? "default" : "secondary"}>
          {status}
        </Badge>
      </div>
    </CardContent>
  </Card>
);

// Register the custom components
Builder.registerComponent(DealsHeader, {
  name: "DealsHeader",
  inputs: [],
});

Builder.registerComponent(SampleDealCard, {
  name: "DealCard",
  inputs: [
    {
      name: "title",
      type: "string",
      defaultValue: "Sample Deal",
    },
    {
      name: "amount",
      type: "string",
      defaultValue: "$1,000,000",
    },
    {
      name: "status",
      type: "string",
      enum: ["Active", "Pending", "Closed"],
      defaultValue: "Active",
    },
  ],
});

function BuilderDealsPageContent({ searchParams }: BuilderDealsPageProps) {
  const [content, setContent] = useState<BuilderContent | undefined>(undefined);
  const isPreviewing = useIsPreviewing();
  const model = "page";
  const resolvedSearchParams = use(searchParams);

  useEffect(() => {
    async function fetchContent() {
      const content = await builder
        .get(model, {
          url: "/deals/builder",
          ...resolvedSearchParams,
        })
        .toPromise();

      setContent(content || undefined);
    }

    fetchContent();
  }, [resolvedSearchParams]);

  // Show the page if we're previewing or if there's content
  if (isPreviewing || content) {
    return (
      <div className="min-h-screen">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <BuilderComponent
            model={model}
            content={content}
            options={{
              includeRefs: true,
            }}
          />
        </div>
      </div>
    );
  }

  // Show a placeholder with sample components when no content is found
  return (
    <div className="min-h-screen">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <DealsHeader />

        <div className="text-center space-y-4 py-8">
          <h2 className="text-xl font-semibold">Visual Editor Ready!</h2>
          <p className="text-muted-foreground">
            Use Builder.io to visually edit this page with drag-and-drop
            components
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SampleDealCard />
          <SampleDealCard
            title="Oakwood Apartments"
            amount="$2,500,000"
            status="Pending"
          />
          <SampleDealCard
            title="Downtown Plaza"
            amount="$750,000"
            status="Closed"
          />
        </div>
      </div>
    </div>
  );
}

export default function BuilderDealsPage(props: BuilderDealsPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <BuilderDealsPageContent {...props} />
    </Suspense>
  );
}
