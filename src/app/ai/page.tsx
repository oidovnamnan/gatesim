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
        <div className="min-h-screen pb-24 md:pb-8 bg-slate-50 text-slate-900 selection:bg-blue-100">
            {/* Clean Header */}
            <header className="px-6 pt-10 pb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 mb-4">
                    <Bot className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                        {isMongolian ? "Ухаалаг систем" : "AI Intelligence"}
                    </span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 italic">
                    GateSIM <span className="text-blue-600 not-italic">AI</span>
                </h1>
                <p className="text-sm text-slate-500 mt-1 font-medium">
                    {isMongolian ? "Аялалын ухаалаг хөтөч" : "Your intelligent travel companion"}
                </p>
            </header>

            {/* Compact Category Selector */}
            <section className="px-6 mb-8">
                <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                    {travelModes.map((mode) => {
                        const Icon = mode.icon;
                        const isSelected = selectedMode === mode.id;
                        return (
                            <button
                                key={mode.id}
                                onClick={() => setSelectedMode(mode.id)}
                                className={cn(
                                    "flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                                    isSelected
                                        ? "bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-200"
                                        : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                                )}
                            >
                                <Icon className={cn("w-3.5 h-3.5", isSelected ? "text-white" : "text-slate-400")} />
                                <span>{isMongolian ? mode.label : mode.labelEn}</span>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Smart Feature Grid - Clean & Compact */}
            <section className="px-6 mb-8">
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                        {isMongolian ? "Үндсэн боломжууд" : "Key Intelligence"}
                    </h2>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <AnimatePresence mode="popLayout">
                        {filteredFeatures.map((feature) => {
                            const Icon = feature.icon;
                            const isSpecial = !feature.modes.includes("all");
                            return (
                                <motion.div
                                    key={`${selectedMode}-${feature.id}`}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Link href={feature.href}>
                                        <Card className={cn(
                                            "group relative p-4 h-full border border-slate-200 bg-white hover:border-blue-400/50 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 rounded-2xl",
                                            isSpecial && "bg-gradient-to-br from-white to-slate-50/50"
                                        )}>
                                            <div className={cn(
                                                "w-9 h-9 rounded-xl flex items-center justify-center mb-3 shadow-sm transition-transform group-hover:scale-105 bg-gradient-to-br",
                                                feature.color
                                            )}>
                                                <Icon className="w-4.5 h-4.5 text-white" />
                                            </div>

                                            <h3 className="font-bold text-xs text-slate-800 leading-tight mb-1">
                                                {isMongolian ? feature.title : feature.titleEn}
                                            </h3>

                                            <div className="flex items-center gap-1.5 mt-auto">
                                                <div className={cn(
                                                    "w-1 h-1 rounded-full",
                                                    isSpecial ? "bg-purple-500" : "bg-slate-300"
                                                )} />
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                                                    {isSpecial ? (isMongolian ? "Тусгай" : "Special") : (isMongolian ? "Бүгд" : "Base")}
                                                </span>
                                            </div>
                                        </Card>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </section>

            {/* Utility Hero Cards */}
            <section className="px-6 space-y-3 mb-8">
                {/* Travel Memory */}
                <Link href="/ai/poster">
                    <Card className="group p-4 flex items-center gap-4 bg-white border border-slate-200 rounded-2xl hover:border-orange-200 hover:shadow-lg hover:shadow-orange-500/5 transition-all">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center flex-shrink-0 transition-transform group-hover:rotate-3">
                            <Image className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-sm text-slate-900">
                                {isMongolian ? "Аялалын Дурсамж" : "Travel Memory"}
                            </h3>
                            <p className="text-[11px] text-slate-500 font-medium">
                                {isMongolian ? "Зургийг арт болгох" : "Turn moments into digital posters"}
                            </p>
                        </div>
                        <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-orange-500 group-hover:bg-orange-50 transition-colors">
                            <ChevronRight className="w-4 h-4" />
                        </div>
                    </Card>
                </Link>

                {/* AI Chat */}
                <Link href="#chat">
                    <Card className="group p-4 flex items-center gap-4 bg-white border border-slate-200 rounded-2xl hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 transition-transform group-hover:-rotate-3">
                            <MessageCircle className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-sm text-slate-900">
                                {isMongolian ? "AI Туслах" : "AI Concierge"}
                            </h3>
                            <p className="text-[11px] text-slate-500 font-medium">
                                {isMongolian ? "24/7 мэдээлэл, зааварчилгаа" : "Your 24/7 travel expert"}
                            </p>
                        </div>
                        <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-50 transition-colors">
                            <ChevronRight className="w-4 h-4" />
                        </div>
                    </Card>
                </Link>
            </section>

            {/* Refined Premium CTA */}
            <section className="px-6 pb-12">
                <div className="relative p-6 bg-slate-900 rounded-[24px] overflow-hidden shadow-xl shadow-slate-200">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[40px] -mr-16 -mt-16" />

                    <div className="flex items-center gap-5 relative z-10 mb-6">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                            <Crown className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-lg font-bold text-white tracking-tight leading-none italic uppercase">AI Premium</h2>
                            <p className="text-[11px] text-slate-400 font-medium mt-1">
                                {isMongolian ? "Бүх боломжийг хязгааргүй нээх" : "Empower your travel with limitless AI"}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xl font-bold text-amber-500 leading-none">$3.99</p>
                            <p className="text-[9px] text-slate-500 font-bold uppercase mt-1 tracking-tighter">/ monthly</p>
                        </div>
                    </div>

                    <button className="w-full py-3.5 rounded-xl bg-white text-slate-900 font-bold text-sm shadow-lg hover:bg-slate-50 transition-colors active:scale-[0.98]">
                        {isMongolian ? "Premium болох" : "Upgrade to Premium"}
                    </button>

                    <p className="text-center text-[9px] text-slate-500 font-bold mt-3 uppercase tracking-widest opacity-60">
                        {isMongolian ? "Хэзээ ч цуцлах боломжтой" : "Full access • Cancel anytime"}
                    </p>
                </div>
            </section>
        </div>
    );
}
