"use client";

import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";
import { ThemeDropdown } from "@/components/theme/theme-dropdown";

interface SignUpLayoutProps {
  children: ReactNode;
}

export function SignUpLayout({ children }: SignUpLayoutProps) {
  return (
    <div className="bg-background min-h-screen relative">
      {/* Logo and theme toggle grouped in top-left */}
      <div className="absolute top-4 left-4 z-50 flex items-center gap-3">
        <a
          href="/dashboard"
          aria-label="Go to dashboard"
          className="flex items-center gap-2 font-medium"
        >
          <div className="flex h-8 w-8 items-center justify-center">
            <Image
              src="/assets/logos/brrrr-icon-sq-gradient-black-2.svg"
              alt="Brrrr Loans Logo Light Mode"
              width={32}
              height={32}
              className="block dark:hidden"
            />
            <Image
              src="/assets/logos/brrrr-icon-sq-gradient-white-2.svg"
              alt="Brrrr Loans Logo Dark Mode"
              width={32}
              height={32}
              className="hidden dark:block"
            />
          </div>
        </a>
        <ThemeDropdown />
      </div>

      {/* Main content area with right column positioned */}
      <div className="md:pr-[498px]">
        {/* Left side: Sign-up form */}
        <div className="relative items-center justify-center px-6 py-24 md:flex min-h-screen">
          {/* Sign-up form container */}
          <div className="m-auto w-full max-w-sm">{children}</div>

          {/* Footer with Copyright and Links */}
          <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-2 text-xs text-muted-foreground">
            <p>Copyright © 2025 Brrrr Loans 1 LLC</p>
            <div className="flex gap-4">
              <Link
                href="https://www.brrrr.com/terms-of-use"
                className="hover:text-foreground underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Terms of Use
              </Link>
              <Link
                href="https://www.brrrr.com/privacy-policy"
                className="hover:text-foreground underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Sticky positioned column - matches Moov.io exactly */}
      <aside className="hidden md:block fixed top-0 right-0 w-[498px] h-screen bg-background">
        <div className="h-full p-6 flex items-center justify-center relative">
          <Image
            src="/assets/brand-gradient.svg"
            alt="Brand Gradient"
            width="450"
            height="245"
            className="rounded-lg object-cover w-full h-full"
          />
          {/* BRRRR Logo and tagline positioned on top of gradient */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Image
              src="/assets/logos/brrrr-mark-white.svg"
              alt="BRRRR Logo"
              width="324"
              height="56"
              className="max-w-[72%]"
            />
            <p
              className="text-center mt-6"
              style={{
                color: "#FFF",
                fontFamily: "Inter",
                fontSize: "14px",
                fontStyle: "normal",
                fontWeight: 400,
                lineHeight: "normal",
              }}
            >
              Empowering Intelligent Investors
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
