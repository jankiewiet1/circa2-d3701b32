
export type UserRole = "admin" | "editor" | "viewer";

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string | null;
  // Add the missing properties from the error
  user_id?: string; // Making optional since it might not be in the DB schema
  updated_at?: string; // Making optional since it might not be in the DB schema
}

export interface Company {
  id: string;
  name: string;
  industry: string | null;
  created_by_user_id: string | null;
  created_at: string | null;
  // Add the missing property from the error
  updated_at?: string; // Making optional since it might not be in the DB
}

export interface CompanyMember {
  id: string;
  company_id: string | null;
  user_id: string | null;
  role: string | null;
  joined_at?: string | null;
  // Add the missing properties from the error
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
