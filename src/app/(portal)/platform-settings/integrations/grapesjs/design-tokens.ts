/**
 * Design Tokens extracted from globals.css
 * These tokens represent the app's design system and can be imported into
 * the GrapesJS editor to create themed templates.
 *
 * IMPORTANT: This file is READ-ONLY reference data.
 * Edits in the GrapesJS editor do NOT modify globals.css.
 */

export type TokenCategory =
  | "colors-base"
  | "colors-semantic"
  | "colors-status"
  | "colors-sidebar"
  | "colors-charts"
  | "typography"
  | "spacing"
  | "radius"
  | "gradients"
  | "misc";

export interface DesignToken {
  /** CSS variable name without -- prefix */
  name: string;
  /** Display name for UI */
  displayName: string;
  /** Light mode value */
  light: string;
  /** Dark mode value */
  dark: string;
  /** Token category for grouping */
  category: TokenCategory;
  /** Whether this is an HSL color value (needs hsl() wrapper) */
  isHslColor: boolean;
  /** Whether this is a gradient */
  isGradient: boolean;
}

export interface TokenGroup {
  id: TokenCategory;
  name: string;
  tokens: DesignToken[];
}

// Helper to create a token
const token = (
  name: string,
  displayName: string,
  light: string,
  dark: string,
  category: TokenCategory,
  isHslColor = true,
  isGradient = false
): DesignToken => ({
  name,
  displayName,
  light,
  dark,
  category,
  isHslColor,
  isGradient,
});

