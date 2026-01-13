import { prisma } from "@/lib/prisma";
import { AddMemberForm } from "./add-member-form";
import { removeTeamMember } from "./actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, UserCog, Trash2, Mail } from "lucide-react";
import { canAccess, getAdminRole } from "@/config/admin";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
    const session = await auth();
    // @ts-ignore
    const role = session?.user?.role || getAdminRole(session?.user?.email);

    // Only SUPER_ADMIN (or at least ADMIN) can access Team page
    if (role !== 'ADMIN' && role !== 'super_admin' && role !== 'admin') {
        // logic to check access. 'team' resource is restricted to Super Admin in config
        // Let's rely on config
        if (!canAccess(role as any, 'team')) {
            redirect('/admin');
        }
    }

    // Fetch team members
    // @ts-ignore
    const teamMembers = await prisma.user.findMany({
        where: {
            // @ts-ignore
            role: {
                in: ['ADMIN', 'STAFF']
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <UserCog className="w-8 h-8 text-primary" />
                        Team Management
                    </h1>
                    <p className="text-slate-400">Manage administrators and staff members</p>
                </div>
            </div>

            <AddMemberForm />

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-950 text-slate-400 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4 font-medium">Member</th>
                                <th className="px-6 py-4 font-medium">Role</th>
                                <th className="px-6 py-4 font-medium">Joined</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {teamMembers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                        No team members found (System Admins might effectively be here via config)
                                    </td>
                                </tr>
                            ) : (
                                teamMembers.map((member: any) => (
                                    <tr key={member.id} className="hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
                                                    {member.image ? (
                                                        <img src={member.image} alt={member.name || "User"} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Shield className="w-4 h-4 text-slate-500" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white">{member.name || "No Name"}</p>
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                        <Mail className="w-3 h-3" />
                                                        {member.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {member.role === 'ADMIN' ? (
                                                <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20">
                                                    Administrator
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20">
                                                    Staff
                                                </Badge>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-slate-400">
                                            {new Date(member.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <form action={async () => {
                                                'use server';
                                                await removeTeamMember(member.email);
                                            }}>
                                                <Button type="submit" variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-900/20 h-8 w-8 p-0">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </form>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
