"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { useOrganization } from "@clerk/nextjs";
import { useSupabaseWithRefresh } from "@/hooks/use-supabase";
import {
  applyTheme,
  removeTheme,
  fetchDefaultTheme,
  fetchOrgThemes,
  saveTheme as saveThemeToDb,
  updateTheme as updateThemeInDb,
  deleteTheme as deleteThemeFromDb,
  setDefaultTheme as setDefaultThemeInDb,
  createDefaultTheme,
  type OrgTheme,
} from "@/lib/theme";

// ============================================================================
// TYPES
// ============================================================================

interface OrgThemeContextType {
  // State
  currentTheme: OrgTheme | null;
  availableThemes: OrgTheme[];
  isLoading: boolean;
  isOrgAdmin: boolean;
  internalOrgId: number | null;
  
  // Actions
  loadThemes: () => Promise<void>;
  applyThemeById: (themeId: number) => void;
  saveNewTheme: (
    name: string,
    tokensLight: Record<string, string>,
    tokensDark: Record<string, string>,
    radius: Record<string, string>,
    isDefault?: boolean
  ) => Promise<OrgTheme | null>;
  updateExistingTheme: (
    themeId: number,
    updates: Partial<Pick<OrgTheme, "name" | "tokens_light" | "tokens_dark" | "radius">>
  ) => Promise<OrgTheme | null>;
  deleteTheme: (themeId: number) => Promise<boolean>;
  setAsDefaultTheme: (themeId: number) => Promise<boolean>;
  resetToDefaults: () => void;
}

const OrgThemeContext = createContext<OrgThemeContextType>({
  currentTheme: null,
  availableThemes: [],
  isLoading: true,
  isOrgAdmin: false,
  internalOrgId: null,
  loadThemes: async () => {},
  applyThemeById: () => {},
  saveNewTheme: async () => null,
  updateExistingTheme: async () => null,
  deleteTheme: async () => false,
  setAsDefaultTheme: async () => false,
  resetToDefaults: () => {},
});

// ============================================================================
// PROVIDER
// ============================================================================

