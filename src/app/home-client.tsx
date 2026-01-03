"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
    Search,
    Sparkles
} from "lucide-react";
import { AIChat } from "@/components/ai/ai-chat";
import { popularCountries } from "@/config/site";
import { Globe } from "@/components/ui/globe";
import { ReactNode } from "react";

interface HomeClientProps {
    children?: ReactNode; // Used for injecting Featured Packages (Server Component)
}

// Floating Card color schemes
const countryThemes: Record<string, {
    badgeBg: string,
    badgeText: string,
    hoverShadow: string
}> = {
    "CN": {
        badgeBg: "bg-gradient-to-r from-red-500 to-red-600",
        badgeText: "text-white",
        hoverShadow: "hover:shadow-red-500/20"
    },
    "JP": {
        badgeBg: "bg-gradient-to-r from-pink-500 to-pink-600",
        badgeText: "text-white",
        hoverShadow: "hover:shadow-pink-500/20"
    },
    "KR": {
        badgeBg: "bg-gradient-to-r from-blue-500 to-blue-600",
        badgeText: "text-white",
        hoverShadow: "hover:shadow-blue-500/20"
    },
    "TH": {
        badgeBg: "bg-gradient-to-r from-amber-500 to-amber-600",
        badgeText: "text-white",
        hoverShadow: "hover:shadow-amber-500/20"
    }
};

