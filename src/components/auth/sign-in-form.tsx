"use client";

import * as Clerk from "@clerk/elements/common";
import * as SignIn from "@clerk/elements/sign-in";
import { Button } from "@/components/ui";
import { Checkbox } from "@/components/ui";
import { Input } from "@/components/ui";
import { Label } from "@/components/ui";
import { Separator } from "@/components/ui";
import { GitHubIcon } from "@/components/assets/github-icon";
import Link from "next/link";

export function SignInForm() {
  return (
    <SignIn.Root>
      <SignIn.Step name="start">
        {/* Sign-in form container */}
        <div className="m-auto w-full max-w-sm space-y-6">
          {/* Header */}
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-semibold">Sign in</h1>
            <p className="text-muted-foreground text-sm">
              The open source, enterprise-grade application for business purpose
              lending at scale.
            </p>
          </div>

          {/* Social sign-in buttons */}
          <div className="space-y-2">
            {/* Google sign-in button */}
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
                <span>Sign in with Google</span>
              </Button>
            </Clerk.Connection>

            {/* GitHub sign-in button */}
            <Clerk.Connection name="github" asChild>
              <Button
                variant="outline"
                className="text-foreground w-full bg-transparent"
              >
                <GitHubIcon size={16} />
                <span>Sign in with GitHub</span>
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

          {/* Email and password inputs */}
          <div className="space-y-4">
            <Clerk.Field name="identifier">
              <Clerk.Input asChild>
                <Input placeholder="Email" />
              </Clerk.Input>
              <Clerk.FieldError className="text-sm text-destructive mt-1" />
            </Clerk.Field>

            <Clerk.Field name="password">
              <Clerk.Input asChild>
                <Input type="password" placeholder="Password" />
              </Clerk.Input>
              <Clerk.FieldError className="text-sm text-destructive mt-1" />
            </Clerk.Field>

            {/* Keep signed in and forgot password */}
            <div className="flex justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="keep-signed-in" />
                <Label htmlFor="keep-signed-in">Keep me signed in</Label>
              </div>
              <SignIn.Action navigate="forgot-password" asChild>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground text-sm underline"
                >
                  Forgot password?
                </Link>
              </SignIn.Action>
            </div>
          </div>

          {/* Sign-in button */}
          <SignIn.Action submit asChild>
            <Button className="w-full">Sign in</Button>
          </SignIn.Action>

          {/* Sign-up link */}
          <p className="text-muted-foreground text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link className="text-foreground underline" href="/sign-up">
              Sign up
            </Link>
          </p>
        </div>
      </SignIn.Step>

      {/* Verification step for email codes, SMS, etc. */}
      <SignIn.Step name="verifications">
        <div className="m-auto w-full max-w-sm space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Verify your identity</h1>
            <p className="text-muted-foreground text-sm">
              We sent a verification code to <SignIn.SafeIdentifier />.
            </p>
          </div>

          <SignIn.Strategy name="email_code">
            <Clerk.Field name="code">
              <Clerk.Input asChild>
                <Input placeholder="Email verification code" />
              </Clerk.Input>
              <Clerk.FieldError className="text-sm text-destructive mt-1" />
            </Clerk.Field>
            <SignIn.Action submit asChild>
              <Button className="w-full">Verify</Button>
            </SignIn.Action>
          </SignIn.Strategy>

          <SignIn.Strategy name="password">
            <Clerk.Field name="password">
              <Clerk.Input asChild>
                <Input type="password" placeholder="Password" />
              </Clerk.Input>
              <Clerk.FieldError className="text-sm text-destructive mt-1" />
            </Clerk.Field>
            <SignIn.Action submit asChild>
              <Button className="w-full">Sign in</Button>
            </SignIn.Action>
          </SignIn.Strategy>

          <SignIn.Action navigate="previous" asChild>
            <Button variant="ghost" className="w-full">
              Use another method
            </Button>
          </SignIn.Action>
        </div>
      </SignIn.Step>

      {/* Forgot password step */}
      <SignIn.Step name="forgot-password">
        <div className="m-auto w-full max-w-sm space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Reset your password</h1>
            <p className="text-muted-foreground text-sm">
              Enter your email to receive a password reset link.
            </p>
          </div>

          <Clerk.Field name="identifier">
            <Clerk.Input asChild>
              <Input placeholder="Email" />
            </Clerk.Input>
            <Clerk.FieldError className="text-sm text-destructive mt-1" />
          </Clerk.Field>

          <SignIn.Action submit asChild>
            <Button className="w-full">Send reset link</Button>
          </SignIn.Action>

          <SignIn.Action navigate="start" asChild>
            <Button variant="ghost" className="w-full">
              Back to sign in
            </Button>
          </SignIn.Action>
        </div>
      </SignIn.Step>

      {/* Reset password step */}
      <SignIn.Step name="reset-password">
        <div className="m-auto w-full max-w-sm space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Set new password</h1>
            <p className="text-muted-foreground text-sm">
              Enter your new password below.
            </p>
          </div>

          <div className="space-y-4">
            <Clerk.Field name="password">
              <Clerk.Input asChild>
                <Input type="password" placeholder="New password" />
              </Clerk.Input>
              <Clerk.FieldError className="text-sm text-destructive mt-1" />
            </Clerk.Field>

            <Clerk.Field name="confirmPassword">
              <Clerk.Input asChild>
                <Input type="password" placeholder="Confirm new password" />
              </Clerk.Input>
              <Clerk.FieldError className="text-sm text-destructive mt-1" />
            </Clerk.Field>
          </div>

          <SignIn.Action submit asChild>
            <Button className="w-full">Set new password</Button>
          </SignIn.Action>
        </div>
      </SignIn.Step>
    </SignIn.Root>
  );
}
