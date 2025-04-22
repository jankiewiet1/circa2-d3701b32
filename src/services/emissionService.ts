
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface EmissionFactor {
  id: number;
  Category_1: string;
  UOM: string;
  Source: string;
  GHG_Conversion_Factor_2024: number;
  Scope: string;
  Category_2: string;
  Category_3: string;
  Category_4: string;
  Column_Text: string;
  "GHG/Unit": string;
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
      .order('Category_1')
      .order('UOM')
      .order('Source');
    
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
      .select('Category_1, UOM, Source, Scope')
      .eq('Scope', '1');
      
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
          normalizeString(factor.Category_1) === normalizeString(combo.fuel_type) &&
          normalizeString(factor.UOM) === normalizeString(combo.unit) &&
          factor.Source === source &&
          factor.Scope === '1'
        ) || [];
        
        return {
          source,
          hasData: matchingFactors.length > 0,
          latestYear: 2024 // Using 2024 data
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
    // Get emissions data to analyze
    const { data: emissionsData, error: emissionsError } = await supabase
      .from('scope1_emissions')
      .select('*')
      .eq('company_id', companyId);
      
    if (emissionsError) throw emissionsError;
    
    // Get emission factors with scope 1
    const { data: factorsData, error: factorsError } = await supabase
      .from('emission_factors')
      .select('*')
      .eq('Scope', '1');
      
    if (factorsError) throw factorsError;
    
    // Get company's preferred emission source
    const { data: preferences } = await supabase
      .from('company_preferences')
      .select('preferred_emission_source')
      .eq('company_id', companyId)
      .maybeSingle();
    
    const preferredSource = preferences?.preferred_emission_source || 'DEFRA';
    
    // Simple diagnostic - count emissions that might have issues
    const missingFactorTypes = new Set();
    
    emissionsData?.forEach(emission => {
      // Check if there's a matching factor for the preferred source
      const hasMatchingFactor = factorsData?.some(factor => 
        factor.Category_1.toLowerCase().trim() === emission.fuel_type?.toLowerCase().trim() &&
        factor.UOM.toLowerCase().trim() === emission.unit?.toLowerCase().trim() &&
        factor.Source === preferredSource
      );
      
      if (!hasMatchingFactor && emission.fuel_type && emission.unit) {
        missingFactorTypes.add(`${emission.fuel_type}/${emission.unit}`);
      }
    });
    
    return {
      logs: Array.from(missingFactorTypes).map(type => ({
        log_type: 'warning',
        log_message: `Missing emission factor for: ${type}`
      })),
      missingCalculations: missingFactorTypes.size,
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
