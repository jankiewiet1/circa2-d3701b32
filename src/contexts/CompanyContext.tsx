
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Company, CompanyMember, UserRole } from '../types';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface CompanyContextType {
  company: Company | null;
  loading: boolean;
  userRole: UserRole | null;
  companyMembers: CompanyMember[];
  hasCompany: boolean;
  createCompany: (name: string, industry: string) => Promise<{ error: any, company: Company | null }>;
  updateCompany: (data: Partial<Company>) => Promise<{ error: any }>;
  inviteMember: (email: string, role: UserRole) => Promise<{ error: any }>;
  updateMemberRole: (memberId: string, role: UserRole) => Promise<{ error: any }>;
  removeMember: (memberId: string) => Promise<{ error: any }>;
  fetchCompanyData: () => Promise<void>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [company, setCompany] = useState<Company | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [companyMembers, setCompanyMembers] = useState<CompanyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasCompany, setHasCompany] = useState<boolean>(false);
  
  // Fetch company data when user changes
  useEffect(() => {
    if (user) {
      fetchCompanyData();
    } else {
      setCompany(null);
      setUserRole(null);
      setCompanyMembers([]);
      setHasCompany(false);
      setLoading(false);
    }
  }, [user]);
  
  // Fetch company data and user role
  const fetchCompanyData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Check if user is a member of any company
      const { data: membership, error: membershipError } = await supabase
        .from('company_members')
        .select('*, company:companies(*)')
        .eq('user_id', user.id)
        .single();
      
      if (membershipError) {
        if (membershipError.code === 'PGRST116') {
          // No membership found - user doesn't belong to a company
          setCompany(null);
          setUserRole(null);
          setCompanyMembers([]);
          setHasCompany(false);
        } else {
          console.error('Error fetching company membership:', membershipError);
        }
      } else if (membership) {
        setCompany(membership.company);
        setUserRole(membership.role as UserRole);
        setHasCompany(true);
        
        // Fetch all members of this company
        const { data: members, error: membersError } = await supabase
          .from('company_members')
          .select('*')
          .eq('company_id', membership.company_id);
        
        if (membersError) {
          console.error('Error fetching company members:', membersError);
        } else {
          setCompanyMembers(members || []);
        }
      }
    } catch (error) {
      console.error('Unexpected error fetching company data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Create a new company
  const createCompany = async (name: string, industry: string) => {
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
      
      return { error: null, company: newCompany };
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
  const updateCompany = async (data: Partial<Company>) => {
    try {
      if (!company) {
        return { error: new Error('No company selected') };
      }
      
      if (userRole !== 'admin') {
        return { error: new Error('You do not have permission to update company details') };
      }
      
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
        description: "Company details have been updated",
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
  
  // Invite a member (in a real app, this would send an email)
  const inviteMember = async (email: string, role: UserRole) => {
    try {
      if (!company) {
        return { error: new Error('No company selected') };
      }
      
      if (userRole !== 'admin') {
        return { error: new Error('You do not have permission to invite members') };
      }
      
      // In a real app, you would send an email invitation here
      // For this demo, we'll simulate by finding a user with that email
      
      const { data: foundUser, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();
      
      if (userError) {
        toast({
          title: "Invitation Failed",
          description: `No user found with email ${email}`,
          variant: "destructive"
        });
        return { error: userError };
      }
      
      // Check if already a member
      const { data: existingMember, error: checkError } = await supabase
        .from('company_members')
        .select('*')
        .eq('company_id', company.id)
        .eq('user_id', foundUser.id)
        .maybeSingle();
      
      if (existingMember) {
        toast({
          title: "Invitation Failed",
          description: "This user is already a member of the company",
          variant: "destructive"
        });
        return { error: new Error('User is already a member') };
      }
      
      // Add the new member
      const { error: memberError } = await supabase
        .from('company_members')
        .insert({
          company_id: company.id,
          user_id: foundUser.id,
          role,
        });
      
      if (memberError) {
        toast({
          title: "Invitation Failed",
          description: memberError.message,
          variant: "destructive"
        });
        return { error: memberError };
      }
      
      // Refresh members list
      await fetchCompanyData();
      
      toast({
        title: "Member Invited",
        description: `User with email ${email} has been added to the company`,
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
  const updateMemberRole = async (memberId: string, role: UserRole) => {
    try {
      if (!company) {
        return { error: new Error('No company selected') };
      }
      
      if (userRole !== 'admin') {
        return { error: new Error('You do not have permission to change member roles') };
      }
      
      const { error } = await supabase
        .from('company_members')
        .update({ role })
        .eq('id', memberId)
        .eq('company_id', company.id);
      
      if (error) {
        toast({
          title: "Role Update Failed",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }
      
      // Refresh members list
      await fetchCompanyData();
      
      toast({
        title: "Role Updated",
        description: "Member's role has been updated",
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
  const removeMember = async (memberId: string) => {
    try {
      if (!company) {
        return { error: new Error('No company selected') };
      }
      
      if (userRole !== 'admin') {
        return { error: new Error('You do not have permission to remove members') };
      }
      
      const { error } = await supabase
        .from('company_members')
        .delete()
        .eq('id', memberId)
        .eq('company_id', company.id);
      
      if (error) {
        toast({
          title: "Member Removal Failed",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }
      
      // Refresh members list
      await fetchCompanyData();
      
      toast({
        title: "Member Removed",
        description: "The member has been removed from the company",
      });
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Member Removal Failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
      
      return { error };
    }
  };
  
  const value = {
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
  
  return <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>;
}

export function useCompany() {
  const context = useContext(CompanyContext);
  
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  
  return context;
}
