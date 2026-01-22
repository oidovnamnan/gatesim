"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Shield, Mail, MoreHorizontal, UserCog, Trash2, Loader2 } from "lucide-react";
import { removeTeamMember, updateTeamMemberRole } from "./actions";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

// Client component for the table
export function TeamTable({ members, currentUserRole }: { members: any[], currentUserRole: string }) {
    const { toast } = useToast();
    const router = useRouter();
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [deleteMember, setDeleteMember] = useState<any>(null);

    const handleRemove = async () => {
        if (!deleteMember) return;

        setLoadingId(deleteMember.email);
        const res = await removeTeamMember(deleteMember.email);

        if (res.success) {
            toast({ title: "Removed", description: `${deleteMember.email} has been removed from the team.` });
            router.refresh();
        } else {
            toast({ title: "Error", description: "Failed to remove member.", variant: "destructive" });
        }

        setLoadingId(null);
        setDeleteMember(null);
    };

    const handleRoleUpdate = async (email: string, newRole: "ADMIN" | "STAFF") => {
        setLoadingId(email);
        const res = await updateTeamMemberRole(email, newRole);

        if (res.success) {
            toast({ title: "Updated", description: `Role updated to ${newRole}.` });
            router.refresh();
        } else {
            toast({ title: "Error", description: "Failed to update role.", variant: "destructive" });
        }
        setLoadingId(null);
    };

    // Only admins/super_admins can edit
    const canEdit = currentUserRole === 'admin' || currentUserRole === 'super_admin';

    return (
        <div className="border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-white/5 shadow-sm dark:shadow-none">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-sm text-left text-slate-600 dark:text-white/80">
                    <thead className="bg-slate-50 dark:bg-[#11141d] text-slate-700 dark:text-white font-medium border-b border-slate-200 dark:border-white/10">
                        <tr>
                            <th className="px-6 py-4">Member</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Joined</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                        {members.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                    No team members found.
                                </td>
                            </tr>
                        ) : (
                            members.map((member) => (
                                <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                                                {member.image ? (
                                                    <img src={member.image} alt={member.name || "User"} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Shield className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">{member.name || "No Name"}</p>
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                    <Mail className="w-3 h-3" />
                                                    {member.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {member.role === 'ADMIN' ? (
                                            <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-500 hover:bg-amber-500/20 border-amber-500/20">
                                                Administrator
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-500 hover:bg-blue-500/20 border-blue-500/20">
                                                Staff
                                            </Badge>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 dark:text-white/60">
                                        {new Date(member.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {canEdit && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={loadingId === member.email}>
                                                        {loadingId === member.email ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        )}
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => handleRoleUpdate(member.email, member.role === 'ADMIN' ? 'STAFF' : 'ADMIN')}>
                                                        <UserCog className="w-4 h-4 mr-2" />
                                                        {member.role === 'ADMIN' ? 'Demote to Staff' : 'Promote to Admin'}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-red-600" onClick={() => setDeleteMember(member)}>
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Remove Member
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <AlertDialog open={!!deleteMember} onOpenChange={() => setDeleteMember(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will remove <strong>{deleteMember?.email}</strong> from the team. They will lose all admin access immediately.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRemove} className="bg-red-600 hover:bg-red-700">
                            Remove Member
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
