
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import { useScope1Emissions } from '@/hooks/useScope1Emissions';
import { useCompany } from '@/contexts/CompanyContext';
import { Button } from "@/components/ui/button";
import { Download } from 'lucide-react';

const COLORS = ['#0E5D40', '#6ED0AA', '#AAE3CA', '#D6F3E7', '#1E6F50', '#2E8060', '#3E9170'];

export const Scope1Detail = () => {
  const { company } = useCompany();
  const { emissions, isLoading, fetchEmissions } = useScope1Emissions(company?.id || '');
  const [fuelTypeData, setFuelTypeData] = useState<any[]>([]);
  const [sourceData, setSourceData] = useState<any[]>([]);

  // Process emissions data for charts
  useEffect(() => {
    if (emissions.length > 0) {
      // Group by fuel type
      const fuelTypeEmissions: Record<string, number> = {};
      emissions.forEach(emission => {
        if (emission.fuel_type && emission.emissions_co2e) {
          fuelTypeEmissions[emission.fuel_type] = (fuelTypeEmissions[emission.fuel_type] || 0) + 
            (emission.emissions_co2e || 0);
        }
      });
      
      const fuelTypeChartData = Object.entries(fuelTypeEmissions).map(([type, value]) => ({
        name: type,
        value: parseFloat(value.toFixed(2))
      }));
      
      // Group by source
      const sourceEmissions: Record<string, number> = {};
      emissions.forEach(emission => {
        if (emission.source && emission.emissions_co2e) {
          sourceEmissions[emission.source] = (sourceEmissions[emission.source] || 0) + 
            (emission.emissions_co2e || 0);
        }
      });
      
      const sourceChartData = Object.entries(sourceEmissions)
        .map(([source, value]) => ({
          name: source,
          emissions: parseFloat(value.toFixed(2))
        }))
        .sort((a, b) => b.emissions - a.emissions);
      
      setFuelTypeData(fuelTypeChartData);
      setSourceData(sourceChartData);
    }
  }, [emissions]);

  // Fetch emissions data on component mount
  useEffect(() => {
    if (company?.id) {
      fetchEmissions();
    }
  }, [company?.id]);

  // Export data to CSV
  const exportToCSV = () => {
    if (emissions.length === 0) return;
    
    const headers = ['Date', 'Source', 'Fuel Type', 'Amount', 'Unit', 'Emissions (tCO₂e)'];
    const csvContent = [
      headers.join(','),
      ...emissions.map(e => [
        e.date,
        e.source,
        e.fuel_type,
        e.amount,
        e.unit,
        e.emissions_co2e || 0
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `scope1_emissions_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Scope 1 Emissions Detail</h2>
        <Button variant="outline" onClick={exportToCSV}>
          <Download className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Emissions by Fuel Type</CardTitle>
            <CardDescription>Distribution across different fuel types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <p>Loading data...</p>
                </div>
              ) : fuelTypeData.length > 0 ? (
                <ChartContainer config={{}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={fuelTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {fuelTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value) => [`${value} tonnes CO₂e`, 'Emissions']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p>No emissions data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Emissions by Source</CardTitle>
            <CardDescription>CO₂e by facility or asset</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <p>Loading data...</p>
                </div>
              ) : sourceData.length > 0 ? (
                <ChartContainer config={{ "emissions": { color: "#0E5D40" } }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={sourceData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis 
                        dataKey="name" 
                        type="category"
                        width={120}
                        tick={{ fontSize: 12 }}
                      />
                      <RechartsTooltip formatter={(value) => [`${value} tonnes CO₂e`, 'Emissions']} />
                      <Bar dataKey="emissions" fill="#0E5D40" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p>No emissions data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
