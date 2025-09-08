-- Migration: Update address formatting functions to remove country and fix comma issues
-- Date: 2025-01-03
-- Description: Update format_address and format_deal_name functions to exclude country from output

-- Update the format_address function to exclude country
CREATE OR REPLACE FUNCTION public.format_address(po_box text, street text, apt_suite text, city text, state text, postal_code text, country text)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
    formatted_address text;
BEGIN
    -- Initialize an array to hold address components (excluding country)
    formatted_address := TRIM(BOTH ', ' FROM
        array_to_string(
            ARRAY_REMOVE(
                ARRAY[
                    NULLIF(street, ''),
                    NULLIF(apt_suite, ''),
                    NULLIF(city, ''),
                    CASE
                        WHEN COALESCE(state, '') <> '' AND COALESCE(postal_code, '') <> '' THEN
                            state || ' ' || postal_code
                        WHEN COALESCE(state, '') <> '' THEN
                            state
                        WHEN COALESCE(postal_code, '') <> '' THEN
                            postal_code
                        ELSE
                            NULL
                    END,
                    -- Removed country from array
                    CASE 
                        WHEN COALESCE(po_box, '') <> '' THEN
                            'PO Box ' || po_box 
                        ELSE 
                            NULL 
                    END
                ],
                NULL
            ),
            ', '
        )
    );

    -- Return the formatted address
    RETURN formatted_address;
END;
$function$;

-- Update the format_deal_name function (already correct format, but ensuring consistency)
CREATE OR REPLACE FUNCTION public.format_deal_name(property_id bigint)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
    formatted_name text;
BEGIN
    SELECT 
        CONCAT_WS(', ', 
            p.address_street, 
            p.address_suite_apt, 
            p.address_city || ', ' || p.address_state || ' ' || p.address_postal_code
        )
    INTO formatted_name
    FROM public.property p
    WHERE p.id = property_id;

    RETURN formatted_name;
END;
$function$;

-- Update the update_property_address trigger function to exclude country
CREATE OR REPLACE FUNCTION public.update_property_address()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE 
  new_address text;
BEGIN
  IF length(new.address_state_long::text) > 2 THEN
    new.address_state := get_state_code(new.address_state_long::text);
  END IF;

  -- Pass null for country parameter to exclude it from formatting
  new_address := format_address(new.address_street, new.address_suite_apt, new.address_city, new.address_state::text, new.address_postal_code, null, null);
  
  new.address = new_address;
  return new;
END;
$function$;

-- Add comment to document the changes
COMMENT ON FUNCTION public.format_address(text, text, text, text, text, text, text) IS 'Formats address components excluding country - updated on 2025-01-03';
COMMENT ON FUNCTION public.format_deal_name(bigint) IS 'Formats deal name from property address excluding country - updated on 2025-01-03';
