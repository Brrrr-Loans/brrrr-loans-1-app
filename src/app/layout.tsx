import type { ReactNode } from "react";
import type { Metadata } from "next";
import {
  ClerkProvider,
  ClerkLoading,
  ClerkFailed,
} from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { SonnerToaster as Toaster } from "@/components/ui";
import { ThemeFavicon } from "@/components/layout/theme-favicon";
import { LyteNyteLicenseActivator } from "@/components/lytenyte-license-activator";
import { ClerkFailedFallback } from "@/components/auth/clerk-failed-fallback";
import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import { RootLayoutClient } from "@/components/layout/root-layout-client";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "BL1 OS",
  description: "BL1 Loan Origination System",
  icons: {
    apple: "/logos/brrrr-icon-sq-black-192.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        elements: {
          rootBox: "w-full",
          card: "shadow-none",
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
          suppressHydrationWarning
        >
          <ClerkLoading>
            <div className="flex min-h-screen items-center justify-center">
              <div className="text-center">
                <div className="mb-4 text-lg font-semibold">Loading...</div>
                <div className="text-sm text-muted-foreground">
                  Initializing authentication
                </div>
              </div>
            </div>
          </ClerkLoading>
          <ClerkFailed>
            <ClerkFailedFallback />
          </ClerkFailed>
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