// All design tokens from globals.css
export const designTokens: DesignToken[] = [
  // Base Colors
  token("background", "Background", "0 0% 100%", "0 0% 4%", "colors-base"),
  token("foreground", "Foreground", "0 0% 4%", "0 0% 98%", "colors-base"),
  token("card", "Card", "0 0% 100%", "0 0% 9%", "colors-base"),
  token(
    "card-foreground",
    "Card Foreground",
    "0 0% 4%",
    "0 0% 98%",
    "colors-base"
  ),
  token("popover", "Popover", "0 0% 100%", "240 10% 3.9%", "colors-base"),
  token(
    "popover-foreground",
    "Popover Foreground",
    "0 0% 4%",
    "0 0% 98%",
    "colors-base"
  ),

  // Semantic Colors
  token("primary", "Primary", "0 0% 9%", "0 0% 90%", "colors-semantic"),
  token(
    "primary-foreground",
    "Primary Foreground",
    "0 0% 98%",
    "240 5.9% 10%",
    "colors-semantic"
  ),
  token(
    "secondary",
    "Secondary",
    "240 4.8% 95.9%",
    "240 3.7% 15.9%",
    "colors-semantic"
  ),
  token(
    "secondary-foreground",
    "Secondary Foreground",
    "240 5.9% 10%",
    "0 0% 98%",
    "colors-semantic"
  ),
  token(
    "muted",
    "Muted",
    "240 4.8% 95.9%",
    "240 3.7% 15.9%",
    "colors-semantic"
  ),
  token(
    "muted-foreground",
    "Muted Foreground",
    "240 3.8% 46.1%",
    "0 0% 64%",
    "colors-semantic"
  ),
  token(
    "accent",
    "Accent",
    "240 4.8% 95.9%",
    "240 3.7% 15.9%",
    "colors-semantic"
  ),
  token(
    "accent-foreground",
    "Accent Foreground",
    "240 5.9% 10%",
    "0 0% 98%",
    "colors-semantic"
  ),
  token(
    "destructive",
    "Destructive",
    "0 84.2% 60.2%",
    "0 62.8% 30.6%",
    "colors-semantic"
  ),
  token(
    "destructive-foreground",
    "Destructive Foreground",
    "0 0% 98%",
    "0 0% 98%",
    "colors-semantic"
  ),
  token(
    "border",
    "Border",
    "240 5.9% 90%",
    "240 3.7% 15.9%",
    "colors-semantic"
  ),
  token("input", "Input", "240 5.9% 90%", "240 3.7% 15.9%", "colors-semantic"),
  token("ring", "Ring", "0 0% 4%", "240 4.9% 83.9%", "colors-semantic"),

  // Status Colors
  token("info", "Info", "217 92% 61%", "217 92% 61%", "colors-status"),
  token(
    "info-foreground",
    "Info Foreground",
    "223 85% 47%",
    "217 91% 72%",
    "colors-status"
  ),
  token("success", "Success", "142 76% 85%", "142 70% 18%", "colors-status"),
  token(
    "success-foreground",
    "Success Foreground",
    "142 76% 36%",
    "142 76% 75%",
    "colors-status"
  ),
  token("warning", "Warning", "38 92% 50%", "38 92% 50%", "colors-status"),
  token(
    "warning-foreground",
    "Warning Foreground",
    "33 92% 36%",
    "42 96% 56%",
    "colors-status"
  ),

  // Sidebar Colors
  token(
    "sidebar-background",
    "Sidebar Background",
    "0 0% 98%",
    "0 0% 9%",
    "colors-sidebar"
  ),
  token(
    "sidebar-foreground",
    "Sidebar Foreground",
    "0 0% 4%",
    "0 0% 98%",
    "colors-sidebar"
  ),
  token(
    "sidebar-primary",
    "Sidebar Primary",
    "240 5.9% 10%",
    "224.3 76.3% 48%",
    "colors-sidebar"
  ),
  token(
    "sidebar-primary-foreground",
    "Sidebar Primary Foreground",
    "0 0% 98%",
    "0 0% 98%",
    "colors-sidebar"
  ),
  token(
    "sidebar-accent",
    "Sidebar Accent",
    "240 4.8% 95.9%",
    "240 3.7% 15.9%",
    "colors-sidebar"
  ),
  token(
    "sidebar-accent-foreground",
    "Sidebar Accent Foreground",
    "240 5.9% 10%",
    "240 4.8% 95.9%",
    "colors-sidebar"
  ),
  token(
    "sidebar-border",
    "Sidebar Border",
    "220 13% 91%",
    "240 3.7% 15.9%",
    "colors-sidebar"
  ),
  token(
    "sidebar-ring",
    "Sidebar Ring",
    "217.2 91.2% 59.8%",
    "217.2 91.2% 59.8%",
    "colors-sidebar"
  ),

  // Chart Colors
  token("chart-1", "Chart 1", "12 76% 61%", "220 70% 50%", "colors-charts"),
  token("chart-2", "Chart 2", "173 58% 39%", "160 60% 45%", "colors-charts"),
  token("chart-3", "Chart 3", "197 37% 24%", "30 80% 55%", "colors-charts"),
  token("chart-4", "Chart 4", "43 74% 66%", "280 65% 60%", "colors-charts"),
  token("chart-5", "Chart 5", "27 87% 67%", "340 75% 55%", "colors-charts"),

  // Radius
  token("radius", "Radius", "0.5rem", "0.5rem", "radius", false),
  token("radius-sm", "Radius SM", "0.25rem", "0.25rem", "radius", false),
  token("radius-md", "Radius MD", "0.5rem", "0.5rem", "radius", false),
  token("radius-lg", "Radius LG", "0.75rem", "0.75rem", "radius", false),

  // Gradients
  token(
    "brand-gradient-orange",
    "Brand Gradient Orange",
    "radial-gradient(260.69% 202.67% at -4.83% -37.67%, #f72121 24%, #ff9500 71%, #f0d047 100%)",
    "radial-gradient(260.69% 202.67% at -4.83% -37.67%, #b71a1a 24%, #e07b00 71%, #bfa53d 100%)",
    "gradients",
    false,
    true
  ),
  token(
    "brand-gradient-blue",
    "Brand Gradient Blue",
    "linear-gradient(165deg, #2c53f0 5.99%, #39accd 91.59%)",
    "linear-gradient(155deg, #1b3ab8 5.99%, #2c7ea3 91.59%)",
    "gradients",
    false,
    true
  ),
  token(
    "brand-gradient-purple",
    "Brand Gradient Purple",
    "linear-gradient(165deg, #753fef 5.99%, #7697cd 91.59%)",
    "linear-gradient(155deg, #5323cc 5.99%, #627bb5 91.59%)",
    "gradients",
    false,
    true
  ),
  token(
    "brand-gradient-green",
    "Brand Gradient Green",
    "linear-gradient(165deg, #0ebb3f 5.99%, #3df04e 91.59%)",
    "linear-gradient(155deg, #067e2f 5.99%, #2ac23c 91.59%)",
    "gradients",
    false,
    true
  ),

  // Misc
  token(
    "box-shadow",
    "Box Shadow",
    "0px 1px 3px 0px rgb(0 0 0 / 10%), 0px 1px 2px 0px rgb(0 0 0 / 6%)",
    "0px 1px 3px 0px rgb(0 0 0 / 10%), 0px 1px 2px 0px rgb(0 0 0 / 6%)",
    "misc",
    false
  ),
];