export function OrgThemeProvider({ children }: { children: ReactNode }) {
  const { organization, isLoaded: isOrgLoaded, membership } = useOrganization();
  const { client: supabase } = useSupabaseWithRefresh();
  
  const [currentTheme, setCurrentTheme] = useState<OrgTheme | null>(null);
  const [availableThemes, setAvailableThemes] = useState<OrgTheme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [internalOrgId, setInternalOrgId] = useState<number | null>(null);
  const [internalUserId, setInternalUserId] = useState<number | null>(null);
  
  // Check if user is org admin
  const isOrgAdmin = membership?.role === "org:admin" || membership?.role === "admin";

  // Load internal org ID when Clerk org changes
  useEffect(() => {
    async function loadInternalOrgId() {
      if (!isOrgLoaded || !organization?.id || !supabase) {
        if (isOrgLoaded && supabase) {
          setInternalOrgId(null);
          setIsLoading(false);
        }
        return;
      }
      
      // Get internal org ID. maybeSingle avoids PostgREST 406 when the
      // Clerk org is not yet synced into auth_clerk_orgs (0 rows).
      const { data: org, error: orgError } = await supabase
        .from("auth_clerk_orgs")
        .select("id")
        .eq("clerk_org_id", organization.id)
        .maybeSingle();

      if (orgError || !org) {
        if (orgError) {
          console.warn("Could not find internal org ID for", organization.id, orgError);
        }
        setInternalOrgId(null);
        setIsLoading(false);
        return;
      }

      setInternalOrgId(org.id);
    }

    loadInternalOrgId();
  }, [isOrgLoaded, organization?.id, supabase]);

  // Load internal user ID (for created_by tracking)
  useEffect(() => {
    async function loadInternalUserId() {
      if (!supabase) return;
      
      // Get the Clerk user ID from the organization membership or session
      const clerkUserId = membership?.publicUserData?.userId;
      if (!clerkUserId) return;
      
      const { data: internalUser } = await supabase
        .from("auth_clerk_users")
        .select("id")
        .eq("clerk_user_id", clerkUserId)
        .maybeSingle();

      if (internalUser) {
        setInternalUserId(internalUser.id);
      }
    }

    loadInternalUserId();
  }, [supabase, membership]);

  // Load themes when internal org ID is available
  const loadThemes = useCallback(async () => {
    if (!internalOrgId || !supabase) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      // Load all themes for the org
      const themes = await fetchOrgThemes(supabase, internalOrgId);
      setAvailableThemes(themes);

      // Find and apply default theme
      const defaultTheme = themes.find((t) => t.is_default);
      if (defaultTheme) {
        setCurrentTheme(defaultTheme);
        applyTheme(defaultTheme);
      } else {
        setCurrentTheme(null);
        removeTheme();
      }
    } catch (error) {
      console.error("Error loading themes:", error);
    } finally {
      setIsLoading(false);
    }
  }, [internalOrgId, supabase]);

  // Auto-load themes when org changes
  useEffect(() => {
    if (internalOrgId) {
      loadThemes();
    }
  }, [internalOrgId, loadThemes]);

  // Apply a specific theme by ID
  const applyThemeById = useCallback(
    (themeId: number) => {
      const theme = availableThemes.find((t) => t.id === themeId);
      if (theme) {
        setCurrentTheme(theme);
        applyTheme(theme);
      }
    },
    [availableThemes]
  );

  // Save a new theme
  const saveNewTheme = useCallback(
    async (
      name: string,
      tokensLight: Record<string, string>,
      tokensDark: Record<string, string>,
      radius: Record<string, string>,
      isDefault: boolean = false
    ): Promise<OrgTheme | null> => {
      if (!internalOrgId || !supabase) {
        return null;
      }

      const newTheme = await saveThemeToDb(
        supabase,
        internalOrgId,
        name,
        tokensLight,
        tokensDark,
        radius,
        isDefault,
        internalUserId ?? undefined
      );

      if (newTheme) {
        await loadThemes(); // Refresh theme list
        if (isDefault) {
          applyTheme(newTheme);
        }
      }

      return newTheme;
    },
    [internalOrgId, internalUserId, loadThemes, supabase]
  );

  // Update an existing theme
  const updateExistingTheme = useCallback(
    async (
      themeId: number,
      updates: Partial<Pick<OrgTheme, "name" | "tokens_light" | "tokens_dark" | "radius">>
    ): Promise<OrgTheme | null> => {
      if (!supabase) return null;
      
      const updatedTheme = await updateThemeInDb(supabase, themeId, updates);

      if (updatedTheme) {
        await loadThemes(); // Refresh theme list
        
        // If this is the current theme, re-apply it
        if (currentTheme?.id === themeId) {
          applyTheme(updatedTheme);
        }
      }

      return updatedTheme;
    },
    [loadThemes, currentTheme?.id, supabase]
  );

  // Delete a theme
  const deleteTheme = useCallback(
    async (themeId: number): Promise<boolean> => {
      if (!supabase) return false;
      
      const success = await deleteThemeFromDb(supabase, themeId);

      if (success) {
        // If we deleted the current theme, revert to defaults
        if (currentTheme?.id === themeId) {
          removeTheme();
          setCurrentTheme(null);
        }
        await loadThemes(); // Refresh theme list
      }

      return success;
    },
    [loadThemes, currentTheme?.id, supabase]
  );

  // Set a theme as default
  const setAsDefaultTheme = useCallback(
    async (themeId: number): Promise<boolean> => {
      if (!supabase) return false;
      
      const success = await setDefaultThemeInDb(supabase, themeId);

      if (success) {
        await loadThemes(); // Refresh theme list
        // Apply the new default theme
        const theme = availableThemes.find((t) => t.id === themeId);
        if (theme) {
          applyTheme(theme);
          setCurrentTheme(theme);
        }
      }

      return success;
    },
    [loadThemes, availableThemes, supabase]
  );

  // Reset to default styles (remove custom theme)
  const resetToDefaults = useCallback(() => {
    removeTheme();
    setCurrentTheme(null);
  }, []);

  return (
    <OrgThemeContext.Provider
      value={{
        currentTheme,
        availableThemes,
        isLoading,
        isOrgAdmin,
        internalOrgId,
        loadThemes,
        applyThemeById,
        saveNewTheme,
        updateExistingTheme,
        deleteTheme,
        setAsDefaultTheme,
        resetToDefaults,
      }}
    >
      {children}
    </OrgThemeContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useOrgTheme() {
  const context = useContext(OrgThemeContext);
  if (!context) {
    throw new Error("useOrgTheme must be used within an OrgThemeProvider");
  }
  return context;
}

