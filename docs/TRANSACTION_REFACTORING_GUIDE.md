# BSI Transactions Refactoring Guide

## Overview

This guide documents the refactoring of the `bsi_transactions` table to support many-to-many relationships and document uploads.

## Problem Statement

The original `bsi_transactions` table had single foreign keys for:

- `deal_id` - Could only link to one deal
- `investor_id` - Could only link to one investor
- `instrument_id` - Could only link to one instrument

This doesn't match the business reality where:

- A single wire transfer pays multiple investors
- Each payment covers earnings across multiple deals
- Documents need to be attached to transactions

## Solution Architecture

### 1. Join Tables for Many-to-Many Relationships

#### `bsi_transactions_deals`

- Links transactions to multiple deals
- Tracks amount allocated to each deal
- Maintains audit trail

#### `bsi_transactions_investors`

- Links transactions to multiple investors
- Supports both individual and organization investors
- Tracks amount per investor

#### `bsi_transactions_instruments`

- Links transactions to multiple debt instruments
- Tracks amount per instrument

### 2. Document Storage

#### `bsi_transaction_documents`

- Stores metadata for transaction documents
- Links to files in Supabase Storage
- Supports multiple document types (wire confirmations, bank statements, etc.)

#### Storage Bucket: `transaction-documents`

- Private bucket with RLS policies
- Supports PDFs, images, and spreadsheets
- 50MB file size limit

## Migration Steps

### Step 1: Apply Database Migrations

```bash
# 1. Create join tables
npx supabase db push --file supabase/migrations/refactor_bsi_transactions_many_to_many.sql

# 2. Add document support
npx supabase db push --file supabase/migrations/add_transaction_documents.sql

# 3. Create storage policies
npx supabase db push --file supabase/migrations/add_transaction_documents_storage_policies.sql

# 4. Migrate existing data
npx supabase db push --file supabase/migrations/migrate_existing_transaction_relationships.sql
```

### Step 2: Update TypeScript Types

```bash
npx supabase gen types typescript --linked > src/types/database.types.ts
```

### Step 3: Update Application Code

Use the helper functions in `src/lib/transaction-document-helpers.ts`:

```typescript
// Create a transaction with multiple deals and investors
const transaction = await createMultiPartyTransaction(
  supabase,
  {
    amount: 50000,
    date: "2024-03-15",
    method: "wire",
    type: "interest",
    referenceNumber: "WIRE-2024-03-001",
  },
  [
    { dealId: 1, amount: 30000 },
    { dealId: 2, amount: 20000 },
  ],
  [
    { investorId: 10, amount: 25000, orgId: 5 },
    { investorId: 11, amount: 25000 },
  ]
);

// Upload a wire confirmation
await uploadTransactionDocument(
  supabase,
  transaction.id,
  wireConfirmationFile,
  "wire_confirmation",
  currentUser.id
);
```

### Step 4: Clean Up (After Verification)

Once you've verified the migration is successful:

```sql
-- Remove old foreign key columns
ALTER TABLE bsi_transactions
  DROP COLUMN deal_id,
  DROP COLUMN investor_id,
  DROP COLUMN instrument_id;
```

## File Path Conventions

Transaction documents are organized by organization or user for better security and isolation:

**For organization users:**

```
organizations/{org_id}/transactions/{transaction_id}/{timestamp}_{filename}
```

**For individual users (no organization):**

```
users/{user_id}/transactions/{transaction_id}/{timestamp}_{filename}
```

Examples:

```
organizations/org_abc123/transactions/456/1699564800_wire_confirmation.pdf
organizations/org_abc123/transactions/456/1699564801_bank_statement.pdf
users/user_xyz789/transactions/123/1699564800_bank_statement.pdf
```

**Benefits of this structure:**

- Better isolation between organizations
- Clearer access control boundaries
- Easier bulk operations per organization
- Simpler compliance and data retention policies

## Security Considerations

1. **RLS Policies**:
   - Investors can only view documents for their transactions
   - Admins have full access to all documents

2. **File Access**:
   - Files are in a private bucket
   - Access requires authentication
   - Use signed URLs for temporary access

## API Examples

### Upload Document

```typescript
const { data, error } = await uploadTransactionDocument(
  supabase,
  transactionId,
  file,
  "wire_confirmation",
  userId,
  orgId // Optional - if null, will use user-based path
);
```

### Download Document

```typescript
await downloadTransactionDocument(
  supabase,
  document.file_path,
  document.file_name
);
```

### Get Transaction with All Relations

```typescript
const transactionDetails = await getTransactionWithRelations(
  supabase,
  transactionId
);
// Returns transaction with deals[], investors[], documents[]
```

## Next Steps

1. Apply the migrations to your database
2. Update your transaction creation forms to support multiple selections
3. Add document upload UI to transaction details
4. Update reporting queries to use the join tables
5. Consider adding validation rules (e.g., sum of allocations must equal transaction amount)
