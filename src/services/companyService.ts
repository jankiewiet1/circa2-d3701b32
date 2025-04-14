
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Company, CompanyMember, UserRole } from "@/types";

export const fetchCompanyDataService = async (userId: string) => {
  try {
    console.log("Fetching company data for userId:", userId);
    
    const { data: memberData, error: memberError } = await supabase
      .from('company_members')
      .select('*, companies(*)')
      .eq('user_id', userId);
    
    if (memberError) {
      console.error("Member error:", memberError);
      throw memberError;
    }
    
    console.log("Member data received:", memberData);
    
    if (memberData && memberData.length > 0) {
      const userCompany = memberData[0].companies;
      
      if (!userCompany) {
        console.log("No company found in member data");
        return { company: null, members: [], userRole: null, error: new Error("Company data missing from member record") };
      }
      
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
        console.error("Members list error:", membersError);
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
      
      console.log("Successfully processed company data:", companyWithTypes.name);
      
      return {
        company: companyWithTypes,
        members: typedMembers,
        userRole: memberData[0].role as UserRole,
        error: null
      };
    }
    
    console.log("No company membership found for user");
    return { company: null, members: [], userRole: null, error: null };
  } catch (error: any) {
    console.error("Error in fetchCompanyDataService:", error);
    return { company: null, members: [], userRole: null, error };
  }
};

export const createCompanyService = async (name: string, industry: string, userId: string) => {
  try {
    console.log("Creating company with name:", name, "industry:", industry, "userId:", userId);
    
    if (!userId) {
      throw new Error("User ID is required to create a company");
    }
    
    // Check if user already belongs to a company
    const { data: existingMember, error: checkError } = await supabase
      .from('company_members')
      .select('company_id')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (checkError) {
      console.error("Error checking existing membership:", checkError);
      throw checkError;
    }
    
    if (existingMember?.company_id) {
      throw new Error("You already belong to a company");
    }
    
    // Create company
    const { data: newCompany, error: companyError } = await supabase
      .from('companies')
      .insert({
        name,
        industry,
        created_by_user_id: userId,
      })
      .select()
      .single();
    
    if (companyError) {
      console.error("Error creating company:", companyError);
      throw companyError;
    }
    
    console.log("Company created:", newCompany);
    
    // Create company member entry for the creator with admin role
    const { error: memberError } = await supabase
      .from('company_members')
      .insert({
        company_id: newCompany.id,
        user_id: userId,
        role: 'admin',
      });
    
    if (memberError) {
      console.error("Error creating company membership:", memberError);
      throw memberError;
    }
    
    console.log("Successfully created company and membership");
    return { error: null, company: newCompany };
  } catch (error: any) {
    console.error("Error in createCompanyService:", error);
    toast({
      title: "Error Creating Company",
      description: error.message,
      variant: "destructive",
    });
    return { error, company: null };
  }
};

export const updateCompanyService = async (companyId: string, data: Partial<Company>) => {
  try {
    console.log("Updating company:", companyId, "with data:", data);
    
    if (!companyId) {
      throw new Error("Company ID is required to update a company");
    }
    
    const { error } = await supabase
      .from('companies')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', companyId);
    
    if (error) {
      console.error("Error updating company:", error);
      throw error;
    }
    
    console.log("Company updated successfully");
    toast({
      title: "Success",
      description: "Company information updated successfully",
    });
    
    return { error: null };
  } catch (error: any) {
    console.error("Error in updateCompanyService:", error);
    toast({
      title: "Error Updating Company",
      description: error.message,
      variant: "destructive",
    });
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
