-- Migration: Update transaction_status enum
-- Adds 'pending_approval' and 'processed' values to transaction_status enum
-- This change has already been applied to the remote database
-- This migration documents the change for consistency

-- Add new enum values
ALTER TYPE public.transaction_status ADD VALUE IF NOT EXISTS 'pending_approval';
ALTER TYPE public.transaction_status ADD VALUE IF NOT EXISTS 'processed';

