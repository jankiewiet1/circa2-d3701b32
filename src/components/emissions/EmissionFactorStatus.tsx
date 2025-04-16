
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/contexts/CompanyContext';

interface FactorStatus {
  fuelType: string;
  unit: string;
  hasDefra: boolean;
  hasEpa: boolean;
  hasIpcc: boolean;
  hasGhg: boolean;
  hasAdeme: boolean;
}

export const EmissionFactorStatus = () => {
  const { company } = useCompany();
  const [factorStatus, setFactorStatus] = useState<FactorStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [preferredSource, setPreferredSource] = useState('DEFRA');

  useEffect(() => {
    const fetchFactorStatus = async () => {
      if (!company?.id) return;
      
      setLoading(true);
      
      try {
        // Get company preference
        const { data: preferences } = await supabase
          .from('company_preferences')
          .select('preferred_emission_source')
          .eq('company_id', company.id)
          .single();
          
        if (preferences?.preferred_emission_source) {
          setPreferredSource(preferences.preferred_emission_source);
        }
        
        // Get distinct fuel types and units from scope1_emissions
        const { data: emissionsData, error: emissionsError } = await supabase
          .from('scope1_emissions')
          .select('fuel_type, unit')
          .eq('company_id', company.id)
          .order('fuel_type', { ascending: true });
          
        if (emissionsError) throw emissionsError;
        
        if (emissionsData) {
          // Remove duplicates
          const uniqueCombinations = emissionsData.filter((value, index, self) =>
            index === self.findIndex((t) => (
              t.fuel_type === value.fuel_type && t.unit === value.unit
            ))
          );
          
          // Get emission factors
          const { data: factorsData, error: factorsError } = await supabase
            .from('emission_factors')
            .select('fuel_type, unit, source')
            .order('fuel_type', { ascending: true });
            
          if (factorsError) throw factorsError;
          
          // Process statuses
          const statuses = uniqueCombinations.map(combination => {
            const fuelFactors = factorsData?.filter(factor => 
              factor.fuel_type === combination.fuel_type && 
              factor.unit === combination.unit
            ) || [];
            
            return {
              fuelType: combination.fuel_type || '',
              unit: combination.unit || '',
              hasDefra: fuelFactors.some(factor => factor.source === 'DEFRA'),
              hasEpa: fuelFactors.some(factor => factor.source === 'EPA'),
              hasIpcc: fuelFactors.some(factor => factor.source === 'IPCC'),
              hasGhg: fuelFactors.some(factor => factor.source === 'GHG Protocol Default'),
              hasAdeme: fuelFactors.some(factor => factor.source === 'ADEME')
            };
          });
          
          setFactorStatus(statuses);
        }
      } catch (error) {
        console.error('Error fetching emission factor status:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFactorStatus();
  }, [company?.id]);
  
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
        <CardTitle>Emission Factor Status</CardTitle>
        <CardDescription>
          Availability of emission factors for your fuel types and units
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">Loading status...</div>
        ) : factorStatus.length > 0 ? (
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
                  </tr>
                ))}
              </tbody>
            </table>
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
