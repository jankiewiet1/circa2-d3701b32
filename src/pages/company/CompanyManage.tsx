import { useState } from "react";
import { MainLayout } from "@/components/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useCompany } from "@/contexts/CompanyContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Users, Settings, Save } from "lucide-react";
import CompanyInfoTab from "./setup/tabs/CompanyInfoTab";
import CompanyTeamTab from "./setup/tabs/CompanyTeamTab";
import CompanyPreferencesTab from "./setup/tabs/CompanyPreferencesTab";
import { toast } from "@/components/ui/sonner";

export default function CompanyManage() {
  const { user } = useAuth();
  const { company, loading, fetchCompanyData } = useCompany();
  const [activeTab, setActiveTab] = useState("info");
  const [isEditing, setIsEditing] = useState(false);
  
  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  if (!company) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Company Setup</h1>
            <p className="text-gray-500 mt-2">You don't belong to any company yet</p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>No Company Found</CardTitle>
              <CardDescription>
                You need to create or join a company first
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="bg-circa-green hover:bg-circa-green-dark">
                <a href="/company/setup">
                  <Building2 className="mr-2 h-4 w-4" />
                  Create a Company
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }
  
  const handleSave = async () => {
    try {
      await fetchCompanyData();
      toast.success("Company information updated successfully");
    } catch (error) {
      console.error("Error saving company:", error);
      toast.error("Failed to save company information");
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{company?.name}</h1>
            <p className="text-muted-foreground">
              Configure your company information for carbon accounting
            </p>
          </div>
          {activeTab === "info" && (
            <Button 
              type="submit" 
              form="company-form"
              size="sm" 
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" /> Save Changes
            </Button>
          )}
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Company Setup</CardTitle>
            <CardDescription>
              Configure your company profile and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs 
              defaultValue="info"
              value={activeTab} 
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="info" className="flex items-center">
                  <Building2 className="mr-2 h-4 w-4" />
                  Company Info
                </TabsTrigger>
                <TabsTrigger value="team" className="flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  Team Members
                </TabsTrigger>
                <TabsTrigger value="preferences" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  Preferences
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="info">
                <CompanyInfoTab 
                  onSave={handleSave}
                />
              </TabsContent>
              
              <TabsContent value="team">
                <CompanyTeamTab />
              </TabsContent>
              
              <TabsContent value="preferences">
                <CompanyPreferencesTab />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
