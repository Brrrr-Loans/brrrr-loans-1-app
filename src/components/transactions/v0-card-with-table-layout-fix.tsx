// Fixed layout.tsx for v0-card-with-table project
// This addresses the "Font loaders must be called and assigned to a const in the module scope" error

import type { Metadata } from "next";
import {
  Geist as V0_Font_Geist,
  Geist_Mono as V0_Font_Geist_Mono,
  Source_Serif_4 as V0_Font_Source_Serif_4,
} from "next/font/google";
import "./globals.css";

// Initialize fonts - FIXED: Assigned to constants at module scope
const geistFont = V0_Font_Geist({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-geist",
});

const geistMonoFont = V0_Font_Geist_Mono({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

const sourceSerifFont = V0_Font_Source_Serif_4({
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-source-serif",
});

export const metadata: Metadata = {
  title: "Card with Table",
  description: "A card component with an integrated table",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistFont.variable} ${geistMonoFont.variable} ${sourceSerifFont.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}


