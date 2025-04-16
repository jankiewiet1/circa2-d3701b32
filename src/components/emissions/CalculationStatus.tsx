
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { useScope1Emissions } from '@/hooks/useScope1Emissions';
import { useCompany } from '@/contexts/CompanyContext';

interface CalculationLogDisplay {
  type: 'info' | 'warning' | 'error';
  message: string;
}

export const CalculationStatus = () => {
  const { company } = useCompany();
  const { emissions, isLoading, fetchEmissions } = useScope1Emissions(company?.id || '');

  // Fetch emissions on component mount
  useEffect(() => {
    if (company?.id) {
      fetchEmissions();
    }
  }, [company?.id]);

  // Generate status messages based on emissions data
  const getStatusMessages = (): CalculationLogDisplay[] => {
    const messages: CalculationLogDisplay[] = [];
    
    if (emissions.length === 0) {
      messages.push({
        type: 'info',
        message: 'No emissions data available yet'
      });
      return messages;
    }

    // Check for emissions that might have calculation issues
    const missingFactors = emissions.filter(e => !e.emission_factor);
    if (missingFactors.length > 0) {
      messages.push({
        type: 'warning',
        message: `${missingFactors.length} emissions records are missing emission factors`
      });
    }

    const calculatedEmissions = emissions.filter(e => e.emissions_co2e != null);
    messages.push({
      type: 'info',
      message: `${calculatedEmissions.length} of ${emissions.length} records have calculated CO₂e values`
    });

    return messages;
  };

  const getLogIcon = (type: 'info' | 'warning' | 'error') => {
    switch (type) {
      case 'info':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const statusMessages = getStatusMessages();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Calculation Status</CardTitle>
            <CardDescription>Status of emission calculations</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <p className="text-sm text-gray-500">Loading calculation status...</p>
          ) : statusMessages.length > 0 ? (
            statusMessages.map((log, index) => (
              <Alert key={index} variant={log.type === 'error' ? 'destructive' : 'default'}>
                <div className="flex items-start gap-2">
                  {getLogIcon(log.type)}
                  <AlertDescription>{log.message}</AlertDescription>
                </div>
              </Alert>
            ))
          ) : (
            <p className="text-sm text-gray-500">No status information available</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
