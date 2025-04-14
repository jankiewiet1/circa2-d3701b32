
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MainLayout } from "@/components/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useCompany } from "@/contexts/CompanyContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Users, BarChart2 } from "lucide-react";
import { EmissionsData } from "@/types";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export default function Dashboard() {
  const { user } = useAuth();
  const { company, loading: companyLoading } = useCompany();
  const [emissionsData, setEmissionsData] = useState<EmissionsData[]>([]);
  const [loading, setLoading] = useState(true);
  
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
        <div className="mb-6">
          <h1 className="text-3xl font-bold">
            {company ? `${company.name} Dashboard` : "Dashboard"}
          </h1>
          <p className="text-gray-500 mt-1">
            {company ? `Overview of your company's emissions and insights` : "Loading your company data..."}
          </p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Emissions</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-28" />
              ) : (
                <div className="flex items-end space-x-1">
                  <span className="text-3xl font-bold">{totalEmissions.toLocaleString()}</span>
                  <span className="text-gray-500 mb-1">tCO2e</span>
                </div>
              )}
            </CardContent>
          </Card>
          
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
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Reduction Target</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-between items-start">
              {loading ? (
                <Skeleton className="h-8 w-28" />
              ) : (
                <>
                  <div className="flex items-end space-x-1">
                    <span className="text-3xl font-bold">30%</span>
                    <span className="text-gray-500 mb-1">by 2025</span>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/reports">
                      <BarChart2 className="h-4 w-4 mr-1" />
                      View
                    </Link>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Emissions Chart */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Emissions by Scope</CardTitle>
            <CardDescription>Breakdown of your company's carbon emissions</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="w-full h-[300px] flex items-center justify-center">
                <div className="space-y-4 w-full">
                  <Skeleton className="h-[250px] w-full" />
                </div>
              </div>
            ) : (
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={emissionsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="scope" />
                    <YAxis unit=" tCO2e" />
                    <Tooltip formatter={(value) => [`${value} tCO2e`, "Emissions"]} />
                    <Legend />
                    <Bar dataKey="value" name="Emissions" fill="#0E5D40" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Updates from your company and team</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-6 w-5/6" />
                <Skeleton className="h-6 w-2/3" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b">
                  <div>
                    <p className="font-medium">New scope 3 data uploaded</p>
                    <p className="text-sm text-gray-500">By {user?.profile?.first_name} {user?.profile?.last_name}</p>
                  </div>
                  <span className="text-sm text-gray-500">2 hours ago</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <div>
                    <p className="font-medium">Emissions report generated</p>
                    <p className="text-sm text-gray-500">By System</p>
                  </div>
                  <span className="text-sm text-gray-500">Yesterday</span>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">New team member added</p>
                    <p className="text-sm text-gray-500">By {user?.profile?.first_name} {user?.profile?.last_name}</p>
                  </div>
                  <span className="text-sm text-gray-500">3 days ago</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
