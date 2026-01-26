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
            {/* --- Elite Pro Background --- */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-15%] right-[-10%] w-[70%] h-[70%] bg-red-600/[0.07] blur-[140px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/[0.05] blur-[120px] rounded-full animate-pulse [animation-delay:3s]" />
                <div className="absolute inset-0 opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] contrast-150" />
            </div>

            {/* --- Pro Header --- */}
            <header className="relative z-10 px-8 pt-24 pb-12">
                <div className="max-w-xl mx-auto space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-4"
                    >
                        <div className="w-12 h-12 rounded-[22px] bg-red-600 flex items-center justify-center shadow-[0_12px_24px_-4px_rgba(220,38,38,0.4)] border border-white/20">
                            <Bot className="w-6 h-6 text-white" />
                        </div>
                        <div className="space-y-0.5">
                            <h1 className="text-4xl font-black tracking-tightest leading-none text-slate-900 dark:text-white">AI Hub</h1>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600/50 dark:text-red-500/70">Intelligence Professional</p>
                        </div>
                    </motion.div>
                </div>
            </header>

            {/* --- Hero: Liquid Elite Card --- */}
            <section className="relative z-10 px-8 mb-16">
                <div className="max-w-xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card
                            onClick={() => setIsWizardOpen(true)}
                            className="group relative h-56 rounded-[56px] bg-slate-950 border-none shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] flex flex-col justify-end p-12 cursor-pointer overflow-hidden transition-all active:scale-[0.97]"
                        >
                            {/* Liquid Material Effects */}
                            <div className="absolute inset-0 bg-gradient-to-br from-red-600/40 via-transparent to-blue-600/20 opacity-40 group-hover:opacity-60 transition-opacity" />
                            <div className="absolute top-0 right-0 w-[80%] h-full bg-[radial-gradient(circle_at_100%_0%,rgba(220,38,38,0.25)_0%,transparent_70%)]" />
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] contrast-150" />

                            {/* Inner Glow Border */}
                            <div className="absolute inset-0 rounded-[56px] border border-white/10" />

                            <div className="relative z-10 flex items-end justify-between">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Ready to Assist</span>
                                    </div>
                                    <h2 className="text-4xl font-black text-white tracking-tightest leading-none">
                                        {isMongolian ? "Шинэ аялал\nэхлүүлэх" : "Start New\nJourney"}
                                    </h2>
                                </div>
                                <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.2)] group-hover:scale-110 transition-all duration-500 group-hover:rotate-12">
                                    <ArrowRight className="w-10 h-10 text-slate-950" />
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </section>

            {/* --- Features Grid: Material Tiles --- */}
            <section className="relative z-10 px-8 mb-16">
                <div className="max-w-xl mx-auto grid grid-cols-2 gap-6">
                    {aiFeatures.map((feature, idx) => (
                        <motion.div
                            key={feature.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + idx * 0.05 }}
                        >
                            <Link href={feature.href}>
                                <Card className="group relative h-full p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/[0.03] rounded-[48px] shadow-sm hover:shadow-2xl hover:shadow-red-500/[0.07] transition-all duration-700 hover:-translate-y-3">
                                    {/* Subtle Tile Textures */}
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-[48px] bg-[radial-gradient(circle_at_0%_0%,rgba(220,38,38,0.03)_0%,transparent_50%)]" />

                                    <div className="w-16 h-16 rounded-[28px] bg-slate-50 dark:bg-white/[0.03] flex items-center justify-center mb-8 shadow-inner border border-slate-100 dark:border-white/[0.05] group-hover:bg-red-600 group-hover:border-red-500 group-hover:shadow-[0_12px_24px_-4px_rgba(220,38,38,0.3)] transition-all duration-500">
                                        <feature.icon className="w-7 h-7 text-slate-900 dark:text-white group-hover:text-white transition-all duration-500 group-hover:scale-110" />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-black text-lg text-slate-900 dark:text-white tracking-tight leading-tight">{isMongolian ? feature.title : feature.titleEn}</h4>
                                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em] leading-tight">
                                            {isMongolian ? feature.description : feature.descriptionEn}
                                        </p>
                                    </div>
                                </Card>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* --- Status & Premium: Dashboard Section --- */}
            <section className="relative z-10 px-8">
                <div className="max-w-xl mx-auto">
                    <Card className="p-12 bg-white/50 dark:bg-[#0a0a0b] backdrop-blur-3xl border border-slate-100 dark:border-white/[0.03] rounded-[64px] space-y-12 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h5 className="text-[12px] font-black uppercase tracking-[0.4em] text-slate-900 dark:text-white flex items-center gap-3">
                                    <Zap className="w-5 h-5 text-red-600" />
                                    {isMongolian ? "System Usage" : "System Usage"}
                                </h5>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-8">Enterprise Quota monitoring</p>
                            </div>
                            {!aiStatus?.isPremium && (
                                <button
                                    onClick={() => setIsPremiumModalOpen(true)}
                                    className="px-6 py-3 rounded-2xl bg-red-600 text-white text-[11px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 active:scale-95"
                                >
                                    {isMongolian ? "Go Pro" : "Go Pro"}
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-12">
                            {[
                                { label: isMongolian ? "Төлөвлөлт / Intelligent Plans" : "Plans", val: aiStatus?.remainingPlans, total: aiStatus?.planLimit, color: "from-red-600 to-rose-400" },
                                { label: isMongolian ? "Төлбөр / Transit Analytics" : "Transit", val: aiStatus?.remainingTransit, total: aiStatus?.transitLimit, color: "from-blue-600 to-cyan-400" },
                                { label: isMongolian ? "Медиа / Visual Assets" : "Poster", val: aiStatus?.remainingPoster, total: aiStatus?.posterLimit, color: "from-purple-600 to-pink-400" },
                            ].map((s, i) => (
                                <div key={i} className="space-y-5">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">{s.label}</span>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-black text-slate-900 dark:text-white">{s.val}</span>
                                            <span className="text-xs font-bold text-slate-400">/ {s.total}</span>
                                        </div>
                                    </div>
                                    <div className="h-3 bg-slate-100 dark:bg-white/[0.03] rounded-full overflow-hidden p-0.5">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(s.val / (s.total || 1)) * 100}%` }}
                                            className={cn("h-full rounded-full bg-gradient-to-r shadow-lg", s.color)}
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
