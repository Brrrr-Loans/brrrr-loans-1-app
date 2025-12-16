export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      appraisal: {
        Row: {
          appraiser_id: number | null
          co_amc: number | null
          co_appraisal: number | null
          created_at: string
          date_amc_vendor_accept: string | null
          date_amc_vendor_assign: string | null
          date_inspection_completed: string | null
          date_inspection_scheduled: string | null
          date_report_effective: string | null
          date_report_expiration: string | null
          date_report_ordered: string | null
          date_report_received: string | null
          deal_id: number | null
          document_id: number | null
          file_number: string | null
          file_number_amc: string | null
          id: number
          order_status:
            | Database["public"]["Enums"]["appraisal_order_status"]
            | null
          order_type: Database["public"]["Enums"]["appraisal_order_type"] | null
          property_id: number | null
          updated_at: string | null
          value_conclusion_as_is: number | null
          value_conclusion_as_repaired: number | null
          value_conclusion_fair_market_rent: number | null
        }
        Insert: {
          appraiser_id?: number | null
          co_amc?: number | null
          co_appraisal?: number | null
          created_at?: string
          date_amc_vendor_accept?: string | null
          date_amc_vendor_assign?: string | null
          date_inspection_completed?: string | null
          date_inspection_scheduled?: string | null
          date_report_effective?: string | null
          date_report_expiration?: string | null
          date_report_ordered?: string | null
          date_report_received?: string | null
          deal_id?: number | null
          document_id?: number | null
          file_number?: string | null
          file_number_amc?: string | null
          id?: number
          order_status?:
            | Database["public"]["Enums"]["appraisal_order_status"]
            | null
          order_type?:
            | Database["public"]["Enums"]["appraisal_order_type"]
            | null
          property_id?: number | null
          updated_at?: string | null
          value_conclusion_as_is?: number | null
          value_conclusion_as_repaired?: number | null
          value_conclusion_fair_market_rent?: number | null
        }
        Update: {
          appraiser_id?: number | null
          co_amc?: number | null
          co_appraisal?: number | null
          created_at?: string
          date_amc_vendor_accept?: string | null
          date_amc_vendor_assign?: string | null
          date_inspection_completed?: string | null
          date_inspection_scheduled?: string | null
          date_report_effective?: string | null
          date_report_expiration?: string | null
          date_report_ordered?: string | null
          date_report_received?: string | null
          deal_id?: number | null
          document_id?: number | null
          file_number?: string | null
          file_number_amc?: string | null
          id?: number
          order_status?:
            | Database["public"]["Enums"]["appraisal_order_status"]
            | null
          order_type?:
            | Database["public"]["Enums"]["appraisal_order_type"]
            | null
          property_id?: number | null
          updated_at?: string | null
          value_conclusion_as_is?: number | null
          value_conclusion_as_repaired?: number | null
          value_conclusion_fair_market_rent?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "appraisal_appraiser_id_fkey"
            columns: ["appraiser_id"]
            isOneToOne: false
            referencedRelation: "contact"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appraisal_co_amc_fkey"
            columns: ["co_amc"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["co_id"]
          },
          {
            foreignKeyName: "appraisal_co_appraisal_fkey"
            columns: ["co_appraisal"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["co_id"]
          },
          {
            foreignKeyName: "appraisal_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appraisal_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "document_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appraisal_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property"
            referencedColumns: ["id"]
          },
        ]
      }
      auth_clerk_orgs: {
        Row: {
          clerk_org_id: string
          clerk_org_name: string
          clerk_org_slug: string
          created_at: string
          created_by_clerk_user_id: string
          id: number
          updated_at: string | null
        }
        Insert: {
          clerk_org_id: string
          clerk_org_name: string
          clerk_org_slug: string
          created_at?: string
          created_by_clerk_user_id: string
          id?: number
          updated_at?: string | null
        }
        Update: {
          clerk_org_id?: string
          clerk_org_name?: string
          clerk_org_slug?: string
          created_at?: string
          created_by_clerk_user_id?: string
          id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_clerk_orgs_created_by_clerk_user_id_fkey"
            columns: ["created_by_clerk_user_id"]
            isOneToOne: false
            referencedRelation: "auth_clerk_users"
            referencedColumns: ["clerk_user_id"]
          },
        ]
      }
      auth_clerk_orgs_members: {
        Row: {
          auth_clerk_users_id: number | null
          clerk_org_id: number
          clerk_org_role: Database["public"]["Enums"]["clerk_org_role"]
          created_at: string
          id: number
        }
        Insert: {
          auth_clerk_users_id?: number | null
          clerk_org_id: number
          clerk_org_role?: Database["public"]["Enums"]["clerk_org_role"]
          created_at?: string
          id?: number
        }
        Update: {
          auth_clerk_users_id?: number | null
          clerk_org_id?: number
          clerk_org_role?: Database["public"]["Enums"]["clerk_org_role"]
          created_at?: string
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "auth_clerk_orgs_members_auth_clerk_users_id_fkey"
            columns: ["auth_clerk_users_id"]
            isOneToOne: false
            referencedRelation: "auth_clerk_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auth_clerk_orgs_members_clerk_org_fkey_fkey"
            columns: ["clerk_org_id"]
            isOneToOne: false
            referencedRelation: "auth_clerk_orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      auth_clerk_users: {
        Row: {
          activated_date: string | null
          avatar_url: string | null
          cell_phone: string | null
          clerk_user_id: string | null
          clerk_username: string | null
          contact_id: number | null
          create_organization_enabled: boolean | null
          deactivation_date: string | null
          delete_self_enabled: boolean | null
          email: string | null
          email_verified: boolean | null
          email_verified_at: string | null
          first_name: string | null
          full_name: string | null
          has_image: boolean | null
          id: number
          image_url: string | null
          invitation_date: string | null
          is_active_yn: boolean | null
          is_banned: boolean | null
          is_internal_yn: boolean
          is_locked: boolean | null
          last_active_at: string | null
          last_name: string | null
          last_sign_in_at: string | null
          legal_accepted_at: string | null
          office_phone: string | null
          office_phone_extension: string | null
          phone_number: string | null
          role: Database["public"]["Enums"]["user_role_internal"] | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          activated_date?: string | null
          avatar_url?: string | null
          cell_phone?: string | null
          clerk_user_id?: string | null
          clerk_username?: string | null
          contact_id?: number | null
          create_organization_enabled?: boolean | null
          deactivation_date?: string | null
          delete_self_enabled?: boolean | null
          email?: string | null
          email_verified?: boolean | null
          email_verified_at?: string | null
          first_name?: string | null
          full_name?: string | null
          has_image?: boolean | null
          id?: number
          image_url?: string | null
          invitation_date?: string | null
          is_active_yn?: boolean | null
          is_banned?: boolean | null
          is_internal_yn?: boolean
          is_locked?: boolean | null
          last_active_at?: string | null
          last_name?: string | null
          last_sign_in_at?: string | null
          legal_accepted_at?: string | null
          office_phone?: string | null
          office_phone_extension?: string | null
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role_internal"] | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          activated_date?: string | null
          avatar_url?: string | null
          cell_phone?: string | null
          clerk_user_id?: string | null
          clerk_username?: string | null
          contact_id?: number | null
          create_organization_enabled?: boolean | null
          deactivation_date?: string | null
          delete_self_enabled?: boolean | null
          email?: string | null
          email_verified?: boolean | null
          email_verified_at?: string | null
          first_name?: string | null
          full_name?: string | null
          has_image?: boolean | null
          id?: number
          image_url?: string | null
          invitation_date?: string | null
          is_active_yn?: boolean | null
          is_banned?: boolean | null
          is_internal_yn?: boolean
          is_locked?: boolean | null
          last_active_at?: string | null
          last_name?: string | null
          last_sign_in_at?: string | null
          legal_accepted_at?: string | null
          office_phone?: string | null
          office_phone_extension?: string | null
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role_internal"] | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profile_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contact"
            referencedColumns: ["id"]
          },
        ]
      }
      borrower: {
        Row: {
          cell_phone: string | null
          citizenship: Database["public"]["Enums"]["citizenship"] | null
          created_at: string | null
          credit_check:
            | Database["public"]["Enums"]["credit_check_status"]
            | null
          date_of_birth: string | null
          email_address: string | null
          exp_flips_sold: number | null
          exp_ground_ups_sold: number | null
          exp_professional_license:
            | Database["public"]["Enums"]["professional_license"]
            | null
          exp_rentals_owned: number | null
          fico_report_date_expiration: string | null
          fico_report_date_pulled: string | null
          fico_report_score_equifax: number | null
          fico_report_score_experian: number | null
          fico_report_score_transunion: number | null
          fico_score_mid_actual: number | null
          fico_score_mid_estimate: number | null
          first_name: string | null
          first_time_home_buyer: Database["public"]["Enums"]["yes_no"] | null
          has_experience: Database["public"]["Enums"]["yes_no"] | null
          home_phone: string | null
          id: number
          last_name: string | null
          mailing_address_city: string | null
          mailing_address_country: string | null
          mailing_address_is_primary_residence: boolean | null
          mailing_address_po_box: string | null
          mailing_address_postal_code: string | null
          mailing_address_state: Database["public"]["Enums"]["us_states"] | null
          mailing_address_state_long:
            | Database["public"]["Enums"]["us_states_long"]
            | null
          mailing_address_street: string | null
          mailing_address_suite_apt: string | null
          marital_status: Database["public"]["Enums"]["marital_status"] | null
          middle_name: string | null
          mortgage_debt: number | null
          name: string | null
          office_phone: string | null
          previous_residence_address_city: string | null
          previous_residence_address_country: string | null
          previous_residence_address_postal_code: string | null
          previous_residence_address_state:
            | Database["public"]["Enums"]["us_states"]
            | null
          previous_residence_address_state_long:
            | Database["public"]["Enums"]["us_states_long"]
            | null
          previous_residence_address_street: string | null
          previous_residence_address_suite_apt: string | null
          previous_residence_occupancy_end_date: string | null
          previous_residence_occupancy_start_date: string | null
          primary_residence_address_city: string | null
          primary_residence_address_country: string | null
          primary_residence_address_county: string | null
          primary_residence_address_postal_code: string | null
          primary_residence_address_state:
            | Database["public"]["Enums"]["us_states"]
            | null
          primary_residence_address_state_long:
            | Database["public"]["Enums"]["us_states_long"]
            | null
          primary_residence_address_street: string | null
          primary_residence_address_suite_apt: string | null
          primary_residence_occupancy_start_date: string | null
          primary_residence_ownership:
            | Database["public"]["Enums"]["residence_ownership"]
            | null
          social_security_number: string | null
          updated_at: string | null
        }
        Insert: {
          cell_phone?: string | null
          citizenship?: Database["public"]["Enums"]["citizenship"] | null
          created_at?: string | null
          credit_check?:
            | Database["public"]["Enums"]["credit_check_status"]
            | null
          date_of_birth?: string | null
          email_address?: string | null
          exp_flips_sold?: number | null
          exp_ground_ups_sold?: number | null
          exp_professional_license?:
            | Database["public"]["Enums"]["professional_license"]
            | null
          exp_rentals_owned?: number | null
          fico_report_date_expiration?: string | null
          fico_report_date_pulled?: string | null
          fico_report_score_equifax?: number | null
          fico_report_score_experian?: number | null
          fico_report_score_transunion?: number | null
          fico_score_mid_actual?: number | null
          fico_score_mid_estimate?: number | null
          first_name?: string | null
          first_time_home_buyer?: Database["public"]["Enums"]["yes_no"] | null
          has_experience?: Database["public"]["Enums"]["yes_no"] | null
          home_phone?: string | null
          id?: number
          last_name?: string | null
          mailing_address_city?: string | null
          mailing_address_country?: string | null
          mailing_address_is_primary_residence?: boolean | null
          mailing_address_po_box?: string | null
          mailing_address_postal_code?: string | null
          mailing_address_state?:
            | Database["public"]["Enums"]["us_states"]
            | null
          mailing_address_state_long?:
            | Database["public"]["Enums"]["us_states_long"]
            | null
          mailing_address_street?: string | null
          mailing_address_suite_apt?: string | null
          marital_status?: Database["public"]["Enums"]["marital_status"] | null
          middle_name?: string | null
          mortgage_debt?: number | null
          name?: string | null
          office_phone?: string | null
          previous_residence_address_city?: string | null
          previous_residence_address_country?: string | null
          previous_residence_address_postal_code?: string | null
          previous_residence_address_state?:
            | Database["public"]["Enums"]["us_states"]
            | null
          previous_residence_address_state_long?:
            | Database["public"]["Enums"]["us_states_long"]
            | null
          previous_residence_address_street?: string | null
          previous_residence_address_suite_apt?: string | null
          previous_residence_occupancy_end_date?: string | null
          previous_residence_occupancy_start_date?: string | null
          primary_residence_address_city?: string | null
          primary_residence_address_country?: string | null
          primary_residence_address_county?: string | null
          primary_residence_address_postal_code?: string | null
          primary_residence_address_state?:
            | Database["public"]["Enums"]["us_states"]
            | null
          primary_residence_address_state_long?:
            | Database["public"]["Enums"]["us_states_long"]
            | null
          primary_residence_address_street?: string | null
          primary_residence_address_suite_apt?: string | null
          primary_residence_occupancy_start_date?: string | null
          primary_residence_ownership?:
            | Database["public"]["Enums"]["residence_ownership"]
            | null
          social_security_number?: string | null
          updated_at?: string | null
        }
        Update: {
          cell_phone?: string | null
          citizenship?: Database["public"]["Enums"]["citizenship"] | null
          created_at?: string | null
          credit_check?:
            | Database["public"]["Enums"]["credit_check_status"]
            | null
          date_of_birth?: string | null
          email_address?: string | null
          exp_flips_sold?: number | null
          exp_ground_ups_sold?: number | null
          exp_professional_license?:
            | Database["public"]["Enums"]["professional_license"]
            | null
          exp_rentals_owned?: number | null
          fico_report_date_expiration?: string | null
          fico_report_date_pulled?: string | null
          fico_report_score_equifax?: number | null
          fico_report_score_experian?: number | null
          fico_report_score_transunion?: number | null
          fico_score_mid_actual?: number | null
          fico_score_mid_estimate?: number | null
          first_name?: string | null
          first_time_home_buyer?: Database["public"]["Enums"]["yes_no"] | null
          has_experience?: Database["public"]["Enums"]["yes_no"] | null
          home_phone?: string | null
          id?: number
          last_name?: string | null
          mailing_address_city?: string | null
          mailing_address_country?: string | null
          mailing_address_is_primary_residence?: boolean | null
          mailing_address_po_box?: string | null
          mailing_address_postal_code?: string | null
          mailing_address_state?:
            | Database["public"]["Enums"]["us_states"]
            | null
          mailing_address_state_long?:
            | Database["public"]["Enums"]["us_states_long"]
            | null
          mailing_address_street?: string | null
          mailing_address_suite_apt?: string | null
          marital_status?: Database["public"]["Enums"]["marital_status"] | null
          middle_name?: string | null
          mortgage_debt?: number | null
          name?: string | null
          office_phone?: string | null
          previous_residence_address_city?: string | null
          previous_residence_address_country?: string | null
          previous_residence_address_postal_code?: string | null
          previous_residence_address_state?:
            | Database["public"]["Enums"]["us_states"]
            | null
          previous_residence_address_state_long?:
            | Database["public"]["Enums"]["us_states_long"]
            | null
          previous_residence_address_street?: string | null
          previous_residence_address_suite_apt?: string | null
          previous_residence_occupancy_end_date?: string | null
          previous_residence_occupancy_start_date?: string | null
          primary_residence_address_city?: string | null
          primary_residence_address_country?: string | null
          primary_residence_address_county?: string | null
          primary_residence_address_postal_code?: string | null
          primary_residence_address_state?:
            | Database["public"]["Enums"]["us_states"]
            | null
          primary_residence_address_state_long?:
            | Database["public"]["Enums"]["us_states_long"]
            | null
          primary_residence_address_street?: string | null
          primary_residence_address_suite_apt?: string | null
          primary_residence_occupancy_start_date?: string | null
          primary_residence_ownership?:
            | Database["public"]["Enums"]["residence_ownership"]
            | null
          social_security_number?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      bs_debt_instruments: {
        Row: {
          created_at: string
          deal_id: number
          id: number
          instrument_type: Database["public"]["Enums"]["debt_instrument_type"]
          target_yield_pct: number | null
        }
        Insert: {
          created_at?: string
          deal_id: number
          id?: number
          instrument_type: Database["public"]["Enums"]["debt_instrument_type"]
          target_yield_pct?: number | null
        }
        Update: {
          created_at?: string
          deal_id?: number
          id?: number
          instrument_type?: Database["public"]["Enums"]["debt_instrument_type"]
          target_yield_pct?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bs_debt_instruments_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deal"
            referencedColumns: ["id"]
          },
        ]
      }
      bs_debt_instruments_deals: {
        Row: {
          deal_id: number
          id: number
          instrument_id: number
        }
        Insert: {
          deal_id: number
          id?: number
          instrument_id: number
        }
        Update: {
          deal_id?: number
          id?: number
          instrument_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "bs_debt_instruments_deals_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bs_debt_instruments_deals_instrument_id_fkey"
            columns: ["instrument_id"]
            isOneToOne: false
            referencedRelation: "bs_debt_instruments"
            referencedColumns: ["id"]
          },
        ]
      }
      bsi_deals: {
        Row: {
          auth_clerk_users_id: number | null
          deal_id: number
          id: number
        }
        Insert: {
          auth_clerk_users_id?: number | null
          deal_id: number
          id?: number
        }
        Update: {
          auth_clerk_users_id?: number | null
          deal_id?: number
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "bsi_deals_auth_clerk_users_id_fkey"
            columns: ["auth_clerk_users_id"]
            isOneToOne: false
            referencedRelation: "auth_clerk_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bsi_deals_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deal"
            referencedColumns: ["id"]
          },
        ]
      }
      bsi_deals_orgs: {
        Row: {
          clerk_org_id: number
          deal_id: number
          id: number
        }
        Insert: {
          clerk_org_id: number
          deal_id: number
          id?: number
        }
        Update: {
          clerk_org_id?: number
          deal_id?: number
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "bsi_deals_orgs_clerk_org_id_fkey"
            columns: ["clerk_org_id"]
            isOneToOne: false
            referencedRelation: "auth_clerk_orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bsi_deals_orgs_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "bsi_deals"
            referencedColumns: ["id"]
          },
        ]
      }
      bsi_distributions: {
        Row: {
          bsi_contact_id: number | null
          capital_contribution: number
          clerk_org_id: number | null
          clerk_org_member_id: number | null
          created_at: string | null
          deal_id: number | null
          deposit_amount: number
          id: number
          instrument_id: number | null
          interest_amount: number
          loan_amount_snapshot: number
          notes: string | null
          principal_amount: number
          rate_of_return_pct: number
          servicing_fee: number
          statement_id: string
          upb_close: number | null
          updated_at: string | null
          user_id: number | null
          wire_fee: number
        }
        Insert: {
          bsi_contact_id?: number | null
          capital_contribution: number
          clerk_org_id?: number | null
          clerk_org_member_id?: number | null
          created_at?: string | null
          deal_id?: number | null
          deposit_amount: number
          id?: number
          instrument_id?: number | null
          interest_amount: number
          loan_amount_snapshot: number
          notes?: string | null
          principal_amount: number
          rate_of_return_pct: number
          servicing_fee?: number
          statement_id: string
          upb_close?: number | null
          updated_at?: string | null
          user_id?: number | null
          wire_fee?: number
        }
        Update: {
          bsi_contact_id?: number | null
          capital_contribution?: number
          clerk_org_id?: number | null
          clerk_org_member_id?: number | null
          created_at?: string | null
          deal_id?: number | null
          deposit_amount?: number
          id?: number
          instrument_id?: number | null
          interest_amount?: number
          loan_amount_snapshot?: number
          notes?: string | null
          principal_amount?: number
          rate_of_return_pct?: number
          servicing_fee?: number
          statement_id?: string
          upb_close?: number | null
          updated_at?: string | null
          user_id?: number | null
          wire_fee?: number
        }
        Relationships: [
          {
            foreignKeyName: "bsi_distributions_bsi_contact_id_fkey"
            columns: ["bsi_contact_id"]
            isOneToOne: false
            referencedRelation: "contact"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bsi_distributions_clerk_org_id_fkey"
            columns: ["clerk_org_id"]
            isOneToOne: false
            referencedRelation: "auth_clerk_orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bsi_distributions_clerk_org_member_id_fkey"
            columns: ["clerk_org_member_id"]
            isOneToOne: false
            referencedRelation: "auth_clerk_orgs_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bsi_distributions_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bsi_distributions_instrument_id_fkey"
            columns: ["instrument_id"]
            isOneToOne: false
            referencedRelation: "bs_debt_instruments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bsi_distributions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "auth_clerk_users"
            referencedColumns: ["id"]
          },
        ]
      }
      bsi_statements: {
        Row: {
          auth_clerk_users_id: number | null
          clerk_org_id: number | null
          created_at: string
          deposit_amount: number | null
          id: number
          statement_date: string
          statement_period_end: string
          statement_period_start: string
          total_fees: number
          total_interest: number
          total_principal: number | null
          total_upb_close: number
          total_upb_open: number
        }
        Insert: {
          auth_clerk_users_id?: number | null
          clerk_org_id?: number | null
          created_at?: string
          deposit_amount?: number | null
          id: number
          statement_date: string
          statement_period_end: string
          statement_period_start: string
          total_fees: number
          total_interest: number
          total_principal?: number | null
          total_upb_close: number
          total_upb_open: number
        }
        Update: {
          auth_clerk_users_id?: number | null
          clerk_org_id?: number | null
          created_at?: string
          deposit_amount?: number | null
          id?: number
          statement_date?: string
          statement_period_end?: string
          statement_period_start?: string
          total_fees?: number
          total_interest?: number
          total_principal?: number | null
          total_upb_close?: number
          total_upb_open?: number
        }
        Relationships: [
          {
            foreignKeyName: "bsi_statements_auth_clerk_users_id_fkey"
            columns: ["auth_clerk_users_id"]
            isOneToOne: false
            referencedRelation: "auth_clerk_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bsi_statements_clerk_org_id_fkey"
            columns: ["clerk_org_id"]
            isOneToOne: false
            referencedRelation: "auth_clerk_orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      bsi_transactions: {
        Row: {
          clerk_id: string | null
          clerk_org_id: number | null
          clerk_organization_id: string | null
          created_at: string | null
          deal_id: number | null
          id: number
          instrument_id: number | null
          investor_id: number | null
          ledger_entry_type: Database["public"]["Enums"]["ledger_entry_type"]
          notes: string | null
          reference_number: string | null
          reference_type:
            | Database["public"]["Enums"]["transaction_reference_type"]
            | null
          transaction_amount: number | null
          transaction_date: string
          transaction_method:
            | Database["public"]["Enums"]["transaction_method"]
            | null
          transaction_status:
            | Database["public"]["Enums"]["transaction_status"]
            | null
          updated_at: string | null
        }
        Insert: {
          clerk_id?: string | null
          clerk_org_id?: number | null
          clerk_organization_id?: string | null
          created_at?: string | null
          deal_id?: number | null
          id?: number
          instrument_id?: number | null
          investor_id?: number | null
          ledger_entry_type?: Database["public"]["Enums"]["ledger_entry_type"]
          notes?: string | null
          reference_number?: string | null
          reference_type?:
            | Database["public"]["Enums"]["transaction_reference_type"]
            | null
          transaction_amount?: number | null
          transaction_date?: string
          transaction_method?:
            | Database["public"]["Enums"]["transaction_method"]
            | null
          transaction_status?:
            | Database["public"]["Enums"]["transaction_status"]
            | null
          updated_at?: string | null
        }
        Update: {
          clerk_id?: string | null
          clerk_org_id?: number | null
          clerk_organization_id?: string | null
          created_at?: string | null
          deal_id?: number | null
          id?: number
          instrument_id?: number | null
          investor_id?: number | null
          ledger_entry_type?: Database["public"]["Enums"]["ledger_entry_type"]
          notes?: string | null
          reference_number?: string | null
          reference_type?:
            | Database["public"]["Enums"]["transaction_reference_type"]
            | null
          transaction_amount?: number | null
          transaction_date?: string
          transaction_method?:
            | Database["public"]["Enums"]["transaction_method"]
            | null
          transaction_status?:
            | Database["public"]["Enums"]["transaction_status"]
            | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bsi_transactions_clerk_org_id_fkey"
            columns: ["clerk_org_id"]
            isOneToOne: false
            referencedRelation: "auth_clerk_orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      bsi_transactions_references: {
        Row: {
          id: number
          reference_type: Database["public"]["Enums"]["transaction_reference_type"]
          reference_value: string
          transaction_id: number
        }
        Insert: {
          id: number
          reference_type: Database["public"]["Enums"]["transaction_reference_type"]
          reference_value: string
          transaction_id: number
        }
        Update: {
          id?: number
          reference_type?: Database["public"]["Enums"]["transaction_reference_type"]
          reference_value?: string
          transaction_id?: number
        }
        Relationships: []
      }
      cba_requests: {
        Row: {
          completed_at: string | null
          deal_id: number | null
          id: number
          submitted_at: string
          submitted_by: number
          uw_prequal_result_background: number | null
          uw_prequal_result_credit: number | null
        }
        Insert: {
          completed_at?: string | null
          deal_id?: number | null
          id?: number
          submitted_at?: string
          submitted_by: number
          uw_prequal_result_background?: number | null
          uw_prequal_result_credit?: number | null
        }
        Update: {
          completed_at?: string | null
          deal_id?: number | null
          id?: number
          submitted_at?: string
          submitted_by?: number
          uw_prequal_result_background?: number | null
          uw_prequal_result_credit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cba_submission_credit_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cba_submission_credit_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "auth_clerk_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cba_submission_credit_uw_prequal_result_background_fkey"
            columns: ["uw_prequal_result_background"]
            isOneToOne: false
            referencedRelation: "select_uw_outcomes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cba_submission_credit_uw_prequal_result_credit_fkey"
            columns: ["uw_prequal_result_credit"]
            isOneToOne: false
            referencedRelation: "select_uw_outcomes"
            referencedColumns: ["id"]
          },
        ]
      }
      cba_requests_guarantors: {
        Row: {
          cba_request_id: number
          created_at: string
          guarantor_id: number
        }
        Insert: {
          cba_request_id: number
          created_at?: string
          guarantor_id: number
        }
        Update: {
          cba_request_id?: number
          created_at?: string
          guarantor_id?: number
        }
        Relationships: []
      }
      company: {
        Row: {
          co_bank_account_balance: number | null
          co_bank_of_business_account: string | null
          co_date_established: string | null
          co_ein: string | null
          co_entity_type: Database["public"]["Enums"]["entity_type"] | null
          co_fax: string | null
          co_id: number
          co_logo: string | null
          co_name: string | null
          co_phone: string | null
          co_ppb_address_city: string | null
          co_ppb_address_country:
            | Database["public"]["Enums"]["country_enum"]
            | null
          co_ppb_address_postal_code: string | null
          co_ppb_address_state: Database["public"]["Enums"]["us_states"] | null
          co_ppb_address_state_long:
            | Database["public"]["Enums"]["us_states_long"]
            | null
          co_ppb_address_street: string | null
          co_ppb_address_suite_apt: string | null
          co_role: Database["public"]["Enums"]["company_role"] | null
          co_state_of_formation: Database["public"]["Enums"]["us_states"] | null
          co_state_of_formation_long:
            | Database["public"]["Enums"]["us_states_long"]
            | null
          co_website: string | null
          created_at: string | null
          primary_guarantor_id: number | null
          updated_at: string | null
        }
        Insert: {
          co_bank_account_balance?: number | null
          co_bank_of_business_account?: string | null
          co_date_established?: string | null
          co_ein?: string | null
          co_entity_type?: Database["public"]["Enums"]["entity_type"] | null
          co_fax?: string | null
          co_id?: number
          co_logo?: string | null
          co_name?: string | null
          co_phone?: string | null
          co_ppb_address_city?: string | null
          co_ppb_address_country?:
            | Database["public"]["Enums"]["country_enum"]
            | null
          co_ppb_address_postal_code?: string | null
          co_ppb_address_state?: Database["public"]["Enums"]["us_states"] | null
          co_ppb_address_state_long?:
            | Database["public"]["Enums"]["us_states_long"]
            | null
          co_ppb_address_street?: string | null
          co_ppb_address_suite_apt?: string | null
          co_role?: Database["public"]["Enums"]["company_role"] | null
          co_state_of_formation?:
            | Database["public"]["Enums"]["us_states"]
            | null
          co_state_of_formation_long?:
            | Database["public"]["Enums"]["us_states_long"]
            | null
          co_website?: string | null
          created_at?: string | null
          primary_guarantor_id?: number | null
          updated_at?: string | null
        }
        Update: {
          co_bank_account_balance?: number | null
          co_bank_of_business_account?: string | null
          co_date_established?: string | null
          co_ein?: string | null
          co_entity_type?: Database["public"]["Enums"]["entity_type"] | null
          co_fax?: string | null
          co_id?: number
          co_logo?: string | null
          co_name?: string | null
          co_phone?: string | null
          co_ppb_address_city?: string | null
          co_ppb_address_country?:
            | Database["public"]["Enums"]["country_enum"]
            | null
          co_ppb_address_postal_code?: string | null
          co_ppb_address_state?: Database["public"]["Enums"]["us_states"] | null
          co_ppb_address_state_long?:
            | Database["public"]["Enums"]["us_states_long"]
            | null
          co_ppb_address_street?: string | null
          co_ppb_address_suite_apt?: string | null
          co_role?: Database["public"]["Enums"]["company_role"] | null
          co_state_of_formation?:
            | Database["public"]["Enums"]["us_states"]
            | null
          co_state_of_formation_long?:
            | Database["public"]["Enums"]["us_states_long"]
            | null
          co_website?: string | null
          created_at?: string | null
          primary_guarantor_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_primary_guarantor_id_fkey"
            columns: ["primary_guarantor_id"]
            isOneToOne: false
            referencedRelation: "company_member"
            referencedColumns: ["member_id"]
          },
        ]
      }
      company_contact: {
        Row: {
          co_id: number | null
          contact_id: number | null
          deal_id: number | null
          id: number
        }
        Insert: {
          co_id?: number | null
          contact_id?: number | null
          deal_id?: number | null
          id?: number
        }
        Update: {
          co_id?: number | null
          contact_id?: number | null
          deal_id?: number | null
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "company_contact_co_id_fkey"
            columns: ["co_id"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["co_id"]
          },
          {
            foreignKeyName: "company_contact_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contact"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_contact_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deal"
            referencedColumns: ["id"]
          },
        ]
      }
      company_member: {
        Row: {
          member_borrower_id: number | null
          member_company_id: number | null
          member_created_at: string | null
          member_id: number
          member_is_guarantor: Database["public"]["Enums"]["yes_no"] | null
          member_name_first: string | null
          member_name_last: string | null
          member_ownership_percentage: number | null
          member_owning_company_id: number | null
          member_title: string | null
          member_type: Database["public"]["Enums"]["vesting_type"] | null
          member_updated_at: string | null
        }
        Insert: {
          member_borrower_id?: number | null
          member_company_id?: number | null
          member_created_at?: string | null
          member_id?: number
          member_is_guarantor?: Database["public"]["Enums"]["yes_no"] | null
          member_name_first?: string | null
          member_name_last?: string | null
          member_ownership_percentage?: number | null
          member_owning_company_id?: number | null
          member_title?: string | null
          member_type?: Database["public"]["Enums"]["vesting_type"] | null
          member_updated_at?: string | null
        }
        Update: {
          member_borrower_id?: number | null
          member_company_id?: number | null
          member_created_at?: string | null
          member_id?: number
          member_is_guarantor?: Database["public"]["Enums"]["yes_no"] | null
          member_name_first?: string | null
          member_name_last?: string | null
          member_ownership_percentage?: number | null
          member_owning_company_id?: number | null
          member_title?: string | null
          member_type?: Database["public"]["Enums"]["vesting_type"] | null
          member_updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_member_member_borrower_id_fkey"
            columns: ["member_borrower_id"]
            isOneToOne: false
            referencedRelation: "borrower"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_member_member_company_id_fkey"
            columns: ["member_company_id"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["co_id"]
          },
          {
            foreignKeyName: "company_member_member_owning_company_id_fkey"
            columns: ["member_owning_company_id"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["co_id"]
          },
        ]
      }
      company_roles: {
        Row: {
          co_id: number
          deal_id: number | null
          id: number
          role_id: number
        }
        Insert: {
          co_id: number
          deal_id?: number | null
          id?: number
          role_id: number
        }
        Update: {
          co_id?: number
          deal_id?: number | null
          id?: number
          role_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "company_roles_co_id_fkey"
            columns: ["co_id"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["co_id"]
          },
          {
            foreignKeyName: "company_roles_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "company_roles_defined"
            referencedColumns: ["id"]
          },
        ]
      }
      company_roles_defined: {
        Row: {
          co_role: Database["public"]["Enums"]["company_role"]
          created_at: string
          deal_id: number | null
          description: string | null
          id: number
          updated_at: string | null
        }
        Insert: {
          co_role: Database["public"]["Enums"]["company_role"]
          created_at?: string
          deal_id?: number | null
          description?: string | null
          id?: number
          updated_at?: string | null
        }
        Update: {
          co_role?: Database["public"]["Enums"]["company_role"]
          created_at?: string
          deal_id?: number | null
          description?: string | null
          id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_role_mm_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deal"
            referencedColumns: ["id"]
          },
        ]
      }
      constants: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          id: number
          name: string | null
          numeric_value: number | null
          text_value: string | null
          type: Database["public"]["Enums"]["constant_types"] | null
          updated_at: string | null
          yes_no_value: Database["public"]["Enums"]["yes_no"] | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: number
          name?: string | null
          numeric_value?: number | null
          text_value?: string | null
          type?: Database["public"]["Enums"]["constant_types"] | null
          updated_at?: string | null
          yes_no_value?: Database["public"]["Enums"]["yes_no"] | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: number
          name?: string | null
          numeric_value?: number | null
          text_value?: string | null
          type?: Database["public"]["Enums"]["constant_types"] | null
          updated_at?: string | null
          yes_no_value?: Database["public"]["Enums"]["yes_no"] | null
        }
        Relationships: []
      }
      contact: {
        Row: {
          cell_phone: string | null
          company_id: number | null
          contact_type: Database["public"]["Enums"]["contact_type"] | null
          contact_types: Database["public"]["Enums"]["contact_type"][] | null
          created_at: string | null
          email_address: string | null
          first_name: string | null
          home_phone: string | null
          id: number
          last_name: string | null
          middle_name: string | null
          name: string | null
          office_phone: string | null
          portal_access: boolean | null
          profile_picture: string | null
          updated_at: string | null
          user_id: number | null
        }
        Insert: {
          cell_phone?: string | null
          company_id?: number | null
          contact_type?: Database["public"]["Enums"]["contact_type"] | null
          contact_types?: Database["public"]["Enums"]["contact_type"][] | null
          created_at?: string | null
          email_address?: string | null
          first_name?: string | null
          home_phone?: string | null
          id?: number
          last_name?: string | null
          middle_name?: string | null
          name?: string | null
          office_phone?: string | null
          portal_access?: boolean | null
          profile_picture?: string | null
          updated_at?: string | null
          user_id?: number | null
        }
        Update: {
          cell_phone?: string | null
          company_id?: number | null
          contact_type?: Database["public"]["Enums"]["contact_type"] | null
          contact_types?: Database["public"]["Enums"]["contact_type"][] | null
          created_at?: string | null
          email_address?: string | null
          first_name?: string | null
          home_phone?: string | null
          id?: number
          last_name?: string | null
          middle_name?: string | null
          name?: string | null
          office_phone?: string | null
          portal_access?: boolean | null
          profile_picture?: string | null
          updated_at?: string | null
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["co_id"]
          },
          {
            foreignKeyName: "contact_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "auth_clerk_users"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_types: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id?: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      contact_types_jt: {
        Row: {
          contact_id: number | null
          contact_types_id: number | null
          id: number
        }
        Insert: {
          contact_id?: number | null
          contact_types_id?: number | null
          id?: number
        }
        Update: {
          contact_id?: number | null
          contact_types_id?: number | null
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "public_contact_contact_types_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contact"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_contact_contact_types_contact_types_id_fkey"
            columns: ["contact_types_id"]
            isOneToOne: false
            referencedRelation: "contact_types"
            referencedColumns: ["id"]
          },
        ]
      }
      countries: {
        Row: {
          continent: Database["public"]["Enums"]["continents"] | null
          id: number
          iso2: string
          iso3: string | null
          local_name: string | null
          name: string | null
        }
        Insert: {
          continent?: Database["public"]["Enums"]["continents"] | null
          id?: number
          iso2: string
          iso3?: string | null
          local_name?: string | null
          name?: string | null
        }
        Update: {
          continent?: Database["public"]["Enums"]["continents"] | null
          id?: number
          iso2?: string
          iso3?: string | null
          local_name?: string | null
          name?: string | null
        }
        Relationships: []
      }
      custom_loan_fees: {
        Row: {
          created_at: string
          deal_id: number
          fee_amount: number | null
          fee_category: Database["public"]["Enums"]["fee_type"] | null
          fee_description: string | null
          id: number
        }
        Insert: {
          created_at?: string
          deal_id: number
          fee_amount?: number | null
          fee_category?: Database["public"]["Enums"]["fee_type"] | null
          fee_description?: string | null
          id?: number
        }
        Update: {
          created_at?: string
          deal_id?: number
          fee_amount?: number | null
          fee_category?: Database["public"]["Enums"]["fee_type"] | null
          fee_description?: string | null
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "public_custom_loan_fees_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deal"
            referencedColumns: ["id"]
          },
        ]
      }
      deal: {
        Row: {
          account_executive_id: number | null
          appraisal_poc_contact_id: number | null
          broker_company_id: number | null
          broker_id: number | null
          cash_out_purpose: string | null
          closing_agent_contact_id: number | null
          company_id: number | null
          construction_holdback: number | null
          cost_of_capital: number | null
          created_at: string | null
          date_of_purchase: string | null
          deal_disposition_1:
            | Database["public"]["Enums"]["deal_disposition_1"]
            | null
          deal_name: string | null
          deal_stage_1: Database["public"]["Enums"]["deal_stage_1"] | null
          deal_stage_2: Database["public"]["Enums"]["deal_stage_2"] | null
          deal_type: Database["public"]["Enums"]["loan_type_1"] | null
          declaration_1_lawsuits: boolean | null
          declaration_1_lawsuits_explanation: string | null
          declaration_2_bankruptcy: boolean | null
          declaration_2_bankruptcy_explanation: string | null
          declaration_3_felony: boolean | null
          declaration_3_felony_explanation: string | null
          declaration_5_license: boolean | null
          escrow_company_id: number | null
          escrow_contact_id: number | null
          fourth_guarantor_id: number | null
          funding_date: string | null
          guarantor_count: number | null
          guarantor_fico_score: number | null
          id: number
          insurance_carrier_company_id: number | null
          insurance_carrier_contact_id: number | null
          io_period: number | null
          lead_source_name: string | null
          lead_source_type: Database["public"]["Enums"]["lead_source"] | null
          loan_amount_initial: number | null
          loan_amount_total: number | null
          loan_buyer_company_id: number | null
          loan_buyer_contact_id: number | null
          loan_number: string
          loan_opener_id: number | null
          loan_processor_id: number | null
          loan_sale_date: string | null
          loan_structure_dscr:
            | Database["public"]["Enums"]["loan_structure_dscr"]
            | null
          loan_term: Database["public"]["Enums"]["loan_term_months"] | null
          loan_type_rtl: Database["public"]["Enums"]["loan_type_2"] | null
          ltv_after_repair: number | null
          ltv_asis: number | null
          mid_fico: number | null
          note_date: string | null
          note_rate: number | null
          payoff_mtg1_amount: number | null
          ppp_structure_1: Database["public"]["Enums"]["ppp_structure_1"] | null
          ppp_term: Database["public"]["Enums"]["ppp_term"] | null
          pricing_file_path: string | null
          pricing_file_url: string | null
          pricing_is_locked: boolean
          primary_guarantor_id: number | null
          project_type: Database["public"]["Enums"]["project_type"] | null
          property_id: number | null
          purchase_price: number | null
          recently_renovated: Database["public"]["Enums"]["yes_no"] | null
          recourse_type: string | null
          renovation_completed: string | null
          renovation_cost: number | null
          second_guarantor_id: number | null
          target_closing_date: string | null
          third_guarantor_id: number | null
          title_company_contact_id: number | null
          title_company_id: number | null
          title_file_number: string | null
          transaction_type:
            | Database["public"]["Enums"]["transaction_type"]
            | null
          updated_at: string | null
          vesting_type: Database["public"]["Enums"]["vesting_type"] | null
        }
        Insert: {
          account_executive_id?: number | null
          appraisal_poc_contact_id?: number | null
          broker_company_id?: number | null
          broker_id?: number | null
          cash_out_purpose?: string | null
          closing_agent_contact_id?: number | null
          company_id?: number | null
          construction_holdback?: number | null
          cost_of_capital?: number | null
          created_at?: string | null
          date_of_purchase?: string | null
          deal_disposition_1?:
            | Database["public"]["Enums"]["deal_disposition_1"]
            | null
          deal_name?: string | null
          deal_stage_1?: Database["public"]["Enums"]["deal_stage_1"] | null
          deal_stage_2?: Database["public"]["Enums"]["deal_stage_2"] | null
          deal_type?: Database["public"]["Enums"]["loan_type_1"] | null
          declaration_1_lawsuits?: boolean | null
          declaration_1_lawsuits_explanation?: string | null
          declaration_2_bankruptcy?: boolean | null
          declaration_2_bankruptcy_explanation?: string | null
          declaration_3_felony?: boolean | null
          declaration_3_felony_explanation?: string | null
          declaration_5_license?: boolean | null
          escrow_company_id?: number | null
          escrow_contact_id?: number | null
          fourth_guarantor_id?: number | null
          funding_date?: string | null
          guarantor_count?: number | null
          guarantor_fico_score?: number | null
          id?: number
          insurance_carrier_company_id?: number | null
          insurance_carrier_contact_id?: number | null
          io_period?: number | null
          lead_source_name?: string | null
          lead_source_type?: Database["public"]["Enums"]["lead_source"] | null
          loan_amount_initial?: number | null
          loan_amount_total?: number | null
          loan_buyer_company_id?: number | null
          loan_buyer_contact_id?: number | null
          loan_number: string
          loan_opener_id?: number | null
          loan_processor_id?: number | null
          loan_sale_date?: string | null
          loan_structure_dscr?:
            | Database["public"]["Enums"]["loan_structure_dscr"]
            | null
          loan_term?: Database["public"]["Enums"]["loan_term_months"] | null
          loan_type_rtl?: Database["public"]["Enums"]["loan_type_2"] | null
          ltv_after_repair?: number | null
          ltv_asis?: number | null
          mid_fico?: number | null
          note_date?: string | null
          note_rate?: number | null
          payoff_mtg1_amount?: number | null
          ppp_structure_1?:
            | Database["public"]["Enums"]["ppp_structure_1"]
            | null
          ppp_term?: Database["public"]["Enums"]["ppp_term"] | null
          pricing_file_path?: string | null
          pricing_file_url?: string | null
          pricing_is_locked?: boolean
          primary_guarantor_id?: number | null
          project_type?: Database["public"]["Enums"]["project_type"] | null
          property_id?: number | null
          purchase_price?: number | null
          recently_renovated?: Database["public"]["Enums"]["yes_no"] | null
          recourse_type?: string | null
          renovation_completed?: string | null
          renovation_cost?: number | null
          second_guarantor_id?: number | null
          target_closing_date?: string | null
          third_guarantor_id?: number | null
          title_company_contact_id?: number | null
          title_company_id?: number | null
          title_file_number?: string | null
          transaction_type?:
            | Database["public"]["Enums"]["transaction_type"]
            | null
          updated_at?: string | null
          vesting_type?: Database["public"]["Enums"]["vesting_type"] | null
        }
        Update: {
          account_executive_id?: number | null
          appraisal_poc_contact_id?: number | null
          broker_company_id?: number | null
          broker_id?: number | null
          cash_out_purpose?: string | null
          closing_agent_contact_id?: number | null
          company_id?: number | null
          construction_holdback?: number | null
          cost_of_capital?: number | null
          created_at?: string | null
          date_of_purchase?: string | null
          deal_disposition_1?:
            | Database["public"]["Enums"]["deal_disposition_1"]
            | null
          deal_name?: string | null
          deal_stage_1?: Database["public"]["Enums"]["deal_stage_1"] | null
          deal_stage_2?: Database["public"]["Enums"]["deal_stage_2"] | null
          deal_type?: Database["public"]["Enums"]["loan_type_1"] | null
          declaration_1_lawsuits?: boolean | null
          declaration_1_lawsuits_explanation?: string | null
          declaration_2_bankruptcy?: boolean | null
          declaration_2_bankruptcy_explanation?: string | null
          declaration_3_felony?: boolean | null
          declaration_3_felony_explanation?: string | null
          declaration_5_license?: boolean | null
          escrow_company_id?: number | null
          escrow_contact_id?: number | null
          fourth_guarantor_id?: number | null
          funding_date?: string | null
          guarantor_count?: number | null
          guarantor_fico_score?: number | null
          id?: number
          insurance_carrier_company_id?: number | null
          insurance_carrier_contact_id?: number | null
          io_period?: number | null
          lead_source_name?: string | null
          lead_source_type?: Database["public"]["Enums"]["lead_source"] | null
          loan_amount_initial?: number | null
          loan_amount_total?: number | null
          loan_buyer_company_id?: number | null
          loan_buyer_contact_id?: number | null
          loan_number?: string
          loan_opener_id?: number | null
          loan_processor_id?: number | null
          loan_sale_date?: string | null
          loan_structure_dscr?:
            | Database["public"]["Enums"]["loan_structure_dscr"]
            | null
          loan_term?: Database["public"]["Enums"]["loan_term_months"] | null
          loan_type_rtl?: Database["public"]["Enums"]["loan_type_2"] | null
          ltv_after_repair?: number | null
          ltv_asis?: number | null
          mid_fico?: number | null
          note_date?: string | null
          note_rate?: number | null
          payoff_mtg1_amount?: number | null
          ppp_structure_1?:
            | Database["public"]["Enums"]["ppp_structure_1"]
            | null
          ppp_term?: Database["public"]["Enums"]["ppp_term"] | null
          pricing_file_path?: string | null
          pricing_file_url?: string | null
          pricing_is_locked?: boolean
          primary_guarantor_id?: number | null
          project_type?: Database["public"]["Enums"]["project_type"] | null
          property_id?: number | null
          purchase_price?: number | null
          recently_renovated?: Database["public"]["Enums"]["yes_no"] | null
          recourse_type?: string | null
          renovation_completed?: string | null
          renovation_cost?: number | null
          second_guarantor_id?: number | null
          target_closing_date?: string | null
          third_guarantor_id?: number | null
          title_company_contact_id?: number | null
          title_company_id?: number | null
          title_file_number?: string | null
          transaction_type?:
            | Database["public"]["Enums"]["transaction_type"]
            | null
          updated_at?: string | null
          vesting_type?: Database["public"]["Enums"]["vesting_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_appraisal_poc_contact_id_fkey"
            columns: ["appraisal_poc_contact_id"]
            isOneToOne: false
            referencedRelation: "contact"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_broker_company_id_fkey"
            columns: ["broker_company_id"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["co_id"]
          },
          {
            foreignKeyName: "deal_closing_agent_contact_id_fkey"
            columns: ["closing_agent_contact_id"]
            isOneToOne: false
            referencedRelation: "contact"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_escrow_company_id_fkey"
            columns: ["escrow_company_id"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["co_id"]
          },
          {
            foreignKeyName: "deal_escrow_contact_id_fkey"
            columns: ["escrow_contact_id"]
            isOneToOne: false
            referencedRelation: "contact"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_fourth_guarantor_id_fkey"
            columns: ["fourth_guarantor_id"]
            isOneToOne: false
            referencedRelation: "guarantor"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_insurance_carrier_company_id_fkey"
            columns: ["insurance_carrier_company_id"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["co_id"]
          },
          {
            foreignKeyName: "deal_insurance_carrier_contact_id_fkey"
            columns: ["insurance_carrier_contact_id"]
            isOneToOne: false
            referencedRelation: "contact"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_loan_buyer_company_id_fkey"
            columns: ["loan_buyer_company_id"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["co_id"]
          },
          {
            foreignKeyName: "deal_loan_buyer_contact_id_fkey"
            columns: ["loan_buyer_contact_id"]
            isOneToOne: false
            referencedRelation: "contact"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_loan_opener_id_fkey"
            columns: ["loan_opener_id"]
            isOneToOne: false
            referencedRelation: "auth_clerk_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_loan_processor_id_fkey"
            columns: ["loan_processor_id"]
            isOneToOne: false
            referencedRelation: "auth_clerk_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_primary_guarantor_id_fkey"
            columns: ["primary_guarantor_id"]
            isOneToOne: false
            referencedRelation: "guarantor"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_second_guarantor_id_fkey"
            columns: ["second_guarantor_id"]
            isOneToOne: false
            referencedRelation: "guarantor"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_third_guarantor_id_fkey"
            columns: ["third_guarantor_id"]
            isOneToOne: false
            referencedRelation: "guarantor"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_title_company_id_fkey"
            columns: ["title_company_id"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["co_id"]
          },
          {
            foreignKeyName: "public_deal_account_executive_id_fkey"
            columns: ["account_executive_id"]
            isOneToOne: false
            referencedRelation: "auth_clerk_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_deal_broker_id_fkey"
            columns: ["broker_id"]
            isOneToOne: false
            referencedRelation: "contact"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_deal_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["co_id"]
          },
          {
            foreignKeyName: "public_deal_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_deal_title_company_contact_id_fkey"
            columns: ["title_company_contact_id"]
            isOneToOne: false
            referencedRelation: "contact"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_appraisals: {
        Row: {
          appraisal_id: number | null
          deal_id: number | null
          id: number
          property_id: number | null
        }
        Insert: {
          appraisal_id?: number | null
          deal_id?: number | null
          id?: number
          property_id?: number | null
        }
        Update: {
          appraisal_id?: number | null
          deal_id?: number | null
          id?: number
          property_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_appraisals_appraisal_id_fkey"
            columns: ["appraisal_id"]
            isOneToOne: false
            referencedRelation: "appraisal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_appraisals_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_appraisals_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_property: {
        Row: {
          deal_id: number
          id: number
          property_id: number
        }
        Insert: {
          deal_id: number
          id?: number
          property_id: number
        }
        Update: {
          deal_id?: number
          id?: number
          property_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "public_deal_property_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_deal_property_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_roles: {
        Row: {
          contact_id: number | null
          contact_types_id: number | null
          deal_id: number | null
          id: number
        }
        Insert: {
          contact_id?: number | null
          contact_types_id?: number | null
          deal_id?: number | null
          id?: number
        }
        Update: {
          contact_id?: number | null
          contact_types_id?: number | null
          deal_id?: number | null
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "public_deal_roles_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contact"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_deal_roles_contact_types_id_fkey"
            columns: ["contact_types_id"]
            isOneToOne: false
            referencedRelation: "contact_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_deal_roles_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deal"
            referencedColumns: ["id"]
          },
        ]
      }
      document_files: {
        Row: {
          borrower_id: number | null
          category: Database["public"]["Enums"]["document_category"] | null
          created_at: string
          deal_id: number | null
          effective_date: string | null
          entity_id: number | null
          expiration_date: string | null
          file_path: string | null
          file_size: number | null
          file_type: string | null
          file_url: string | null
          guarantor_id: number | null
          id: number
          is_required: boolean | null
          name: string | null
          private_notes: string | null
          property_id: number | null
          public_notes: string | null
          status: Database["public"]["Enums"]["document_status"] | null
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          borrower_id?: number | null
          category?: Database["public"]["Enums"]["document_category"] | null
          created_at?: string
          deal_id?: number | null
          effective_date?: string | null
          entity_id?: number | null
          expiration_date?: string | null
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          guarantor_id?: number | null
          id?: number
          is_required?: boolean | null
          name?: string | null
          private_notes?: string | null
          property_id?: number | null
          public_notes?: string | null
          status?: Database["public"]["Enums"]["document_status"] | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          borrower_id?: number | null
          category?: Database["public"]["Enums"]["document_category"] | null
          created_at?: string
          deal_id?: number | null
          effective_date?: string | null
          entity_id?: number | null
          expiration_date?: string | null
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          guarantor_id?: number | null
          id?: number
          is_required?: boolean | null
          name?: string | null
          private_notes?: string | null
          property_id?: number | null
          public_notes?: string | null
          status?: Database["public"]["Enums"]["document_status"] | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_borrower_id_fkey"
            columns: ["borrower_id"]
            isOneToOne: false
            referencedRelation: "borrower"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["co_id"]
          },
          {
            foreignKeyName: "documents_guarantor_id_fkey"
            columns: ["guarantor_id"]
            isOneToOne: false
            referencedRelation: "guarantor"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property"
            referencedColumns: ["id"]
          },
        ]
      }
      document_roles: {
        Row: {
          id: number
          role_name: string
        }
        Insert: {
          id?: number
          role_name: string
        }
        Update: {
          id?: number
          role_name?: string
        }
        Relationships: []
      }
      document_roles_assigned: {
        Row: {
          document_id: number
          role_id: number
        }
        Insert: {
          document_id: number
          role_id: number
        }
        Update: {
          document_id?: number
          role_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_document"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "document_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_role"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "document_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      fee: {
        Row: {
          category: string
          created_at: string
          fee_amount_bps: number
          id: number
          program: Database["public"]["Enums"]["loan_program"] | null
        }
        Insert: {
          category: string
          created_at?: string
          fee_amount_bps: number
          id?: number
          program?: Database["public"]["Enums"]["loan_program"] | null
        }
        Update: {
          category?: string
          created_at?: string
          fee_amount_bps?: number
          id?: number
          program?: Database["public"]["Enums"]["loan_program"] | null
        }
        Relationships: []
      }
      guarantor: {
        Row: {
          borrower_id: number | null
          cell_phone: string | null
          citizenship: Database["public"]["Enums"]["citizenship"] | null
          created_at: string
          credit_check:
            | Database["public"]["Enums"]["credit_check_status"]
            | null
          date_of_birth: string | null
          deal_id: number | null
          email_address: string | null
          exp_flips_sold: number | null
          exp_ground_ups_sold: number | null
          exp_professional_license:
            | Database["public"]["Enums"]["professional_license"]
            | null
          exp_rentals_owned: number | null
          fico_report_date_expiration: string | null
          fico_report_date_pulled: string | null
          fico_report_score_equifax: number | null
          fico_report_score_experian: number | null
          fico_report_score_transunion: number | null
          fico_score_mid_actual: number | null
          fico_score_mid_estimate: number | null
          first_name: string | null
          first_time_home_buyer: Database["public"]["Enums"]["yes_no"] | null
          has_experience: Database["public"]["Enums"]["yes_no"] | null
          home_phone: string | null
          id: number
          last_name: string | null
          mailing_address_city: string | null
          mailing_address_country: string | null
          mailing_address_is_primary_residence: boolean | null
          mailing_address_po_box: string | null
          mailing_address_postal_code: string | null
          mailing_address_state: Database["public"]["Enums"]["us_states"] | null
          mailing_address_state_long:
            | Database["public"]["Enums"]["us_states_long"]
            | null
          mailing_address_street: string | null
          mailing_address_suite_apt: string | null
          marital_status: Database["public"]["Enums"]["marital_status"] | null
          middle_name: string | null
          mortgage_debt: number | null
          name: string | null
          office_phone: string | null
          previous_residence_address_city: string | null
          previous_residence_address_country: string | null
          previous_residence_address_postal_code: string | null
          previous_residence_address_state:
            | Database["public"]["Enums"]["us_states"]
            | null
          previous_residence_address_state_long:
            | Database["public"]["Enums"]["us_states_long"]
            | null
          previous_residence_address_street: string | null
          previous_residence_address_suite_apt: string | null
          primary_residence_address_city: string | null
          primary_residence_address_country: string | null
          primary_residence_address_postal_code: string | null
          primary_residence_address_state:
            | Database["public"]["Enums"]["us_states"]
            | null
          primary_residence_address_state_long:
            | Database["public"]["Enums"]["us_states_long"]
            | null
          primary_residence_address_street: string | null
          primary_residence_address_suite_apt: string | null
          primary_residence_occupancy_start_date: string | null
          primary_residence_ownership:
            | Database["public"]["Enums"]["residence_ownership"]
            | null
          social_security_number: string | null
        }
        Insert: {
          borrower_id?: number | null
          cell_phone?: string | null
          citizenship?: Database["public"]["Enums"]["citizenship"] | null
          created_at?: string
          credit_check?:
            | Database["public"]["Enums"]["credit_check_status"]
            | null
          date_of_birth?: string | null
          deal_id?: number | null
          email_address?: string | null
          exp_flips_sold?: number | null
          exp_ground_ups_sold?: number | null
          exp_professional_license?:
            | Database["public"]["Enums"]["professional_license"]
            | null
          exp_rentals_owned?: number | null
          fico_report_date_expiration?: string | null
          fico_report_date_pulled?: string | null
          fico_report_score_equifax?: number | null
          fico_report_score_experian?: number | null
          fico_report_score_transunion?: number | null
          fico_score_mid_actual?: number | null
          fico_score_mid_estimate?: number | null
          first_name?: string | null
          first_time_home_buyer?: Database["public"]["Enums"]["yes_no"] | null
          has_experience?: Database["public"]["Enums"]["yes_no"] | null
          home_phone?: string | null
          id?: number
          last_name?: string | null
          mailing_address_city?: string | null
          mailing_address_country?: string | null
          mailing_address_is_primary_residence?: boolean | null
          mailing_address_po_box?: string | null
          mailing_address_postal_code?: string | null
          mailing_address_state?:
            | Database["public"]["Enums"]["us_states"]
            | null
          mailing_address_state_long?:
            | Database["public"]["Enums"]["us_states_long"]
            | null
          mailing_address_street?: string | null
          mailing_address_suite_apt?: string | null
          marital_status?: Database["public"]["Enums"]["marital_status"] | null
          middle_name?: string | null
          mortgage_debt?: number | null
          name?: string | null
          office_phone?: string | null
          previous_residence_address_city?: string | null
          previous_residence_address_country?: string | null
          previous_residence_address_postal_code?: string | null
          previous_residence_address_state?:
            | Database["public"]["Enums"]["us_states"]
            | null
          previous_residence_address_state_long?:
            | Database["public"]["Enums"]["us_states_long"]
            | null
          previous_residence_address_street?: string | null
          previous_residence_address_suite_apt?: string | null
          primary_residence_address_city?: string | null
          primary_residence_address_country?: string | null
          primary_residence_address_postal_code?: string | null
          primary_residence_address_state?:
            | Database["public"]["Enums"]["us_states"]
            | null
          primary_residence_address_state_long?:
            | Database["public"]["Enums"]["us_states_long"]
            | null
          primary_residence_address_street?: string | null
          primary_residence_address_suite_apt?: string | null
          primary_residence_occupancy_start_date?: string | null
          primary_residence_ownership?:
            | Database["public"]["Enums"]["residence_ownership"]
            | null
          social_security_number?: string | null
        }
        Update: {
          borrower_id?: number | null
          cell_phone?: string | null
          citizenship?: Database["public"]["Enums"]["citizenship"] | null
          created_at?: string
          credit_check?:
            | Database["public"]["Enums"]["credit_check_status"]
            | null
          date_of_birth?: string | null
          deal_id?: number | null
          email_address?: string | null
          exp_flips_sold?: number | null
          exp_ground_ups_sold?: number | null
          exp_professional_license?:
            | Database["public"]["Enums"]["professional_license"]
            | null
          exp_rentals_owned?: number | null
          fico_report_date_expiration?: string | null
          fico_report_date_pulled?: string | null
          fico_report_score_equifax?: number | null
          fico_report_score_experian?: number | null
          fico_report_score_transunion?: number | null
          fico_score_mid_actual?: number | null
          fico_score_mid_estimate?: number | null
          first_name?: string | null
          first_time_home_buyer?: Database["public"]["Enums"]["yes_no"] | null
          has_experience?: Database["public"]["Enums"]["yes_no"] | null
          home_phone?: string | null
          id?: number
          last_name?: string | null
          mailing_address_city?: string | null
          mailing_address_country?: string | null
          mailing_address_is_primary_residence?: boolean | null
          mailing_address_po_box?: string | null
          mailing_address_postal_code?: string | null
          mailing_address_state?:
            | Database["public"]["Enums"]["us_states"]
            | null
          mailing_address_state_long?:
            | Database["public"]["Enums"]["us_states_long"]
            | null
          mailing_address_street?: string | null
          mailing_address_suite_apt?: string | null
          marital_status?: Database["public"]["Enums"]["marital_status"] | null
          middle_name?: string | null
          mortgage_debt?: number | null
          name?: string | null
          office_phone?: string | null
          previous_residence_address_city?: string | null
          previous_residence_address_country?: string | null
          previous_residence_address_postal_code?: string | null
          previous_residence_address_state?:
            | Database["public"]["Enums"]["us_states"]
            | null
          previous_residence_address_state_long?:
            | Database["public"]["Enums"]["us_states_long"]
            | null
          previous_residence_address_street?: string | null
          previous_residence_address_suite_apt?: string | null
          primary_residence_address_city?: string | null
          primary_residence_address_country?: string | null
          primary_residence_address_postal_code?: string | null
          primary_residence_address_state?:
            | Database["public"]["Enums"]["us_states"]
            | null
          primary_residence_address_state_long?:
            | Database["public"]["Enums"]["us_states_long"]
            | null
          primary_residence_address_street?: string | null
          primary_residence_address_suite_apt?: string | null
          primary_residence_occupancy_start_date?: string | null
          primary_residence_ownership?:
            | Database["public"]["Enums"]["residence_ownership"]
            | null
          social_security_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guarantor_borrower_id_fkey"
            columns: ["borrower_id"]
            isOneToOne: false
            referencedRelation: "borrower"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guarantor_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deal"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_application: {
        Row: {
          application_deal_id: number | null
          created_at: string
          error_message: string | null
          id: number
          reprocess: boolean | null
          status: string | null
          submission: Json | null
        }
        Insert: {
          application_deal_id?: number | null
          created_at?: string
          error_message?: string | null
          id?: number
          reprocess?: boolean | null
          status?: string | null
          submission?: Json | null
        }
        Update: {
          application_deal_id?: number | null
          created_at?: string
          error_message?: string | null
          id?: number
          reprocess?: boolean | null
          status?: string | null
          submission?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "loan_application_application_deal_id_fkey"
            columns: ["application_deal_id"]
            isOneToOne: false
            referencedRelation: "deal"
            referencedColumns: ["id"]
          },
        ]
      }
      milestone_templates: {
        Row: {
          created_at: string
          email_template_body: string | null
          email_template_subject: string | null
          id: number
          milestone_name: string
          milestone_order: number | null
          status: Database["public"]["Enums"]["milestone_status"] | null
          subject_property_state:
            | Database["public"]["Enums"]["us_states"]
            | null
          types_applied_to: string | null
          vesting_type: Database["public"]["Enums"]["vesting_type"] | null
        }
        Insert: {
          created_at?: string
          email_template_body?: string | null
          email_template_subject?: string | null
          id?: number
          milestone_name: string
          milestone_order?: number | null
          status?: Database["public"]["Enums"]["milestone_status"] | null
          subject_property_state?:
            | Database["public"]["Enums"]["us_states"]
            | null
          types_applied_to?: string | null
          vesting_type?: Database["public"]["Enums"]["vesting_type"] | null
        }
        Update: {
          created_at?: string
          email_template_body?: string | null
          email_template_subject?: string | null
          id?: number
          milestone_name?: string
          milestone_order?: number | null
          status?: Database["public"]["Enums"]["milestone_status"] | null
          subject_property_state?:
            | Database["public"]["Enums"]["us_states"]
            | null
          types_applied_to?: string | null
          vesting_type?: Database["public"]["Enums"]["vesting_type"] | null
        }
        Relationships: []
      }
      milestones: {
        Row: {
          created_at: string
          date_completed: string | null
          date_email_sent: string | null
          date_reached: string | null
          deal_id: number
          email_body: string | null
          email_sent: boolean | null
          email_subject: string | null
          id: number
          milestone_order: number | null
          milestone_template_id: number | null
          status: Database["public"]["Enums"]["milestone_status"] | null
        }
        Insert: {
          created_at?: string
          date_completed?: string | null
          date_email_sent?: string | null
          date_reached?: string | null
          deal_id: number
          email_body?: string | null
          email_sent?: boolean | null
          email_subject?: string | null
          id?: number
          milestone_order?: number | null
          milestone_template_id?: number | null
          status?: Database["public"]["Enums"]["milestone_status"] | null
        }
        Update: {
          created_at?: string
          date_completed?: string | null
          date_email_sent?: string | null
          date_reached?: string | null
          deal_id?: number
          email_body?: string | null
          email_sent?: boolean | null
          email_subject?: string | null
          id?: number
          milestone_order?: number | null
          milestone_template_id?: number | null
          status?: Database["public"]["Enums"]["milestone_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "milestones_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "milestones_milestone_template_id_fkey"
            columns: ["milestone_template_id"]
            isOneToOne: false
            referencedRelation: "milestone_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      auth_clerk_orgs_themes: {
        Row: {
          created_at: string
          created_by_user_id: number | null
          id: number
          is_default: boolean
          name: string
          org_id: number
          radius: Json
          tokens_dark: Json
          tokens_light: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          created_by_user_id?: number | null
          id?: number
          is_default?: boolean
          name: string
          org_id: number
          radius?: Json
          tokens_dark?: Json
          tokens_light?: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          created_by_user_id?: number | null
          id?: number
          is_default?: boolean
          name?: string
          org_id?: number
          radius?: Json
          tokens_dark?: Json
          tokens_light?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "auth_clerk_orgs_themes_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "auth_clerk_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auth_clerk_orgs_themes_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "auth_clerk_orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_submission: {
        Row: {
          comp_ae_final_usd: number | null
          comp_ae_formula_output_pct: number | null
          comp_ae_formula_output_usd: number | null
          comp_lp_final_usd: number | null
          comp_lp_formula_output_pct: number | null
          comp_lp_formula_output_usd: number | null
          created_at: string
          deal_id: number | null
          expense_ace_corp_override_usd: number | null
          expense_ace_corp_return_usd: number | null
          expense_misc_ppcc_usd: number | null
          id: number
          income_bpc_pct: number | null
          income_bpc_received_datetime: string | null
          income_bpc_received_yn: boolean | null
          income_bpc_usd: number | null
          income_lpc_pct: number | null
          income_lpc_promo_usd: number | null
          income_lpc_trailing_pct: number | null
          income_lpc_trailing_usd: number | null
          income_lpc_trailing_yn: boolean | null
          income_lpc_usd: number | null
          income_net_usd: number | null
          updated_at: string | null
        }
        Insert: {
          comp_ae_final_usd?: number | null
          comp_ae_formula_output_pct?: number | null
          comp_ae_formula_output_usd?: number | null
          comp_lp_final_usd?: number | null
          comp_lp_formula_output_pct?: number | null
          comp_lp_formula_output_usd?: number | null
          created_at?: string
          deal_id?: number | null
          expense_ace_corp_override_usd?: number | null
          expense_ace_corp_return_usd?: number | null
          expense_misc_ppcc_usd?: number | null
          id?: number
          income_bpc_pct?: number | null
          income_bpc_received_datetime?: string | null
          income_bpc_received_yn?: boolean | null
          income_bpc_usd?: number | null
          income_lpc_pct?: number | null
          income_lpc_promo_usd?: number | null
          income_lpc_trailing_pct?: number | null
          income_lpc_trailing_usd?: number | null
          income_lpc_trailing_yn?: boolean | null
          income_lpc_usd?: number | null
          income_net_usd?: number | null
          updated_at?: string | null
        }
        Update: {
          comp_ae_final_usd?: number | null
          comp_ae_formula_output_pct?: number | null
          comp_ae_formula_output_usd?: number | null
          comp_lp_final_usd?: number | null
          comp_lp_formula_output_pct?: number | null
          comp_lp_formula_output_usd?: number | null
          created_at?: string
          deal_id?: number | null
          expense_ace_corp_override_usd?: number | null
          expense_ace_corp_return_usd?: number | null
          expense_misc_ppcc_usd?: number | null
          id?: number
          income_bpc_pct?: number | null
          income_bpc_received_datetime?: string | null
          income_bpc_received_yn?: boolean | null
          income_bpc_usd?: number | null
          income_lpc_pct?: number | null
          income_lpc_promo_usd?: number | null
          income_lpc_trailing_pct?: number | null
          income_lpc_trailing_usd?: number | null
          income_lpc_trailing_yn?: boolean | null
          income_lpc_usd?: number | null
          income_net_usd?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payroll_submission_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deal"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_submission_fees_1099: {
        Row: {
          broker_id: number | null
          created_at: string
          expense_1099_broker_fee_pct: number | null
          expense_1099_broker_fee_usd: number | null
          id: string
          payroll_submission_id: number | null
          updated_at: string | null
        }
        Insert: {
          broker_id?: number | null
          created_at?: string
          expense_1099_broker_fee_pct?: number | null
          expense_1099_broker_fee_usd?: number | null
          id?: string
          payroll_submission_id?: number | null
          updated_at?: string | null
        }
        Update: {
          broker_id?: number | null
          created_at?: string
          expense_1099_broker_fee_pct?: number | null
          expense_1099_broker_fee_usd?: number | null
          id?: string
          payroll_submission_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payroll_submission_fees_1099_broker_id_fkey"
            columns: ["broker_id"]
            isOneToOne: false
            referencedRelation: "contact"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_submission_fees_1099_payroll_submission_id_fkey"
            columns: ["payroll_submission_id"]
            isOneToOne: false
            referencedRelation: "payroll_submission"
            referencedColumns: ["id"]
          },
        ]
      }
      property: {
        Row: {
          address: string | null
          address_city: string | null
          address_country: string | null
          address_county: string | null
          address_postal_code: string | null
          address_state: Database["public"]["Enums"]["us_states"] | null
          address_state_long:
            | Database["public"]["Enums"]["us_states_long"]
            | null
          address_street: string | null
          address_suite_apt: string | null
          bathrooms_aiv: number | null
          bathrooms_arv: number | null
          bedrooms_aiv: number | null
          bedrooms_arv: number | null
          created_at: string | null
          declining_market: Database["public"]["Enums"]["yes_no"] | null
          expense_annual_association_hoa: number | null
          expense_annual_insurance_flood: number | null
          expense_annual_insurance_hoi: number | null
          expense_annual_management: number | null
          expense_annual_property_tax: number | null
          flood_zone: Database["public"]["Enums"]["yes_no"] | null
          hoa_contact: number | null
          hoa_contact_email: string | null
          hoa_contact_person: string | null
          hoa_contact_phone: string | null
          hoa_name: string | null
          id: number
          income_monthly_fair_market_rent: number | null
          income_monthly_gross_rent: number | null
          inspection: Database["public"]["Enums"]["yes_no"] | null
          latitude: number | null
          longitude: number | null
          occupancy: Database["public"]["Enums"]["property_occupancy"] | null
          photo_url: string | null
          property_type: Database["public"]["Enums"]["property_type"] | null
          purchase_date: string | null
          purchase_price: number | null
          recently_renovated: Database["public"]["Enums"]["yes_no"] | null
          rehab_completed_post_acquisition: number | null
          renovation_completed: string | null
          renovation_cost: number | null
          rural: Database["public"]["Enums"]["yes_no"] | null
          sale_date: string | null
          sale_price: number | null
          short_term_rental: Database["public"]["Enums"]["yes_no"] | null
          sq_footage_gla_aiv: number | null
          sq_footage_gla_arv: number | null
          sq_footage_lot_aiv: number | null
          sq_footage_lot_arv: number | null
          units: number | null
          updated_at: string | null
          value_aiv_appraised: number | null
          value_aiv_estimate: number | null
          value_arv_appraised: number | null
          value_arv_estimate: number | null
          warrantability: Database["public"]["Enums"]["warrantability"] | null
          year_built: number | null
        }
        Insert: {
          address?: string | null
          address_city?: string | null
          address_country?: string | null
          address_county?: string | null
          address_postal_code?: string | null
          address_state?: Database["public"]["Enums"]["us_states"] | null
          address_state_long?:
            | Database["public"]["Enums"]["us_states_long"]
            | null
          address_street?: string | null
          address_suite_apt?: string | null
          bathrooms_aiv?: number | null
          bathrooms_arv?: number | null
          bedrooms_aiv?: number | null
          bedrooms_arv?: number | null
          created_at?: string | null
          declining_market?: Database["public"]["Enums"]["yes_no"] | null
          expense_annual_association_hoa?: number | null
          expense_annual_insurance_flood?: number | null
          expense_annual_insurance_hoi?: number | null
          expense_annual_management?: number | null
          expense_annual_property_tax?: number | null
          flood_zone?: Database["public"]["Enums"]["yes_no"] | null
          hoa_contact?: number | null
          hoa_contact_email?: string | null
          hoa_contact_person?: string | null
          hoa_contact_phone?: string | null
          hoa_name?: string | null
          id?: number
          income_monthly_fair_market_rent?: number | null
          income_monthly_gross_rent?: number | null
          inspection?: Database["public"]["Enums"]["yes_no"] | null
          latitude?: number | null
          longitude?: number | null
          occupancy?: Database["public"]["Enums"]["property_occupancy"] | null
          photo_url?: string | null
          property_type?: Database["public"]["Enums"]["property_type"] | null
          purchase_date?: string | null
          purchase_price?: number | null
          recently_renovated?: Database["public"]["Enums"]["yes_no"] | null
          rehab_completed_post_acquisition?: number | null
          renovation_completed?: string | null
          renovation_cost?: number | null
          rural?: Database["public"]["Enums"]["yes_no"] | null
          sale_date?: string | null
          sale_price?: number | null
          short_term_rental?: Database["public"]["Enums"]["yes_no"] | null
          sq_footage_gla_aiv?: number | null
          sq_footage_gla_arv?: number | null
          sq_footage_lot_aiv?: number | null
          sq_footage_lot_arv?: number | null
          units?: number | null
          updated_at?: string | null
          value_aiv_appraised?: number | null
          value_aiv_estimate?: number | null
          value_arv_appraised?: number | null
          value_arv_estimate?: number | null
          warrantability?: Database["public"]["Enums"]["warrantability"] | null
          year_built?: number | null
        }
        Update: {
          address?: string | null
          address_city?: string | null
          address_country?: string | null
          address_county?: string | null
          address_postal_code?: string | null
          address_state?: Database["public"]["Enums"]["us_states"] | null
          address_state_long?:
            | Database["public"]["Enums"]["us_states_long"]
            | null
          address_street?: string | null
          address_suite_apt?: string | null
          bathrooms_aiv?: number | null
          bathrooms_arv?: number | null
          bedrooms_aiv?: number | null
          bedrooms_arv?: number | null
          created_at?: string | null
          declining_market?: Database["public"]["Enums"]["yes_no"] | null
          expense_annual_association_hoa?: number | null
          expense_annual_insurance_flood?: number | null
          expense_annual_insurance_hoi?: number | null
          expense_annual_management?: number | null
          expense_annual_property_tax?: number | null
          flood_zone?: Database["public"]["Enums"]["yes_no"] | null
          hoa_contact?: number | null
          hoa_contact_email?: string | null
          hoa_contact_person?: string | null
          hoa_contact_phone?: string | null
          hoa_name?: string | null
          id?: number
          income_monthly_fair_market_rent?: number | null
          income_monthly_gross_rent?: number | null
          inspection?: Database["public"]["Enums"]["yes_no"] | null
          latitude?: number | null
          longitude?: number | null
          occupancy?: Database["public"]["Enums"]["property_occupancy"] | null
          photo_url?: string | null
          property_type?: Database["public"]["Enums"]["property_type"] | null
          purchase_date?: string | null
          purchase_price?: number | null
          recently_renovated?: Database["public"]["Enums"]["yes_no"] | null
          rehab_completed_post_acquisition?: number | null
          renovation_completed?: string | null
          renovation_cost?: number | null
          rural?: Database["public"]["Enums"]["yes_no"] | null
          sale_date?: string | null
          sale_price?: number | null
          short_term_rental?: Database["public"]["Enums"]["yes_no"] | null
          sq_footage_gla_aiv?: number | null
          sq_footage_gla_arv?: number | null
          sq_footage_lot_aiv?: number | null
          sq_footage_lot_arv?: number | null
          units?: number | null
          updated_at?: string | null
          value_aiv_appraised?: number | null
          value_aiv_estimate?: number | null
          value_arv_appraised?: number | null
          value_arv_estimate?: number | null
          warrantability?: Database["public"]["Enums"]["warrantability"] | null
          year_built?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "property_hoa_contact_fkey"
            columns: ["hoa_contact"]
            isOneToOne: false
            referencedRelation: "contact"
            referencedColumns: ["id"]
          },
        ]
      }
      property_income: {
        Row: {
          created_at: string | null
          id: number
          lease_length: Database["public"]["Enums"]["lease_length"] | null
          lease_rent: number | null
          lease_term_begin: string | null
          lease_term_end: string | null
          lease_term_status:
            | Database["public"]["Enums"]["property_lease_term_status"]
            | null
          market_rent_fmr: number | null
          property_id: number
          tenant_name: string | null
          tenant_occupied: Database["public"]["Enums"]["yes_no"] | null
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          lease_length?: Database["public"]["Enums"]["lease_length"] | null
          lease_rent?: number | null
          lease_term_begin?: string | null
          lease_term_end?: string | null
          lease_term_status?:
            | Database["public"]["Enums"]["property_lease_term_status"]
            | null
          market_rent_fmr?: number | null
          property_id: number
          tenant_name?: string | null
          tenant_occupied?: Database["public"]["Enums"]["yes_no"] | null
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          lease_length?: Database["public"]["Enums"]["lease_length"] | null
          lease_rent?: number | null
          lease_term_begin?: string | null
          lease_term_end?: string | null
          lease_term_status?:
            | Database["public"]["Enums"]["property_lease_term_status"]
            | null
          market_rent_fmr?: number | null
          property_id?: number
          tenant_name?: string | null
          tenant_occupied?: Database["public"]["Enums"]["yes_no"] | null
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_income_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property"
            referencedColumns: ["id"]
          },
        ]
      }
      property_reapi: {
        Row: {
          address_city: string | null
          address_county: string | null
          address_full: string | null
          address_house: string | null
          address_jurisdiction: string | null
          address_predirection: string | null
          address_state: Database["public"]["Enums"]["us_states"] | null
          address_street: string | null
          address_street_type: string | null
          address_unit: string | null
          address_unit_type: string | null
          address_zip4: string | null
          address_zip5: string | null
          api_response: Json | null
          created_at: string | null
          data_auction_info: string | null
          data_flood_zone_description: string | null
          data_flood_zone_type: string | null
          data_flood_zone_yn: string | null
          data_freeclear_yn: string | null
          data_last_sale_date: string | null
          data_last_sale_price: number | null
          data_lien_yn: string | null
          data_mls_active: string | null
          data_mls_cancelled: string | null
          data_mls_daysonmarket: number | null
          data_mls_failed: string | null
          data_mls_failed_date: string | null
          data_mls_last_sale_date: string | null
          data_mls_last_status_date: string | null
          data_mls_listing_date: string | null
          data_mls_listing_price: number | null
          data_mls_listing_price_sqft: number | null
          data_mls_pending: string | null
          data_mls_sold: string | null
          data_mls_sold_price: number | null
          data_mls_status: string | null
          data_mls_total_updates: number | null
          data_mls_type: string | null
          data_occupancy_oo_yn: string | null
          data_occupancy_vacant_yn: string | null
          data_open_mortgage_balance_est: number | null
          "data_owner_equity%_est": number | null
          data_owner_equity$_est: number | null
          data_owner_inherited_yn: string | null
          data_owner_investorbuyer_yn: string | null
          data_owner_is_bank_yn: string | null
          data_owner_is_entity_yn: string | null
          data_owner_mortgage_arm_yn: string | null
          data_owner_mortgage_balance_est: number | null
          data_owner_mortgage_maturitydate: string | null
          data_owner_mortgage_payment_est: number | null
          data_preforeclosure_yn: string | null
          data_private_lender_yn: string | null
          data_property_type: string | null
          data_property_type_MFH2to4: string | null
          data_property_type_MFH5plus: string | null
          data_property_type_mobilehome_yn: string | null
          data_reapi_last_update: string | null
          data_reapi_loaded_at: string | null
          data_taxlien_yn: string | null
          data_value_asis_est: number | null
          id: number
          lot_apn: string | null
          lot_apn_unformatted: string | null
          lot_census_block: string | null
          lot_census_block_group: string | null
          lot_census_tract: string | null
          lot_landuse: string | null
          lot_legal_block_number: string | null
          lot_legal_description: string | null
          lot_legal_lot_number: string | null
          lot_legal_section: string | null
          lot_property_use: string | null
          lot_size_acres_asis: number | null
          lot_size_sqft_asis: number | null
          lot_subdivision: string | null
          lot_zoning: string | null
          pi_basement_sqft: number | null
          pi_basement_sqft_finished: number | null
          pi_basement_type: string | null
          pi_buildings_count_asis: number | null
          pi_construction_method: string | null
          pi_demo_fmr_1br: number | null
          pi_demo_fmr_2br: number | null
          pi_demo_fmr_3br: number | null
          pi_demo_fmr_4br: number | null
          pi_demo_fmr_efficiency: number | null
          pi_demo_fmr_year: number | null
          pi_demo_hud_area_code: string | null
          pi_demo_hud_area_name: string | null
          pi_demo_hud_median_income: number | null
          pi_demo_suggested_rent: number | null
          pi_garage_sqft_asis: number | null
          pi_garage_type: string | null
          pi_gla_sqft_asis: number | null
          pi_hoa_fees_annual: number | null
          pi_hoa_name: string | null
          pi_hoa_warrantability: string | null
          pi_latitude: number | null
          pi_longitude: number | null
          pi_rooms_bathrooms_asis: number | null
          pi_rooms_bathrooms_partial_asis: number | null
          pi_rooms_bedrooms_asis: number | null
          pi_rooms_count_asis: number | null
          pi_units_count_asis: number | null
          pi_year_built: number | null
          property_id: number | null
          reapi_id: number
          tax_amount_annual: number | null
          tax_year: number | null
          updated_at: string | null
          value_arv_estimate: number | null
        }
        Insert: {
          address_city?: string | null
          address_county?: string | null
          address_full?: string | null
          address_house?: string | null
          address_jurisdiction?: string | null
          address_predirection?: string | null
          address_state?: Database["public"]["Enums"]["us_states"] | null
          address_street?: string | null
          address_street_type?: string | null
          address_unit?: string | null
          address_unit_type?: string | null
          address_zip4?: string | null
          address_zip5?: string | null
          api_response?: Json | null
          created_at?: string | null
          data_auction_info?: string | null
          data_flood_zone_description?: string | null
          data_flood_zone_type?: string | null
          data_flood_zone_yn?: string | null
          data_freeclear_yn?: string | null
          data_last_sale_date?: string | null
          data_last_sale_price?: number | null
          data_lien_yn?: string | null
          data_mls_active?: string | null
          data_mls_cancelled?: string | null
          data_mls_daysonmarket?: number | null
          data_mls_failed?: string | null
          data_mls_failed_date?: string | null
          data_mls_last_sale_date?: string | null
          data_mls_last_status_date?: string | null
          data_mls_listing_date?: string | null
          data_mls_listing_price?: number | null
          data_mls_listing_price_sqft?: number | null
          data_mls_pending?: string | null
          data_mls_sold?: string | null
          data_mls_sold_price?: number | null
          data_mls_status?: string | null
          data_mls_total_updates?: number | null
          data_mls_type?: string | null
          data_occupancy_oo_yn?: string | null
          data_occupancy_vacant_yn?: string | null
          data_open_mortgage_balance_est?: number | null
          "data_owner_equity%_est"?: number | null
          data_owner_equity$_est?: number | null
          data_owner_inherited_yn?: string | null
          data_owner_investorbuyer_yn?: string | null
          data_owner_is_bank_yn?: string | null
          data_owner_is_entity_yn?: string | null
          data_owner_mortgage_arm_yn?: string | null
          data_owner_mortgage_balance_est?: number | null
          data_owner_mortgage_maturitydate?: string | null
          data_owner_mortgage_payment_est?: number | null
          data_preforeclosure_yn?: string | null
          data_private_lender_yn?: string | null
          data_property_type?: string | null
          data_property_type_MFH2to4?: string | null
          data_property_type_MFH5plus?: string | null
          data_property_type_mobilehome_yn?: string | null
          data_reapi_last_update?: string | null
          data_reapi_loaded_at?: string | null
          data_taxlien_yn?: string | null
          data_value_asis_est?: number | null
          id?: number
          lot_apn?: string | null
          lot_apn_unformatted?: string | null
          lot_census_block?: string | null
          lot_census_block_group?: string | null
          lot_census_tract?: string | null
          lot_landuse?: string | null
          lot_legal_block_number?: string | null
          lot_legal_description?: string | null
          lot_legal_lot_number?: string | null
          lot_legal_section?: string | null
          lot_property_use?: string | null
          lot_size_acres_asis?: number | null
          lot_size_sqft_asis?: number | null
          lot_subdivision?: string | null
          lot_zoning?: string | null
          pi_basement_sqft?: number | null
          pi_basement_sqft_finished?: number | null
          pi_basement_type?: string | null
          pi_buildings_count_asis?: number | null
          pi_construction_method?: string | null
          pi_demo_fmr_1br?: number | null
          pi_demo_fmr_2br?: number | null
          pi_demo_fmr_3br?: number | null
          pi_demo_fmr_4br?: number | null
          pi_demo_fmr_efficiency?: number | null
          pi_demo_fmr_year?: number | null
          pi_demo_hud_area_code?: string | null
          pi_demo_hud_area_name?: string | null
          pi_demo_hud_median_income?: number | null
          pi_demo_suggested_rent?: number | null
          pi_garage_sqft_asis?: number | null
          pi_garage_type?: string | null
          pi_gla_sqft_asis?: number | null
          pi_hoa_fees_annual?: number | null
          pi_hoa_name?: string | null
          pi_hoa_warrantability?: string | null
          pi_latitude?: number | null
          pi_longitude?: number | null
          pi_rooms_bathrooms_asis?: number | null
          pi_rooms_bathrooms_partial_asis?: number | null
          pi_rooms_bedrooms_asis?: number | null
          pi_rooms_count_asis?: number | null
          pi_units_count_asis?: number | null
          pi_year_built?: number | null
          property_id?: number | null
          reapi_id: number
          tax_amount_annual?: number | null
          tax_year?: number | null
          updated_at?: string | null
          value_arv_estimate?: number | null
        }
        Update: {
          address_city?: string | null
          address_county?: string | null
          address_full?: string | null
          address_house?: string | null
          address_jurisdiction?: string | null
          address_predirection?: string | null
          address_state?: Database["public"]["Enums"]["us_states"] | null
          address_street?: string | null
          address_street_type?: string | null
          address_unit?: string | null
          address_unit_type?: string | null
          address_zip4?: string | null
          address_zip5?: string | null
          api_response?: Json | null
          created_at?: string | null
          data_auction_info?: string | null
          data_flood_zone_description?: string | null
          data_flood_zone_type?: string | null
          data_flood_zone_yn?: string | null
          data_freeclear_yn?: string | null
          data_last_sale_date?: string | null
          data_last_sale_price?: number | null
          data_lien_yn?: string | null
          data_mls_active?: string | null
          data_mls_cancelled?: string | null
          data_mls_daysonmarket?: number | null
          data_mls_failed?: string | null
          data_mls_failed_date?: string | null
          data_mls_last_sale_date?: string | null
          data_mls_last_status_date?: string | null
          data_mls_listing_date?: string | null
          data_mls_listing_price?: number | null
          data_mls_listing_price_sqft?: number | null
          data_mls_pending?: string | null
          data_mls_sold?: string | null
          data_mls_sold_price?: number | null
          data_mls_status?: string | null
          data_mls_total_updates?: number | null
          data_mls_type?: string | null
          data_occupancy_oo_yn?: string | null
          data_occupancy_vacant_yn?: string | null
          data_open_mortgage_balance_est?: number | null
          "data_owner_equity%_est"?: number | null
          data_owner_equity$_est?: number | null
          data_owner_inherited_yn?: string | null
          data_owner_investorbuyer_yn?: string | null
          data_owner_is_bank_yn?: string | null
          data_owner_is_entity_yn?: string | null
          data_owner_mortgage_arm_yn?: string | null
          data_owner_mortgage_balance_est?: number | null
          data_owner_mortgage_maturitydate?: string | null
          data_owner_mortgage_payment_est?: number | null
          data_preforeclosure_yn?: string | null
          data_private_lender_yn?: string | null
          data_property_type?: string | null
          data_property_type_MFH2to4?: string | null
          data_property_type_MFH5plus?: string | null
          data_property_type_mobilehome_yn?: string | null
          data_reapi_last_update?: string | null
          data_reapi_loaded_at?: string | null
          data_taxlien_yn?: string | null
          data_value_asis_est?: number | null
          id?: number
          lot_apn?: string | null
          lot_apn_unformatted?: string | null
          lot_census_block?: string | null
          lot_census_block_group?: string | null
          lot_census_tract?: string | null
          lot_landuse?: string | null
          lot_legal_block_number?: string | null
          lot_legal_description?: string | null
          lot_legal_lot_number?: string | null
          lot_legal_section?: string | null
          lot_property_use?: string | null
          lot_size_acres_asis?: number | null
          lot_size_sqft_asis?: number | null
          lot_subdivision?: string | null
          lot_zoning?: string | null
          pi_basement_sqft?: number | null
          pi_basement_sqft_finished?: number | null
          pi_basement_type?: string | null
          pi_buildings_count_asis?: number | null
          pi_construction_method?: string | null
          pi_demo_fmr_1br?: number | null
          pi_demo_fmr_2br?: number | null
          pi_demo_fmr_3br?: number | null
          pi_demo_fmr_4br?: number | null
          pi_demo_fmr_efficiency?: number | null
          pi_demo_fmr_year?: number | null
          pi_demo_hud_area_code?: string | null
          pi_demo_hud_area_name?: string | null
          pi_demo_hud_median_income?: number | null
          pi_demo_suggested_rent?: number | null
          pi_garage_sqft_asis?: number | null
          pi_garage_type?: string | null
          pi_gla_sqft_asis?: number | null
          pi_hoa_fees_annual?: number | null
          pi_hoa_name?: string | null
          pi_hoa_warrantability?: string | null
          pi_latitude?: number | null
          pi_longitude?: number | null
          pi_rooms_bathrooms_asis?: number | null
          pi_rooms_bathrooms_partial_asis?: number | null
          pi_rooms_bedrooms_asis?: number | null
          pi_rooms_count_asis?: number | null
          pi_units_count_asis?: number | null
          pi_year_built?: number | null
          property_id?: number | null
          reapi_id?: number
          tax_amount_annual?: number | null
          tax_year?: number | null
          updated_at?: string | null
          value_arv_estimate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "property_reapi_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property"
            referencedColumns: ["id"]
          },
        ]
      }
      select_uw_outcomes: {
        Row: {
          created_at: string
          description: string | null
          id: number
          label: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          label?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          label?: string
        }
        Relationships: []
      }
      task_templates: {
        Row: {
          assigned_to: number | null
          created_at: string
          date_completed: string | null
          date_reached: string | null
          days_until_due: number | null
          due_date: string | null
          id: number
          milestone_template_id: number | null
          status: Database["public"]["Enums"]["task_status"] | null
          task_action: string | null
          task_description: string | null
          task_name: string | null
          task_order: number | null
          types_applied_to: string | null
        }
        Insert: {
          assigned_to?: number | null
          created_at?: string
          date_completed?: string | null
          date_reached?: string | null
          days_until_due?: number | null
          due_date?: string | null
          id?: number
          milestone_template_id?: number | null
          status?: Database["public"]["Enums"]["task_status"] | null
          task_action?: string | null
          task_description?: string | null
          task_name?: string | null
          task_order?: number | null
          types_applied_to?: string | null
        }
        Update: {
          assigned_to?: number | null
          created_at?: string
          date_completed?: string | null
          date_reached?: string | null
          days_until_due?: number | null
          due_date?: string | null
          id?: number
          milestone_template_id?: number | null
          status?: Database["public"]["Enums"]["task_status"] | null
          task_action?: string | null
          task_description?: string | null
          task_name?: string | null
          task_order?: number | null
          types_applied_to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_templates_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "auth_clerk_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_templates_milestone_template_id_fkey"
            columns: ["milestone_template_id"]
            isOneToOne: false
            referencedRelation: "milestone_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to: number | null
          created_at: string
          date_completed: string | null
          date_reached: string | null
          days_until_due: number | null
          deal_id: number | null
          due_date: string | null
          id: number
          milestone_id: number | null
          status: Database["public"]["Enums"]["task_status"] | null
          task_action: string | null
          task_complete: boolean | null
          task_description: string | null
          task_name: string
          task_order: number | null
        }
        Insert: {
          assigned_to?: number | null
          created_at?: string
          date_completed?: string | null
          date_reached?: string | null
          days_until_due?: number | null
          deal_id?: number | null
          due_date?: string | null
          id?: number
          milestone_id?: number | null
          status?: Database["public"]["Enums"]["task_status"] | null
          task_action?: string | null
          task_complete?: boolean | null
          task_description?: string | null
          task_name?: string
          task_order?: number | null
        }
        Update: {
          assigned_to?: number | null
          created_at?: string
          date_completed?: string | null
          date_reached?: string | null
          days_until_due?: number | null
          deal_id?: number | null
          due_date?: string | null
          id?: number
          milestone_id?: number | null
          status?: Database["public"]["Enums"]["task_status"] | null
          task_action?: string | null
          task_complete?: boolean | null
          task_description?: string | null
          task_name?: string
          task_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "auth_clerk_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      format_address: {
        Args:
          | {
              po_box: string
              street: string
              apt_suite: string
              city: string
              state: string
              postal_code: string
              country: string
            }
          | {
              street?: string
              suite_apt?: string
              city?: string
              state?: string
              postal_code?: string
              country?: string
            }
        Returns: string
      }
      format_deal_name: {
        Args: { property_id: number }
        Returns: string
      }
      get_jsonb_array_element: {
        Args: { array_value: Json; index: number }
        Returns: string
      }
      get_numeric_constant: {
        Args: { constant_name: string }
        Returns: number
      }
      get_state_code: {
        Args: { state_name: string }
        Returns: Database["public"]["Enums"]["us_states"]
      }
      get_text_constant: {
        Args: { constant_name: string }
        Returns: string
      }
      get_yesno_constant: {
        Args: { constant_name: string }
        Returns: Database["public"]["Enums"]["yes_no"]
      }
      ltv: {
        Args: {
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          as_is_value: number
          purchase_price: number
          loan_amount: number
        }
        Returns: number
      }
    }
    Enums: {
      amortization_type: "fixed_rate" | "adjustable_rate"
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
        | "unassigned_awaiting_bids"
      appraisal_order_type: "commercial" | "residential"
      citizenship:
        | "U.S. Citizen"
        | "Permanent Resident"
        | "Non-Permanent Resident"
        | "Foreign National"
      clerk_org_role: "admin" | "member" | "viewer"
      company_role:
        | "Borrowing Entity"
        | "Broker"
        | "Insurance"
        | "Legal"
        | "Title"
        | "Appraisal"
        | "Appraisal Management Company"
        | "Lender"
        | "Loan Buyer"
        | "Balance Sheet Investor"
        | "Environmental"
        | "Escrow"
        | "Entity Member (Layer)"
      condo_type: "warrantable" | "non_warrantable"
      constant_types: "Text" | "Numeric" | "Boolean"
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
        | "Loan Buyer"
      continents:
        | "africa"
        | "antarctica"
        | "asia"
        | "europe"
        | "oceania"
        | "north_america"
        | "south_america"
      country_enum:
        | "Bonaire, Sint Eustatius and Saba"
        | "Curaçao"
        | "Guernsey"
        | "Isle of Man"
        | "Jersey"
        | "Åland Islands"
        | "Montenegro"
        | "Saint Barthélemy"
        | "Saint Martin (French part)"
        | "Serbia"
        | "Sint Maarten (Dutch part)"
        | "South Sudan"
        | "Timor-Leste"
        | "American Samoa"
        | "Andorra"
        | "Angola"
        | "Anguilla"
        | "Antarctica"
        | "Antigua and Barbuda"
        | "Argentina"
        | "Armenia"
        | "Aruba"
        | "Australia"
        | "Austria"
        | "Azerbaijan"
        | "Bahamas"
        | "Bahrain"
        | "Bangladesh"
        | "Barbados"
        | "Belarus"
        | "Belgium"
        | "Belize"
        | "Benin"
        | "Bermuda"
        | "Bhutan"
        | "Bolivia"
        | "Bosnia and Herzegovina"
        | "Botswana"
        | "Bouvet Island"
        | "Brazil"
        | "British Indian Ocean Territory"
        | "Brunei Darussalam"
        | "Bulgaria"
        | "Burkina Faso"
        | "Burundi"
        | "Cambodia"
        | "Cameroon"
        | "Canada"
        | "Cape Verde"
        | "Cayman Islands"
        | "Central African Republic"
        | "Chad"
        | "Chile"
        | "China"
        | "Christmas Island"
        | "Cocos (Keeling) Islands"
        | "Colombia"
        | "Comoros"
        | "Congo"
        | "Congo, the Democratic Republic of the"
        | "Cook Islands"
        | "Costa Rica"
        | "Cote DIvoire"
        | "Croatia"
        | "Cuba"
        | "Cyprus"
        | "Czech Republic"
        | "Denmark"
        | "Djibouti"
        | "Dominica"
        | "Dominican Republic"
        | "Ecuador"
        | "Egypt"
        | "El Salvador"
        | "Equatorial Guinea"
        | "Eritrea"
        | "Estonia"
        | "Ethiopia"
        | "Falkland Islands (Malvinas)"
        | "Faroe Islands"
        | "Fiji"
        | "Finland"
        | "France"
        | "French Guiana"
        | "French Polynesia"
        | "French Southern Territories"
        | "Gabon"
        | "Gambia"
        | "Georgia"
        | "Germany"
        | "Ghana"
        | "Gibraltar"
        | "Greece"
        | "Greenland"
        | "Grenada"
        | "Guadeloupe"
        | "Guam"
        | "Guatemala"
        | "Guinea"
        | "Guinea-Bissau"
        | "Guyana"
        | "Haiti"
        | "Heard Island and Mcdonald Islands"
        | "Holy See (Vatican City State)"
        | "Honduras"
        | "Hong Kong"
        | "Hungary"
        | "Iceland"
        | "India"
        | "Indonesia"
        | "Iran, Islamic Republic of"
        | "Iraq"
        | "Ireland"
        | "Israel"
        | "Italy"
        | "Jamaica"
        | "Japan"
        | "Jordan"
        | "Kazakhstan"
        | "Kenya"
        | "Kiribati"
        | "Korea, Democratic People's Republic of"
        | "Korea, Republic of"
        | "Kuwait"
        | "Kyrgyzstan"
        | "Lao People's Democratic Republic"
        | "Latvia"
        | "Lebanon"
        | "Lesotho"
        | "Liberia"
        | "Libya"
        | "Liechtenstein"
        | "Lithuania"
        | "Luxembourg"
        | "Macao"
        | "Macedonia, the Former Yugoslav Republic of"
        | "Madagascar"
        | "Malawi"
        | "Malaysia"
        | "Maldives"
        | "Mali"
        | "Malta"
        | "Marshall Islands"
        | "Martinique"
        | "Mauritania"
        | "Mauritius"
        | "Mayotte"
        | "Mexico"
        | "Micronesia, Federated States of"
        | "Moldova, Republic of"
        | "Monaco"
        | "Mongolia"
        | "Albania"
        | "Montserrat"
        | "Morocco"
        | "Mozambique"
        | "Myanmar"
        | "Namibia"
        | "Nauru"
        | "Nepal"
        | "Netherlands"
        | "New Caledonia"
        | "New Zealand"
        | "Nicaragua"
        | "Niger"
        | "Nigeria"
        | "Niue"
        | "Norfolk Island"
        | "Northern Mariana Islands"
        | "Norway"
        | "Oman"
        | "Pakistan"
        | "Palau"
        | "Palestine, State of"
        | "Panama"
        | "Papua New Guinea"
        | "Paraguay"
        | "Peru"
        | "Philippines"
        | "Pitcairn"
        | "Poland"
        | "Portugal"
        | "Puerto Rico"
        | "Qatar"
        | "Reunion"
        | "Romania"
        | "Russian Federation"
        | "Rwanda"
        | "Saint Helena, Ascension and Tristan da Cunha"
        | "Saint Kitts and Nevis"
        | "Saint Lucia"
        | "Saint Pierre and Miquelon"
        | "Saint Vincent and the Grenadines"
        | "Samoa"
        | "San Marino"
        | "Sao Tome and Principe"
        | "Saudi Arabia"
        | "Senegal"
        | "Seychelles"
        | "Sierra Leone"
        | "Singapore"
        | "Slovakia"
        | "Slovenia"
        | "Solomon Islands"
        | "Somalia"
        | "South Africa"
        | "South Georgia and the South Sandwich Islands"
        | "Spain"
        | "Sri Lanka"
        | "Sudan"
        | "Suriname"
        | "Svalbard and Jan Mayen"
        | "Swaziland"
        | "Sweden"
        | "Switzerland"
        | "Syrian Arab Republic"
        | "Taiwan (Province of China)"
        | "Tajikistan"
        | "Tanzania, United Republic of"
        | "Thailand"
        | "Togo"
        | "Tokelau"
        | "Tonga"
        | "Trinidad and Tobago"
        | "Tunisia"
        | "Turkey"
        | "Turkmenistan"
        | "Turks and Caicos Islands"
        | "Tuvalu"
        | "Uganda"
        | "Ukraine"
        | "United Arab Emirates"
        | "United Kingdom"
        | "United States"
        | "United States Minor Outlying Islands"
        | "Uruguay"
        | "Uzbekistan"
        | "Vanuatu"
        | "Venezuela"
        | "Viet Nam"
        | "Virgin Islands (British)"
        | "Virgin Islands (U.S.)"
        | "Wallis and Futuna"
        | "Western Sahara"
        | "Yemen"
        | "Zambia"
        | "Zimbabwe"
        | "Afghanistan"
        | "Algeria"
      credit_check_status:
        | "Payment Needed"
        | "Paid"
        | "Approved"
        | "Denied"
        | "Frozen"
        | "Under Review"
      deal_disposition_1: "active" | "dead" | "on_hold"
      deal_stage_1: "lead" | "scenario" | "deal"
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
        | "closed_and_funded"
      deal_status_primary:
        | "Scenario"
        | "Loan Setup"
        | "Pre-Qual Review (PQR)"
        | "Processing I"
        | "Appraisal Review"
        | "Processing II"
        | "Pre-Submission Review (PSR)"
        | "Underwriting"
        | "Conditionally Approved"
        | "Clear to Close"
        | "Closed & Funded"
      deal_status_primary__old_version_to_be_dropped:
        | "Prequal"
        | "Scenario"
        | "Active"
        | "Complete"
        | "Dead/Archived"
      debt_instrument_type:
        | "mortgage_note"
        | "bridge_loan"
        | "construction_loan"
        | "rehab_loan"
        | "senior_debt"
        | "convertible_note"
        | "mortgage_pool"
        | "asset_backed_security"
        | "other"
      document_category:
        | "application"
        | "appraisal"
        | "assets"
        | "closing"
        | "credit_and_background"
        | "construction"
        | "environmental"
        | "experience"
        | "id"
        | "insurance"
        | "pricing"
        | "property"
        | "seasoning"
        | "servicing"
        | "title"
        | "entity"
      document_role:
        | "Loan Officer"
        | "Loan Opener"
        | "Processor"
        | "Broker"
        | "Borrower"
        | "Borrower/Broker"
        | "Processor/Broker"
      document_status:
        | "approved"
        | "pending_review"
        | "pending_submission"
        | "pending_exception"
        | "rejected_items_needed"
        | "rejected_revisions_needed"
        | "rejected_signature_needed"
      entity_type:
        | "corp"
        | "general_partnership"
        | "limited_liability_company"
        | "limited_liability_partnership"
        | "limited_partnership"
        | "s_corp"
        | "sole_proprietorship"
      fee_type:
        | "lender_fee"
        | "broker_fee"
        | "appraisal_fee"
        | "title_fee"
        | "property_tax_-_city/town"
        | "property_tax_-_county"
        | "property_tax_-_school"
        | "lender_holdback"
        | "lender_reserve"
        | "insurance _premium"
        | "credit_and_background_fee"
        | "judgment"
        | "lien"
        | "recording_and_transfer_fee"
        | "transfer_tax"
        | "lender_escrow"
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
        | "reia"
      lease_length: "N/A" | "STR" | "Unoccupied" | "12" | "24" | "36"
      ledger_entry_type: "contribution" | "redemption" | "interest" | "fee"
      loan_accrual_type: "30/360" | "30/365" | "Actual 360" | "Actual 365"
      loan_amortization: "interest_only" | "300" | "360"
      loan_program: "BPL Program A" | "BPL Program B"
      loan_structure_dscr:
        | "30_yr_fixed"
        | "5/1_arm"
        | "7/1_arm"
        | "10/1_arm_io"
        | "5/6_arm"
        | "10/6_arm"
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
        | "360"
      loan_type_1: "dscr" | "rtl"
      loan_type_2: "bridge" | "bridge_plus_rehab"
      marital_status: "Married" | "Separated" | "Unmarried"
      milestone_status: "to_do" | "in_progress" | "completed"
      ppp_structure:
        | "Declining"
        | "Fixed 5%"
        | "Fixed 4%"
        | "Fixed 3%"
        | "Fixed 2%"
        | "Fixed 1%"
        | "Interest"
        | "Minimum Interest"
      ppp_structure_1: "declining" | "fixed" | "minimum_interest"
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
        | "120"
      professional_license:
        | "Appraiser"
        | "Certified Public Accountant (CPA)"
        | "General Contractor"
        | "Lender"
        | "Mortgage (NMLS)"
        | "Real Estate Broker"
        | "Property Manager"
      project_status: "Sold" | "Held" | "In Progress"
      project_type:
        | "fix_and_flip"
        | "ground_up"
        | "rental"
        | "stabilized_bridge"
      property_appraisal_status:
        | "Payment Needed"
        | "Paid"
        | "Ordered"
        | "Received"
        | "Revision Needed"
        | "Revision Requested"
        | "Completed"
      property_lease_term_status: "active" | "expired" | "month_to_month"
      property_occupancy: "Vacant" | "Tenant Occupied" | "Owner Occupied"
      property_type:
        | "Single Family"
        | "Condominium"
        | "Condominium Warrantable"
        | "Condominium Non-Warrantable"
        | "Multifamily 2-4"
        | "Multifamily 5-10"
        | "Townhome/PUD"
        | "Multifamily 11+"
        | "Mixed Use 2-4"
        | "Mixed Use 5-10"
        | "Mixed Use 11+"
        | "Other"
      residence_ownership: "Own" | "Rent"
      task_status: "not_started" | "in_progress" | "completed"
      transaction_method:
        | "ach"
        | "billpay"
        | "cash"
        | "check"
        | "credit_card"
        | "cryptocurrency"
        | "debit_card"
        | "internal"
        | "rtp"
        | "wire"
        | "other"
      transaction_reference_type: "federal_reference_number" | "imad" | "omad"
      transaction_status:
        | "canceled"
        | "completed"
        | "failed"
        | "initiated"
        | "on_hold"
        | "owed"
        | "pending"
        | "processing"
        | "refunded"
        | "returned"
        | "scheduled"
      transaction_type:
        | "purchase"
        | "delayed_purchase"
        | "refinance_rate_term"
        | "refinance_cash_out"
      true_false: "true" | "false"
      us_states:
        | "AL"
        | "AK"
        | "AZ"
        | "AR"
        | "CA"
        | "CO"
        | "CT"
        | "DC"
        | "DE"
        | "FL"
        | "GA"
        | "HI"
        | "ID"
        | "IL"
        | "IN"
        | "IA"
        | "KS"
        | "KY"
        | "LA"
        | "ME"
        | "MD"
        | "MA"
        | "MI"
        | "MN"
        | "MS"
        | "MO"
        | "MT"
        | "NE"
        | "NV"
        | "NH"
        | "NJ"
        | "NM"
        | "NY"
        | "NC"
        | "ND"
        | "OH"
        | "OK"
        | "OR"
        | "PA"
        | "PR"
        | "RI"
        | "SC"
        | "SD"
        | "TN"
        | "TX"
        | "UT"
        | "VT"
        | "VA"
        | "WA"
        | "WV"
        | "WI"
        | "WY"
      us_states_long:
        | "alabama"
        | "alaska"
        | "arizona"
        | "arkansas"
        | "california"
        | "colorado"
        | "connecticut"
        | "delaware"
        | "district_of_columbia"
        | "florida"
        | "georgia"
        | "hawaii"
        | "idaho"
        | "illinois"
        | "indiana"
        | "iowa"
        | "kansas"
        | "kentucky"
        | "louisiana"
        | "maine"
        | "maryland"
        | "massachusetts"
        | "michigan"
        | "minnesota"
        | "mississippi"
        | "missouri"
        | "montana"
        | "nebraska"
        | "nevada"
        | "new_hampshire"
        | "new_jersey"
        | "new_mexico"
        | "new_york"
        | "north_carolina"
        | "north_dakota"
        | "ohio"
        | "oklahoma"
        | "oregon"
        | "pennsylvania"
        | "rhode_island"
        | "south_carolina"
        | "south_dakota"
        | "tennessee"
        | "texas"
        | "utah"
        | "vermont"
        | "virginia"
        | "washington"
        | "west_virginia"
        | "wisconsin"
        | "wyoming"
      user_role_internal:
        | "admin"
        | "account_executive"
        | "loan_processor"
        | "balance_sheet_investor"
        | "loan_opener"
      vesting_type: "entity" | "Individual"
      warrantability: "warrantable" | "non-warrantable"
      yes_no: "yes" | "no"
    }
    CompositeTypes: {
      ltv_scores: {
        ltv_1: number | null
        ltv_2: number | null
        ltv_3: number | null
        ltv_4: number | null
        ltv_5: number | null
        ltv_6: number | null
        ltv_7: number | null
      }
      max_ltv_scores: {
        purchase_ltv: number | null
        delayed_purchase_ltv: number | null
        refinance_rt_ltv: number | null
        refinance_co_ltv: number | null
      }
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      amortization_type: ["fixed_rate", "adjustable_rate"],
      appraisal_order_status: [
        "accepted_by_vendor",
        "action_required",
        "appraiser_waiting_for_contract",
        "appraiser_waiting_for_lease",
        "appraiser_waiting_for_questionnaire",
        "assigned_to_vendor",
        "awaiting_confirmation_for_appointment",
        "awaiting_fee_approval_from_client",
        "awaiting_info_from_client",
        "awaiting_trip_fee_approval_to_proceed",
        "cancelled",
        "completed",
        "declined_by_vendor",
        "file_in_review",
        "in_progress",
        "inspected",
        "inspection_scheduled",
        "left_message_with_contact",
        "on_hold",
        "order_Is_due_today",
        "payment_pending",
        "please_submit_report_order_past_due",
        "reconsideration_requested",
        "reconsideration_requested_urgent",
        "report_accepted",
        "report_accepted_awaiting_payment",
        "revision_requested",
        "revision_requested_urgent",
        "unassigned",
        "unassigned_awaiting_bids",
      ],
      appraisal_order_type: ["commercial", "residential"],
      citizenship: [
        "U.S. Citizen",
        "Permanent Resident",
        "Non-Permanent Resident",
        "Foreign National",
      ],
      clerk_org_role: ["admin", "member", "viewer"],
      company_role: [
        "Borrowing Entity",
        "Broker",
        "Insurance",
        "Legal",
        "Title",
        "Appraisal",
        "Appraisal Management Company",
        "Lender",
        "Loan Buyer",
        "Balance Sheet Investor",
        "Environmental",
        "Escrow",
        "Entity Member (Layer)",
      ],
      condo_type: ["warrantable", "non_warrantable"],
      constant_types: ["Text", "Numeric", "Boolean"],
      contact_type: [
        "Appraisal Administration",
        "Appraisal Management Company",
        "Appraiser",
        "Borrower",
        "Borrower Assistant",
        "Broker",
        "Broker Loan Processor",
        "General Contractor",
        "Entity Member",
        "Escrow",
        "Insurance",
        "Balance Sheet Investor",
        "Lender",
        "Point of Contact",
        "Referring Party",
        "Title",
        "Transaction Coordinator",
        "Loan Buyer",
      ],
      continents: [
        "africa",
        "antarctica",
        "asia",
        "europe",
        "oceania",
        "north_america",
        "south_america",
      ],
      country_enum: [
        "Bonaire, Sint Eustatius and Saba",
        "Curaçao",
        "Guernsey",
        "Isle of Man",
        "Jersey",
        "Åland Islands",
        "Montenegro",
        "Saint Barthélemy",
        "Saint Martin (French part)",
        "Serbia",
        "Sint Maarten (Dutch part)",
        "South Sudan",
        "Timor-Leste",
        "American Samoa",
        "Andorra",
        "Angola",
        "Anguilla",
        "Antarctica",
        "Antigua and Barbuda",
        "Argentina",
        "Armenia",
        "Aruba",
        "Australia",
        "Austria",
        "Azerbaijan",
        "Bahamas",
        "Bahrain",
        "Bangladesh",
        "Barbados",
        "Belarus",
        "Belgium",
        "Belize",
        "Benin",
        "Bermuda",
        "Bhutan",
        "Bolivia",
        "Bosnia and Herzegovina",
        "Botswana",
        "Bouvet Island",
        "Brazil",
        "British Indian Ocean Territory",
        "Brunei Darussalam",
        "Bulgaria",
        "Burkina Faso",
        "Burundi",
        "Cambodia",
        "Cameroon",
        "Canada",
        "Cape Verde",
        "Cayman Islands",
        "Central African Republic",
        "Chad",
        "Chile",
        "China",
        "Christmas Island",
        "Cocos (Keeling) Islands",
        "Colombia",
        "Comoros",
        "Congo",
        "Congo, the Democratic Republic of the",
        "Cook Islands",
        "Costa Rica",
        "Cote DIvoire",
        "Croatia",
        "Cuba",
        "Cyprus",
        "Czech Republic",
        "Denmark",
        "Djibouti",
        "Dominica",
        "Dominican Republic",
        "Ecuador",
        "Egypt",
        "El Salvador",
        "Equatorial Guinea",
        "Eritrea",
        "Estonia",
        "Ethiopia",
        "Falkland Islands (Malvinas)",
        "Faroe Islands",
        "Fiji",
        "Finland",
        "France",
        "French Guiana",
        "French Polynesia",
        "French Southern Territories",
        "Gabon",
        "Gambia",
        "Georgia",
        "Germany",
        "Ghana",
        "Gibraltar",
        "Greece",
        "Greenland",
        "Grenada",
        "Guadeloupe",
        "Guam",
        "Guatemala",
        "Guinea",
        "Guinea-Bissau",
        "Guyana",
        "Haiti",
        "Heard Island and Mcdonald Islands",
        "Holy See (Vatican City State)",
        "Honduras",
        "Hong Kong",
        "Hungary",
        "Iceland",
        "India",
        "Indonesia",
        "Iran, Islamic Republic of",
        "Iraq",
        "Ireland",
        "Israel",
        "Italy",
        "Jamaica",
        "Japan",
        "Jordan",
        "Kazakhstan",
        "Kenya",
        "Kiribati",
        "Korea, Democratic People's Republic of",
        "Korea, Republic of",
        "Kuwait",
        "Kyrgyzstan",
        "Lao People's Democratic Republic",
        "Latvia",
        "Lebanon",
        "Lesotho",
        "Liberia",
        "Libya",
        "Liechtenstein",
        "Lithuania",
        "Luxembourg",
        "Macao",
        "Macedonia, the Former Yugoslav Republic of",
        "Madagascar",
        "Malawi",
        "Malaysia",
        "Maldives",
        "Mali",
        "Malta",
        "Marshall Islands",
        "Martinique",
        "Mauritania",
        "Mauritius",
        "Mayotte",
        "Mexico",
        "Micronesia, Federated States of",
        "Moldova, Republic of",
        "Monaco",
        "Mongolia",
        "Albania",
        "Montserrat",
        "Morocco",
        "Mozambique",
        "Myanmar",
        "Namibia",
        "Nauru",
        "Nepal",
        "Netherlands",
        "New Caledonia",
        "New Zealand",
        "Nicaragua",
        "Niger",
        "Nigeria",
        "Niue",
        "Norfolk Island",
        "Northern Mariana Islands",
        "Norway",
        "Oman",
        "Pakistan",
        "Palau",
        "Palestine, State of",
        "Panama",
        "Papua New Guinea",
        "Paraguay",
        "Peru",
        "Philippines",
        "Pitcairn",
        "Poland",
        "Portugal",
        "Puerto Rico",
        "Qatar",
        "Reunion",
        "Romania",
        "Russian Federation",
        "Rwanda",
        "Saint Helena, Ascension and Tristan da Cunha",
        "Saint Kitts and Nevis",
        "Saint Lucia",
        "Saint Pierre and Miquelon",
        "Saint Vincent and the Grenadines",
        "Samoa",
        "San Marino",
        "Sao Tome and Principe",
        "Saudi Arabia",
        "Senegal",
        "Seychelles",
        "Sierra Leone",
        "Singapore",
        "Slovakia",
        "Slovenia",
        "Solomon Islands",
        "Somalia",
        "South Africa",
        "South Georgia and the South Sandwich Islands",
        "Spain",
        "Sri Lanka",
        "Sudan",
        "Suriname",
        "Svalbard and Jan Mayen",
        "Swaziland",
        "Sweden",
        "Switzerland",
        "Syrian Arab Republic",
        "Taiwan (Province of China)",
        "Tajikistan",
        "Tanzania, United Republic of",
        "Thailand",
        "Togo",
        "Tokelau",
        "Tonga",
        "Trinidad and Tobago",
        "Tunisia",
        "Turkey",
        "Turkmenistan",
        "Turks and Caicos Islands",
        "Tuvalu",
        "Uganda",
        "Ukraine",
        "United Arab Emirates",
        "United Kingdom",
        "United States",
        "United States Minor Outlying Islands",
        "Uruguay",
        "Uzbekistan",
        "Vanuatu",
        "Venezuela",
        "Viet Nam",
        "Virgin Islands (British)",
        "Virgin Islands (U.S.)",
        "Wallis and Futuna",
        "Western Sahara",
        "Yemen",
        "Zambia",
        "Zimbabwe",
        "Afghanistan",
        "Algeria",
      ],
      credit_check_status: [
        "Payment Needed",
        "Paid",
        "Approved",
        "Denied",
        "Frozen",
        "Under Review",
      ],
      deal_disposition_1: ["active", "dead", "on_hold"],
      deal_stage_1: ["lead", "scenario", "deal"],
      deal_stage_2: [
        "loan_setup",
        "processing_1",
        "appraisal_review",
        "processing_2",
        "qc_1",
        "underwriting",
        "conditionally_approved",
        "qc_2",
        "clear_to_close",
        "closed_and_funded",
      ],
      deal_status_primary: [
        "Scenario",
        "Loan Setup",
        "Pre-Qual Review (PQR)",
        "Processing I",
        "Appraisal Review",
        "Processing II",
        "Pre-Submission Review (PSR)",
        "Underwriting",
        "Conditionally Approved",
        "Clear to Close",
        "Closed & Funded",
      ],
      deal_status_primary__old_version_to_be_dropped: [
        "Prequal",
        "Scenario",
        "Active",
        "Complete",
        "Dead/Archived",
      ],
      debt_instrument_type: [
        "mortgage_note",
        "bridge_loan",
        "construction_loan",
        "rehab_loan",
        "senior_debt",
        "convertible_note",
        "mortgage_pool",
        "asset_backed_security",
        "other",
      ],
      document_category: [
        "application",
        "appraisal",
        "assets",
        "closing",
        "credit_and_background",
        "construction",
        "environmental",
        "experience",
        "id",
        "insurance",
        "pricing",
        "property",
        "seasoning",
        "servicing",
        "title",
        "entity",
      ],
      document_role: [
        "Loan Officer",
        "Loan Opener",
        "Processor",
        "Broker",
        "Borrower",
        "Borrower/Broker",
        "Processor/Broker",
      ],
      document_status: [
        "approved",
        "pending_review",
        "pending_submission",
        "pending_exception",
        "rejected_items_needed",
        "rejected_revisions_needed",
        "rejected_signature_needed",
      ],
      entity_type: [
        "corp",
        "general_partnership",
        "limited_liability_company",
        "limited_liability_partnership",
        "limited_partnership",
        "s_corp",
        "sole_proprietorship",
      ],
      fee_type: [
        "lender_fee",
        "broker_fee",
        "appraisal_fee",
        "title_fee",
        "property_tax_-_city/town",
        "property_tax_-_county",
        "property_tax_-_school",
        "lender_holdback",
        "lender_reserve",
        "insurance _premium",
        "credit_and_background_fee",
        "judgment",
        "lien",
        "recording_and_transfer_fee",
        "transfer_tax",
        "lender_escrow",
      ],
      lead_source: [
        "biggerpockets",
        "broker",
        "brrrr.com_chat",
        "brrrr.com_form_submission",
        "direct_mail_marketing",
        "email_marketing",
        "event_conference_tradeshow",
        "existing_client",
        "podcast",
        "search_engine",
        "referral",
        "social_media",
        "other",
        "reia",
      ],
      lease_length: ["N/A", "STR", "Unoccupied", "12", "24", "36"],
      ledger_entry_type: ["contribution", "redemption", "interest", "fee"],
      loan_accrual_type: ["30/360", "30/365", "Actual 360", "Actual 365"],
      loan_amortization: ["interest_only", "300", "360"],
      loan_program: ["BPL Program A", "BPL Program B"],
      loan_structure_dscr: [
        "30_yr_fixed",
        "5/1_arm",
        "7/1_arm",
        "10/1_arm_io",
        "5/6_arm",
        "10/6_arm",
      ],
      loan_term_months: [
        "6",
        "12",
        "15",
        "18",
        "24",
        "36",
        "48",
        "60",
        "72",
        "84",
        "96",
        "108",
        "120",
        "300",
        "360",
      ],
      loan_type_1: ["dscr", "rtl"],
      loan_type_2: ["bridge", "bridge_plus_rehab"],
      marital_status: ["Married", "Separated", "Unmarried"],
      milestone_status: ["to_do", "in_progress", "completed"],
      ppp_structure: [
        "Declining",
        "Fixed 5%",
        "Fixed 4%",
        "Fixed 3%",
        "Fixed 2%",
        "Fixed 1%",
        "Interest",
        "Minimum Interest",
      ],
      ppp_structure_1: ["declining", "fixed", "minimum_interest"],
      ppp_term: [
        "0",
        "12",
        "24",
        "36",
        "48",
        "60",
        "72",
        "84",
        "96",
        "108",
        "120",
      ],
      professional_license: [
        "Appraiser",
        "Certified Public Accountant (CPA)",
        "General Contractor",
        "Lender",
        "Mortgage (NMLS)",
        "Real Estate Broker",
        "Property Manager",
      ],
      project_status: ["Sold", "Held", "In Progress"],
      project_type: [
        "fix_and_flip",
        "ground_up",
        "rental",
        "stabilized_bridge",
      ],
      property_appraisal_status: [
        "Payment Needed",
        "Paid",
        "Ordered",
        "Received",
        "Revision Needed",
        "Revision Requested",
        "Completed",
      ],
      property_lease_term_status: ["active", "expired", "month_to_month"],
      property_occupancy: ["Vacant", "Tenant Occupied", "Owner Occupied"],
      property_type: [
        "Single Family",
        "Condominium",
        "Condominium Warrantable",
        "Condominium Non-Warrantable",
        "Multifamily 2-4",
        "Multifamily 5-10",
        "Townhome/PUD",
        "Multifamily 11+",
        "Mixed Use 2-4",
        "Mixed Use 5-10",
        "Mixed Use 11+",
        "Other",
      ],
      residence_ownership: ["Own", "Rent"],
      task_status: ["not_started", "in_progress", "completed"],
      transaction_method: [
        "ach",
        "billpay",
        "cash",
        "check",
        "credit_card",
        "cryptocurrency",
        "debit_card",
        "internal",
        "rtp",
        "wire",
        "other",
      ],
      transaction_reference_type: ["federal_reference_number", "imad", "omad"],
      transaction_status: [
        "canceled",
        "completed",
        "failed",
        "initiated",
        "on_hold",
        "owed",
        "pending",
        "processing",
        "refunded",
        "returned",
        "scheduled",
      ],
      transaction_type: [
        "purchase",
        "delayed_purchase",
        "refinance_rate_term",
        "refinance_cash_out",
      ],
      true_false: ["true", "false"],
      us_states: [
        "AL",
        "AK",
        "AZ",
        "AR",
        "CA",
        "CO",
        "CT",
        "DC",
        "DE",
        "FL",
        "GA",
        "HI",
        "ID",
        "IL",
        "IN",
        "IA",
        "KS",
        "KY",
        "LA",
        "ME",
        "MD",
        "MA",
        "MI",
        "MN",
        "MS",
        "MO",
        "MT",
        "NE",
        "NV",
        "NH",
        "NJ",
        "NM",
        "NY",
        "NC",
        "ND",
        "OH",
        "OK",
        "OR",
        "PA",
        "PR",
        "RI",
        "SC",
        "SD",
        "TN",
        "TX",
        "UT",
        "VT",
        "VA",
        "WA",
        "WV",
        "WI",
        "WY",
      ],
      us_states_long: [
        "alabama",
        "alaska",
        "arizona",
        "arkansas",
        "california",
        "colorado",
        "connecticut",
        "delaware",
        "district_of_columbia",
        "florida",
        "georgia",
        "hawaii",
        "idaho",
        "illinois",
        "indiana",
        "iowa",
        "kansas",
        "kentucky",
        "louisiana",
        "maine",
        "maryland",
        "massachusetts",
        "michigan",
        "minnesota",
        "mississippi",
        "missouri",
        "montana",
        "nebraska",
        "nevada",
        "new_hampshire",
        "new_jersey",
        "new_mexico",
        "new_york",
        "north_carolina",
        "north_dakota",
        "ohio",
        "oklahoma",
        "oregon",
        "pennsylvania",
        "rhode_island",
        "south_carolina",
        "south_dakota",
        "tennessee",
        "texas",
        "utah",
        "vermont",
        "virginia",
        "washington",
        "west_virginia",
        "wisconsin",
        "wyoming",
      ],
      user_role_internal: [
        "admin",
        "account_executive",
        "loan_processor",
        "balance_sheet_investor",
        "loan_opener",
      ],
      vesting_type: ["entity", "Individual"],
      warrantability: ["warrantable", "non-warrantable"],
      yes_no: ["yes", "no"],
    },
  },
} as const

