
import { supabase } from '@/integrations/supabase/client';
import { UserRole, CompanyFormValues } from '@/types';
import { toast } from 'sonner';

// Create company invitation
export const createCompanyInvitation = async (
  companyId: string,
  email: string,
  role: UserRole,
  invitedBy: string
): Promise<any> => {
  try {
    const { data, error } = await supabase.from('company_invitations').insert({
      company_id: companyId,
      email,
      role,
      invited_by: invitedBy,
      status: 'pending'
    }).select();

    if (error) throw error;
    return data[0];
  } catch (error: any) {
    console.error('Error creating company invitation:', error);
    throw error;
  }
};

// Get company members
export const getCompanyMembers = async (companyId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('company_members')
      .select('*, profiles(first_name, last_name, email)')
      .eq('company_id', companyId);

    if (error) throw error;

    return (data || []).map(member => ({
      id: member.id,
      role: member.role,
      firstName: member.profiles?.first_name || '',
      lastName: member.profiles?.last_name || '',
      email: member.profiles?.email || '',
      joinedAt: member.joined_at
    }));
  } catch (error: any) {
    console.error('Error fetching company members:', error);
    throw error;
  }
};

// Update company member role
export const updateCompanyMemberRole = async (memberId: string, role: UserRole): Promise<void> => {
  try {
    const { error } = await supabase
      .from('company_members')
      .update({ role })
      .eq('id', memberId);

    if (error) throw error;
  } catch (error: any) {
    console.error('Error updating member role:', error);
    throw error;
  }
};

// Delete company member
export const deleteCompanyMember = async (memberId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('company_members')
      .delete()
      .eq('id', memberId);

    if (error) throw error;
  } catch (error: any) {
    console.error('Error deleting company member:', error);
    throw error;
  }
};

// Get company invitations
export const getCompanyInvitations = async (companyId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('company_invitations')
      .select('*')
      .eq('company_id', companyId)
      .eq('status', 'pending');

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error('Error fetching company invitations:', error);
    throw error;
  }
};

// Resend company invitation
export const resendCompanyInvitation = async (invitationId: string): Promise<void> => {
  try {
    // In a real implementation, this would call a server function to resend the email
    // For now, we'll just update the timestamp
    const { error } = await supabase
      .from('company_invitations')
      .update({ created_at: new Date().toISOString() })
      .eq('id', invitationId);

    if (error) throw error;
  } catch (error: any) {
    console.error('Error resending invitation:', error);
    throw error;
  }
};

// Delete company invitation
export const deleteCompanyInvitation = async (invitationId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('company_invitations')
      .delete()
      .eq('id', invitationId);

    if (error) throw error;
  } catch (error: any) {
    console.error('Error deleting invitation:', error);
    throw error;
  }
};
