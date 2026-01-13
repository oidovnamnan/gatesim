"use client";

import { useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { LogOut, User as UserIcon, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/providers/language-provider";

export function AuthButton() {
    const { user, loading, signOut } = useAuth();
    const { t } = useTranslation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const router = useRouter();

    if (loading) {
        return (
            <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse" />
        );
    }

    if (!user) {
        return (
            <Button
                variant="ghost"
                className="text-white hover:bg-white/10"
                onClick={() => router.push("/profile")}
            >
                {t("login")}
            </Button>
        );
    }

    return (
        <div className="relative z-50">
            {/* Avatar / Trigger */}
            <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 p-0.5"
            >
                <div className="w-full h-full rounded-full overflow-hidden bg-black flex items-center justify-center">
                    {user.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName || "User"} className="w-full h-full object-cover" />
                    ) : (
                        <span className="font-bold text-white text-sm">
                            {(user.displayName || user.email || "U")?.[0]?.toUpperCase()}
                        </span>
                    )}
                </div>
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsMenuOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-2 w-56 rounded-xl bg-[#11141d] border border-white/10 shadow-xl overflow-hidden py-1 z-50"
                        >
                            <div className="px-4 py-3 border-b border-white/5">
                                <p className="text-sm font-medium text-white truncate">
                                    {user.displayName || t("user")}
                                </p>
                                <p className="text-xs text-white/50 truncate">
                                    {user.email}
                                </p>
                            </div>

                            <div className="p-1">
                                <button
                                    onClick={() => router.push("/profile")}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/5 rounded-lg transition-colors text-left"
                                >
                                    <UserIcon className="w-4 h-4" />
                                    {t("myProfile")}
                                </button>
                                <button
                                    onClick={() => router.push("/my-esims")}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/5 rounded-lg transition-colors text-left"
                                >
                                    <Package className="w-4 h-4" />
                                    {t("myEsims")}
                                </button>
                            </div>

                            <div className="border-t border-white/5 p-1 mt-1">
                                <button
                                    onClick={() => {
                                        signOut();
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-left"
                                >
                                    <LogOut className="w-4 h-4" />
                                    {t("logout")}
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
