
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
