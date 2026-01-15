"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { getAdminRole, canAccess, AdminRole } from "@/config/admin";
import {
    LayoutDashboard,
    Users,
    ShoppingCart,
    Bot,
    Settings,
    LogOut,
    UserCog,
    Shield,
    Package
} from "lucide-react";

const sidebarItems = [
    {
        title: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
        resource: null,
    },
    {
        title: "Team",
        href: "/admin/team",
        icon: UserCog,
        resource: 'team' as const,
    },
    {
        title: "Users",
        href: "/admin/users",
        icon: Users,
        resource: 'users' as const,
    },
    {
        title: "Orders",
        href: "/admin/orders",
        icon: ShoppingCart,
        resource: null,
    },
    {
        title: "Packages",
        href: "/admin/packages",
        icon: Package,
        resource: null,
    },
    {
        title: "AI Control",
        href: "/admin/ai",
        icon: Bot,
        resource: 'ai' as const,
    },
    {
        title: "Settings",
        href: "/admin/settings",
        icon: Settings,
        resource: 'settings' as const,
    },
];

interface AdminSidebarProps {
    className?: string;
}

export function AdminSidebar({ className }: AdminSidebarProps) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const userEmail = session?.user?.email;
    const role = getAdminRole(userEmail);

    return (
        <div className={cn("flex flex-col h-full w-64 bg-slate-900 text-white border-r border-slate-800", className)}>
            {/* Logo Area */}
            <div className="h-16 flex items-center px-6 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center font-bold text-primary-foreground">
                        G
                    </div>
                    <span className="text-xl font-bold text-white">GateSIM</span>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 py-6 px-3 space-y-1">
                {sidebarItems.map((item) => {
                    // Filter items based on role
                    if (item.resource && !canAccess(role, item.resource)) {
                        return null;
                    }

                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                                isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-white/60 hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-500 group-hover:text-white")} />
                            {item.title}
                        </Link>
                    );
                })}
            </div>

            {/* Footer / User Info */}
            <div className="p-4 border-t border-white/10">
                <Link href="/admin/profile">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden ring-2 ring-transparent group-hover:ring-primary/50 transition-all">
                            {session?.user?.image ? (
                                <img src={session.user.image} alt="User" className="w-full h-full object-cover" />
                            ) : (
                                <Shield className="w-5 h-5 text-emerald-400" />
                            )}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">
                                {session?.user?.name || "Admin"}
                            </p>
                            <p className="text-xs text-slate-500 truncate" title={userEmail || ""}>
                                {role === 'super_admin' ? 'Super Admin' : 'Staff'}
                            </p>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}
