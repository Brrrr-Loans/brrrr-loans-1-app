// GrapesJS Custom Components Registry
// This file exports component registration functions for custom form fields

import type { Editor } from "grapesjs";

// Google Places API Key - injected at build time
const GOOGLE_PLACES_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || "";

// Google "G" icon SVG - used for Google-integrated components
const GOOGLE_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24">
  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
</svg>`;

// Map pin with Google colors - combines location + Google branding
const GOOGLE_PLACES_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24">
  <defs>
    <linearGradient id="googleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4285F4"/>
      <stop offset="33%" style="stop-color:#34A853"/>
      <stop offset="66%" style="stop-color:#FBBC05"/>
      <stop offset="100%" style="stop-color:#EA4335"/>
    </linearGradient>
  </defs>
  <path fill="url(#googleGradient)" d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
  <circle cx="12" cy="10" r="3" fill="white"/>
  <text x="12" y="11.5" text-anchor="middle" font-size="4" font-weight="bold" fill="#4285F4">G</text>
</svg>`;

// Property Details Card icon
const PROPERTY_DETAILS_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
  <polyline points="9 22 9 12 15 12 15 22"/>
</svg>`;

/**
 * Mapping of default GrapesJS block IDs to user-friendly labels
 */
const BLOCK_LABEL_OVERRIDES: Record<string, string> = {
  // Grid/Layout blocks - make column layouts clearer
  "column1": "1 Column",
  "column2": "2 Column",
  "column3": "3 Column",
  "column3-7": "2 Column (3/7)",
};

/**
 * Reorganize default GrapesJS blocks into custom categories
 * and apply user-friendly labels
 */
export function reorganizeDefaultBlocks(editor: Editor) {
  const blockManager = editor.Blocks;
  if (!blockManager) return;

  // Get all blocks and update their labels
  const blocks = blockManager.getAll();
  
  // Log all available blocks for debugging (helps discover block IDs)
  console.log("[GrapesJS] Available blocks:", blocks.map(b => ({
    id: b.getId(),
    label: b.getLabel(),
    category: b.getCategoryLabel?.() || "uncategorized"
  })));
  
  blocks.forEach((block) => {
    const blockId = block.getId();
    const currentLabel = block.getLabel();
    
    // Check if we have a label override for this block
    const overrideLabel = BLOCK_LABEL_OVERRIDES[blockId];
    if (overrideLabel) {
      block.set("label", overrideLabel);
      console.log(`[GrapesJS] Renamed block "${blockId}" from "${currentLabel}" to "${overrideLabel}"`);
    }
  });
}

/**
 * Register the Property Address component
 * A smart address input with Google Places autocomplete
 */
export function registerPropertyAddressComponent(editor: Editor) {
  // The script that runs inside the iframe to enable Google Places autocomplete
  // Updated to use the new Places API (Place class) instead of deprecated PlacesService
  const propertyAddressScript = function (props: { apiKey: string }) {
    const el = this as HTMLElement;
    const apiKey = props.apiKey;

    console.log("[PropertyAddress] Script initialized, API key present:", !!apiKey);

    // Prevent re-initialization
    if (el.dataset.initialized === "true") {
      console.log("[PropertyAddress] Already initialized, skipping");
      return;
    }
    el.dataset.initialized = "true";

    const input = el.querySelector(
      ".property-address-input"
    ) as HTMLInputElement;
    const suggestionsContainer = el.querySelector(
      ".property-address-suggestions"
    ) as HTMLElement;
    const expandedFields = el.querySelector(
      ".property-address-expanded"
    ) as HTMLElement;
    const cityInput = el.querySelector(
      ".property-address-city"
    ) as HTMLInputElement;
    const stateSelect = el.querySelector(
      ".property-address-state"
    ) as HTMLSelectElement;
    const zipInput = el.querySelector(
      ".property-address-zip"
    ) as HTMLInputElement;
    const loadingIndicator = el.querySelector(
      ".property-address-loading"
    ) as HTMLElement;

    if (!input || !suggestionsContainer) return;

    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    let sessionToken: google.maps.places.AutocompleteSessionToken | null = null;

    // Load Google Places API with the new Places library
    function loadGooglePlacesAPI() {
      console.log("[PropertyAddress] loadGooglePlacesAPI called");
      
      if (!apiKey) {
        console.warn("[PropertyAddress] No API key provided - Google Places will not work");
        if (expandedFields) expandedFields.classList.remove("hidden");
        return;
      }
      
      if (window.google?.maps?.places?.Place) {
        console.log("[PropertyAddress] Google Places (new API) already loaded");
        initAutocomplete();
        return;
      }

      // Check if script is already loading
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        console.log("[PropertyAddress] Script already loading, waiting...");
        const checkInterval = setInterval(() => {
          if (window.google?.maps?.places?.Place) {
            clearInterval(checkInterval);
            initAutocomplete();
          }
        }, 100);
        return;
      }

      console.log("[PropertyAddress] Loading Google Places API script (new version)...");
      const script = document.createElement("script");
      // Load with loading=async for better performance
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log("[PropertyAddress] Google Places API loaded successfully");
        initAutocomplete();
      };
      script.onerror = (e) => {
        console.error("[PropertyAddress] Failed to load Google Places API:", e);
        if (expandedFields) expandedFields.classList.remove("hidden");
      };
      document.head.appendChild(script);
    }

    // Initialize autocomplete with new API
    function initAutocomplete() {
      console.log("[PropertyAddress] initAutocomplete called (new API)");
      if (!window.google?.maps?.places) {
        console.warn("[PropertyAddress] Google Places not available");
        return;
      }

      // Create a session token for billing optimization
      sessionToken = new window.google.maps.places.AutocompleteSessionToken();
      console.log("[PropertyAddress] New API initialized, adding input listeners");
      
      input.addEventListener("input", handleInput);
      input.addEventListener("focus", () => {
        if (suggestionsContainer.children.length > 0) {
          suggestionsContainer.classList.remove("hidden");
        }
      });

      document.addEventListener("click", (e) => {
        if (!el.contains(e.target as Node)) {
          suggestionsContainer.classList.add("hidden");
        }
      });
    }

    // Handle input changes with debounce
    function handleInput() {
      const query = input.value.trim();
      console.log("[PropertyAddress] handleInput called, query:", query);

      if (debounceTimer) clearTimeout(debounceTimer);

      if (query.length < 3) {
        suggestionsContainer.innerHTML = "";
        suggestionsContainer.classList.add("hidden");
        return;
      }

      if (loadingIndicator) loadingIndicator.classList.remove("hidden");

      debounceTimer = setTimeout(() => {
        searchAddresses(query);
      }, 300);
    }

    // Search for addresses using new Autocomplete API
    async function searchAddresses(query: string) {
      console.log("[PropertyAddress] searchAddresses called, query:", query);
      
      try {
        // Use the new AutocompleteSuggestion API
        const { suggestions } = await window.google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: query,
          sessionToken: sessionToken,
          includedPrimaryTypes: ["street_address", "premise", "subpremise"],
          includedRegionCodes: ["us"],
        });

        console.log("[PropertyAddress] Got suggestions:", suggestions?.length);
        if (loadingIndicator) loadingIndicator.classList.add("hidden");

        if (suggestions && suggestions.length > 0) {
          renderSuggestions(suggestions);
        } else {
          suggestionsContainer.innerHTML = "";
          suggestionsContainer.classList.add("hidden");
        }
      } catch (error) {
        console.error("[PropertyAddress] Error fetching suggestions:", error);
        if (loadingIndicator) loadingIndicator.classList.add("hidden");
        suggestionsContainer.innerHTML = "";
        suggestionsContainer.classList.add("hidden");
      }
    }

    // Render suggestions dropdown using new API response format
    function renderSuggestions(suggestions: google.maps.places.AutocompleteSuggestion[]) {
      suggestionsContainer.innerHTML = "";

      suggestions.forEach((suggestion) => {
        const prediction = suggestion.placePrediction;
        if (!prediction) return;

        const item = document.createElement("button");
        item.type = "button";
        item.className = "property-address-suggestion";
        // Apply inline styles to ensure they work in the GrapesJS canvas
        item.style.cssText = `
          width: 100%;
          padding: 12px 16px;
          text-align: left;
          display: flex;
          flex-direction: column;
          gap: 2px;
          border: none;
          border-bottom: 1px solid #e5e7eb;
          background: #fff;
          cursor: pointer;
          transition: background-color 0.15s ease;
        `;

        // New API uses different structure for text
        const mainText = prediction.mainText?.text || prediction.text?.text || "";
        const secondaryText = prediction.secondaryText?.text || "";
        
        item.innerHTML = `
          <span style="font-size: 14px; font-weight: 500; color: #111;">${mainText}</span>
          <span style="font-size: 12px; color: #6b7280;">${secondaryText}</span>
        `;
        
        // Add hover effect
        item.addEventListener("mouseenter", () => {
          item.style.backgroundColor = "#f3f4f6";
        });
        item.addEventListener("mouseleave", () => {
          item.style.backgroundColor = "#fff";
        });
        
        item.addEventListener("click", () => selectSuggestion(prediction));
        suggestionsContainer.appendChild(item);
      });

      suggestionsContainer.classList.remove("hidden");
    }

    // Handle suggestion selection using new Place API
    async function selectSuggestion(prediction: google.maps.places.PlacePrediction) {
      console.log("[PropertyAddress] Selecting suggestion:", prediction.placeId);
      
      try {
        // Use the new Place class to get details
        const place = new window.google.maps.places.Place({
          id: prediction.placeId,
        });

        // Fetch the address components
        await place.fetchFields({
          fields: ["addressComponents", "formattedAddress"],
        });

        console.log("[PropertyAddress] Got place details:", place.formattedAddress);
        
        if (place.addressComponents) {
          parseAndFillAddress(place.addressComponents);
        }
        
        suggestionsContainer.classList.add("hidden");
        suggestionsContainer.innerHTML = "";
        
        // Create a new session token for the next search
        sessionToken = new window.google.maps.places.AutocompleteSessionToken();
      } catch (error) {
        console.error("[PropertyAddress] Error fetching place details:", error);
      }
    }

    // Parse address components and fill fields (works with new API format)
    function parseAndFillAddress(components: google.maps.places.AddressComponent[]) {
      let streetNumber = "";
      let route = "";
      let city = "";
      let state = "";
      let zipCode = "";

      for (const component of components) {
        const types = component.types;

        if (types.includes("street_number")) {
          streetNumber = component.longText || "";
        } else if (types.includes("route")) {
          route = component.longText || "";
        } else if (types.includes("locality")) {
          city = component.longText || "";
        } else if (types.includes("administrative_area_level_1")) {
          state = component.shortText || "";
        } else if (types.includes("postal_code")) {
          zipCode = component.longText || "";
        }
      }

      const fullStreet = `${streetNumber} ${route}`.trim();
      input.value = fullStreet;

      if (cityInput) cityInput.value = city;
      if (stateSelect) stateSelect.value = state;
      if (zipInput) zipInput.value = zipCode;

      if (expandedFields) expandedFields.classList.remove("hidden");
    }

    // Start loading
    if (apiKey) {
      loadGooglePlacesAPI();
    } else {
      if (expandedFields) expandedFields.classList.remove("hidden");
    }
  };

  // Register the component type
  editor.Components.addType("property-address", {
    model: {
      defaults: {
        tagName: "div",
        droppable: false,
        attributes: {
          class: "property-address-component",
          "data-component-type": "property-address",
        },
        // Script to run inside the iframe
        script: propertyAddressScript,
        // Property that will be passed to the script
        apiKey: GOOGLE_PLACES_API_KEY,
        // Props passed to the script - array of property names from the model
        "script-props": ["apiKey"],
        // Component traits (configurable in right panel)
        traits: [
          {
            type: "text",
            name: "label",
            label: "Field Label",
            default: "Property Address",
          },
          {
            type: "checkbox",
            name: "required",
            label: "Required",
            default: true,
          },
          {
            type: "text",
            name: "placeholder",
            label: "Placeholder",
            default: "Start typing an address...",
          },
          {
            type: "text",
            name: "fieldName",
            label: "Field Name (for form data)",
            default: "propertyAddress",
          },
        ],
        // The HTML content with suggestions dropdown
        components: `
          <div class="property-address-wrapper space-y-3">
            <label class="block text-sm font-medium text-foreground">Property Address</label>
            <div class="relative">
              <div class="relative">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <input 
                  type="text" 
                  placeholder="Start typing an address..." 
                  class="property-address-input pl-10 w-full h-10 px-3 rounded-lg bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none transition-all duration-200"
                  style="border: 0;"
                  autocomplete="off"
                />
                <div class="property-address-loading hidden absolute right-3 top-1/2 -translate-y-1/2">
                  <div class="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              </div>
              <!-- Suggestions dropdown -->
              <div class="property-address-suggestions hidden" style="position: absolute; z-index: 50; width: 100%; margin-top: 4px; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1); max-height: 240px; overflow-y: auto;"></div>
            </div>
            <!-- Expanded address fields -->
            <div class="property-address-expanded space-y-3">
              <input 
                type="text" 
                placeholder="Apt, Suite, Unit, etc. (optional)" 
                class="property-address-line2 w-full h-10 px-3 rounded-lg bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none transition-all duration-200"
                style="border: 0;"
              />
              <div class="grid grid-cols-6 gap-3">
                <div class="col-span-3">
                  <input 
                    type="text" 
                    placeholder="City" 
                    class="property-address-city w-full h-10 px-3 rounded-lg bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none transition-all duration-200"
                    style="border: 0;"
                  />
                </div>
                <div class="col-span-2">
                  <select class="property-address-state w-full h-10 px-3 rounded-lg bg-muted text-foreground focus:outline-none transition-all duration-200" style="border: 0;">
                    <option value="">State</option>
                    <option value="AL">AL</option><option value="AK">AK</option><option value="AZ">AZ</option>
                    <option value="AR">AR</option><option value="CA">CA</option><option value="CO">CO</option>
                    <option value="CT">CT</option><option value="DE">DE</option><option value="FL">FL</option>
                    <option value="GA">GA</option><option value="HI">HI</option><option value="ID">ID</option>
                    <option value="IL">IL</option><option value="IN">IN</option><option value="IA">IA</option>
                    <option value="KS">KS</option><option value="KY">KY</option><option value="LA">LA</option>
                    <option value="ME">ME</option><option value="MD">MD</option><option value="MA">MA</option>
                    <option value="MI">MI</option><option value="MN">MN</option><option value="MS">MS</option>
                    <option value="MO">MO</option><option value="MT">MT</option><option value="NE">NE</option>
                    <option value="NV">NV</option><option value="NH">NH</option><option value="NJ">NJ</option>
                    <option value="NM">NM</option><option value="NY">NY</option><option value="NC">NC</option>
                    <option value="ND">ND</option><option value="OH">OH</option><option value="OK">OK</option>
                    <option value="OR">OR</option><option value="PA">PA</option><option value="RI">RI</option>
                    <option value="SC">SC</option><option value="SD">SD</option><option value="TN">TN</option>
                    <option value="TX">TX</option><option value="UT">UT</option><option value="VT">VT</option>
                    <option value="VA">VA</option><option value="WA">WA</option><option value="WV">WV</option>
                    <option value="WI">WI</option><option value="WY">WY</option><option value="DC">DC</option>
                  </select>
                </div>
                <div class="col-span-1">
                  <input 
                    type="text" 
                    placeholder="ZIP" 
                    maxlength="10"
                    class="property-address-zip w-full h-10 px-3 rounded-lg bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none transition-all duration-200"
                    style="border: 0;"
                  />
                </div>
              </div>
            </div>
            <!-- Google attribution -->
            <div class="flex items-center gap-1 text-xs text-muted-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Powered by Google</span>
            </div>
          </div>
        `,
        // Inline styles for the component
        styles: `
          .property-address-component input,
          .property-address-component select {
            border: 0 !important;
            transition: box-shadow 0.2s ease;
          }
          .property-address-component input:hover,
          .property-address-component select:hover {
            box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.3), 0 4px 16px rgba(99, 102, 241, 0.15);
          }
          .property-address-component input:focus,
          .property-address-component select:focus {
            box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.4), 0 4px 20px rgba(99, 102, 241, 0.2);
            outline: none;
          }
          .property-address-suggestions {
            background: #fff !important;
            border: 1px solid #e5e7eb !important;
            border-radius: 8px;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
          }
          .property-address-suggestion {
            background: #fff;
            color: #111;
          }
          .property-address-suggestion:hover {
            background: #f3f4f6 !important;
          }
          .property-address-suggestion:last-child {
            border-bottom: none !important;
          }
        `,
      },
    },
  });

  // Add to blocks panel with Google Places branding
  editor.Blocks.add("property-address", {
    label: "Property Address",
    category: {
      id: "loan-application",
      label: "Loan Application",
      order: 5,
      open: true,
    },
    media: GOOGLE_PLACES_ICON_SVG,
    content: { type: "property-address" },
    select: true,
  });
}

/**
 * Register the Property Details Card component
 * A complete card for property information in loan applications
 */
export function registerPropertyDetailsComponent(editor: Editor) {
  // Register the component type
  editor.Components.addType("property-details-card", {
    model: {
      defaults: {
        tagName: "div",
        droppable: true,
        attributes: {
          class: "property-details-card",
          "data-component-type": "property-details-card",
        },
        traits: [
          {
            type: "text",
            name: "title",
            label: "Card Title",
            default: "Property Details",
          },
          {
            type: "text",
            name: "stepNumber",
            label: "Step Number",
            default: "1",
          },
        ],
        components: `
          <div class="property-details-wrapper" style="background: var(--template-background, #fff); border: 1px solid var(--template-border, #e5e7eb); border-radius: 0.75rem; padding: 1.5rem; max-width: 640px;">
            <!-- Card Header -->
            <div class="property-details-header" style="margin-bottom: 1.5rem; border-bottom: 1px solid var(--template-border, #e5e7eb); padding-bottom: 1rem;">
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <div style="width: 2rem; height: 2rem; border-radius: 9999px; background: var(--template-primary, #111); color: var(--template-primary-foreground, #fff); display: flex; align-items: center; justify-content: center; font-size: 0.875rem; font-weight: 600;">1</div>
                <div>
                  <h2 style="font-size: 1.25rem; font-weight: 600; color: var(--template-foreground, #111); margin: 0;">Property Details</h2>
                  <p style="font-size: 0.875rem; color: var(--template-muted-foreground, #6b7280); margin: 0.25rem 0 0 0;">Tell us about the property you're financing</p>
                </div>
              </div>
            </div>
            
            <!-- Form Fields -->
            <div class="property-details-fields" style="display: flex; flex-direction: column; gap: 1.25rem;">
              <!-- Property Address - Uses the custom component -->
              <div data-gjs-type="property-address"></div>
              
              <!-- Property Type -->
              <div class="form-field">
                <label style="display: block; font-size: 0.875rem; font-weight: 500; color: var(--template-foreground, #111); margin-bottom: 0.5rem;">Property Type</label>
                <select name="propertyType" style="width: 100%; height: 2.5rem; padding: 0 0.75rem; border-radius: 0.5rem; background: var(--template-muted, #f3f4f6); color: var(--template-foreground, #111); border: 0; font-size: 0.875rem;">
                  <option value="">Select property type...</option>
                  <option value="single-family">Single Family Residence</option>
                  <option value="multi-family-2-4">Multi-Family (2-4 Units)</option>
                  <option value="multi-family-5+">Multi-Family (5+ Units)</option>
                  <option value="condo">Condominium</option>
                  <option value="townhouse">Townhouse</option>
                  <option value="mixed-use">Mixed Use</option>
                  <option value="commercial">Commercial</option>
                  <option value="land">Land / Lot</option>
                </select>
              </div>
              
              <!-- Occupancy Type -->
              <div class="form-field">
                <label style="display: block; font-size: 0.875rem; font-weight: 500; color: var(--template-foreground, #111); margin-bottom: 0.5rem;">Occupancy Type</label>
                <select name="occupancyType" style="width: 100%; height: 2.5rem; padding: 0 0.75rem; border-radius: 0.5rem; background: var(--template-muted, #f3f4f6); color: var(--template-foreground, #111); border: 0; font-size: 0.875rem;">
                  <option value="">Select occupancy type...</option>
                  <option value="primary">Primary Residence</option>
                  <option value="secondary">Second Home</option>
                  <option value="investment">Investment Property</option>
                </select>
              </div>
              
              <!-- Purchase Price / Estimated Value -->
              <div class="form-field">
                <label style="display: block; font-size: 0.875rem; font-weight: 500; color: var(--template-foreground, #111); margin-bottom: 0.5rem;">Purchase Price / Estimated Value</label>
                <div style="position: relative;">
                  <span style="position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--template-muted-foreground, #6b7280); font-size: 0.875rem;">$</span>
                  <input type="text" name="purchasePrice" placeholder="0.00" style="width: 100%; height: 2.5rem; padding: 0 0.75rem 0 1.5rem; border-radius: 0.5rem; background: var(--template-muted, #f3f4f6); color: var(--template-foreground, #111); border: 0; font-size: 0.875rem;" />
                </div>
              </div>
              
              <!-- Loan Amount Requested -->
              <div class="form-field">
                <label style="display: block; font-size: 0.875rem; font-weight: 500; color: var(--template-foreground, #111); margin-bottom: 0.5rem;">Loan Amount Requested</label>
                <div style="position: relative;">
                  <span style="position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--template-muted-foreground, #6b7280); font-size: 0.875rem;">$</span>
                  <input type="text" name="loanAmount" placeholder="0.00" style="width: 100%; height: 2.5rem; padding: 0 0.75rem 0 1.5rem; border-radius: 0.5rem; background: var(--template-muted, #f3f4f6); color: var(--template-foreground, #111); border: 0; font-size: 0.875rem;" />
                </div>
              </div>
              
              <!-- Year Built (Optional) -->
              <div class="form-field">
                <label style="display: block; font-size: 0.875rem; font-weight: 500; color: var(--template-foreground, #111); margin-bottom: 0.5rem;">Year Built <span style="color: var(--template-muted-foreground, #6b7280); font-weight: 400;">(optional)</span></label>
                <input type="text" name="yearBuilt" placeholder="e.g., 1985" maxlength="4" style="width: 100%; height: 2.5rem; padding: 0 0.75rem; border-radius: 0.5rem; background: var(--template-muted, #f3f4f6); color: var(--template-foreground, #111); border: 0; font-size: 0.875rem;" />
              </div>
            </div>
          </div>
        `,
        styles: `
          .property-details-card input,
          .property-details-card select {
            border: 0 !important;
            transition: box-shadow 0.2s ease;
          }
          .property-details-card input:hover,
          .property-details-card select:hover {
            box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.3), 0 4px 16px rgba(99, 102, 241, 0.15);
          }
          .property-details-card input:focus,
          .property-details-card select:focus {
            box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.4), 0 4px 20px rgba(99, 102, 241, 0.2);
            outline: none;
          }
        `,
      },
    },
  });

  // Add to blocks panel
  editor.Blocks.add("property-details-card", {
    label: "Property Details",
    category: {
      id: "loan-application",
      label: "Loan Application",
      order: 5,
      open: true,
    },
    media: PROPERTY_DETAILS_ICON_SVG,
    content: { type: "property-details-card" },
    select: true,
  });
}

/**
 * Register all custom form components
 */
export function registerCustomFormComponents(editor: Editor) {
  // First, reorganize default blocks into proper categories
  // Use a small delay to ensure all default blocks are loaded
  setTimeout(() => {
    reorganizeDefaultBlocks(editor);
  }, 100);

  // Register custom components
  registerPropertyAddressComponent(editor);
  registerPropertyDetailsComponent(editor);

  // Add more component registrations here as you create them:
  // registerGuarantorFormComponent(editor);
  // registerEntityFormComponent(editor);
  // registerCurrencyInputComponent(editor);
  // etc.
}

// Export the icons for reuse in other components
export { GOOGLE_ICON_SVG, GOOGLE_PLACES_ICON_SVG, PROPERTY_DETAILS_ICON_SVG };
