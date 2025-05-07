import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/contexts/CompanyContext';
import { toast } from 'sonner';

// Define the expected structure of the data returned by the backend function
interface DashboardSummaryData {
  total_emissions: number;
  team_members: number;
  emissions_by_scope: { scope: string; value: number }[];
  monthly_trends: { month: string; total_monthly_emissions: number }[];
  unmatched_count?: number; // Optional, based on SQL function
  // Add other fields returned by get_dashboard_data function
}

export const useDashboardSummary = () => {
  const { company } = useCompany();
  const [data, setData] = useState<DashboardSummaryData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!company?.id) {
      setLoading(false);
      // Don't set an error if company is just not loaded yet
      // setError('Company ID is not available.'); 
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Invoking get-dashboard-summary function for company:', company.id);
      const { data: functionData, error: functionError } = await supabase.functions.invoke(
        'get-dashboard-summary',
        {
          body: { company_id: company.id },
        }
      );

      if (functionError) {
        console.error('Error invoking function:', functionError);
        throw new Error(functionError.message || 'Failed to fetch dashboard summary');
      }

      console.log('Received dashboard summary data:', functionData);
      setData(functionData as DashboardSummaryData); // Assuming functionData matches the interface

    } catch (err: any) {
      console.error('Catch block error:', err);
      setError(err.message || 'An unexpected error occurred');
      toast.error("Failed to load dashboard data", {
        description: err.message
      });
    } finally {
      setLoading(false);
    }
  }, [company?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]); // Re-fetch when companyId changes

  return { data, loading, error, refetch: fetchData };
}; 