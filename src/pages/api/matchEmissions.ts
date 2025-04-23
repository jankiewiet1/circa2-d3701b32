
import type { NextApiRequest, NextApiResponse } from 'next';
import { matchEmissionEntry, MatchedEmissionResult } from '@/services/emissionFactorMatcher';

// This API route is for dev/testing only.
// POST an array of emission entries to test matching logic.
// Body: [{ category:string, unit:string, scope:number, quantity:number }]

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const entries = req.body;
  if (!Array.isArray(entries)) {
    return res.status(400).json({ error: 'Request body must be an array of emission entries' });
  }

  const results: (MatchedEmissionResult & { entry: typeof entries[number] })[] = [];

  for (const entry of entries) {
    // Basic validation
    if (
      typeof entry.category !== 'string' ||
      typeof entry.unit !== 'string' ||
      typeof entry.scope !== 'number' ||
      typeof entry.quantity !== 'number'
    ) {
      results.push({
        matchedFactor: null,
        calculatedEmissions: null,
        log: 'Invalid emission entry data',
        entry,
      });
      continue;
    }

    try {
      const matchResult = await matchEmissionEntry(entry);
      results.push({ ...matchResult, entry });
    } catch (error) {
      results.push({
        matchedFactor: null,
        calculatedEmissions: null,
        log: `Error: ${error instanceof Error ? error.message : String(error)}`,
        entry,
      });
    }
  }

  return res.status(200).json({ results });
}
