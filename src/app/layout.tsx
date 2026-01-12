import type { ReactNode } from "react";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { SonnerToaster as Toaster } from "@/components/ui/index";
import { ThemeFavicon } from "@/components/layout/theme-favicon";
import { LyteNyteLicenseActivator } from "@/components/lytenyte-license-activator";
import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import { RootLayoutClient } from "@/components/layout/root-layout-client";
import Script from "next/script";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Repeat", // Fallback title
    template: "%s | Repeat", // Page titles become "Page Name | BL1 OS"
  },
  description:
    "The enterprise operating system for business-purpose lending at scale — open source, white-label, infinitely flexible",
  icons: {
    apple: "/assets/logos/brrrr-icon-sq-black-192.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider
      dynamic
      appearance={{
        variables: {
          colorPrimary: "var(--primary)",
          colorBackground: "var(--background)",
          colorInputBackground: "var(--input)",
          colorInputText: "var(--foreground)",
          colorText: "var(--foreground)",
          colorTextSecondary: "var(--muted-foreground)",
          colorDanger: "var(--destructive)",
        },
        elements: {
          rootBox: "w-full",
          card: "shadow-none bg-transparent",
          formButtonPrimary:
            "bg-primary text-primary-foreground hover:bg-primary/90",
          formFieldInput: "bg-input border-border",
          footerActionLink: "text-primary hover:text-primary/90",
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <head>
          {process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY && (
            <Script
              src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&libraries=places`}
              strategy="beforeInteractive"
            />
          )}
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
          suppressHydrationWarning
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ThemeFavicon />
            <LyteNyteLicenseActivator />
            <RootLayoutClient>{children}</RootLayoutClient>
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
