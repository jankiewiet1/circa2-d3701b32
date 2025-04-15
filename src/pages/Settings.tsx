import { MainLayout } from "@/components/MainLayout";
import { useCompany } from "@/contexts/CompanyContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNotificationSettings } from "@/hooks/useNotificationSettings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, Globe, PieChart, Shield } from "lucide-react";

export default function Settings() {
  const { loading: companyLoading, userRole } = useCompany();
  const { user } = useAuth();
  const { settings, loading: settingsLoading, updateSettings } = useNotificationSettings(user?.id);
  const isAdmin = userRole === 'admin';
  
  const loading = companyLoading || settingsLoading;

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-3xl space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="max-w-3xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-gray-500 mt-2">Manage application settings and preferences</p>
        </div>
        
        <Tabs defaultValue="notifications">
          <TabsList>
            <TabsTrigger value="notifications" className="flex items-center">
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="display" className="flex items-center">
              <Globe className="mr-2 h-4 w-4" />
              Display
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center">
              <PieChart className="mr-2 h-4 w-4" />
              Reports
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="admin" className="flex items-center">
                <Shield className="mr-2 h-4 w-4" />
                Admin
              </TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="notifications" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Control when and how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="emission-updates" className="flex flex-col space-y-1">
                      <span>Upload Alerts</span>
                      <span className="font-normal text-sm text-gray-500">Get notified when new data is uploaded</span>
                    </Label>
                    <Switch 
                      id="upload-alerts"
                      checked={settings?.receive_upload_alerts}
                      onCheckedChange={(checked) => updateSettings({ receive_upload_alerts: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="deadline-notifications" className="flex flex-col space-y-1">
                      <span>Deadline Notifications</span>
                      <span className="font-normal text-sm text-gray-500">Get notified about upcoming deadlines</span>
                    </Label>
                    <Switch 
                      id="deadline-notifications"
                      checked={settings?.receive_deadline_notifications}
                      onCheckedChange={(checked) => updateSettings({ receive_deadline_notifications: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="newsletter" className="flex flex-col space-y-1">
                      <span>Newsletter</span>
                      <span className="font-normal text-sm text-gray-500">Receive our newsletter with updates and tips</span>
                    </Label>
                    <Switch 
                      id="newsletter"
                      checked={settings?.receive_newsletter}
                      onCheckedChange={(checked) => updateSettings({ receive_newsletter: checked })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Email Frequency</CardTitle>
                <CardDescription>Set how often you receive email notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-gray-500" />
                    <div className="text-sm text-gray-500">
                      Email frequency settings will be available in the full version.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="display" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Display Settings</CardTitle>
                <CardDescription>Customize how the application looks</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">
                  Display and theme settings will be available in the full version.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reports" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Report Settings</CardTitle>
                <CardDescription>Configure your reporting preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">
                  Report settings will be available in the full version.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          {isAdmin && (
            <TabsContent value="admin" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Administrative Settings</CardTitle>
                  <CardDescription>Manage company-wide settings (admin only)</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">
                    Administrative settings will be available in the full version.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </MainLayout>
  );
}
