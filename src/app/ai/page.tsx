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
    Lock,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/providers/language-provider";
import { AIChat } from "@/components/ai/ai-chat";
import { AIRecommendations } from "@/components/ai/ai-recommendations";

// Feature categories
const travelModes = [
    { id: "tourist", icon: Plane, label: "Жуулчин", labelEn: "Tourist", color: "from-blue-500 to-cyan-500" },
    { id: "shopping", icon: ShoppingBag, label: "Шоппинг", labelEn: "Shopping", color: "from-pink-500 to-rose-500" },
    { id: "business", icon: Briefcase, label: "Бизнес", labelEn: "Business", color: "from-amber-500 to-orange-500" },
    { id: "medical", icon: Stethoscope, label: "Эмчилгээ", labelEn: "Medical", color: "from-green-500 to-emerald-500" },
    { id: "student", icon: GraduationCap, label: "Сургалт", labelEn: "Student", color: "from-purple-500 to-violet-500" },
    { id: "wholesale", icon: ShoppingBag, label: "Бөөний", labelEn: "Wholesale", color: "from-orange-500 to-red-500" },
];

const aiFeatures = [
    {
        id: "chat",
        icon: MessageCircle,
        title: "AI Чат",
        titleEn: "AI Chat",
        description: "24/7 аялалын туслах",
        descriptionEn: "24/7 travel assistant",
        color: "from-blue-500 to-indigo-600",
        href: "#chat",
        available: true,
    },
    {
        id: "planner",
        icon: Map,
        title: "Аялал Төлөвлөгч",
        titleEn: "Trip Planner",
        description: "AI-д тулгуурласан маршрут",
        descriptionEn: "AI-powered itinerary",
        color: "from-emerald-500 to-teal-600",
        href: "/ai/planner",
        available: true,
    },
    {
        id: "translator",
        icon: Languages,
        title: "Орчуулагч",
        titleEn: "Translator",
        description: "Текст, дуу, камер",
        descriptionEn: "Text, voice, camera",
        color: "from-purple-500 to-pink-600",
        href: "/ai/translator",
        available: true,
    },
    {
        id: "poster",
        icon: Image,
        title: "Постер Үүсгэгч",
        titleEn: "Poster Generator",
        description: "AI зураг үүсгэх",
        descriptionEn: "AI image generation",
        color: "from-orange-500 to-red-600",
        href: "/ai/poster",
        available: true,
    },
    {
        id: "business",
        icon: Briefcase,
        title: "Бизнес Аялал",
        titleEn: "Business Trip",
        description: "Хятадын бөөний зах",
        descriptionEn: "China wholesale markets",
        color: "from-amber-500 to-orange-500",
        href: "/ai/business",
        available: true,
    },
    {
        id: "medical",
        icon: Stethoscope,
        title: "Эмчилгээний Аялал",
        titleEn: "Medical Travel",
        description: "Гоо сайхан, шүд, нүд",
        descriptionEn: "Cosmetic, dental, vision",
        color: "from-green-500 to-emerald-500",
        href: "/ai/medical",
        available: true,
    },
];

