
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export const fetchCompanyPreferences = async (companyId: string) => {
  try {
    const { data, error } = await supabase
      .from('company_preferences')
      .select('*')
      .eq('company_id', companyId)
      .maybeSingle();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error("Error fetching company preferences:", error);
    return { data: null, error };
  }
};

export const updateCompanyPreferences = async (companyId: string, preferences: {
  preferred_currency?: string;
  fiscal_year_start_month?: string;
  reporting_frequency?: string;
  language?: string;
  timezone?: string;
}) => {
  try {
    const { error } = await supabase
      .from('company_preferences')
      .upsert({
        company_id: companyId,
        ...preferences,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    console.error("Error updating company preferences:", error);
    return { error };
  }
};
