-- Migration: Rename auth_user_profile table to auth_clerk_users and rename clerk_id column
-- Date: 2025-01-03
-- Description: Rename table and column for better clarity and consistency

-- Step 1: Rename the table from auth_user_profile to auth_clerk_users
ALTER TABLE public.auth_user_profile RENAME TO auth_clerk_users;

-- Step 2: Rename the clerk_id column to clerk_user_id
ALTER TABLE public.auth_clerk_users RENAME COLUMN clerk_id TO clerk_user_id;

-- Step 3: Update any indexes that reference the old table name
-- Drop existing indexes
DROP INDEX IF EXISTS public.auth_user_profiles_username_key;
DROP INDEX IF EXISTS public.auth_user_profiles_clerk_id_key;

-- Recreate indexes with new names
CREATE UNIQUE INDEX auth_clerk_users_username_key ON public.auth_clerk_users (username);
CREATE UNIQUE INDEX auth_clerk_users_clerk_user_id_key ON public.auth_clerk_users (clerk_user_id);

-- Step 4: Update any constraints that reference the old table name
-- The primary key constraint will be automatically renamed by PostgreSQL
-- Foreign key constraints will also be automatically updated

-- Step 5: Update any functions or triggers that might reference the old table name
-- (We'll handle these in the code updates)

-- Add a comment to document the change
COMMENT ON TABLE public.auth_clerk_users IS 'User profiles integrated with Clerk authentication - renamed from auth_user_profile on 2025-01-03';
COMMENT ON COLUMN public.auth_clerk_users.clerk_user_id IS 'Clerk user ID - renamed from clerk_id on 2025-01-03';
