"use client";
import { useTheme } from "@/providers/theme-provider";
import { cn } from "@/lib/utils";
import { Palette } from "lucide-react";
import { motion } from "framer-motion";

export function HomeThemeSelector() {
    const { theme, setTheme, themes } = useTheme();

    return (
        <section className="px-4 py-8 border-t border-white/5 bg-black/10">
            <div className="flex items-center gap-2 mb-4 justify-center">
                <Palette className="w-4 h-4 text-white/40" />
                <p className="text-sm text-white/40 font-medium">Өнгөний сонголт</p>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 px-2 no-scrollbar justify-center">
                {themes.map(t => (
                    <motion.button
                        key={t.name}
                        onClick={() => setTheme(t.name)}
                        whileTap={{ scale: 0.9 }}
                        whileHover={{ scale: 1.1 }}
                        className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all",
                            theme === t.name
                                ? "ring-2 ring-white ring-offset-2 ring-offset-[#0d111c] shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                                : "opacity-60 hover:opacity-100"
                        )}
                        style={{ background: t.colors.gradient }}
                        title={t.label}
                    >
                        <span className="text-lg drop-shadow-md filter">{t.emoji}</span>
                    </motion.button>
                ))}
            </div>
        </section>
    )
}
