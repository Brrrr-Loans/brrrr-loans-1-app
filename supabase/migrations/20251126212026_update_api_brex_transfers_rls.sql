-- Migration: Update RLS policy on api_brex_transfers to include junction table matches
-- Allow users to see transfers matched via junction table (manual or automatic)

-- Drop existing policy
DROP POLICY IF EXISTS "Users can read transfers for their matched vendors" ON "public"."api_brex_transfers";

-- Recreate with junction table support
CREATE POLICY "Users can read transfers for their matched vendors" ON "public"."api_brex_transfers"
    FOR SELECT USING (
        -- Original: Via counterparty_id (automatic match)
        EXISTS (
            SELECT 1 FROM "public"."api_brex_vendors" av
            JOIN "public"."api_brex_vendors_clerk_users" avcu ON avcu.brex_vendor_id = av.id
            JOIN "public"."auth_clerk_users" acu ON avcu.clerk_user_id = acu.id
            WHERE av.brex_vendor_id = api_brex_transfers.counterparty_id
            AND acu.clerk_user_id = auth.jwt()->>'sub'
        )
        OR EXISTS (
            SELECT 1 FROM "public"."api_brex_vendors" av
            JOIN "public"."api_brex_vendors_clerk_orgs" avco ON avco.brex_vendor_id = av.id
            JOIN "public"."auth_clerk_orgs" aco ON avco.clerk_org_id = aco.id
            JOIN "public"."auth_clerk_orgs_members" acom ON acom.clerk_org_id = aco.id
            JOIN "public"."auth_clerk_users" acu ON acom.auth_clerk_users_id = acu.id
            WHERE av.brex_vendor_id = api_brex_transfers.counterparty_id
            AND acu.clerk_user_id = auth.jwt()->>'sub'
        )
        -- NEW: Via junction table (manual or automatic match)
        OR EXISTS (
            SELECT 1 FROM "public"."api_brex_transfers_vendors" atv
            JOIN "public"."api_brex_vendors" av ON av.id = atv.brex_vendor_id
            JOIN "public"."api_brex_vendors_clerk_users" avcu ON avcu.brex_vendor_id = av.id
            JOIN "public"."auth_clerk_users" acu ON avcu.clerk_user_id = acu.id
            WHERE atv.brex_transfer_id = api_brex_transfers.brex_transfer_id
            AND acu.clerk_user_id = auth.jwt()->>'sub'
        )
        OR EXISTS (
            SELECT 1 FROM "public"."api_brex_transfers_vendors" atv
            JOIN "public"."api_brex_vendors" av ON av.id = atv.brex_vendor_id
            JOIN "public"."api_brex_vendors_clerk_orgs" avco ON avco.brex_vendor_id = av.id
            JOIN "public"."auth_clerk_orgs" aco ON avco.clerk_org_id = aco.id
            JOIN "public"."auth_clerk_orgs_members" acom ON acom.clerk_org_id = aco.id
            JOIN "public"."auth_clerk_users" acu ON acom.auth_clerk_users_id = acu.id
            WHERE atv.brex_transfer_id = api_brex_transfers.brex_transfer_id
            AND acu.clerk_user_id = auth.jwt()->>'sub'
        )
    );

-- Add comment
COMMENT ON POLICY "Users can read transfers for their matched vendors" ON "public"."api_brex_transfers" IS 
'Users can see transfers matched to their vendors via counterparty_id (automatic) or via junction table (manual/automatic).';

