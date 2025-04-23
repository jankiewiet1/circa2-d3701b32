
// Updated to use emission_entries table unified structure and updated function signatures

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface EmissionEntry {
  id: string;
  company_id: string;
  upload_session_id?: string | null;
  date: string;
  category: string;
  description: string;
  quantity: number;
  unit: string;
  emission_factor: number;
  scope: number; // 1, 2, or 3
  emissions: number; // quantity * emission_factor
  created_at: string;
  updated_at: string;
}

export interface EmissionFactorStatus {
  category: string;
  unit: string;
  availableSources: {
    source: string;
    hasData: boolean;
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
    
    return { data, error: null };
  } catch (error: any) {
    console.error("Error fetching emission factors:", error);
    return { data: null, error };
  }
};

/**
 * Checks emission factor availability for company's emissions data unified using emission_entries
 */
export const checkEmissionFactorStatus = async (companyId: string) => {
  try {
    // Get emission_entries category/unit/scope for company
    const { data: entriesData, error: entriesError } = await supabase
      .from('emission_entries')
      .select('category, unit, scope')
      .eq('company_id', companyId);
    if (entriesError) throw entriesError;
    
    // Get all emission factors
    const { data: factorsData, error: factorsError } = await supabase
      .from('emission_factors')
      .select('Category_1, UOM, Source, Scope');
    if (factorsError) throw factorsError;

    // Get company's preferred emission source
    const { data: preferences } = await supabase
      .from('company_preferences')
      .select('preferred_emission_source')
      .eq('company_id', companyId)
      .maybeSingle();

    const preferredSource = preferences?.preferred_emission_source || 'DEFRA';

    // Standardize string comparison helper
    const normalizeString = (str?: string) => (str || '').toLowerCase().trim();

    // Deduplicate by category/unit/scope
    const uniqueCombinations = entriesData?.filter((value, index, self) =>
      index === self.findIndex((t) => (
        normalizeString(t.category) === normalizeString(value.category) &&
        normalizeString(t.unit) === normalizeString(value.unit) &&
        t.scope === value.scope
      ))
    ) || [];

    // Known sources to check for
    const knownSources = ['DEFRA', 'EPA', 'IPCC', 'GHG Protocol Default', 'ADEME'];

    // Check status for each emission type/unit pair
    const statusChecks = uniqueCombinations.map(combo => {
      const sources = knownSources.map(source => {
        const matchingFactors = factorsData?.filter(factor => 
          normalizeString(factor.Category_1) === normalizeString(combo.category) &&
          normalizeString(factor.UOM) === normalizeString(combo.unit) &&
          factor.Source === source &&
          Number(factor.Scope) === combo.scope
        ) || [];

        return {
          source,
          hasData: matchingFactors.length > 0,
        };
      });

      return {
        category: combo.category || '',
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
    const { data: entriesData, error: entriesError } = await supabase
      .from('emission_entries')
      .select('category, unit, scope, emissions')
      .eq('company_id', companyId);
    if (entriesError) throw entriesError;

    const { data: factorsData, error: factorsError } = await supabase
      .from('emission_factors')
      .select('Category_1, UOM, Source, Scope');
    if (factorsError) throw factorsError;

    const { data: pref } = await supabase
      .from('company_preferences')
      .select('preferred_emission_source')
      .eq('company_id', companyId)
      .maybeSingle();

    const preferredSource = pref?.preferred_emission_source || 'DEFRA';

    // Find entries with no emissions calculated (emissions is NULL)
    const missingFactorsSet = new Set<string>();

    entriesData?.forEach(entry => {
      // Check if emission factor is present in emission_factors for this entry
      const factorExists = factorsData?.some(factor =>
        factor.Category_1.toLowerCase().trim() === entry.category?.toLowerCase().trim() &&
        factor.UOM.toLowerCase().trim() === entry.unit?.toLowerCase().trim() &&
        Number(factor.Scope) === entry.scope &&
        factor.Source === preferredSource
      );

      if (!factorExists) {
        missingFactorsSet.add(`${entry.category}/${entry.unit}`);
      }
    });

    return {
      logs: Array.from(missingFactorsSet).map(type => ({
        log_type: 'warning',
        log_message: `Missing emission factor for: ${type}`
      })),
      missingCalculations: missingFactorsSet.size,
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

