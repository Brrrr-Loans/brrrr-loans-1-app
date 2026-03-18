"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";

export type InvitationRow = {
  id: string;
  emailAddress: string;
  role: string;
  status: string;
  createdAt: string;
  url: string | null;
};

export async function getOrgInvitations(): Promise<InvitationRow[]> {
  const { orgId } = await auth();
  if (!orgId) throw new Error("No active organization");

  const client = await clerkClient();
  const invitations =
    await client.organizations.getOrganizationInvitationList({
      organizationId: orgId,
      limit: 100,
    });

  const signUpUrl =
    process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || "/sign-up";
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

  return invitations.data.map((inv) => ({
    id: inv.id,
    emailAddress: inv.emailAddress,
    role: inv.role,
    status: inv.status ?? "pending",
    createdAt: inv.createdAt
      ? new Date(inv.createdAt).toISOString()
      : new Date().toISOString(),
    url: `${baseUrl}${signUpUrl}?__clerk_ticket=${inv.id}`,
  }));
}

export async function revokeInvitation(invitationId: string): Promise<void> {
  const { orgId } = await auth();
  if (!orgId) throw new Error("No active organization");

  const client = await clerkClient();
  await client.organizations.revokeOrganizationInvitation({
    organizationId: orgId,
    invitationId,
    requestingUserId: (await auth()).userId!,
  });
}

export async function sendInvitation(input: {
  emailAddress: string;
  role: string;
}): Promise<InvitationRow> {
  const { orgId } = await auth();
  if (!orgId) throw new Error("No active organization");

  const client = await clerkClient();
  const inv = await client.organizations.createOrganizationInvitation({
    organizationId: orgId,
    emailAddress: input.emailAddress,
    role: input.role,
    inviterUserId: (await auth()).userId!,
  });

  const invSignUpUrl =
    process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || "/sign-up";
  const invBaseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

  return {
    id: inv.id,
    emailAddress: inv.emailAddress,
    role: inv.role,
    status: inv.status ?? "pending",
    createdAt: inv.createdAt
      ? new Date(inv.createdAt).toISOString()
      : new Date().toISOString(),
    url: `${invBaseUrl}${invSignUpUrl}?__clerk_ticket=${inv.id}`,
  };
}
