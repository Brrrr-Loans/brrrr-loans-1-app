import DocumentRbacMatrixClient from "./rbac-matrix-client";
import { getDocumentRbacMatrix } from "../../actions";

export default async function DocumentPermissionsPage() {
  const data = await getDocumentRbacMatrix();
  return <DocumentRbacMatrixClient initial={data} />;
}
