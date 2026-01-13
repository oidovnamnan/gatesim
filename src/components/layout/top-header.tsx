"use client";

import { Logo } from "@/components/ui/logo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Package, Smartphone, Home, Moon, Sun } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { useTheme } from "@/providers/theme-provider";
import { Button } from "@/components/ui/button";
import { LoginModal } from "@/components/auth/login-modal";
import { useState } from "react";
import { cn } from "@/lib/utils";

import { LanguageSwitcher } from "./language-switcher";
import { useTranslation } from "@/providers/language-provider";

export function TopHeader() {
    const { user } = useAuth();
    const { mode } = useTheme();
    const { t } = useTranslation();
    const pathname = usePathname();
    const [loginOpen, setLoginOpen] = useState(false);

    const navItems = [
        { href: "/", label: t("home"), icon: Home },
        { href: "/packages", label: t("packages"), icon: Package },
        { href: "/my-esims", label: t("myEsims"), icon: Smartphone },
    ];

    return (
        <header className="header-bg sticky top-0 z-50 px-6 py-4 flex items-center justify-between backdrop-blur-lg border-b shadow-sm transition-colors duration-300">
            {/* Logo */}
            <Link href="/" className="pointer-events-auto group flex-shrink-0 flex items-center gap-3">
                <div className="w-10 h-10 relative flex items-center justify-center">
                    <Logo className="w-full h-full" />
                </div>
                <div className="flex flex-col">
                    <span className="header-text font-black text-2xl tracking-tight transition-colors">
                        Gate<span className="text-red-600">SIM</span>
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 tracking-[0.2em] uppercase -mt-1 ml-0.5 hidden md:block">
                        {t("eSimPlatform")}
                    </span>
                </div>
            </Link>

            {/* Desktop Navigation - Center */}
            <nav className="hidden md:flex items-center gap-1 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-full px-2 py-1.5 border border-slate-200/50 dark:border-white/10 shadow-sm transition-colors duration-300">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all",
                                isActive
                                    ? "bg-red-600 text-white shadow-md shadow-red-500/20"
                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                            )}
                        >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Right Side: Language Switcher + Auth */}
            <div className="flex items-center gap-3 flex-shrink-0">
                {/* Language Switcher */}
                <LanguageSwitcher />

                {/* Auth/Profile - DESKTOP ONLY */}
                <div className="hidden md:flex items-center gap-3">
                    {user ? (
                        <Link href="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                            <div className="flex flex-col items-end mr-1">
                                <span className="text-[10px] text-slate-400 font-medium">{t("greeting")}</span>
                                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-none">{user.displayName || user.email?.split('@')[0]}</span>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-red-500/20 shadow-sm">
                                {user.photoURL ? (
                                    <img src={user.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <User className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                                )}
                            </div>
                        </Link>
                    ) : (
                        <Link href="/profile">
                            <Button
                                size="sm"
                                className="bg-red-600 hover:bg-red-700 text-white font-bold shadow-md shadow-red-500/20 rounded-full px-5"
                            >
                                {t("login")}
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            <LoginModal
                isOpen={loginOpen}
                onClose={() => setLoginOpen(false)}
            />
        </header>
    );
}
