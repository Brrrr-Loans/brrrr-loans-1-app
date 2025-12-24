"use client";

import dynamic from "next/dynamic";
import "@grapesjs/studio-sdk/style";

// Dynamically import the StudioEditor to avoid SSR issues
const StudioEditor = dynamic(
  () => import("@grapesjs/studio-sdk/react").then((mod) => mod.default),
  { ssr: false }
);

interface GrapesJSEditorProps {
  licenseKey: string;
}

export function GrapesJSEditor({ licenseKey }: GrapesJSEditorProps) {
  return (
    <div className="h-[calc(100vh-200px)] w-full rounded-lg border border-border overflow-hidden">
      <StudioEditor
        options={{
          licenseKey,
          project: {
            type: "web",
            default: {
              pages: [
                {
                  name: "Home",
                  component:
                    '<div style="padding: 20px;"><h1>Welcome to the Page Builder</h1><p>Start creating your page by dragging components from the sidebar.</p></div>',
                },
              ],
            },
          },
        }}
      />
    </div>
  );
}

