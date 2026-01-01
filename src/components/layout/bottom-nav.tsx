"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Globe, CreditCard, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { useState } from "react";
import { LoginModal } from "@/components/auth/login-modal";

export function BottomNav() {
    const pathname = usePathname();
    const { user } = useAuth();
    const [loginOpen, setLoginOpen] = useState(false);

    // Don't show on admin pages
    if (pathname?.startsWith("/admin")) {
        return null;
    }

    const isActive = (path: string) => pathname === path;

    const navItems = [
        { label: "Нүүр", icon: Home, href: "/", active: isActive("/") },
        { label: "Багцууд", icon: Globe, href: "/packages", active: isActive("/packages") || pathname?.startsWith("/package/") },
        { label: "Миний eSIM", icon: CreditCard, href: "/orders", active: isActive("/orders"), requiresAuth: true },
        { label: "Профайл", icon: User, href: "/profile", active: isActive("/profile"), requiresAuth: true },
    ];

    const handleProtectedNav = (e: React.MouseEvent, href: string) => {
        if (!user && (href === "/orders" || href === "/profile")) {
            e.preventDefault();
            setLoginOpen(true);
        }
    };

    return (
        <>
            <div className="fixed bottom-0 left-0 right-0 z-40 px-6 pb-8 pt-4 pointer-events-none md:hidden text-center [body.ai-chat-open_&]:hidden">
                {/* Ultra Glass Bottom Nav */}
                <nav className="inline-block bg-white/30 backdrop-blur-xl border border-white/40 rounded-[28px] shadow-2xl shadow-red-900/5 pointer-events-auto overflow-hidden ring-1 ring-white/20">
                    <div className="flex items-center justify-between px-2 py-2 relative gap-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={(e) => item.requiresAuth && handleProtectedNav(e, item.href)}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-1 w-16 h-14 rounded-2xl transition-all duration-300 relative",
                                    item.active
                                        ? "text-red-600 bg-white/50 shadow-inner border border-white/40"
                                        : "text-slate-500 hover:text-slate-700 hover:bg-white/20"
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        "h-6 w-6 stroke-[2]",
                                        item.active ? "fill-red-600/10" : "fill-transparent"
                                    )}
                                />
                                {item.active && (
                                    <span className="absolute -bottom-1 w-1 h-1 bg-red-600 rounded-full"></span>
                                )}
                            </Link>
                        ))}
                    </div>
                </nav>
            </div>
            <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
        </>
    );
}
