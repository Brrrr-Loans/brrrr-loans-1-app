-- Migration: Replace ALL auth.uid() with auth.jwt() ->> 'sub' for Clerk authentication
-- This fixes the UUID type error across the entire database

-- Helper function to replace all occurrences
DO $$
DECLARE
    policy_record RECORD;
    new_qual TEXT;
    new_with_check TEXT;
BEGIN
    -- Loop through all policies that use auth.uid()
    FOR policy_record IN 
        SELECT 
            schemaname,
            tablename,
            policyname,
            qual,
            with_check,
            cmd,
            roles,
            permissive
        FROM pg_policies 
        WHERE schemaname = 'public'
        AND (qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%')
    LOOP
        -- Replace auth.uid() with (auth.jwt() ->> 'sub'::text) in USING clause
        IF policy_record.qual IS NOT NULL THEN
            new_qual := REPLACE(policy_record.qual, 'auth.uid()', '(auth.jwt() ->> ''sub''::text)');
        ELSE
            new_qual := NULL;
        END IF;

        -- Replace auth.uid() with (auth.jwt() ->> 'sub'::text) in WITH CHECK clause
        IF policy_record.with_check IS NOT NULL THEN
            new_with_check := REPLACE(policy_record.with_check, 'auth.uid()', '(auth.jwt() ->> ''sub''::text)');
        ELSE
            new_with_check := NULL;
        END IF;

        -- Drop the old policy
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I',
            policy_record.policyname,
            policy_record.schemaname,
            policy_record.tablename
        );

        -- Recreate the policy with corrected auth
        IF new_qual IS NOT NULL AND new_with_check IS NOT NULL THEN
            EXECUTE format('CREATE POLICY %I ON %I.%I FOR %s TO %s USING (%s) WITH CHECK (%s)',
                policy_record.policyname,
                policy_record.schemaname,
                policy_record.tablename,
                policy_record.cmd,
                array_to_string(policy_record.roles, ', '),
                new_qual,
                new_with_check
            );
        ELSIF new_qual IS NOT NULL THEN
            EXECUTE format('CREATE POLICY %I ON %I.%I FOR %s TO %s USING (%s)',
                policy_record.policyname,
                policy_record.schemaname,
                policy_record.tablename,
                policy_record.cmd,
                array_to_string(policy_record.roles, ', '),
                new_qual
            );
        ELSIF new_with_check IS NOT NULL THEN
            EXECUTE format('CREATE POLICY %I ON %I.%I FOR %s TO %s WITH CHECK (%s)',
                policy_record.policyname,
                policy_record.schemaname,
                policy_record.tablename,
                policy_record.cmd,
                array_to_string(policy_record.roles, ', '),
                new_with_check
            );
        END IF;

        RAISE NOTICE 'Updated policy % on table %', policy_record.policyname, policy_record.tablename;
    END LOOP;
END $$;

