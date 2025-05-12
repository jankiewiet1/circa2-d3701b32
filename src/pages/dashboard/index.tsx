import { useState, useEffect } from "react";
import { MainLayout } from "@/components/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useCompany } from "@/contexts/CompanyContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format, subMonths, startOfMonth, subQuarters, startOfQuarter, startOfYear } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { ArrowUp, ArrowDown, CalendarIcon, BarChart2, PieChart as PieChartIcon, AreaChart as AreaChartIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DateRange } from "react-day-picker";

const COLORS = ["#0E5D40", "#6ED0AA", "#AAE3CA", "#D6F3E7"];
const SCOPES = ["Scope 1", "Scope 2", "Scope 3"];

export default function DashboardPage() {
  const { user } = useAuth();
  const { company, loading: companyLoading } = useCompany();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dashboard data
  const [totalEmissions, setTotalEmissions] = useState<number>(0);
  const [monthlyEmissions, setMonthlyEmissions] = useState<number>(0);
  const [quarterlyEmissions, setQuarterlyEmissions] = useState<number>(0);
  const [ytdEmissions, setYtdEmissions] = useState<number>(0);
  const [monthlyChange, setMonthlyChange] = useState<number>(0);
  const [quarterlyChange, setQuarterlyChange] = useState<number>(0);
  const [ytdChange, setYtdChange] = useState<number>(0);
  
  // Time series data
  const [scopeBreakdown, setScopeBreakdown] = useState<any[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<any[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<any[]>([]);
  const [locationBreakdown, setLocationBreakdown] = useState<any[]>([]);
  
  // Filter states
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subMonths(new Date(), 24),
    to: new Date()
  });
  const [selectedScope, setSelectedScope] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [chartType, setChartType] = useState<'line' | 'area'>('line');
  
  // Target progress
  const [emissionTarget, setEmissionTarget] = useState<{target: number; year: number}>({
    target: 20,
    year: 2030
  });
  const [targetProgress, setTargetProgress] = useState<number>(0);

  // Fetch dashboard data
  useEffect(() => {
    if (companyLoading || !company?.id) return;
    
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get total emissions summary
        const { data: summaryData, error: summaryError } = await supabase.rpc('get_dashboard_data', {
          p_company_id: company.id
        });
        
        if (summaryError) throw summaryError;
        
        if (summaryData) {
          // Type checking and safe access
          const summary = typeof summaryData === 'object' ? summaryData : {};
          
          // Set total emissions
          const totalEmissions = typeof summary.total_emissions === 'number' 
            ? summary.total_emissions 
            : 0;
          setTotalEmissions(totalEmissions);
          
          // Create monthly trends data
          const monthlyData = Array.isArray(summary.monthly_trends) 
            ? summary.monthly_trends 
            : [];
            
          setMonthlyTrends(monthlyData.map((item: any) => ({
            month: item.month,
            'Scope 1': item.scope_1_emissions || 0,
            'Scope 2': item.scope_2_emissions || 0,
            'Scope 3': item.scope_3_emissions || 0,
            total: item.total_monthly_emissions
          })));
          
          // Set scope breakdown
          setScopeBreakdown(Array.isArray(summary.emissions_by_scope) 
            ? summary.emissions_by_scope 
            : []);
          
          // Calculate monthly, quarterly, and YTD data
          calculatePeriodEmissions(monthlyData);
        }
        
        // Get category breakdown
        const { data: categories, error: categoriesError } = await supabase
          .from('emission_entries')
          .select(`
            category,
            emission_calculations(total_emissions)
          `)
          .eq('company_id', company.id)
          .gt('date', dateRange.from?.toISOString() || '')
          .lte('date', dateRange.to?.toISOString() || '');
          
        if (categoriesError) throw categoriesError;
        
        if (categories) {
          const categoryTotals = categories.reduce((acc: any, entry) => {
            const category = entry.category;
            const emissions = entry.emission_calculations?.[0]?.total_emissions || 0;
            
            if (!acc[category]) {
              acc[category] = 0;
            }
            acc[category] += emissions;
            return acc;
          }, {});
          
          setCategoryBreakdown(Object.keys(categoryTotals).map(cat => ({
            name: cat,
            value: categoryTotals[cat]
          })));
        }
        
        // Calculate target progress
        calculateTargetProgress();
        
      } catch (err: any) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [company?.id, companyLoading, dateRange]);
  
  const calculatePeriodEmissions = (monthlyData: any[]) => {
    const now = new Date();
    const currentMonth = format(now, 'yyyy-MM');
    const currentMonthLastYear = format(subMonths(now, 12), 'yyyy-MM');
    const currentQuarter = format(startOfQuarter(now), 'yyyy-MM');
    const currentQuarterLastYear = format(subQuarters(startOfQuarter(now), 4), 'yyyy-MM');
    const currentYearStart = format(startOfYear(now), 'yyyy-MM');
    const lastYearStart = format(startOfYear(subMonths(now, 12)), 'yyyy-MM');
    
    // Calculate monthly emissions
    const thisMonthData = monthlyData.find((m: any) => m.month === currentMonth);
    const lastYearMonthData = monthlyData.find((m: any) => m.month === currentMonthLastYear);
    
    const thisMonthEmissions = thisMonthData?.total_monthly_emissions || 0;
    const lastYearMonthEmissions = lastYearMonthData?.total_monthly_emissions || 0;
    
    setMonthlyEmissions(thisMonthEmissions);
    setMonthlyChange(calculatePercentChange(thisMonthEmissions, lastYearMonthEmissions));
    
    // Calculate quarterly emissions
    const quarterMonths = monthlyData.filter((m: any) => {
      const monthDate = new Date(m.month + "-01");
      return monthDate >= startOfQuarter(now) && monthDate <= now;
    });
    
    const quarterLastYearMonths = monthlyData.filter((m: any) => {
      const monthDate = new Date(m.month + "-01");
      const quarterStart = startOfQuarter(subMonths(now, 12));
      const quarterEnd = subMonths(now, 9);
      return monthDate >= quarterStart && monthDate <= quarterEnd;
    });
    
    const quarterEmissions = quarterMonths.reduce((sum: number, m: any) => sum + (m.total_monthly_emissions || 0), 0);
    const quarterLastYearEmissions = quarterLastYearMonths.reduce((sum: number, m: any) => sum + (m.total_monthly_emissions || 0), 0);
    
    setQuarterlyEmissions(quarterEmissions);
    setQuarterlyChange(calculatePercentChange(quarterEmissions, quarterLastYearEmissions));
    
    // Calculate YTD emissions
    const ytdMonths = monthlyData.filter((m: any) => {
      const year = parseInt(m.month.split('-')[0]);
      return year === now.getFullYear();
    });
    
    const lastYtdMonths = monthlyData.filter((m: any) => {
      const year = parseInt(m.month.split('-')[0]);
      return year === now.getFullYear() - 1;
    });
    
    const ytdEmissions = ytdMonths.reduce((sum: number, m: any) => sum + (m.total_monthly_emissions || 0), 0);
    const lastYtdEmissions = lastYtdMonths.reduce((sum: number, m: any) => sum + (m.total_monthly_emissions || 0), 0);
    
    setYtdEmissions(ytdEmissions);
    setYtdChange(calculatePercentChange(ytdEmissions, lastYtdEmissions));
  };
  
  const calculatePercentChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };
  
  const calculateTargetProgress = () => {
    const baselineEmissions = 1000; // Hardcoded baseline, would come from settings
    const targetReduction = emissionTarget.target / 100;
    const targetEmissions = baselineEmissions * (1 - targetReduction);
    const remainingReduction = baselineEmissions - totalEmissions;
    const progress = (remainingReduction / (baselineEmissions - targetEmissions)) * 100;
    
    setTargetProgress(Math.min(100, Math.max(0, progress)));
  };
  
  const renderPercentChange = (change: number) => {
    if (change === 0) return <span className="text-gray-500">0% (no change)</span>;
    
    return change > 0 ? (
      <span className="text-red-500 flex items-center">
        <ArrowUp className="mr-1 h-4 w-4" />
        {change.toFixed(1)}% increase
      </span>
    ) : (
      <span className="text-green-500 flex items-center">
        <ArrowDown className="mr-1 h-4 w-4" />
        {Math.abs(change).toFixed(1)}% decrease
      </span>
    );
  };

  // Show loading state
  if (companyLoading || loading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-6 space-y-8">
          <div className="flex justify-between">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-10 w-1/4" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </MainLayout>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto py-6">
          <Alert variant="destructive">
            <AlertTitle>Error loading dashboard</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </MainLayout>
    );
  }
  
  // If no company is available
  if (!company) {
    return (
      <MainLayout>
        <div className="container mx-auto py-6">
          <Alert>
            <AlertTitle>No company data available</AlertTitle>
            <AlertDescription>
              Please set up your company to start tracking emissions.
              <Button variant="outline" className="ml-2" asChild>
                <a href="/company/setup">Setup Company</a>
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Emissions Dashboard</h1>
            <p className="text-muted-foreground">
              Your organization's carbon performance at a glance
            </p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? format(dateRange.from, "MMM d, yyyy") : "From"} - 
                  {dateRange.to ? format(dateRange.to, "MMM d, yyyy") : "To"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={(range) => handleDateRangeChange(range)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Monthly Emissions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Current Month</CardTitle>
              <CardDescription>Total emissions for {format(new Date(), 'MMMM yyyy')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col">
                <div className="text-3xl font-bold">
                  {monthlyEmissions.toFixed(2)} <span className="text-lg font-normal">tCO₂e</span>
                </div>
                <div className="text-sm mt-1">
                  vs last year: {renderPercentChange(monthlyChange)}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Quarterly Emissions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Current Quarter</CardTitle>
              <CardDescription>Total emissions for Q{Math.floor(new Date().getMonth() / 3) + 1} {new Date().getFullYear()}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col">
                <div className="text-3xl font-bold">
                  {quarterlyEmissions.toFixed(2)} <span className="text-lg font-normal">tCO₂e</span>
                </div>
                <div className="text-sm mt-1">
                  vs last year: {renderPercentChange(quarterlyChange)}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Year-to-Date Emissions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Year-to-Date</CardTitle>
              <CardDescription>Total emissions for {new Date().getFullYear()}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col">
                <div className="text-3xl font-bold">
                  {ytdEmissions.toFixed(2)} <span className="text-lg font-normal">tCO₂e</span>
                </div>
                <div className="text-sm mt-1">
                  vs last year: {renderPercentChange(ytdChange)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Target Progress Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Target Progress</CardTitle>
            <CardDescription>
              Progress toward {emissionTarget.target}% emission reduction by {emissionTarget.year}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-circa-green" 
                  style={{ width: `${targetProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-sm">
                <span>Current Progress: {targetProgress.toFixed(1)}%</span>
                <span>Target: {emissionTarget.target}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Time Series Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Emissions by Scope */}
          <Card className="col-span-1 lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Monthly Emissions by Scope</CardTitle>
                <CardDescription>24-month emissions trend by scope</CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant={chartType === 'line' ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => setChartType('line')}
                >
                  <BarChart2 className="h-4 w-4" />
                </Button>
                <Button 
                  variant={chartType === 'area' ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => setChartType('area')}
                >
                  <AreaChartIcon className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'line' ? (
                    <LineChart data={monthlyTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="month" 
                        tickFormatter={(value) => format(new Date(value + '-01'), 'MMM yy')}
                      />
                      <YAxis unit=" tCO₂e" />
                      <Tooltip 
                        formatter={(value: number) => [value.toFixed(2) + ' tCO₂e', '']}
                        labelFormatter={(label) => format(new Date(label + '-01'), 'MMMM yyyy')}
                      />
                      <Legend />
                      {SCOPES.map((scope, index) => (
                        <Line 
                          key={scope}
                          type="monotone" 
                          dataKey={scope} 
                          name={scope}
                          stroke={COLORS[index % COLORS.length]}
                          strokeWidth={2} 
                          dot={false}
                          activeDot={{ r: 6 }}
                        />
                      ))}
                    </LineChart>
                  ) : (
                    <AreaChart data={monthlyTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="month" 
                        tickFormatter={(value) => format(new Date(value + '-01'), 'MMM yy')}
                      />
                      <YAxis unit=" tCO₂e" />
                      <Tooltip 
                        formatter={(value: number) => [value.toFixed(2) + ' tCO₂e', '']}
                        labelFormatter={(label) => format(new Date(label + '-01'), 'MMMM yyyy')}
                      />
                      <Legend />
                      {SCOPES.map((scope, index) => (
                        <Area 
                          key={scope}
                          type="monotone" 
                          dataKey={scope} 
                          name={scope}
                          fill={COLORS[index % COLORS.length]}
                          stroke={COLORS[index % COLORS.length]}
                          stackId="1"
                        />
                      ))}
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Emissions by Category */}
          <Card>
            <CardHeader>
              <CardTitle>Emissions by Category</CardTitle>
              <CardDescription>
                Breakdown of emissions by source category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    >
                      {categoryBreakdown.map((_entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [value.toFixed(2) + ' tCO₂e', '']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Emissions by Scope */}
          <Card>
            <CardHeader>
              <CardTitle>Emissions by Scope</CardTitle>
              <CardDescription>
                Distribution of emissions across scopes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scopeBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="scope" />
                    <YAxis unit=" tCO₂e" />
                    <Tooltip formatter={(value: number) => [value.toFixed(2) + ' tCO₂e', '']} />
                    <Bar dataKey="value" name="Emissions">
                      {scopeBreakdown.map((_entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Detailed Breakdown Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Detailed Breakdown</CardTitle>
            <CardDescription>
              Filter and analyze emissions by various dimensions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="w-full md:w-1/3">
                <p className="text-sm font-medium mb-2">Filter by Scope</p>
                <Select value={selectedScope} onValueChange={setSelectedScope}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Scope" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Scopes</SelectItem>
                    <SelectItem value="1">Scope 1</SelectItem>
                    <SelectItem value="2">Scope 2</SelectItem>
                    <SelectItem value="3">Scope 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full md:w-1/3">
                <p className="text-sm font-medium mb-2">Filter by Category</p>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categoryBreakdown.map(cat => (
                      <SelectItem key={cat.name} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full md:w-1/3">
                <p className="text-sm font-medium mb-2">Filter by Date Range</p>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? format(dateRange.from, "MMM d, yyyy") : "From"} - 
                      {dateRange.to ? format(dateRange.to, "MMM d, yyyy") : "To"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={(range) => handleDateRangeChange(range)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <Tabs defaultValue="table">
              <TabsList className="mb-4">
                <TabsTrigger value="table">Table</TabsTrigger>
                <TabsTrigger value="chart">Chart</TabsTrigger>
              </TabsList>
              
              <TabsContent value="table">
                <div className="border rounded-md">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="p-3 text-left font-medium">Category</th>
                        <th className="p-3 text-left font-medium">Scope</th>
                        <th className="p-3 text-right font-medium">Emissions (tCO₂e)</th>
                        <th className="p-3 text-right font-medium">% of Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryBreakdown.map((category, i) => (
                        <tr key={i} className="border-b">
                          <td className="p-3">{category.name}</td>
                          <td className="p-3">Various</td>
                          <td className="p-3 text-right">{category.value.toFixed(2)}</td>
                          <td className="p-3 text-right">
                            {((category.value / totalEmissions) * 100).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                      <tr className="font-medium">
                        <td className="p-3">Total</td>
                        <td className="p-3">All</td>
                        <td className="p-3 text-right">{totalEmissions.toFixed(2)}</td>
                        <td className="p-3 text-right">100%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </TabsContent>
              
              <TabsContent value="chart">
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={categoryBreakdown}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" unit=" tCO₂e" />
                      <YAxis 
                        type="category" 
                        dataKey="name"
                        width={100}
                      />
                      <Tooltip formatter={(value: number) => [value.toFixed(2) + ' tCO₂e', '']} />
                      <Bar dataKey="value" name="Emissions" fill="#0E5D40" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

const handleDateRangeChange = (range: DateRange | undefined) => {
  if (range) {
    setDateRange(range);
  }
};
