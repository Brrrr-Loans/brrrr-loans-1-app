import type { ReactNode } from "react";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { SonnerToaster as Toaster } from "@/components/ui";
import { ThemeFavicon } from "@/components/layout/theme-favicon";
import { LyteNyteLicenseActivator } from "@/components/lytenyte-license-activator";
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
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
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
