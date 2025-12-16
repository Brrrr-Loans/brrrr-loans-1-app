/**
 * Theme Utility Functions
 * 
 * Provides functions to apply, save, and load custom themes.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  EDITABLE_THEME_TOKENS,
  EDITABLE_RADIUS_TOKENS,
  DEFAULT_LIGHT_TOKENS,
  DEFAULT_DARK_TOKENS,
  DEFAULT_RADIUS,
  type OrgTheme,
} from "./constants";

// Use generic SupabaseClient to be compatible with different Database type definitions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TypedSupabaseClient = SupabaseClient<any>;

// ============================================================================
// THEME APPLICATION
// ============================================================================

/**
 * Applies a theme by injecting a <style> tag with CSS variables.
 * This is more efficient than calling setProperty 40+ times.
 * 
 * @param theme - The theme to apply
 */
export function applyTheme(theme: Pick<OrgTheme, "tokens_light" | "tokens_dark" | "radius">): void {
  // Remove existing theme style tag if present
  const existingStyle = document.getElementById("org-theme");
  if (existingStyle) {
    existingStyle.remove();
  }

  // Build CSS for light mode
  const lightVars = Object.entries(theme.tokens_light)
    .filter(([key]) => EDITABLE_THEME_TOKENS.includes(key as any))
    .map(([key, value]) => `--${key}: ${value};`)
    .join("\n    ");

  // Build CSS for dark mode
  const darkVars = Object.entries(theme.tokens_dark)
    .filter(([key]) => EDITABLE_THEME_TOKENS.includes(key as any))
    .map(([key, value]) => `--${key}: ${value};`)
    .join("\n    ");

  // Build CSS for radius (applies to both modes)
  const radiusVars = Object.entries(theme.radius)
    .filter(([key]) => EDITABLE_RADIUS_TOKENS.includes(key as any))
    .map(([key, value]) => `--${key}: ${value};`)
    .join("\n    ");

  // Create and inject style tag
  const style = document.createElement("style");
  style.id = "org-theme";
  style.textContent = `
  :root {
    ${lightVars}
    ${radiusVars}
  }
  
  .dark {
    ${darkVars}
    ${radiusVars}
  }
`;

  document.head.appendChild(style);
}

/**
 * Removes the custom theme and reverts to defaults.
 */
export function removeTheme(): void {
  const existingStyle = document.getElementById("org-theme");
  if (existingStyle) {
    existingStyle.remove();
  }
}

/**
 * Previews a theme temporarily without saving.
 * Used by the theme editor for live preview.
 * 
 * @param theme - Partial theme to preview
 */
export function previewTheme(
  tokensLight: Record<string, string>,
  tokensDark: Record<string, string>,
  radius: Record<string, string>
): void {
  applyTheme({
    tokens_light: tokensLight,
    tokens_dark: tokensDark,
    radius,
  });
}

// ============================================================================
// SUPABASE OPERATIONS
// ============================================================================

/**
 * Fetches the default theme for an organization.
 * 
 * @param supabase - Authenticated Supabase client
 * @param orgId - The organization's internal ID
 * @returns The default theme or null if none exists
 */
export async function fetchDefaultTheme(
  supabase: TypedSupabaseClient,
  orgId: number
): Promise<OrgTheme | null> {
  const { data, error } = await supabase
    .from("auth_clerk_orgs_themes")
    .select("*")
    .eq("org_id", orgId)
    .eq("is_default", true)
    .single();

  if (error) {
    // PGRST116 = no rows returned, which is expected for new orgs
    if (error.code !== "PGRST116") {
      console.error("Error fetching default theme:", error);
    }
    return null;
  }

  return data as OrgTheme;
}

/**
 * Fetches all themes for an organization.
 * 
 * @param supabase - Authenticated Supabase client
 * @param orgId - The organization's internal ID
 * @returns Array of themes
 */
export async function fetchOrgThemes(
  supabase: TypedSupabaseClient,
  orgId: number
): Promise<OrgTheme[]> {
  try {
    const { data, error } = await supabase
      .from("auth_clerk_orgs_themes")
      .select("*")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching org themes:", error);
      return [];
    }

    return (data ?? []) as OrgTheme[];
  } catch (err) {
    console.error("Exception fetching org themes:", err);
    return [];
  }
}

/**
 * Saves a new theme for an organization.
 * 
 * @param supabase - Authenticated Supabase client
 * @param orgId - The organization's internal ID
 * @param name - Theme name
 * @param tokensLight - Light mode tokens
 * @param tokensDark - Dark mode tokens
 * @param radius - Radius values
 * @param isDefault - Whether this should be the default theme
 * @param createdByUserId - The user creating the theme
 * @returns The created theme or null on error
 */
