
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export interface CalculatedEmission {
  id: string;
  date: string;
  source: string;
  fuel_type: string;
  amount: number;
  unit: string;
  emissions_co2e: number;
  emission_factor: number;
  emission_factor_source: string;
  calculation_id: string;
}

interface CalculationLog {
  id: string;
  log_type: 'info' | 'warning' | 'error';
  log_message: string;
  created_at: string;
}

export const useEmissionsCalculations = (companyId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [calculatedEmissions, setCalculatedEmissions] = useState<CalculatedEmission[]>([]);
  const [calculationLogs, setCalculationLogs] = useState<CalculationLog[]>([]);

  const fetchCalculatedEmissions = async () => {
    if (!companyId) return;
    
    setIsLoading(true);
    try {
      const { data: emissions, error } = await supabase
        .from('emissions_calculated')
        .select('*')
        .eq('company_id', companyId)
        .order('date', { ascending: false });

      if (error) throw error;
      setCalculatedEmissions(emissions || []);
      return { data: emissions, error: null };
    } catch (error: any) {
      console.error('Error fetching calculated emissions:', error);
      toast.error('Failed to load calculated emissions');
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  const calculateEmissions = async () => {
    if (!companyId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc(
        'calculate_scope1_emissions', // Using the function name defined in the TypeScript types
        { p_company_id: companyId }
      );

      if (error) throw error;

      // Fetch the calculation logs
      if (data) {
        const { data: logs, error: logsError } = await supabase
          .from('calculation_logs')
          .select('*')
          .eq('company_id', companyId)
          .order('created_at', { ascending: false })
          .limit(20);

        if (logsError) throw logsError;
        
        // Use proper type assertion to ensure logs match our expected interface
        const typedLogs: CalculationLog[] = (logs || []).map(log => ({
          id: log.id,
          log_type: (log.log_type as 'info' | 'warning' | 'error') || 'info',
          log_message: log.log_message || '',
          created_at: log.created_at || new Date().toISOString()
        }));
        
        setCalculationLogs(typedLogs);
      }

      await fetchCalculatedEmissions();
      toast.success('Emissions calculation completed');
      return { error: null };
    } catch (error: any) {
      console.error('Error calculating emissions:', error);
      toast.error('Failed to calculate emissions');
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCalculationLogs = async () => {
    if (!companyId) return;
    
    try {
      const { data: logs, error } = await supabase
        .from('calculation_logs')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      const typedLogs: CalculationLog[] = (logs || []).map(log => ({
        id: log.id,
        log_type: (log.log_type as 'info' | 'warning' | 'error') || 'info',
        log_message: log.log_message || '',
        created_at: log.created_at || new Date().toISOString()
      }));
      
      setCalculationLogs(typedLogs);
      return { data: typedLogs, error: null };
    } catch (error: any) {
      console.error('Error fetching calculation logs:', error);
      return { data: null, error };
    }
  };

  return {
    calculatedEmissions,
    calculationLogs,
    isLoading,
    fetchCalculatedEmissions,
    calculateEmissions,
    fetchCalculationLogs
  };
};
