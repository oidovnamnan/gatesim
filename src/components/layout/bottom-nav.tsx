"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Globe, CreditCard, User } from "lucide-react";
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
    if (pathname?.startsWith("/admin") || pathname?.startsWith("/package/") || pathname?.startsWith("/checkout") || pathname === "/profile") {
        return null;
    }

    const isActive = (path: string) => pathname === path;

    const { t } = useTranslation();
    const navItems = [
        { label: t("home"), icon: Home, href: "/", active: isActive("/") },
        { label: t("packages"), icon: Globe, href: "/packages", active: isActive("/packages") || pathname?.startsWith("/package/") },
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
            <div className="fixed bottom-0 left-0 right-0 z-40 px-6 pb-8 pt-4 pointer-events-none md:hidden text-center [body.ai-chat-open_&]:hidden [body.modal-open_&]:hidden">
                {/* Ultra Glass Bottom Nav */}
                <nav className="inline-block bg-white/85 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-[28px] shadow-xl shadow-slate-900/10 pointer-events-auto overflow-hidden">
                    <div className="flex items-center justify-between px-2 py-2 relative gap-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={(e) => item.requiresAuth && handleProtectedNav(e, item.href)}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-1 w-16 h-14 rounded-2xl transition-all duration-300 relative",
                                    item.active
                                        ? "text-red-600 bg-red-50 dark:bg-red-900/30 shadow-inner border border-red-100 dark:border-red-800/30"
                                        : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-white/10"
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        "h-6 w-6 stroke-[2]",
                                        item.active ? "fill-red-600/10" : "fill-transparent"
                                    )}
                                />
                                <span className="text-[10px] font-bold mt-0.5">{item.label}</span>

                            </Link>
                        ))}
                    </div>
                </nav>
            </div>
            <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
        </>
    );
}
