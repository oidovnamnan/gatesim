"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Globe, CreditCard, User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { useState } from "react";
import { LoginModal } from "@/components/auth/login-modal";
import { useTranslation } from "@/providers/language-provider";

export function BottomNav() {
    const pathname = usePathname();
    const { user } = useAuth();
    const [loginOpen, setLoginOpen] = useState(false);

    // Don't show on admin pages, login, or pages with fixed bottom bars
    if (pathname?.startsWith("/admin") ||
        pathname?.startsWith("/package/") ||
        pathname?.startsWith("/checkout") ||
        pathname?.startsWith("/ai/") ||
        pathname === "/profile") {
        return null;
    }

    const isActive = (path: string) => pathname === path;

    const { t } = useTranslation();
    const navItems = [
        { label: t("home"), icon: Home, href: "/", active: isActive("/") },
        { label: t("packages"), icon: Globe, href: "/packages", active: isActive("/packages") || pathname?.startsWith("/package/") },
        { label: "AI", icon: Sparkles, href: "/ai", active: isActive("/ai") || pathname?.startsWith("/ai/") },
        { label: t("myEsims"), icon: CreditCard, href: "/my-esims", active: isActive("/my-esims"), requiresAuth: true },
        { label: t("profile"), icon: User, href: "/profile", active: isActive("/profile"), requiresAuth: true },
    ];

    const handleProtectedNav = (e: React.MouseEvent, href: string) => {
        if (!user && (href === "/orders")) {
            e.preventDefault();
            setLoginOpen(true);
        }
    };

    return (
        <>
            <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-8 pt-4 pointer-events-none md:hidden [body.ai-chat-open_&]:hidden [body.modal-open_&]:hidden flex justify-center">
                {/* Ultra Glass Bottom Nav */}
                <nav className="w-[calc(100%-24px)] max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-white/10 rounded-[32px] shadow-2xl shadow-slate-900/20 pointer-events-auto overflow-hidden">
                    <div className="flex items-center justify-between px-2 py-2 relative gap-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={(e) => item.requiresAuth && handleProtectedNav(e, item.href)}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-1 flex-1 min-w-0 h-14 rounded-[22px] transition-all duration-300 relative shrink",
                                    item.active
                                        ? "text-red-600 bg-red-50 dark:bg-red-900/30 shadow-inner border border-red-50 dark:border-red-800/20"
                                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5"
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        "h-5 w-5 stroke-[2.5] transition-transform duration-300",
                                        item.active ? "fill-red-600/10 scale-110" : "fill-transparent"
                                    )}
                                />
                                <span className={cn(
                                    "text-[9px] font-black mt-0.5 uppercase tracking-tight text-center truncate w-full px-1",
                                    item.active ? "opacity-100" : "opacity-80"
                                )}>
                                    {item.label}
                                </span>
                            </Link>
                        ))}
                    </div>
                </nav>
            </div>
            <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
        </>
    );
}
