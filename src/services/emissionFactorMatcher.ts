
// Utility module to match emission entries to the best available emission factor (DEFRA source) using fuzzy category matching.

import Fuse from "fuse.js";
import { supabase } from "@/integrations/supabase/client";

interface EmissionFactor {
  id: number;
  category_1: string;
  category_2: string;
  category_3: string;
  category_4: string;
  ghg_conversion_factor_2024: number | null;
  uom: string;
  source: string;
  scope: number;
}

interface EmissionEntry {
  category: string;
  unit: string;
  scope: number;
  quantity: number;
}

export interface MatchedEmissionResult {
  matchedFactor: EmissionFactor | null;
  calculatedEmissions: number | null;
  log?: string;
}

/**
 * Clean and normalize string: lowercase, trim, remove extra spaces.
 */
const normalizeStr = (str: string): string =>
  str.toLowerCase().trim().replace(/\s+/g, " ");

/**
 * Combine category columns into a normalized "fullCategory" string.
 */
const buildFullCategory = (factor: EmissionFactor): string => {
  return [
    factor.category_1,
    factor.category_2,
    factor.category_3,
    factor.category_4,
  ]
    .filter(Boolean)
    .map(normalizeStr)
    .join(" ");
};

/**
 * Loads emission factors from Supabase filtered by DEFRA source (exact match).
 * Builds Fuse.js instance for fuzzy searching categories.
 */
export async function loadEmissionFactorsFuse() {
  const { data, error } = await supabase
    .from("emission_factors")
    .select(
      "id, category_1, category_2, category_3, category_4, ghg_conversion_factor_2024, uom, source, scope"
    )
    .eq("source", "DEFRA");

  if (error) {
    console.error("[EmissionFactorMatcher] Error fetching emission factors:", error);
    throw error;
  }

  if (!data || !Array.isArray(data)) {
    console.error("[EmissionFactorMatcher] No data found");
    return { fuse: null, factors: [] };
  }

  // Normalize scope to number, and build fullCategory property for Fuse
  const factors: (EmissionFactor & { fullCategory: string })[] = data.map(
    (factor: any) => ({
      ...factor,
      scope: Number(factor.scope),
      fullCategory: buildFullCategory(factor),
    })
  );

  // Init Fuse.js for fuzzy search on fullCategory
  const fuse = new Fuse(factors, {
    keys: ["fullCategory"],
    threshold: 0.3,
    ignoreLocation: true,
    isCaseSensitive: false,
    findAllMatches: false,
    minMatchCharLength: 3,
  });

  return { fuse, factors };
}

/**
 * Matches a single emission entry to an emission factor using fuzzy category matching,
 * exact scope (integer), and exact unit (case-insensitive).
 * Returns matched factor and calculated emissions or logs if none found.
 */
export async function matchEmissionEntry(
  entry: EmissionEntry
): Promise<MatchedEmissionResult> {
  const { category, unit, scope, quantity } = entry;
  const normUnit = unit.toLowerCase();
  const normCategory = normalizeStr(category);

  const { fuse, factors } = await loadEmissionFactorsFuse();

  if (!fuse) {
    const logMessage = "Emission Factors Fuse index is unavailable";
    return { matchedFactor: null, calculatedEmissions: null, log: logMessage };
  }

  // Filter factors by exact scope and unit (case insensitive)
  const candidateFactors = factors.filter(
    (f) => f.scope === scope && f.uom.toLowerCase() === normUnit
  );

  if (candidateFactors.length === 0) {
    const logMessage = `No emission factors found for scope: ${scope} and unit: ${unit}`;
    return { matchedFactor: null, calculatedEmissions: null, log: logMessage };
  }

  // Prepare Fuse instance on candidateFactors only for better fuzzy search accuracy
  const fuseForCandidates = new Fuse(candidateFactors, {
    keys: ["fullCategory"],
    threshold: 0.35,
    ignoreLocation: true,
    isCaseSensitive: false,
    findAllMatches: false,
    minMatchCharLength: 3,
  });

  // Search the category with Fuse
  const searchResults = fuseForCandidates.search(normCategory);

  if (searchResults.length === 0) {
    // Fallback: We attempt exact normalized category match across fullCategory of candidates
    const exactMatch = candidateFactors.find((f) => f.fullCategory === normCategory);
    if (exactMatch) {
      if (exactMatch.ghg_conversion_factor_2024 != null) {
        const emissions = quantity * exactMatch.ghg_conversion_factor_2024;
        return { matchedFactor: exactMatch, calculatedEmissions: emissions };
      }
      return {
        matchedFactor: null,
        calculatedEmissions: null,
        log: `Emission factor conversion missing for matched exact category`,
      };
    }
    const logMessage = `No matching EF for category '${category}' | unit '${unit}' | Scope ${scope}`;
    return { matchedFactor: null, calculatedEmissions: null, log: logMessage };
  }

  // Pick best match (lowest score)
  const bestMatch = searchResults[0].item;
  if (bestMatch.ghg_conversion_factor_2024 == null) {
    return {
      matchedFactor: null,
      calculatedEmissions: null,
      log: `Emission factor missing ghg_conversion_factor_2024 for matched category for '${category}'`,
    };
  }

  const emissions = quantity * bestMatch.ghg_conversion_factor_2024;

  return {
    matchedFactor: bestMatch,
    calculatedEmissions: emissions,
  };
}
