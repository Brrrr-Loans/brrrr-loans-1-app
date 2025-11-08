"use client";

import { BuilderComponent, builder, useIsPreviewing } from "@builder.io/react";
import { BuilderContent } from "@builder.io/sdk";
import { useState, useEffect, use, Suspense } from "react";

// Initialize Builder.io
builder.init(process.env.NEXT_PUBLIC_BUILDER_API_KEY!);

interface BuilderPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function BuilderPageContent({ searchParams }: BuilderPageProps) {
  const [content, setContent] = useState<BuilderContent | undefined>(undefined);
  const isPreviewing = useIsPreviewing();
  const model = "page";
  const resolvedSearchParams = use(searchParams);

  useEffect(() => {
    async function fetchContent() {
      const content = await builder
        .get(model, {
          url: "/builder",
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
        <BuilderComponent
          model={model}
          content={content}
          options={{
            includeRefs: true,
          }}
        />
      </div>
    );
  }

  // Show a placeholder when no content is found
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Builder.io Visual Editor</h1>
        <p className="text-lg text-muted-foreground">
          Welcome to your visual editing playground!
        </p>
        <p className="text-sm text-muted-foreground">
          Create content visually with Builder.io Fusion
        </p>
      </div>
    </div>
  );
}

export default function BuilderPage(props: BuilderPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <BuilderPageContent {...props} />
    </Suspense>
  );
}
