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
  scope: number;
  emissions: number;
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
      .select("category, unit, scope, emissions")
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

    const { data: pref, error: prefError } = await supabase
      .from("company_preferences")
      .select("preferred_emission_source")
      .eq("company_id", companyId)
      .maybeSingle();

    if (prefError) throw prefError;

    const preferredSource = pref?.preferred_emission_source || "DEFRA";

    const missingFactorsSet = new Set<string>();

    entriesData.forEach((entry) => {
      const factorExists = factorsData.some(
        (factor) =>
          (factor.category_1?.toLowerCase().trim() ?? "") ===
            entry.category.toLowerCase().trim() &&
          (factor.uom?.toLowerCase().trim() ?? "") === entry.unit.toLowerCase().trim() &&
          Number(factor.scope) === entry.scope &&
          factor.Source === preferredSource
      );
      if (!factorExists) {
        missingFactorsSet.add(`${entry.category}/${entry.unit}`);
      }
    });

    return {
      logs: Array.from(missingFactorsSet).map((type) => ({
        log_type: "warning",
        log_message: `Missing emission factor for: ${type}`,
      })),
      missingCalculations: missingFactorsSet.size,
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
 * Recalculate emissions for a company using the new GHG calculation function
 */
export const recalculateCompanyEmissions = async (companyId: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('calculate-emissions', {
      body: { company_id: companyId }
    });

    if (error) throw error;

    if (data.success) {
      const { updated_rows, unmatched_rows } = data.data[0];
      toast.success(`Successfully updated ${updated_rows} entries. ${unmatched_rows} entries remain unmatched.`);
      return { updated_rows, unmatched_rows };
    } else {
      throw new Error('Calculation failed');
    }
  } catch (error) {
    console.error('Error recalculating emissions:', error);
    toast.error('Failed to recalculate emissions');
    throw error;
  }
};
