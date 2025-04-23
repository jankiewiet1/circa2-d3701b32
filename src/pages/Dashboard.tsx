
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MainLayout } from "@/components/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useCompany } from "@/contexts/CompanyContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { 
  Building2, Users, BarChart2, UploadCloud, RefreshCw, FileText,
  ChevronDown, ChevronUp, PieChart, BarChart, ArrowRight
} from "lucide-react";
import { EmissionsData } from "@/types";
import { 
  ResponsiveContainer, BarChart as RechartsBarChart, PieChart as RechartsPieChart, 
  Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Pie, Cell 
} from "recharts";
import { DashboardActivityFeed } from "@/components/dashboard/DashboardActivityFeed";
import { DashboardGreeting } from "@/components/dashboard/DashboardGreeting";
import { DashboardEmissionsChart } from "@/components/dashboard/DashboardEmissionsChart";
import { DashboardCoverageCard } from "@/components/dashboard/DashboardCoverageCard";
import { DashboardTotalEmissions } from "@/components/dashboard/DashboardTotalEmissions";
import { DashboardQuickActions } from "@/components/dashboard/DashboardQuickActions";
import { DashboardUnmatchedAlert } from "@/components/dashboard/DashboardUnmatchedAlert";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Dashboard() {
  const { user } = useAuth();
  const { company, loading: companyLoading } = useCompany();
  const [emissionsData, setEmissionsData] = useState<EmissionsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activityCount, setActivityCount] = useState(3);
  const [unmatchedEntries, setUnmatchedEntries] = useState(12);
  const [totalEntries, setTotalEntries] = useState(80);
  const isMobile = useIsMobile();
  const [mobileExpanded, setMobileExpanded] = useState(false);
  
  // Simulate loading emissions data
  useEffect(() => {
    if (company) {
      const timer = setTimeout(() => {
        // Mock data - in a real app, this would come from an API call
        const mockData = [
          { scope: "Scope 1", value: 450, unit: "tCO2e", date: "2023" },
          { scope: "Scope 2", value: 780, unit: "tCO2e", date: "2023" },
          { scope: "Scope 3", value: 1200, unit: "tCO2e", date: "2023" },
        ];
        setEmissionsData(mockData);
        setLoading(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      setLoading(false);
    }
  }, [company]);
  
  const totalEmissions = emissionsData.reduce((sum, item) => sum + item.value, 0);
  const coveragePercentage = Math.floor(((totalEntries - unmatchedEntries) / totalEntries) * 100);
  
  // If user doesn't belong to a company
  if (!companyLoading && !company) {
    return (
      <MainLayout>
        <div className="max-w-5xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Welcome to Circa</h1>
            <p className="text-gray-500 mt-2">Get started with your carbon accounting journey</p>
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
                <ul className="space-y-2 list-disc list-inside">
                  <li>Create your own company and become an administrator</li>
                  <li>Ask an existing company administrator to invite you</li>
                </ul>
                <div className="flex items-center space-x-4 pt-4">
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
  
  return (
    <MainLayout>
      <div className="max-w-7xl">
        {/* Welcome Banner */}
        <DashboardGreeting user={user} activityCount={activityCount} />
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Total Emissions Card with Toggle */}
          <DashboardTotalEmissions 
            totalEmissions={totalEmissions} 
            loading={loading} 
          />
          
          {/* Team Members Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Team Members</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-between items-start">
              {loading ? (
                <Skeleton className="h-8 w-28" />
              ) : (
                <>
                  <div className="flex items-end space-x-1">
                    <span className="text-3xl font-bold">5</span>
                    <span className="text-gray-500 mb-1">members</span>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/company/manage">
                      <Users className="h-4 w-4 mr-1" /> 
                      Manage
                    </Link>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
          
          {/* Coverage Percentage Card */}
          <DashboardCoverageCard 
            coveragePercentage={coveragePercentage} 
            loading={loading} 
            unmatchedEntries={unmatchedEntries}
            totalEntries={totalEntries}
          />
        </div>
        
        {/* Quick Action Buttons */}
        <DashboardQuickActions isMobile={isMobile} />

        {/* Unmatched Entries Alert */}
        {coveragePercentage < 100 && (
          <DashboardUnmatchedAlert unmatchedEntries={unmatchedEntries} />
        )}
        
        {/* Emissions Chart */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Emissions by Scope</CardTitle>
              <CardDescription>Breakdown of your company's carbon emissions</CardDescription>
            </div>
            <DashboardEmissionsChart 
              emissionsData={emissionsData} 
              loading={loading} 
            />
          </CardHeader>
        </Card>
        
        {/* Recent Activity Feed */}
        <DashboardActivityFeed loading={loading} />

        {/* Mobile Expand Button */}
        {isMobile && (
          <div className="fixed bottom-4 right-4">
            <Button 
              onClick={() => setMobileExpanded(!mobileExpanded)}
              className="rounded-full h-12 w-12 bg-circa-green hover:bg-circa-green-dark shadow-lg flex items-center justify-center"
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
