"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeBlock } from "../ai-elements/code-block";
import { Copy, FileText, Mail } from "lucide-react";
import { toast } from "sonner";

interface ArtifactViewProps {
  code: string;
  title: string;
  type: "react" | "html";
  explanation?: string;
}

export function ArtifactView({
  code,
  title,
  type,
  explanation,
}: ArtifactViewProps) {
  const [activeTab, setActiveTab] = useState("preview");

  const handleSaveAsDocument = () => {
    // TODO: Implement actual save logic
    console.log("Saving as Document Template:", { code, title });
    toast.success("Saved as Document Template");
  };

  const handleSaveAsEmail = () => {
    // TODO: Implement actual save logic
    console.log("Saving as Email Template:", { code, title });
    toast.success("Saved as Email Template");
  };

  return (
    <div className="flex flex-col w-full border rounded-lg overflow-hidden bg-background shadow-sm my-4">
      <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-b">
        <span
          className="text-sm font-medium truncate max-w-[200px]"
          title={title}
        >
          {title}
        </span>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => {
              navigator.clipboard.writeText(code);
              toast.success("Copied to clipboard");
            }}
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b px-4 bg-background">
          <TabsList className="h-9 w-full justify-start bg-transparent p-0">
            <TabsTrigger
              value="preview"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4"
            >
              Preview
            </TabsTrigger>
            <TabsTrigger
              value="code"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4"
            >
              Code
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="preview"
          className="mt-0 min-h-[300px] max-h-[500px] overflow-auto bg-white dark:bg-zinc-950 p-4 relative"
        >
          {type === "html" ? (
            <div
              className="w-full h-full min-h-[300px] bg-white text-black p-4 rounded border shadow-sm"
              dangerouslySetInnerHTML={{ __html: code }}
            />
          ) : (
            <div className="w-full h-full min-h-[300px] flex items-center justify-center text-muted-foreground border border-dashed rounded bg-muted/20">
              <div className="text-center p-4">
                <p className="mb-2">React Preview Not Available</p>
                <p className="text-xs">
                  Switch to Code tab to view the component source.
                </p>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="code" className="mt-0 max-h-[500px] overflow-auto">
          <CodeBlock
            code={code}
            language={type === "react" ? "tsx" : "html"}
            className="rounded-none border-0"
          />
        </TabsContent>
      </Tabs>

      {explanation && (
        <div className="p-3 bg-muted/20 text-xs text-muted-foreground border-t">
          {explanation}
        </div>
      )}

      <div className="flex gap-2 p-2 border-t bg-muted/10">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs gap-1.5"
          onClick={handleSaveAsDocument}
        >
          <FileText className="h-3.5 w-3.5" />
          Save as Doc
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs gap-1.5"
          onClick={handleSaveAsEmail}
        >
          <Mail className="h-3.5 w-3.5" />
          Save as Email
        </Button>
      </div>
    </div>
  );
}
