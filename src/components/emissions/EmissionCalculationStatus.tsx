
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { fetchCompanyPreferences } from '@/services/companyPreferencesService';
import { useScope1Emissions } from '@/hooks/useScope1Emissions';

interface EmissionCalculationStatusProps {
  companyId: string;
}

export const EmissionCalculationStatus = ({ companyId }: EmissionCalculationStatusProps) => {
  const [calculationStatus, setCalculationStatus] = useState<{
    total: number;
    calculated: number;
    preferredSource: string;
  }>({
    total: 0,
    calculated: 0,
    preferredSource: 'DEFRA',
  });
  
  const { emissions, isLoading } = useScope1Emissions(companyId);

  useEffect(() => {
    const checkCalculationStatus = async () => {
      if (!companyId) return;

      try {
        // Get company's preferred emission source
        const { data: preferences } = await fetchCompanyPreferences(companyId);
        const preferredSource = preferences?.preferred_emission_source || 'DEFRA';
        
        // Count total emissions from the scope1_emissions hook
        const totalCount = emissions.length;
        
        // Count emissions that have been calculated
        const calculatedCount = emissions.filter(e => e.emissions_co2e !== null && e.emissions_co2e !== undefined).length;

        setCalculationStatus({
          total: totalCount || 0,
          calculated: calculatedCount || 0,
          preferredSource,
        });
      } catch (error) {
        console.error('Error checking calculation status:', error);
      }
    };

    if (!isLoading) {
      checkCalculationStatus();
    }
  }, [companyId, emissions, isLoading]);

  const needsRecalculation = calculationStatus.total > 0 && calculationStatus.calculated < calculationStatus.total;

  if (calculationStatus.total === 0) {
    return null; // Don't show anything if there are no emissions
  }

  return (
    <div className="mb-4">
      {needsRecalculation ? (
        <Alert variant="default" className="bg-yellow-50 text-yellow-800 border-yellow-200">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>
            {calculationStatus.calculated} of {calculationStatus.total} emission records have been calculated using{' '}
            <Badge variant="outline">{calculationStatus.preferredSource}</Badge> emission factors.
            Use the "Recalculate" button to update all records.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
          <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
          <AlertDescription>
            All {calculationStatus.total} emission records have been calculated using{' '}
            <Badge variant="outline" className="bg-green-100 text-green-800">{calculationStatus.preferredSource}</Badge> emission factors.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
