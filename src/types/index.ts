
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface Company {
  id: string;
  name: string;
  industry?: string;
  created_at?: string;
  updated_at?: string;
  country?: string;
  kvk_number?: string; // Netherlands Company Registration Number
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

export type UserRole = 'admin' | 'editor' | 'viewer';

export interface CompanyMember {
  id: string;
  user_id: string | null;
  company_id: string | null;
  role: string | null;
  joined_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  email?: string | null; // Added email field
}

export interface ProfileFormValues {
  firstName: string;
  lastName: string;
  email: string;
}

export interface CompanyFormValues {
  name: string;
  industry: string;
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
}
