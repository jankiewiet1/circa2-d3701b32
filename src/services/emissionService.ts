
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Check emission factor status
export const checkEmissionFactorStatus = async (companyId: string) => {
  try {
    // Get unique category/unit combinations from emission entries
    const { data: entriesData, error: entriesError } = await supabase
      .from('emission_entries')
      .select('category, unit, scope')
      .eq('company_id', companyId)
      .order('category', { ascending: true });
      
    if (entriesError) throw entriesError;
    
    if (!entriesData || entriesData.length === 0) {
      return { data: [], preferredSource: 'DEFRA', error: null };
    }
    
    // Get company preferences
    const { data: preferences } = await supabase
      .from('company_preferences')
      .select('preferred_emission_source')
      .eq('company_id', companyId)
      .maybeSingle();
      
    const preferredSource = preferences?.preferred_emission_source || 'DEFRA';
    
    // Get unique combinations
    const uniqueCombinations = entriesData.reduce((acc: any[], entry) => {
      const existingEntry = acc.find(e => 
        e.category === entry.category && e.unit === entry.unit
      );
      
      if (!existingEntry) {
        acc.push({
          category: entry.category,
          unit: entry.unit,
          scope: entry.scope
        });
      }
      
      return acc;
    }, []);
    
    // Check each combination for available emission factors
    const statusData = await Promise.all(uniqueCombinations.map(async (combination) => {
      // Search for emission factors matching this combination
      const availableSources = await getAvailableFactorSources(combination.category, combination.unit);
      
      return {
        category: combination.category,
        unit: combination.unit,
        availableSources
      };
    }));
    
    return { 
      data: statusData,
      preferredSource,
      error: null 
    };
  } catch (error: any) {
    console.error("Error checking emission factor status:", error);
    toast.error("Failed to check emission factor status");
    return { data: [], preferredSource: 'DEFRA', error };
  }
};

// Get available emission factor sources for a category/unit combination
const getAvailableFactorSources = async (category: string, unit: string) => {
  const sources = ['DEFRA', 'EPA', 'IPCC', 'GHG Protocol', 'ADEME'];
  
  const result = await Promise.all(sources.map(async (source) => {
    const { count } = await supabase
      .from('emission_factors')
      .select('*', { count: 'exact', head: true })
      .eq('Source', source)
      .ilike('category_1', `%${category}%`);
      
    return {
      source,
      hasData: count ? count > 0 : false
    };
  }));
  
  return result;
};

// Run diagnostics on emission calculation setup
export const runEmissionDiagnostics = async (companyId: string) => {
  try {
    // Get emission entries without calculations
    const { data: entriesWithoutCalcs, error: entriesError } = await supabase
      .from('emission_entries')
      .select('id, category, unit')
      .eq('company_id', companyId)
      .eq('match_status', 'unmatched')
      .limit(10);

    if (entriesError) throw entriesError;

    // Count total entries without calculations
    const { count: missingCount, error: countError } = await supabase
      .from('emission_entries')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('match_status', 'unmatched');

    if (countError) throw countError;

    // Format logs
    const logs = (entriesWithoutCalcs || []).map(entry => ({
      log_type: 'warning',
      log_message: `Entry with category "${entry.category}" and unit "${entry.unit}" has no matching emission factor`
    }));

    return {
      logs,
      missingCalculations: missingCount || 0
    };
  } catch (error: any) {
    console.error("Error running emission diagnostics:", error);
    toast.error("Failed to analyze emission calculation setup");
    return {
      logs: [{
        log_type: 'error',
        log_message: 'Error analyzing emission calculations: ' + error.message
      }],
      missingCalculations: 0
    };
  }
};

// Recalculate all emissions for a company
export const recalculateCompanyEmissions = async (companyId: string) => {
  try {
    // Call Supabase edge function to recalculate (if deployed)
    try {
      const { data, error } = await supabase.functions.invoke('recalculate-emissions', {
        body: { company_id: companyId }
      });

      if (error) throw error;
      
      toast.success("Emissions are being recalculated. This may take a few minutes.");
      return data;
    } catch (fnError) {
      console.warn("Edge function not available:", fnError);
      
      // Fallback - direct database operation if allowed
      // Update match status to trigger recalculation on next view
      const { error } = await supabase
        .from('emission_entries')
        .update({ match_status: null })
        .eq('company_id', companyId);

      if (error) throw error;
      
      toast.success("Emissions will be recalculated on next view");
    }
  } catch (error: any) {
    console.error("Error recalculating emissions:", error);
    toast.error("Failed to recalculate emissions");
    throw error;
  }
};
