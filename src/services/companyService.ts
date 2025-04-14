
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Company, CompanyMember, UserRole } from "@/types";

export const fetchCompanyDataService = async (userId: string) => {
  try {
    const { data: memberData, error: memberError } = await supabase
      .from('company_members')
      .select('*, companies(*)')
      .eq('user_id', userId);
    
    if (memberError) {
      throw memberError;
    }
    
    if (memberData && memberData.length > 0) {
      const userCompany = memberData[0].companies;
      
      const companyWithTypes: Company = {
        id: userCompany.id,
        name: userCompany.name,
        industry: userCompany.industry,
        created_by_user_id: userCompany.created_by_user_id,
        created_at: userCompany.created_at,
        updated_at: userCompany.updated_at || undefined,
        // Additional fields from our extension
        country: userCompany.country,
        kvk_number: userCompany.kvk_number,
        vat_number: userCompany.vat_number,
        iban: userCompany.iban,
        bank_name: userCompany.bank_name,
        billing_email: userCompany.billing_email,
        phone_number: userCompany.phone_number,
        billing_address: userCompany.billing_address,
        postal_code: userCompany.postal_code,
        city: userCompany.city,
        contact_name: userCompany.contact_name,
        contact_title: userCompany.contact_title,
        contact_email: userCompany.contact_email,
        preferred_currency: userCompany.preferred_currency,
        fiscal_year_start_month: userCompany.fiscal_year_start_month,
        reporting_frequency: userCompany.reporting_frequency,
        language: userCompany.language,
        timezone: userCompany.timezone,
        setup_completed: userCompany.setup_completed
      };
      
      const { data: allMembers, error: membersError } = await supabase
        .from('company_members')
        .select('*')
        .eq('company_id', userCompany.id);
      
      if (membersError) {
        throw membersError;
      }
      
      const typedMembers: CompanyMember[] = allMembers?.map(member => ({
        id: member.id,
        company_id: member.company_id,
        user_id: member.user_id,
        role: member.role,
        joined_at: member.joined_at,
        created_at: member.created_at || undefined,
        updated_at: member.updated_at || undefined
      })) || [];
      
      return {
        company: companyWithTypes,
        members: typedMembers,
        userRole: memberData[0].role as UserRole,
        error: null
      };
    }
    
    return { company: null, members: [], userRole: null, error: null };
  } catch (error: any) {
    return { company: null, members: [], userRole: null, error };
  }
};

export const createCompanyService = async (name: string, industry: string, userId: string) => {
  try {
    const { data: newCompany, error: companyError } = await supabase
      .from('companies')
      .insert({
        name,
        industry,
        created_by_user_id: userId,
      })
      .select()
      .single();
    
    if (companyError) throw companyError;
    
    const { error: memberError } = await supabase
      .from('company_members')
      .insert({
        company_id: newCompany.id,
        user_id: userId,
        role: 'admin',
      });
    
    if (memberError) throw memberError;
    
    const company: Company = {
      id: newCompany.id,
      name: newCompany.name,
      industry: newCompany.industry,
      created_by_user_id: newCompany.created_by_user_id,
      created_at: newCompany.created_at,
      updated_at: newCompany.updated_at || undefined
    };
    
    return { error: null, company };
  } catch (error) {
    return { error, company: null };
  }
};

export const updateCompanyService = async (companyId: string, data: Partial<Company>) => {
  try {
    const { error } = await supabase
      .from('companies')
      .update(data)
      .eq('id', companyId);
    
    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error };
  }
};

export const inviteMemberService = async (
  companyId: string,
  email: string,
  role: UserRole,
  invitedBy: string
) => {
  try {
    const { error } = await supabase
      .from('company_invitations')
      .insert({
        company_id: companyId,
        email,
        role,
        invited_by: invitedBy,
        status: 'pending'
      });
    
    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error };
  }
};

export const updateMemberRoleService = async (memberId: string, role: UserRole) => {
  try {
    const { error } = await supabase
      .from('company_members')
      .update({ role })
      .eq('id', memberId);
    
    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error };
  }
};

export const removeMemberService = async (memberId: string) => {
  try {
    const { error } = await supabase
      .from('company_members')
      .delete()
      .eq('id', memberId);
    
    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error };
  }
};
