"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Palette } from "lucide-react";
import { themeList, Theme } from "@/lib/themes";
import { cn } from "@/lib/utils";

// Safe hook that doesn't throw during SSR
function useThemeSafe() {
    const [theme, setThemeState] = useState<string>("ocean");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem("gatesim-theme");
        if (saved && themeList.some(t => t.name === saved)) {
            setThemeState(saved);
        }
    }, []);

    const setTheme = (newTheme: string) => {
        setThemeState(newTheme);
        localStorage.setItem("gatesim-theme", newTheme);

        // Apply theme to document
        const themeData = themeList.find(t => t.name === newTheme);
        if (themeData) {
            const root = document.documentElement;
            root.style.setProperty("--primary", themeData.colors.primaryHsl);
            root.style.setProperty("--accent", themeData.colors.accentHsl);
            root.style.setProperty("--theme-gradient", themeData.colors.gradient);
            root.style.setProperty("--theme-gradient-card", themeData.colors.gradientCard);
            root.style.setProperty("--theme-shadow", themeData.colors.shadow);
            root.setAttribute("data-theme", newTheme);
        }
    };

    return { theme, setTheme, themes: themeList, mounted };
}

interface ThemePickerProps {
    variant?: "grid" | "horizontal";
    showLabel?: boolean;
}

export function ThemePicker({ variant = "grid", showLabel = true }: ThemePickerProps) {
    const { theme: currentTheme, setTheme, themes, mounted } = useThemeSafe();

    // Show skeleton during SSR
    if (!mounted) {
        return (
            <div className={cn(
                variant === "grid" ? "grid grid-cols-3 gap-3" : "flex gap-2 overflow-x-auto no-scrollbar pb-2"
            )}>
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className={cn(
                            "p-3 rounded-2xl bg-white/5 animate-pulse",
                            variant === "horizontal" && "flex-shrink-0 min-w-[80px] h-16"
                        )}
                    >
                        <div className="w-10 h-10 rounded-xl bg-white/10 mx-auto" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className={cn(
            variant === "grid" ? "grid grid-cols-3 gap-3" : "flex gap-2 overflow-x-auto no-scrollbar pb-2"
        )}>
            {themes.map((t: Theme) => {
                const isActive = t.name === currentTheme;

                return (
                    <motion.button
                        key={t.name}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setTheme(t.name)}
                        className={cn(
                            "relative flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all",
                            variant === "horizontal" && "flex-shrink-0 min-w-[80px]",
                            isActive
                                ? "border-white/30 bg-white/10"
                                : "border-white/10 bg-white/5 hover:bg-white/10"
                        )}
                    >
                        {/* Color preview */}
                        <div
                            className="w-10 h-10 rounded-xl shadow-lg"
                            style={{ background: t.colors.gradient }}
                        />

                        {/* Active indicator */}
                        {isActive && (
                            <motion.div
                                layoutId="activeTheme"
                                className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white flex items-center justify-center"
                            >
                                <Check className="h-3 w-3 text-gray-900" />
                            </motion.div>
                        )}

                        {showLabel && (
                            <div className="text-center">
                                <p className="text-xs font-medium text-white">{t.emoji}</p>
                                <p className="text-[10px] text-white/60">{t.label}</p>
                            </div>
                        )}
                    </motion.button>
                );
            })}
        </div>
    );
}

// Simple theme button for quick access
export function ThemeButton() {
    const { theme, setTheme, themes, mounted } = useThemeSafe();

    if (!mounted) {
        return (
            <div className="w-10 h-10 rounded-xl bg-white/10 animate-pulse" />
        );
    }

    const currentIndex = themes.findIndex((t: Theme) => t.name === theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];

    return (
        <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setTheme(nextTheme.name)}
            className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"
            title="Өнгө солих"
        >
            <Palette className="h-5 w-5 text-white/70" />
        </motion.button>
    );
}
