
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ArrowDown, ArrowUp, Fire, BarChart2, TrendingUp, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ChartContainer } from '@/components/ui/chart';
import { useEmissionsCalculations } from '@/hooks/useEmissionsCalculations';
import { useCompany } from '@/contexts/CompanyContext';
import { CalculationStatus } from './CalculationStatus';

const COLORS = ['#0E5D40', '#6ED0AA', '#AAE3CA', '#D6F3E7'];

export const EmissionsOverviewDashboard = () => {
  const { company } = useCompany();
  const { calculatedEmissions, calculationLogs, isLoading, calculateEmissions, fetchCalculatedEmissions } = 
    useEmissionsCalculations(company?.id || '');
  const [scopeData, setScopeData] = useState<{ name: string; value: number }[]>([]);
  const [monthlyData, setMonthlyData] = useState<{ name: string; emissions: number }[]>([]);
  const [totalEmissions, setTotalEmissions] = useState(0);
  const [changePercentage, setChangePercentage] = useState(0);
  const [isIncreasing, setIsIncreasing] = useState(false);
  const [topCategory, setTopCategory] = useState('');

  // Fetch emissions data on component mount
  useEffect(() => {
    if (company?.id) {
      fetchCalculatedEmissions();
    }
  }, [company?.id]);

  // Process the emissions data
  useEffect(() => {
    if (calculatedEmissions.length > 0) {
      // Group by scope (currently we only have scope 1)
      const scope1Total = calculatedEmissions.reduce((sum, emission) => sum + (emission.emissions_co2e || 0), 0);
      
      // Create scope data for pie chart
      const newScopeData = [
        { name: 'Scope 1', value: scope1Total },
        { name: 'Scope 2', value: 0 }, // Placeholder for now
        { name: 'Scope 3', value: 0 }  // Placeholder for now
      ];
      
      // Group emissions by month for the bar chart
      const emissionsByMonth: Record<string, number> = {};
      calculatedEmissions.forEach(emission => {
        if (emission.date) {
          const month = emission.date.substring(0, 7); // Format: YYYY-MM
          emissionsByMonth[month] = (emissionsByMonth[month] || 0) + (emission.emissions_co2e || 0);
        }
      });
      
      const sortedMonths = Object.keys(emissionsByMonth).sort();
      const newMonthlyData = sortedMonths.map(month => ({
        name: format(new Date(month + '-01'), 'MMM yyyy'),
        emissions: parseFloat(emissionsByMonth[month].toFixed(2))
      }));
      
      // Group by source to find top category
      const sourceEmissions: Record<string, number> = {};
      calculatedEmissions.forEach(emission => {
        if (emission.source) {
          sourceEmissions[emission.source] = (sourceEmissions[emission.source] || 0) + (emission.emissions_co2e || 0);
        }
      });
      
      let maxEmissions = 0;
      let maxSource = '';
      Object.entries(sourceEmissions).forEach(([source, amount]) => {
        if (amount > maxEmissions) {
          maxEmissions = amount;
          maxSource = source;
        }
      });
      
      // Calculate total emissions
      const total = calculatedEmissions.reduce((sum, emission) => sum + (emission.emissions_co2e || 0), 0);
      
      // Calculate percentage change (placeholder - in reality would compare with previous period)
      const previousTotal = total * 0.9; // Assuming 10% increase for demo purposes
      const change = ((total - previousTotal) / previousTotal) * 100;
      
      setScopeData(newScopeData);
      setMonthlyData(newMonthlyData);
      setTotalEmissions(total);
      setChangePercentage(Math.abs(change));
      setIsIncreasing(change > 0);
      setTopCategory(maxSource);
    }
  }, [calculatedEmissions]);

  const handleRecalculate = async () => {
    await calculateEmissions();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Summary Cards */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Emissions</CardTitle>
            <CardDescription>Year to date (tonnes CO₂e)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Fire className="mr-2 h-4 w-4 text-orange-500" />
              <span className="text-2xl font-bold">{totalEmissions.toFixed(2)}</span>
              <div className="ml-auto flex items-center">
                {isIncreasing ? (
                  <div className="text-red-500 flex items-center">
                    <ArrowUp className="mr-1 h-4 w-4" />
                    {changePercentage.toFixed(1)}%
                  </div>
                ) : (
                  <div className="text-green-500 flex items-center">
                    <ArrowDown className="mr-1 h-4 w-4" />
                    {changePercentage.toFixed(1)}%
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Top Emitting Category</CardTitle>
            <CardDescription>Highest CO₂e contributor</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <BarChart2 className="mr-2 h-4 w-4 text-circa-green" />
              <span className="text-xl font-bold capitalize">{topCategory || 'N/A'}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Top Emitting Scope</CardTitle>
            <CardDescription>Highest CO₂e source</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <TrendingUp className="mr-2 h-4 w-4 text-circa-green" />
              <span className="text-xl font-bold">Scope 1</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Last Calculation</CardTitle>
            <CardDescription>Emissions data status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4 text-circa-green" />
              <span className="text-xl font-bold">
                {calculatedEmissions.length > 0 
                  ? format(new Date(), 'dd MMM yyyy') 
                  : 'No data'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Charts */}
        <Card>
          <CardHeader>
            <CardTitle>Emissions by Scope</CardTitle>
            <CardDescription>Distribution of emissions across scopes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ChartContainer config={{ "Scope 1": { color: COLORS[0] }, "Scope 2": { color: COLORS[1] }, "Scope 3": { color: COLORS[2] } }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={scopeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {scopeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value) => [`${value.toFixed(2)} tonnes CO₂e`, 'Emissions']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Emissions Trend</CardTitle>
            <CardDescription>Emissions over time (tonnes CO₂e)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ChartContainer config={{ "emissions": { color: "#0E5D40" } }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip formatter={(value) => [`${value} tonnes CO₂e`, 'Emissions']} />
                    <Bar dataKey="emissions" fill="#0E5D40" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <CalculationStatus 
        logs={calculationLogs}
        onRecalculate={handleRecalculate}
        isLoading={isLoading}
      />
    </div>
  );
};
