import { RouteProtection } from "@/components/auth/route-protection";
import { GrapesJSEditor } from "./grapesjs-editor";

export default function GrapesJSPage() {
  // Read license key server-side from environment variable
  const licenseKey = process.env.GRAPESJS_LICENSE_KEY;

  if (!licenseKey) {
    return (
      <RouteProtection requiredRoles={["admin"]}>
        <div className="flex flex-1 flex-col space-y-6">
          <div>
            <h1 className="text-3xl font-bold">GrapesJS Pages</h1>
            <p className="text-muted-foreground">
              Visual web page editor for creating and editing content
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

  return (
    <RouteProtection requiredRoles={["admin"]}>
      <div className="flex flex-1 flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold">GrapesJS Pages</h1>
          <p className="text-muted-foreground">
            Visual web page editor for creating and editing content
          </p>
        </div>
        <GrapesJSEditor licenseKey={licenseKey} />
      </div>
    </RouteProtection>
  );
}
