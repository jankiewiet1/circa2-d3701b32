
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/contexts/CompanyContext';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

interface FactorStatus {
  fuelType: string;
  unit: string;
  hasDefra: boolean;
  hasEpa: boolean;
  hasIpcc: boolean;
  hasGhg: boolean;
  hasAdeme: boolean;
  latestYear?: number;
}

export const EmissionFactorStatus = () => {
  const { company } = useCompany();
  const [factorStatus, setFactorStatus] = useState<FactorStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [preferredSource, setPreferredSource] = useState('DEFRA');
  const [debugInfo, setDebugInfo] = useState<any[]>([]);

  useEffect(() => {
    const fetchFactorStatus = async () => {
      if (!company?.id) return;
      
      setLoading(true);
      
      try {
        const { data: preferences } = await supabase
          .from('company_preferences')
          .select('preferred_emission_source')
          .eq('company_id', company.id)
          .maybeSingle();
          
        if (preferences?.preferred_emission_source) {
          setPreferredSource(preferences.preferred_emission_source);
        }
        
        const { data: emissionsData, error: emissionsError } = await supabase
          .from('scope1_emissions')
          .select('fuel_type, unit')
          .eq('company_id', company.id);
          
        if (emissionsError) throw emissionsError;
        
        if (emissionsData) {
          const uniqueCombinations = emissionsData.filter((value, index, self) =>
            index === self.findIndex((t) => (
              t.fuel_type?.toLowerCase().trim() === value.fuel_type?.toLowerCase().trim() && 
              t.unit?.toLowerCase().trim() === value.unit?.toLowerCase().trim()
            ))
          );
          
          const { data: factorsData, error: factorsError } = await supabase
            .from('emission_factors')
            .select('fuel_type, unit, source, year');
            
          if (factorsError) throw factorsError;
          
          const statuses = uniqueCombinations.map(combination => {
            const fuelFactors = factorsData?.filter(factor => 
              factor.fuel_type?.toLowerCase().trim() === combination.fuel_type?.toLowerCase().trim() && 
              factor.unit?.toLowerCase().trim() === combination.unit?.toLowerCase().trim()
            ) || [];

            return {
              fuelType: combination.fuel_type || '',
              unit: combination.unit || '',
              hasDefra: fuelFactors.some(factor => factor.source === 'DEFRA'),
              hasEpa: fuelFactors.some(factor => factor.source === 'EPA'),
              hasIpcc: fuelFactors.some(factor => factor.source === 'IPCC'),
              hasGhg: fuelFactors.some(factor => factor.source === 'GHG Protocol Default'),
              hasAdeme: fuelFactors.some(factor => factor.source === 'ADEME'),
              latestYear: fuelFactors
                .filter(f => f.source === preferences?.preferred_emission_source)
                .reduce((max, f) => Math.max(max, f.year || 0), 0) || undefined
            };
          });
          
          setFactorStatus(statuses);
          setDebugInfo(factorsData || []);
        }
      } catch (error) {
        console.error('Error fetching emission factor status:', error);
        toast.error('Failed to load emission factor status');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFactorStatus();
  }, [company?.id]);

  const runDiagnostics = async () => {
    if (!company?.id) return;
    
    setLoading(true);
    try {
      const { data: logsData } = await supabase
        .from('calculation_logs')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (logsData && logsData.length > 0) {
        const warningLogs = logsData.filter(log => log.log_type === 'warning');
        const infoLogs = logsData.filter(log => log.log_type === 'info');
        
        if (warningLogs.length > 0) {
          toast.warning(warningLogs[0].log_message, { duration: 5000 });
        }
        
        if (infoLogs.length > 0) {
          toast.info(infoLogs[0].log_message, { duration: 5000 });
        }
      } else {
        toast.success('No calculation issues found');
      }
    } catch (error) {
      console.error('Error running diagnostics:', error);
      toast.error('Failed to run emission factor diagnostics');
    } finally {
      setLoading(false);
    }
  };
  
  const getStatusBadge = (hasSource: boolean, source: string) => {
    if (hasSource) {
      return <Badge variant="outline" className="bg-green-100 text-green-800">Available</Badge>;
    }
    
    if (preferredSource === source) {
      return <Badge variant="outline" className="bg-red-100 text-red-800">Missing</Badge>;
    }
    
    return <Badge variant="outline" className="bg-gray-100 text-gray-500">N/A</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Emission Factor Status</CardTitle>
            <CardDescription>
              Availability of emission factors for your fuel types and units
            </CardDescription>
          </div>
          {factorStatus.length > 0 && (
            <Button variant="outline" size="sm" onClick={runDiagnostics} disabled={loading}>
              <Info className="mr-2 h-4 w-4" />
              Run Diagnostics
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">Loading status...</div>
        ) : factorStatus.length > 0 ? (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 px-4">Fuel Type</th>
                    <th className="py-2 px-4">Unit</th>
                    <th className="py-2 px-4">DEFRA</th>
                    <th className="py-2 px-4">EPA</th>
                    <th className="py-2 px-4">IPCC</th>
                    <th className="py-2 px-4">GHG Protocol</th>
                    <th className="py-2 px-4">ADEME</th>
                    <th className="py-2 px-4">Year</th>
                  </tr>
                </thead>
                <tbody>
                  {factorStatus.map((status, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                      <td className="py-2 px-4">{status.fuelType}</td>
                      <td className="py-2 px-4">{status.unit}</td>
                      <td className="py-2 px-4">{getStatusBadge(status.hasDefra, 'DEFRA')}</td>
                      <td className="py-2 px-4">{getStatusBadge(status.hasEpa, 'EPA')}</td>
                      <td className="py-2 px-4">{getStatusBadge(status.hasIpcc, 'IPCC')}</td>
                      <td className="py-2 px-4">{getStatusBadge(status.hasGhg, 'GHG Protocol Default')}</td>
                      <td className="py-2 px-4">{getStatusBadge(status.hasAdeme, 'ADEME')}</td>
                      <td className="py-2 px-4">{status.latestYear || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {factorStatus.some(status => !status[`has${preferredSource.replace(' ', '')}`]) && (
              <Alert variant="warning">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Missing Emission Factors</AlertTitle>
                <AlertDescription>
                  Some of your emissions data may not be calculated correctly because of missing emission factors for your preferred source ({preferredSource}).
                  Consider changing your preferred emission source or adding the missing factors.
                </AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <div className="text-center py-4">No emission data available</div>
        )}
        
        <div className="mt-6 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 mr-1 text-yellow-600" />
              <span className="text-sm">Preferred source: {preferredSource}</span>
            </div>
          </div>
          <Button asChild>
            <Link to="/settings">Manage Emission Factors</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
