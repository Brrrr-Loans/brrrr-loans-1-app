# Database Functions

**Total Functions:** 33

| # | Function Name | Parameters |
|---|---------------|------------|
| 1 | `auto_match_transfer_to_vendor` | (none) |
| 2 | `check_deal_allocation_sum` | (none) |
| 3 | `count_pending_brex_transfer_syncs` | (none) |
| 4 | `format_address` | "po_box" "text", "street" "text", "apt_suite" "text", "ci... |
| 5 | `format_address` | "street" "text" DEFAULT NULL::"text", "suite_apt" "text" ... |
| 6 | `format_deal_name` | "property_id" bigint |
| 7 | `get_accessible_transaction_ids` | (none) |
| 8 | `get_clerk_user_id` | (none) |
| 9 | `get_co_investor_org_ids` | (none) |
| 10 | `get_co_investor_user_ids` | (none) |
| 11 | `get_complete_schema` | (none) |
| 12 | `get_current_user_id` | (none) |
| 13 | `get_current_user_org_ids` | (none) |
| 14 | `get_jsonb_array_element` | "array_value" "jsonb", "index" integer |
| 15 | `get_numeric_constant` | "constant_name" "text" |
| 16 | `get_state_code` | "state_name" "text" |
| 17 | `get_text_constant` | "constant_name" "text" |
| 18 | `get_user_org_ids` | (none) |
| 19 | `get_yesno_constant` | "constant_name" "text" |
| 20 | `handle_deal_changes` | (none) |
| 21 | `handle_new_deal` | (none) |
| 22 | `handle_new_loan_application` | (none) |
| 23 | `handle_new_user` | (none) |
| 24 | `handle_property_changes` | (none) |
| 25 | `handle_user_profile_changes` | (none) |
| 26 | `is_admin` | (none) |
| 27 | `is_internal_admin` | (none) |
| 28 | `ltv` | "transaction_type" "public"."transaction_type", "as_is_va... |
| 29 | `sync_matched_api_brex_transfers_to_bsi_transactions` | (none) |
| 30 | `sync_transaction_to_investors` | (none) |
| 31 | `sync_transaction_to_investors_on_update` | (none) |
| 32 | `update_property_address` | (none) |
| 33 | `user_has_transaction_access` | "transaction_id_param" bigint |
