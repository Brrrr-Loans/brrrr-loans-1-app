-- Create a view to expose storage objects to internal admins
-- This allows querying storage.objects through the public schema with RLS protection

CREATE OR REPLACE VIEW public.storage_objects_view AS
SELECT 
  id,
  name,
  bucket_id,
  owner,
  created_at,
  updated_at,
  metadata
FROM storage.objects o
WHERE is_internal_admin();

-- Grant access to authenticated users (RLS via is_internal_admin() handles authorization)
GRANT SELECT ON public.storage_objects_view TO authenticated;

COMMENT ON VIEW public.storage_objects_view IS 'Admin-only view of storage objects. Access controlled by is_internal_admin() function.';

