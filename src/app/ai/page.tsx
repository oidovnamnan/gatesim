"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
    MessageCircle,
    Sparkles,
    Map,
    Languages,
    Image,
    Crown,
    ChevronRight,
    Bot,
    Briefcase,
    Stethoscope,
    ShoppingBag,
    GraduationCap,
    Plane,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/providers/language-provider";
import { cn } from "@/lib/utils";

// Travel modes for filtering
const travelModes = [
    { id: "tourist", icon: Plane, label: "Жуулчин", labelEn: "Tourist", color: "from-blue-500 to-cyan-500" },
    { id: "shopping", icon: ShoppingBag, label: "Шоппинг", labelEn: "Shopping", color: "from-pink-500 to-rose-500" },
    { id: "business", icon: Briefcase, label: "Бизнес", labelEn: "Business", color: "from-amber-500 to-orange-500" },
    { id: "medical", icon: Stethoscope, label: "Эмчилгээ", labelEn: "Medical", color: "from-green-500 to-emerald-500" },
    { id: "student", icon: GraduationCap, label: "Сургалт", labelEn: "Student", color: "from-purple-500 to-violet-500" },
];

// Main AI features - grouped by relevance
const aiFeatures = [
    {
        id: "planner",
        icon: Map,
        title: "Аялал Төлөвлөгч",
        titleEn: "Trip Planner",
        color: "from-emerald-500 to-teal-600",
        href: "/ai/planner",
        modes: ["all"],
    },
    {
        id: "translator",
        icon: Languages,
        title: "Орчуулагч",
        titleEn: "Translator",
        color: "from-purple-500 to-pink-600",
        href: "/ai/translator",
        modes: ["all"],
    },
    {
        id: "business",
        icon: Briefcase,
        title: "Бизнес Аялал",
        titleEn: "Business Trip",
        color: "from-amber-500 to-orange-500",
        href: "/ai/business",
        modes: ["business"],
    },
    {
        id: "expense",
        icon: ShoppingBag,
        title: "Зардал Хөтлөгч",
        titleEn: "Expense Tracker",
        color: "from-blue-500 to-indigo-600",
        href: "/ai/expenses",
        modes: ["business"],
    },
    {
        id: "medical",
        icon: Stethoscope,
        title: "Эмчилгээний Туслах",
        titleEn: "Medical Assistant",
        color: "from-green-500 to-emerald-500",
        href: "/ai/medical",
        modes: ["medical"],
    },
    {
        id: "hospital",
        icon: Map,
        title: "Эмнэлэг Хайх",
        titleEn: "Find Hospital",
        color: "from-red-500 to-rose-600",
        href: "/ai/hospitals",
        modes: ["medical"],
    },
    {
        id: "vat",
        icon: ShoppingBag,
        title: "VAT Буцаан Олголт",
        titleEn: "VAT Refund",
        color: "from-pink-500 to-rose-600",
        href: "/ai/vat",
        modes: ["shopping"],
    },
    {
        id: "prices",
        icon: Sparkles,
        title: "Үнийн Зөвлөх",
        titleEn: "Price Guide",
        color: "from-yellow-500 to-amber-600",
        href: "/ai/prices",
        modes: ["shopping"],
    },
    {
        id: "student",
        icon: GraduationCap,
        title: "Сургалтын Гарын Авлага",
        titleEn: "Student Guide",
        color: "from-purple-500 to-violet-600",
        href: "/ai/student",
        modes: ["student"],
    },
    {
        id: "campus",
        icon: Map,
        title: "Кампус Газрын Зураг",
        titleEn: "Campus Map",
        color: "from-blue-500 to-cyan-600",
        href: "/ai/campus",
        modes: ["student"],
    },
];

