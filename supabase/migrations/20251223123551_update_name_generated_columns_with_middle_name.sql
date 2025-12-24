-- Migration: Update generated 'name' columns to include middle_name
-- Output: "John Michael Doe" or "John Doe" if middle_name is NULL/empty

-- ============================================
-- GUARANTOR TABLE
-- ============================================

-- Drop the existing generated column
ALTER TABLE public.guarantor DROP COLUMN IF EXISTS name;

-- Add it back with the new generation expression (immutable)
-- Uses CASE to conditionally include middle_name
ALTER TABLE public.guarantor 
  ADD COLUMN name text GENERATED ALWAYS AS (
    CASE 
      WHEN middle_name IS NOT NULL AND middle_name <> '' 
      THEN first_name || ' ' || middle_name || ' ' || last_name
      ELSE first_name || ' ' || last_name
    END
  ) STORED;

-- ============================================
-- BORROWER TABLE
-- ============================================

-- Drop the existing generated column
ALTER TABLE public.borrower DROP COLUMN IF EXISTS name;

-- Add it back with the new generation expression (immutable)
ALTER TABLE public.borrower 
  ADD COLUMN name text GENERATED ALWAYS AS (
    CASE 
      WHEN middle_name IS NOT NULL AND middle_name <> '' 
      THEN first_name || ' ' || middle_name || ' ' || last_name
      ELSE first_name || ' ' || last_name
    END
  ) STORED;

-- ============================================
-- CONTACT TABLE
-- ============================================

-- Drop the existing generated column
ALTER TABLE public.contact DROP COLUMN IF EXISTS name;

-- Add it back with the new generation expression (immutable)
ALTER TABLE public.contact 
  ADD COLUMN name text GENERATED ALWAYS AS (
    CASE 
      WHEN middle_name IS NOT NULL AND middle_name <> '' 
      THEN first_name || ' ' || middle_name || ' ' || last_name
      ELSE first_name || ' ' || last_name
    END
  ) STORED;
