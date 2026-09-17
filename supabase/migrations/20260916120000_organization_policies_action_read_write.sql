-- ============================================================================
-- Extend organization_policies.action CHECK to allow API key verbs.
-- ============================================================================
-- Choice: extend the CHECK (do not remap read/write → select/update).
-- API_RESOURCES already persists `read` / `write` on resource_type = 'api_key'.
-- Remapping would silently change engine semantics and API-key scope labels.
-- ============================================================================

ALTER TABLE public.organization_policies
  DROP CONSTRAINT IF EXISTS organization_policies_action_check;

ALTER TABLE public.organization_policies
  ADD CONSTRAINT organization_policies_action_check CHECK (
    action = ANY (ARRAY[
      'select'::text,
      'insert'::text,
      'update'::text,
      'delete'::text,
      'all'::text,
      'submit'::text,
      'view'::text,
      'room_write'::text,
      'room_read'::text,
      'room_presence_write'::text,
      'room_private'::text,
      'read'::text,
      'write'::text
    ])
  );

COMMENT ON CONSTRAINT organization_policies_action_check ON public.organization_policies IS
  'Includes API key verbs read/write in addition to table/feature/liveblocks actions.';
