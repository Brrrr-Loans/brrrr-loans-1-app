-- Fix: Correct the ledger_entry_type logic for Brex transfers
-- For a lender/fund:
--   - Money sent TO borrowers (Brex negative) = Contribution (stored as positive)
--   - Money received FROM borrowers (Brex positive) = Also contribution (stored as positive)

CREATE OR REPLACE FUNCTION sync_matched_api_brex_transfers_to_bsi_transactions()
RETURNS TABLE (
    inserted_count bigint,
    updated_count bigint,
    error_count bigint,
    errors jsonb
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_inserted_count bigint := 0;
    v_updated_count bigint := 0;
    v_error_count bigint := 0;
    v_errors jsonb := '[]'::jsonb;
    v_transfer_record RECORD;
    v_transaction_id bigint;
    v_existing_transaction_id bigint;
    v_error_message text;
    v_transaction_method text;
    v_transaction_status text;
    v_ledger_entry_type text;
    v_fed_reference_number text;
    v_amount_dollars numeric;
BEGIN
    -- Loop through all transfers that are matched to vendors via junction table
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
            atv.brex_vendor_id as matched_vendor_id,
            -- Get matched clerk_user_id from the vendor
            (SELECT avcu.clerk_user_id 
             FROM api_brex_vendors_clerk_users avcu
             WHERE avcu.brex_vendor_id = atv.brex_vendor_id
             LIMIT 1) as clerk_user_id,
            -- Get matched clerk_org_id from the vendor
            (SELECT avco.clerk_org_id 
             FROM api_brex_vendors_clerk_orgs avco
             WHERE avco.brex_vendor_id = atv.brex_vendor_id
             LIMIT 1) as clerk_org_id
        FROM api_brex_transfers at
        -- Join with junction table to get vendor match
        INNER JOIN api_brex_transfers_vendors atv ON atv.brex_transfer_id = at.brex_transfer_id
        -- Only process if vendor has clerk match (user or org)
        WHERE (
            EXISTS (
                SELECT 1 FROM api_brex_vendors_clerk_users avcu
                WHERE avcu.brex_vendor_id = atv.brex_vendor_id
            )
            OR EXISTS (
                SELECT 1 FROM api_brex_vendors_clerk_orgs avco
                WHERE avco.brex_vendor_id = atv.brex_vendor_id
            )
        )
    LOOP
        BEGIN
            -- Extract fed_reference_number
            v_fed_reference_number := COALESCE(
                v_transfer_record.fed_reference_number,
                (v_transfer_record.raw_payload->'counterparty'->>'fed_reference_number')::text
            );

            -- Convert amount from cents to dollars
            IF v_transfer_record.amount_cents IS NOT NULL THEN
                v_amount_dollars := v_transfer_record.amount_cents / 100.0;
            ELSIF v_transfer_record.amount IS NOT NULL THEN
                v_amount_dollars := v_transfer_record.amount / 100.0;
            ELSE
                v_amount_dollars := NULL;
            END IF;
            
            -- Keep the sign from Brex - preserve investor perspective
            -- Negative = money sent out (contribution/investment)
            -- Positive = money received back (distribution/return)
            
            -- Determine ledger_entry_type based on direction (from investor perspective)
            IF v_amount_dollars IS NOT NULL THEN
                IF v_amount_dollars < 0 THEN
                    -- Money sent OUT = contribution (investment)
                    v_ledger_entry_type := 'contribution';
                ELSE
                    -- Money received IN = distribution (return)
                    v_ledger_entry_type := 'distribution';
                END IF;
            ELSE
                v_ledger_entry_type := 'contribution';
            END IF;

            -- Map payment_type to transaction_method
            CASE v_transfer_record.payment_type
                WHEN 'ACH' THEN v_transaction_method := 'ach';
                WHEN 'DOMESTIC_WIRE' THEN v_transaction_method := 'wire';
                WHEN 'INTERNATIONAL_WIRE' THEN v_transaction_method := 'wire';
                WHEN 'CHEQUE' THEN v_transaction_method := 'check';
                ELSE v_transaction_method := 'other';
            END CASE;

            -- Map status to transaction_status
            CASE UPPER(TRIM(v_transfer_record.status))
                WHEN 'PROCESSING' THEN v_transaction_status := 'processing';
                WHEN 'COMPLETED' THEN v_transaction_status := 'completed';
                WHEN 'FAILED' THEN v_transaction_status := 'failed';
                WHEN 'CANCELLED', 'CANCELED' THEN v_transaction_status := 'canceled';
                WHEN 'PENDING' THEN v_transaction_status := 'pending';
                WHEN 'SCHEDULED' THEN v_transaction_status := 'scheduled';
                WHEN 'INITIATED' THEN v_transaction_status := 'initiated';
                WHEN 'PROCESSED' THEN v_transaction_status := 'processed';
                ELSE 
                    v_transaction_status := COALESCE(
                        LOWER((v_transfer_record.raw_payload->>'status')::text),
                        'pending'
                    );
            END CASE;

            -- Check if transaction already exists via junction table
            SELECT t.id INTO v_existing_transaction_id
            FROM bsi_transactions t
            JOIN bsi_transactions_api_brex_transfers btbt ON btbt.transaction_id = t.id
            WHERE btbt.brex_transfer_id = v_transfer_record.brex_transfer_id;

            IF v_existing_transaction_id IS NOT NULL THEN
                -- UPDATE existing transaction with latest Brex data
                UPDATE bsi_transactions SET
                    transaction_amount = v_amount_dollars,
                    transaction_status = v_transaction_status::transaction_status,
                    transaction_date = COALESCE(v_transfer_record.process_date::timestamp with time zone, transaction_date),
                    ledger_entry_type = v_ledger_entry_type::ledger_entry_type,
                    updated_at = NOW()
                WHERE id = v_existing_transaction_id;
                
                v_updated_count := v_updated_count + 1;
            ELSE
                -- INSERT new transaction
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

                -- Create investor allocation if clerk match exists
                -- allocation_amount must be positive (absolute value)
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

                -- Create junction table record linking transaction to transfer
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
            END IF;

        EXCEPTION WHEN OTHERS THEN
            v_error_count := v_error_count + 1;
            v_error_message := SQLERRM;
            v_errors := v_errors || jsonb_build_object(
                'brex_transfer_id', v_transfer_record.brex_transfer_id,
                'error', v_error_message
            );
        END;
    END LOOP;

    RETURN QUERY SELECT v_inserted_count, v_updated_count, v_error_count, v_errors;
END;
$$;

GRANT EXECUTE ON FUNCTION sync_matched_api_brex_transfers_to_bsi_transactions() TO service_role;

COMMENT ON FUNCTION sync_matched_api_brex_transfers_to_bsi_transactions() IS 
'Syncs matched Brex transfers to bsi_transactions. All matched vendor transfers are treated as contributions (investments/loans). Amounts are stored as positive values regardless of Brex sign.';

