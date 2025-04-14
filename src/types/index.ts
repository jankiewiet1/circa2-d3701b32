
export type UserRole = "admin" | "editor" | "viewer";

export interface Profile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  created_by_user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CompanyMember {
  id: string;
  company_id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
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
