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
        <div className="min-h-screen pb-40 bg-white text-slate-900 selection:bg-blue-100">
            {/* Minimalist Sub-Header */}
            <div className="px-6 pt-6 pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            AI Hub
                            <Sparkles className="w-5 h-5 text-blue-500 fill-blue-500/10" />
                        </h1>
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
                            {isMongolian ? "Ухаалаг систем" : "The Future of Connection"}
                        </p>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-blue-600" />
                    </div>
                </div>
            </div>

            {/* Elegant Mode Picker */}
            <section className="px-6 mb-8 mt-2">
                <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
                    {travelModes.map((mode) => {
                        const Icon = mode.icon;
                        const isSelected = selectedMode === mode.id;
                        return (
                            <button
                                key={mode.id}
                                onClick={() => setSelectedMode(mode.id)}
                                className={cn(
                                    "flex-shrink-0 flex items-center gap-2.5 px-5 py-2.5 rounded-full text-[13px] font-bold transition-all border shadow-sm",
                                    isSelected
                                        ? "bg-blue-600 border-blue-600 text-white shadow-blue-200"
                                        : "bg-white border-slate-100 text-slate-500 hover:border-slate-200"
                                )}
                            >
                                <Icon className={cn("w-4 h-4", isSelected ? "text-white" : "text-slate-400")} />
                                <span>{isMongolian ? mode.label : mode.labelEn}</span>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Smart Features Grid - Refined */}
            <section className="px-6 mb-10">
                <div className="flex items-center gap-2 mb-5">
                    <div className="h-1 w-8 bg-blue-600 rounded-full" />
                    <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                        {isMongolian ? "Үндсэн боломжууд" : "Core Features"}
                    </h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <AnimatePresence mode="popLayout">
                        {filteredFeatures.map((feature) => {
                            const Icon = feature.icon;
                            const isSpecial = !feature.modes.includes("all");
                            return (
                                <motion.div
                                    key={`${selectedMode}-${feature.id}`}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className="h-full"
                                >
                                    <Link href={feature.href} className="block h-full">
                                        <Card className={cn(
                                            "group h-full flex flex-col p-5 border border-slate-100 bg-white hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 rounded-[24px] shadow-sm",
                                            isSpecial && "bg-slate-50/50"
                                        )}>
                                            <div className={cn(
                                                "w-11 h-11 rounded-[16px] flex items-center justify-center mb-4 shadow-sm transition-transform group-hover:scale-110 bg-gradient-to-br",
                                                feature.color
                                            )}>
                                                <Icon className="w-5 h-5 text-white" />
                                            </div>

                                            <h3 className="font-bold text-sm text-slate-800 leading-tight mb-3">
                                                {isMongolian ? feature.title : feature.titleEn}
                                            </h3>

                                            <div className="mt-auto flex items-center justify-between">
                                                <div className="flex items-center gap-1.5">
                                                    <div className={cn(
                                                        "w-1.5 h-1.5 rounded-full",
                                                        isSpecial ? "bg-amber-500" : "bg-slate-300"
                                                    )} />
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                                                        {isSpecial ? (isMongolian ? "Тусгай" : "Pro") : (isMongolian ? "Бүгд" : "Base")}
                                                    </span>
                                                </div>
                                                <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 transform transition-transform group-hover:translate-x-0.5" />
                                            </div>
                                        </Card>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </section>

            {/* Primary Action Row */}
            <section className="px-6 space-y-4 mb-12">
                <Link href="/ai/poster">
                    <Card className="group p-5 flex items-center gap-5 bg-white border border-slate-100 rounded-[28px] hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/5 transition-all shadow-sm">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105">
                            <Image className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-base text-slate-900 leading-none">
                                {isMongolian ? "Аялалын Дурсамж" : "Memory Art"}
                            </h3>
                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-2">
                                {isMongolian ? "Зургийг арт болгох" : "AI Poster Generator"}
                            </p>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-orange-500 group-hover:bg-orange-50 transition-all border border-slate-100">
                            <ChevronRight className="w-5 h-5" />
                        </div>
                    </Card>
                </Link>

                <Link href="#chat">
                    <Card className="group p-5 flex items-center gap-5 bg-white border border-slate-100 rounded-[28px] hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all shadow-sm">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105">
                            <MessageCircle className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-base text-slate-900 leading-none">
                                {isMongolian ? "AI Туслах" : "Concierge"}
                            </h3>
                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-2">
                                {isMongolian ? "24/7 ухаалаг хөтөч" : "24/7 Smart Travel Bot"}
                            </p>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-blue-500 group-hover:bg-blue-50 transition-all border border-slate-100">
                            <ChevronRight className="w-5 h-5" />
                        </div>
                    </Card>
                </Link>
            </section>

            {/* Exclusive Premium Section - High End Light */}
            <section className="px-6">
                <div className="relative p-8 rounded-[32px] overflow-hidden bg-slate-900">
                    {/* Artistic Background Accent */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/20 blur-[60px] -mr-24 -mt-24" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/10 blur-[50px] -ml-16 -mb-16" />

                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                                <Crown className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em]">Unlimited Access</span>
                                <p className="text-2xl font-black text-white mt-1">$3.99 <span className="text-[11px] text-slate-500 font-bold italic">/ mo</span></p>
                            </div>
                        </div>

                        <div className="mb-8">
                            <h2 className="text-2xl font-black text-white leading-tight italic">
                                AI <span className="text-blue-400 not-italic">Premium</span>
                            </h2>
                            <p className="text-[11px] text-slate-400 font-semibold mt-2 leading-relaxed max-w-[200px]">
                                {isMongolian ? "Бүх боломжийг хязгааргүй нээж, аялалаа ухаалгаар удирд" : "Empower every step of your journey with sovereign travel AI."}
                            </p>
                        </div>

                        <button className="w-full py-4 rounded-[22px] bg-white text-slate-900 font-black text-sm shadow-xl shadow-black/10 hover:bg-slate-50 transition-all active:scale-[0.98]">
                            {isMongolian ? "Premium болох" : "Upgrade to Premium"}
                        </button>

                        <div className="mt-5 flex items-center justify-center gap-3">
                            <div className="h-[1px] w-4 bg-slate-800" />
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                                {isMongolian ? "Хэзээ ч цуцлах боломжтой" : "Secure Payment • Cancel Anytime"}
                            </p>
                            <div className="h-[1px] w-4 bg-slate-800" />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
