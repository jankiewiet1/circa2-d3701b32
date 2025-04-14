
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Loader2, Plus, Save, Trash2, UserPlus } from "lucide-react";
import { CompanyMember, UserRole } from "@/types";

const userRoles: { value: UserRole; label: string }[] = [
  { value: "admin", label: "Administrator" },
  { value: "editor", label: "Editor" },
  { value: "viewer", label: "Viewer" },
];

const inviteFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "editor", "viewer"] as const),
});

type InviteFormValues = z.infer<typeof inviteFormSchema>;

export default function CompanyTeamTab() {
  const { toast } = useToast();
  const { companyMembers, inviteMember, updateMemberRole, removeMember } = useCompany();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<CompanyMember | null>(null);
  const [memberToEdit, setMemberToEdit] = useState<CompanyMember | null>(null);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  
  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      email: "",
      role: "viewer",
    },
  });

  const onInviteMember = async (data: InviteFormValues) => {
    setIsSubmitting(true);
    
    try {
      await inviteMember(data.email, data.role);
      form.reset();
      setIsInviteOpen(false);
      toast({
        title: "Invitation Sent",
        description: `An invitation has been sent to ${data.email}`,
      });
    } catch (error) {
      console.error("Error inviting member:", error);
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: UserRole) => {
    setIsUpdatingRole(true);
    
    try {
      // Check if this would remove the last admin
      if (newRole !== "admin") {
        const adminCount = companyMembers.filter(m => m.role === "admin" && m.id !== memberId).length;
        if (adminCount === 0) {
          toast({
            title: "Error",
            description: "Cannot remove the last admin",
            variant: "destructive",
          });
          return;
        }
      }
      
      await updateMemberRole(memberId, newRole);
      toast({
        title: "Success",
        description: "Member role has been updated",
      });
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Error",
        description: "Failed to update member role",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      // Check if this would remove the last admin
      const memberToBeRemoved = companyMembers.find(m => m.id === memberId);
      if (memberToBeRemoved?.role === "admin") {
        const adminCount = companyMembers.filter(m => m.role === "admin").length;
        if (adminCount <= 1) {
          toast({
            title: "Error",
            description: "Cannot remove the last admin",
            variant: "destructive",
          });
          return;
        }
      }
      
      await removeMember(memberId);
      setMemberToRemove(null);
      toast({
        title: "Success",
        description: "Team member has been removed",
      });
    } catch (error) {
      console.error("Error removing member:", error);
      toast({
        title: "Error",
        description: "Failed to remove team member",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Team Members</h3>
        <p className="text-sm text-muted-foreground">
          Manage users who have access to your company's carbon accounting
        </p>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companyMembers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                No team members added yet
              </TableCell>
            </TableRow>
          ) : (
            companyMembers.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">{member.user_id}</TableCell>
                <TableCell>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                    member.role === 'admin' ? 'bg-blue-100 text-blue-800' : 
                    member.role === 'editor' ? 'bg-green-100 text-green-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {member.role === 'admin' ? 'Administrator' : 
                    member.role === 'editor' ? 'Editor' : 'Viewer'}
                  </span>
                </TableCell>
                <TableCell>Active</TableCell>
                <TableCell className="text-right space-x-2">
                  <Select 
                    value={member.role} 
                    onValueChange={(value) => handleUpdateRole(member.id, value as UserRole)}
                    disabled={isUpdatingRole}
                  >
                    <SelectTrigger className="w-[120px] inline-flex">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {userRoles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-red-500 border-red-200 hover:bg-red-50"
                        onClick={() => setMemberToRemove(member)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to remove this team member? 
                          They will lose all access to your company's carbon accounting data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-500 hover:bg-red-600"
                          onClick={() => memberToRemove && handleRemoveMember(memberToRemove.id)}
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="flex justify-between">
        <div className="space-y-1">
          <h4 className="text-sm font-medium">Role Permissions</h4>
          <p className="text-xs text-muted-foreground">A brief explanation of each role's permissions</p>
        </div>
        
        <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
          <DialogTrigger asChild>
            <Button className="bg-circa-green hover:bg-circa-green-dark">
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>
                Send an invitation to a colleague to join your carbon accounting team
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onInviteMember)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="colleague@company.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
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
                          {userRoles.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button
                    type="submit"
                    className="bg-circa-green hover:bg-circa-green-dark"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Send Invitation
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="space-y-2 border rounded-md p-4">
        <div className="grid grid-cols-4 font-medium border-b pb-2">
          <div>Role</div>
          <div>Data Access</div>
          <div>Edit Rights</div>
          <div>Admin Rights</div>
        </div>
        
        <div className="grid grid-cols-4 items-start border-b py-2">
          <div className="font-medium">Admin</div>
          <div>Full access</div>
          <div>Full edit rights</div>
          <div>Can manage users</div>
        </div>
        
        <div className="grid grid-cols-4 items-start border-b py-2">
          <div className="font-medium">Editor</div>
          <div>Full access</div>
          <div>Can edit data</div>
          <div>No admin rights</div>
        </div>
        
        <div className="grid grid-cols-4 items-start py-2">
          <div className="font-medium">Viewer</div>
          <div>Read-only</div>
          <div>No edit rights</div>
          <div>No admin rights</div>
        </div>
      </div>
    </div>
  );
}
