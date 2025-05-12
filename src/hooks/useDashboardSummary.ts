import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  recent_activities: any[];
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

      // Calculate total emissions and scope breakdown using the joined data
      const total_emissions = emissionsData.reduce(
        (sum, entry) => sum + ((Array.isArray(entry.emission_calculations) && entry.emission_calculations[0]?.total_emissions) || 0),
        0
      );

      const scope_breakdown = Object.entries(
        emissionsData.reduce((acc, entry) => {
          const emissions = (Array.isArray(entry.emission_calculations) && entry.emission_calculations[0]?.total_emissions) || 0;
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

      const monthly_trends = monthlyData.reduce((acc, entry) => {
        const month = new Date(entry.created_at).toISOString().slice(0, 7);
        const emissions = (Array.isArray(entry.emission_calculations) && entry.emission_calculations[0]?.total_emissions) || 0;
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
      const coverage = emissionsData.length > 0
        ? ((emissionsData.length - (unmatched_count || 0)) / emissionsData.length) * 100
        : 0;

      // Fetch recent activities (commented out because 'activity_log' is not defined in Supabase types)
      // const { data: activities, error: activitiesError } = await supabase
      //   .from('activity_log')
      //   .select('*')
      //   .eq('company_id', companyId)
      //   .order('created_at', { ascending: false })
      //   .limit(10);
      // if (activitiesError) throw activitiesError;

      setSummary({
        total_emissions,
        scope_breakdown,
        monthly_trends: Object.entries(monthly_trends).map(([month, emissions]) => ({
          month,
          emissions,
        })),
        coverage,
        unmatched_entries: unmatched_count || 0,
        recent_activities: [], // activities || [],
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
