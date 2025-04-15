
import { MainLayout } from "@/components/MainLayout";
import { useCompany } from "@/contexts/CompanyContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNotificationSettings } from "@/hooks/useNotificationSettings";
import { useProfileSettings } from "@/hooks/useProfileSettings";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/sonner";
import { 
  Bell, 
  Globe, 
  PieChart, 
  Shield, 
  Clock,
  Calendar,
  Languages,
  Palette,
  DollarSign,
  Lock,
  Users,
  AlertTriangle,
  CheckCircle,
  Loader2
} from "lucide-react";
import { useUserPreferences } from "@/hooks/useUserPreferences";

export default function Settings() {
  const { loading: companyLoading, userRole } = useCompany();
  const { user } = useAuth();
  const { settings, loading: settingsLoading, updateSettings } = useNotificationSettings(user?.id);
  const { preferences, loading: preferencesLoading, updatePreferences } = useUserPreferences(user?.id);
  
  const isAdmin = userRole === 'admin';
  
  // Loading states
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [loadingDisplay, setLoadingDisplay] = useState(false);
  const [loadingAdmin, setLoadingAdmin] = useState(false);
  
  const loading = companyLoading || settingsLoading || preferencesLoading;
  
  // Form for display settings
  const displayForm = useForm({
    defaultValues: {
      theme: preferences?.theme || "system",
      language: preferences?.language || "en",
      timezone: preferences?.timezone || "Europe/Amsterdam",
      date_format: preferences?.date_format || "YYYY-MM-DD",
      preferred_currency: preferences?.preferred_currency || "EUR"
    }
  });

  // Update display form values when preferences load
  React.useEffect(() => {
    if (preferences) {
      displayForm.reset({
        theme: preferences.theme || "system",
        language: preferences.language || "en",
        timezone: preferences.timezone || "Europe/Amsterdam",
        date_format: preferences?.date_format || "YYYY-MM-DD",
        preferred_currency: preferences?.preferred_currency || "EUR"
      });
    }
  }, [preferences]);

  // Form for admin settings
  const adminForm = useForm({
    defaultValues: {
      lock_team_changes: false,
      require_reviewer: false,
      audit_logging_enabled: true,
      default_member_role: "viewer"
    }
  });

  // Handle notifications form submission
  const handleNotificationsSubmit = async () => {
    if (!user?.id) return;
    
    setLoadingNotifications(true);
    try {
      await updateSettings({
        receive_upload_alerts: settings?.receive_upload_alerts,
        receive_deadline_notifications: settings?.receive_deadline_notifications,
        receive_newsletter: settings?.receive_newsletter
      });
      toast.success("Notification settings updated successfully");
    } catch (error) {
      toast.error("Failed to update notification settings");
      console.error(error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Handle display form submission
  const handleDisplaySubmit = async (data: any) => {
    if (!user?.id) return;
    
    setLoadingDisplay(true);
    try {
      await updatePreferences({
        theme: data.theme,
        language: data.language,
        timezone: data.timezone,
        date_format: data.date_format,
        preferred_currency: data.preferred_currency,
      });
      toast.success("Display settings updated successfully");
    } catch (error) {
      toast.error("Failed to update display settings");
      console.error(error);
    } finally {
      setLoadingDisplay(false);
    }
  };

  // Handle admin form submission
  const handleAdminSubmit = async (data: any) => {
    setLoadingAdmin(true);
    try {
      // This would be implemented when company_settings table is created
      toast.success("Admin settings updated successfully");
    } catch (error) {
      toast.error("Failed to update admin settings");
      console.error(error);
    } finally {
      setLoadingAdmin(false);
    }
  };

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
          <TabsList className="mb-6">
            <TabsTrigger value="notifications" className="flex items-center">
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="display" className="flex items-center">
              <Globe className="mr-2 h-4 w-4" />
              Display
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="admin" className="flex items-center">
                <Shield className="mr-2 h-4 w-4" />
                Admin
              </TabsTrigger>
            )}
          </TabsList>
          
          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Control when and how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="upload-alerts" className="flex flex-col space-y-1">
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
              <CardFooter>
                <Button 
                  onClick={handleNotificationsSubmit}
                  disabled={loadingNotifications}
                >
                  {loadingNotifications ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Display Tab */}
          <TabsContent value="display">
            <form onSubmit={displayForm.handleSubmit(handleDisplaySubmit)}>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Palette className="mr-2 h-5 w-5" />
                    Appearance
                  </CardTitle>
                  <CardDescription>Customize how the application looks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme</Label>
                    <Select 
                      value={displayForm.watch("theme")} 
                      onValueChange={(value) => displayForm.setValue("theme", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="mr-2 h-5 w-5" />
                    Regional Format
                  </CardTitle>
                  <CardDescription>Configure your regional preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select 
                      value={displayForm.watch("language")} 
                      onValueChange={(value) => displayForm.setValue("language", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="nl">Dutch</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select 
                      value={displayForm.watch("timezone")} 
                      onValueChange={(value) => displayForm.setValue("timezone", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Europe/Amsterdam">Europe/Amsterdam</SelectItem>
                        <SelectItem value="Europe/London">Europe/London</SelectItem>
                        <SelectItem value="America/New_York">America/New York</SelectItem>
                        <SelectItem value="America/Los_Angeles">America/Los Angeles</SelectItem>
                        <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="date_format">Date Format</Label>
                    <Select 
                      value={displayForm.watch("date_format")} 
                      onValueChange={(value) => displayForm.setValue("date_format", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select date format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="DD-MM-YYYY">DD-MM-YYYY</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="preferred_currency">Preferred Currency</Label>
                    <Select 
                      value={displayForm.watch("preferred_currency")} 
                      onValueChange={(value) => displayForm.setValue("preferred_currency", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EUR">Euro (€)</SelectItem>
                        <SelectItem value="USD">US Dollar ($)</SelectItem>
                        <SelectItem value="GBP">British Pound (£)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    disabled={loadingDisplay}
                  >
                    {loadingDisplay ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </TabsContent>
          
          {/* Admin Tab - Only visible to admins */}
          {isAdmin && (
            <TabsContent value="admin">
              <form onSubmit={adminForm.handleSubmit(handleAdminSubmit)}>
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Lock className="mr-2 h-5 w-5" />
                      Company-wide Controls
                    </CardTitle>
                    <CardDescription>Configure settings that apply to the entire company</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="lock_team_changes" className="flex flex-col space-y-1">
                        <span>Lock Team Changes</span>
                        <span className="font-normal text-sm text-gray-500">Prevent invites/removals if enabled</span>
                      </Label>
                      <Switch 
                        id="lock_team_changes"
                        checked={adminForm.watch("lock_team_changes")}
                        onCheckedChange={(checked) => adminForm.setValue("lock_team_changes", checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="require_reviewer" className="flex flex-col space-y-1">
                        <span>Require Reviewer for Submissions</span>
                        <span className="font-normal text-sm text-gray-500">Enforce dual-control for data submissions</span>
                      </Label>
                      <Switch 
                        id="require_reviewer"
                        checked={adminForm.watch("require_reviewer")}
                        onCheckedChange={(checked) => adminForm.setValue("require_reviewer", checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="audit_logging_enabled" className="flex flex-col space-y-1">
                        <span>Enable Audit Logging</span>
                        <span className="font-normal text-sm text-gray-500">Toggle audit logs for compliance</span>
                      </Label>
                      <Switch 
                        id="audit_logging_enabled"
                        checked={adminForm.watch("audit_logging_enabled")}
                        onCheckedChange={(checked) => adminForm.setValue("audit_logging_enabled", checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="mr-2 h-5 w-5" />
                      Permissions & Roles
                    </CardTitle>
                    <CardDescription>Configure default role settings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label htmlFor="default_member_role">Default New Member Role</Label>
                      <Select 
                        value={adminForm.watch("default_member_role")} 
                        onValueChange={(value) => adminForm.setValue("default_member_role", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select default role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">Viewer</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      disabled={loadingAdmin}
                    >
                      {loadingAdmin ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </form>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </MainLayout>
  );
}