export default function AIHubPage() {
    const { language } = useTranslation();
    const isMongolian = language === "mn";
    const [selectedMode, setSelectedMode] = useState("tourist");

    // Filter features based on selected mode
    const filteredFeatures = aiFeatures.filter(
        (f) => f.modes.includes("all") || f.modes.includes(selectedMode)
    );

    return (
        <div className="min-h-screen pb-24 md:pb-8 bg-[#020617] text-white selection:bg-purple-500/30">
            {/* Advanced Mesh Hero */}
            <section className="relative overflow-hidden pt-12 pb-16 px-6">
                {/* Dynamic Mesh Background */}
                <div className="absolute inset-0 z-0">
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 5, 0],
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-blue-600/10 blur-[120px] rounded-full"
                    />
                    <motion.div
                        animate={{
                            scale: [1, 1.3, 1],
                            rotate: [0, -5, 0],
                        }}
                        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                        className="absolute bottom-[-10%] right-[-5%] w-[60%] h-[60%] bg-purple-600/10 blur-[120px] rounded-full"
                    />
                    <div className="absolute inset-0 bg-[#020617]/40 backdrop-blur-[1px]" />
                </div>

                <div className="max-w-lg mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        className="relative w-24 h-24 mx-auto mb-8"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-[32px] blur-2xl opacity-40 animate-pulse" />
                        <div className="relative w-full h-full rounded-[32px] bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl border border-white/20">
                            <Bot className="w-12 h-12 text-white" />
                        </div>
                    </motion.div>

                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-5xl font-black tracking-tighter mb-3"
                    >
                        <span className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                            GateSIM
                        </span>
                        <span className="ml-2 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent italic">
                            AI
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-xs font-black text-slate-500 tracking-[0.2em] uppercase"
                    >
                        {isMongolian ? "Ирээдүйн Аялалын Туслах" : "The Future of Connection"}
                    </motion.p>
                </div>
            </section>

            {/* Floating Dock - Travel Mode Selector */}
            <section className="sticky top-4 z-50 px-4 -mt-8 mb-10">
                <div className="max-w-lg mx-auto bg-slate-900/60 backdrop-blur-3xl border border-white/10 rounded-[28px] p-1.5 shadow-2xl shadow-black/80">
                    <div className="flex gap-1 overflow-x-auto no-scrollbar py-0.5">
                        {travelModes.map((mode) => {
                            const Icon = mode.icon;
                            const isSelected = selectedMode === mode.id;
                            return (
                                <button
                                    key={mode.id}
                                    onClick={() => setSelectedMode(mode.id)}
                                    className={cn(
                                        "flex-shrink-0 relative flex items-center gap-2 px-6 py-3.5 rounded-[22px] text-sm font-bold transition-all duration-300",
                                        isSelected
                                            ? "text-white"
                                            : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                                    )}
                                >
                                    {isSelected && (
                                        <motion.div
                                            layoutId="activeDock"
                                            className={cn(
                                                "absolute inset-0 bg-gradient-to-r rounded-[22px] shadow-lg",
                                                mode.color
                                            )}
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    <Icon className={cn("w-4 h-4 relative z-10 transition-transform", isSelected && "scale-110")} />
                                    <span className="relative z-10">{isMongolian ? mode.label : mode.labelEn}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Smart Feature Grid */}
            <section className="px-6 py-4">
                <div className="flex items-center justify-between mb-8 px-1">
                    <h2 className="text-2xl font-black bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent flex items-center gap-3">
                        <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
                        {isMongolian ? "Ухаалаг Боломжууд" : "Intelligence"}
                    </h2>
                    <div className="h-px flex-1 mx-6 bg-gradient-to-r from-slate-800 to-transparent opacity-50" />
                </div>

                <div className="grid grid-cols-2 gap-5">
                    <AnimatePresence mode="popLayout">
                        {filteredFeatures.map((feature) => {
                            const Icon = feature.icon;
                            const isSpecial = !feature.modes.includes("all");
                            return (
                                <motion.div
                                    key={`${selectedMode}-${feature.id}`}
                                    layout
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
                                >
                                    <Link href={feature.href}>
                                        <Card className={cn(
                                            "group h-full relative overflow-hidden bg-[#0f172a]/40 backdrop-blur-xl border border-white/[0.03] p-6 transition-all duration-500",
                                            "hover:bg-[#1e293b]/60 hover:border-white/10 hover:-translate-y-2",
                                            isSpecial && "ring-1 ring-purple-500/10 shadow-[0_0_30px_rgba(168,85,247,0.05)]"
                                        )}>
                                            {/* Hover Glow */}
                                            <div className={cn(
                                                "absolute -top-12 -right-12 w-28 h-28 bg-gradient-to-br transition-all duration-700 blur-[45px] opacity-0 group-hover:opacity-30",
                                                feature.color
                                            )} />

                                            <div className={cn(
                                                "w-14 h-14 rounded-[20px] bg-gradient-to-br flex items-center justify-center mb-5 shadow-xl transition-all group-hover:scale-110 group-hover:rotate-3 duration-500",
                                                feature.color
                                            )}>
                                                <Icon className="w-7 h-7 text-white" />
                                            </div>

                                            <h3 className="font-black text-base text-white mb-2 tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-400 transition-all">
                                                {isMongolian ? feature.title : feature.titleEn}
                                            </h3>

                                            <div className="flex items-center gap-2">
                                                <Badge className={cn(
                                                    "text-[9px] uppercase tracking-[0.15em] font-black px-2 py-0.5 border-none rounded-md",
                                                    isSpecial
                                                        ? "bg-purple-500/20 text-purple-300"
                                                        : "bg-slate-800 text-slate-500"
                                                )}>
                                                    {isSpecial ? (isMongolian ? "Тусгай" : "Specialized") : (isMongolian ? "Бүгд" : "Global")}
                                                </Badge>
                                            </div>
                                        </Card>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </section>

            {/* High-End Prime Actions */}
            <section className="px-6 py-8 space-y-5">
                {/* Travel Memory */}
                <Link href="/ai/poster">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Card className="relative overflow-hidden p-8 bg-gradient-to-br from-[#0c0a1f] to-[#020617] backdrop-blur-2xl border border-white/[0.05] group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 blur-[100px] -mr-24 -mt-24 group-hover:bg-pink-500/20 transition-all duration-1000" />
                            <div className="flex items-center gap-8 relative z-10">
                                <div className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-indigo-500/20 flex-shrink-0 group-hover:rotate-6 transition-transform duration-500">
                                    <Image className="w-10 h-10 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-2xl font-black text-white tracking-tight">
                                        {isMongolian ? "Аялалын Дурсамж" : "Travel Memory"}
                                    </h3>
                                    <p className="text-slate-400 mt-2 font-medium leading-relaxed">
                                        {isMongolian ? "Зургаа уран бүтээл болгож хадгал" : "Transform your moments into digital art"}
                                    </p>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors border border-white/5">
                                    <ChevronRight className="w-7 h-7 text-white" />
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </Link>

                {/* AI Chat */}
                <Link href="#chat">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Card className="relative overflow-hidden p-8 bg-gradient-to-br from-[#020617] to-[#0c0a1f] backdrop-blur-2xl border border-white/[0.05] group">
                            <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] -mr-24 -mb-24 group-hover:bg-blue-500/20 transition-all duration-1000" />
                            <div className="flex items-center gap-8 relative z-10">
                                <div className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-2xl shadow-blue-500/20 flex-shrink-0 group-hover:-rotate-6 transition-transform duration-500">
                                    <MessageCircle className="w-10 h-10 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-2xl font-black text-white tracking-tight">
                                        {isMongolian ? "AI Туслах" : "AI Concierge"}
                                    </h3>
                                    <p className="text-slate-400 mt-2 font-medium leading-relaxed">
                                        {isMongolian ? "24/7 ухаалаг аялалын хөтөч" : "Personalized 24/7 travel mastery"}
                                    </p>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors border border-white/5">
                                    <ChevronRight className="w-7 h-7 text-white" />
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </Link>
            </section>

            {/* Imperial Subscription CTA */}
            <section className="px-6 py-10">
                <Card className="relative overflow-hidden p-10 bg-slate-900/40 backdrop-blur-3xl border border-amber-500/20">
                    {/* Background Shine */}
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-amber-500/[0.03] to-transparent opacity-30" />

                    <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                        <div className="w-24 h-24 rounded-[34px] bg-gradient-to-br from-amber-300 via-orange-500 to-amber-600 flex items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.25)] flex-shrink-0 animate-pulse">
                            <Crown className="w-12 h-12 text-white" />
                        </div>
                        <div className="flex-1 text-center md:text-left min-w-0">
                            <h2 className="text-3xl font-black text-white italic tracking-tighter">AI PREMIUM</h2>
                            <p className="text-slate-400 font-semibold mt-2 leading-relaxed">
                                {isMongolian ? "Хязгааргүй боломж, ухаалаг бүхнийг нээ" : "Unlock the sovereign power of travel AI"}
                            </p>
                        </div>
                        <div className="text-center md:text-right bg-black/60 px-8 py-5 rounded-[32px] border border-white/5 backdrop-blur-2xl">
                            <p className="text-4xl font-black text-amber-500 tracking-tighter">$3.99</p>
                            <p className="text-[11px] uppercase font-black text-slate-500 mt-2 tracking-widest">{isMongolian ? "Сар бүр" : "Monthly Access"}</p>
                        </div>
                    </div>

                    <button className="w-full mt-10 py-5 rounded-[22px] bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-black text-xl shadow-[0_15px_40px_rgba(245,158,11,0.2)] active:scale-[0.97] transition-all hover:brightness-110 hover:shadow-amber-500/40">
                        {isMongolian ? "Premium болох" : "Upgrade to Premium"}
                    </button>

                    <div className="flex items-center justify-center gap-4 mt-6">
                        <div className="h-px w-8 bg-slate-800" />
                        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                            {isMongolian ? "Хэзээ ч цуцлах боломжтой" : "Full access • Cancel anytime"}
                        </p>
                        <div className="h-px w-8 bg-slate-800" />
                    </div>
                </Card>
            </section>
        </div>
    );
}
