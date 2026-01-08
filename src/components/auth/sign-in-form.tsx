"use client";

import { useSignIn } from "@clerk/nextjs";
import { useState } from "react";
import { Button } from "@/components/ui";
import { Checkbox } from "@/components/ui";
import { Input } from "@/components/ui";
import { Label } from "@/components/ui";
import { Separator } from "@/components/ui";
import { GitHubIcon } from "@/components/assets/github-icon";
import Link from "next/link";

type SignInStep = "start" | "verifications" | "forgot-password" | "reset-password";

export function SignInForm() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [step, setStep] = useState<SignInStep>("start");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

  const handleOAuthSignIn = async (provider: "oauth_google" | "oauth_github") => {
    try {
      setError("");
      await signIn?.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard",
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "OAuth sign in failed";
      setError(message);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signIn) return;

    setIsLoading(true);
    setError("");

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        window.location.href = "/dashboard";
      } else if (result.status === "needs_first_factor") {
        // Need to verify with a code
        setStep("verifications");
      } else if (result.status === "needs_second_factor") {
        setStep("verifications");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Sign in failed";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signIn) return;

    setIsLoading(true);
    setError("");

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "email_code",
        code,
      });

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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signIn) return;

    setIsLoading(true);
    setError("");

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      setStep("reset-password");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send reset email";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signIn) return;

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password: newPassword,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        window.location.href = "/dashboard";
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Password reset failed";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Start step - main sign in form
  if (step === "start") {
    return (
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
          <Button
            variant="outline"
            className="w-full bg-transparent"
            onClick={() => handleOAuthSignIn("oauth_google")}
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
            <span>Sign in with Google</span>
          </Button>

          {/* GitHub sign-in button */}
          <Button
            variant="outline"
            className="text-foreground w-full bg-transparent"
            onClick={() => handleOAuthSignIn("oauth_github")}
            type="button"
          >
            <GitHubIcon size={16} />
            <span>Sign in with GitHub</span>
          </Button>
        </div>

        {/* Separator */}
        <div className="relative w-full">
          <div className="bg-background text-muted-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform px-2 text-xs uppercase">
            Or
          </div>
          <Separator />
        </div>

        {/* Email and password form */}
        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <div className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {/* Keep signed in and forgot password */}
            <div className="flex justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="keep-signed-in" />
                <Label htmlFor="keep-signed-in">Keep me signed in</Label>
              </div>
              <button
                type="button"
                onClick={() => setStep("forgot-password")}
                className="text-muted-foreground hover:text-foreground text-sm underline"
              >
                Forgot password?
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {/* Sign-in button */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        {/* Sign-up link */}
        <p className="text-muted-foreground text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link className="text-foreground underline" href="/sign-up">
            Sign up
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
          <h1 className="text-3xl font-bold">Verify your identity</h1>
          <p className="text-muted-foreground text-sm">
            We sent a verification code to {email}.
          </p>
        </div>

        <form onSubmit={handleVerifyCode} className="space-y-4">
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
            {isLoading ? "Verifying..." : "Verify"}
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

  // Forgot password step
  if (step === "forgot-password") {
    return (
      <div className="m-auto w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Reset your password</h1>
          <p className="text-muted-foreground text-sm">
            Enter your email to receive a password reset code.
          </p>
        </div>

        <form onSubmit={handleForgotPassword} className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send reset code"}
          </Button>
        </form>

        <Button
          variant="ghost"
          className="w-full"
          onClick={() => setStep("start")}
          type="button"
        >
          Back to sign in
        </Button>
      </div>
    );
  }

  // Reset password step
  if (step === "reset-password") {
    return (
      <div className="m-auto w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Set new password</h1>
          <p className="text-muted-foreground text-sm">
            Enter the code from your email and your new password.
          </p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-4">
          <Input
            placeholder="Reset code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />

          <Input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <Input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Resetting..." : "Set new password"}
          </Button>
        </form>
      </div>
    );
  }

  return null;
}
