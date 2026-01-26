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
            {/* --- Vibrant Luxury Background --- */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-600/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse [animation-delay:2s]" />
                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] contrast-150" />
            </div>

            {/* --- Header --- */}
            <header className="relative z-10 px-8 pt-20 pb-12">
                <div className="max-w-xl mx-auto space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3"
                    >
                        <div className="w-10 h-10 rounded-2xl bg-red-600 flex items-center justify-center shadow-[0_8px_20px_rgba(220,38,38,0.3)]">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-[0.5em] text-red-600/60 dark:text-red-500/80">
                            {isMongolian ? "Ухаалаг систем" : "GateSIM Intelligence"}
                        </span>
                    </motion.div>

                    <div className="flex items-center justify-between">
                        <h1 className="text-5xl font-black tracking-tightest leading-none bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                            AI Hub
                        </h1>
                        {aiStatus?.isPremium && (
                            <Badge className="bg-red-600 text-white px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl shadow-red-200 dark:shadow-red-900/20">
                                Premium
                            </Badge>
                        )}
                    </div>
                </div>
            </header>

            {/* --- Hero: Quick Start Action --- */}
            <section className="relative z-10 px-8 mb-16">
                <div className="max-w-xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card
                            onClick={() => setIsWizardOpen(true)}
                            className="group relative h-48 rounded-[48px] bg-slate-900 dark:bg-white border-none shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)] dark:shadow-[0_40px_80px_-20px_rgba(255,255,255,0.1)] flex flex-col justify-end p-10 cursor-pointer overflow-hidden transition-all active:scale-[0.98]"
                        >
                            {/* Material Polish & Color Flow */}
                            <div className="absolute inset-0 opacity-40 pointer-events-none bg-[radial-gradient(circle_at_2px_2px,rgba(220,38,38,0.3)_1px,transparent_0)] bg-[size:40px_40px]" />
                            <div className="absolute top-0 right-0 w-[60%] h-full bg-gradient-to-bl from-red-600/30 to-transparent dark:from-red-600/10" />

                            <div className="relative z-10 flex items-center justify-between">
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-black text-white dark:text-slate-950 tracking-tight">
                                        {isMongolian ? "Шинэ аялал эхлүүлэх" : "Start a Journey"}
                                    </h2>
                                    <p className="text-white/40 dark:text-slate-950/40 font-bold text-sm">
                                        {isMongolian ? "Төгс төлөвлөгөөг AI-тай хамт" : "Plan with AI in seconds"}
                                    </p>
                                </div>
                                <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-[0_0_40px_rgba(220,38,38,0.5)] group-hover:scale-110 transition-all">
                                    <ArrowRight className="w-8 h-8 text-white" />
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </section>

            {/* --- Features Grid: Vibrant Tiles --- */}
            <section className="relative z-10 px-8 mb-16">
                <div className="max-w-xl mx-auto grid grid-cols-2 gap-5">
                    {aiFeatures.map((feature, idx) => (
                        <motion.div
                            key={feature.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + idx * 0.05 }}
                        >
                            <Link href={feature.href}>
                                <Card className="group relative h-full p-7 bg-white dark:bg-slate-900 border-2 border-slate-50 dark:border-slate-800 rounded-[40px] hover:border-red-600/30 transition-all duration-500 hover:shadow-2xl hover:shadow-red-500/5 hover:-translate-y-2">
                                    <div className="w-14 h-14 rounded-3xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6 shadow-sm border border-slate-100 dark:border-slate-700 group-hover:bg-red-600 group-hover:shadow-[0_8px_20px_rgba(220,38,38,0.3)] transition-all">
                                        <feature.icon className="w-6 h-6 text-slate-900 dark:text-white group-hover:text-white transition-colors" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <h4 className="font-black text-[15px] text-slate-900 dark:text-white tracking-tight leading-tight">{isMongolian ? feature.title : feature.titleEn}</h4>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] leading-none">
                                            {isMongolian ? feature.description : feature.descriptionEn}
                                        </p>
                                    </div>
                                </Card>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* --- Status & Premium: Vibrant Banner --- */}
            <section className="relative z-10 px-8">
                <div className="max-w-xl mx-auto">
                    <Card className="p-10 bg-white/80 dark:bg-slate-900/60 backdrop-blur-2xl border-2 border-slate-50 dark:border-slate-800 rounded-[48px] space-y-10 shadow-xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-red-600" />
                                <h5 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white">
                                    {isMongolian ? "AI Хэрэглээний Хязгаар" : "AI Limit & Usage"}
                                </h5>
                            </div>
                            {!aiStatus?.isPremium && (
                                <button
                                    onClick={() => setIsPremiumModalOpen(true)}
                                    className="text-[11px] font-black uppercase tracking-widest text-red-600 hover:text-red-700 underline underline-offset-8 decoration-2"
                                >
                                    {isMongolian ? "Premium болох" : "Go Premium"}
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-10">
                            {[
                                { label: isMongolian ? "Аялал" : "Plans", val: aiStatus?.remainingPlans, total: aiStatus?.planLimit, color: "bg-red-600" },
                                { label: isMongolian ? "Тээвэр" : "Transit", val: aiStatus?.remainingTransit, total: aiStatus?.transitLimit, color: "bg-blue-600" },
                                { label: isMongolian ? "Зураг" : "Poster", val: aiStatus?.remainingPoster, total: aiStatus?.posterLimit, color: "bg-purple-600" },
                            ].map((s, i) => (
                                <div key={i} className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{s.label}</span>
                                        <span className="text-sm font-black text-slate-900 dark:text-white">{s.val}/{s.total}</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
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