export default function AIHubPage() {
    const { t, language } = useTranslation();
    const isMongolian = language === "mn";
    const [selectedPurpose, setSelectedPurpose] = useState("tourist");

    return (
        <div className="min-h-screen pb-32 md:pb-8 overflow-x-hidden">
            {/* Hero Section */}
            <section className="relative overflow-hidden">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-pink-600/20 dark:from-blue-900/30 dark:via-purple-900/20 dark:to-pink-900/30" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />

                <div className="container mx-auto px-6 py-12 md:py-20 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center max-w-3xl mx-auto"
                    >
                        {/* AI Icon */}
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.1 }}
                            className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/30"
                        >
                            <Bot className="w-10 h-10 text-white" />
                        </motion.div>

                        <h1 className="text-3xl md:text-5xl font-black mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                            GateSIM AI
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground font-medium mb-8">
                            {isMongolian
                                ? "Аялалын ухаалаг туслах - Бусад eSIM-ээс ялгарах AI платформ"
                                : "Smart Travel Assistant - AI platform that sets us apart"}
                        </p>

                        {/* Premium badge */}
                        <Link href="#premium">
                            <Badge
                                variant="outline"
                                className="px-4 py-2 text-sm font-bold border-amber-500/50 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 cursor-pointer"
                            >
                                <Crown className="w-4 h-4 mr-2" />
                                {isMongolian ? "Premium болох" : "Go Premium"}
                            </Badge>
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Travel Modes */}
            <section className="container mx-auto px-6 py-8">
                <h2 className="text-xl font-bold mb-4 text-center">
                    {isMongolian ? "Аяллын Зорилго" : "Travel Purpose"}
                </h2>
                <div className="flex flex-wrap justify-center gap-3">
                    {travelModes.map((mode, index) => {
                        const Icon = mode.icon;
                        const isSelected = selectedPurpose === mode.id;
                        return (
                            <motion.button
                                key={mode.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => setSelectedPurpose(mode.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-sm shadow-lg transition-all active:scale-95 ${isSelected
                                    ? `bg-gradient-to-r ${mode.color} text-white scale-105`
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {isMongolian ? mode.label : mode.labelEn}
                            </motion.button>
                        );
                    })}
                </div>
            </section>

            {/* AI Recommendations */}
            <section className="container mx-auto px-6 py-4">
                <AIRecommendations
                    purpose={selectedPurpose}
                    duration={7}
                    limit={6}
                />
            </section>

            {/* AI Features Grid */}
            <section className="container mx-auto px-6 py-8">
                <h2 className="text-xl font-bold mb-6">
                    <Sparkles className="w-5 h-5 inline mr-2 text-purple-500" />
                    {isMongolian ? "AI Боломжууд" : "AI Features"}
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {aiFeatures.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <motion.div
                                key={feature.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                {feature.available ? (
                                    <a href={feature.href}>
                                        <Card
                                            hover
                                            className="p-4 h-full relative overflow-hidden group"
                                        >
                                            <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3 shadow-lg`}>
                                                <Icon className="w-6 h-6 text-white" />
                                            </div>
                                            <h3 className="font-bold text-sm mb-1">
                                                {isMongolian ? feature.title : feature.titleEn}
                                            </h3>
                                            <p className="text-xs text-muted-foreground">
                                                {isMongolian ? feature.description : feature.descriptionEn}
                                            </p>
                                            <ChevronRight className="absolute bottom-4 right-4 w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                        </Card>
                                    </a>
                                ) : (
                                    <Card className="p-4 h-full relative overflow-hidden opacity-60">
                                        <div className="absolute top-2 right-2">
                                            <Badge variant="secondary" className="text-xs">
                                                <Lock className="w-3 h-3 mr-1" />
                                                {isMongolian ? "Тун удахгүй" : "Soon"}
                                            </Badge>
                                        </div>
                                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3 shadow-lg opacity-50`}>
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        <h3 className="font-bold text-sm mb-1">
                                            {isMongolian ? feature.title : feature.titleEn}
                                        </h3>
                                        <p className="text-xs text-muted-foreground">
                                            {isMongolian ? feature.description : feature.descriptionEn}
                                        </p>
                                    </Card>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </section>

            {/* AI Chat Section */}
            <section id="chat" className="container mx-auto px-6 py-8">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 md:p-8">
                    {/* Background effects */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                <MessageCircle className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">
                                    {isMongolian ? "AI Туслахтай ярилц" : "Chat with AI Assistant"}
                                </h2>
                                <p className="text-sm text-white/60">
                                    {isMongolian ? "Аялалын талаар юу ч асуугаарай" : "Ask anything about travel"}
                                </p>
                            </div>
                        </div>

                        {/* Embedded AI Chat */}
                        <div className="bg-slate-800/50 rounded-2xl border border-white/10 overflow-hidden">
                            <AIChat />
                        </div>
                    </div>
                </div>
            </section>

            {/* Premium Section */}
            <section id="premium" className="container mx-auto px-6 py-8">
                <Card className="p-6 md:p-8 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                            <Crown className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-2xl font-bold mb-2">
                                {isMongolian ? "AI Premium" : "AI Premium"}
                            </h2>
                            <p className="text-muted-foreground mb-4">
                                {isMongolian
                                    ? "Бүх AI боломжуудыг хязгааргүй ашиглах"
                                    : "Unlimited access to all AI features"}
                            </p>
                            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                <Badge variant="outline" className="text-xs">
                                    {isMongolian ? "Хязгааргүй чат" : "Unlimited chat"}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                    {isMongolian ? "Аялал төлөвлөгч" : "Trip planner"}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                    {isMongolian ? "Камер орчуулга" : "Camera translation"}
                                </Badge>
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-black text-amber-600 dark:text-amber-400">
                                $3.99<span className="text-sm font-normal text-muted-foreground">/сар</span>
                            </p>
                            <button className="mt-3 px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold shadow-lg hover:scale-105 transition-transform active:scale-95">
                                {isMongolian ? "Premium болох" : "Go Premium"}
                            </button>
                        </div>
                    </div>
                </Card>
            </section>
        </div>
    );
}
