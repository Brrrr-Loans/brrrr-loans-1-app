import { SignUpLayout } from "@/components/auth/sign-up-layout";
import { SignUpForm } from "@/components/auth/sign-up-form";

// Next.js 15+ requires params to be typed as Promise for catch-all routes
// We don't use the params but need to acknowledge them to avoid dev tools warnings
export default async function SignUpPage({
  params: _params,
}: {
  params: Promise<{ "sign-up"?: string[] }>;
}) {
  // Await params to satisfy Next.js 15+ requirements (even if unused)
  await _params;
  
  return (
    <SignUpLayout>
      <SignUpForm />
    </SignUpLayout>
  );
}
