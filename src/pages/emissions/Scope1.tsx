
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Flame, 
  Upload, 
  Plus, 
  Info, 
  Calendar, 
  Filter, 
  TrendingUp, 
  TrendingDown,
  Truck,
  Factory,
  BarChart3,
  Download,
  Droplet
} from "lucide-react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  TooltipProps
} from "recharts";
import { useCompany } from "@/contexts/CompanyContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ValueType } from "recharts/types/component/DefaultTooltipContent";

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// Define a type for emission sources
interface EmissionSource {
  name: string;
  value: number;
}

// Define a type for our emissions data
interface EmissionData {
  id: string;
  fuel_type: string;
  source: string;
  amount: number;
  unit: string;
  emissions_co2e: number;
  date: string;
  emission_factor: number;
  emission_unit: string;
  scope_description?: string;
  reporting_boundary?: string;
  reporting_period?: string;
  activity_data?: string;
  uncertainty_notes?: string;
  trend_notes?: string;
  progress_toward_target?: string;
  additional_notes?: string;
  events_affecting_data?: string;
}

export default function Scope1() {
  const { userRole, company } = useCompany();
  const companyId = company?.id;
  const canEdit = userRole === "admin" || userRole === "editor";
  
  // State for data and filters
  const [emissionsData, setEmissionsData] = useState<EmissionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    dateRange: "last12months",
    fuelType: "all",
    source: "all",
    unit: "all"
  });

  // State for summary stats
  const [summaryStats, setSummaryStats] = useState({
    totalEmissions: 0,
    changeFromLastYear: 0,
    topEmissionSource: "",
    mostUsedFuelType: "",
    trendDirection: "up"
  });
  
  // Fetch data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // For demonstration, we'll use sample data if Supabase connection fails
        const { data, error: fetchError } = await supabase
          .from('scope1_emissions')
          .select('*')
          .eq('company_id', companyId);
          
        if (fetchError) throw fetchError;
        
        if (data && data.length > 0) {
          setEmissionsData(data as EmissionData[]);
          calculateSummaryStats(data as EmissionData[]);
        } else {
          // Fallback to mock data
          setEmissionsData(getMockData());
          calculateSummaryStats(getMockData());
        }
      } catch (err: any) {
        console.error("Error fetching emissions data:", err);
        setError(err.message);
        // Fallback to mock data
        setEmissionsData(getMockData());
        calculateSummaryStats(getMockData());
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [companyId, filters]);
  
  const calculateSummaryStats = (data: EmissionData[]) => {
    if (!data || data.length === 0) return;
    
    // Calculate total emissions
    const totalEmissions = data.reduce((sum, item) => 
      sum + (parseFloat(String(item.emissions_co2e)) || 0), 0).toFixed(2);
    
    // Find most used fuel type
    const fuelTypeCounts = data.reduce<Record<string, number>>((acc, item) => {
      const fuelType = item.fuel_type || 'Unknown';
      acc[fuelType] = (acc[fuelType] || 0) + 1;
      return acc;
    }, {});
    
    const mostUsedFuelType = Object.keys(fuelTypeCounts).reduce((a, b) => 
      fuelTypeCounts[a] > fuelTypeCounts[b] ? a : b, '');
    
    // Find top emission source
    const sourceEmissions = data.reduce<Record<string, number>>((acc, item) => {
      const source = item.source || 'Unknown';
      acc[source] = (acc[source] || 0) + (parseFloat(String(item.emissions_co2e)) || 0);
      return acc;
    }, {});
    
    const topEmissionSource = Object.keys(sourceEmissions).reduce((a, b) => 
      sourceEmissions[a] > sourceEmissions[b] ? a : b, '');
    
    // Mock change from last year value
    const changeFromLastYear = 12.5;
    
    setSummaryStats({
      totalEmissions: parseFloat(totalEmissions),
      changeFromLastYear,
      topEmissionSource,
      mostUsedFuelType,
      trendDirection: changeFromLastYear >= 0 ? "up" : "down"
    });
  };

  // Prepare data for charts
  const prepareMonthlyData = () => {
    if (!emissionsData.length) return [];
    
    const monthlyData = emissionsData.reduce<Record<string, { month: string; value: number }>>((acc, item) => {
      const date = item.date ? new Date(item.date) : new Date();
      const month = format(date, 'MMM');
      
      if (!acc[month]) {
        acc[month] = { month, value: 0 };
      }
      
      acc[month].value += parseFloat(String(item.emissions_co2e)) || 0;
      return acc;
    }, {});
    
    return Object.values(monthlyData);
  };
  
  const prepareFuelTypeData = () => {
    if (!emissionsData.length) return [];
    
    const fuelTypeData = emissionsData.reduce<Record<string, EmissionSource>>((acc, item) => {
      const fuelType = item.fuel_type || 'Unknown';
      
      if (!acc[fuelType]) {
        acc[fuelType] = { name: fuelType, value: 0 };
      }
      
      acc[fuelType].value += parseFloat(String(item.emissions_co2e)) || 0;
      return acc;
    }, {});
    
    return Object.values(fuelTypeData);
  };
  
  const prepareSourceData = () => {
    if (!emissionsData.length) return [];
    
    const sourceData = emissionsData.reduce<Record<string, EmissionSource>>((acc, item) => {
      const source = item.source || 'Unknown';
      
      if (!acc[source]) {
        acc[source] = { name: source, value: 0 };
      }
      
      acc[source].value += parseFloat(String(item.emissions_co2e)) || 0;
      return acc;
    }, {});
    
    return Object.values(sourceData);
  };
  
  const prepareMonthlyTrendsData = () => {
    if (!emissionsData.length) return [];
    
    const monthlySourceData = emissionsData.reduce<Record<string, Record<string, any>>>((acc, item) => {
      const date = item.date ? new Date(item.date) : new Date();
      const month = format(date, 'MMM');
      const source = item.source || 'Unknown';
      
      if (!acc[month]) {
        acc[month] = { month };
      }
      
      acc[month][source] = (acc[month][source] || 0) + (parseFloat(String(item.emissions_co2e)) || 0);
      return acc;
    }, {});
    
    return Object.values(monthlySourceData);
  };

  // Format number for tooltip
  const formatNumberForTooltip = (value: ValueType) => {
    if (typeof value === 'number') {
      return value.toFixed(2);
    }
    return value;
  };

  // Mock data generator function
  const getMockData = (): EmissionData[] => [
    { 
      id: '1',
      fuel_type: 'Natural Gas', 
      source: 'Building Heat',
      amount: 1000, 
      unit: 'kg',
      emissions_co2e: 2.5, 
      date: '2024-01-01',
      emission_factor: 2.3,
      emission_unit: 'kg CO2e per kg',
      scope_description: 'Direct emissions from natural gas',
      reporting_boundary: 'Main office building',
      reporting_period: '2024 Q1',
      activity_data: 'Monthly meter readings',
      uncertainty_notes: 'Low uncertainty',
      trend_notes: 'Decreasing trend',
      progress_toward_target: 'On track',
      additional_notes: 'Regular maintenance performed',
      events_affecting_data: 'None'
    },
    { 
      id: '2',
      fuel_type: 'Diesel', 
      source: 'Vehicle Fleet',
      amount: 500, 
      unit: 'liters',
      emissions_co2e: 3.2, 
      date: '2024-01-15',
      emission_factor: 2.7,
      emission_unit: 'kg CO2e per liter',
      scope_description: 'Direct emissions from vehicles',
      reporting_boundary: 'Company fleet',
      reporting_period: '2024 Q1',
      activity_data: 'Fuel cards',
      uncertainty_notes: 'Medium uncertainty',
      trend_notes: 'Stable',
      progress_toward_target: 'Improving',
      additional_notes: 'Driver training implemented',
      events_affecting_data: 'Weather conditions'
    },
    { 
      id: '3',
      fuel_type: 'Petrol', 
      source: 'Vehicle Fleet',
      amount: 300, 
      unit: 'liters',
      emissions_co2e: 2.8, 
      date: '2024-02-01',
      emission_factor: 2.3,
      emission_unit: 'kg CO2e per liter',
      scope_description: 'Direct emissions from vehicles',
      reporting_boundary: 'Company fleet',
      reporting_period: '2024 Q1',
      activity_data: 'Fuel cards',
      uncertainty_notes: 'Low uncertainty',
      trend_notes: 'Decreasing',
      progress_toward_target: 'On track',
      additional_notes: 'Hybrid vehicles added',
      events_affecting_data: 'None'
    },
    { 
      id: '4',
      fuel_type: 'Natural Gas', 
      source: 'Manufacturing',
      amount: 2000, 
      unit: 'kg',
      emissions_co2e: 4.6, 
      date: '2024-03-01',
      emission_factor: 2.3,
      emission_unit: 'kg CO2e per kg',
      scope_description: 'Direct emissions from manufacturing',
      reporting_boundary: 'Factory',
      reporting_period: '2024 Q1',
      activity_data: 'Process monitoring',
      uncertainty_notes: 'Medium uncertainty',
      trend_notes: 'Increasing',
      progress_toward_target: 'Needs improvement',
      additional_notes: 'New equipment installation',
      events_affecting_data: 'Production increase'
    }
  ];

  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  // Prepare data for charts
  const monthlyData = prepareMonthlyData();
  const fuelTypeData = prepareFuelTypeData();
  const sourceData = prepareSourceData();
  const monthlyTrendsData = prepareMonthlyTrendsData();
  
  return (
    <MainLayout>
      <div className="max-w-7xl">
        {/* Header with title and action buttons */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Flame className="mr-2 h-7 w-7 text-orange-500" />
              Scope 1 Emissions
            </h1>
            <p className="text-gray-500 mt-1">
              Direct emissions from owned or controlled sources
            </p>
          </div>
          
          {canEdit && (
            <div className="flex space-x-2">
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Import Data
              </Button>
              <Button className="bg-circa-green hover:bg-circa-green-dark">
                <Plus className="mr-2 h-4 w-4" />
                Add Entry
              </Button>
            </div>
          )}
        </div>
        
        {/* Summary Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Scope 1 Emissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end space-x-1">
                <span className="text-3xl font-bold">{summaryStats.totalEmissions}</span>
                <span className="text-gray-500 mb-1">tCO2e</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Change from Last Year</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                {summaryStats.trendDirection === "up" ? (
                  <TrendingUp className="mr-2 h-5 w-5 text-red-500" />
                ) : (
                  <TrendingDown className="mr-2 h-5 w-5 text-green-500" />
                )}
                <span className="text-3xl font-bold">
                  {Math.abs(summaryStats.changeFromLastYear)}%
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Top Emission Source</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Factory className="mr-2 h-5 w-5 text-gray-400" />
                <span className="text-xl font-bold">{summaryStats.topEmissionSource || "N/A"}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Most Used Fuel Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Droplet className="mr-2 h-5 w-5 text-blue-500" />
                <span className="text-xl font-bold">{summaryStats.mostUsedFuelType || "N/A"}</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Filters Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Data Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date Range</label>
                <Select 
                  value={filters.dateRange} 
                  onValueChange={(value) => handleFilterChange("dateRange", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last3months">Last 3 Months</SelectItem>
                    <SelectItem value="last6months">Last 6 Months</SelectItem>
                    <SelectItem value="last12months">Last 12 Months</SelectItem>
                    <SelectItem value="thisYear">This Year</SelectItem>
                    <SelectItem value="lastYear">Last Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Fuel Type</label>
                <Select 
                  value={filters.fuelType} 
                  onValueChange={(value) => handleFilterChange("fuelType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select fuel type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Fuel Types</SelectItem>
                    <SelectItem value="naturalGas">Natural Gas</SelectItem>
                    <SelectItem value="diesel">Diesel</SelectItem>
                    <SelectItem value="petrol">Petrol</SelectItem>
                    <SelectItem value="lpg">LPG</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Source</label>
                <Select 
                  value={filters.source} 
                  onValueChange={(value) => handleFilterChange("source", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="vehicleFleet">Vehicle Fleet</SelectItem>
                    <SelectItem value="buildingHeat">Building Heat</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Unit</label>
                <Select 
                  value={filters.unit} 
                  onValueChange={(value) => handleFilterChange("unit", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Units</SelectItem>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="liters">Liters</SelectItem>
                    <SelectItem value="kWh">kWh</SelectItem>
                    <SelectItem value="m3">m³</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Visualizations Section - Two column layout for charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Emissions Over Time */}
          <Card>
            <CardHeader>
              <CardTitle>Emissions Over Time</CardTitle>
              <CardDescription>Monthly emissions in tCO₂e</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" />
                    <YAxis unit=" tCO₂e" />
                    <RechartsTooltip formatter={(value: ValueType) => [`${formatNumberForTooltip(value)} tCO₂e`, "Emissions"]} />
                    <Legend />
                    <Area type="monotone" dataKey="value" name="Emissions" stroke="#f97316" fill="#fdba74" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Fuel Type Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Fuel Type Breakdown</CardTitle>
              <CardDescription>Total emissions by fuel type in tCO₂e</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={fuelTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {fuelTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value: ValueType) => [`${formatNumberForTooltip(value)} tCO₂e`, "Emissions"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Emission Source Contribution */}
          <Card>
            <CardHeader>
              <CardTitle>Emission Source Contribution</CardTitle>
              <CardDescription>Distribution by emission source</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sourceData} layout="vertical" margin={{ top: 20, right: 30, left: 50, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" unit=" tCO₂e" />
                    <YAxis type="category" dataKey="name" width={120} />
                    <RechartsTooltip formatter={(value: ValueType) => [`${formatNumberForTooltip(value)} tCO₂e`, "Emissions"]} />
                    <Legend />
                    <Bar dataKey="value" name="Emissions" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Monthly Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Trends</CardTitle>
              <CardDescription>Emissions by source per month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyTrendsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" />
                    <YAxis unit=" tCO₂e" />
                    <RechartsTooltip />
                    <Legend />
                    {/* Dynamically generate bars for each source */}
                    {sourceData.map((source, index) => (
                      <Bar 
                        key={source.name}
                        dataKey={source.name} 
                        stackId="a" 
                        fill={COLORS[index % COLORS.length]} 
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Insights Card */}
        <Card className="mb-6 bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-blue-700">
              <Info className="mr-2 h-5 w-5" />
              Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <span className="bg-blue-200 p-1 rounded-full mr-2 mt-0.5">
                  <TrendingUp className="h-3 w-3 text-blue-700" />
                </span>
                <span>Your emissions increased 15% in Q2 due to higher diesel usage in transport.</span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-200 p-1 rounded-full mr-2 mt-0.5">
                  <BarChart3 className="h-3 w-3 text-blue-700" />
                </span>
                <span>Vehicle Fleet emissions are 35% higher than the industry average for your company size.</span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-200 p-1 rounded-full mr-2 mt-0.5">
                  <TrendingDown className="h-3 w-3 text-blue-700" />
                </span>
                <span>Natural Gas emissions have reduced by 10% since implementing new heating controls.</span>
              </li>
            </ul>
          </CardContent>
        </Card>
        
        {/* Data Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Emissions Data</CardTitle>
                <CardDescription>Raw emissions records</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Fuel Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Emissions (tCO₂e)</TableHead>
                    <TableHead>Emission Factor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex justify-center items-center">
                          <svg
                            className="animate-spin h-5 w-5 mr-3 text-circa-green"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Loading data...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : emissionsData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No emissions data available
                      </TableCell>
                    </TableRow>
                  ) : (
                    emissionsData.map((emission) => (
                      <TableRow key={emission.id}>
                        <TableCell>{emission.date ? format(new Date(emission.date), 'yyyy-MM-dd') : 'N/A'}</TableCell>
                        <TableCell>{emission.source || 'N/A'}</TableCell>
                        <TableCell>{emission.fuel_type || 'N/A'}</TableCell>
                        <TableCell>{emission.amount || 'N/A'}</TableCell>
                        <TableCell>{emission.unit || 'N/A'}</TableCell>
                        <TableCell>{emission.emissions_co2e || 'N/A'}</TableCell>
                        <TableCell>{emission.emission_factor || 'N/A'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm text-gray-500">
              Showing {emissionsData.length} entries
            </div>
            {/* Simple pagination placeholder - would be expanded in a real implementation */}
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm" disabled>Next</Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
}
