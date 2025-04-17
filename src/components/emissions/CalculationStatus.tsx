
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useCompany } from '@/contexts/CompanyContext';
import { recalculateCompanyEmissions } from '@/services/companyPreferencesService';
import { EmissionCalculationStatus } from './EmissionCalculationStatus';
import { toast } from 'sonner';

export const CalculationStatus = () => {
  const { company } = useCompany();
  const [isRecalculating, setIsRecalculating] = useState(false);
  
  if (!company?.id) {
    return null;
  }

  const handleRecalculate = async () => {
    setIsRecalculating(true);
    try {
      const { error } = await recalculateCompanyEmissions(company.id);
      if (error) throw error;
      toast.success("Emissions recalculation completed successfully");
    } catch (error) {
      console.error("Error during recalculation:", error);
      toast.error("Failed to recalculate emissions");
    } finally {
      setIsRecalculating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Emission Calculation Status</CardTitle>
            <CardDescription>Status of emission calculations using emission factors</CardDescription>
          </div>
          <Button 
            variant="outline" 
            onClick={handleRecalculate} 
            disabled={isRecalculating}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRecalculating ? 'animate-spin' : ''}`} />
            Recalculate All Emissions
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <EmissionCalculationStatus companyId={company.id} />
      </CardContent>
    </Card>
  );
};
