"use client";

import { useSignUp } from "@clerk/nextjs";
import { useState } from "react";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import { Separator } from "@/components/ui";
import { GitHubIcon } from "@/components/assets/github-icon";
import Link from "next/link";

type SignUpStep = "start" | "verifications";

export function SignUpForm() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [step, setStep] = useState<SignUpStep>("start");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isLoaded) {
    return (
      <div className="m-auto w-full max-w-sm space-y-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  const handleOAuthSignUp = async (provider: "oauth_google" | "oauth_github") => {
    try {
      setError("");
      await signUp?.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard",
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "OAuth sign up failed";
      setError(message);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUp) return;

    setIsLoading(true);
    setError("");

    try {
      await signUp.create({
        firstName,
        lastName,
        emailAddress: email,
        password,
      });

      // Send email verification code
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setStep("verifications");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Sign up failed";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUp) return;

    setIsLoading(true);
    setError("");

    try {
      const result = await signUp.attemptEmailAddressVerification({ code });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        window.location.href = "/dashboard";
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Verification failed";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Start step - main sign up form
  if (step === "start") {
    return (
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
          <Button
            variant="outline"
            className="w-full bg-transparent"
            onClick={() => handleOAuthSignUp("oauth_google")}
            type="button"
          >
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

          {/* GitHub sign-up button */}
          <Button
            variant="outline"
            className="text-foreground w-full bg-transparent"
            onClick={() => handleOAuthSignUp("oauth_github")}
            type="button"
          >
            <GitHubIcon size={16} />
            <span>Sign up with GitHub</span>
          </Button>
        </div>

        {/* Separator */}
        <div className="relative w-full">
          <div className="bg-background text-muted-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform px-2 text-xs uppercase">
            Or
          </div>
          <Separator />
        </div>

        {/* Form fields */}
        <form onSubmit={handleEmailSignUp} className="space-y-4">
          {/* First Name and Last Name */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <Input
              placeholder="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>

          {/* Email */}
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Password */}
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {/* Sign-up button */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create account"}
          </Button>
        </form>

        {/* Sign-in link */}
        <p className="text-muted-foreground text-center text-sm">
          Already have an account?{" "}
          <Link className="text-foreground underline" href="/sign-in">
            Sign in
          </Link>
        </p>
      </div>
    );
  }

  // Verification step
  if (step === "verifications") {
    return (
      <div className="m-auto w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Verify your account</h1>
          <p className="text-muted-foreground text-sm">
            We sent a verification code to {email}.
          </p>
        </div>

        <form onSubmit={handleVerifyEmail} className="space-y-4">
          <Input
            placeholder="Email verification code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Verifying..." : "Verify email"}
          </Button>
        </form>

        <Button
          variant="ghost"
          className="w-full"
          onClick={() => setStep("start")}
          type="button"
        >
          Use another method
        </Button>
      </div>
    );
  }

  return null;
}
