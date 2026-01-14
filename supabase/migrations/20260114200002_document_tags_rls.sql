-- Migration: RLS policies for document_tags and document_files_tags tables

-- Enable RLS on document_tags
ALTER TABLE public.document_tags ENABLE ROW LEVEL SECURITY;

-- Admin can manage all tags
CREATE POLICY "Admin can manage document_tags"
ON public.document_tags
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- All authenticated users can read tags (for auto-complete)
CREATE POLICY "Authenticated users can read document_tags"
ON public.document_tags
FOR SELECT
TO authenticated
USING (true);

-- Enable RLS on document_files_tags
ALTER TABLE public.document_files_tags ENABLE ROW LEVEL SECURITY;

-- Admin can manage all tag assignments
CREATE POLICY "Admin can manage document_files_tags"
ON public.document_files_tags
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Users can read tag assignments for documents they have access to
-- (This follows the same access pattern as document_files)
CREATE POLICY "Users can read document_files_tags"
ON public.document_files_tags
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.document_files df
        WHERE df.id = document_files_tags.document_file_id
    )
);

-- Grant permissions
GRANT ALL ON TABLE public.document_tags TO authenticated;
GRANT ALL ON TABLE public.document_files_tags TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.document_tags_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.document_files_tags_id_seq TO authenticated;
