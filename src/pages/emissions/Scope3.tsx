import React, { useMemo } from 'react';
import { MainLayout } from "@/components/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Truck, Upload, Plus, Info, Download, RefreshCw, AlertCircle, Flame } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { useCompany } from "@/contexts/CompanyContext";
import { useScopeEntries, EmissionEntryWithCalculation } from "@/hooks/useScopeEntries";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';

// Helper to safely get the calculated total emissions (copied)
const getCalculatedEmissions = (entry: EmissionEntryWithCalculation): number => {
  if (entry.emission_calculations && entry.emission_calculations.length > 0) {
    return entry.emission_calculations[0]?.total_emissions ?? 0;
  }
  return 0;
};

export default function Scope3() {
  const { userRole } = useCompany();
  const canEdit = userRole === "admin" || userRole === "editor";
  
  // Fetch Scope 3 entries
  const { entries, loading, error, refetch } = useScopeEntries(3);

  // Calculate metrics using useMemo
  const scope3Data = useMemo(() => {
    if (loading || !entries || entries.length === 0) {
      return { totalEmissions: 0, categoryData: [], upstreamTotal: 0, downstreamTotal: 0 };
    }

    let totalEmissions = 0;
    // TODO: Add logic to classify categories as Upstream/Downstream
    let upstreamTotal = 0; 
    let downstreamTotal = 0;
    const emissionsByCategory: Record<string, number> = {};

    entries.forEach(entry => {
      const emissions = getCalculatedEmissions(entry);
      totalEmissions += emissions;
      const category = entry.category || 'Unknown';
      emissionsByCategory[category] = (emissionsByCategory[category] || 0) + emissions;

      // Placeholder: Classify based on category name (NEEDS PROPER MAPPING)
      // This is a very basic example and needs refinement based on actual categories used
      if (['Purchased Goods', 'Business Travel', 'Employee Commuting', 'Waste', 'Transportation'].includes(category)) {
         upstreamTotal += emissions;
      } else if (['Use of Products'].includes(category)) {
         downstreamTotal += emissions;
      } else {
         // Assume upstream for others for now?
         // upstreamTotal += emissions; 
      }
    });

    // Format category data for chart
    const categoryData = Object.entries(emissionsByCategory)
      .map(([category, value]) => ({
        category: category,
        value: parseFloat(value.toFixed(2))
      }))
      .sort((a, b) => b.value - a.value);

    return {
      totalEmissions: parseFloat(totalEmissions.toFixed(2)),
      categoryData,
      upstreamTotal: parseFloat(totalEmissions.toFixed(2)), 
      downstreamTotal: 0
    };

  }, [entries, loading]);

  // Export Function (similar to Scope1Detail)
  const exportToCSV = () => {
    if (!entries || entries.length === 0) return;

    const headers = ['Date', 'Category', 'Description', 'Quantity', 'Unit', 'Total Emissions (tCO₂e)', 'Match Status', 'Notes'];
    // Correctly map entries to CSV rows
    const rows = entries.map(e => {
      const calcEmissions = getCalculatedEmissions(e);
      // Return an array of values for each row
      return [
        `"${e.date}"`, 
        `"${e.category}"`, 
        `"${e.description || ''}"`, 
        e.quantity,
        `"${e.unit}"`, 
        calcEmissions.toFixed(4),
        `"${e.match_status || 'N/A'}"`, 
        `"${e.notes || ''}"` 
      ].join(','); // Join the array elements into a comma-separated string for this row
    });

    // Join header and rows with newline characters
    const csvContent = [
      headers.join(','), // Header row
      ...rows // Spread the generated row strings
    ].join('\n');

    // Create and trigger download link (same as before)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    // Use specific download name based on component
    link.setAttribute('download', `scope3_emissions_detail_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <MainLayout>
       <div className="max-w-7xl mx-auto p-4 md:p-0">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Truck className="mr-3 h-7 w-7 text-purple-500" />
              Scope 3 Emissions
            </h1>
            <p className="text-muted-foreground mt-1">
              Indirect emissions from the value chain (excluding Scope 2)
            </p>
          </div>
          
          <div className="flex gap-2 flex-wrap">
             <Button variant="outline" onClick={refetch} disabled={loading}>
               <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
               Refresh
             </Button>
          {canEdit && (
              <>
                <Button variant="outline" disabled>
                <Upload className="mr-2 h-4 w-4" />
                Import Data
              </Button>
                <Button className="bg-circa-green hover:bg-circa-green-dark" disabled>
                <Plus className="mr-2 h-4 w-4" />
                Add Entry
                </Button>
              </>
            )}
             <Button variant="outline" onClick={exportToCSV} disabled={loading || !entries || entries.length === 0}>
               <Download className="mr-2 h-4 w-4" />
               Export Detail
              </Button>
            </div>
        </div>
        
        {error && (
           <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Loading Scope 3 Data</AlertTitle>
              <AlertDescription>
                 {error || "An unexpected error occurred."}
                 <Button variant="secondary" size="sm" onClick={refetch} className="ml-4"> Try Again </Button>
              </AlertDescription>
           </Alert>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Emissions</CardTitle>
               <Flame className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
               {loading ? <Skeleton className="h-8 w-3/4" /> : (
              <div className="flex items-end space-x-1">
                     <span className="text-3xl font-bold">{scope3Data.totalEmissions.toLocaleString()}</span>
                     <span className="text-muted-foreground mb-1 text-sm">tCO₂e</span>
              </div>
               )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Upstream (Total)</CardTitle>
               <Info className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
               {loading ? <Skeleton className="h-8 w-3/4" /> : (
              <div className="flex items-end space-x-1">
                     <span className="text-3xl font-bold">{scope3Data.upstreamTotal.toLocaleString()}</span>
                     <span className="text-muted-foreground mb-1 text-sm">tCO₂e</span>
              </div>
               )}
            </CardContent>
          </Card>
          
          <Card>
             <CardHeader className="pb-2 flex flex-row items-center justify-between">
               <CardTitle className="text-sm font-medium text-muted-foreground">Downstream (Total)</CardTitle>
                <Info className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {loading ? <Skeleton className="h-8 w-3/4" /> : (
              <div className="flex items-end space-x-1">
                       <span className="text-3xl font-bold">{scope3Data.downstreamTotal.toLocaleString()}</span>
                       <span className="text-muted-foreground mb-1 text-sm">tCO₂e</span>
              </div>
                 )}
            </CardContent>
          </Card>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Emissions by Category</CardTitle>
            <CardDescription>Scope 3 emissions by category (tCO₂e)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
             {loading ? <Skeleton className="h-full w-full rounded-lg" /> : scope3Data.categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={scope3Data.categoryData} layout="vertical" margin={{ top: 5, right: 30, left: 150, bottom: 5 }}>
                   <CartesianGrid strokeDasharray="3 3" />
                   <XAxis type="number"/>
                   <YAxis type="category" dataKey="category" width={140} interval={0} />
                   <Tooltip formatter={(value: number) => [`${value.toFixed(2)} tCO₂e`, "Emissions"]} />
                  <Bar dataKey="value" name="Scope 3 Emissions" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
              ) : (
                 <div className="flex items-center justify-center h-full text-muted-foreground">No category data available.</div>
              )}
            </div>
          </CardContent>
        </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Detailed Emission Entries</CardTitle>
              <CardDescription>All Scope 3 emission entries recorded.</CardDescription>
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
                 <div className="flex items-center justify-center h-24 text-muted-foreground">No detailed entries available for Scope 3.</div>
              )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                 <CardTitle>Scope 3 Categories Information</CardTitle>
                 <CardDescription>GHG Protocol Scope 3 Categories</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="upstream">
               <TabsList className="flex flex-wrap h-auto justify-start">
                <TabsTrigger value="upstream">Upstream Categories</TabsTrigger>
                <TabsTrigger value="downstream">Downstream Categories</TabsTrigger>
              </TabsList>
              
               <TabsContent value="upstream" className="mt-6 text-sm">
                <div className="space-y-4">
                  <p>
                     <strong>Upstream Scope 3 emissions</strong> include indirect emissions occurring in the value chain prior to the company's operations:
                  </p>
                   <ul className="list-disc pl-6 space-y-1 columns-1 md:columns-2">
                     <li><strong>Category 1:</strong> Purchased goods and services</li>
                    <li><strong>Category 2:</strong> Capital goods</li>
                    <li><strong>Category 3:</strong> Fuel and energy-related activities</li>
                     <li><strong>Category 4:</strong> Upstream transportation and distribution</li>
                     <li><strong>Category 5:</strong> Waste generated in operations</li>
                     <li><strong>Category 6:</strong> Business travel</li>
                     <li><strong>Category 7:</strong> Employee commuting</li>
                    <li><strong>Category 8:</strong> Upstream leased assets</li>
                  </ul>
                   <p className="text-muted-foreground mt-4">
                     Data sources include supplier information, travel records, waste reports, and employee surveys.
                  </p>
                </div>
              </TabsContent>
              
               <TabsContent value="downstream" className="mt-6 text-sm">
                <div className="space-y-4">
                  <p>
                     <strong>Downstream Scope 3 emissions</strong> include indirect emissions occurring in the value chain after the company's operations:
                  </p>
                   <ul className="list-disc pl-6 space-y-1 columns-1 md:columns-2">
                    <li><strong>Category 9:</strong> Downstream transportation and distribution</li>
                    <li><strong>Category 10:</strong> Processing of sold products</li>
                     <li><strong>Category 11:</strong> Use of sold products</li>
                    <li><strong>Category 12:</strong> End-of-life treatment of sold products</li>
                    <li><strong>Category 13:</strong> Downstream leased assets</li>
                    <li><strong>Category 14:</strong> Franchises</li>
                    <li><strong>Category 15:</strong> Investments</li>
                  </ul>
                   <p className="text-muted-foreground mt-4">
                     Data sources include customer data, product lifecycle information, and investment details.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
