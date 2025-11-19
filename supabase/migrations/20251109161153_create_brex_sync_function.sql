-- Migration: Create database function to sync matched Brex transfers to bsi_transactions
-- Function: sync_matched_api_brex_transfers_to_bsi_transactions

CREATE OR REPLACE FUNCTION sync_matched_api_brex_transfers_to_bsi_transactions()
RETURNS TABLE (
    inserted_count bigint,
    updated_count bigint,
    error_count bigint,
    errors jsonb
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_inserted_count bigint := 0;
    v_updated_count bigint := 0;
    v_error_count bigint := 0;
    v_errors jsonb := '[]'::jsonb;
    v_transfer_record RECORD;
    v_transaction_id bigint;
    v_error_message text;
    v_transaction_method text;
    v_transaction_status text;
    v_ledger_entry_type text;
    v_fed_reference_number text;
    v_amount_dollars numeric;
BEGIN
    -- Loop through all transfers that have matched vendors
    FOR v_transfer_record IN
        SELECT DISTINCT
            at.id as transfer_db_id,
            at.brex_transfer_id,
            at.amount,
            at.amount_cents,
            at.process_date,
            at.status,
            at.external_memo,
            at.payment_type,
            at.fed_reference_number,
            at.raw_payload,
            -- Get matched clerk_user_id (prefer user match over org match)
            COALESCE(
                (SELECT avcu.clerk_user_id 
                 FROM api_brex_vendors_clerk_users avcu
                 JOIN api_brex_vendors av ON av.id = avcu.brex_vendor_id
                 WHERE av.brex_vendor_id = at.counterparty_id
                 LIMIT 1),
                NULL
            ) as clerk_user_id,
            -- Get matched clerk_org_id
            COALESCE(
                (SELECT avco.clerk_org_id 
                 FROM api_brex_vendors_clerk_orgs avco
                 JOIN api_brex_vendors av ON av.id = avco.brex_vendor_id
                 WHERE av.brex_vendor_id = at.counterparty_id
                 LIMIT 1),
                NULL
            ) as clerk_org_id
        FROM api_brex_transfers at
        WHERE at.counterparty_id IS NOT NULL
        -- Only process transfers with matched vendors
        AND (
            EXISTS (
                SELECT 1 FROM api_brex_vendors av
                JOIN api_brex_vendors_clerk_users avcu ON avcu.brex_vendor_id = av.id
                WHERE av.brex_vendor_id = at.counterparty_id
            )
            OR EXISTS (
                SELECT 1 FROM api_brex_vendors av
                JOIN api_brex_vendors_clerk_orgs avco ON avco.brex_vendor_id = av.id
                WHERE av.brex_vendor_id = at.counterparty_id
            )
        )
        -- Only process transfers that haven't been synced yet
        AND NOT EXISTS (
            SELECT 1 FROM bsi_transactions_api_brex_transfers btbt
            WHERE btbt.brex_transfer_id = at.brex_transfer_id
        )
    LOOP
        BEGIN
            -- Fix #1: Extract fed_reference_number from column or raw_payload
            v_fed_reference_number := COALESCE(
                v_transfer_record.fed_reference_number,
                (v_transfer_record.raw_payload->'counterparty'->>'fed_reference_number')::text
            );

            -- Fix #2: Convert amount from cents to dollars
            -- Brex returns amounts in cents (smallest denomination), so always divide by 100
            -- IMPORTANT: Preserve negative signs if Brex provides them
            IF v_transfer_record.amount_cents IS NOT NULL THEN
                v_amount_dollars := v_transfer_record.amount_cents / 100.0;
            ELSIF v_transfer_record.amount IS NOT NULL THEN
                -- amount column should also be in cents from Brex API, convert to dollars
                v_amount_dollars := v_transfer_record.amount / 100.0;
            ELSE
                v_amount_dollars := NULL;
            END IF;
            
            -- If amount is positive, check if this is an outgoing transfer
            -- Transfers with matched vendors (counterparties) are payments TO vendors,
            -- which means they're outgoing FROM the Brex account and should be negative.
            -- Only negate if amount is currently positive (preserve negative signs from Brex)
            IF v_amount_dollars IS NOT NULL AND v_amount_dollars > 0 THEN
                -- For transfers with matched vendors, these are outgoing payments
                -- Make the amount negative to represent outgoing transfer
                v_amount_dollars := -1 * v_amount_dollars;
            END IF;

            -- Map payment_type to transaction_method enum
            CASE v_transfer_record.payment_type
                WHEN 'ACH' THEN v_transaction_method := 'ach';
                WHEN 'DOMESTIC_WIRE' THEN v_transaction_method := 'wire';
                WHEN 'INTERNATIONAL_WIRE' THEN v_transaction_method := 'wire';
                WHEN 'CHEQUE' THEN v_transaction_method := 'check';
                ELSE v_transaction_method := 'other';
            END CASE;

            -- Fix #3: Map status to transaction_status enum (case-insensitive)
            CASE UPPER(TRIM(v_transfer_record.status))
                WHEN 'PROCESSING' THEN v_transaction_status := 'processing';
                WHEN 'COMPLETED' THEN v_transaction_status := 'completed';
                WHEN 'FAILED' THEN v_transaction_status := 'failed';
                WHEN 'CANCELLED', 'CANCELED' THEN v_transaction_status := 'canceled';
                WHEN 'PENDING' THEN v_transaction_status := 'pending';
                WHEN 'SCHEDULED' THEN v_transaction_status := 'scheduled';
                WHEN 'INITIATED' THEN v_transaction_status := 'initiated';
                ELSE 
                    -- Try to extract from raw_payload if status column is NULL
                    v_transaction_status := COALESCE(
                        LOWER((v_transfer_record.raw_payload->>'status')::text),
                        'pending'
                    );
            END CASE;

            -- Fix #4: Determine ledger_entry_type based on amount sign
            -- Negative amount = distribution (outgoing transfer)
            -- Positive amount = contribution (incoming transfer)
            IF v_amount_dollars IS NOT NULL THEN
                IF v_amount_dollars < 0 THEN
                    v_ledger_entry_type := 'distribution';
                ELSE
                    v_ledger_entry_type := 'contribution';
                END IF;
            ELSE
                -- Default to contribution if amount is NULL
                v_ledger_entry_type := 'contribution';
            END IF;

            -- Insert into bsi_transactions
            INSERT INTO bsi_transactions (
                transaction_amount,
                transaction_date,
                transaction_method,
                transaction_status,
                reference_number,
                external_memo,
                ledger_entry_type,
                created_at,
                updated_at
            )
            VALUES (
                v_amount_dollars,
                COALESCE(v_transfer_record.process_date::timestamp with time zone, NOW()),
                v_transaction_method::transaction_method,
                v_transaction_status::transaction_status,
                v_fed_reference_number,
                v_transfer_record.external_memo,
                v_ledger_entry_type::ledger_entry_type,
                NOW(),
                NOW()
            )
            RETURNING id INTO v_transaction_id;

            -- Create investor allocation if clerk_user_id exists
            IF v_transfer_record.clerk_user_id IS NOT NULL THEN
                INSERT INTO bsi_transactions_investors (
                    transaction_id,
                    clerk_user_id,
                    clerk_org_id,
                    allocation_amount,
                    created_at
                )
                VALUES (
                    v_transaction_id,
                    v_transfer_record.clerk_user_id,
                    v_transfer_record.clerk_org_id,
                    v_amount_dollars,
                    NOW()
                );
            END IF;

            -- Create junction table record
            INSERT INTO bsi_transactions_api_brex_transfers (
                transaction_id,
                brex_transfer_id,
                created_at
            )
            VALUES (
                v_transaction_id,
                v_transfer_record.brex_transfer_id,
                NOW()
            );

            v_inserted_count := v_inserted_count + 1;

        EXCEPTION WHEN OTHERS THEN
            v_error_count := v_error_count + 1;
            v_error_message := SQLERRM;
            v_errors := v_errors || jsonb_build_object(
                'brex_transfer_id', v_transfer_record.brex_transfer_id,
                'error', v_error_message
            );
            -- Continue processing other transfers
        END;
    END LOOP;

    RETURN QUERY SELECT v_inserted_count, v_updated_count, v_error_count, v_errors;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION sync_matched_api_brex_transfers_to_bsi_transactions() TO service_role;

-- Add comment
COMMENT ON FUNCTION sync_matched_api_brex_transfers_to_bsi_transactions() IS 
'Syncs matched Brex transfers to bsi_transactions. Only processes transfers with vendors matched to Clerk users/orgs that have not been synced yet.';

