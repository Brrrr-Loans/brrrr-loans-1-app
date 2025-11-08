import type { Appearance } from "@clerk/types";

// Clerk Theme - Light Mode Variables
export const clerkThemeVariables = {
  // Colors
  colorBackground: "hsl(0 0% 100%)", // --background root
  colorPrimary: "hsl(240 10% 3.9%)", // --primary root
  colorDanger: "hsl(0 84.2% 60.2%)", // --destructive root
  colorSuccess: "hsl(12 76% 61%)", // --chart-2 root
  colorNeutral: "hsl(240 10% 3.9%)", // --foreground root
  colorText: "hsl(240 5.9% 10%)", // --foreground root
  colorTextSecondary: "hsl(240 3.8% 46.1%)", // --muted-foreground root
  colorInputBackground: "hsl(0 0% 100%)", // --background root
  colorInputText: "hsl(240 10% 3.9%)", // --foreground root

  // Borders - direct value
  borderRadius: "0.5rem",

  // Typography - can keep var reference for font
  fontFamily: "var(--font-sans)",
  fontSize: "14px",
};

// Clerk Theme - Dark Mode Variables
export const clerkDarkThemeVariables = {
  // Colors
  colorBackground: "hsl(240 10% 3.9%)", // --background dark mode
  colorPrimary: "hsl(0 0% 98%)", // --card background dark mode
  colorDanger: "hsl(0 62.8% 30.6%)", // --destructive dark mode
  colorSuccess: "hsl(12 76% 61%)", // --chart-2 dark mode
  colorNeutral: "hsl(0 0% 98%)", // --background dark mode
  colorText: "hsl(0 0% 98%)", // --foreground dark mode
  colorTextSecondary: "hsl(240 5% 64.9%)", // --muted-foreground dark mode
  colorInputBackground: "hsl(240 10% 3.9%)", // --background dark mode
  colorInputText: "hsl(0 0% 98%)", // --foreground dark mode

  // Borders and typography can stay the same
  borderRadius: "0.5rem",
  fontFamily: "var(--font-sans)",
  fontSize: "14px",
};

// Common element overrides to better match our UI
const commonElementOverrides = {
  footerActionLink:
    "text-primary hover:text-primary/90 hover:underline transition-colors",
  socialButtons: "clerk-social-buttons",
  cardBox: "shadow-sm border border-border",
};

// Tailor appearance objects for specific components
export const signInAppearance: Appearance = {
  variables: clerkThemeVariables,
  elements: {
    ...commonElementOverrides,
    formButtonPrimary:
      "text-[hsl(0_0%_98%)] hover:opacity-90 transition-opacity",
    headerTitle: "clerk-header-title",
    headerSubtitle: "clerk-header-subtitle",
    socialButtonsBlockButton: "clerk-social-buttons-block-button",
    socialButtonsProviderIcon_github:
      "clerk-social-buttons-provider-icon-github",
    // Apply specific classes for Google button (lines 172-177)
    socialButtonsBlockButton__google:
      "clerk-social-buttons-block-button[data-provider='google'] .cl-internal-icon + span::after",
    // Apply specific classes for Github button (lines 189-194)
    socialButtonsBlockButton__github:
      "clerk-social-buttons-block-button[data-provider='github'] span:not([class*='icon'], [role='img'])",
    // Form field customizations
    formFieldLabel__emailAddress: "sr-only", // Hide email label
    formFieldInput__emailAddress: "w-full",
    formFieldInput__password: "w-full",
  },
};

// Dark mode appearance
export const signInDarkAppearance: Appearance = {
  variables: clerkDarkThemeVariables,
  elements: {
    ...commonElementOverrides,
    formButtonPrimary:
      "text-[hsl(240_5.9%_10%)] hover:opacity-90 transition-opacity",
    headerTitle: "clerk-header-title",
    headerSubtitle: "clerk-header-subtitle",
    socialButtonsBlockButton: "clerk-social-buttons-block-button",
    socialButtonsProviderIcon_github:
      "clerk-social-buttons-provider-icon-github",
    // Apply specific classes for Google button (lines 172-177)
    socialButtonsBlockButton__google:
      "clerk-social-buttons-block-button[data-provider='google'] .cl-internal-icon + span::after",
    // Apply specific classes for Github button (lines 189-194)
    socialButtonsBlockButton__github:
      "clerk-social-buttons-block-button[data-provider='github'] span:not([class*='icon'], [role='img'])",
    // Form field customizations
    formFieldLabel__emailAddress: "sr-only", // Hide email label
    formFieldInput__emailAddress: "w-full",
    formFieldInput__password: "w-full",
  },
};

export const signUpAppearance: Appearance = {
  variables: clerkThemeVariables,
  elements: {
    ...commonElementOverrides,
    formButtonPrimary:
      "text-[hsl(0_0%_98%)] hover:opacity-90 transition-opacity",
    headerTitle:
      "[&_span]:hidden [&::before]:content-['Sign_Up'] [&::before]:block",
  },
};

// Dark mode appearance for sign up
export const signUpDarkAppearance: Appearance = {
  variables: clerkDarkThemeVariables,
  elements: {
    ...commonElementOverrides,
    formButtonPrimary:
      "text-[hsl(240_5.9%_10%)] hover:opacity-90 transition-opacity",
    headerTitle:
      "&_span]:hidden [&::before]:content-['Sign_Up'] [&::before]:block",
  },
};

// Custom form field attributes (labels, placeholders)
export const clerkFormFieldAttributes = {
  emailAddress: {
    label: "Email",
    placeholder: "Email Address",
  },
  password: {
    label: "Password",
    placeholder: "Password",
  },
  firstName: {
    label: "First Name",
    placeholder: "First Name",
  },
  lastName: {
    label: "Last Name",
    placeholder: "Last Name",
  },
  phoneNumber: {
    label: "Phone Number",
    placeholder: "Phone Number",
  },
};
