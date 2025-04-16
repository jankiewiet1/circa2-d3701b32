
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface EmissionFactor {
  id: string;
  fuel_type: string;
  unit: string;
  source: string;
  factor_per_unit: number;
  year: number;
}

export interface EmissionFactorStatus {
  fuelType: string;
  unit: string;
  availableSources: {
    source: string;
    hasData: boolean;
    latestYear?: number;
  }[];
}

/**
 * Fetches emission factors from the database
 */
export const fetchEmissionFactors = async () => {
  try {
    const { data, error } = await supabase
      .from('emission_factors')
      .select('*')
      .order('fuel_type')
      .order('unit')
      .order('source')
      .order('year', { ascending: false });
    
    if (error) throw error;
    
    return { data: data as EmissionFactor[], error: null };
  } catch (error: any) {
    console.error("Error fetching emission factors:", error);
    return { data: null, error };
  }
};

/**
 * Checks emission factor availability for company's emissions data
 */
export const checkEmissionFactorStatus = async (companyId: string) => {
  try {
    // Get company's emission types and units
    const { data: emissionsData, error: emissionsError } = await supabase
      .from('scope1_emissions')
      .select('fuel_type, unit')
      .eq('company_id', companyId);
      
    if (emissionsError) throw emissionsError;
    
    // Get all emission factors
    const { data: factorsData, error: factorsError } = await supabase
      .from('emission_factors')
      .select('fuel_type, unit, source, year');
      
    if (factorsError) throw factorsError;
    
    // Get company's preferred emission source
    const { data: preferences } = await supabase
      .from('company_preferences')
      .select('preferred_emission_source')
      .eq('company_id', companyId)
      .maybeSingle();
    
    const preferredSource = preferences?.preferred_emission_source || 'DEFRA';
    
    // Standardize comparison by trimming and lowercase
    const normalizeString = (str?: string) => 
      (str || '').toLowerCase().trim();
    
    // Deduplicate emission type/unit pairs
    const uniqueCombinations = emissionsData?.filter((value, index, self) =>
      index === self.findIndex((t) => (
        normalizeString(t.fuel_type) === normalizeString(value.fuel_type) && 
        normalizeString(t.unit) === normalizeString(value.unit)
      ))
    ) || [];
    
    // Known sources to check for
    const knownSources = ['DEFRA', 'EPA', 'IPCC', 'GHG Protocol Default', 'ADEME'];
    
    // Check status for each emission type/unit pair
    const statusChecks = uniqueCombinations.map(combo => {
      const sources = knownSources.map(source => {
        const matchingFactors = factorsData?.filter(factor => 
          normalizeString(factor.fuel_type) === normalizeString(combo.fuel_type) &&
          normalizeString(factor.unit) === normalizeString(combo.unit) &&
          factor.source === source
        ) || [];
        
        const latestYear = matchingFactors.length > 0 
          ? Math.max(...matchingFactors.map(f => f.year || 0)) 
          : undefined;
        
        return {
          source,
          hasData: matchingFactors.length > 0,
          latestYear: latestYear || undefined
        };
      });
      
      return {
        fuelType: combo.fuel_type || '',
        unit: combo.unit || '',
        availableSources: sources
      };
    });
    
    return { 
      data: statusChecks, 
      preferredSource,
      error: null 
    };
  } catch (error: any) {
    console.error("Error checking emission factor status:", error);
    return { 
      data: [], 
      preferredSource: null,
      error 
    };
  }
};

/**
 * Run diagnostics on emission calculations and returns any issues found
 */
export const runEmissionDiagnostics = async (companyId: string) => {
  try {
    // Check for recent calculation logs with warnings or errors
    const { data: logsData, error: logsError } = await supabase
      .from('calculation_logs')
      .select('*')
      .eq('company_id', companyId)
      .in('log_type', ['warning', 'error'])
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (logsError) throw logsError;
    
    // Check for emissions without calculations
    const { count: missingCount, error: countError } = await supabase
      .from('scope1_emissions_with_calculation')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .is('emissions_co2e', null);
      
    if (countError) throw countError;
    
    return {
      logs: logsData || [],
      missingCalculations: missingCount || 0,
      error: null
    };
  } catch (error: any) {
    console.error("Error running diagnostics:", error);
    toast.error("Failed to run emission diagnostics");
    return {
      logs: [],
      missingCalculations: 0,
      error
    };
  }
};
