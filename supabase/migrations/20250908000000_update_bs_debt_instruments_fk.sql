-- Migration: Replace bs_debt_instruments.name with deal_id foreign key
-- This migration reflects the changes made to use deal.id instead of loan_number text

-- Add deal_id column with foreign key constraint
ALTER TABLE public.bs_debt_instruments 
ADD COLUMN deal_id bigint;

-- Add foreign key constraint
ALTER TABLE public.bs_debt_instruments 
ADD CONSTRAINT bs_debt_instruments_deal_id_fkey 
FOREIGN KEY (deal_id) REFERENCES public.deal(id);

-- Populate deal_id from existing name/loan_number mapping
UPDATE public.bs_debt_instruments 
SET deal_id = d.id
FROM public.deal d 
WHERE d.loan_number = bs_debt_instruments.name;

-- Make deal_id NOT NULL
ALTER TABLE public.bs_debt_instruments 
ALTER COLUMN deal_id SET NOT NULL;

-- Drop the old name column
ALTER TABLE public.bs_debt_instruments 
DROP COLUMN name;