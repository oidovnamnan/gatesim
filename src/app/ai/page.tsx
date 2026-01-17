"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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

// Main AI features - simplified to 4 core features
const aiFeatures = [
    {
        id: "planner",
        icon: Map,
        title: "Аялал Төлөвлөгч",
        titleEn: "Trip Planner",
        color: "from-emerald-500 to-teal-600",
        href: "/ai/planner",
    },
    {
        id: "translator",
        icon: Languages,
        title: "Орчуулагч",
        titleEn: "Translator",
        color: "from-purple-500 to-pink-600",
        href: "/ai/translator",
    },
    {
        id: "business",
        icon: Briefcase,
        title: "Бизнес Аялал",
        titleEn: "Business Trip",
        color: "from-amber-500 to-orange-500",
        href: "/ai/business",
    },
    {
        id: "medical",
        icon: Stethoscope,
        title: "Эмчилгээ",
        titleEn: "Medical",
        color: "from-green-500 to-emerald-500",
        href: "/ai/medical",
    },
];

export default function AIHubPage() {
    const { language } = useTranslation();
    const isMongolian = language === "mn";
    const [selectedMode, setSelectedMode] = useState("tourist");

    return (
        <div className="min-h-screen pb-24 md:pb-8">
            {/* Compact Hero */}
            <section className="bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-pink-600/10 px-4 py-6">
                <div className="max-w-lg mx-auto text-center">
                    <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                        <Bot className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-2xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                        GateSIM AI
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {isMongolian ? "Аялалын ухаалаг туслах" : "Smart Travel Assistant"}
                    </p>
                </div>
            </section>

            {/* Travel Mode Selector - Horizontal scroll */}
            <section className="px-4 py-4 border-b">
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                    {travelModes.map((mode) => {
                        const Icon = mode.icon;
                        const isSelected = selectedMode === mode.id;
                        return (
                            <button
                                key={mode.id}
                                onClick={() => setSelectedMode(mode.id)}
                                className={cn(
                                    "flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold transition-all",
                                    isSelected
                                        ? `bg-gradient-to-r ${mode.color} text-white shadow-lg scale-105`
                                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                {isMongolian ? mode.label : mode.labelEn}
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* AI Features Grid - 2x2 compact */}
            <section className="px-4 py-6">
                <h2 className="font-bold mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    {isMongolian ? "AI Боломжууд" : "AI Features"}
                </h2>
                <div className="grid grid-cols-2 gap-3">
                    {aiFeatures.map((feature) => {
                        const Icon = feature.icon;
                        return (
                            <Link key={feature.id} href={feature.href}>
                                <Card className="p-4 h-full hover:shadow-lg transition-shadow active:scale-[0.98]">
                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-2`}>
                                        <Icon className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="font-bold text-sm">
                                        {isMongolian ? feature.title : feature.titleEn}
                                    </h3>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            </section>

            {/* Quick Actions - Memory & Chat */}
            <section className="px-4 py-2 space-y-3">
                {/* Travel Memory */}
                <Link href="/ai/poster">
                    <Card className="p-4 flex items-center gap-4 hover:shadow-lg transition-shadow bg-gradient-to-r from-orange-500/10 to-pink-500/10 border-orange-500/20">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                            <Image className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold">
                                {isMongolian ? "Аялалын Дурсамж" : "Travel Memory"}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                {isMongolian ? "Зургаа постер болгох" : "Turn photo into poster"}
                            </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    </Card>
                </Link>

                {/* AI Chat */}
                <Link href="#chat">
                    <Card className="p-4 flex items-center gap-4 hover:shadow-lg transition-shadow bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                            <MessageCircle className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold">
                                {isMongolian ? "AI Чат" : "AI Chat"}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                {isMongolian ? "24/7 аялалын туслах" : "24/7 travel assistant"}
                            </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    </Card>
                </Link>
            </section>

            {/* Premium CTA - Compact */}
            <section id="premium" className="px-4 py-6">
                <Card className="p-5 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                            <Crown className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="font-bold">AI Premium</h2>
                            <p className="text-xs text-muted-foreground">
                                {isMongolian ? "Бүх боломжийг нээх" : "Unlock all features"}
                            </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                            <p className="text-xl font-black text-amber-600">$3.99</p>
                            <p className="text-[10px] text-muted-foreground">/сар</p>
                        </div>
                    </div>
                    <button className="w-full mt-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm active:scale-[0.98] transition-transform">
                        {isMongolian ? "Premium болох" : "Go Premium"}
                    </button>
                </Card>
            </section>
        </div>
    );
}
