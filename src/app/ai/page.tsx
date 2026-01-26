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
            {/* --- Elite Compact Background --- */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-5%] right-[-5%] w-[40%] h-[40%] bg-red-600/[0.04] blur-[100px] rounded-full" />
                <div className="absolute inset-0 opacity-[0.015] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] contrast-150" />
            </div>

            {/* --- Compact Pro Header --- */}
            <header className="relative z-10 px-6 pt-12 pb-6">
                <div className="max-w-xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center shadow-lg border border-white/20">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white leading-none">AI Hub</h1>
                            <p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400 mt-1">Intelligence Desktop</p>
                        </div>
                    </div>
                    {aiStatus?.isPremium && (
                        <Badge className="bg-red-600 text-white px-3 py-1 rounded-full font-black text-[8px] uppercase tracking-widest">
                            Pro
                        </Badge>
                    )}
                </div>
            </header>

            {/* --- Hero: Ultra Compact Pro Banner --- */}
            <section className="relative z-10 px-6 mb-6">
                <div className="max-w-xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card
                            onClick={() => setIsWizardOpen(true)}
                            className="group relative h-28 rounded-3xl bg-slate-950 border border-white/5 shadow-2xl flex items-center justify-between px-8 cursor-pointer overflow-hidden transition-all active:scale-[0.98]"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 via-transparent to-blue-600/10 opacity-30" />
                            <div className="relative z-10 space-y-1">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/40">AI Engine Ready</span>
                                </div>
                                <h2 className="text-xl font-black text-white tracking-tight">
                                    {isMongolian ? "Шинэ аялал эхлүүлэх" : "Start New Journey"}
                                </h2>
                            </div>
                            <div className="relative z-10 w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform duration-500">
                                <ArrowRight className="w-6 h-6 text-slate-950" />
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </section>

            {/* --- Features Grid: Pro Compact Tiles --- */}
            <section className="relative z-10 px-6 mb-8">
                <div className="max-w-xl mx-auto grid grid-cols-2 gap-4">
                    {aiFeatures.map((feature, idx) => (
                        <motion.div
                            key={feature.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + idx * 0.05 }}
                        >
                            <Link href={feature.href}>
                                <Card className="group relative h-full p-5 bg-white dark:bg-zinc-900/50 border border-slate-100 dark:border-white/5 rounded-2xl hover:border-red-600/30 transition-all hover:shadow-xl hover:-translate-y-1">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center border border-slate-100 dark:border-white/10 group-hover:bg-red-600 transition-colors shrink-0">
                                            <feature.icon className="w-5 h-5 text-slate-900 dark:text-white group-hover:text-white transition-colors" />
                                        </div>
                                        <div className="space-y-1 flex-1 min-w-0">
                                            <h4 className="font-black text-xs text-slate-900 dark:text-white tracking-tight truncate">
                                                {isMongolian ? feature.title : feature.titleEn}
                                            </h4>
                                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider leading-none">
                                                {isMongolian ? feature.description : feature.descriptionEn}
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* --- Status & Premium: Control Center Style --- */}
            <section className="relative z-10 px-6">
                <div className="max-w-xl mx-auto">
                    <Card className="p-6 bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-3xl space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-red-600" />
                                <h5 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white">Usage Monitoring</h5>
                            </div>
                            {!aiStatus?.isPremium && (
                                <button
                                    onClick={() => setIsPremiumModalOpen(true)}
                                    className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-[8px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-md active:scale-95"
                                >
                                    Go Pro
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-6">
                            {[
                                { label: "Plans", val: aiStatus?.remainingPlans, total: aiStatus?.planLimit, color: "bg-red-600" },
                                { label: "Analytics", val: aiStatus?.remainingTransit, total: aiStatus?.transitLimit, color: "bg-blue-600" },
                                { label: "Assets", val: aiStatus?.remainingPoster, total: aiStatus?.posterLimit, color: "bg-purple-600" },
                            ].map((s, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between items-baseline">
                                        <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">{s.label}</span>
                                        <span className="text-[10px] font-black text-slate-900 dark:text-white">{s.val}</span>
                                    </div>
                                    <div className="h-1 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(s.val / (s.total || 1)) * 100}%` }}
                                            className={cn("h-full", s.color)}
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
