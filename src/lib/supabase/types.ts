export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      appraisal: {
        Row: {
          appraiser_id: number | null;
          co_amc: number | null;
          co_appraisal: number | null;
          created_at: string;
          date_amc_vendor_accept: string | null;
          date_amc_vendor_assign: string | null;
          date_inspection_completed: string | null;
          date_inspection_scheduled: string | null;
          date_report_effective: string | null;
          date_report_expiration: string | null;
          date_report_ordered: string | null;
          date_report_received: string | null;
          deal_id: number | null;
          document_id: number | null;
          file_number: string | null;
          file_number_amc: string | null;
          id: number;
          order_status:
            | Database["public"]["Enums"]["appraisal_order_status"]
            | null;
          order_type:
            | Database["public"]["Enums"]["appraisal_order_type"]
            | null;
          property_id: number | null;
          updated_at: string | null;
          value_conclusion_as_is: number | null;
          value_conclusion_as_repaired: number | null;
          value_conclusion_fair_market_rent: number | null;
        };
        Insert: {
          appraiser_id?: number | null;
          co_amc?: number | null;
          co_appraisal?: number | null;
          created_at?: string;
          date_amc_vendor_accept?: string | null;
          date_amc_vendor_assign?: string | null;
          date_inspection_completed?: string | null;
          date_inspection_scheduled?: string | null;
          date_report_effective?: string | null;
          date_report_expiration?: string | null;
          date_report_ordered?: string | null;
          date_report_received?: string | null;
          deal_id?: number | null;
          document_id?: number | null;
          file_number?: string | null;
          file_number_amc?: string | null;
          id?: number;
          order_status?:
            | Database["public"]["Enums"]["appraisal_order_status"]
            | null;
          order_type?:
            | Database["public"]["Enums"]["appraisal_order_type"]
            | null;
          property_id?: number | null;
          updated_at?: string | null;
          value_conclusion_as_is?: number | null;
          value_conclusion_as_repaired?: number | null;
          value_conclusion_fair_market_rent?: number | null;
        };
        Update: {
          appraiser_id?: number | null;
          co_amc?: number | null;
          co_appraisal?: number | null;
          created_at?: string;
          date_amc_vendor_accept?: string | null;
          date_amc_vendor_assign?: string | null;
          date_inspection_completed?: string | null;
          date_inspection_scheduled?: string | null;
          date_report_effective?: string | null;
          date_report_expiration?: string | null;
          date_report_ordered?: string | null;
          date_report_received?: string | null;
          deal_id?: number | null;
          document_id?: number | null;
          file_number?: string | null;
          file_number_amc?: string | null;
          id?: number;
          order_status?:
            | Database["public"]["Enums"]["appraisal_order_status"]
            | null;
          order_type?:
            | Database["public"]["Enums"]["appraisal_order_type"]
            | null;
          property_id?: number | null;
          updated_at?: string | null;
          value_conclusion_as_is?: number | null;
          value_conclusion_as_repaired?: number | null;
          value_conclusion_fair_market_rent?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "appraisal_appraiser_id_fkey";
            columns: ["appraiser_id"];
            isOneToOne: false;
            referencedRelation: "contact";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appraisal_co_amc_fkey";
            columns: ["co_amc"];
            isOneToOne: false;
            referencedRelation: "company";
            referencedColumns: ["co_id"];
          },
          {
            foreignKeyName: "appraisal_co_appraisal_fkey";
            columns: ["co_appraisal"];
            isOneToOne: false;
            referencedRelation: "company";
            referencedColumns: ["co_id"];
          },
          {
            foreignKeyName: "appraisal_deal_id_fkey";
            columns: ["deal_id"];
            isOneToOne: false;
            referencedRelation: "deal";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appraisal_document_id_fkey";
            columns: ["document_id"];
            isOneToOne: false;
            referencedRelation: "document_files";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appraisal_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "property";
            referencedColumns: ["id"];
          }
        ];
      };
      bsi_deals: {
        Row: {
          contact_id: number;
          contact_types_id: number;
          deal_id: number;
        };
        Insert: {
          contact_id: number;
          contact_types_id: number;
          deal_id: number;
        };
        Update: {
          contact_id?: number;
          contact_types_id?: number;
          deal_id?: number;
        };
        Relationships: [];
      };
      bsi_distributions: {
        Row: {
          capital_contribution: number;
          clerk_org_id: number | null;
          clerk_org_member_id: number | null;
          created_at: string | null;
          deal_id: number | null;
          deposit_amount: number;
          id: number;
          instrument_id: number | null;
          interest_amount: number;
          investor_id: number | null;
          loan_amount_snapshot: number;
          notes: string | null;
          principal_amount: number;
          rate_of_return_pct: number;
          servicing_fee: number;
          statement_id: string;
          upb_close: number | null;
          updated_at: string | null;
          user_id: number | null;
          wire_fee: number;
        };
        Insert: {
          capital_contribution: number;
          clerk_org_id?: number | null;
          clerk_org_member_id?: number | null;
          created_at?: string | null;
          deal_id?: number | null;
          deposit_amount: number;
          id: number;
          instrument_id?: number | null;
          interest_amount: number;
          investor_id?: number | null;
          loan_amount_snapshot: number;
          notes?: string | null;
          principal_amount: number;
          rate_of_return_pct: number;
          servicing_fee?: number;
          statement_id: string;
          upb_close?: number | null;
          updated_at?: string | null;
          user_id?: number | null;
          wire_fee?: number;
        };
        Update: {
          capital_contribution?: number;
          clerk_org_id?: number | null;
          clerk_org_member_id?: number | null;
          created_at?: string | null;
          deal_id?: number | null;
          deposit_amount?: number;
          id?: number;
          instrument_id?: number | null;
          interest_amount?: number;
          investor_id?: number | null;
          loan_amount_snapshot?: number;
          notes?: string | null;
          principal_amount?: number;
          rate_of_return_pct?: number;
          servicing_fee?: number;
          statement_id?: string;
          upb_close?: number | null;
          updated_at?: string | null;
          user_id?: number | null;
          wire_fee?: number;
        };
        Relationships: [
          {
            foreignKeyName: "bsi_distributions_clerk_org_id_fkey";
            columns: ["clerk_org_id"];
            isOneToOne: false;
            referencedRelation: "auth_clerk_orgs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bsi_distributions_clerk_org_member_id_fkey";
            columns: ["clerk_org_member_id"];
            isOneToOne: false;
            referencedRelation: "auth_clerk_orgs_members";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bsi_distributions_deal_id_fkey";
            columns: ["deal_id"];
            isOneToOne: false;
            referencedRelation: "deal";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bsi_distributions_instrument_id_fkey";
            columns: ["instrument_id"];
            isOneToOne: false;
            referencedRelation: "bs_debt_instruments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bsi_distributions_investor_id_fkey";
            columns: ["investor_id"];
            isOneToOne: false;
            referencedRelation: "contact";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bsi_distributions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "auth_clerk_users";
            referencedColumns: ["id"];
          }
        ];
      };
      bsi_statements: {
        Row: {
          clerk_org_id: number | null;
          created_at: string;
          id: number;
          investor_id: number | null;
          statement_date: string;
          statement_period_end: string;
          statement_period_start: string;
          total_fees: number;
          total_interest: number;
          total_principal: number | null;
          total_upb_close: number;
          total_upb_open: number;
        };
        Insert: {
          clerk_org_id?: number | null;
          created_at?: string;
          id: number;
          investor_id?: number | null;
          statement_date: string;
          statement_period_end: string;
          statement_period_start: string;
          total_fees: number;
          total_interest: number;
          total_principal?: number | null;
          total_upb_close: number;
          total_upb_open: number;
        };
        Update: {
          clerk_org_id?: number | null;
          created_at?: string;
          id?: number;
          investor_id?: number | null;
          statement_date?: string;
          statement_period_end?: string;
          statement_period_start?: string;
          total_fees?: number;
          total_interest?: number;
          total_principal?: number | null;
          total_upb_close?: number;
          total_upb_open?: number;
        };
        Relationships: [
          {
            foreignKeyName: "bsi_statements_clerk_org_id_fkey";
            columns: ["clerk_org_id"];
            isOneToOne: false;
            referencedRelation: "auth_clerk_orgs";
            referencedColumns: ["id"];
          }
        ];
      };
      contact: {
        Row: {
          cell_phone: string | null;
          company_id: number | null;
          contact_type: Database["public"]["Enums"]["contact_type"] | null;
          contact_types: Database["public"]["Enums"]["contact_type"][] | null;
          created_at: string | null;
          email_address: string | null;
          first_name: string | null;
          home_phone: string | null;
          id: number;
          last_name: string | null;
          middle_name: string | null;
          name: string | null;
          office_phone: string | null;
          portal_access: boolean | null;
          profile_picture: string | null;
          updated_at: string | null;
          user_id: number | null;
        };
        Insert: {
          cell_phone?: string | null;
          company_id?: number | null;
          contact_type?: Database["public"]["Enums"]["contact_type"] | null;
          contact_types?: Database["public"]["Enums"]["contact_type"][] | null;
          created_at?: string | null;
          email_address?: string | null;
          first_name?: string | null;
          home_phone?: string | null;
          id?: number;
          last_name?: string | null;
          middle_name?: string | null;
          name?: string | null;
          office_phone?: string | null;
          portal_access?: boolean | null;
          profile_picture?: string | null;
          updated_at?: string | null;
          user_id?: number | null;
        };
        Update: {
          cell_phone?: string | null;
          company_id?: number | null;
          contact_type?: Database["public"]["Enums"]["contact_type"] | null;
          contact_types?: Database["public"]["Enums"]["contact_type"][] | null;
          created_at?: string | null;
          email_address?: string | null;
          first_name?: string | null;
          home_phone?: string | null;
          id?: number;
          last_name?: string | null;
          middle_name?: string | null;
          name?: string | null;
          office_phone?: string | null;
          portal_access?: boolean | null;
          profile_picture?: string | null;
          updated_at?: string | null;
          user_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "contact_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "company";
            referencedColumns: ["co_id"];
          },
          {
            foreignKeyName: "contact_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "auth_clerk_users";
            referencedColumns: ["id"];
          }
        ];
      };
      deal: {
        Row: {
          account_executive_id: number | null;
          appraisal_poc_contact_id: number | null;
          broker_company_id: number | null;
          broker_id: number | null;
          cash_out_purpose: string | null;
          closing_agent_contact_id: number | null;
          company_id: number | null;
          construction_holdback: number | null;
          cost_of_capital: number | null;
          created_at: string | null;
          date_of_purchase: string | null;
          deal_disposition_1:
            | Database["public"]["Enums"]["deal_disposition_1"]
            | null;
          deal_name: string | null;
          deal_stage_1: Database["public"]["Enums"]["deal_stage_1"] | null;
          deal_stage_2: Database["public"]["Enums"]["deal_stage_2"] | null;
          deal_type: Database["public"]["Enums"]["loan_type_1"] | null;
          declaration_1_lawsuits: boolean | null;
          declaration_1_lawsuits_explanation: string | null;
          declaration_2_bankruptcy: boolean | null;
          declaration_2_bankruptcy_explanation: string | null;
          declaration_3_felony: boolean | null;
          declaration_3_felony_explanation: string | null;
          declaration_5_license: boolean | null;
          escrow_company_id: number | null;
          escrow_contact_id: number | null;
          fourth_guarantor_id: number | null;
          funding_date: string | null;
          guarantor_count: number | null;
          guarantor_fico_score: number | null;
          id: number;
          insurance_carrier_company_id: number | null;
          insurance_carrier_contact_id: number | null;
          io_period: number | null;
          lead_source_name: string | null;
          lead_source_type: Database["public"]["Enums"]["lead_source"] | null;
          loan_amount_initial: number | null;
          loan_amount_total: number | null;
          loan_buyer_company_id: number | null;
          loan_buyer_contact_id: number | null;
          loan_number: string | null;
          loan_opener_id: number | null;
          loan_processor_id: number | null;
          loan_sale_date: string | null;
          loan_structure_dscr:
            | Database["public"]["Enums"]["loan_structure_dscr"]
            | null;
          loan_term: Database["public"]["Enums"]["loan_term_months"] | null;
          loan_type_rtl: Database["public"]["Enums"]["loan_type_2"] | null;
          ltv_after_repair: number | null;
          ltv_asis: number | null;
          mid_fico: number | null;
          note_date: string | null;
          note_rate: number | null;
          payoff_mtg1_amount: number | null;
          ppp_structure_1:
            | Database["public"]["Enums"]["ppp_structure_1"]
            | null;
          ppp_term: Database["public"]["Enums"]["ppp_term"] | null;
          pricing_file_path: string | null;
          pricing_file_url: string | null;
          pricing_is_locked: boolean;
          primary_guarantor_id: number | null;
          project_type: Database["public"]["Enums"]["project_type"] | null;
          property_id: number | null;
          purchase_price: number | null;
          recently_renovated: Database["public"]["Enums"]["yes_no"] | null;
          recourse_type: string | null;
          renovation_completed: string | null;
          renovation_cost: number | null;
          second_guarantor_id: number | null;
          target_closing_date: string | null;
          third_guarantor_id: number | null;
          title_company_contact_id: number | null;
          title_company_id: number | null;
          title_file_number: string | null;
          transaction_type:
            | Database["public"]["Enums"]["transaction_type"]
            | null;
          updated_at: string | null;
          vesting_type: Database["public"]["Enums"]["vesting_type"] | null;
        };
        Insert: {
          account_executive_id?: number | null;
          appraisal_poc_contact_id?: number | null;
          broker_company_id?: number | null;
          broker_id?: number | null;
          cash_out_purpose?: string | null;
          closing_agent_contact_id?: number | null;
          company_id?: number | null;
          construction_holdback?: number | null;
          cost_of_capital?: number | null;
          created_at?: string | null;
          date_of_purchase?: string | null;
          deal_disposition_1?:
            | Database["public"]["Enums"]["deal_disposition_1"]
            | null;
          deal_name?: string | null;
          deal_stage_1?: Database["public"]["Enums"]["deal_stage_1"] | null;
          deal_stage_2?: Database["public"]["Enums"]["deal_stage_2"] | null;
          deal_type?: Database["public"]["Enums"]["loan_type_1"] | null;
          declaration_1_lawsuits?: boolean | null;
          declaration_1_lawsuits_explanation?: string | null;
          declaration_2_bankruptcy?: boolean | null;
          declaration_2_bankruptcy_explanation?: string | null;
          declaration_3_felony?: boolean | null;
          declaration_3_felony_explanation?: string | null;
          declaration_5_license?: boolean | null;
          escrow_company_id?: number | null;
          escrow_contact_id?: number | null;
          fourth_guarantor_id?: number | null;
          funding_date?: string | null;
          guarantor_count?: number | null;
          guarantor_fico_score?: number | null;
          id?: number;
          insurance_carrier_company_id?: number | null;
          insurance_carrier_contact_id?: number | null;
          io_period?: number | null;
          lead_source_name?: string | null;
          lead_source_type?: Database["public"]["Enums"]["lead_source"] | null;
          loan_amount_initial?: number | null;
          loan_amount_total?: number | null;
          loan_buyer_company_id?: number | null;
          loan_buyer_contact_id?: number | null;
          loan_number?: string | null;
          loan_opener_id?: number | null;
          loan_processor_id?: number | null;
          loan_sale_date?: string | null;
          loan_structure_dscr?:
            | Database["public"]["Enums"]["loan_structure_dscr"]
            | null;
          loan_term?: Database["public"]["Enums"]["loan_term_months"] | null;
          loan_type_rtl?: Database["public"]["Enums"]["loan_type_2"] | null;
          ltv_after_repair?: number | null;
          ltv_asis?: number | null;
          mid_fico?: number | null;
          note_date?: string | null;
          note_rate?: number | null;
          payoff_mtg1_amount?: number | null;
          ppp_structure_1?:
            | Database["public"]["Enums"]["ppp_structure_1"]
            | null;
          ppp_term?: Database["public"]["Enums"]["ppp_term"] | null;
          pricing_file_path?: string | null;
          pricing_file_url?: string | null;
          pricing_is_locked?: boolean;
          primary_guarantor_id?: number | null;
          project_type?: Database["public"]["Enums"]["project_type"] | null;
          property_id?: number | null;
          purchase_price?: number | null;
          recently_renovated?: Database["public"]["Enums"]["yes_no"] | null;
          recourse_type?: string | null;
          renovation_completed?: string | null;
          renovation_cost?: number | null;
          second_guarantor_id?: number | null;
          target_closing_date?: string | null;
          third_guarantor_id?: number | null;
          title_company_contact_id?: number | null;
          title_company_id?: number | null;
          title_file_number?: string | null;
          transaction_type?:
            | Database["public"]["Enums"]["transaction_type"]
            | null;
          updated_at?: string | null;
          vesting_type?: Database["public"]["Enums"]["vesting_type"] | null;
        };
        Update: {
          account_executive_id?: number | null;
          appraisal_poc_contact_id?: number | null;
          broker_company_id?: number | null;
          broker_id?: number | null;
          cash_out_purpose?: string | null;
          closing_agent_contact_id?: number | null;
          company_id?: number | null;
          construction_holdback?: number | null;
          cost_of_capital?: number | null;
          created_at?: string | null;
          date_of_purchase?: string | null;
          deal_disposition_1?:
            | Database["public"]["Enums"]["deal_disposition_1"]
            | null;
          deal_name?: string | null;
          deal_stage_1?: Database["public"]["Enums"]["deal_stage_1"] | null;
          deal_stage_2?: Database["public"]["Enums"]["deal_stage_2"] | null;
          deal_type?: Database["public"]["Enums"]["loan_type_1"] | null;
          declaration_1_lawsuits?: boolean | null;
          declaration_1_lawsuits_explanation?: string | null;
          declaration_2_bankruptcy?: boolean | null;
          declaration_2_bankruptcy_explanation?: string | null;
          declaration_3_felony?: boolean | null;
          declaration_3_felony_explanation?: string | null;
          declaration_5_license?: boolean | null;
          escrow_company_id?: number | null;
          escrow_contact_id?: number | null;
          fourth_guarantor_id?: number | null;
          funding_date?: string | null;
          guarantor_count?: number | null;
          guarantor_fico_score?: number | null;
          id?: number;
          insurance_carrier_company_id?: number | null;
          insurance_carrier_contact_id?: number | null;
          io_period?: number | null;
          lead_source_name?: string | null;
          lead_source_type?: Database["public"]["Enums"]["lead_source"] | null;
          loan_amount_initial?: number | null;
          loan_amount_total?: number | null;
          loan_buyer_company_id?: number | null;
          loan_buyer_contact_id?: number | null;
          loan_number?: string | null;
          loan_opener_id?: number | null;
          loan_processor_id?: number | null;
          loan_sale_date?: string | null;
          loan_structure_dscr?:
            | Database["public"]["Enums"]["loan_structure_dscr"]
            | null;
          loan_term?: Database["public"]["Enums"]["loan_term_months"] | null;
          loan_type_rtl?: Database["public"]["Enums"]["loan_type_2"] | null;
          ltv_after_repair?: number | null;
          ltv_asis?: number | null;
          mid_fico?: number | null;
          note_date?: string | null;
          note_rate?: number | null;
          payoff_mtg1_amount?: number | null;
          ppp_structure_1?:
            | Database["public"]["Enums"]["ppp_structure_1"]
            | null;
          ppp_term?: Database["public"]["Enums"]["ppp_term"] | null;
          pricing_file_path?: string | null;
          pricing_file_url?: string | null;
          pricing_is_locked?: boolean;
          primary_guarantor_id?: number | null;
          project_type?: Database["public"]["Enums"]["project_type"] | null;
          property_id?: number | null;
          purchase_price?: number | null;
          recently_renovated?: Database["public"]["Enums"]["yes_no"] | null;
          recourse_type?: string | null;
          renovation_completed?: string | null;
          renovation_cost?: number | null;
          second_guarantor_id?: number | null;
          target_closing_date?: string | null;
          third_guarantor_id?: number | null;
          title_company_contact_id?: number | null;
          title_company_id?: number | null;
          title_file_number?: string | null;
          transaction_type?:
            | Database["public"]["Enums"]["transaction_type"]
            | null;
          updated_at?: string | null;
          vesting_type?: Database["public"]["Enums"]["vesting_type"] | null;
        };
        Relationships: [
          {
            foreignKeyName: "deal_appraisal_poc_contact_id_fkey";
            columns: ["appraisal_poc_contact_id"];
            isOneToOne: false;
            referencedRelation: "contact";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "deal_broker_company_id_fkey";
            columns: ["broker_company_id"];
            isOneToOne: false;
            referencedRelation: "company";
            referencedColumns: ["co_id"];
          },
          {
            foreignKeyName: "deal_closing_agent_contact_id_fkey";
            columns: ["closing_agent_contact_id"];
            isOneToOne: false;
            referencedRelation: "contact";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "deal_escrow_company_id_fkey";
            columns: ["escrow_company_id"];
            isOneToOne: false;
            referencedRelation: "company";
            referencedColumns: ["co_id"];
          },
          {
            foreignKeyName: "deal_escrow_contact_id_fkey";
            columns: ["escrow_contact_id"];
            isOneToOne: false;
            referencedRelation: "contact";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "deal_fourth_guarantor_id_fkey";
            columns: ["fourth_guarantor_id"];
            isOneToOne: false;
            referencedRelation: "guarantor";
            referencedColumns: ["guarantor_id"];
          },
          {
            foreignKeyName: "deal_insurance_carrier_company_id_fkey";
            columns: ["insurance_carrier_company_id"];
            isOneToOne: false;
            referencedRelation: "company";
            referencedColumns: ["co_id"];
          },
          {
            foreignKeyName: "deal_insurance_carrier_contact_id_fkey";
            columns: ["insurance_carrier_contact_id"];
            isOneToOne: false;
            referencedRelation: "contact";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "deal_loan_buyer_company_id_fkey";
            columns: ["loan_buyer_company_id"];
            isOneToOne: false;
            referencedRelation: "company";
            referencedColumns: ["co_id"];
          },
          {
            foreignKeyName: "deal_loan_buyer_contact_id_fkey";
            columns: ["loan_buyer_contact_id"];
            isOneToOne: false;
            referencedRelation: "contact";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "deal_loan_opener_id_fkey";
            columns: ["loan_opener_id"];
            isOneToOne: false;
            referencedRelation: "auth_clerk_users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "deal_loan_processor_id_fkey";
            columns: ["loan_processor_id"];
            isOneToOne: false;
            referencedRelation: "auth_clerk_users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "deal_primary_guarantor_id_fkey";
            columns: ["primary_guarantor_id"];
            isOneToOne: false;
            referencedRelation: "guarantor";
            referencedColumns: ["guarantor_id"];
          },
          {
            foreignKeyName: "deal_second_guarantor_id_fkey";
            columns: ["second_guarantor_id"];
            isOneToOne: false;
            referencedRelation: "guarantor";
            referencedColumns: ["guarantor_id"];
          },
          {
            foreignKeyName: "deal_third_guarantor_id_fkey";
            columns: ["third_guarantor_id"];
            isOneToOne: false;
            referencedRelation: "guarantor";
            referencedColumns: ["guarantor_id"];
          },
          {
            foreignKeyName: "deal_title_company_id_fkey";
            columns: ["title_company_id"];
            isOneToOne: false;
            referencedRelation: "company";
            referencedColumns: ["co_id"];
          },
          {
            foreignKeyName: "public_deal_account_executive_id_fkey";
            columns: ["account_executive_id"];
            isOneToOne: false;
            referencedRelation: "auth_clerk_users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "public_deal_broker_id_fkey";
            columns: ["broker_id"];
            isOneToOne: false;
            referencedRelation: "contact";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "public_deal_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "company";
            referencedColumns: ["co_id"];
          },
          {
            foreignKeyName: "public_deal_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "property";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "public_deal_title_company_contact_id_fkey";
            columns: ["title_company_contact_id"];
            isOneToOne: false;
            referencedRelation: "contact";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      contact_type:
        | "Appraisal Administration"
        | "Appraisal Management Company"
        | "Appraiser"
        | "Borrower"
        | "Borrower Assistant"
        | "Broker"
        | "Broker Loan Processor"
        | "General Contractor"
        | "Entity Member"
        | "Escrow"
        | "Insurance"
        | "Balance Sheet Investor"
        | "Lender"
        | "Point of Contact"
        | "Referring Party"
        | "Title"
        | "Transaction Coordinator"
        | "Loan Buyer";
      deal_disposition_1: "active" | "dead" | "on_hold";
      deal_stage_1: "lead" | "scenario" | "deal";
      deal_stage_2:
        | "loan_setup"
        | "processing_1"
        | "appraisal_review"
        | "processing_2"
        | "qc_1"
        | "underwriting"
        | "conditionally_approved"
        | "qc_2"
        | "clear_to_close"
        | "closed_and_funded";
      lead_source:
        | "biggerpockets"
        | "broker"
        | "brrrr.com_chat"
        | "brrrr.com_form_submission"
        | "direct_mail_marketing"
        | "email_marketing"
        | "event_conference_tradeshow"
        | "existing_client"
        | "podcast"
        | "search_engine"
        | "referral"
        | "social_media"
        | "other"
        | "reia";
      loan_structure_dscr:
        | "30_yr_fixed"
        | "5/1_arm"
        | "7/1_arm"
        | "10/1_arm_io"
        | "5/6_arm"
        | "10/6_arm";
      loan_term_months:
        | "6"
        | "12"
        | "15"
        | "18"
        | "24"
        | "36"
        | "48"
        | "60"
        | "72"
        | "84"
        | "96"
        | "108"
        | "120"
        | "300"
        | "360";
      loan_type_1: "dscr" | "rtl";
      loan_type_2: "bridge" | "bridge_plus_rehab";
      ppp_structure_1: "declining" | "fixed" | "minimum_interest";
      ppp_term:
        | "0"
        | "12"
        | "24"
        | "36"
        | "48"
        | "60"
        | "72"
        | "84"
        | "96"
        | "108"
        | "120";
      project_type:
        | "fix_and_flip"
        | "ground_up"
        | "rental"
        | "stabilized_bridge";
      transaction_type:
        | "purchase"
        | "delayed_purchase"
        | "refinance_rate_term"
        | "refinance_cash_out";
      vesting_type: "entity" | "Individual";
      yes_no: "yes" | "no";
      appraisal_order_status:
        | "accepted_by_vendor"
        | "action_required"
        | "appraiser_waiting_for_contract"
        | "appraiser_waiting_for_lease"
        | "appraiser_waiting_for_questionnaire"
        | "assigned_to_vendor"
        | "awaiting_confirmation_for_appointment"
        | "awaiting_fee_approval_from_client"
        | "awaiting_info_from_client"
        | "awaiting_trip_fee_approval_to_proceed"
        | "cancelled"
        | "completed"
        | "declined_by_vendor"
        | "file_in_review"
        | "in_progress"
        | "inspected"
        | "inspection_scheduled"
        | "left_message_with_contact"
        | "on_hold"
        | "order_Is_due_today"
        | "payment_pending"
        | "please_submit_report_order_past_due"
        | "reconsideration_requested"
        | "reconsideration_requested_urgent"
        | "report_accepted"
        | "report_accepted_awaiting_payment"
        | "revision_requested"
        | "revision_requested_urgent"
        | "unassigned"
        | "unassigned_awaiting_bids";
      appraisal_order_type: "commercial" | "residential";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;
