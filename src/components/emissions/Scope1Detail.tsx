import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import { useScopeEntries, EmissionEntryWithCalculation } from '@/hooks/useScopeEntries';
import { useCompany } from '@/contexts/CompanyContext';
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';

const COLORS = ['#0E5D40', '#6ED0AA', '#AAE3CA', '#D6F3E7', '#1E6F50', '#2E8060', '#3E9170'];

const getCalculatedEmissions = (entry: EmissionEntryWithCalculation): number => {
  if (entry.emission_calculations && entry.emission_calculations.length > 0) {
    return entry.emission_calculations[0]?.total_emissions ?? 0;
  }
  return 0;
};

export const Scope1Detail = () => {
  const { company } = useCompany();
  const { entries, loading, error, refetch } = useScopeEntries(1);

  const categoryData = useMemo(() => {
    if (loading || !entries || entries.length === 0) return [];
    
      const categoryEmissions: Record<string, number> = {};
    entries.forEach(entry => {
      const cat = entry.category || 'Unknown';
      const emissions = getCalculatedEmissions(entry);
      categoryEmissions[cat] = (categoryEmissions[cat] || 0) + emissions;
      });

    return Object.entries(categoryEmissions)
        .map(([category, value]) => ({
          name: category,
          emissions: parseFloat(value.toFixed(2))
        }))
        .sort((a, b) => b.emissions - a.emissions);

  }, [entries, loading]);

  const fuelTypeData = useMemo(() => {
     if (loading || !entries || entries.length === 0) return [];
    
    const fuelTypeEmissions: Record<string, number> = {};
    entries.forEach(entry => {
      const type = entry.category || 'Unknown';
      const emissions = getCalculatedEmissions(entry);
      fuelTypeEmissions[type] = (fuelTypeEmissions[type] || 0) + emissions;
    });

    return Object.entries(fuelTypeEmissions).map(([type, value]) => ({
      name: type,
      value: parseFloat(value.toFixed(2))
    }));
    
  }, [entries, loading]);

  const exportToCSV = () => {
    if (!entries || entries.length === 0) return;

    const headers = ['Date', 'Category', 'Description', 'Quantity', 'Unit', 'Total Emissions (tCO₂e)', 'Match Status', 'Notes'];
    const rows = entries.map(e => {
      const calcEmissions = getCalculatedEmissions(e);
      return [
        `"${e.date}"`, 
        `"${e.category}"`, 
        `"${e.description || ''}"`, 
        e.quantity,
        `"${e.unit}"`, 
        calcEmissions.toFixed(4),
        `"${e.match_status || 'N/A'}"`, 
        `"${e.notes || ''}"` 
      ].join(',');
    });

    const csvContent = [
      headers.join(','),
      ...rows
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `scope1_emissions_detail_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (error) {
     return (
      <Alert variant="destructive" className="mt-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Loading Scope 1 Details</AlertTitle>
        <AlertDescription>
          {error || "An unexpected error occurred."}
          <Button variant="secondary" size="sm" onClick={refetch} className="ml-4">
            Try Again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, ...payload }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const dataName = payload.name;

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${dataName}: ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-2xl font-semibold">Scope 1 Detail</h2>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={refetch} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportToCSV} disabled={loading || !entries || entries.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Emissions by Category</CardTitle>
            <CardDescription>Total tCO₂e per category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {loading ? (
                 <Skeleton className="h-full w-full rounded-lg" />
              ) : categoryData.length > 0 ? (
                <ChartContainer config={{}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="emissions"
                      >
                        {categoryData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                      </Pie>
                      <RechartsTooltip formatter={(value: number) => [`${value.toFixed(2)} tCO₂e`, 'Emissions']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">No category data available</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Emissions by Fuel Type (using category)</CardTitle>
            <CardDescription>Total tCO₂e per category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {loading ? (
                 <Skeleton className="h-full w-full rounded-lg" />
              ) : fuelTypeData.length > 0 ? (
                <ChartContainer config={{}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={fuelTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {fuelTypeData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                      </Pie>
                      <RechartsTooltip formatter={(value: number) => [`${value.toFixed(2)} tCO₂e`, 'Emissions']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                 <div className="flex items-center justify-center h-full text-muted-foreground">No fuel type data available</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Emission Entries</CardTitle>
          <CardDescription>All Scope 1 emission entries recorded.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
             <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
             </div>
          ) : entries.length > 0 ? (
            <div className="overflow-x-auto">
              <Table className="min-w-full"> 
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead className="text-right">Total Emissions (tCO₂e)</TableHead>
                    <TableHead>Match Status</TableHead>
                     <TableHead>Notes</TableHead> 
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{format(new Date(entry.date), 'yyyy-MM-dd')}</TableCell>
                      <TableCell>{entry.category}</TableCell>
                      <TableCell className="max-w-xs truncate" title={entry.description || ''}>{entry.description}</TableCell>
                      <TableCell className="text-right">{entry.quantity}</TableCell>
                      <TableCell>{entry.unit}</TableCell>
                      <TableCell className="text-right font-medium">{getCalculatedEmissions(entry).toFixed(4)}</TableCell>
                      <TableCell>{entry.match_status || 'N/A'}</TableCell>
                       <TableCell className="max-w-xs truncate" title={entry.notes || ''}>{entry.notes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
             <div className="flex items-center justify-center h-24 text-muted-foreground">No detailed entries available for Scope 1.</div>
          )}
        </CardContent>
      </Card>

    </div>
  );
};
