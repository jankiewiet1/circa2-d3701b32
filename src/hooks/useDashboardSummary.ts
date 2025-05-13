import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface EmissionCalculation {
  entry_id: string;
  total_emissions: number;
}

interface EmissionEntry {
  id: string;
  scope: number;
  created_at: string;
  emission_calculations: EmissionCalculation[];
}

interface MonthlyEntry {
  created_at: string;
  emission_calculations: EmissionCalculation[];
}

interface DashboardSummary {
  total_emissions: number;
  scope_breakdown: {
    scope: number;
    emissions: number;
  }[];
  monthly_trends: {
    month: string;
    emissions: number;
  }[];
  coverage: number;
  unmatched_entries: number;
  recent_activities: unknown[];
}

function ensureArray<T>(value: T | T[]): T[] {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null) return [];
  return [value];
}

export function useDashboardSummary(companyId: string | null) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    if (!companyId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch total emissions and scope breakdown with calculations
      const { data: emissionsData, error: emissionsError } = await supabase
        .from('emission_entries')
        .select(`
          id,
          scope,
          created_at,
          emission_calculations!inner(entry_id,total_emissions)
        `)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (emissionsError) throw emissionsError;

      const emissionsEntries = (emissionsData || []).map((entry: any) => ({
        ...entry,
        emission_calculations: ensureArray(entry.emission_calculations),
      })) as EmissionEntry[];

      // Calculate total emissions and scope breakdown using the joined data
      const total_emissions = emissionsEntries.reduce(
        (sum, entry) => sum + (entry.emission_calculations[0]?.total_emissions || 0),
        0
      );

      const scope_breakdown = Object.entries(
        emissionsEntries.reduce((acc, entry) => {
          const emissions = entry.emission_calculations[0]?.total_emissions || 0;
          acc[entry.scope] = (acc[entry.scope] || 0) + emissions;
          return acc;
        }, {} as Record<number, number>)
      ).map(([scope, emissions]) => ({ scope: Number(scope), emissions }));

      // Fetch monthly trends (last 12 months)
      const { data: monthlyData, error: monthlyError } = await supabase
        .from('emission_entries')
        .select(`
          created_at,
          emission_calculations(entry_id,total_emissions)
        `)
        .eq('company_id', companyId)
        .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString());

      if (monthlyError) throw monthlyError;

      const monthlyEntries = (monthlyData || []).map((entry: any) => ({
        ...entry,
        emission_calculations: ensureArray(entry.emission_calculations),
      })) as MonthlyEntry[];

      const monthly_trends = monthlyEntries.reduce((acc, entry) => {
        const month = new Date(entry.created_at).toISOString().slice(0, 7);
        const emissions = entry.emission_calculations[0]?.total_emissions || 0;
        acc[month] = (acc[month] || 0) + emissions;
        return acc;
      }, {} as Record<string, number>);

      // Fetch unmatched entries count
      const { count: unmatched_count, error: unmatchedError } = await supabase
        .from('emission_entries')
        .select('id', { count: 'exact' })
        .eq('company_id', companyId)
        .is('emission_calculations.total_emissions', null)
        .order('created_at', { ascending: false });

      if (unmatchedError) throw unmatchedError;

      // Calculate coverage
      const coverage = emissionsEntries.length > 0
        ? ((emissionsEntries.length - (unmatched_count || 0)) / emissionsEntries.length) * 100
        : 0;

      setSummary({
        total_emissions,
        scope_breakdown,
        monthly_trends: Object.entries(monthly_trends).map(([month, emissions]) => ({
          month,
          emissions,
        })),
        coverage,
        unmatched_entries: unmatched_count || 0,
        recent_activities: [],
      });
      setLoading(false);
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError('Failed to load dashboard data');
      if (Array.isArray(summary) && summary.length === 0) {
        setSummary(null);
      }
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return { summary, loading, error, refetch: fetchDashboardData };
}