export async function saveTheme(
  supabase: TypedSupabaseClient,
  orgId: number,
  name: string,
  tokensLight: Record<string, string>,
  tokensDark: Record<string, string>,
  radius: Record<string, string>,
  isDefault: boolean = false,
  createdByUserId?: number
): Promise<OrgTheme | null> {
  // If setting as default, first unset any existing default
  if (isDefault) {
    await supabase
      .from("auth_clerk_orgs_themes")
      .update({ is_default: false })
      .eq("org_id", orgId)
      .eq("is_default", true);
  }

  const { data, error } = await supabase
    .from("auth_clerk_orgs_themes")
    .insert({
      org_id: orgId,
      name,
      tokens_light: tokensLight,
      tokens_dark: tokensDark,
      radius,
      is_default: isDefault,
      created_by_user_id: createdByUserId,
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving theme:", error);
    return null;
  }

  return data as OrgTheme;
}

/**
 * Updates an existing theme.
 * 
 * @param supabase - Authenticated Supabase client
 * @param themeId - The theme ID to update
 * @param updates - Partial theme updates
 * @returns The updated theme or null on error
 */
export async function updateTheme(
  supabase: TypedSupabaseClient,
  themeId: number,
  updates: Partial<Pick<OrgTheme, "name" | "tokens_light" | "tokens_dark" | "radius" | "is_default">>
): Promise<OrgTheme | null> {
  // If setting as default, first get the org_id and unset existing default
  if (updates.is_default) {
    const { data: theme } = await supabase
      .from("auth_clerk_orgs_themes")
      .select("org_id")
      .eq("id", themeId)
      .single();

    if (theme) {
      await supabase
        .from("auth_clerk_orgs_themes")
        .update({ is_default: false })
        .eq("org_id", theme.org_id)
        .eq("is_default", true);
    }
  }

  const { data, error } = await supabase
    .from("auth_clerk_orgs_themes")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", themeId)
    .select()
    .single();

  if (error) {
    console.error("Error updating theme:", error);
    return null;
  }

  return data as OrgTheme;
}

/**
 * Deletes a theme.
 * 
 * @param supabase - Authenticated Supabase client
 * @param themeId - The theme ID to delete
 * @returns True if successful
 */
export async function deleteTheme(
  supabase: TypedSupabaseClient,
  themeId: number
): Promise<boolean> {
  const { error } = await supabase
    .from("auth_clerk_orgs_themes")
    .delete()
    .eq("id", themeId);

  if (error) {
    console.error("Error deleting theme:", error);
    return false;
  }

  return true;
}

/**
 * Sets a theme as the default for an organization.
 * 
 * @param supabase - Authenticated Supabase client
 * @param themeId - The theme ID to set as default
 * @returns True if successful
 */
export async function setDefaultTheme(
  supabase: TypedSupabaseClient,
  themeId: number
): Promise<boolean> {
  const result = await updateTheme(supabase, themeId, { is_default: true });
  return result !== null;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Filters theme tokens to only include editable ones.
 * Use this when receiving output from Tinte editor.
 * 
 * @param tokens - Raw tokens object
 * @returns Filtered tokens with only editable keys
 */
export function filterEditableTokens(tokens: Record<string, string>): Record<string, string> {
  const filtered: Record<string, string> = {};
  
  for (const key of EDITABLE_THEME_TOKENS) {
    if (key in tokens) {
      filtered[key] = tokens[key];
    }
  }
  
  return filtered;
}

/**
 * Merges custom tokens with defaults.
 * Ensures all required tokens are present.
 * 
 * @param customTokens - Custom token values
 * @param mode - "light" or "dark"
 * @returns Complete tokens with defaults filled in
 */
export function mergeWithDefaults(
  customTokens: Record<string, string>,
  mode: "light" | "dark"
): Record<string, string> {
  const defaults = mode === "light" ? DEFAULT_LIGHT_TOKENS : DEFAULT_DARK_TOKENS;
  return { ...defaults, ...customTokens };
}

/**
 * Validates that a theme has all required tokens.
 * 
 * @param theme - Theme to validate
 * @returns Array of missing token names (empty if valid)
 */
export function validateTheme(
  tokensLight: Record<string, string>,
  tokensDark: Record<string, string>,
  radius: Record<string, string>
): string[] {
  const missing: string[] = [];

  for (const token of EDITABLE_THEME_TOKENS) {
    if (!(token in tokensLight)) missing.push(`light.${token}`);
    if (!(token in tokensDark)) missing.push(`dark.${token}`);
  }

  for (const token of EDITABLE_RADIUS_TOKENS) {
    if (!(token in radius)) missing.push(`radius.${token}`);
  }

  return missing;
}

/**
 * Creates a complete theme with defaults.
 * Use when initializing a new theme.
 */
export function createDefaultTheme(): Pick<OrgTheme, "tokens_light" | "tokens_dark" | "radius"> {
  return {
    tokens_light: { ...DEFAULT_LIGHT_TOKENS },
    tokens_dark: { ...DEFAULT_DARK_TOKENS },
    radius: { ...DEFAULT_RADIUS },
  };
}
