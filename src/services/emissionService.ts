// Fixing type argument usages and data checks for supabase queries

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
  emission_factor_id?: number | null;
  scope: number;
  emissions: number;
  co2_emissions?: number | null;
  ch4_emissions?: number | null;
  n2o_emissions?: number | null;
  match_status?: string | null;
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
      .from("emission_factors")
      .select(
        `"category_1", "uom", "Source", "scope", "GHG Conversion Factor 2024"`
      )
      .order("category_1")
      .order("uom")
      .order("Source");

    if (error) throw error;
    if (!data || !Array.isArray(data)) {
      throw new Error("No emission factors data returned");
    }

    return { data, error: null };
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
    const { data: entriesData, error: entriesError } = await supabase
      .from("emission_entries")
      .select("category, unit, scope")
      .eq("company_id", companyId);

    if (entriesError) throw entriesError;
    if (!entriesData || !Array.isArray(entriesData)) {
      throw new Error("No emission entries data returned");
    }

    const { data: factorsData, error: factorsError } = await supabase
      .from("emission_factors")
      .select(`"category_1", "uom", "Source", "scope"`);

    if (factorsError) throw factorsError;
    if (!factorsData || !Array.isArray(factorsData)) {
      throw new Error("No emission factors data returned");
    }

    const { data: preferences, error: prefError } = await supabase
      .from("company_preferences")
      .select("preferred_emission_source")
      .eq("company_id", companyId)
      .maybeSingle();

    if (prefError) throw prefError;

    const preferredSource = preferences?.preferred_emission_source || "DEFRA";

    const normalizeString = (str?: string) => (str || "").toLowerCase().trim();

    const uniqueCombinations =
      entriesData.filter((value, index, self) =>
        index ===
        self.findIndex(
          (t) =>
            normalizeString(t.category) === normalizeString(value.category) &&
            normalizeString(t.unit) === normalizeString(value.unit) &&
            t.scope === value.scope
        )
      ) || [];

    const knownSources = [
      "DEFRA",
      "EPA",
      "IPCC",
      "GHG Protocol Default",
      "ADEME",
    ];

    const statusChecks = uniqueCombinations.map((combo) => {
      const sources = knownSources.map((source) => {
        const matchingFactors =
          factorsData.filter(
            (factor) =>
              (factor.category_1?.toLowerCase().trim() ?? "") ===
                (combo.category?.toLowerCase().trim() ?? "") &&
              (factor.uom?.toLowerCase().trim() ?? "") ===
                (combo.unit?.toLowerCase().trim() ?? "") &&
              factor.Source === source &&
              Number(factor.scope) === combo.scope
          ) || [];

        return {
          source,
          hasData: matchingFactors.length > 0,
        };
      });

      return {
        category: combo.category || "",
        unit: combo.unit || "",
        availableSources: sources,
      };
    });

    return {
      data: statusChecks,
      preferredSource,
      error: null,
    };
  } catch (error: any) {
    console.error("Error checking emission factor status:", error);
    return {
      data: [],
      preferredSource: null,
      error,
    };
  }
};

/**
 * Run diagnostics on emission calculations and returns any issues found
 */
export const runEmissionDiagnostics = async (companyId: string) => {
  try {
    const { data: entriesData, error: entriesError } = await supabase
      .from("emission_entries")
      .select("category, unit, scope, emissions, match_status")
      .eq("company_id", companyId);

    if (entriesError) throw entriesError;
    if (!entriesData || !Array.isArray(entriesData)) {
      throw new Error("No emission entries data returned");
    }

    const unmatched = entriesData.filter(entry => entry.match_status === 'unmatched' || !entry.emissions);
    
    const { data: diagnostics, error: diagnosticsError } = await supabase
      .from("emission_matching_diagnostics")
      .select("category, unit, scope, reason")
      .eq("company_id", companyId)
      .order('checked_at', { ascending: false });
      
    if (diagnosticsError) throw diagnosticsError;

    const { data: pref, error: prefError } = await supabase
      .from("company_preferences")
      .select("preferred_emission_source")
      .eq("company_id", companyId)
      .maybeSingle();

    if (prefError) throw prefError;

    const preferredSource = pref?.preferred_emission_source || "DEFRA";

    // Convert diagnostics to logs format
    const logs = (diagnostics || []).map(diag => ({
      log_type: "warning",
      log_message: `Missing emission factor for: ${diag.category}/${diag.unit} (scope ${diag.scope})`
    }));

    return {
      logs,
      missingCalculations: unmatched.length,
      error: null,
    };
  } catch (error: any) {
    console.error("Error running diagnostics:", error);
    toast.error("Failed to run emission diagnostics");
    return {
      logs: [],
      missingCalculations: 0,
      error,
    };
  }
};

/**
 * Recalculate emissions for a company using the enhanced GHG calculation function
 */
export const recalculateCompanyEmissions = async (companyId: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('calculate-emissions', {
      body: { company_id: companyId }
    });

    if (error) throw error;

    if (data.success) {
      toast.success(data.message || "Emissions recalculated successfully");
      return { 
        updated_rows: data.data?.[0]?.updated_rows || 0, 
        unmatched_rows: data.data?.[0]?.unmatched_rows || 0 
      };
    } else {
      throw new Error(data.error || 'Calculation failed');
    }
  } catch (error) {
    console.error('Error recalculating emissions:', error);
    toast.error(`Failed to recalculate emissions: ${error.message || 'Unknown error'}`);
    throw error;
  }
};
