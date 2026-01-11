"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";

// US States list
const US_STATES = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
  { value: "DC", label: "District of Columbia" },
];

interface AddressSuggestion {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

interface AddressComponents {
  street1: string;
  street2: string;
  city: string;
  state: string;
  zipCode: string;
}

interface PropertyAddressProps {
  value?: AddressComponents;
  onChange?: (value: AddressComponents) => void;
  className?: string;
  disabled?: boolean;
}

// Framer-style gradient shadow on hover
const inputStyles = cn(
  "border-0 rounded-lg bg-muted/50 transition-all duration-200",
  "focus:outline-none focus:ring-0 focus-visible:ring-0",
  "hover:shadow-[0_0_0_1px_rgba(99,102,241,0.3),0_4px_16px_rgba(99,102,241,0.15)]",
  "focus:shadow-[0_0_0_2px_rgba(99,102,241,0.4),0_4px_20px_rgba(99,102,241,0.2)]"
);

const selectTriggerStyles = cn(
  "border-0 rounded-lg bg-muted/50 transition-all duration-200",
  "focus:outline-none focus:ring-0 focus-visible:ring-0",
  "hover:shadow-[0_0_0_1px_rgba(99,102,241,0.3),0_4px_16px_rgba(99,102,241,0.15)]",
  "focus:shadow-[0_0_0_2px_rgba(99,102,241,0.4),0_4px_20px_rgba(99,102,241,0.2)]",
  "data-[state=open]:shadow-[0_0_0_2px_rgba(99,102,241,0.4),0_4px_20px_rgba(99,102,241,0.2)]"
);

export function PropertyAddress({
  value,
  onChange,
  className,
  disabled = false,
}: PropertyAddressProps) {
  const [address, setAddress] = useState<AddressComponents>({
    street1: value?.street1 || "",
    street2: value?.street2 || "",
    city: value?.city || "",
    state: value?.state || "",
    zipCode: value?.zipCode || "",
  });

  const [showAllFields, setShowAllFields] = useState(false);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Google Places services
  useEffect(() => {
    if (typeof window !== "undefined" && window.google?.maps?.places) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
      // Create a dummy div for PlacesService (required by Google API)
      const dummyDiv = document.createElement("div");
      placesService.current = new window.google.maps.places.PlacesService(dummyDiv);
    }
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Notify parent of changes
  useEffect(() => {
    onChange?.(address);
  }, [address, onChange]);

  // Debounced address search
  const searchAddresses = useCallback((query: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!query || query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      if (!autocompleteService.current) {
        // Fallback: If Google Places API is not available, show a message
        console.warn("Google Places API not loaded");
        return;
      }

      setIsLoading(true);

      autocompleteService.current.getPlacePredictions(
        {
          input: query,
          componentRestrictions: { country: "us" },
          types: ["address"],
        },
        (predictions, status) => {
          setIsLoading(false);

          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            const formattedSuggestions: AddressSuggestion[] = predictions.map((p) => ({
              placeId: p.place_id,
              description: p.description,
              mainText: p.structured_formatting.main_text,
              secondaryText: p.structured_formatting.secondary_text || "",
            }));
            setSuggestions(formattedSuggestions);
            setShowSuggestions(true);
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
          }
        }
      );
    }, 300);
  }, []);

  // Handle suggestion selection
  const handleSelectSuggestion = (suggestion: AddressSuggestion) => {
    if (!placesService.current) return;

    placesService.current.getDetails(
      {
        placeId: suggestion.placeId,
        fields: ["address_components", "formatted_address"],
      },
      (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place?.address_components) {
          const components = place.address_components;

          let streetNumber = "";
          let route = "";
          let city = "";
          let state = "";
          let zipCode = "";

          for (const component of components) {
            const types = component.types;

            if (types.includes("street_number")) {
              streetNumber = component.long_name;
            } else if (types.includes("route")) {
              route = component.long_name;
            } else if (types.includes("locality")) {
              city = component.long_name;
            } else if (types.includes("administrative_area_level_1")) {
              state = component.short_name;
            } else if (types.includes("postal_code")) {
              zipCode = component.long_name;
            }
          }

          const newAddress: AddressComponents = {
            street1: `${streetNumber} ${route}`.trim(),
            street2: "",
            city,
            state,
            zipCode,
          };

          setAddress(newAddress);
          setShowAllFields(true);
          setShowSuggestions(false);
          setSuggestions([]);
        }
      }
    );
  };

  const handleStreet1Change = (value: string) => {
    setAddress((prev) => ({ ...prev, street1: value }));
    searchAddresses(value);
  };

  const handleFieldChange = (field: keyof AddressComponents, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Street Address Line 1 with Autocomplete */}
      <div className="relative">
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Enter property address..."
            value={address.street1}
            onChange={(e) => handleStreet1Change(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
            disabled={disabled}
            className={cn(inputStyles, "pl-10")}
          />
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.placeId}
                type="button"
                onClick={() => handleSelectSuggestion(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-accent transition-colors flex flex-col gap-0.5 border-b border-border last:border-0"
              >
                <span className="text-sm font-medium text-foreground">
                  {suggestion.mainText}
                </span>
                <span className="text-xs text-muted-foreground">
                  {suggestion.secondaryText}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Expanded Fields (shown after selection or manual expansion) */}
      {showAllFields && (
        <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
          {/* Street Address Line 2 */}
          <Input
            type="text"
            placeholder="Apt, Suite, Unit, etc. (optional)"
            value={address.street2}
            onChange={(e) => handleFieldChange("street2", e.target.value)}
            disabled={disabled}
            className={inputStyles}
          />

          {/* City, State, Zip Row */}
          <div className="grid grid-cols-6 gap-3">
            {/* City - takes 3 columns */}
            <div className="col-span-3">
              <Input
                type="text"
                placeholder="City"
                value={address.city}
                onChange={(e) => handleFieldChange("city", e.target.value)}
                disabled={disabled}
                className={inputStyles}
              />
            </div>

            {/* State - takes 2 columns */}
            <div className="col-span-2">
              <Select
                value={address.state}
                onValueChange={(value) => handleFieldChange("state", value)}
                disabled={disabled}
              >
                <SelectTrigger className={selectTriggerStyles}>
                  <SelectValue placeholder="State" />
                </SelectTrigger>
                <SelectContent>
                  {US_STATES.map((state) => (
                    <SelectItem key={state.value} value={state.value}>
                      {state.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Zip - takes 1 column */}
            <div className="col-span-1">
              <Input
                type="text"
                placeholder="ZIP"
                value={address.zipCode}
                onChange={(e) => handleFieldChange("zipCode", e.target.value)}
                disabled={disabled}
                maxLength={10}
                className={inputStyles}
              />
            </div>
          </div>
        </div>
      )}

      {/* Manual expand button if not showing all fields */}
      {!showAllFields && address.street1.length > 0 && (
        <button
          type="button"
          onClick={() => setShowAllFields(true)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          + Enter address manually
        </button>
      )}
    </div>
  );
}

// Export HTML structure for GrapesJS (static version for visual editing)
export const PropertyAddressHTML = `
<div class="property-address-component space-y-3" data-gjs-type="property-address">
  <div class="relative">
    <div class="relative">
      <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
      <input type="text" placeholder="Enter property address..." class="pl-10 w-full h-10 px-3 rounded-lg bg-muted/50 text-foreground placeholder:text-muted-foreground focus:outline-none transition-all duration-200 hover:shadow-[0_0_0_1px_rgba(99,102,241,0.3),0_4px_16px_rgba(99,102,241,0.15)]" />
    </div>
  </div>
</div>
`;
