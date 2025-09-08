CREATE OR REPLACE FUNCTION public.update_property_address()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$declare 
  new_address text;
begin
  IF length(new.address_state_long::text) > 2 THEN
    new.address_state := get_state_code(new.address_state_long::text);
  END IF;

  new_address := format_address(new.address_street, new.address_suite_apt, new.address_city, new.address_state::text, new.address_postal_code, null, null);
  
  new.address = new_address;
  return new;
end;$function$ 