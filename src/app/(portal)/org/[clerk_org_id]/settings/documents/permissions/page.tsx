import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/shadcn/alert";
import DocumentRbacMatrixClient from "./rbac-matrix-client";
import { getDocumentRbacMatrix } from "../../actions";

export default async function DocumentPermissionsPage({
  params,
}: {
  params: Promise<{ clerk_org_id: string }>;
}) {
  const { clerk_org_id } = await params;

  // Fetch data on the server with error handling
  let matrixData;
  let error: string | null = null;

  try {
    matrixData = await getDocumentRbacMatrix();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load permissions data";
    console.error("Error loading RBAC matrix:", e);
  }

  return (
    <div className="w-full min-h-full px-4 pt-3 pb-3 mx-7 md:px-8 md:pt-9 md:pb-9">
      <div className="w-full max-w-6xl mx-auto">
        {/* Header with back button */}
        <div className="mb-8">
          <Link
            href={`/org/${clerk_org_id}/settings`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="size-4" />
            Back to Settings
          </Link>
          <h1 className="text-3xl font-bold">Document Permissions</h1>
          <p className="mt-1 text-muted-foreground">
            Control which roles can access different document types
          </p>
        </div>

        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertTitle>Unable to Load Permissions</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* RBAC Matrix - Client Component */}
        {matrixData && !error && <DocumentRbacMatrixClient initial={matrixData} />}
      </div>
    </div>
  );
}
