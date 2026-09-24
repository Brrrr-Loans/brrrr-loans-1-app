declare namespace google.maps.places {
  class AutocompleteSessionToken {
    constructor();
  }
  interface FormattableText {
    text: string;
  }
  interface PlacePrediction {
    placeId: string;
    text: FormattableText | null;
    mainText: FormattableText | null;
    secondaryText: FormattableText | null;
  }
  interface AutocompleteSuggestion {
    placePrediction: PlacePrediction | null;
  }
  interface AutocompleteRequest {
    input: string;
    sessionToken?: AutocompleteSessionToken | null;
    includedPrimaryTypes?: string[];
    includedRegionCodes?: string[];
  }
  const AutocompleteSuggestion: {
    fetchAutocompleteSuggestions(
      request: AutocompleteRequest
    ): Promise<{ suggestions: AutocompleteSuggestion[] }>;
  };
  interface AddressComponent {
    longText: string | null;
    shortText: string | null;
    types: string[];
  }
  class Place {
    constructor(options: { id: string });
    fetchFields(options: {
      fields: string[];
    }): Promise<{ place: Place }>;
    addressComponents?: AddressComponent[];
    formattedAddress?: string | null;
  }
  enum PlacesServiceStatus {
    OK = "OK",
    ZERO_RESULTS = "ZERO_RESULTS",
    INVALID_REQUEST = "INVALID_REQUEST",
    OVER_QUERY_LIMIT = "OVER_QUERY_LIMIT",
    REQUEST_DENIED = "REQUEST_DENIED",
    UNKNOWN_ERROR = "UNKNOWN_ERROR",
    NOT_FOUND = "NOT_FOUND",
  }
  interface StructuredFormatting {
    main_text: string;
    secondary_text?: string;
  }
  interface AutocompletePrediction {
    place_id: string;
    description: string;
    structured_formatting: StructuredFormatting;
  }
  interface AutocompletionRequest {
    input: string;
    componentRestrictions?: { country: string | string[] };
    types?: string[];
    sessionToken?: AutocompleteSessionToken;
  }
  class AutocompleteService {
    getPlacePredictions(
      request: AutocompletionRequest,
      callback: (
        predictions: AutocompletePrediction[] | null,
        status: PlacesServiceStatus
      ) => void
    ): void;
  }
  interface GeocoderAddressComponent {
    long_name: string;
    short_name: string;
    types: string[];
  }
  interface PlaceResult {
    address_components?: GeocoderAddressComponent[];
    formatted_address?: string;
  }
  interface PlaceDetailsRequest {
    placeId: string;
    fields?: string[];
  }
  class PlacesService {
    constructor(attrContainer: HTMLDivElement | HTMLElement);
    getDetails(
      request: PlaceDetailsRequest,
      callback: (
        place: PlaceResult | null,
        status: PlacesServiceStatus
      ) => void
    ): void;
  }
}
interface Window {
  google: typeof google;
}
