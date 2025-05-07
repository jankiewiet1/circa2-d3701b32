import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MainLayout } from "@/components/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useCompany } from "@/contexts/CompanyContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Building2, Users, BarChart2, UploadCloud, RefreshCw, FileText,
  ChevronDown, ChevronUp, PieChart, BarChart, ArrowRight, AlertCircle
} from "lucide-react";
import { 
  ResponsiveContainer, BarChart as RechartsBarChart, PieChart as RechartsPieChart, 
  Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Pie, Cell 
} from "recharts";
import { DashboardActivityFeed } from "@/components/dashboard/DashboardActivityFeed";
import { DashboardGreeting } from "@/components/dashboard/DashboardGreeting";
import { DashboardScopeBreakdownChart } from "@/components/dashboard/DashboardScopeBreakdownChart";
import { DashboardTotalEmissions } from "@/components/dashboard/DashboardTotalEmissions";
import { DashboardQuickActions } from "@/components/dashboard/DashboardQuickActions";
import { DashboardMonthlyTrendChart } from "@/components/dashboard/DashboardMonthlyTrendChart";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDashboardSummary } from "@/hooks/useDashboardSummary";
import { useScopeEntries } from "@/hooks/useScopeEntries";
import { Tooltip as RechartsTooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function Dashboard() {
  const { user } = useAuth();
  const { company, loading: companyLoading } = useCompany();
  const [activityCount, setActivityCount] = useState(3);
  const isMobile = useIsMobile();
  const [mobileExpanded, setMobileExpanded] = useState(false);
  
  const { data: dashboardData, loading: dashboardLoading, error: dashboardError, refetch } = useDashboardSummary();
  
  const { entries, loading: scopeEntriesLoading, error: scopeEntriesError, refetch: scopeEntriesRefetch } = useScopeEntries(1);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    // Gather summary data
    const summary = {
      inputs,
      totalCO2,
      totalCost,
      fte,
    };

    // Send to backend
    await fetch('https://<your-project-id>.functions.supabase.co/send-summary-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        summary: { inputs, totalCO2, totalCost, fte }
      }),
    });
  };
  
  if (!companyLoading && !company) {
    return (
      <MainLayout>
        <div className="max-w-5xl mx-auto p-4 md:p-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Welcome to Circa</h1>
            <p className="text-muted-foreground mt-2">Get started with your carbon accounting journey</p>
          </div>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>You don't belong to a company yet</CardTitle>
              <CardDescription>
                To access all features of Circa, you need to either create a new company or be invited to an existing one
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Options to get started:</h3>
                <ul className="space-y-2 list-disc list-inside text-sm text-muted-foreground">
                  <li>Create your own company and become an administrator</li>
                  <li>Ask an existing company administrator to invite you</li>
                </ul>
                <div className="flex flex-wrap items-center gap-4 pt-4">
                  <Button asChild className="bg-circa-green hover:bg-circa-green-dark">
                    <Link to="/company/setup">
                      <Building2 className="mr-2 h-4 w-4" />
                      Create a Company
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/profile">
                      View Profile
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }
  
  if (companyLoading || dashboardLoading) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto p-4 md:p-0">
          <DashboardGreeting user={user} activityCount={activityCount} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
          </div>
          <Skeleton className="h-16 mb-6 rounded-lg" /> 
          <Skeleton className="h-64 mb-6 rounded-lg" /> 
          <Skeleton className="h-48 rounded-lg" /> 
        </div>
      </MainLayout>
    );
  }

  if (dashboardError) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto p-4 md:p-0">
          <DashboardGreeting user={user} activityCount={activityCount} />
          <Alert variant="destructive" className="mt-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Dashboard</AlertTitle>
            <AlertDescription>
              {dashboardError || "An unexpected error occurred while fetching dashboard data."}
              <Button variant="secondary" size="sm" onClick={refetch} className="ml-4">
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </MainLayout>
    );
  }
  
  if (!dashboardData) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto p-4 md:p-0">
          <DashboardGreeting user={user} activityCount={activityCount} />
           <Card className="mt-6">
             <CardHeader>
               <CardTitle>No Emission Data Yet</CardTitle>
               <CardDescription>Start by uploading your emission activities to see your dashboard.</CardDescription>
             </CardHeader>
             <CardContent>
                <DashboardQuickActions isMobile={isMobile} />
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto p-4 md:p-0">
        <DashboardGreeting user={user} activityCount={activityCount} />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <DashboardTotalEmissions 
            totalEmissions={dashboardData.total_emissions}
            loading={dashboardLoading}
          />
          
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Team Members</CardTitle>
              <Button variant="ghost" size="icon" asChild className="h-7 w-7">
                 <Link to="/company/manage">
                   <Users className="h-4 w-4" /> 
                   <span className="sr-only">Manage Team</span>
                 </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {dashboardLoading ? (
                <Skeleton className="h-8 w-28" />
              ) : (
                  <div className="flex items-end space-x-1">
                  <span className="text-3xl font-bold">{dashboardData.team_members}</span>
                  <span className="text-muted-foreground mb-1 text-sm">members</span>
                  </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <DashboardQuickActions isMobile={isMobile} />
        
        <Card className="mb-6">
          <CardHeader>
              <CardTitle>Emissions by Scope</CardTitle>
            <CardDescription>Breakdown of your company's carbon emissions (tCO₂e)</CardDescription>
          </CardHeader>
          <CardContent>
             <DashboardScopeBreakdownChart 
               data={dashboardData.emissions_by_scope}
               loading={dashboardLoading}
            />
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Monthly Emission Trends</CardTitle>
            <CardDescription>Total emissions over time (tCO₂e)</CardDescription>
          </CardHeader>
          <CardContent>
             <DashboardMonthlyTrendChart 
               data={dashboardData.monthly_trends}
               loading={dashboardLoading}
             />
          </CardContent>
        </Card>
        
        <DashboardActivityFeed loading={false} />

        {isMobile && (
          <div className="fixed bottom-4 right-4 z-50">
            <Button 
              onClick={() => setMobileExpanded(!mobileExpanded)}
              className="rounded-full h-12 w-12 p-0 bg-circa-green hover:bg-circa-green-dark shadow-lg flex items-center justify-center"
            >
              {mobileExpanded ? (
                <ChevronDown className="h-6 w-6" />
              ) : (
                <ChevronUp className="h-6 w-6" />
              )}
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
