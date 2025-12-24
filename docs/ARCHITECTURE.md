# Brrrr Loans 1 - Lender Portal Architecture

> **Last Updated**: December 15, 2024  
> **Purpose**: Comprehensive documentation of the project's database schema, permissions model, security measures, and calculation logic.

---

## Table of Contents

1. [Database Schema](#1-database-schema)
2. [Permissions Model](#2-permissions-model)
3. [Security Architecture](#3-security-architecture)
4. [Calculation Logic](#4-calculation-logic)
5. [Data Flow Examples](#5-data-flow-examples)

---

## 1. Database Schema

### 1.1 Core Entity Relationships

```text
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│ auth_clerk_users│◄────►│auth_clerk_orgs_ │◄────►│  auth_clerk_orgs│
│                 │      │    members      │      │                 │
│ • id (PK)       │      │                 │      │ • id (PK)       │
│ • clerk_user_id │      │ • auth_clerk_   │      │ • clerk_org_id  │
│ • full_name     │      │   users_id (FK) │      │ • clerk_org_name│
│ • email         │      │ • clerk_org_id  │      │ • clerk_org_slug│
│ • role          │      │   (FK)          │      │                 │
└─────────────────┘      └─────────────────┘      └─────────────────┘
        │                                                  │
        │                                                  │
        ▼                                                  ▼
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│bsi_deals_clerk_ │      │bsi_transactions_│      │bsi_deals_clerk_ │
│     users       │      │   investors     │      │     orgs        │
│                 │      │                 │      │                 │
│ • clerk_user_id │      │ • clerk_user_id │      │ • clerk_org_id  │
│   (FK)          │      │   (FK)          │      │   (FK)          │
│ • deal_id (FK)  │      │ • clerk_org_id  │      │ • deal_id (FK)  │
│                 │      │   (FK)          │      │                 │
└─────────────────┘      │ • transaction_id│      └─────────────────┘
        │                │ • transaction_id│                │
        │                │   (FK)          │                │
        ▼                └─────────────────┘                ▼
┌─────────────────┐              │                ┌─────────────────┐
│      deal       │              │                │      deal       │
│                 │              ▼                │                 │
│ • id (PK)       │      ┌─────────────────┐      │ • id (PK)       │
│ • deal_name     │      │ bsi_transactions│      │ • deal_name     │
│ • deal_         │      │                 │      │                 │
│   disposition_1 │      │ • id (PK)       │      │                 │
│ • loan_amount_  │      │ • transaction_  │      │                 │
│   total         │      │   amount        │      │                 │
│                 │      │ • ledger_entry_ │      │                 │
└─────────────────┘      │   type          │      └─────────────────┘
                         │ • transaction_  │
                         │   status        │
                         └─────────────────┘
```

### 1.2 Key Tables

| Table                        | Purpose                           | Key Columns                                                           |
| ---------------------------- | --------------------------------- | --------------------------------------------------------------------- |
| `auth_clerk_users`           | Users synced from Clerk           | `id`, `clerk_user_id`, `full_name`, `email`, `role`, `is_internal_yn` |
| `auth_clerk_orgs`            | Organizations synced from Clerk   | `id`, `clerk_org_id`, `clerk_org_name`                                |
| `auth_clerk_orgs_members`    | User-to-org membership (junction) | `auth_clerk_users_id`, `clerk_org_id`, `clerk_org_role`               |
| `bsi_transactions`           | All financial transactions        | `id`, `transaction_amount`, `ledger_entry_type`, `transaction_status` |
| `bsi_transactions_investors` | Links transactions to users/orgs  | `clerk_user_id`, `clerk_org_id`, `transaction_id`                     |
| `bsi_deals_clerk_users`      | Links users to deals              | `clerk_user_id`, `deal_id`                                            |
| `bsi_deals_clerk_orgs`       | Links organizations to deals      | `clerk_org_id`, `deal_id`                                             |
| `deal`                       | Deal/loan information             | `id`, `deal_name`, `deal_disposition_1`, `loan_amount_total`          |

### 1.3 Junction Table Logic

**Transactions can be linked to investors via:**

- `clerk_user_id` - Direct link to an individual user
- `clerk_org_id` - Link to an organization (entity like LLC, Trust)

**One transaction investor record has:**

- Either `clerk_user_id` set (individual investor)
- OR `clerk_org_id` set (entity investor)
- NOT both

### 1.4 Ledger Entry Types

| Type           | Meaning                      | Amount Sign                                        |
| -------------- | ---------------------------- | -------------------------------------------------- |
| `contribution` | Money invested into the fund | Stored as negative (outflow from user perspective) |
| `distribution` | Money paid out to investor   | Stored as positive (inflow to user perspective)    |

---

## 2. Permissions Model

### 2.1 Role-Based Access Control (RBAC)

The system uses a **multi-layered RBAC model** with three key dimensions:

#### 2.1.1 System Roles (`auth_clerk_users.role`)

Internal system-level roles assigned to each user:

| Role                     | Description                     | Typical Capabilities                             |
| ------------------------ | ------------------------------- | ------------------------------------------------ |
| `admin`                  | Platform administrator          | Full access, impersonate users, manage settings  |
| `account_executive`      | Sales/relationship manager      | View assigned deals, manage client relationships |
| `balance_sheet_investor` | External investor (BSI)         | View only their own investments (direct + org)   |
| `loan_processor`         | Internal loan processing staff  | Process loans, update deal statuses              |
| `loan_opener`            | Internal loan origination staff | Create new deals, initial data entry             |

#### 2.1.2 Internal vs External Users (`auth_clerk_users.is_internal_yn`)

| Value   | Description                                                         |
| ------- | ------------------------------------------------------------------- |
| `true`  | Internal staff (employees) - broader platform access                |
| `false` | External users (investors, partners) - restricted to their own data |

#### 2.1.3 Organization-Specific Roles (`auth_clerk_orgs_members.clerk_org_role`)

When a user is a member of an organization, they have an org-specific role:

| Org Role | Description                                      | Has Investment Interest? |
| -------- | ------------------------------------------------ | ------------------------ |
| `admin`  | Full control over organization data and settings | ✅ Yes                   |
| `member` | Standard access to organization's investments    | ✅ Yes                   |
| `viewer` | Employee/observer with no financial stake        | ❌ No                    |

**Critical Business Rule:** When determining which organizations' investment data to show a user:

- `admin` and `member` roles → Include org's transactions/deals (user has investment interest)
- `viewer` role → **EXCLUDE** org's transactions/deals (user is an employee/observer only)

> **Example:** Varazdat is an `admin` of VT Funder LLC (his investment entity) but a `viewer` of Brrrr Funder LLC (his employer). He should see VT Funder's investments but NOT Brrrr Funder's investments.

### 2.2 Key Tables for RBAC

```text
┌─────────────────────────────────────────────────────────────────┐
│                    auth_clerk_users                              │
├─────────────────────────────────────────────────────────────────┤
│  id              │ Primary key                                   │
│  clerk_user_id   │ Clerk's external user ID                      │
│  role            │ System role (admin, balance_sheet_investor..) │
│  is_internal_yn  │ true = internal staff, false = external user  │
│  full_name       │ Display name                                  │
│  email           │ User email                                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ (user can belong to many orgs)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                 auth_clerk_orgs_members                          │
├─────────────────────────────────────────────────────────────────┤
│  auth_clerk_users_id │ FK to auth_clerk_users                    │
│  clerk_org_id        │ FK to auth_clerk_orgs                     │
│  clerk_org_role      │ Org-specific role (admin, member, viewer) │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 Organization Context (Team Switcher)

The **sidebar team-switcher** (org switcher) acts as a **data isolation layer**. The logged-in user only sees and interacts with data specific to the currently selected organization.

```typescript
// From src/contexts/organization-context.tsx
{
  clerkOrgId: string | null,  // Clerk's org ID (e.g., "org_xxx")
  orgName: string | null,
  isLoaded: boolean,
}
```

**Key Behaviors:**

- **Org selected in sidebar** → User sees ONLY that org's investments, distributions, and deals
- **No org selected (personal context)** → User sees ONLY their direct personal investments (where `clerk_org_id IS NULL`)
- **Admin impersonating** → Bypasses org filter, shows ALL data for impersonated user across all their orgs

**Use Case Example:**

> A user belongs to both "VT Funder LLC" and "Brrrr Funder LLC". When they select "VT Funder LLC" in the team-switcher, they only see VT Funder's transactions. To see Brrrr Funder's data, they must switch to that organization.

### 2.4 Data Visibility Decision Tree

**_(To be documented)_**

### 2.5 Impersonation System

```typescript
// From src/contexts/impersonation-context.tsx
{
  impersonatedUserId: string | null,  // Database ID of impersonated user
  isImpersonating: boolean,
  setImpersonatedUser: (userId: string | null) => void,
}
```

**Access Control:**

- **Only users meeting BOTH conditions can impersonate:**
  - `auth_clerk_users.role = 'admin'`
  - `auth_clerk_users.is_internal_yn = true`
- Impersonation is per-session (not persisted)
- When impersonating, admin sees ALL data the impersonated user has access to
- Impersonation bypasses the organization filter (shows combined view across all user's orgs)

---

## 3. Security Architecture

### 3.1 Authentication Flow

```text
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Browser   │────►│    Clerk    │────►│  Next.js    │────►│  Supabase   │
│             │     │ (Auth)      │     │  API Route  │     │  (Database) │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                          │                    │
                          │                    │
                    JWT Token            Service Role
                    (supabase            Client (bypasses
                     template)           RLS for API routes)
```

### 3.2 Client-Side Security

| Component            | Security Measure                                       |
| -------------------- | ------------------------------------------------------ |
| Clerk Authentication | Native Supabase third-party auth integration           |
| Supabase Client      | accessToken() callback for automatic token management  |
| Session Storage      | Disabled (`storage: null`) - Clerk manages sessions    |
| Organization Context | Reads from Clerk's `useOrganization()` hook            |

```typescript
// From src/hooks/use-supabase.ts
supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
    storage: null, // Clerk handles sessions
  },
  global: {
    fetch: async (url, options) => {
      const clerkToken = await session?.getToken({ template: "supabase" });
      headers.set("Authorization", `Bearer ${clerkToken}`);
      return fetch(url, { ...options, headers });
    },
  },
});
```

### 3.3 Server-Side Security

| Component         | Security Measure                                        |
| ----------------- | ------------------------------------------------------- |
| API Routes        | Use `createServiceRoleClient()` - bypasses RLS          |
| Auth Verification | `auth()` from `@clerk/nextjs/server` validates requests |
| Admin Check       | Verify `role = 'admin'` before allowing impersonation   |
| Input Validation  | Validate query params before database queries           |

```typescript
// Example from API route
const { userId: clerkUserId } = await auth();
if (!clerkUserId) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

// For impersonation - verify admin role
const { data: adminUser } = await supabase
  .from("auth_clerk_users")
  .select("id, role")
  .eq("clerk_user_id", clerkUserId)
  .single();

if (!adminUser || adminUser.role !== "admin") {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
```

### 3.4 Row-Level Security (RLS)

RLS policies are enabled on all tables but **API routes use service role client** which bypasses RLS. The filtering logic is implemented in application code.

**Key RLS Functions:**

- `is_admin()` - Checks if current JWT belongs to admin user
- `user_has_transaction_access(bigint)` - Validates transaction access

### 3.5 Security Functions

All security-critical functions have:

- `SET search_path = ''` to prevent search path attacks
- Schema-qualified references (`public.table_name`)
- Proper error handling

### 3.6 Storage Security (Supabase Storage)

#### 3.6.1 Bucket Architecture

| Bucket            | Visibility | File Size Limit | Purpose                                     |
| ----------------- | ---------- | --------------- | ------------------------------------------- |
| `assets_public`   | Public     | 50MB            | Public assets (avatars, images)             |
| `investors`       | Private    | 50MB            | Investor documents (statements, agreements) |
| `document_upload` | Private    | None            | Legacy document uploads                     |

#### 3.6.2 Folder-Based Isolation

Private buckets use **folder-based isolation** where files are organized by owner:

```text
investors/
├── users/{clerk_user_id}/
│   ├── statements/
│   ├── payments/
│   └── agreements/
└── orgs/{clerk_org_id}/
    ├── statements/
    ├── payments/
    └── agreements/
```

**Path Convention:**

- Individual user files: `users/{clerk_user_id}/{category}/{filename}`
- Organization files: `orgs/{clerk_org_id}/{category}/{filename}`

#### 3.6.3 Storage Helper Functions

Three SQL functions support storage RLS policies:

```sql
-- Get clerk_user_id from JWT token
get_clerk_user_id() → TEXT
  Returns: auth.jwt() ->> 'sub'

-- Check if user is internal admin
is_internal_admin() → BOOLEAN
  Returns: true if role = 'admin' AND is_internal_yn = true

-- Get all org IDs user belongs to
get_user_org_ids() → TEXT[]
  Returns: Array of clerk_org_id values from auth_clerk_orgs_members
```

#### 3.6.4 Storage RLS Policies (`investors` bucket)

| Policy Name                   | Operation | Rule                                                               |
| ----------------------------- | --------- | ------------------------------------------------------------------ |
| `investors_select_own_files`  | SELECT    | Internal admins OR file in `users/{my_id}/` OR `orgs/{my_org_id}/` |
| `investors_insert_admin_only` | INSERT    | Internal admins only                                               |
| `investors_update_admin_only` | UPDATE    | Internal admins only                                               |
| `investors_delete_admin_only` | DELETE    | Internal admins only                                               |

**Key Security Rules:**

1. **Read Access (SELECT):**

   - Internal admins (`is_internal_admin() = true`) can read all files
   - Users can only read files in their own folder (`users/{their_clerk_user_id}/`)
   - Users can read files in their organization's folder (`orgs/{their_org_id}/`)

2. **Write Access (INSERT/UPDATE/DELETE):**
   - **Only internal admins** can upload, modify, or delete files
   - Requires BOTH: `role = 'admin'` AND `is_internal_yn = true`

```sql
-- Example: SELECT policy logic
(storage.foldername(name))[1] = 'users'
AND (storage.foldername(name))[2] = get_clerk_user_id()
OR
(storage.foldername(name))[1] = 'orgs'
AND (storage.foldername(name))[2] = ANY(get_user_org_ids())
```

#### 3.6.5 Client-Side Permission Check

The `useCanUpload` hook checks if the current user has upload permission:

```typescript
// From src/hooks/use-can-upload.ts
const { canUpload, isLoading } = useCanUpload();
// Returns true if: role = 'admin' AND is_internal_yn = true
```

Used by `FileManager` component to conditionally show upload/delete UI.

---

## 4. Calculation Logic

### 4.1 Investor Dashboard Metrics

#### Total Invested (Contributions)

```text
Formula: SUM(ABS(transaction_amount))
         WHERE ledger_entry_type = 'contribution'

Excel:   =SUMIF(ledger_entry_type, "contribution", ABS(transaction_amount))
```

#### Total Distributions

```text
Formula: SUM(ABS(transaction_amount))
         WHERE ledger_entry_type = 'distribution'

Excel:   =SUMIF(ledger_entry_type, "distribution", ABS(transaction_amount))
```

#### Active Deals Count

```text
Formula: COUNT(*) WHERE deal_disposition_1 = 'active'

Excel:   =COUNTIF(deal_disposition_1, "active")
```

#### ROI (Return on Investment)

**Important:** ROI measures actual income/profit, NOT total distributions. The return of principal is not income—it's simply getting your capital back.

```text
Formula: (Total Income Earned / Total Invested) × 100

Where:
  Total Income Earned = Interest Earned + Fees Earned + Other Income
  (Principal repayments are NOT counted as income)

Excel:   =(Total_Income_Earned / Total_Invested) * 100
```

**Example Scenario:**

| Component              | Amount         | Counts as Income?         |
| ---------------------- | -------------- | ------------------------- |
| Interest Earned        | $2,631.02      | ✅ Yes                    |
| Wire Fees Earned       | $70.00         | ✅ Yes                    |
| Principal Paid Off     | $30,000.00     | ❌ No (return of capital) |
| **Total Distribution** | **$32,701.02** | —                         |
| **Total Income**       | **$2,701.02**  | —                         |

If initial investment was $30,000:

```text
ROI = ($2,701.02 / $30,000) × 100 = 9.0%
```

> **Note:** Receiving 100% of your capital back means you recouped your principal. Only the income generated in exchange for lending that capital constitutes the "Return" on the investment.

### 4.2 Cash Flow Calculations

#### Monthly Grouping

```javascript
// Group transactions by month
const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
  2,
  "0"
)}-01`;
```

#### Cumulative Contributions

```text
For each month M:
  Cumulative_Contributions[M] = Cumulative_Contributions[M-1] + Contributions[M]

Excel: =SUM($B$2:B2)  // Running total
```

#### Monthly ROI

```text
Formula: (Distributions[M] / Cumulative_Contributions[M]) × 100

Note: This shows the distribution rate for that month relative to total invested
```

### 4.3 Data Filtering by Source

#### When Organization Selected

```sql
-- Only transactions linked to selected org
SELECT * FROM bsi_transactions t
INNER JOIN bsi_transactions_investors ti ON ti.transaction_id = t.id
WHERE ti.clerk_org_id = {selected_org_db_id}
```

#### When No Organization (Direct User Data)

```sql
-- Only transactions linked directly to user (not through any org)
SELECT * FROM bsi_transactions t
INNER JOIN bsi_transactions_investors ti ON ti.transaction_id = t.id
WHERE ti.clerk_user_id = {user_db_id}
  AND ti.clerk_org_id IS NULL
```

#### When Impersonating (All User Data)

```sql
-- All transactions: direct + all orgs user belongs to
SELECT * FROM bsi_transactions t
INNER JOIN bsi_transactions_investors ti ON ti.transaction_id = t.id
WHERE ti.clerk_user_id = {impersonated_user_db_id}
   OR ti.clerk_org_id IN (
       SELECT clerk_org_id FROM auth_clerk_orgs_members
       WHERE auth_clerk_users_id = {impersonated_user_db_id}
   )
```

---

## 5. Data Flow Examples

### 5.1 Example: Varazdat Topuzyan's View

**User Profile:**

- Database ID: 5
- Member of: "VT Funder LLC" (org ID: 3), "Brrrr Funder LLC" (org ID: 4)

#### Scenario 1: VT Funder LLC Selected

```text
Shows:
  ✓ Distribution to VT Funder LLC - $5,024.98
  ✓ Distribution to VT Funder LLC - $454.44
  ✓ Distribution to VT Funder LLC - $114.84
  ✗ Distribution to Brrrr Funder LLC - $40,000 (different org)
```

#### Scenario 2: Brrrr Funder LLC Selected

```text
Shows:
  ✓ Distribution to Brrrr Funder LLC - $40,000
  ✓ Distribution to Brrrr Funder LLC - $10,576.44
  ✗ Distributions to VT Funder LLC (different org)
```

#### Scenario 3: Admin Impersonating Varazdat

```text
Shows ALL:
  ✓ Distribution to VT Funder LLC - $5,024.98
  ✓ Distribution to VT Funder LLC - $454.44
  ✓ Distribution to VT Funder LLC - $114.84
  ✓ Distribution to Brrrr Funder LLC - $40,000
  ✓ Distribution to Brrrr Funder LLC - $10,576.44
  (Combined view across all orgs)
```

### 5.2 Example: Creating a Transaction

```text
1. Admin creates transaction with:
   - Amount: $10,000
   - Type: Distribution
   - Investor: VT Funder LLC (entity)

2. System creates:
   - bsi_transactions record (amount, type, date, etc.)
   - bsi_transactions_investors record:
     - clerk_org_id: 3 (VT Funder LLC's DB ID)
     - clerk_user_id: NULL (entity, not individual)

3. Visibility:
   - Varazdat sees it when "VT Funder LLC" selected
   - Varazdat does NOT see it when "Brrrr Funder LLC" selected
   - Admin impersonating Varazdat sees it always
```

---

## Appendix A: API Endpoints

| Endpoint                                       | Purpose                  | Filters Applied               |
| ---------------------------------------------- | ------------------------ | ----------------------------- |
| `/api/investor-summary/contributions`          | Get contribution totals  | org_id or impersonate_user_id |
| `/api/investor-summary/distributions`          | Get distribution list    | org_id or impersonate_user_id |
| `/api/investor-summary/deals`                  | Get deal count by status | org_id or impersonate_user_id |
| `/api/investor-dashboard/cumulative-cash-flow` | Get ROI chart data       | org_id or impersonate_user_id |

---

## Appendix B: Key Files Reference

| File                                     | Purpose                         |
| ---------------------------------------- | ------------------------------- |
| `src/contexts/organization-context.tsx`  | Organization selection state    |
| `src/contexts/impersonation-context.tsx` | Impersonation state             |
| `src/hooks/use-supabase.ts`              | Supabase client with Clerk auth |
| `src/hooks/use-can-upload.ts`            | Check admin upload permission   |
| `src/hooks/use-supabase-upload.ts`       | File upload to Supabase storage |
| `src/lib/supabase-server.ts`             | Server-side Supabase client     |
| `src/app/api/investor-summary/*`         | Investor dashboard API routes   |

---

## Appendix C: Storage Migrations

| Migration                         | Purpose                                                                     |
| --------------------------------- | --------------------------------------------------------------------------- |
| `create_storage_helper_functions` | Created `get_clerk_user_id()`, `is_internal_admin()`, `get_user_org_ids()`  |
| `update_investors_bucket_rls`     | Replaced permissive policies with folder-based isolation + admin-only write |

---

_This document should be updated whenever significant changes are made to the schema, permissions model, or calculation logic._
