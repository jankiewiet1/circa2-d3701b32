
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export interface Scope1EmissionData {
  id: string;
  fuel_type: string;
  source: string;
  amount: number;
  unit: string;
  date: string;
  emissions_co2e?: number;
  emission_factor_source?: string;
  company_id?: string;
}

interface Filters {
  dateRange?: string;
  fuelType?: string;
  source?: string;
  unit?: string;
}

export const useScope1Emissions = (companyId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [emissions, setEmissions] = useState<Scope1EmissionData[]>([]);

  const fetchEmissions = async (filters?: Filters) => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('scope1_emissions')
        .select('*')
        .eq('company_id', companyId);
        
      // Apply filters if provided
      if (filters) {
        // Apply date range filter
        if (filters.dateRange && filters.dateRange !== 'all') {
          const today = new Date();
          let startDate = new Date();
          
          switch (filters.dateRange) {
            case 'last3months':
              startDate.setMonth(today.getMonth() - 3);
              break;
            case 'last6months':
              startDate.setMonth(today.getMonth() - 6);
              break;
            case 'last12months':
              startDate.setMonth(today.getMonth() - 12);
              break;
            case 'thisYear':
              startDate = new Date(today.getFullYear(), 0, 1);
              break;
            case 'lastYear':
              startDate = new Date(today.getFullYear() - 1, 0, 1);
              break;
          }
          
          query = query.gte('date', startDate.toISOString().split('T')[0]);
        }
        
        // Apply other filters
        if (filters.fuelType && filters.fuelType !== 'all') {
          query = query.eq('fuel_type', filters.fuelType);
        }
        
        if (filters.source && filters.source !== 'all') {
          query = query.eq('source', filters.source);
        }
        
        if (filters.unit && filters.unit !== 'all') {
          query = query.eq('unit', filters.unit);
        }
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setEmissions(data || []);
      return { data, error: null };
    } catch (error: any) {
      console.error('Error fetching emissions:', error);
      toast.error('Failed to load emission data');
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  const addEmission = async (emissionData: {
    fuel_type: string;
    source: string;
    amount: number;
    unit: string;
    date: string;
  }) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('scope1_emissions')
        .insert([{
          ...emissionData,
          company_id: companyId,
        }]);

      if (error) throw error;
      
      // Refresh the emissions list
      await fetchEmissions();
      
      toast.success('Emission data added successfully');
      return { error: null };
    } catch (error: any) {
      console.error('Error adding emission:', error);
      toast.error('Failed to add emission data');
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  const updateEmission = async (id: string, updates: {
    fuel_type?: string;
    source?: string;
    amount?: number;
    unit?: string;
    date?: string;
  }) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('scope1_emissions')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      // Refresh the emissions list
      await fetchEmissions();
      
      toast.success('Emission data updated successfully');
      return { error: null };
    } catch (error: any) {
      console.error('Error updating emission:', error);
      toast.error('Failed to update emission data');
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  const recalculateEmissions = async () => {
    setIsLoading(true);
    try {
      // Fix the TypeScript error by properly typing the RPC function parameters
      const { data, error } = await supabase.rpc('recalculate_scope1_emissions', {
        p_company_id: companyId as unknown as string
      });
      
      if (error) throw error;
      
      // Refresh the emissions list
      await fetchEmissions();
      
      toast.success('Emissions recalculated successfully');
      return { data, error: null };
    } catch (error: any) {
      console.error('Error recalculating emissions:', error);
      toast.error('Failed to recalculate emissions');
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    emissions,
    isLoading,
    fetchEmissions,
    addEmission,
    updateEmission,
    recalculateEmissions,
  };
};
