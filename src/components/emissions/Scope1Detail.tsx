
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import { useEmissionEntries } from '@/hooks/useScope1Emissions';
import { useCompany } from '@/contexts/CompanyContext';
import { Button } from "@/components/ui/button";
import { Download, RefreshCw } from 'lucide-react';
import { EmissionFactorStatus } from './EmissionFactorStatus';
import { CalculationStatus } from './CalculationStatus';

const COLORS = ['#0E5D40', '#6ED0AA', '#AAE3CA', '#D6F3E7', '#1E6F50', '#2E8060', '#3E9170'];

export const Scope1Detail = () => {
  const { company } = useCompany();
  const { entries: emissions, isLoading, fetchEntries: fetchEmissions } = useEmissionEntries(company?.id || '', 1);
  const [fuelTypeData, setFuelTypeData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [sourceData, setSourceData] = useState<any[]>([]);
  
  useEffect(() => {
    if (emissions.length > 0) {
      // Note: emission object does not have fuel_type nor source, but has category and quantity
      const fuelTypeEmissions: Record<string, number> = {};
      emissions.forEach(emission => {
        const type = emission.category || 'Unknown';
        fuelTypeEmissions[type] = (fuelTypeEmissions[type] || 0) + (emission.emissions || 0);
      });

      const fuelTypeChartData = Object.entries(fuelTypeEmissions).map(([type, value]) => ({
        name: type,
        value: parseFloat(value.toFixed(2))
      }));

      setFuelTypeData(fuelTypeChartData);

      // source field does not exist in EmissionEntryData, so skip source breakdown or consider an alternative if available
      const categoryEmissions: Record<string, number> = {};
      emissions.forEach(emission => {
        const cat = emission.category || 'Unknown';
        categoryEmissions[cat] = (categoryEmissions[cat] || 0) + (emission.emissions || 0);
      });

      const categoryChartData = Object.entries(categoryEmissions)
        .map(([category, value]) => ({
          name: category,
          emissions: parseFloat(value.toFixed(2))
        }))
        .sort((a, b) => b.emissions - a.emissions);

      setCategoryData(categoryChartData);
    }
  }, [emissions]);

  useEffect(() => {
    if (company?.id) {
      fetchEmissions();
    }
  }, [company?.id]);

  const exportToCSV = () => {
    if (emissions.length === 0) return;

    const headers = ['Date', 'Category', 'Quantity', 'Unit', 'Emissions (tCO₂e)', 'Emission Factor'];
    const csvContent = [
      headers.join(','),
      ...emissions.map(e => [
        e.date,
        e.category,
        e.quantity,
        e.unit,
        e.emissions || 0,
        e.emission_factor || ''
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
        <div className="space-x-2">
          <Button variant="outline" onClick={() => fetchEmissions()}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>

      <EmissionFactorStatus />

      <CalculationStatus />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Emissions by Category</CardTitle>
            <CardDescription>Distribution across different categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <p>Loading data...</p>
                </div>
              ) : categoryData.length > 0 ? (
                <ChartContainer config={{}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="emissions"
                      >
                        {categoryData.map((entry, index) => (
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
            <CardTitle>Emissions by Fuel Type (using category as proxy)</CardTitle>
            <CardDescription>Distribution across categories</CardDescription>
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
      </div>
    </div>
  );
};
