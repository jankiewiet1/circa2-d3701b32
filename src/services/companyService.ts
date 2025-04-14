import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Company, CompanyMember, UserRole } from "@/types";

export const fetchCompanyDataService = async (userId: string) => {
  try {
    console.log("Fetching company data for userId:", userId);
    
    const { data: memberData, error: memberError } = await supabase
      .from('company_members')
      .select(`
        id,
        role,
        company:companies (
          id,
          name,
          industry,
          created_by_user_id,
          created_at,
          updated_at,
          country,
          kvk_number,
          vat_number,
          iban,
          bank_name,
          billing_email,
          phone_number,
          billing_address,
          postal_code,
          city,
          contact_name,
          contact_title,
          contact_email,
          preferred_currency,
          fiscal_year_start_month,
          reporting_frequency,
          language,
          timezone,
          setup_completed
        )
      `)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (memberError && memberError.code !== 'PGRST116') {
      console.error("Member error:", memberError);
      throw memberError;
    }
    
    console.log("Member data received:", memberData);
    
    if (memberData?.company) {
      const { data: allMembers, error: membersError } = await supabase
        .from('company_members')
        .select('*')
        .eq('company_id', memberData.company.id);
      
      if (membersError) {
        console.error("Members list error:", membersError);
        throw membersError;
      }
      
      return {
        company: memberData.company,
        members: allMembers || [],
        userRole: memberData.role as UserRole,
        error: null
      };
    }
    
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
    
    const { data: newCompany, error: companyError } = await supabase
      .from('companies')
      .insert({
        name,
        industry,
        created_by_user_id: userId,
      })
      .select()
      .maybeSingle();
    
    if (companyError) {
      console.error("Error creating company:", companyError);
      throw companyError;
    }
    
    console.log("Company created:", newCompany);
    
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
    const { data: existingUser, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    const { data: adminMember, error: adminError } = await supabase
      .from('company_members')
      .select('id')
      .eq('company_id', companyId)
      .eq('user_id', invitedBy)
      .eq('role', 'admin')
      .maybeSingle();

    if (adminError || !adminMember) {
      throw new Error('Only company admins can invite members');
    }

    const { data: existingInvite, error: inviteError } = await supabase
      .from('company_invitations')
      .select('id')
      .eq('company_id', companyId)
      .eq('email', email)
      .eq('status', 'pending')
      .maybeSingle();

    if (existingInvite) {
      throw new Error('An invitation for this email already exists');
    }

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

    await supabase
      .from('user_activities')
      .insert({
        user_id: invitedBy,
        company_id: companyId,
        activity_type: 'invitation',
        description: `Invited ${email} as ${role}`
      });

    return { error: null };
  } catch (error: any) {
    console.error('Invitation error:', error);
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
