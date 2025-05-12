
// User roles
export type UserRole = 'admin' | 'editor' | 'viewer';

// Company form values
export interface CompanyFormValues {
  id?: string;
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
  preferred_currency?: string;
  fiscal_year_start_month?: string;
  reporting_frequency?: string;
  language?: string;
  timezone?: string;
  setup_completed?: boolean;
}

// Company member
export interface CompanyMember {
  id: string;
  user_id: string;
  company_id: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  email?: string;
  joinedAt?: string;
}
