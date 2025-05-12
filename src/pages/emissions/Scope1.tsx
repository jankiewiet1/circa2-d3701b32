
import React, { useEffect, useState } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { EmissionsSidebar } from '@/components/emissions/EmissionsSidebar';
import { Scope1Detail } from '@/components/emissions/Scope1Detail';
import { useCompany } from '@/contexts/CompanyContext';
import { supabase } from '@/integrations/supabase/client';

interface EmissionEntryWithCalculation {
  id: string;
  category: string;
  date: string;
  description: string;
  quantity: number;
  unit: string;
  scope: number;
  emission_calculations: {
    total_emissions: number;
    emission_factor_id: number;
  }[];
}

export default function Scope1() {
  const { company } = useCompany();
  const [entries, setEntries] = useState<EmissionEntryWithCalculation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchScope1Emissions();
  }, [company?.id]);

  const fetchScope1Emissions = async () => {
    if (!company?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('emission_entries')
        .select(`
          *,
          emission_calculations(*)
        `)
        .eq('company_id', company.id)
        .eq('scope', 1)
        .order('date', { ascending: false });

      if (error) throw error;
      setEntries(data as EmissionEntryWithCalculation[] || []);
    } catch (err: any) {
      console.error('Error fetching scope 1 emissions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="flex">
        <EmissionsSidebar />
        <div className="flex-1 p-6">
          <Scope1Detail 
            entries={entries}
            loading={loading}
            error={error}
            refetch={fetchScope1Emissions}
          />
        </div>
      </div>
    </MainLayout>
  );
}
