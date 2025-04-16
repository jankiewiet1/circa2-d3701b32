
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { fetchCompanyPreferences } from '@/services/companyPreferencesService';

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

  useEffect(() => {
    const checkCalculationStatus = async () => {
      if (!companyId) return;

      try {
        // Get company's preferred emission source
        const { data: preferences } = await fetchCompanyPreferences(companyId);
        const preferredSource = preferences?.preferred_emission_source || 'DEFRA';
        
        // Count total emissions
        const { count: totalCount, error: totalError } = await supabase
          .from('scope1_emissions')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', companyId);

        if (totalError) throw totalError;

        // Count emissions that have been calculated and match the preferred source
        const { count: calculatedCount, error: calculatedError } = await supabase
          .from('emissions_calculated')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', companyId)
          .eq('emission_factor_source', preferredSource);

        if (calculatedError) throw calculatedError;

        setCalculationStatus({
          total: totalCount || 0,
          calculated: calculatedCount || 0,
          preferredSource,
        });
      } catch (error) {
        console.error('Error checking calculation status:', error);
      }
    };

    checkCalculationStatus();
  }, [companyId]);

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
