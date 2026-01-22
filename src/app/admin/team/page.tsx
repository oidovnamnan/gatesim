import { prisma } from "@/lib/prisma";
import { AddMemberDialog } from "./add-member-dialog";
import { TeamTable } from "./team-table";
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
    const userEmail = session?.user?.email;
    const role = getAdminRole(userEmail);

    // Only SUPER_ADMIN can access Team page
    if (role !== 'super_admin') {
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
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1 w-full text-center md:text-left">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center justify-center md:justify-start gap-2">
                        <UserCog className="w-8 h-8 text-primary" />
                        Team Management
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage administrators and staff members</p>
                </div>
                <div className="w-full md:w-auto">
                    <AddMemberDialog />
                </div>
            </div>

            <TeamTable members={teamMembers} currentUserRole={role || ''} />
        </div>
    );
}
