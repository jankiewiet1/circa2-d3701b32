
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface EmissionEntryData {
  id: string;
  company_id: string;
  upload_session_id?: string | null;
  date: string;
  year: number; // added yearly column
  category: string;
  description: string;
  quantity: number;
  unit: string;
  emission_factor: number;
  scope: number;
  emissions: number;
  created_at: string;
  updated_at: string;
}

interface Filters {
  dateRange?: string;
  year?: number;  // new filter for year
  category?: string;
  scope?: number;
  unit?: string;
}

export const useEmissionEntries = (companyId: string, scopeFilter?: number) => {
  const [isLoading, setIsLoading] = useState(false);
  const [entries, setEntries] = useState<EmissionEntryData[]>([]);

  const fetchEntries = async (filters?: Filters) => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('emission_entries')
        .select('*')
        .eq('company_id', companyId);

      if (scopeFilter) {
        query = query.eq('scope', scopeFilter);
      }

      if (filters) {
        // Replace dateRange usage with year filter if year specified
        if (filters.year) {
          query = query.eq('year', filters.year);
        } else if (filters.dateRange && filters.dateRange !== 'all') {
          const today = new Date();
          let startDate = new Date();

          switch (filters.dateRange) {
            case 'last3months':
              startDate.setMonth(today.getMonth() -3);
              break;
            case 'last6months':
              startDate.setMonth(today.getMonth() -6);
              break;
            case 'last12months':
              startDate.setFullYear(today.getFullYear() -1 );
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

        if (filters.category && filters.category !== 'all') {
          query = query.eq('category', filters.category);
        }

        if (filters.unit && filters.unit !== 'all') {
          query = query.eq('unit', filters.unit);
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      setEntries(data || []);
      return { data, error: null };
    } catch (error: any) {
      console.error('Error fetching emission entries:', error);
      toast.error('Failed to load emission data');
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    entries,
    isLoading,
    fetchEntries,
  };
};

