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
    Bus,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/providers/language-provider";
import { cn } from "@/lib/utils";

// Main AI features
const aiFeatures = [
    {
        id: "planner",
        icon: Map,
        title: "Аялал Төлөвлөгч",
        titleEn: "Trip Planner",
        description: "Маршрут болон төлөвлөгөө боловсруулах",
        descriptionEn: "Smart itinerary and route planning",
        color: "from-emerald-400 to-teal-500",
        href: "/ai/planner",
    },
    {
        id: "transit",
        icon: Bus,
        title: "Нийтийн Тээвэр",
        titleEn: "Transit Guide",
        description: "Цэвэрхэн, хялбар замын хөтөч",
        descriptionEn: "Seamless navigation with AI",
        color: "from-blue-400 to-indigo-500",
        href: "/ai/transit",
    },
    {
        id: "translator",
        icon: Languages,
        title: "Орчуулагч",
        titleEn: "Translator",
        description: "Дуут болон бичгэн орчуулга",
        descriptionEn: "Voice and text translation",
        color: "from-purple-400 to-pink-500",
        href: "/ai/translator",
    },
    {
        id: "poster",
        icon: Image,
        title: "Аялалын Дурсамж",
        titleEn: "Memory Art",
        description: "Зургийг арт болгож хувиргах",
        descriptionEn: "Turn photos into AI art",
        color: "from-orange-400 to-rose-500",
        href: "/ai/poster",
    },
    {
        id: "expense",
        icon: ShoppingBag,
        title: "Зардал Хөтлөгч",
        titleEn: "Expense Tracker",
        description: "Аялалын зардлаа хялбар удирдах",
        descriptionEn: "Smart travel expense management",
        color: "from-blue-500 to-cyan-500",
        href: "/ai/expenses",
    },
    {
        id: "medical",
        icon: Stethoscope,
        title: "Эмчилгээний Туслах",
        titleEn: "Medical Assistant",
        description: "Эмнэлэг хайх, шинж тэмдэг тайлбарлах",
        descriptionEn: "Find clinics and explain symptoms",
        color: "from-green-400 to-emerald-600",
        href: "/ai/medical",
    },
];

export default function AIHubPage() {
    const { language } = useTranslation();
    const isMongolian = language === "mn";

    return (
        <div className="min-h-screen pb-40 bg-slate-50 text-slate-900 selection:bg-blue-100 relative overflow-hidden">
            {/* Animated Background Blobs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <motion.div
                    animate={{
                        x: [0, 50, 0],
                        y: [0, 30, 0],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-24 -left-20 w-96 h-96 bg-blue-400/10 blur-[100px] rounded-full"
                />
                <motion.div
                    animate={{
                        x: [0, -40, 0],
                        y: [0, 60, 0],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute top-1/4 -right-20 w-80 h-80 bg-purple-400/10 blur-[100px] rounded-full"
                />
                <motion.div
                    animate={{
                        x: [0, 30, 0],
                        y: [0, -50, 0],
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute bottom-1/4 -left-10 w-64 h-64 bg-emerald-400/10 blur-[80px] rounded-full"
                />
            </div>

            {/* Minimalist Sub-Header */}
            <header className="relative z-10 px-6 pt-10 pb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-2 mb-1"
                        >
                            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600/60">
                                {isMongolian ? "Ухаалаг систем" : "The Future of Connection"}
                            </h2>
                        </motion.div>
                        <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white flex items-center gap-3">
                            AI Hub
                            <Sparkles className="w-6 h-6 text-blue-500 fill-blue-500/10 animate-pulse" />
                        </h1>
                    </div>
                    <motion.div
                        whileHover={{ rotate: 15, scale: 1.1 }}
                        className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center"
                    >
                        <Bot className="w-6 h-6 text-blue-600" />
                    </motion.div>
                </div>
            </header>

            {/* Smart Features Grid - Premium Glassmorphism Compact */}
            <section className="relative z-10 px-6 mb-8">
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {aiFeatures.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <motion.div
                                key={feature.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="h-full"
                            >
                                <Link href={feature.href} className="block h-full group">
                                    <Card className="relative h-full flex flex-col p-4 border border-white bg-white/60 backdrop-blur-xl hover:bg-white/90 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-500 rounded-[24px] shadow-sm overflow-hidden">
                                        <div className={cn(
                                            "w-10 h-10 rounded-[14px] flex items-center justify-center mb-3 shadow-lg transition-transform duration-500 group-hover:scale-110 bg-gradient-to-br",
                                            feature.color
                                        )}>
                                            <Icon className="w-5 h-5 text-white" />
                                        </div>

                                        <div className="flex-1">
                                            <h3 className="font-black text-[13px] text-slate-900 leading-tight mb-1 tracking-tight">
                                                {isMongolian ? feature.title : feature.titleEn}
                                            </h3>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-tight">
                                                {isMongolian ? feature.description : feature.descriptionEn}
                                            </p>
                                        </div>

                                        <div className="mt-4 flex items-center justify-between">
                                            <div className="flex items-center gap-1.5 font-black text-[8px] text-blue-500/60 uppercase tracking-widest">
                                                <div className="w-1 h-1 rounded-full bg-blue-500" />
                                                AI
                                            </div>
                                            <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-blue-500 transform transition-transform group-hover:translate-x-0.5" />
                                        </div>
                                    </Card>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            </section>

            {/* Primary Action Row - AI Concierge Card - Compacted */}
            <section className="relative z-10 px-6 mb-8">
                <Link href="#chat">
                    <Card className="group p-4 flex items-center gap-4 bg-slate-900 border border-slate-800 rounded-[28px] hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-500 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] transition-transform pointer-events-none" />

                        <div className="w-12 h-12 rounded-[16px] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20 transition-transform duration-500 group-hover:scale-105">
                            <MessageCircle className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-black text-base text-white leading-none tracking-tight">
                                    AI Concierge
                                </h3>
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            </div>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                                {isMongolian ? "24/7 ухаалаг хөтөч" : "24/7 Travel Companion"}
                            </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-white transition-colors" />
                    </Card>
                </Link>
            </section>

            {/* Exclusive Premium Section - Refined Compact */}
            <section className="relative z-10 px-6">
                <Card className="relative p-6 rounded-[32px] overflow-hidden bg-white border border-slate-100 shadow-xl shadow-slate-200/50">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/5 blur-[60px] -mr-24 -mt-24" />

                    <div className="relative z-10 flex items-center justify-between gap-6">
                        <div className="flex items-center gap-4 text-left">
                            <div className="w-12 h-12 rounded-[18px] bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20 flex-shrink-0">
                                <Crown className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tighter italic leading-none">
                                    AI <span className="text-blue-600 not-italic">Premium</span>
                                </h2>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1.5">Unlimited Access</p>
                            </div>
                        </div>

                        <div className="flex flex-col items-end">
                            <span className="text-2xl font-black text-slate-900 tracking-tighter">$3.99</span>
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">/ mo</span>
                        </div>
                    </div>

                    <button className="w-full mt-6 py-3.5 rounded-[20px] bg-slate-900 text-white font-black text-[13px] shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-[0.98]">
                        {isMongolian ? "Premium болох" : "Upgrade now"}
                    </button>
                </Card>
            </section>
        </div>
    );
}
