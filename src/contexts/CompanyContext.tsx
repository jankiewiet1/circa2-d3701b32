
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Company, CompanyMember, UserRole } from "@/types";
import { fetchCompanyDataService } from "@/services/companyService";
import { useCompanyActions } from "@/hooks/useCompanyActions";

interface CompanyContextType {
  company: Company | null;
  companyMembers: CompanyMember[];
  hasCompany: boolean;
  userRole: UserRole | null;
  loading: boolean;
  createCompany: (name: string, industry: string) => Promise<{ error: any, company: Company | null }>;
  updateCompany: (data: Partial<Company>) => Promise<{ error: any }>;
  inviteMember: (email: string, role: UserRole) => Promise<{ error: any }>;
  updateMemberRole: (memberId: string, role: UserRole) => Promise<{ error: any }>;
  removeMember: (memberId: string) => Promise<{ error: any }>;
  fetchCompanyData: () => Promise<{ error: any }>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [companyMembers, setCompanyMembers] = useState<CompanyMember[]>([]);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  
  const hasCompany = Boolean(company);
  const companyActions = useCompanyActions(user?.id, company?.id);

  const fetchCompanyData = async () => {
    if (!user) {
      setCompany(null);
      setCompanyMembers([]);
      setUserRole(null);
      setLoading(false);
      return { error: null };
    }
    
    const { company, members, userRole: role, error } = await fetchCompanyDataService(user.id);
    
    setCompany(company);
    setCompanyMembers(members);
    setUserRole(role);
    setLoading(false);
    
    return { error };
  };

  useEffect(() => {
    fetchCompanyData();
  }, [user?.id]);

  const contextValue: CompanyContextType = {
    company,
    loading,
    userRole,
    companyMembers,
    hasCompany,
    ...companyActions,
    fetchCompanyData
  };

  return (
    <CompanyContext.Provider value={contextValue}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  
  return context;
}
