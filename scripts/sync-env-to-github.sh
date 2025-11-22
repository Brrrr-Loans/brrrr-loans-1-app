#!/bin/bash

# Your GitHub repo name here (e.g., user/repo or org/repo)
REPO="Brrrr-Loans/brrrr-loans-1-app"

echo "🔐 Syncing env vars from .env.local to GitHub repo secrets..."

set -a
source .env.local
set +a

gh secret set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY -b"$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" -R $REPO
gh secret set NEXT_PUBLIC_SUPABASE_URL -b"$NEXT_PUBLIC_SUPABASE_URL" -R $REPO
gh secret set NEXT_PUBLIC_SUPABASE_ANON_KEY -b"$NEXT_PUBLIC_SUPABASE_ANON_KEY" -R $REPO
gh secret set CLERK_SECRET_KEY -b"$CLERK_SECRET_KEY" -R $REPO
gh secret set SUPABASE_SERVICE_ROLE_KEY -b"$SUPABASE_SERVICE_ROLE_KEY" -R $REPO

echo "✅ GitHub secrets synced for $REPO"