"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Package, Smartphone, Home, Moon, Sun } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { useTheme } from "@/providers/theme-provider";
import { Button } from "@/components/ui/button";
import { LoginModal } from "@/components/auth/login-modal";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
    { href: "/", label: "Нүүр", icon: Home },
    { href: "/packages", label: "Багцууд", icon: Package },
    { href: "/my-esims", label: "Миний eSIM", icon: Smartphone },
];

export function TopHeader() {
    const { user } = useAuth();
    const { mode, toggleMode } = useTheme();
    const pathname = usePathname();
    const [loginOpen, setLoginOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between bg-white/80 backdrop-blur-lg border-b border-slate-200/50 shadow-sm">
            {/* Logo */}
            <Link href="/" className="pointer-events-auto group flex-shrink-0">
                <div className="flex flex-col">
                    <span className="font-black text-2xl text-slate-900 tracking-tight group-hover:text-slate-700 transition-colors">
                        Gate<span className="text-red-600">SIM</span>
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 tracking-[0.2em] uppercase -mt-1 ml-0.5">
                        eSIM Platform
                    </span>
                </div>
            </Link>

            {/* Desktop Navigation - Center */}
            <nav className="hidden md:flex items-center gap-1 bg-white/60 backdrop-blur-md rounded-full px-2 py-1.5 border border-slate-200/50 shadow-sm">
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
                                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            )}
                        >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Right Side: Theme Toggle + Auth */}
            <div className="flex items-center gap-3 flex-shrink-0">
                {/* Theme Toggle */}
                <button
                    onClick={toggleMode}
                    className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                    aria-label={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                >
                    {mode === "dark" ? (
                        <Sun className="w-5 h-5 text-amber-500" />
                    ) : (
                        <Moon className="w-5 h-5 text-slate-600" />
                    )}
                </button>

                {user ? (
                    <Link href="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="flex flex-col items-end mr-1">
                            <span className="text-[10px] text-slate-400 font-medium">Сайн байна уу</span>
                            <span className="text-sm font-bold text-slate-800 leading-none">{user.displayName || user.email?.split('@')[0]}</span>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border-2 border-red-500/20 shadow-sm">
                            {user.photoURL ? (
                                <img src={user.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <User className="h-5 w-5 text-slate-500" />
                            )}
                        </div>
                    </Link>
                ) : (
                    <Button
                        size="sm"
                        onClick={() => setLoginOpen(true)}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold shadow-md shadow-red-500/20 rounded-full px-5"
                    >
                        Нэвтрэх
                    </Button>
                )}
            </div>

            <LoginModal
                isOpen={loginOpen}
                onClose={() => setLoginOpen(false)}
            />
        </header>
    );
}
