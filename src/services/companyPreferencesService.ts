
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

export const updateCompanyPreferences = async (companyId: string, preferences: Partial<{
  preferred_currency: string;
  fiscal_year_start_month: string;
  reporting_frequency: string;
  emission_unit: string;
  default_view: string;
}>) => {
  try {
    const { error: upsertError } = await supabase
      .from('company_preferences')
      .upsert({
        company_id: companyId,
        ...preferences,
        updated_at: new Date().toISOString(),
      });

    if (upsertError) throw upsertError;
    
    toast({
      title: "Success",
      description: "Company preferences updated successfully",
    });
    
    return { error: null };
  } catch (error: any) {
    console.error("Error updating company preferences:", error);
    toast({
      title: "Error",
      description: "Failed to update company preferences",
      variant: "destructive",
    });
    return { error };
  }
};
