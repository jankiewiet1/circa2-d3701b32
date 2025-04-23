
// Fixing generics and property access issues with supabase query and types

import Fuse from "fuse.js";
import { supabase } from "@/integrations/supabase/client";

interface EmissionFactor {
  ID: number;
  category_1: string;
  category_2: string;
  category_3: string;
  category_4: string;
  "GHG Conversion Factor 2024": number | null;
  uom: string;
  Source: string;
  scope: string;
}

interface EmissionEntry {
  category: string;
  unit: string;
  scope: string;
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
};

/**
 * Normalize and replace synonyms in input strings.
 */
const normalizeStr = (str: string): string => {
  const lowered = str.toLowerCase().trim().replace(/\s+/g, " ");
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
 * Normalize unit applying synonyms replacement and trim/lowercase.
 */
const normalizeUnit = (unit: string): string => normalizeStr(unit);

/**
 * Normalize scope by converting to lowercase string.
 */
const normalizeScope = (scope: string): string => {
  return scope.toLowerCase().trim();
};

/**
 * Compose searchable string for each factor for Fuse search with all relevant fields.
 */
const composeSearchString = (factor: EmissionFactor): string => {
  return [
    buildFullCategory(factor),
    normalizeUnit(factor.uom),
    normalizeScope(factor.scope),
  ].join(" ");
};

type FuseFactor = EmissionFactor & { searchString: string };

/**
 * Loads emission factors from Supabase filtered by Source = 'DEFRA' using correct casing.
 * Builds Fuse.js instance for fuzzy searching categories + uom + scope.
 */
export async function loadEmissionFactorsFuse(): Promise<{ fuse: Fuse<FuseFactor>; factors: FuseFactor[] }> {
  const { data, error } = await supabase
    .from<"emission_factors", EmissionFactor>("emission_factors")
    .select(
      `"ID", category_1, category_2, category_3, category_4, "GHG Conversion Factor 2024", uom, "Source", scope`
    )
    .eq("Source", "DEFRA");

  if (error) {
    console.error("[EmissionFactorMatcher] Error fetching emission factors:", error);
    return { fuse: new Fuse([], { keys: ["searchString"] }), factors: [] };
  }

  if (!data || !Array.isArray(data)) {
    console.error("[EmissionFactorMatcher] No emission factors data found");
    return { fuse: new Fuse([], { keys: ["searchString"] }), factors: [] };
  }

  const factors: FuseFactor[] = data.map((factor) => ({
    ID: factor.ID,
    category_1: factor.category_1 ?? "",
    category_2: factor.category_2 ?? "",
    category_3: factor.category_3 ?? "",
    category_4: factor.category_4 ?? "",
    uom: factor.uom ?? "",
    Source: factor.Source ?? "",
    scope: factor.scope ?? "",
    "GHG Conversion Factor 2024": factor["GHG Conversion Factor 2024"] ?? null,
    searchString: composeSearchString({
      ID: factor.ID,
      category_1: factor.category_1 ?? "",
      category_2: factor.category_2 ?? "",
      category_3: factor.category_3 ?? "",
      category_4: factor.category_4 ?? "",
      uom: factor.uom ?? "",
      Source: factor.Source ?? "",
      scope: factor.scope ?? "",
      "GHG Conversion Factor 2024": factor["GHG Conversion Factor 2024"] ?? null,
    }),
  }));

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
 * Match a single emission entry to emission factor using fuzzy matching and boosting exact uom/scope matches.
 */
export async function matchEmissionEntry(
  entry: EmissionEntry
): Promise<MatchedEmissionResult> {
  const { category, unit, scope, quantity } = entry;
  if (!category || !unit || !scope) {
    return {
      matchedFactor: null,
      calculatedEmissions: null,
      log: "[EmissionFactorMatcher] Invalid input: missing category, unit or scope",
    };
  }

  const normCategory = normalizeStr(category);
  const normUnit = normalizeUnit(unit);
  const normScope = normalizeScope(scope);

  const { fuse, factors } = await loadEmissionFactorsFuse();
  if (!fuse) {
    return {
      matchedFactor: null,
      calculatedEmissions: null,
      log: "[EmissionFactorMatcher] Emission Factors Fuse index not available",
    };
  }

  const searchString = `${normCategory} ${normUnit} ${normScope}`;
  let searchResults = fuse.search(searchString, { limit: 10 });

  if (searchResults.length === 0) {
    searchResults = fuse.search(normCategory, { limit: 10 });
  }

  if (searchResults.length === 0) {
    // Provide top 3 closest matches by category as debug info
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
    const logMatches = catResults
      .map((r) => {
        return `ID:${r.item.ID}, category: "${r.item.category_1} ${r.item.category_2} ${r.item.category_3} ${r.item.category_4}", uom: ${r.item.uom}, scope: ${r.item.scope}, score: ${r.score?.toFixed(4)}`;
      })
      .join(" | ");

    return {
      matchedFactor: null,
      calculatedEmissions: null,
      log: `[EmissionFactorMatcher] No matching emission factor for input category "${category}", unit "${unit}", scope "${scope}". Top 3 closest matches: ${logMatches}`,
    };
  }

  // Boost score for exact matches on uom and scope
  const boostedResults = searchResults.map(({ item, score }) => {
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

  boostedResults.sort((a, b) => a.boostedScore - b.boostedScore);
  const bestMatch = boostedResults[0]?.item ?? null;

  if (!bestMatch) {
    return {
      matchedFactor: null,
      calculatedEmissions: null,
      log: "[EmissionFactorMatcher] No emission factor matched after boosting.",
    };
  }

  if (bestMatch["GHG Conversion Factor 2024"] == null) {
    return {
      matchedFactor: null,
      calculatedEmissions: null,
      log: `[EmissionFactorMatcher] Matched emission factor missing GHG Conversion Factor 2024 for category "${category}"`,
    };
  }

  const emissions = quantity * bestMatch["GHG Conversion Factor 2024"];

  return {
    matchedFactor: bestMatch,
    calculatedEmissions: emissions,
  };
}

