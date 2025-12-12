-- Fix bsi_distributions.statement_id: change from uuid to bigint and add FK to bsi_statements
-- Table is empty so this is a safe migration

-- Drop the uuid column
ALTER TABLE public.bsi_distributions 
  DROP COLUMN statement_id;

-- Add new statement_id column as bigint (nullable)
ALTER TABLE public.bsi_distributions 
  ADD COLUMN statement_id bigint NULL;

-- Add foreign key constraint
ALTER TABLE public.bsi_distributions 
  ADD CONSTRAINT bsi_distributions_statement_id_fkey 
  FOREIGN KEY (statement_id) REFERENCES public.bsi_statements(id);

-- Add index for query performance
CREATE INDEX IF NOT EXISTS idx_bsi_distributions_statement_id 
  ON public.bsi_distributions USING btree (statement_id);
