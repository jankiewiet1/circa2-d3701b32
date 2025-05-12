
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/contexts/CompanyContext';
import { toast } from 'sonner';

export interface DashboardSummary {
  total_emissions: number;
  emissions_by_scope: {
    scope: string;
    value: number;
  }[];
  monthly_trends: {
    month: string;
    total_monthly_emissions: number;
    scope_1_emissions: number;
    scope_2_emissions: number;
    scope_3_emissions: number;
  }[];
  category_breakdown: {
    name: string;
    value: number;
  }[];
  kpis: {
    monthly: {
      value: number;
      change_percent: number;
    };
    ytd: {
      value: number;
      change_percent: number;
    };
  };
}

export function useDashboardSummary(companyId?: string | null) {
  const { company } = useCompany();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use companyId from props if provided, otherwise use from context
  const effectiveCompanyId = companyId || company?.id;

  const fetchData = useCallback(async () => {
    if (!effectiveCompanyId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call the edge function for dashboard data
      const { data: responseData, error: responseError } = await supabase.functions.invoke(
        'get-dashboard-data',
        {
          body: {
            company_id: effectiveCompanyId
          }
        }
      );

      if (responseError) throw new Error(responseError.message);
      
      setData(responseData);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [effectiveCompanyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
