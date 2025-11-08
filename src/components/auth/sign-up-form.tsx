"use client";

import * as Clerk from "@clerk/elements/common";
import * as SignUp from "@clerk/elements/sign-up";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import { Separator } from "@/components/ui";
import { GitHubIcon } from "@/components/assets/github-icon";
import Link from "next/link";

export function SignUpForm() {
  return (
    <SignUp.Root>
      <SignUp.Step name="start">
        {/* Sign-up form container */}
        <div className="m-auto w-full max-w-sm space-y-6">
          {/* Header */}
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-semibold">Create your account</h1>
            <p className="text-muted-foreground text-sm">
              Join the platform for business purpose lending at scale.
            </p>
          </div>

          {/* Social sign-up buttons */}
          <div className="space-y-2">
            {/* Google sign-up button */}
            <Clerk.Connection name="google" asChild>
              <Button variant="outline" className="w-full bg-transparent">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clipPath="url(#clip0_772_376)">
                    <path
                      d="M8 6.54543V9.64361H12.3054C12.1164 10.64 11.549 11.4836 10.6981 12.0509L13.2945 14.0655C14.8072 12.6692 15.68 10.6182 15.68 8.18187C15.68 7.61461 15.6291 7.0691 15.5345 6.54551L8 6.54543Z"
                      fill="#4285F4"
                    />
                    <path
                      d="M3.51625 9.52267L2.93067 9.97093L0.85791 11.5854C2.17427 14.1963 4.87225 16 7.9995 16C10.1594 16 11.9703 15.2873 13.294 14.0655L10.6976 12.0509C9.98492 12.5309 9.07582 12.8218 7.9995 12.8218C5.91951 12.8218 4.15229 11.4182 3.51952 9.52729L3.51625 9.52267Z"
                      fill="#34A853"
                    />
                    <path
                      d="M0.858119 4.41455C0.312695 5.49087 0 6.70543 0 7.99996C0 9.29448 0.312695 10.509 0.858119 11.5854C0.858119 11.5926 3.51998 9.51991 3.51998 9.51991C3.35998 9.03991 3.26541 8.53085 3.26541 7.99987C3.26541 7.46889 3.35998 6.95984 3.51998 6.47984L0.858119 4.41455Z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M7.99966 3.18545C9.17786 3.18545 10.2251 3.59271 11.0615 4.37818L13.3524 2.0873C11.9633 0.792777 10.1597 0 7.99966 0C4.87242 0 2.17427 1.79636 0.85791 4.41455L3.51969 6.48001C4.15238 4.58908 5.91968 3.18545 7.99966 3.18545Z"
                      fill="#EA4335"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_772_376">
                      <rect width="16" height="16" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
                <span>Sign up with Google</span>
              </Button>
            </Clerk.Connection>

            {/* GitHub sign-up button */}
            <Clerk.Connection name="github" asChild>
              <Button
                variant="outline"
                className="text-foreground w-full bg-transparent"
              >
                <GitHubIcon size={16} />
                <span>Sign up with GitHub</span>
              </Button>
            </Clerk.Connection>
          </div>

          {/* Separator */}
          <div className="relative w-full">
            <div className="bg-background text-muted-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform px-2 text-xs uppercase">
              Or
            </div>
            <Separator />
          </div>

          {/* Form fields */}
          <div className="space-y-4">
            {/* First Name and Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <Clerk.Field name="firstName">
                <Clerk.Input asChild>
                  <Input placeholder="First name" />
                </Clerk.Input>
                <Clerk.FieldError className="text-sm text-destructive mt-1" />
              </Clerk.Field>

              <Clerk.Field name="lastName">
                <Clerk.Input asChild>
                  <Input placeholder="Last name" />
                </Clerk.Input>
                <Clerk.FieldError className="text-sm text-destructive mt-1" />
              </Clerk.Field>
            </div>

            {/* Email */}
            <Clerk.Field name="emailAddress">
              <Clerk.Input asChild>
                <Input placeholder="Email" />
              </Clerk.Input>
              <Clerk.FieldError className="text-sm text-destructive mt-1" />
            </Clerk.Field>

            {/* Password */}
            <Clerk.Field name="password">
              <Clerk.Input asChild>
                <Input type="password" placeholder="Password" />
              </Clerk.Input>
              <Clerk.FieldError className="text-sm text-destructive mt-1" />
            </Clerk.Field>
          </div>

          {/* CAPTCHA */}
          <Clerk.Field name="captcha">
            <div id="clerk-captcha" />
            <Clerk.FieldError className="text-sm text-destructive mt-1" />
          </Clerk.Field>

          {/* Sign-up button */}
          <SignUp.Action submit asChild>
            <Button className="w-full">Create account</Button>
          </SignUp.Action>

          {/* Sign-in link */}
          <p className="text-muted-foreground text-center text-sm">
            Already have an account?{" "}
            <Link className="text-foreground underline" href="/sign-in">
              Sign in
            </Link>
          </p>
        </div>
      </SignUp.Step>

      {/* Verification step for email */}
      <SignUp.Step name="verifications">
        <div className="m-auto w-full max-w-sm space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Verify your account</h1>
            <p className="text-muted-foreground text-sm">
              We sent a verification code to your email.
            </p>
          </div>

          {/* Email verification */}
          <SignUp.Strategy name="email_code">
            <Clerk.Field name="code">
              <Clerk.Input asChild>
                <Input placeholder="Email verification code" />
              </Clerk.Input>
              <Clerk.FieldError className="text-sm text-destructive mt-1" />
            </Clerk.Field>
            <SignUp.Action submit asChild>
              <Button className="w-full">Verify email</Button>
            </SignUp.Action>
          </SignUp.Strategy>

          {/* Alternative verification options */}
          <div className="space-y-2">
            <SignUp.Action navigate="previous" asChild>
              <Button variant="ghost" className="w-full">
                Use another method
              </Button>
            </SignUp.Action>
          </div>
        </div>
      </SignUp.Step>
    </SignUp.Root>
  );
}
