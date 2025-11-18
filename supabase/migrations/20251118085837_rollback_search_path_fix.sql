-- Migration: ROLLBACK - Restore original function definitions
-- This migration should ONLY be run if the search_path security fixes caused issues
-- It restores functions from the backup table created in migration 20251118085835

-- WARNING: This rollback removes the security fixes! Only use in emergency.

DO $$
DECLARE
    backup_exists boolean;
    func_def text;
    func_name text;
    restored_count integer := 0;
BEGIN
    -- Check if backup table exists
    SELECT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = '_function_backups_20251118'
    ) INTO backup_exists;
    
    IF NOT backup_exists THEN
        RAISE EXCEPTION 'Backup table _function_backups_20251118 does not exist. Cannot rollback.';
    END IF;
    
    -- Restore each function from backup
    FOR func_name, func_def IN 
        SELECT function_name, function_definition 
        FROM _function_backups_20251118
        ORDER BY function_name
    LOOP
        BEGIN
            EXECUTE func_def;
            restored_count := restored_count + 1;
            RAISE NOTICE 'Restored function: %', func_name;
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'Failed to restore function %: %', func_name, SQLERRM;
        END;
    END LOOP;
    
    RAISE NOTICE 'Rollback complete. Restored % functions from backup.', restored_count;
    RAISE WARNING 'Security fixes have been rolled back. Functions no longer have search_path protection!';
END $$;

-- Optional: Keep the backup table for reference
-- To remove it later, run: DROP TABLE IF EXISTS _function_backups_20251118;

COMMENT ON TABLE _function_backups_20251118 IS 
'Backup table used for rollback on 2025-11-18. Can be dropped after confirming stability.';

