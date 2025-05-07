import { useEffect, useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { EmissionCalculationStatus } from '@/components/EmissionCalculationStatus';

export default function Scope1Page() {
  const supabase = useSupabaseClient();
  const [company, setCompany] = useState(null);

  useEffect(() => {
    async function getActiveCompany() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: company } = await supabase
          .from('companies')
          .select('*')
          .single();
        setCompany(company);
      }
    }
    getActiveCompany();
  }, [supabase]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-bold">Scope 1 Emissions</h1>
      
      {company && (
        <EmissionCalculationStatus 
          companyId={company.id} 
          scope="scope1" 
        />
      )}

      {/* Other Scope 1 content */}
    </div>
  );
} 