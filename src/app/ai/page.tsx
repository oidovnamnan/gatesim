"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
    Sparkles,
    Map,
    Languages,
    Crown,
    ChevronRight,
    Bot,
    Stethoscope,
    ShoppingBag,
    Plane,
    Bus,
    Zap,
    Compass,
    Plus,
    ArrowUpRight,
    ArrowRight,
    Image as LucideImage
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/providers/language-provider";
import { cn } from "@/lib/utils";
import { AIPremiumModal } from "@/components/ai/ai-premium-modal";
import { AICommandWizard } from "@/components/ai/ai-command-wizard";
import { useRouter } from "next/navigation";

// Restored & Cleaned AI features
const aiFeatures = [
    {
        id: "planner",
        icon: Map,
        title: "Аялал Төлөвлөгч",
        titleEn: "Trip Planner",
        description: "Маршрут болон төлөвлөгөө боловсруулах",
        descriptionEn: "Smart itinerary and route planning",
        href: "/ai/planner",
    },
    {
        id: "transit",
        icon: Bus,
        title: "Нийтийн Тээвэр",
        titleEn: "Transit Guide",
        description: "Цэвэрхэн, хялбар замын хөтөч",
        descriptionEn: "Seamless navigation with AI",
        href: "/ai/transit",
    },
    {
        id: "translator",
        icon: Languages,
        title: "Орчуулагч",
        titleEn: "Translator",
        description: "Дуут болон бичгэн орчуулга",
        descriptionEn: "Voice and text translation",
        href: "/ai/translator",
    },
    {
        id: "poster",
        icon: LucideImage,
        title: "Аялалын Дурсамж",
        titleEn: "Memory Art",
        description: "Зургийг арт болгож хувиргах",
        descriptionEn: "Turn photos into AI art",
        href: "/ai/poster",
    },
    {
        id: "expense",
        icon: ShoppingBag,
        title: "Зардал Хөтлөгч",
        titleEn: "Expense Tracker",
        description: "Аялалын зардлаа хялбар удирдах",
        descriptionEn: "Smart travel expense management",
        href: "/ai/expenses",
    },
    {
        id: "medical",
        icon: Stethoscope,
        title: "Эмчилгээний Туслах",
        titleEn: "Medical Assistant",
        description: "Эмнэлэг хайх, шинж тэмдэг тайлбарлах",
        descriptionEn: "Find clinics and explain symptoms",
        href: "/ai/medical",
    },
];

