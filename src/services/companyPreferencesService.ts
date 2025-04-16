import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

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
  preferred_emission_source?: string;
}) => {
  try {
    // First check if a record already exists
    const { data: existingPrefs } = await supabase
      .from('company_preferences')
      .select('id')
      .eq('company_id', companyId)
      .maybeSingle();
    
    let error;
    
    if (existingPrefs) {
      // Update existing record
      const result = await supabase
        .from('company_preferences')
        .update({
          ...preferences,
          updated_at: new Date().toISOString(),
        })
        .eq('company_id', companyId);
      
      error = result.error;
    } else {
      // Insert new record
      const result = await supabase
        .from('company_preferences')
        .insert({
          company_id: companyId,
          ...preferences,
          updated_at: new Date().toISOString(),
        });
      
      error = result.error;
    }

    if (error) throw error;
    
    // After successfully updating preferences, we need to recalculate emissions
    await recalculateScope1Emissions(companyId);
    
    return { error: null };
  } catch (error: any) {
    console.error("Error updating company preferences:", error);
    return { error };
  }
};

// Function to trigger recalculation of all scope 1 emissions
const recalculateScope1Emissions = async (companyId: string) => {
  try {
    // First attempt to use the RPC function if available
    try {
      await supabase
        .rpc('recalculate_scope1_emissions', {
          p_company_id: companyId
        });
      console.log('Emissions recalculated using RPC function');
      return;
    } catch (rpcError) {
      console.warn('RPC function not available, using fallback method', rpcError);
    }
    
    // Fallback: Update each emission to trigger the update_scope1_emissions trigger
    const { data: emissions } = await supabase
      .from('scope1_emissions')
      .select('*')
      .eq('company_id', companyId);

    if (emissions && emissions.length > 0) {
      console.log(`Recalculating ${emissions.length} emissions records`);
      
      // Update each emission record to trigger the calculation
      for (const emission of emissions) {
        await supabase
          .from('scope1_emissions')
          .update({
            // Use the same amount to trigger the update_scope1_emissions trigger
            amount: emission.amount,
            updated_at: new Date().toISOString(),
          })
          .eq('id', emission.id);
      }
      
      console.log('Emissions recalculation completed');
    } else {
      console.log('No emissions to recalculate');
    }
  } catch (error) {
    console.error("Error recalculating emissions:", error);
  }
};