// Group tokens by category
export const tokenGroups: TokenGroup[] = [
  {
    id: "colors-base",
    name: "Base Colors",
    tokens: designTokens.filter((t) => t.category === "colors-base"),
  },
  {
    id: "colors-semantic",
    name: "Semantic Colors",
    tokens: designTokens.filter((t) => t.category === "colors-semantic"),
  },
  {
    id: "colors-status",
    name: "Status Colors",
    tokens: designTokens.filter((t) => t.category === "colors-status"),
  },
  {
    id: "colors-sidebar",
    name: "Sidebar Colors",
    tokens: designTokens.filter((t) => t.category === "colors-sidebar"),
  },
  {
    id: "colors-charts",
    name: "Chart Colors",
    tokens: designTokens.filter((t) => t.category === "colors-charts"),
  },
  {
    id: "radius",
    name: "Border Radius",
    tokens: designTokens.filter((t) => t.category === "radius"),
  },
  {
    id: "gradients",
    name: "Gradients",
    tokens: designTokens.filter((t) => t.category === "gradients"),
  },
  {
    id: "misc",
    name: "Miscellaneous",
    tokens: designTokens.filter((t) => t.category === "misc"),
  },
];

/**
 * Generates CSS for GrapesJS canvas with both light and dark theme support.
 * Uses --grapesjs-template-* prefix to avoid conflicts with the app's design system.
 */
export function generateCanvasCSS(tokens: DesignToken[]): string {
  const lightVars = tokens
    .map((t) => {
      const value = t.isHslColor ? `hsl(${t.light})` : t.light;
      return `  --grapes-js-template-${t.name}: ${value};`;
    })
    .join("\n");

  const darkVars = tokens
    .map((t) => {
      const value = t.isHslColor ? `hsl(${t.dark})` : t.dark;
      return `  --grapesjs-template-${t.name}: ${value};`;
    })
    .join("\n");

  return `/* GrapesJS Template Design Tokens - Auto-generated */
/* These styles are isolated to the GrapesJS canvas only */

:root {
${lightVars}
}

.dark, [data-theme="dark"] {
${darkVars}
}

/* Base styles for templates */
body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: var(--grapesjs-template-foreground);
  background-color: var(--grapesjs-template-background);
  line-height: 1.5;
}
`;
}

/**
 * Get the formatted value for display (with hsl wrapper if needed)
 */
export function getDisplayValue(
  token: DesignToken,
  mode: "light" | "dark"
): string {
  const rawValue = mode === "light" ? token.light : token.dark;
  if (token.isHslColor) {
    return `hsl(${rawValue})`;
  }
  return rawValue;
}
