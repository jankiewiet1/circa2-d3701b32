
export type UserRole = "admin" | "editor" | "viewer";

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string | null;
  user_id?: string; 
  updated_at?: string;
}

export interface Company {
  id: string;
  name: string;
  industry: string | null;
  created_by_user_id: string | null;
  created_at: string | null;
  updated_at?: string;
  
  // Extended company fields
  country?: string;
  kvk_number?: string;
  vat_number?: string;
  iban?: string;
  bank_name?: string;
  billing_email?: string;
  phone_number?: string;
  billing_address?: string;
  postal_code?: string;
  city?: string;
  contact_name?: string;
  contact_title?: string;
  contact_email?: string;
  preferred_currency?: string;
  fiscal_year_start_month?: string;
  reporting_frequency?: string;
  language?: string;
  timezone?: string;
  setup_completed?: boolean;
}

export interface CompanyMember {
  id: string;
  company_id: string | null;
  user_id: string | null;
  role: string | null;
  joined_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface UserWithProfile {
  id: string;
  email: string;
  profile?: Profile;
}

export interface EmissionsData {
  scope: string;
  value: number;
  unit: string;
  date: string;
}

export interface UserActivity {
  id: string;
  user_id: string;
  company_id: string;
  activity_type: string;
  description: string;
  created_at: string;
  user_first_name?: string | null;
  user_last_name?: string | null;
}
