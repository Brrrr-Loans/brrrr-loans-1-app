import { SignInForm } from "@/components/auth/sign-in-form";
import { SignInLayout } from "@/components/auth/sign-in-layout";

// Next.js 15+ requires params to be typed as Promise for catch-all routes
// We don't use the params but need to acknowledge them to avoid dev tools warnings
export default async function SignInPage({
  params: _params,
}: {
  params: Promise<{ "sign-in"?: string[] }>;
}) {
  // Await params to satisfy Next.js 15+ requirements (even if unused)
  await _params;

  return (
    <SignInLayout>
      <SignInForm />
    </SignInLayout>
  );
}
