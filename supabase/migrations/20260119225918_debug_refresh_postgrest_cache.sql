-- =============================================================================
-- Debug helper: refresh PostgREST schema cache
-- =============================================================================
-- Needed so rpc() sees newly created debug_list_policies function.
-- =============================================================================

NOTIFY pgrst, 'reload schema';
