-- Revoke anonymous access from document-related objects
-- Defense-in-depth: while RLS policies protect data (requiring auth.jwt()),
-- removing anon grants provides an additional security layer.

-- Revoke all anon permissions on the view
REVOKE ALL ON public.transaction_documents_view FROM anon;

-- Revoke all anon permissions on underlying tables
REVOKE ALL ON public.bsi_transactions_document_files FROM anon;
REVOKE ALL ON public.document_files FROM anon;

-- Add comments for documentation
COMMENT ON VIEW public.transaction_documents_view IS 
  'Joins transaction document files with document metadata. SECURITY INVOKER ensures RLS is enforced for the calling user.';