export default function AIHubPage() {
    const { language } = useTranslation();
    const isMongolian = language === "mn";
    const router = useRouter();

    const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [aiStatus, setAiStatus] = useState<any>(null);
    const [isLoadingStatus, setIsLoadingStatus] = useState(true);

    // Fetch AI Status
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch("/api/ai/usage");
                if (res.ok) {
                    const data = await res.json();
                    setAiStatus(data);
                }
            } catch (error) {
                console.error("Failed to fetch AI status:", error);
            } finally {
                setIsLoadingStatus(false);
            }
        };

        fetchStatus();
    }, []);

    const handleWizardComplete = (data: any) => {
        setIsWizardOpen(false);
        // Explicit skip-to-next-step logic by passing wizard=true and pre-filled data
        router.push(`/ai/planner?wizard=true&destination=${encodeURIComponent(data.destination)}&duration=${data.duration}&purpose=${data.purpose}`);
    };

    return (
        <div className="relative min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white selection:bg-slate-900 selection:text-white pb-32 overflow-x-hidden">
            {/* --- Minimalist Background --- */}
            <div className="absolute inset-0 pointer-events-none opacity-40">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
            </div>

            {/* --- Header --- */}
            <header className="relative z-10 px-6 pt-16 pb-12">
                <div className="max-w-2xl mx-auto space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2"
                    >
                        <Bot className="w-5 h-5 text-slate-900 dark:text-white" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                            {isMongolian ? "Ухаалаг систем" : "GateSIM Intelligence"}
                        </span>
                    </motion.div>

                    <div className="flex items-center justify-between">
                        <h1 className="text-5xl font-black tracking-tightest">
                            AI Hub
                        </h1>
                        {aiStatus?.isPremium && (
                            <Badge className="bg-slate-900 text-white dark:bg-white dark:text-slate-950 px-3 py-1 rounded-full font-black text-[10px] uppercase">
                                Premium
                            </Badge>
                        )}
                    </div>
                </div>
            </header>

            {/* --- Hero: Quick Start Action --- */}
            <section className="relative z-10 px-6 mb-16">
                <div className="max-w-2xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card
                            onClick={() => setIsWizardOpen(true)}
                            className="group relative h-48 rounded-[40px] bg-slate-900 dark:bg-white border-none shadow-2xl flex flex-col justify-end p-8 cursor-pointer overflow-hidden transition-all active:scale-[0.98]"
                        >
                            {/* Texture/Pattern */}
                            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] dark:bg-[radial-gradient(circle_at_2px_2px,black_1px,transparent_0)] bg-[size:24px_24px]" />

                            <div className="relative z-10 flex items-center justify-between">
                                <div className="space-y-1">
                                    <h2 className="text-3xl font-black text-white dark:text-slate-950 tracking-tight">
                                        {isMongolian ? "Шинэ аялал эхлүүлэх" : "Start a Journey"}
                                    </h2>
                                    <p className="text-white/50 dark:text-slate-950/50 font-bold text-sm">
                                        {isMongolian ? "AI-тай хамт төгс төлөвлөгөө гаргаарай" : "Plan your dream trip with AI in seconds"}
                                    </p>
                                </div>
                                <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-950 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                                    <ArrowRight className="w-8 h-8 text-slate-900 dark:text-white" />
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </section>

            {/* --- Features Grid: Minimalist Tiles --- */}
            <section className="relative z-10 px-6 mb-16">
                <div className="max-w-2xl mx-auto grid grid-cols-2 gap-4">
                    {aiFeatures.map((feature, idx) => (
                        <motion.div
                            key={feature.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + idx * 0.05 }}
                        >
                            <Link href={feature.href}>
                                <Card className="group relative h-full p-6 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-[32px] hover:bg-white dark:hover:bg-slate-800 transition-all duration-300">
                                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center mb-6 shadow-sm border border-slate-100 dark:border-slate-700 group-hover:scale-105 transition-transform">
                                        <feature.icon className="w-6 h-6 text-slate-900 dark:text-white" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-black text-sm text-slate-900 dark:text-white tracking-tight">{isMongolian ? feature.title : feature.titleEn}</h4>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                                            {isMongolian ? feature.description : feature.descriptionEn}
                                        </p>
                                    </div>
                                    <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ArrowUpRight className="w-4 h-4 text-slate-300" />
                                    </div>
                                </Card>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* --- Status & Premium: Clean Banner --- */}
            <section className="relative z-10 px-6">
                <div className="max-w-2xl mx-auto">
                    <Card className="p-8 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-[40px] space-y-8">
                        <div className="flex items-center justify-between">
                            <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                AI Limit & Usage
                            </h5>
                            {!aiStatus?.isPremium && (
                                <button
                                    onClick={() => setIsPremiumModalOpen(true)}
                                    className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white hover:underline underline-offset-4 decoration-2"
                                >
                                    {isMongolian ? "Premium болох" : "Go Premium"}
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-8">
                            {[
                                { label: isMongolian ? "Аялал" : "Plans", val: aiStatus?.remainingPlans, total: aiStatus?.planLimit },
                                { label: isMongolian ? "Тээвэр" : "Transit", val: aiStatus?.remainingTransit, total: aiStatus?.transitLimit },
                                { label: isMongolian ? "Зураг" : "Poster", val: aiStatus?.remainingPoster, total: aiStatus?.posterLimit },
                            ].map((s, i) => (
                                <div key={i} className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{s.label}</span>
                                        <span className="text-sm font-black text-slate-900 dark:text-white">{s.val}/{s.total}</span>
                                    </div>
                                    <div className="h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(s.val / s.total) * 100}%` }}
                                            className="h-full bg-slate-900 dark:bg-white"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </section>

            {/* --- Modals --- */}
            <AICommandWizard
                isOpen={isWizardOpen}
                onClose={() => setIsWizardOpen(false)}
                onComplete={handleWizardComplete}
            />

            <AIPremiumModal
                isOpen={isPremiumModalOpen}
                onClose={() => setIsPremiumModalOpen(false)}
            />
        </div>
    );
}
