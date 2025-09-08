-- Migration: Fix deal name triggers and manually update existing deal names
-- Date: 2025-01-03
-- Description: Enable triggers and manually update all deal names with new formatting

-- Step 1: First apply the updated functions (if not already done)
-- (The previous migration should have updated these)

-- Step 2: Ensure the property change trigger is enabled
-- Check if the trigger exists and enable it
CREATE OR REPLACE FUNCTION public.handle_property_changes()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Update the deal_name in the deal table using the formatted address
    UPDATE public.deal
    SET deal_name = public.format_deal_name(NEW.id)
    WHERE property_id = NEW.id;

    RETURN NEW;
END;
$function$;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS handle_property_changes ON public.property;
DROP TRIGGER IF EXISTS handle_property_changes_trigger ON public.property;

-- Create the trigger to update deal names when property addresses change
CREATE TRIGGER handle_property_changes_trigger 
    AFTER UPDATE ON public.property 
    FOR EACH ROW 
    EXECUTE FUNCTION handle_property_changes();

-- Step 3: Manually update all existing deal names using the new formatting
-- This will apply the new formatting to all existing deals
UPDATE public.deal 
SET deal_name = public.format_deal_name(property_id)
WHERE property_id IS NOT NULL;

-- Step 4: Ensure the deal changes trigger is also working
CREATE OR REPLACE FUNCTION public.handle_deal_changes()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  property_address text;
BEGIN
  IF NEW.property_id IS NOT NULL THEN
    -- Use the format_deal_name function for consistency
    NEW.deal_name := public.format_deal_name(NEW.property_id);
  END IF;
  RETURN NEW;
END;
$function$;

-- Drop and recreate the deal changes trigger
DROP TRIGGER IF EXISTS handle_deal_changes_trigger ON public.deal;
CREATE TRIGGER handle_deal_changes_trigger 
    BEFORE INSERT OR UPDATE ON public.deal 
    FOR EACH ROW 
    EXECUTE FUNCTION handle_deal_changes();

-- Add comments to document the changes
COMMENT ON FUNCTION public.handle_property_changes() IS 'Trigger function to update deal names when property addresses change - fixed on 2025-01-03';
COMMENT ON FUNCTION public.handle_deal_changes() IS 'Trigger function to set deal names when deals are created/updated - fixed on 2025-01-03';
