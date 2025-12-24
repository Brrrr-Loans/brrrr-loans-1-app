"use client";

import { RouteProtection } from "@/components/auth/route-protection";
import dynamic from "next/dynamic";
import "@grapesjs/studio-sdk/style";

// Dynamically import the StudioEditor to avoid SSR issues
const StudioEditor = dynamic(
  () => import("@grapesjs/studio-sdk/react").then((mod) => mod.default),
  { ssr: false }
);

function GrapesJSPageContent() {
  return (
    <div className="flex flex-1 flex-col space-y-6">
      <div>
        <h1 className="text-3xl font-bold">GrapesJS Pages</h1>
        <p className="text-muted-foreground">
          Visual web page editor for creating and editing content
        </p>
      </div>

      <div className="h-[calc(100vh-200px)] w-full rounded-lg border border-border overflow-hidden">
        <StudioEditor
          options={{
            licenseKey: "66c675e64d25461ca9e7800b304d0ff5a285f69f3f1840c89dd18810659ce24e",
            project: {
              type: "web",
              default: {
                pages: [
                  {
                    name: "Home",
                    component: '<div style="padding: 20px;"><h1>Welcome to the Web Builder</h1><p>Start creating your page by dragging components from the sidebar.</p></div>',
                  },
                ],
              },
            },
          }}
        />
      </div>
    </div>
  );
}

export default function GrapesJSPage() {
  return (
    <RouteProtection requiredRoles={["admin"]}>
      <GrapesJSPageContent />
    </RouteProtection>
  );
}

