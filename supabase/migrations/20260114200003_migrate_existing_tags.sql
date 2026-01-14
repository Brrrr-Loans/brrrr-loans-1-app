-- Migration: Migrate existing tags from document_files.tags TEXT[] to new structure
-- 
-- This migration:
-- 1. Extracts unique tags from the TEXT[] column
-- 2. Creates entries in document_tags table
-- 3. Creates junction table entries in document_files_tags
-- 4. Keeps the old tags column for backward compatibility (can be dropped later)

-- Step 1: Insert unique tags into document_tags table
-- Extract all unique tag values from the existing tags arrays
INSERT INTO public.document_tags (name, slug)
SELECT DISTINCT 
    unnest(tags) as name,
    public.generate_tag_slug(unnest(tags)) as slug
FROM public.document_files
WHERE tags IS NOT NULL AND array_length(tags, 1) > 0
ON CONFLICT (slug) DO NOTHING;

-- Step 2: Create junction table entries linking documents to their tags
INSERT INTO public.document_files_tags (document_file_id, document_tag_id)
SELECT 
    df.id as document_file_id,
    dt.id as document_tag_id
FROM public.document_files df
CROSS JOIN LATERAL unnest(df.tags) as tag_name
JOIN public.document_tags dt ON dt.slug = public.generate_tag_slug(tag_name)
WHERE df.tags IS NOT NULL AND array_length(df.tags, 1) > 0
ON CONFLICT (document_file_id, document_tag_id) DO NOTHING;

-- Note: We're keeping the tags column for now for backward compatibility
-- It can be dropped in a future migration after confirming the new system works:
-- ALTER TABLE public.document_files DROP COLUMN IF EXISTS tags;

-- Add a comment to indicate the column is deprecated
COMMENT ON COLUMN public.document_files.tags IS 'DEPRECATED: Use document_files_tags junction table instead. This column will be removed in a future migration.';
