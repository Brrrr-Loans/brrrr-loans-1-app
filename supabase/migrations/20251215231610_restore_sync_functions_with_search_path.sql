-- ============================================================
-- RESTORE SYNC FUNCTIONS WITH search_path SET
-- This fixes the security warning about mutable search_path
-- ============================================================

CREATE OR REPLACE FUNCTION public.sync_transaction_to_investors()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Only create investor record if clerk_user_id or clerk_org_id is set on the transaction
  IF NEW.clerk_user_id IS NOT NULL OR NEW.clerk_org_id IS NOT NULL THEN
    -- Check if record already exists for this transaction
    IF NOT EXISTS (
      SELECT 1 FROM bsi_transactions_investors 
      WHERE transaction_id = NEW.id
    ) THEN
      INSERT INTO bsi_transactions_investors (
        transaction_id,
        clerk_user_id,
        clerk_org_id,
        allocation_amount,
        created_at
      ) VALUES (
        NEW.id,
        NEW.clerk_user_id,
        NEW.clerk_org_id,
        NEW.transaction_amount,
        NOW()
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.sync_transaction_to_investors_on_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Only act if clerk_user_id or clerk_org_id changed from NULL to a value
  IF (OLD.clerk_user_id IS NULL AND NEW.clerk_user_id IS NOT NULL) OR 
     (OLD.clerk_org_id IS NULL AND NEW.clerk_org_id IS NOT NULL) THEN
    -- Check if record already exists
    IF NOT EXISTS (
      SELECT 1 FROM bsi_transactions_investors 
      WHERE transaction_id = NEW.id
    ) THEN
      INSERT INTO bsi_transactions_investors (
        transaction_id,
        clerk_user_id,
        clerk_org_id,
        allocation_amount,
        created_at
      ) VALUES (
        NEW.id,
        NEW.clerk_user_id,
        NEW.clerk_org_id,
        NEW.transaction_amount,
        NOW()
      );
    ELSE
      -- Update existing record if it exists but has NULL values
      UPDATE bsi_transactions_investors
      SET 
        clerk_user_id = COALESCE(clerk_user_id, NEW.clerk_user_id),
        clerk_org_id = COALESCE(clerk_org_id, NEW.clerk_org_id)
      WHERE transaction_id = NEW.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

