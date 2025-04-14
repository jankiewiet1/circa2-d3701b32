
import { useState } from "react";
import { MainLayout } from "@/components/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useCompany } from "@/contexts/CompanyContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Mail, UserPlus, Users, Trash2, Building2, PencilLine } from "lucide-react";
import { UserRole } from "@/types";
import { Badge } from "@/components/ui/badge";

export default function CompanyManage() {
  const { user } = useAuth();
  const { company, userRole, companyMembers, loading, updateCompany, inviteMember, updateMemberRole, removeMember } = useCompany();
  const [isEditing, setIsEditing] = useState(false);
  const [companyName, setCompanyName] = useState(company?.name || "");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<UserRole>("viewer");
  const [inviting, setInviting] = useState(false);
  const [updating, setUpdating] = useState(false);
  
  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="space-y-2">
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
        <div className="max-w-3xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Company Management</h1>
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
  
  const handleUpdateCompany = async () => {
    if (!isEditing || companyName === company.name) {
      setIsEditing(false);
      return;
    }
    
    setUpdating(true);
    
    try {
      const { error } = await updateCompany({ name: companyName });
      
      if (!error) {
        setIsEditing(false);
      }
    } finally {
      setUpdating(false);
    }
  };
  
  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteEmail || !inviteRole) return;
    
    setInviting(true);
    
    try {
      await inviteMember(inviteEmail, inviteRole);
      setInviteEmail("");
      setInviteRole("viewer");
    } finally {
      setInviting(false);
    }
  };
  
  const handleRoleChange = async (memberId: string, role: UserRole) => {
    await updateMemberRole(memberId, role);
  };
  
  return (
    <MainLayout>
      <div className="max-w-5xl">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold flex items-center">
              <Building2 className="mr-2 h-6 w-6" />
              {isEditing ? (
                <Input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="text-3xl font-bold h-auto py-1 max-w-xs"
                />
              ) : (
                company.name
              )}
            </h1>
            
            {userRole === "admin" && (
              <div className="flex space-x-2">
                {isEditing ? (
                  <Button
                    onClick={handleUpdateCompany}
                    disabled={updating}
                    className="bg-circa-green hover:bg-circa-green-dark"
                  >
                    {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                ) : (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                  >
                    <PencilLine className="mr-2 h-4 w-4" />
                    Edit Company
                  </Button>
                )}
              </div>
            )}
          </div>
          <p className="text-gray-500 mt-2">
            <span className="capitalize">{company.industry}</span> industry · Created on {new Date(company.created_at).toLocaleDateString()}
          </p>
        </div>
        
        <Tabs defaultValue="team">
          <TabsList>
            <TabsTrigger value="team" className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              Team Management
            </TabsTrigger>
            <TabsTrigger value="settings">Company Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="team" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
                  Manage users who have access to {company.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {companyMembers.map((member) => {
                    const isCurrentUser = member.user_id === user?.id;
                    const isAdmin = member.role === "admin";
                    const canModify = userRole === "admin" && !isCurrentUser;
                    
                    return (
                      <div key={member.id} className="flex items-center justify-between border-b pb-4">
                        <div>
                          <div className="font-medium">
                            {isCurrentUser ? (
                              <span>
                                {user.profile?.first_name} {user.profile?.last_name} <Badge variant="outline">You</Badge>
                              </span>
                            ) : (
                              <span>User {member.user_id.slice(0, 6)}...</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {isAdmin ? "Administrator" : member.role === "editor" ? "Editor" : "Viewer"}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {canModify ? (
                            <>
                              <Select
                                value={member.role}
                                onValueChange={(value) => handleRoleChange(member.id, value as UserRole)}
                              >
                                <SelectTrigger className="w-[120px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="admin">Admin</SelectItem>
                                  <SelectItem value="editor">Editor</SelectItem>
                                  <SelectItem value="viewer">Viewer</SelectItem>
                                </SelectContent>
                              </Select>
                              
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => removeMember(member.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <Badge>
                              {member.role === "admin" ? "Admin" : member.role === "editor" ? "Editor" : "Viewer"}
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {userRole === "admin" && (
                  <Card className="bg-gray-50">
                    <CardHeader>
                      <CardTitle className="text-base">Invite Team Member</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleInviteMember} className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
                        <div className="flex-1 space-y-1">
                          <Label htmlFor="email" className="sr-only">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="email"
                              type="email"
                              placeholder="Email address"
                              className="pl-10"
                              value={inviteEmail}
                              onChange={(e) => setInviteEmail(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        <div className="w-full md:w-[140px]">
                          <Select value={inviteRole} onValueChange={(value) => setInviteRole(value as UserRole)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="editor">Editor</SelectItem>
                              <SelectItem value="viewer">Viewer</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button type="submit" disabled={inviting}>
                          {inviting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <UserPlus className="mr-2 h-4 w-4" />
                              Invite
                            </>
                          )}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Role Permissions</CardTitle>
                <CardDescription>
                  Learn about different access levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-4 font-medium border-b pb-2">
                    <div>Role</div>
                    <div>Data Access</div>
                    <div>Edit Rights</div>
                    <div>Admin Rights</div>
                  </div>
                  
                  <div className="grid grid-cols-4 items-start border-b pb-4">
                    <div className="font-medium">Admin</div>
                    <div>Full access to all data</div>
                    <div>Can edit all company data</div>
                    <div>Full admin rights, can manage users</div>
                  </div>
                  
                  <div className="grid grid-cols-4 items-start border-b pb-4">
                    <div className="font-medium">Editor</div>
                    <div>Full access to all data</div>
                    <div>Can edit emissions data</div>
                    <div>No admin rights</div>
                  </div>
                  
                  <div className="grid grid-cols-4 items-start">
                    <div className="font-medium">Viewer</div>
                    <div>Read-only access to data</div>
                    <div>No edit rights</div>
                    <div>No admin rights</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Settings</CardTitle>
                <CardDescription>
                  Configure your company's settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-gray-500">Company settings will be available in the full version.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
