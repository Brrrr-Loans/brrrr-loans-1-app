import type { ReactNode } from "react";
import type { Metadata } from "next";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "@/components/ui/feedback/sonner";
import "./globals.css";
import { Inter } from "next/font/google";
import { RootLayoutClient } from "@/components/layout/root-layout-client";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BL1 OS",
  description: "BL1 Loan Origination System",
  icons: {
    icon: "/favicon.ico",
    apple: "/logos/brrrr-icon-sq-black-192.png",
  },
};

function Header() {
  return (
    <header
      style={{ display: "flex", justifyContent: "space-between", padding: 20 }}
    >
      <h1>Sign In</h1>
      <SignedIn>
        <UserButton />
      </SignedIn>
      <SignedOut>
        <SignInButton />
      </SignedOut>
    </header>
  );
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className} suppressHydrationWarning>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <RootLayoutClient>{children}</RootLayoutClient>
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
