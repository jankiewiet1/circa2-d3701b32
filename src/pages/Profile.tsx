
import { useState } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useProfileSettings } from '@/hooks/useProfileSettings';
import { UserPreferences } from '@/types';
import { 
  UserRound, 
  Lock, 
  Settings, 
  Loader2, 
  Mail, 
  Phone, 
  Briefcase, 
  Building2,
  EyeIcon,
  EyeOffIcon
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';

export default function ProfilePage() {
  const { user } = useAuth();
  const { 
    profile, 
    preferences, 
    loading, 
    updateProfile, 
    updatePreferences,
    changePassword
  } = useProfileSettings(user);

  const [localProfile, setLocalProfile] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    phone_number: profile?.phone_number || '',
    job_title: profile?.job_title || '',
    department: profile?.department || '',
    receive_deadline_notifications: profile?.receive_deadline_notifications || false,
    receive_upload_alerts: profile?.receive_upload_alerts || false,
    receive_newsletter: profile?.receive_newsletter || false,
  });

  // Password change state
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  // Update local profile state when profile data is loaded
  useState(() => {
    if (profile) {
      setLocalProfile({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone_number: profile.phone_number || '',
        job_title: profile.job_title || '',
        department: profile.department || '',
        receive_deadline_notifications: profile.receive_deadline_notifications || false,
        receive_upload_alerts: profile.receive_upload_alerts || false,
        receive_newsletter: profile.receive_newsletter || false,
      });
    }
  });

  const getInitials = () => {
    if (!user?.profile) return 'U';
    return `${user.profile.first_name?.[0] || ''}${user.profile.last_name?.[0] || ''}`;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile(localProfile);
  };

  const handlePreferencesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure theme is one of the allowed values
    const theme = validateTheme(preferences?.theme);
    
    await updatePreferences({
      language: preferences?.language || 'en',
      timezone: preferences?.timezone || 'Europe/Amsterdam',
      theme: theme,
      user_id: user?.id || ''
    });
  };

  // Password change handler
  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsSubmittingPassword(true);
    
    try {
      const { error } = await changePassword(newPassword);
      
      if (error) throw error;
      
      // Reset fields and close dialog on success
      setNewPassword('');
      setConfirmPassword('');
      setIsChangePasswordOpen(false);
    } catch (error) {
      console.error('Error changing password:', error);
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  // Helper function to validate theme
  const validateTheme = (theme?: string | null): UserPreferences['theme'] => {
    if (theme === 'light' || theme === 'dark' || theme === 'system') {
      return theme;
    }
    return 'system'; // Default fallback
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6 p-6">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <UserRound className="h-4 w-4" /> Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="h-4 w-4" /> Security
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Settings className="h-4 w-4" /> Preferences
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="flex items-center space-x-6">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="bg-circa-green text-white text-xl">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <h3 className="text-lg font-semibold">
                        {profile?.first_name} {profile?.last_name}
                      </h3>
                      <p className="text-sm text-gray-500 flex items-center gap-2">
                        <Mail className="h-4 w-4" /> {user?.email}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>First Name</Label>
                      <Input 
                        value={localProfile.first_name} 
                        onChange={(e) => setLocalProfile(prev => ({ 
                          ...prev, 
                          first_name: e.target.value 
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name</Label>
                      <Input 
                        value={localProfile.last_name} 
                        onChange={(e) => setLocalProfile(prev => ({ 
                          ...prev, 
                          last_name: e.target.value 
                        }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Phone className="h-4 w-4" /> Phone Number
                      </Label>
                      <Input 
                        value={localProfile.phone_number} 
                        onChange={(e) => setLocalProfile(prev => ({ 
                          ...prev, 
                          phone_number: e.target.value 
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" /> Job Title
                      </Label>
                      <Input 
                        value={localProfile.job_title} 
                        onChange={(e) => setLocalProfile(prev => ({ 
                          ...prev, 
                          job_title: e.target.value 
                        }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" /> Department
                    </Label>
                    <Input 
                      value={localProfile.department} 
                      onChange={(e) => setLocalProfile(prev => ({ 
                        ...prev, 
                        department: e.target.value 
                      }))}
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Communication Preferences</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="deadline_notifications"
                          checked={localProfile.receive_deadline_notifications}
                          onCheckedChange={(checked) => setLocalProfile(prev => ({
                            ...prev,
                            receive_deadline_notifications: !!checked
                          }))}
                        />
                        <Label htmlFor="deadline_notifications">
                          Receive deadline notifications
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="upload_alerts"
                          checked={localProfile.receive_upload_alerts}
                          onCheckedChange={(checked) => setLocalProfile(prev => ({
                            ...prev,
                            receive_upload_alerts: !!checked
                          }))}
                        />
                        <Label htmlFor="upload_alerts">
                          Receive upload alerts
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="newsletter"
                          checked={localProfile.receive_newsletter}
                          onCheckedChange={(checked) => setLocalProfile(prev => ({
                            ...prev,
                            receive_newsletter: !!checked
                          }))}
                        />
                        <Label htmlFor="newsletter">
                          Receive newsletter
                        </Label>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="w-full">
                    Save Profile Changes
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Account Security</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input 
                      value={user?.email || ''} 
                      disabled 
                      className="bg-gray-100" 
                    />
                  </div>
                  <Button 
                    variant="destructive"
                    onClick={() => setIsChangePasswordOpen(true)}
                  >
                    Change Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>User Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePreferencesSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select 
                      value={preferences?.language || 'en'}
                      onValueChange={(value) => updatePreferences({ language: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select 
                      value={preferences?.timezone || 'Europe/Amsterdam'}
                      onValueChange={(value) => updatePreferences({ timezone: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Europe/Amsterdam">Amsterdam</SelectItem>
                        <SelectItem value="America/New_York">New York</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <Select 
                      value={validateTheme(preferences?.theme)}
                      onValueChange={(value: 'light' | 'dark' | 'system') => updatePreferences({ theme: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="system">System</SelectItem>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full">
                    Save Preferences
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Password Change Dialog */}
      <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your new password below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pr-10"
                />
                <Button 
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pr-10"
                />
                <Button 
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsChangePasswordOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handlePasswordChange}
              disabled={isSubmittingPassword}
            >
              {isSubmittingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
