
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RecentActivities } from "@/components/activity/RecentActivities";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { UserRole } from "@/types";
import { toast } from "@/components/ui/use-toast";
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

const userRoles: { value: UserRole; label: string }[] = [
  { value: "admin", label: "Admin" },
  { value: "editor", label: "Editor" },
  { value: "viewer", label: "Viewer" },
];

const inviteFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "editor", "viewer"] as const),
});

type InviteFormValues = z.infer<typeof inviteFormSchema>;

export default function CompanyTeamTab() {
  const { companyMembers, inviteMember, updateMemberRole, removeMember } = useCompany();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const result = await inviteMember(data.email, data.role);
      
      if (result.error) {
        toast({
          title: "Invitation Failed",
          description: result.error.message || "Could not send invitation",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Invitation Sent",
          description: `Invitation sent to ${data.email}`
        });
        form.reset();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-1">Team Members</h3>
        <p className="text-sm text-muted-foreground">
          Manage your team, roles and invitations
        </p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companyMembers.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {member.user_id?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">
                  {member.user_id}
                </TableCell>
                <TableCell>{member.user_id}</TableCell>
                <TableCell>
                  <Select
                    value={member.role || undefined}
                    onValueChange={(value) => updateMemberRole(member.id, value as UserRole)}
                  >
                    <SelectTrigger className="w-[110px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {userRoles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to remove this team member? 
                          They will lose all access to your company's data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => removeMember(member.id)}
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-1">Invite Member</h4>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onInviteMember)} className="flex gap-4 items-end">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="flex-1">
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
                  <FormItem className="w-[200px]">
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
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
              
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Invite
                  </>
                )}
              </Button>
            </form>
          </Form>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-4">Recent Activity</h4>
          <RecentActivities />
        </div>
      </div>
    </div>
  );
}
