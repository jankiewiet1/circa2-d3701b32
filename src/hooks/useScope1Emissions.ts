
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Scope1EmissionData {
  id: string;
  fuel_type: string;
  source: string;
  amount: number;
  unit: string;
  date: string;
  emissions_co2e?: number;
  emission_factor_source?: string;
  emission_factor?: number;
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
        .from('scope1_emissions_with_calculation')
        .select('*')
        .eq('company_id', companyId);
        
      if (filters) {
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
      
      const formattedData: Scope1EmissionData[] = data?.map((item: any) => ({
        id: item.id || '',
        fuel_type: item.fuel_type || '',
        source: item.source || '',
        amount: item.amount || 0,
        unit: item.unit || '',
        date: item.date || '',
        emissions_co2e: item.emissions_co2e,
        emission_factor_source: item.emission_factor_source,
        emission_factor: item.emission_factor,
        company_id: item.company_id
      })) || [];
      
      setEmissions(formattedData);
      return { data: formattedData, error: null };
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

  return {
    emissions,
    isLoading,
    fetchEmissions,
    addEmission,
    updateEmission
  };
};
