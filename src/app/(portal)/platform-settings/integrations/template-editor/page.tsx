import { RouteProtection } from "@/components/auth/route-protection";
import { GrapesJSEditor } from "../grapesjs/grapesjs-editor";
import { TiptapEditor } from "../grapesjs/tiptap-editor";
import { Tabs } from "@/components/ui/shadcn/tabs";
import { FileText, Send } from "lucide-react";

interface TemplateEditorPageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function TemplateEditorPage({
  searchParams,
}: TemplateEditorPageProps) {
  const params = await searchParams;
  const currentTab = params.tab || "documents";

  // Read license key server-side from environment variable
  const licenseKey = process.env.GRAPESJS_LICENSE_KEY;

  if (!licenseKey) {
    return (
      <RouteProtection requiredRoles={["admin"]}>
        <div className="flex flex-1 flex-col space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Template Editor</h1>
            <p className="text-muted-foreground">
              AI-powered design interface for building document & email
              templates
            </p>
          </div>
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <p className="text-destructive">
              GrapesJS license key not configured. Please add
              GRAPESJS_LICENSE_KEY to your environment variables.
            </p>
          </div>
        </div>
      </RouteProtection>
    );
  }

  // NOTE: We cannot pass complex objects (like React nodes or components)
  // from a Server Component to a Client Component props (PageHeader).
  // So instead of using PageHeader's built-in tabs prop which expects content/icons,
  // we will manually implement the layout using the same styling as PageHeader
  // but keeping the content rendering here in the Server Component.

  return (
    <RouteProtection requiredRoles={["admin"]}>
      <div className="flex flex-col h-full space-y-6">
        {/* Header Section */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Template Editor</h1>
          <p className="text-muted-foreground">
            Visual web page editor for creating and editing content
          </p>
        </div>

        {/* Tabs Navigation (Manual Implementation matching PageHeader style) */}
        <Tabs defaultValue={currentTab} className="flex-1 flex flex-col">
          <div className="border-b border-border">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {/* Documents Tab */}
              <a
                href="/platform-settings/integrations/template-editor?tab=documents"
                className={`whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium transition-colors flex items-center gap-2 ${
                  currentTab === "documents"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground"
                }`}
              >
                <FileText className="h-4 w-4" />
                Documents
              </a>

              {/* Emails Tab */}
              <a
                href="/platform-settings/integrations/template-editor?tab=emails"
                className={`whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium transition-colors flex items-center gap-2 ${
                  currentTab === "emails"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground"
                }`}
              >
                <Send className="h-4 w-4" />
                Emails
              </a>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="mt-6 flex-1 pb-6">
            {currentTab === "documents" ? (
              <div className="flex-1 mt-0 h-full">
                <GrapesJSEditor licenseKey={licenseKey} />
              </div>
            ) : (
              <div className="flex-1 mt-0 h-full">
                <TiptapEditor />
              </div>
            )}
          </div>
        </Tabs>
      </div>
    </RouteProtection>
  );
}
