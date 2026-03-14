import { AlertCircle } from "lucide-react";
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
    <div>
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
  );
}
