
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useCompany } from '@/contexts/CompanyContext';
import { supabase } from '@/integrations/supabase/client';
import { runEmissionDiagnostics, recalculateCompanyEmissions } from '@/services/emissionService';

export const CalculationStatus = () => {
  const { company } = useCompany();
  const [loading, setLoading] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [diagnostics, setDiagnostics] = useState<{
    logs: Array<{ log_type: string; log_message: string }>;
    missingCalculations: number;
  }>({
    logs: [],
    missingCalculations: 0
  });
  const [lastCalculation, setLastCalculation] = useState<string | null>(null);
  const [calculationStats, setCalculationStats] = useState<{
    matched: number;
    unmatched: number;
    total: number;
  }>({ matched: 0, unmatched: 0, total: 0 });

  useEffect(() => {
    if (company?.id) {
      checkCalculationStatus();
    }
  }, [company?.id]);

  const checkCalculationStatus = async () => {
    if (!company?.id) return;
    
    setLoading(true);
    try {
      // Get latest calculation log
      const { data: calculationLogs } = await supabase
        .from('calculation_logs')
        .select('created_at, log_message')
        .eq('company_id', company.id)
        .eq('log_type', 'info')
        .like('log_message', '%Recalculation complete%')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (calculationLogs && calculationLogs.length > 0) {
        setLastCalculation(calculationLogs[0].created_at);
      }
      
      // Get calculation stats - Fixed the groupBy query that was causing the error
      const { data: matchedCount } = await supabase
        .from('emission_entries')
        .select('count')
        .eq('company_id', company.id)
        .eq('match_status', 'matched');
        
      const { data: unmatchedCount } = await supabase
        .from('emission_entries')
        .select('count')
        .eq('company_id', company.id)
        .eq('match_status', 'unmatched');
        
      const matched = matchedCount?.[0]?.count || 0;
      const unmatched = unmatchedCount?.[0]?.count || 0;
      const total = Number(matched) + Number(unmatched);
      
      setCalculationStats({
        matched: Number(matched),
        unmatched: Number(unmatched),
        total
      });
      
      // Run diagnostics
      const { logs, missingCalculations } = await runEmissionDiagnostics(company.id);
      setDiagnostics({ logs, missingCalculations });
    } catch (error) {
      console.error("Error checking calculation status:", error);
      toast.error("Failed to check calculation status");
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async () => {
    if (!company?.id) return;
    
    setRecalculating(true);
    try {
      await recalculateCompanyEmissions(company.id);
      await checkCalculationStatus();
    } catch (error) {
      console.error("Error recalculating emissions:", error);
    } finally {
      setRecalculating(false);
    }
  };

  if (!company?.id) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Emission Calculation Status</CardTitle>
            <CardDescription>
              Check your emission calculation coverage and recalculate if needed
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={checkCalculationStatus}
              disabled={loading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Check Status
            </Button>
            <Button 
              onClick={handleRecalculate}
              disabled={recalculating}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${recalculating ? 'animate-spin' : ''}`} />
              Recalculate Emissions
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-md">
              <div className="text-sm text-gray-500 mb-1">Total Entries</div>
              <div className="text-2xl font-bold">{calculationStats.total}</div>
            </div>
            <div className="p-4 bg-green-50 rounded-md">
              <div className="text-sm text-gray-500 mb-1">Matched</div>
              <div className="text-2xl font-bold text-green-700">{calculationStats.matched}</div>
            </div>
            <div className="p-4 bg-amber-50 rounded-md">
              <div className="text-sm text-gray-500 mb-1">Unmatched</div>
              <div className="text-2xl font-bold text-amber-700">{calculationStats.unmatched}</div>
            </div>
          </div>

          {lastCalculation && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Last calculation:</span>
              <Badge variant="outline">
                {new Date(lastCalculation).toLocaleString()}
              </Badge>
            </div>
          )}

          {diagnostics.logs.length > 0 ? (
            <Alert variant="warning" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Emission Calculation Issues</AlertTitle>
              <AlertDescription>
                <div className="mt-2 space-y-2">
                  <p>Found {diagnostics.missingCalculations} entries without matching emission factors:</p>
                  <ul className="list-disc list-inside max-h-40 overflow-y-auto">
                    {diagnostics.logs.slice(0, 5).map((log, index) => (
                      <li key={index}>{log.log_message}</li>
                    ))}
                    {diagnostics.logs.length > 5 && (
                      <li className="text-gray-500">...and {diagnostics.logs.length - 5} more</li>
                    )}
                  </ul>
                </div>
                <div className="mt-4">
                  <p className="text-sm">
                    <strong>Troubleshooting:</strong> Check that category names, units, and scope values match between your emissions data and DEFRA emission factors.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          ) : diagnostics.logs.length === 0 && !loading ? (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-800">
                All emissions have appropriate emission factors available.
              </AlertDescription>
            </Alert>
          ) : null}
          
          {loading && (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">Checking calculation status...</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
