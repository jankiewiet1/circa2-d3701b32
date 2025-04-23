export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      calculation_logs: {
        Row: {
          company_id: string | null
          created_at: string | null
          id: string
          log_message: string | null
          log_type: string | null
          related_id: string | null
          user_id: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          log_message?: string | null
          log_type?: string | null
          related_id?: string | null
          user_id?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          log_message?: string | null
          log_type?: string | null
          related_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calculation_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          bank_name: string | null
          billing_address: string | null
          billing_email: string | null
          city: string | null
          contact_email: string | null
          contact_name: string | null
          contact_title: string | null
          country: string | null
          created_at: string | null
          created_by_user_id: string | null
          iban: string | null
          id: string
          industry: string | null
          kvk_number: string | null
          name: string
          phone_number: string | null
          postal_code: string | null
          setup_completed: boolean | null
          updated_at: string | null
          vat_number: string | null
        }
        Insert: {
          bank_name?: string | null
          billing_address?: string | null
          billing_email?: string | null
          city?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_title?: string | null
          country?: string | null
          created_at?: string | null
          created_by_user_id?: string | null
          iban?: string | null
          id?: string
          industry?: string | null
          kvk_number?: string | null
          name: string
          phone_number?: string | null
          postal_code?: string | null
          setup_completed?: boolean | null
          updated_at?: string | null
          vat_number?: string | null
        }
        Update: {
          bank_name?: string | null
          billing_address?: string | null
          billing_email?: string | null
          city?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_title?: string | null
          country?: string | null
          created_at?: string | null
          created_by_user_id?: string | null
          iban?: string | null
          id?: string
          industry?: string | null
          kvk_number?: string | null
          name?: string
          phone_number?: string | null
          postal_code?: string | null
          setup_completed?: boolean | null
          updated_at?: string | null
          vat_number?: string | null
        }
        Relationships: []
      }
      company_invitations: {
        Row: {
          company_id: string | null
          created_at: string | null
          email: string
          id: string
          invited_by: string | null
          role: string | null
          status: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          email: string
          id?: string
          invited_by?: string | null
          role?: string | null
          status?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          email?: string
          id?: string
          invited_by?: string | null
          role?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_invitations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_members: {
        Row: {
          company_id: string | null
          created_at: string | null
          id: string
          joined_at: string | null
          role: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          joined_at?: string | null
          role?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          joined_at?: string | null
          role?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_preferences: {
        Row: {
          company_id: string
          created_at: string | null
          default_view: string
          emission_unit: string
          fiscal_year_start_month: string | null
          id: string
          language: string | null
          preferred_currency: string | null
          preferred_emission_source: string | null
          reporting_frequency: string | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          default_view?: string
          emission_unit?: string
          fiscal_year_start_month?: string | null
          id?: string
          language?: string | null
          preferred_currency?: string | null
          preferred_emission_source?: string | null
          reporting_frequency?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          default_view?: string
          emission_unit?: string
          fiscal_year_start_month?: string | null
          id?: string
          language?: string | null
          preferred_currency?: string | null
          preferred_emission_source?: string | null
          reporting_frequency?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_preferences_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      emission_entries: {
        Row: {
          category: string
          ch4_emissions: number | null
          co2_emissions: number | null
          company_id: string
          created_at: string
          date: string
          description: string
          emission_factor: number | null
          emissions: number | null
          id: string
          match_status: string | null
          n2o_emissions: number | null
          notes: string | null
          quantity: number
          scope: number
          unit: string
          updated_at: string
          upload_session_id: string | null
          year: number | null
        }
        Insert: {
          category: string
          ch4_emissions?: number | null
          co2_emissions?: number | null
          company_id: string
          created_at?: string
          date: string
          description: string
          emission_factor?: number | null
          emissions?: number | null
          id?: string
          match_status?: string | null
          n2o_emissions?: number | null
          notes?: string | null
          quantity: number
          scope: number
          unit: string
          updated_at?: string
          upload_session_id?: string | null
          year?: number | null
        }
        Update: {
          category?: string
          ch4_emissions?: number | null
          co2_emissions?: number | null
          company_id?: string
          created_at?: string
          date?: string
          description?: string
          emission_factor?: number | null
          emissions?: number | null
          id?: string
          match_status?: string | null
          n2o_emissions?: number | null
          notes?: string | null
          quantity?: number
          scope?: number
          unit?: string
          updated_at?: string
          upload_session_id?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "emission_entries_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emission_entries_upload_session_id_fkey"
            columns: ["upload_session_id"]
            isOneToOne: false
            referencedRelation: "upload_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      emission_factors: {
        Row: {
          category_1: string
          category_2: string
          category_3: string
          category_4: string
          "Column Text": string
          "GHG Conversion Factor 2024": number | null
          "GHG/Unit": string
          ID: number
          scope: string
          Source: string
          uom: string
        }
        Insert: {
          category_1?: string
          category_2?: string
          category_3?: string
          category_4?: string
          "Column Text"?: string
          "GHG Conversion Factor 2024"?: number | null
          "GHG/Unit"?: string
          ID?: number
          scope?: string
          Source?: string
          uom?: string
        }
        Update: {
          category_1?: string
          category_2?: string
          category_3?: string
          category_4?: string
          "Column Text"?: string
          "GHG Conversion Factor 2024"?: number | null
          "GHG/Unit"?: string
          ID?: number
          scope?: string
          Source?: string
          uom?: string
        }
        Relationships: []
      }
      emission_matching_diagnostics: {
        Row: {
          category: string | null
          checked_at: string | null
          company_id: string | null
          entry_id: string | null
          id: string
          reason: string | null
          scope: number | null
          unit: string | null
        }
        Insert: {
          category?: string | null
          checked_at?: string | null
          company_id?: string | null
          entry_id?: string | null
          id?: string
          reason?: string | null
          scope?: number | null
          unit?: string | null
        }
        Update: {
          category?: string | null
          checked_at?: string | null
          company_id?: string | null
          entry_id?: string | null
          id?: string
          reason?: string | null
          scope?: number | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emission_matching_diagnostics_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "emission_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          department: string | null
          email: string | null
          first_name: string | null
          id: string
          job_title: string | null
          last_name: string | null
          phone_number: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          job_title?: string | null
          last_name?: string | null
          phone_number?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          job_title?: string | null
          last_name?: string | null
          phone_number?: string | null
        }
        Relationships: []
      }
      scope1_emissions: {
        Row: {
          activity_data: string | null
          additional_notes: string | null
          amount: number | null
          company_id: string | null
          created_at: string | null
          date: string | null
          emission_factor_source: string | null
          emissions_co2e: number | null
          events_affecting_data: string | null
          fuel_type: string | null
          id: string
          progress_toward_target: string | null
          ratio_indicators: string | null
          reporting_boundary: string | null
          reporting_period: string | null
          scope_description: string | null
          source: string | null
          trend_notes: string | null
          uncertainty_notes: string | null
          unit: string | null
          uploaded_by: string | null
        }
        Insert: {
          activity_data?: string | null
          additional_notes?: string | null
          amount?: number | null
          company_id?: string | null
          created_at?: string | null
          date?: string | null
          emission_factor_source?: string | null
          emissions_co2e?: number | null
          events_affecting_data?: string | null
          fuel_type?: string | null
          id?: string
          progress_toward_target?: string | null
          ratio_indicators?: string | null
          reporting_boundary?: string | null
          reporting_period?: string | null
          scope_description?: string | null
          source?: string | null
          trend_notes?: string | null
          uncertainty_notes?: string | null
          unit?: string | null
          uploaded_by?: string | null
        }
        Update: {
          activity_data?: string | null
          additional_notes?: string | null
          amount?: number | null
          company_id?: string | null
          created_at?: string | null
          date?: string | null
          emission_factor_source?: string | null
          emissions_co2e?: number | null
          events_affecting_data?: string | null
          fuel_type?: string | null
          id?: string
          progress_toward_target?: string | null
          ratio_indicators?: string | null
          reporting_boundary?: string | null
          reporting_period?: string | null
          scope_description?: string | null
          source?: string | null
          trend_notes?: string | null
          uncertainty_notes?: string | null
          unit?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scope1_emissions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      scope2_emissions: {
        Row: {
          activity_data: string | null
          additional_notes: string | null
          amount: number | null
          company_id: string | null
          created_at: string | null
          date: string | null
          emission_factor_source: string | null
          emissions_co2e: number | null
          energy_type: string | null
          events_affecting_data: string | null
          id: string
          location: string | null
          progress_toward_target: string | null
          ratio_indicators: string | null
          reporting_boundary: string | null
          reporting_period: string | null
          scope_description: string | null
          supplier: string | null
          trend_notes: string | null
          uncertainty_notes: string | null
          unit: string | null
          uploaded_by: string | null
        }
        Insert: {
          activity_data?: string | null
          additional_notes?: string | null
          amount?: number | null
          company_id?: string | null
          created_at?: string | null
          date?: string | null
          emission_factor_source?: string | null
          emissions_co2e?: number | null
          energy_type?: string | null
          events_affecting_data?: string | null
          id?: string
          location?: string | null
          progress_toward_target?: string | null
          ratio_indicators?: string | null
          reporting_boundary?: string | null
          reporting_period?: string | null
          scope_description?: string | null
          supplier?: string | null
          trend_notes?: string | null
          uncertainty_notes?: string | null
          unit?: string | null
          uploaded_by?: string | null
        }
        Update: {
          activity_data?: string | null
          additional_notes?: string | null
          amount?: number | null
          company_id?: string | null
          created_at?: string | null
          date?: string | null
          emission_factor_source?: string | null
          emissions_co2e?: number | null
          energy_type?: string | null
          events_affecting_data?: string | null
          id?: string
          location?: string | null
          progress_toward_target?: string | null
          ratio_indicators?: string | null
          reporting_boundary?: string | null
          reporting_period?: string | null
          scope_description?: string | null
          supplier?: string | null
          trend_notes?: string | null
          uncertainty_notes?: string | null
          unit?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scope2_emissions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      scope3_emissions: {
        Row: {
          activity_data: string | null
          additional_notes: string | null
          annual_spend: number | null
          commodity_type: string | null
          company_id: string | null
          created_at: string | null
          date: string | null
          emission_factor: number | null
          emission_factor_source: string | null
          emissions_co2e: number | null
          events_affecting_data: string | null
          id: string
          procurement_contact: string | null
          progress_toward_target: string | null
          ratio_indicators: string | null
          reporting_boundary: string | null
          reporting_period: string | null
          scope_description: string | null
          supplier_address: string | null
          supplier_name: string | null
          supplier_type: string | null
          trend_notes: string | null
          uncertainty_notes: string | null
          uploaded_by: string | null
        }
        Insert: {
          activity_data?: string | null
          additional_notes?: string | null
          annual_spend?: number | null
          commodity_type?: string | null
          company_id?: string | null
          created_at?: string | null
          date?: string | null
          emission_factor?: number | null
          emission_factor_source?: string | null
          emissions_co2e?: number | null
          events_affecting_data?: string | null
          id?: string
          procurement_contact?: string | null
          progress_toward_target?: string | null
          ratio_indicators?: string | null
          reporting_boundary?: string | null
          reporting_period?: string | null
          scope_description?: string | null
          supplier_address?: string | null
          supplier_name?: string | null
          supplier_type?: string | null
          trend_notes?: string | null
          uncertainty_notes?: string | null
          uploaded_by?: string | null
        }
        Update: {
          activity_data?: string | null
          additional_notes?: string | null
          annual_spend?: number | null
          commodity_type?: string | null
          company_id?: string | null
          created_at?: string | null
          date?: string | null
          emission_factor?: number | null
          emission_factor_source?: string | null
          emissions_co2e?: number | null
          events_affecting_data?: string | null
          id?: string
          procurement_contact?: string | null
          progress_toward_target?: string | null
          ratio_indicators?: string | null
          reporting_boundary?: string | null
          reporting_period?: string | null
          scope_description?: string | null
          supplier_address?: string | null
          supplier_name?: string | null
          supplier_type?: string | null
          trend_notes?: string | null
          uncertainty_notes?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scope3_emissions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          audit_logging_enabled: boolean | null
          created_at: string | null
          date_format: string | null
          default_member_role: string | null
          id: string
          language: string | null
          lock_team_changes: boolean | null
          preferred_currency: string | null
          receive_deadline_notifications: boolean | null
          receive_newsletter: boolean | null
          receive_upload_alerts: boolean | null
          require_reviewer: boolean | null
          theme: string | null
          timezone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          audit_logging_enabled?: boolean | null
          created_at?: string | null
          date_format?: string | null
          default_member_role?: string | null
          id?: string
          language?: string | null
          lock_team_changes?: boolean | null
          preferred_currency?: string | null
          receive_deadline_notifications?: boolean | null
          receive_newsletter?: boolean | null
          receive_upload_alerts?: boolean | null
          require_reviewer?: boolean | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          audit_logging_enabled?: boolean | null
          created_at?: string | null
          date_format?: string | null
          default_member_role?: string | null
          id?: string
          language?: string | null
          lock_team_changes?: boolean | null
          preferred_currency?: string | null
          receive_deadline_notifications?: boolean | null
          receive_newsletter?: boolean | null
          receive_upload_alerts?: boolean | null
          require_reviewer?: boolean | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      upload_sessions: {
        Row: {
          company_id: string | null
          completed_at: string | null
          created_at: string | null
          detected_scope: string | null
          filename: string | null
          id: string
          row_count: number | null
          status: string | null
          uploaded_by: string | null
        }
        Insert: {
          company_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          detected_scope?: string | null
          filename?: string | null
          id?: string
          row_count?: number | null
          status?: string | null
          uploaded_by?: string | null
        }
        Update: {
          company_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          detected_scope?: string | null
          filename?: string | null
          id?: string
          row_count?: number | null
          status?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "upload_sessions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activities: {
        Row: {
          activity_type: string
          company_id: string
          created_at: string
          description: string
          id: string
          user_id: string
        }
        Insert: {
          activity_type: string
          company_id: string
          created_at?: string
          description: string
          id?: string
          user_id: string
        }
        Update: {
          activity_type?: string
          company_id?: string
          created_at?: string
          description?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_activities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      view_entries_by_year_and_scope: {
        Row: {
          company_id: string | null
          scope: number | null
          total_kg_co2e: number | null
          year: number | null
        }
        Relationships: [
          {
            foreignKeyName: "emission_entries_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      view_monthly_by_scope: {
        Row: {
          company_id: string | null
          month: string | null
          scope: number | null
          total_kg_co2e: number | null
        }
        Relationships: [
          {
            foreignKeyName: "emission_entries_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      calculate_ghg_emissions: {
        Args: { company_id: string }
        Returns: {
          updated_rows: number
          unmatched_rows: number
        }[]
      }
      recalculate_scope1_emissions: {
        Args: { p_company_id: string }
        Returns: {
          activity_data: string | null
          additional_notes: string | null
          amount: number | null
          company_id: string | null
          created_at: string | null
          date: string | null
          emission_factor_source: string | null
          emissions_co2e: number | null
          events_affecting_data: string | null
          fuel_type: string | null
          id: string
          progress_toward_target: string | null
          ratio_indicators: string | null
          reporting_boundary: string | null
          reporting_period: string | null
          scope_description: string | null
          source: string | null
          trend_notes: string | null
          uncertainty_notes: string | null
          unit: string | null
          uploaded_by: string | null
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
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
  public: {
    Enums: {},
  },
} as const
