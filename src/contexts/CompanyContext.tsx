
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Company, CompanyMember, UserRole } from "@/types";
import { toast } from "@/components/ui/use-toast";

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
  
  // Computed property that determines if the user belongs to a company
  const hasCompany = Boolean(company);

  // Function to fetch company data for the authenticated user
  const fetchCompanyData = async (): Promise<{ error: any }> => {
    if (!user) {
      setCompany(null);
      setCompanyMembers([]);
      setUserRole(null);
      setLoading(false);
      return { error: null };
    }
    
    try {
      // First find if the user belongs to any company
      const { data: memberData, error: memberError } = await supabase
        .from('company_members')
        .select('*, companies(*)')
        .eq('user_id', user.id);
      
      if (memberError) {
        toast({
          title: "Error Fetching Company Data",
          description: memberError.message,
          variant: "destructive"
        });
        setLoading(false);
        return { error: memberError };
      }
      
      if (memberData && memberData.length > 0) {
        // User belongs to a company
        const userCompany = memberData[0].companies;
        
        // Create a properly typed Company object
        const companyWithTypes: Company = {
          id: userCompany.id,
          name: userCompany.name,
          industry: userCompany.industry,
          created_by_user_id: userCompany.created_by_user_id,
          created_at: userCompany.created_at,
          updated_at: userCompany.updated_at || undefined
        };
        
        setCompany(companyWithTypes);
        setUserRole(memberData[0].role as UserRole);
        
        // Fetch all members of this company
        const { data: allMembers, error: membersError } = await supabase
          .from('company_members')
          .select('*')
          .eq('company_id', userCompany.id);
        
        if (!membersError && allMembers) {
          // Map the members to ensure they match the CompanyMember type
          const typedMembers: CompanyMember[] = allMembers.map(member => ({
            id: member.id,
            company_id: member.company_id,
            user_id: member.user_id,
            role: member.role,
            joined_at: member.joined_at,
            created_at: member.created_at || undefined,
            updated_at: member.updated_at || undefined
          }));
          
          setCompanyMembers(typedMembers);
        }
      } else {
        // User doesn't belong to any company
        setCompany(null);
        setCompanyMembers([]);
        setUserRole(null);
      }
      
      setLoading(false);
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Error Fetching Company Data",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
      
      setLoading(false);
      return { error };
    }
  };

  // Create a new company
  const createCompany = async (name: string, industry: string): Promise<{ error: any, company: Company | null }> => {
    try {
      if (!user) {
        return { error: new Error('User not authenticated'), company: null };
      }
      
      // Insert new company
      const { data: newCompany, error: companyError } = await supabase
        .from('companies')
        .insert({
          name,
          industry,
          created_by_user_id: user.id,
        })
        .select()
        .single();
      
      if (companyError) {
        toast({
          title: "Company Creation Failed",
          description: companyError.message,
          variant: "destructive"
        });
        return { error: companyError, company: null };
      }
      
      // Add creator as admin member
      const { error: memberError } = await supabase
        .from('company_members')
        .insert({
          company_id: newCompany.id,
          user_id: user.id,
          role: 'admin',
        });
      
      if (memberError) {
        toast({
          title: "Error Adding Admin",
          description: memberError.message,
          variant: "destructive"
        });
        return { error: memberError, company: null };
      }
      
      // Update local state
      await fetchCompanyData();
      
      toast({
        title: "Company Created",
        description: `${name} has been successfully created`,
      });
      
      // Add missing fields to match our Company type
      const companyWithAllFields: Company = {
        id: newCompany.id,
        name: newCompany.name,
        industry: newCompany.industry,
        created_by_user_id: newCompany.created_by_user_id,
        created_at: newCompany.created_at,
        updated_at: undefined
      };
      
      return { error: null, company: companyWithAllFields };
    } catch (error: any) {
      toast({
        title: "Company Creation Failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
      
      return { error, company: null };
    }
  };

  // Update company details
  const updateCompany = async (data: Partial<Company>): Promise<{ error: any }> => {
    try {
      if (!company) return { error: new Error('No company found') };
      
      const { error } = await supabase
        .from('companies')
        .update(data)
        .eq('id', company.id);
      
      if (error) {
        toast({
          title: "Update Failed",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }
      
      // Refresh company data
      await fetchCompanyData();
      
      toast({
        title: "Company Updated",
        description: "Company details have been updated successfully"
      });
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
      
      return { error };
    }
  };

  // Invite a new member
  const inviteMember = async (email: string, role: UserRole): Promise<{ error: any }> => {
    try {
      if (!company || !user) {
        return { error: new Error('Missing company or user information') };
      }
      
      // In a real app, this would send an email invitation
      // For now, we'll simulate by adding the invitation to a database
      const { error } = await supabase
        .from('company_invitations')
        .insert({
          company_id: company.id,
          email,
          role,
          invited_by: user.id,
          status: 'pending'
        });
      
      if (error) {
        toast({
          title: "Invitation Failed",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }
      
      toast({
        title: "Invitation Sent",
        description: `Invitation has been sent to ${email}`
      });
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Invitation Failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
      
      return { error };
    }
  };

  // Update member role
  const updateMemberRole = async (memberId: string, role: UserRole): Promise<{ error: any }> => {
    try {
      const { error } = await supabase
        .from('company_members')
        .update({ role })
        .eq('id', memberId);
      
      if (error) {
        toast({
          title: "Role Update Failed",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }
      
      // Update local state
      await fetchCompanyData();
      
      toast({
        title: "Role Updated",
        description: "Member role has been updated successfully"
      });
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Role Update Failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
      
      return { error };
    }
  };

  // Remove a member
  const removeMember = async (memberId: string): Promise<{ error: any }> => {
    try {
      const { error } = await supabase
        .from('company_members')
        .delete()
        .eq('id', memberId);
      
      if (error) {
        toast({
          title: "Remove Member Failed",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }
      
      // Update local state
      await fetchCompanyData();
      
      toast({
        title: "Member Removed",
        description: "Member has been removed from the company"
      });
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Remove Member Failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
      
      return { error };
    }
  };

  // Fetch company data when the user changes
  useEffect(() => {
    fetchCompanyData();
  }, [user?.id]);
  
  const contextValue: CompanyContextType = {
    company,
    loading,
    userRole,
    companyMembers,
    hasCompany,
    createCompany,
    updateCompany,
    inviteMember,
    updateMemberRole,
    removeMember,
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