export default function HomeClient({ children }: HomeClientProps) {
    return (
        <div className="min-h-screen pb-32 md:pb-8 overflow-x-hidden font-sans relative">
            {/* TopHeader in layout */}

            {/* COBE 3D GLOBE */}
            <div className="fixed top-[-80px] right-[-300px] md:top-[-150px] md:right-[-400px] z-0 pointer-events-none opacity-80">
                <div className="md:hidden">
                    <Globe size={750} />
                </div>
                <div className="hidden md:block">
                    <Globe size={1400} />
                </div>

                <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--background))]/40 via-transparent to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--background))]/40 via-transparent to-transparent"></div>
            </div>

            {/* Hero Section */}
            <div className="container mx-auto px-6 lg:px-12 pt-24 md:pt-40 relative z-10">
                <div className="flex flex-col md:flex-row items-center md:items-start">
                    <div className="w-full md:w-1/2 md:pr-12">
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 text-left relative z-20">
                            <h1 className="hero-text-title text-3xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight mb-2 md:mb-6">
                                Your Gateway to <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-800">
                                    Global Connection
                                </span>
                            </h1>
                            <p className="hero-text-desc text-sm md:text-xl font-bold max-w-md leading-relaxed opacity-90">
                                Дэлхийн 200+ улсад хамгийн хямд үнээр <br className="hidden md:block" />интернэтэд холбогдоорой.
                            </p>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-5 max-w-lg relative z-30">
                            <Link href="/packages">
                                <div className="relative rounded-2xl flex items-center shadow-[0_8px_32px_0_rgba(185,28,28,0.05)] backdrop-blur-md border border-white/40 cursor-pointer overflow-hidden py-3 pl-4 pr-2 transition-all hover:scale-[1.01] group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 rounded-2xl pointer-events-none"></div>
                                    <div className="relative z-10 w-7 h-7 rounded-full border border-red-400/30 flex items-center justify-center flex-shrink-0 bg-red-50/30 shadow-inner">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]"></div>
                                    </div>
                                    <div className="relative z-10 flex-1 ml-3 header-text text-sm font-medium group-hover:text-red-600 transition-colors">Таны очих газар...</div>
                                    <div className="relative z-10 bg-white/20 p-2 rounded-xl shadow-sm border border-white/30 backdrop-blur-sm">
                                        <Search className="h-5 w-5 header-icon" />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-wrap gap-3 mb-10 relative z-30">
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-b from-red-600/90 to-red-700/90 backdrop-blur-md text-white shadow-lg shadow-red-600/20 cursor-pointer active:scale-95 border border-white/20 relative overflow-hidden transition-transform">
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none"></div>
                                <span className="w-1.5 h-1.5 rounded-full bg-white shadow-sm relative z-10" />
                                <span className="text-xs font-bold relative z-10">7 хоног</span>
                            </div>
                            <div className="hero-btn-15 flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border border-slate-200 dark:border-white/20 font-bold cursor-pointer hover:bg-white dark:hover:bg-white/20 transition active:scale-95 shadow-sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
                                <span className="text-xs">15 хоног</span>
                            </div>
                        </motion.div>
                    </div>

                    <div className="hidden md:block w-1/2"></div>
                </div>
            </div>

            {/* Popular Countries - FLOATING CARD DESIGN */}
            <section className="container mx-auto px-6 lg:px-12 mt-4 md:mt-12 mb-8 md:mb-16 relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {popularCountries.slice(0, 4).map((country, index) => {
                        const theme = countryThemes[country.code] || countryThemes["CN"];

                        return (
                            <Link key={country.code} href={`/packages/${country.code}`}>
                                <div
                                    className={`group relative rounded-3xl p-4 
                                bg-white/90 dark:bg-slate-800/90
                                border border-white/60 dark:border-white/10
                                shadow-md hover:shadow-lg
                                ${theme.hoverShadow}
                                transition-all duration-200 cursor-pointer
                                flex flex-col items-center text-center min-h-[160px]
                                hover:-translate-y-1`}
                                >
                                    {/* Large Flag */}
                                    <div className="mt-4 mb-3">
                                        <span className="text-5xl drop-shadow-sm">
                                            {country.flag}
                                        </span>
                                    </div>

                                    {/* Country Name */}
                                    <h3 className="hero-text-title text-lg font-black leading-tight mb-3 line-clamp-1 w-full px-1">
                                        {country.name}
                                    </h3>

                                    {/* Call to Action */}
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400 mt-auto bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-full group-hover:bg-red-100 dark:group-hover:bg-red-900/30 transition-colors">
                                        <span>Багцуудыг үзэх</span>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M5 12h14M12 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </section>

            {/* Featured Packages - Rendered via Children */}
            <section className="container mx-auto px-6 lg:px-12 pb-10 md:pb-20 relative z-10">
                <div className="flex items-center gap-3 mb-6 md:mb-8">
                    <div className="bg-red-50/50 backdrop-blur-sm p-2.5 rounded-2xl shadow-sm border border-red-100/50">
                        <Sparkles className="w-5 h-5 text-red-600 fill-red-500" />
                    </div>
                    <h2 className="text-2xl font-black text-[hsl(var(--foreground))] tracking-tight drop-shadow-sm">Онцлох багцууд</h2>
                </div>

                {children}
            </section>

            {/* AI Assistant Section */}
            <section className="container mx-auto px-6 lg:px-12 pb-4 md:pb-20 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative overflow-hidden rounded-3xl bg-white/30 dark:bg-black/40 backdrop-blur-xl border border-white/40 dark:border-white/10 p-6 md:p-12 shadow-2xl shadow-black/5 dark:shadow-black/20"
                >
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/20 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
                        {/* AI Icon */}
                        <div className="flex-shrink-0">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/20">
                                <Sparkles className="w-10 h-10 text-white fill-white/20" />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
                                Аяллын Ухаалаг Туслах 🤖
                            </h2>
                            <p className="text-slate-600 dark:text-gray-200 text-sm md:text-base leading-relaxed mb-6 font-medium max-w-xl mx-auto md:mx-0">
                                Хаашаа явахаа хэлээд л, танд хамгийн тохиромжтой багцыг санал болгоно.
                                <br className="hidden md:block" />
                                <span className="text-slate-500 dark:text-slate-400 font-normal">"Япон руу 2 долоо хоног" гэхэд л болно!</span>
                            </p>
                            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                                <span className="px-4 py-2 rounded-xl bg-white/50 dark:bg-white/10 border border-white/50 dark:border-white/10 text-slate-800 dark:text-white text-xs font-bold backdrop-blur-md shadow-sm">
                                    💬 Монгол хэлээр
                                </span>
                                <span className="px-4 py-2 rounded-xl bg-white/50 dark:bg-white/10 border border-white/50 dark:border-white/10 text-slate-800 dark:text-white text-xs font-bold backdrop-blur-md shadow-sm">
                                    ⚡ Шуурхай хариу
                                </span>
                                <span className="px-4 py-2 rounded-xl bg-white/50 dark:bg-white/10 border border-white/50 dark:border-white/10 text-slate-800 dark:text-white text-xs font-bold backdrop-blur-md shadow-sm">
                                    🎯 Хувийн зөвлөгөө
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

            <AIChat />
        </div>
    );
}
