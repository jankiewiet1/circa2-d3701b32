
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useCompany } from "@/contexts/CompanyContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, ArrowRight, Loader2, Mail, Plus, Save, Trash2 } from "lucide-react";
import { UserRole } from "@/types";

const inviteSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  role: z.enum(["admin", "editor", "viewer"] as const),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

interface CompanyTeamTabProps {
  setActiveTab: (tab: string) => void;
}

export default function CompanyTeamTab({ setActiveTab }: CompanyTeamTabProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { company, companyMembers, inviteMember, updateMemberRole, removeMember } = useCompany();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);
  
  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
      role: "viewer",
    },
  });

  const onSubmit = async (data: InviteFormValues) => {
    if (!company) {
      toast({
        title: "Error",
        description: "You need to create a company first",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await inviteMember(data.email, data.role);
      
      toast({
        title: "Invitation Sent",
        description: `An invitation has been sent to ${data.email}`,
      });
      
      form.reset();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "There was a problem sending the invitation",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleRoleChange = async (memberId: string, role: UserRole) => {
    try {
      await updateMemberRole(memberId, role);
      
      toast({
        title: "Role Updated",
        description: "Member role has been updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "There was a problem updating the role",
        variant: "destructive",
      });
    }
  };
  
  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    
    try {
      await removeMember(memberToRemove);
      
      toast({
        title: "Member Removed",
        description: "Team member has been removed successfully",
      });
      
      setMemberToRemove(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "There was a problem removing the member",
        variant: "destructive",
      });
    }
  };
  
  const saveAndContinue = () => {
    toast({
      title: "Team Setup Saved",
      description: "Your team setup has been saved",
    });
    setActiveTab("preferences");
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Team Members</h3>
        <p className="text-sm text-muted-foreground">
          Invite team members and manage their access levels
        </p>
      </div>
      
      <div className="space-y-4">
        <h4 className="text-md font-medium">Current Members</h4>
        
        {companyMembers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No members yet. Add team members below.</p>
        ) : (
          <div className="space-y-2">
            {companyMembers.map((member) => {
              const isCurrentUser = member.user_id === user?.id;
              
              return (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-md">
                  <div>
                    <div className="font-medium flex items-center">
                      {isCurrentUser ? (
                        <>
                          {user?.profile?.first_name} {user?.profile?.last_name}
                          <Badge variant="outline" className="ml-2">You</Badge>
                        </>
                      ) : (
                        <span>User ID: {member.user_id?.slice(0, 6)}...</span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Role: {member.role === "admin" ? "Administrator" : 
                            member.role === "editor" ? "Editor" : "Viewer"}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {!isCurrentUser && (
                      <>
                        <Select
                          value={member.role || "viewer"}
                          onValueChange={(value) => handleRoleChange(member.id, value as UserRole)}
                        >
                          <SelectTrigger className="w-[110px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="editor">Editor</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => setMemberToRemove(member.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. The user will lose access to the company data.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setMemberToRemove(null)}>
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction 
                                className="bg-destructive hover:bg-destructive/90"
                                onClick={handleRemoveMember}
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      <div className="border-t pt-4">
        <h4 className="text-md font-medium mb-4">Invite New Members</h4>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
              <div className="flex-1">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input className="pl-10" placeholder="colleague@example.com" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="w-full md:w-[180px]">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex items-end">
                <Button 
                  type="submit" 
                  className="w-full md:w-auto"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  Invite Member
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
      
      <div className="border-t pt-6 flex justify-between">
        <Button 
          variant="outline"
          onClick={() => setActiveTab("info")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous Step
        </Button>
        
        <div className="space-x-4">
          <Button 
            className="bg-circa-green hover:bg-circa-green-dark"
            onClick={saveAndContinue}
          >
            <Save className="mr-2 h-4 w-4" />
            Save and Continue
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => setActiveTab("preferences")}
          >
            Next Step
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
