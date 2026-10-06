# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development (runs Basehub CMS + Next.js with Turbopack concurrently)
npm run dev

# Build (generates Basehub content types, then Next.js build)
npm run build

# Type checking
npm run typecheck

# Linting
npm run lint

# E2E tests (installs Playwright deps on first run)
npm run test:e2e
```

To run a single Playwright test file:
```bash
npx playwright test e2e/sidebar/sidebar.spec.ts
```

Before running any commands, copy `.env.template` to `.env.local` and fill in the required values (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`). The app throws at startup if these are missing. See `.env.template` for the full list of optional feature-specific keys (Brex, Google, Builder, etc.).

## Architecture

### What This Is

An open source, multi-tenant, enterprise-grade, agent-native application for investment fund management ("BRRRRLOANS 1 LLC"). Investors log in to view their portfolio—contributions, distributions, documents, and ROI analytics. Admins can manage transactions, deals, and impersonate users for support.

### Auth Stack: Clerk + Supabase

Clerk handles identity; Supabase enforces data access via Row-Level Security. The integration works through Clerk JWTs:

- **Client-side**: `useSupabase()` hook (`src/hooks/use-supabase.ts`) returns `SupabaseClient<Database> | null` — null while the Clerk session is loading. Always null-check before use. `useSupabaseWithRefresh()` from the same file also exposes a `refreshToken()` method for force-refreshing the JWT before critical operations.
- **Server-side (trusted)**: `createServiceRoleClient()` (`src/lib/supabase-server.ts`) bypasses RLS. Use in API routes for admin operations.
- **Server-side (user-scoped)**: `getSupabaseClient()` from the same file respects RLS. It calls `auth()` internally, but `auth()` does not throw on missing sessions — it returns `{ userId: null }`, and the resulting client silently passes a null JWT, causing RLS to deny all queries without an error. Every API route uses this canonical guard:
  ```typescript
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  ```
  `auth()` also returns `orgId`, `orgSlug`, and `has({ role })` from the active Clerk session — prefer these over re-deriving org context from query params when the route only acts on the caller's currently-active org.

All API routes validate the caller with `auth()` from `@clerk/nextjs/server` before doing anything.

### Multi-Tenancy: Organization Context

A React context (`src/contexts/organization-context.tsx`) tracks which org the user is viewing:

- `clerkOrgId = null` → show the user's personal investments
- `clerkOrgId = "org_xxx"` → show only that org's data
- Impersonation active → bypass org filter, show all data for the impersonated user

API routes receive this as query params: `?clerk_org_id={id}&impersonate_user_id={id}`. Most API routes use `createServiceRoleClient()` which bypasses RLS entirely, so **org-level isolation is enforced solely by application code** — not by the database. API routes that accept a `clerk_org_id` must verify the caller is a member of that org before filtering by it. Use the existing `getUserInvestmentOrgs(authClerkUsersId)` helper in `src/lib/auth-helpers.ts`, which returns the numeric DB org IDs the caller belongs to as `admin` or `member` (excludes `viewer`).

### Permission Model (3 Dimensions)

1. **System role**: `admin`, `account_executive`, `balance_sheet_investor`, `loan_processor`, `loan_opener` — stored in `auth_clerk_users.role`
2. **Internal flag**: `is_internal_yn` — true for Brrrr Loans employees. Admin actions (impersonation, platform settings) require `role = 'admin' AND is_internal_yn = true`
3. **Org role**: `admin`, `member` (has investment stake), `viewer` (employee, no stake) — in `auth_clerk_orgs_members`

See `src/lib/auth-permissions.ts` and `src/hooks/use-user-permissions.ts`.

### Database Schema (Key Tables)

- `auth_clerk_users` / `auth_clerk_orgs` / `auth_clerk_orgs_members` — identity mirrored from Clerk
- `bsi_transactions` — the investment ledger. `ledger_entry_type` enum: `contribution`, `redemption`, `interest`, `fee`, `distribution`, `return`
- `bsi_transactions_investors` — junction table linking a transaction to either a `clerk_user_id` OR `clerk_org_id` (never both)
- `deal` / `bsi_deals_clerk_users` / `bsi_deals_clerk_orgs` — deal associations per user/org

**Calculation logic** (important—non-obvious from column names):
- `transaction_amount` is stored as a **signed** value — positive for contributions, negative for distributions (mirrors the Brex transfer direction). Direction is also encoded in `ledger_entry_type`, so always use `ABS()` when summing.
- Total Invested = `SUM(ABS(amount))` where `ledger_entry_type = 'contribution'`
- Total Distributions = `SUM(ABS(amount))` where `ledger_entry_type = 'distribution'`
- ROI = `(Total Distributions / Total Invested) × 100` (excludes principal repayment). Return `null` (or `0`) when `Total Invested = 0` to avoid division-by-zero.

### Navigation & Routing

Route groups:
- `(portal)/` — authenticated app with sidebar layout
- `(docs)/` — documentation pages outside the sidebar
- `api/` — backend API routes
- `sign-in/`, `sign-up/` — Clerk-hosted auth flows

The sidebar and breadcrumbs are driven by `src/config/navigation.ts`. When adding new routes, register them there.

### File Storage

Three Supabase Storage buckets: `assets_public`, `investors`, `document_upload`. Files are isolated by path: `users/{clerk_user_id}/` or `orgs/{clerk_org_id}/`. RLS policies enforce path-based access. The `useSupabaseUpload()` hook handles client-side uploads.

### Animations

Use `motion/react` (not `framer-motion`). Apply `willChange` only on elements that animate continuously (e.g., virtualized rows, sticky headers during scroll) — not as a blanket rule, since it forces GPU layer promotion even when the element is idle. When animating Radix UI components, use `asChild` to compose.

### RLS Policies

When writing new Supabase RLS policies:

- Use `(select auth.uid())` instead of bare `auth.uid()` — wrapping in a subselect enables Postgres statement-level caching instead of per-row evaluation
- Index every column referenced in `USING` / `WITH CHECK` clauses; missing indexes cause full table scans on every filtered query
- One `CREATE POLICY` per operation — never combine multiple ops (e.g. `FOR INSERT, DELETE`) in one statement
- Correct clause pairing per operation: SELECT → `USING` only; INSERT → `WITH CHECK` only; UPDATE → both; DELETE → `USING` only
- Always specify `TO authenticated` or `TO anon` to prevent policies evaluating for ineligible roles
- Reuse existing DB helpers: `is_admin()`, `user_has_transaction_access(bigint)`

### Background Jobs

Inngest handles background workflows. See `src/app/api/user-workflows/` for job definitions.

### CMS

Basehub provides content types—run `basehub` (or `npm run build`) to regenerate types before using any Basehub queries in `src/lib/basehub/`.
