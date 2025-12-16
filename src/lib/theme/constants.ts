/**
 * Theme Token Constants
 * 
 * Defines which CSS variables are user-editable (theme tokens) vs locked (app tokens).
 * Theme tokens are the standard shadcn set that components consume consistently.
 * App tokens are locked because they're brand-specific or have special behavior.
 */

// ============================================================================
// USER-EDITABLE THEME TOKENS
// ============================================================================

/**
 * Core shadcn theme tokens that users can customize.
 * These tokens affect UI components consistently across the app.
 */
export const EDITABLE_THEME_TOKENS = [
  // Base colors
  "background",
  "foreground",
  
  // Card
  "card",
  "card-foreground",
  
  // Popover
  "popover",
  "popover-foreground",
  
  // Primary
  "primary",
  "primary-foreground",
  
  // Secondary
  "secondary",
  "secondary-foreground",
  
  // Muted
  "muted",
  "muted-foreground",
  
  // Accent
  "accent",
  "accent-foreground",
  
  // Destructive
  "destructive",
  "destructive-foreground",
  
  // Utility
  "border",
  "input",
  "ring",
  
  // Sidebar (user-editable as requested)
  "sidebar-background",
  "sidebar-foreground",
  "sidebar-primary",
  "sidebar-primary-foreground",
  "sidebar-accent",
  "sidebar-accent-foreground",
  "sidebar-border",
  "sidebar-ring",
] as const;

/**
 * Radius tokens that users can customize.
 */
export const EDITABLE_RADIUS_TOKENS = [
  "radius",
  "radius-sm",
  "radius-md",
  "radius-lg",
] as const;

// ============================================================================
// LOCKED APP TOKENS (NOT USER-EDITABLE)
// ============================================================================

/**
 * Brand and app-specific tokens that are NOT user-editable.
 * These exist for charts, gradients, and one-off components.
 */
export const LOCKED_APP_TOKENS = [
  // Brand gradients
  "brand-gradient-orange",
  "brand-gradient-blue",
  "brand-gradient-purple",
  "brand-gradient-green",
  
  // Chart tokens
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
  "chart-area-gradient-data-primary",
  "chart-area-gradient-data-secondary",
  "chart-grid",
  
  // Stat card tokens
  "stat-card-trend-positive",
  "stat-card-trend-negative",
  "stat-card-bg",
  
  // Utility
  "box-shadow",
  
  // Status colors (kept consistent for UX)
  "info",
  "info-foreground",
  "success",
  "success-foreground",
  "warning",
  "warning-foreground",
] as const;

// ============================================================================
// DEFAULT THEME VALUES
// ============================================================================

/**
 * Default light mode theme values.
 * These are the baseline values from globals.css.
 */
export const DEFAULT_LIGHT_TOKENS: Record<string, string> = {
  // Base
  background: "0 0% 100%",
  foreground: "0 0% 4%",
  
  // Card
  card: "0 0% 100%",
  "card-foreground": "0 0% 4%",
  
  // Popover
  popover: "0 0% 100%",
  "popover-foreground": "0 0% 4%",
  
  // Primary
  primary: "0 0% 9%",
  "primary-foreground": "0 0% 98%",
  
  // Secondary
  secondary: "240 4.8% 95.9%",
  "secondary-foreground": "240 5.9% 10%",
  
  // Muted
  muted: "240 4.8% 95.9%",
  "muted-foreground": "240 3.8% 46.1%",
  
  // Accent
  accent: "240 4.8% 95.9%",
  "accent-foreground": "240 5.9% 10%",
  
  // Destructive
  destructive: "0 84.2% 60.2%",
  "destructive-foreground": "0 0% 98%",
  
  // Utility
  border: "240 5.9% 90%",
  input: "240 5.9% 90%",
  ring: "0 0% 4%",
  
  // Sidebar
  "sidebar-background": "0 0% 98%",
  "sidebar-foreground": "0 0% 4%",
  "sidebar-primary": "240 5.9% 10%",
  "sidebar-primary-foreground": "0 0% 98%",
  "sidebar-accent": "240 4.8% 95.9%",
  "sidebar-accent-foreground": "240 5.9% 10%",
  "sidebar-border": "220 13% 91%",
  "sidebar-ring": "217.2 91.2% 59.8%",
};

/**
 * Default dark mode theme values.
 */
export const DEFAULT_DARK_TOKENS: Record<string, string> = {
  // Base
  background: "0 0% 4%",
  foreground: "0 0% 98%",
  
  // Card
  card: "0 0% 9%",
  "card-foreground": "0 0% 98%",
  
  // Popover
  popover: "240 10% 3.9%",
  "popover-foreground": "0 0% 98%",
  
  // Primary
  primary: "0 0% 90%",
  "primary-foreground": "240 5.9% 10%",
  
  // Secondary
  secondary: "240 3.7% 15.9%",
  "secondary-foreground": "0 0% 98%",
  
  // Muted
  muted: "240 3.7% 15.9%",
  "muted-foreground": "0 0% 64%",
  
  // Accent
  accent: "240 3.7% 15.9%",
  "accent-foreground": "0 0% 98%",
  
  // Destructive
  destructive: "0 62.8% 30.6%",
  "destructive-foreground": "0 0% 98%",
  
  // Utility
  border: "240 3.7% 15.9%",
  input: "240 3.7% 15.9%",
  ring: "240 4.9% 83.9%",
  
  // Sidebar
  "sidebar-background": "0 0% 9%",
  "sidebar-foreground": "0 0% 98%",
  "sidebar-primary": "224.3 76.3% 48%",
  "sidebar-primary-foreground": "0 0% 98%",
  "sidebar-accent": "240 3.7% 15.9%",
  "sidebar-accent-foreground": "240 4.8% 95.9%",
  "sidebar-border": "240 3.7% 15.9%",
  "sidebar-ring": "217.2 91.2% 59.8%",
};

/**
 * Default radius values.
 */
export const DEFAULT_RADIUS: Record<string, string> = {
  radius: "0.5rem",
  "radius-sm": "0.25rem",
  "radius-md": "0.5rem",
  "radius-lg": "0.75rem",
};

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type EditableThemeToken = (typeof EDITABLE_THEME_TOKENS)[number];
export type EditableRadiusToken = (typeof EDITABLE_RADIUS_TOKENS)[number];
export type LockedAppToken = (typeof LOCKED_APP_TOKENS)[number];

export interface ThemeTokens {
  light: Record<EditableThemeToken, string>;
  dark: Record<EditableThemeToken, string>;
  radius: Record<EditableRadiusToken, string>;
}

export interface OrgTheme {
  id: number;
  org_id: number;
  name: string;
  is_default: boolean;
  tokens_light: Record<string, string>;
  tokens_dark: Record<string, string>;
  radius: Record<string, string>;
  created_at: string;
  updated_at: string | null;
  created_by_user_id: number | null;
}

