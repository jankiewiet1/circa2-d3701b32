import React, { useMemo } from 'react';
import { MainLayout } from "@/components/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wind, Upload, Plus, Info, Download, RefreshCw, AlertCircle, Flame } from "lucide-react";
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

export default function Scope2() {
  const { userRole } = useCompany();
  const canEdit = userRole === "admin" || userRole === "editor";
  
  // Fetch Scope 2 entries
  const { entries, loading, error, refetch } = useScopeEntries(2);

  // Calculate metrics using useMemo
  const scope2Data = useMemo(() => {
    if (loading || !entries || entries.length === 0) {
      return { totalEmissions: 0, monthlyData: [] };
    }

    let totalEmissions = 0;
    const emissionsByMonth: Record<string, number> = {};

    entries.forEach(entry => {
      const emissions = getCalculatedEmissions(entry);
      totalEmissions += emissions;

      // Monthly aggregation
      if (entry.date) {
        const entryDate = new Date(entry.date);
        if (!isNaN(entryDate.getTime())) {
           const month = entry.date.substring(0, 7); // YYYY-MM
           emissionsByMonth[month] = (emissionsByMonth[month] || 0) + emissions;
        }
      }
    });

    // Format monthly data
    const sortedMonths = Object.keys(emissionsByMonth).sort();
    const monthlyData = sortedMonths.map(month => ({
      month: format(new Date(month + '-01T00:00:00'), 'MMM yyyy'),
      value: parseFloat(emissionsByMonth[month].toFixed(2))
    }));

    return {
      totalEmissions: parseFloat(totalEmissions.toFixed(2)),
      monthlyData
    };

  }, [entries, loading]);

  // Export Function (similar to Scope1Detail)
  const exportToCSV = () => {
    if (!entries || entries.length === 0) return;

    const headers = ['Date', 'Category', 'Description', 'Quantity', 'Unit', 'Total Emissions (tCO₂e)', 'Match Status', 'Notes'];
    const rows = entries.map(e => {
      const calcEmissions = getCalculatedEmissions(e);
      return [
        `"${e.date}"`, 
        `"${e.category}"`, 
        // Temporarily simplified description handling
        `"${e.description || ''}"`, 
        e.quantity,
        `"${e.unit}"`, 
        calcEmissions.toFixed(4),
        `"${e.match_status || 'N/A'}"`, 
        // Temporarily simplified notes handling
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
    link.setAttribute('download', `scope2_emissions_detail_${new Date().toISOString().slice(0, 10)}.csv`);
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
              <Wind className="mr-3 h-7 w-7 text-blue-500" />
              Scope 2 Emissions
            </h1>
            <p className="text-muted-foreground mt-1">
              Indirect emissions from purchased electricity, steam, heating and cooling
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
              <AlertTitle>Error Loading Scope 2 Data</AlertTitle>
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
                     <span className="text-3xl font-bold">{scope2Data.totalEmissions.toLocaleString()}</span>
                     <span className="text-muted-foreground mb-1 text-sm">tCO₂e</span>
              </div>
               )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Location-Based (Total)</CardTitle>
               <Info className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-8 w-3/4" /> : (
              <div className="flex items-end space-x-1">
                     <span className="text-3xl font-bold">{scope2Data.totalEmissions.toLocaleString()}</span>
                     <span className="text-muted-foreground mb-1 text-sm">tCO₂e</span>
              </div>
               )}
            </CardContent>
          </Card>
          
          <Card>
             <CardHeader className="pb-2 flex flex-row items-center justify-between">
               <CardTitle className="text-sm font-medium text-muted-foreground">Market-Based (Total)</CardTitle>
                <Info className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
               {loading ? <Skeleton className="h-8 w-3/4" /> : (
              <div className="flex items-end space-x-1">
                      <span className="text-3xl font-bold">{scope2Data.totalEmissions.toLocaleString()}</span> 
                      <span className="text-muted-foreground mb-1 text-sm">tCO₂e</span>
              </div>
                )}
            </CardContent>
          </Card>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Monthly Emissions</CardTitle>
            <CardDescription>Scope 2 emissions over time (tCO₂e)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
            {loading ? <Skeleton className="h-full w-full rounded-lg" /> : scope2Data.monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scope2Data.monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis width={60}/>
                  <Tooltip formatter={(value: number) => [`${value.toFixed(2)} tCO₂e`, "Emissions"]} />
                  <Bar dataKey="value" name="Scope 2 Emissions" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
             ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">No monthly data available.</div>
             )}
            </div>
          </CardContent>
        </Card>

         <Card className="mb-6">
           <CardHeader>
             <CardTitle>Detailed Emission Entries</CardTitle>
             <CardDescription>All Scope 2 emission entries recorded.</CardDescription>
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
                <div className="flex items-center justify-center h-24 text-muted-foreground">No detailed entries available for Scope 2.</div>
             )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Emission Sources Information</CardTitle>
                <CardDescription>Learn more about scope 2 emission sources</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="electricity">
              <TabsList>
                <TabsTrigger value="electricity">Electricity</TabsTrigger>
                <TabsTrigger value="steam">Steam</TabsTrigger>
                <TabsTrigger value="heating">Heating</TabsTrigger>
                <TabsTrigger value="cooling">Cooling</TabsTrigger>
              </TabsList>
              
              <TabsContent value="electricity" className="mt-6 text-sm">
                <div className="space-y-4">
                  <p>
                    <strong>Electricity consumption</strong> typically accounts for the majority of Scope 2 emissions for most organizations. These emissions come from:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Office buildings and facilities</li>
                    <li>Manufacturing operations</li>
                    <li>Data centers</li>
                    <li>Electric vehicle charging</li>
                  </ul>
                  <p className="text-muted-foreground mt-4">
                    To calculate your electricity emissions, collect data on kilowatt-hours (kWh) consumed and apply the appropriate emission factors for your grid location or your specific energy contracts.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="steam" className="mt-6 text-sm">
                <div className="space-y-4">
                  <p>
                    <strong>Purchased steam</strong> emissions result from using steam that is generated off-site by another entity and then purchased for use in your operations. This is common in:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Industrial facilities with significant heating needs</li>
                    <li>District heating systems</li>
                    <li>Larger campus environments</li>
                  </ul>
                  <p className="text-muted-foreground mt-4">
                    Emissions from purchased steam are calculated based on the amount of steam consumed and the emission factor provided by your supplier.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="heating" className="mt-6 text-sm">
                 <p className="text-muted-foreground">Information about purchased heating emissions.</p> 
              </TabsContent>
              
              <TabsContent value="cooling" className="mt-6 text-sm">
                 <p className="text-muted-foreground">Information about purchased cooling emissions.</p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
