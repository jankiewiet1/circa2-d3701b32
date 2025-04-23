
// Utility module to match emission entries to the best available emission factor (DEFRA source) using enhanced fuzzy category matching with improved normalization, synonyms, and logging.

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
  scope: number | string;
}

interface EmissionEntry {
  category: string;
  unit: string;
  scope: number | string;
  quantity: number;
}

export interface MatchedEmissionResult {
  matchedFactor: EmissionFactor | null;
  calculatedEmissions: number | null;
  log?: string;
}

/**
 * Synonyms mapping for units and some category terms (basic).
 */
const synonymsMap: Record<string, string> = {
  liter: "liters",
  litre: "liters",
  l: "liters",
  litre: "liters",
  petrol: "gasoline",
  gas: "gasoline",
  gasoline: "gasoline",
  kg: "kg",
  kilogram: "kg",
  kilograms: "kg",
  tonnes: "t",
  ton: "t",
  tonnage: "t",
  t: "t",
  // Add more synonyms as needed
};

/**
 * Normalize and replace synonyms in input strings.
 */
const normalizeStr = (str: string): string => {
  const lowered = str.toLowerCase().trim().replace(/\s+/g, " ");
  // Replace synonyms if any
  const replaced = synonymsMap[lowered] ?? lowered;
  return replaced;
};

/**
 * Compose the full category string by combining category_1 through category_4 (normalized).
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
 * Normalize uom/unit applying synonyms replacement and trim/lowercase.
 */
const normalizeUnit = (unit: string): string => normalizeStr(unit);

/**
 * Normalize scope by converting number/string consistently to string, lowercased.
 */
const normalizeScope = (scope: number | string): string => {
  if (typeof scope === "number") return scope.toString();
  return scope.toLowerCase().trim();
};

/**
 * Compose searchable string for each factor for Fuse search with all relevant fields.
 */
const composeSearchString = (factor: EmissionFactor): string => {
  // categories + uom + scope as string
  return [
    buildFullCategory(factor),
    normalizeUnit(factor.uom),
    normalizeScope(factor.scope),
  ]
    .join(" ");
};

type FuseFactor = EmissionFactor & { searchString: string };

/**
 * Loads emission factors from Supabase filtered by DEFRA source (exact match).
 * Builds Fuse.js instance for fuzzy searching categories + uom + scope.
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

  // Normalize scope to string explicitly
  const factors: FuseFactor[] = data.map((factor: any) => ({
    ...factor,
    scope: typeof factor.scope === "number" ? factor.scope.toString() : factor.scope,
    category_1: factor.category_1 ?? "",
    category_2: factor.category_2 ?? "",
    category_3: factor.category_3 ?? "",
    category_4: factor.category_4 ?? "",
    uom: factor.uom ?? "",
    source: factor.source ?? "",
    ghg_conversion_factor_2024: factor.ghg_conversion_factor_2024 ?? null,
    searchString: composeSearchString(factor),
  }));

  // Setup Fuse index options: search on composed searchString
  const fuse = new Fuse(factors, {
    keys: ["searchString"],
    threshold: 0.4,
    ignoreLocation: true,
    isCaseSensitive: false,
    findAllMatches: false,
    minMatchCharLength: 3,
    includeScore: true,
  });

  return { fuse, factors };
}

/**
 * Match a single emission entry to an emission factor using fuzzy matching,
 * with boosting for exact uom and scope matches.
 * Returns matched factor and calculated emissions or logs if none found.
 */
export async function matchEmissionEntry(
  entry: EmissionEntry
): Promise<MatchedEmissionResult> {
  const { category, unit, scope, quantity } = entry;
  if (!category || !unit || !scope) {
    return {
      matchedFactor: null,
      calculatedEmissions: null,
      log: `[EmissionFactorMatcher] Invalid input: missing category, unit or scope`,
    };
  }

  // Normalize inputs with synonym replacements for unit and normalized category.
  const normCategory = normalizeStr(category);
  const normUnit = normalizeUnit(unit);
  const normScope = normalizeScope(scope);

  const { fuse, factors } = await loadEmissionFactorsFuse();

  if (!fuse) {
    const logMessage = "[EmissionFactorMatcher] Emission Factors Fuse index not available";
    return { matchedFactor: null, calculatedEmissions: null, log: logMessage };
  }

  /*
   * Strategy:
   * - Build search string to query Fuse that includes category + unit + scope normalized.
   * - Fuse returns list of best matches (with score).
   * - We boost score for exact match on uom and scope vs entry.
   */

  const searchString = `${normCategory} ${normUnit} ${normScope}`;

  // Search with Fuse
  let searchResults = fuse.search(searchString);

  // If no results, fallback search only on normalized category
  if (searchResults.length === 0) {
    searchResults = fuse.search(normCategory);
  }

  // If still no results, log top 3 closest matches (from entire factor list by manual string distance)
  if (searchResults.length === 0) {
    // Prepare an array of candidate debug strings sorted by Fuse as fallback: order by simple Levenshtein or string similarity for category
    // but for simplicity just pick first 3 factors with best searchString similarity (we'll reuse Fuse scores by searching only category)
    const fuseCat = new Fuse(factors, {
      keys: ["searchString"],
      threshold: 1.0,
      ignoreLocation: true,
      isCaseSensitive: false,
      findAllMatches: false,
      minMatchCharLength: 1,
      includeScore: true,
    });
    const catResults = fuseCat.search(normCategory, { limit: 3 });

    const logMatches = catResults.map((r) => {
      return `id:${r.item.id}, category: "${r.item.category_1} ${r.item.category_2} ${r.item.category_3} ${r.item.category_4}", uom: ${r.item.uom}, scope: ${r.item.scope}, score: ${r.score?.toFixed(4)}`;
    }).join(" | ");

    const logMsg = `[EmissionFactorMatcher] No matching emission factor for category "${category}", unit "${unit}", scope "${scope}". Top 3 closest matches: ${logMatches}`;
    return { matchedFactor: null, calculatedEmissions: null, log: logMsg };
  }

  // Post-process results to boost matches with exact uom and scope matching:
  const boostedResults = searchResults.map(result => {
    const { item, score } = result;
    // Lower score is better, reduce score by 0.1 if uom & scope match exactly (scaled boost)
    let boost = 0;
    if (normalizeUnit(item.uom) === normUnit) boost -= 0.1;
    if (normalizeScope(item.scope) === normScope) boost -= 0.1;
    const boostedScore = Math.max(0, (score ?? 1) + boost);
    return {
      item,
      originalScore: score ?? 1,
      boostedScore,
    };
  });

  // Sort again by boosted score ascending (better matches first)
  boostedResults.sort((a, b) => a.boostedScore - b.boostedScore);

  const bestMatch = boostedResults[0].item;

  if (!bestMatch) {
    const logMessage = "[EmissionFactorMatcher] No emission factor matched after boosting.";
    return { matchedFactor: null, calculatedEmissions: null, log: logMessage };
  }

  if (bestMatch.ghg_conversion_factor_2024 == null) {
    return {
      matchedFactor: null,
      calculatedEmissions: null,
      log: `[EmissionFactorMatcher] Matched emission factor missing ghg_conversion_factor_2024 for category "${category}"`,
    };
  }

  // Calculate emissions using matched conversion factor
  const emissions = quantity * bestMatch.ghg_conversion_factor_2024;

  return {
    matchedFactor: bestMatch,
    calculatedEmissions: emissions,
  };
}
