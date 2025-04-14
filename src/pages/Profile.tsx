
import { useState } from "react";
import { MainLayout } from "@/components/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, UserRound, Mail, Settings, Key } from "lucide-react";

export default function Profile() {
  const { user, loading, updateProfile } = useAuth();
  const [firstName, setFirstName] = useState(user?.profile?.first_name || "");
  const [lastName, setLastName] = useState(user?.profile?.last_name || "");
  const [updating, setUpdating] = useState(false);
  
  const getInitials = () => {
    if (!user?.profile) return "U";
    return `${user.profile.first_name[0]}${user.profile.last_name[0]}`;
  };
  
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    
    try {
      await updateProfile({
        first_name: firstName,
        last_name: lastName,
      });
    } finally {
      setUpdating(false);
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
              <div className="flex items-center space-x-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-60" />
                </div>
              </div>
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
          <h1 className="text-3xl font-bold">Your Profile</h1>
          <p className="text-gray-500 mt-2">Manage your account information and preferences</p>
        </div>
        
        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile" className="flex items-center">
              <UserRound className="mr-2 h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center">
              <Key className="mr-2 h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              Preferences
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <form onSubmit={handleUpdateProfile}>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="text-xl bg-circa-green text-white">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <h3 className="font-medium">
                        {user?.profile?.first_name} {user?.profile?.last_name}
                      </h3>
                      <p className="text-sm text-gray-500 flex items-center mt-1">
                        <Mail className="h-4 w-4 mr-1" />
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500">
                      To change your email address, please contact support
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="bg-circa-green hover:bg-circa-green-dark" disabled={updating}>
                    {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </CardFooter>
              </form>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Communication Preferences</CardTitle>
                <CardDescription>Manage how we communicate with you</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">
                  Email preference settings will be available in the full version.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your password and security preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">
                  Password change and security settings will be available in the full version.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="preferences" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Application Preferences</CardTitle>
                <CardDescription>Customize your application experience</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">
                  Application preferences will be available in the full version.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
