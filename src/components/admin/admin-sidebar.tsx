"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    ShoppingCart,
    Bot,
    Settings,
    LogOut,
    Globe2,
    Shield,
    Package // Added Package icon
} from "lucide-react";

const sidebarItems = [
    {
        title: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
    },
    {
        title: "Users",
        href: "/admin/users",
        icon: Users,
    },
    {
        title: "Orders",
        href: "/admin/orders",
        icon: ShoppingCart,
    },
    {
        title: "Packages", // Added Packages menu item
        href: "/admin/packages",
        icon: Package,
    },
    {
        title: "AI Control",
        href: "/admin/ai",
        icon: Bot,
    },
    {
        title: "Settings",
        href: "/admin/settings",
        icon: Settings,
    },
];

export function AdminSidebar() {
    const pathname = usePathname();

    return (
        <div className="flex flex-col h-full w-64 bg-slate-900 text-white border-r border-slate-800">
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
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-bold truncate">Administrator</p>
                        <p className="text-xs text-slate-500 truncate">admin@gatesim.com</p>
                    </div>
                    <LogOut className="w-4 h-4 text-slate-500 hover:text-red-400" />
                </div>
            </div>
        </div>
    );
}
