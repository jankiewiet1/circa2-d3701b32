
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
import { toast } from "sonner";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

interface EmissionData {
  id: string;
  fuel_type?: string;
  source?: string;
  amount?: number;
  unit?: string;
  emissions_co2e?: number;
  date?: string;
  emission_factor_source?: string;
  company_id?: string;
  created_at?: string;
  uploaded_by?: string;
  scope_description?: string;
  reporting_boundary?: string;
  reporting_period?: string;
  activity_data?: string;
  uncertainty_notes?: string;
  trend_notes?: string;
  progress_toward_target?: string;
  additional_notes?: string;
  events_affecting_data?: string;
  ratio_indicators?: string;
}

interface ChartDataPoint {
  name: string;
  value: number;
}

export default function Scope1() {
  const { userRole, company } = useCompany();
  const companyId = company?.id;
  const canEdit = userRole === "admin" || userRole === "editor";
  
  const [emissionsData, setEmissionsData] = useState<EmissionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    dateRange: "last12months",
    fuelType: "all",
    source: "all",
    unit: "all"
  });

  const [availableFuelTypes, setAvailableFuelTypes] = useState<string[]>([]);
  const [availableSources, setAvailableSources] = useState<string[]>([]);
  const [availableUnits, setAvailableUnits] = useState<string[]>([]);

  const [summaryStats, setSummaryStats] = useState({
    totalEmissions: 0,
    changeFromLastYear: 0,
    topEmissionSource: "",
    mostUsedFuelType: "",
    trendDirection: "up"
  });
  
  useEffect(() => {
    const fetchData = async () => {
      if (!companyId) return;
      
      setLoading(true);
      try {
        let query = supabase
          .from('scope1_emissions')
          .select('*')
          .eq('company_id', companyId);
          
        // Apply date range filter
        const today = new Date();
        let startDate = new Date();
        switch (filters.dateRange) {
          case 'last3months':
            startDate.setMonth(today.getMonth() - 3);
            break;
          case 'last6months':
            startDate.setMonth(today.getMonth() - 6);
            break;
          case 'last12months':
            startDate.setMonth(today.getMonth() - 12);
            break;
          case 'thisYear':
            startDate = new Date(today.getFullYear(), 0, 1);
            break;
          case 'lastYear':
            startDate = new Date(today.getFullYear() - 1, 0, 1);
            break;
        }
        
        query = query.gte('date', startDate.toISOString().split('T')[0]);
        
        // Apply other filters
        if (filters.fuelType !== 'all') {
          query = query.eq('fuel_type', filters.fuelType);
        }
        if (filters.source !== 'all') {
          query = query.eq('source', filters.source);
        }
        if (filters.unit !== 'all') {
          query = query.eq('unit', filters.unit);
        }
        
        const { data, error: fetchError } = await query;
          
        if (fetchError) throw fetchError;
        
        if (data) {
          setEmissionsData(data as EmissionData[]);
          calculateSummaryStats(data as EmissionData[]);
          extractFilterOptions(data as EmissionData[]);
        } else {
          // If no data, use mock data for demonstration
          const mockData = getMockData();
          setEmissionsData(mockData);
          calculateSummaryStats(mockData);
          extractFilterOptions(mockData);
          toast.info("Using demonstration data as no emissions data was found.");
        }
      } catch (err: any) {
        console.error("Error fetching emissions data:", err);
        setError(err.message);
        
        // Use mock data on error
        const mockData = getMockData();
        setEmissionsData(mockData);
        calculateSummaryStats(mockData);
        extractFilterOptions(mockData);
        toast.error("Error loading data. Using demonstration data instead.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [companyId, filters]);
  
  const extractFilterOptions = (data: EmissionData[]) => {
    // Extract unique fuel types, sources, and units for filter dropdowns
    const fuelTypes = [...new Set(data.map(item => item.fuel_type || 'Unknown').filter(Boolean))];
    const sources = [...new Set(data.map(item => item.source || 'Unknown').filter(Boolean))];
    const units = [...new Set(data.map(item => item.unit || 'Unknown').filter(Boolean))];
    
    setAvailableFuelTypes(fuelTypes);
    setAvailableSources(sources);
    setAvailableUnits(units);
  };
  
  const formatNumberForTooltip = (value: ValueType) => {
    if (typeof value === 'number') {
      return value.toFixed(2);
    }
    return value;
  };
  
  const calculateSummaryStats = (data: EmissionData[]) => {
    if (!data || data.length === 0) {
      setSummaryStats({
        totalEmissions: 0,
        changeFromLastYear: 0,
        topEmissionSource: "No data",
        mostUsedFuelType: "No data",
        trendDirection: "up"
      });
      return;
    }
    
    // Calculate total emissions
    const totalEmissions = data.reduce((sum, item) => 
      sum + (item.emissions_co2e || 0), 0);
    
    // Calculate most used fuel type
    const fuelTypeCounts = data.reduce<Record<string, number>>((acc, item) => {
      const fuelType = item.fuel_type || 'Unknown';
      acc[fuelType] = (acc[fuelType] || 0) + 1;
      return acc;
    }, {});
    
    const mostUsedFuelType = Object.entries(fuelTypeCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || "Unknown";
    
    // Calculate top emission source
    const sourceEmissions = data.reduce<Record<string, number>>((acc, item) => {
      const source = item.source || 'Unknown';
      acc[source] = (acc[source] || 0) + (item.emissions_co2e || 0);
      return acc;
    }, {});
    
    const topEmissionSource = Object.entries(sourceEmissions)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || "Unknown";
    
    // Calculate year over year change
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;
    
    const lastYearData = data.filter(item => {
      const date = new Date(item.date || '');
      return date.getFullYear() === lastYear;
    });
    
    const thisYearData = data.filter(item => {
      const date = new Date(item.date || '');
      return date.getFullYear() === currentYear;
    });
    
    const lastYearTotal = lastYearData.reduce((sum, item) => 
      sum + (item.emissions_co2e || 0), 0);
    
    const thisYearTotal = thisYearData.reduce((sum, item) => 
      sum + (item.emissions_co2e || 0), 0);
    
    let changeFromLastYear = 0;
    if (lastYearTotal > 0) {
      changeFromLastYear = ((thisYearTotal - lastYearTotal) / lastYearTotal) * 100;
    }
    
    setSummaryStats({
      totalEmissions,
      changeFromLastYear,
      topEmissionSource,
      mostUsedFuelType,
      trendDirection: changeFromLastYear >= 0 ? "up" : "down"
    });
  };

  const prepareMonthlyData = () => {
    if (!emissionsData.length) return [];
    
    // Group by month
    const monthlyData: Record<string, { month: string; value: number }> = {};
    
    emissionsData.forEach(item => {
      if (!item.date) return;
      
      const date = new Date(item.date);
      const month = format(date, 'MMM');
      
      if (!monthlyData[month]) {
        monthlyData[month] = { month, value: 0 };
      }
      
      monthlyData[month].value += Number(item.emissions_co2e || 0);
    });
    
    // Convert to array and sort by month
    const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return Object.values(monthlyData).sort((a, b) => 
      monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month)
    );
  };
  
  const prepareFuelTypeData = () => {
    if (!emissionsData.length) return [];
    
    const fuelTypeData: Record<string, ChartDataPoint> = {};
    
    emissionsData.forEach(item => {
      const fuelType = item.fuel_type || 'Unknown';
      
      if (!fuelTypeData[fuelType]) {
        fuelTypeData[fuelType] = { name: fuelType, value: 0 };
      }
      
      fuelTypeData[fuelType].value += Number(item.emissions_co2e || 0);
    });
    
    return Object.values(fuelTypeData);
  };
  
  const prepareSourceData = () => {
    if (!emissionsData.length) return [];
    
    const sourceData: Record<string, ChartDataPoint> = {};
    
    emissionsData.forEach(item => {
      const source = item.source || 'Unknown';
      
      if (!sourceData[source]) {
        sourceData[source] = { name: source, value: 0 };
      }
      
      sourceData[source].value += Number(item.emissions_co2e || 0);
    });
    
    return Object.values(sourceData);
  };
  
  const prepareMonthlyTrendsData = () => {
    if (!emissionsData.length) return [];
    
    // Group by month and source
    const monthlySourceData: Record<string, Record<string, any>> = {};
    
    // First get unique sources
    const sources = [...new Set(emissionsData.map(item => item.source || 'Unknown'))];
    
    // Then process data
    emissionsData.forEach(item => {
      if (!item.date) return;
      
      const date = new Date(item.date);
      const month = format(date, 'MMM');
      const source = item.source || 'Unknown';
      
      if (!monthlySourceData[month]) {
        monthlySourceData[month] = { month };
        
        // Initialize all sources with zero
        sources.forEach(s => {
          monthlySourceData[month][s] = 0;
        });
      }
      
      monthlySourceData[month][source] = (monthlySourceData[month][source] || 0) + (Number(item.emissions_co2e) || 0);
    });
    
    // Convert to array and sort by month
    const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return Object.values(monthlySourceData).sort((a, b) => 
      monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month)
    );
  };

  const getMockData = (): EmissionData[] => [
    { 
      id: '1',
      fuel_type: 'Natural Gas', 
      source: 'Building Heat',
      amount: 1000, 
      unit: 'kg',
      emissions_co2e: 2.5, 
      date: '2024-01-01',
      emission_factor_source: 'Standard emission factors',
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
      emission_factor_source: 'Standard emission factors',
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
      emission_factor_source: 'Standard emission factors',
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
      emission_factor_source: 'Standard emission factors',
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

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  const monthlyData = prepareMonthlyData();
  const fuelTypeData = prepareFuelTypeData();
  const sourceData = prepareSourceData();
  const monthlyTrendsData = prepareMonthlyTrendsData();
  
  return (
    <MainLayout>
      <div className="max-w-7xl">
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
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Add Entry
              </Button>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Scope 1 Emissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end space-x-1">
                <span className="text-3xl font-bold">{summaryStats.totalEmissions.toFixed(2)}</span>
                <span className="text-gray-500 mb-1">tCO₂e</span>
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
                  {Math.abs(summaryStats.changeFromLastYear).toFixed(0)}%
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
                    {availableFuelTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
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
                    {availableSources.map(source => (
                      <SelectItem key={source} value={source}>{source}</SelectItem>
                    ))}
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
                    {availableUnits.map(unit => (
                      <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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
          
          <Card>
            <CardHeader>
              <CardTitle>Fuel Type Breakdown</CardTitle>
              <CardDescription>Total emissions by fuel type in tCO₂e</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="h-[300px] w-full">
                {fuelTypeData.length > 0 ? (
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
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No fuel type data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Emission Source Contribution</CardTitle>
              <CardDescription>Distribution by emission source</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {sourceData.length > 0 ? (
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
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No source data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Monthly Trends</CardTitle>
              <CardDescription>Emissions by source per month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {monthlyTrendsData.length > 0 && sourceData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyTrendsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" />
                      <YAxis unit=" tCO₂e" />
                      <RechartsTooltip />
                      <Legend />
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
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No monthly trends data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mb-6 bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-blue-700">
              <Info className="mr-2 h-5 w-5" />
              Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            {emissionsData.length > 0 ? (
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="bg-blue-200 p-1 rounded-full mr-2 mt-0.5">
                    <TrendingUp className="h-3 w-3 text-blue-700" />
                  </span>
                  <span>
                    {summaryStats.trendDirection === "up" 
                      ? `Emissions increased ${Math.abs(summaryStats.changeFromLastYear).toFixed(0)}% compared to last year.`
                      : `Emissions decreased ${Math.abs(summaryStats.changeFromLastYear).toFixed(0)}% compared to last year.`
                    }
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-200 p-1 rounded-full mr-2 mt-0.5">
                    <BarChart3 className="h-3 w-3 text-blue-700" />
                  </span>
                  <span>{summaryStats.topEmissionSource} is your largest source of emissions, contributing significantly to your total.</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-200 p-1 rounded-full mr-2 mt-0.5">
                    <Droplet className="h-3 w-3 text-blue-700" />
                  </span>
                  <span>{summaryStats.mostUsedFuelType} is your most used fuel type across operations.</span>
                </li>
              </ul>
            ) : (
              <div className="text-center py-2 text-blue-700">
                No data available to generate insights.
              </div>
            )}
          </CardContent>
        </Card>
        
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
                    <TableHead>Emission Factor Source</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex justify-center items-center">
                          <svg
                            className="animate-spin h-5 w-5 mr-3 text-green-600"
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
                        <TableCell>{emission.emissions_co2e?.toFixed(2) || 'N/A'}</TableCell>
                        <TableCell>{emission.emission_factor_source || 'N/A'}</TableCell>
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
