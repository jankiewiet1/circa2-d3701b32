
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export const useScope1Emissions = (companyId: string) => {
  const [isLoading, setIsLoading] = useState(false);

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
    isLoading,
    addEmission,
    updateEmission,
  };
};
