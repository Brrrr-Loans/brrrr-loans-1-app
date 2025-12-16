/**
 * Theme Module
 * 
 * Provides theme management for organization-level customization.
 * 
 * Usage:
 * ```ts
 * import { applyTheme, fetchDefaultTheme, saveTheme } from "@/lib/theme";
 * 
 * // Load and apply org's default theme
 * const theme = await fetchDefaultTheme(orgId);
 * if (theme) applyTheme(theme);
 * 
 * // Save a new theme
 * await saveTheme(orgId, "Dark Professional", tokensLight, tokensDark, radius, true);
 * ```
 */

export * from "./constants";
export * from "./utils";

