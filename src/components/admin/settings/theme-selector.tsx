"use client";

import { useTheme } from "@/providers/theme-provider";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import type { Theme } from "@/lib/themes";

export function ThemeSelector() {
    const { theme, setTheme, themes } = useTheme();

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {themes.map((t: Theme) => (
                <button
                    key={t.name}
                    onClick={() => setTheme(t.name)}
                    className={cn(
                        "relative flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                        theme === t.name
                            ? "border-primary bg-primary/10"
                            : "border-white/10 bg-white/5 hover:bg-white/10"
                    )}
                >
                    {/* Color Preview */}
                    <div
                        className="w-10 h-10 rounded-lg shadow-sm flex items-center justify-center text-lg shrink-0"
                        style={{ background: t.colors.gradient }}
                    >
                        {t.emoji}
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-white text-sm truncate">{t.label}</p>
                        <p className="text-xs text-white/50 truncate">Theme</p>
                    </div>

                    {theme === t.name && (
                        <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-primary-foreground" />
                        </div>
                    )}
                </button>
            ))}
        </div>
    );
}
