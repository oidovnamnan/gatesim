"use client";

import { useState, useEffect } from "react";
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
    Zap,
    Compass,
    Stars,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/providers/language-provider";
import { cn } from "@/lib/utils";
import { AIPremiumModal } from "@/components/ai/ai-premium-modal";
import { AICommandWizard } from "@/components/ai/ai-command-wizard";
import { useRouter } from "next/navigation";

// Main AI features with enhanced colors and vibes
const aiFeatures = [
    {
        id: "planner",
        icon: Map,
        title: "Аялал Төлөвлөгч",
        titleEn: "Trip Planner",
        description: "Маршрут болон төлөвлөгөө боловсруулах",
        descriptionEn: "Smart itinerary and route planning",
        color: "from-cyan-400 to-blue-600",
        href: "/ai/planner",
    },
    {
        id: "translator",
        icon: Languages,
        title: "Орчуулагч",
        titleEn: "Translator",
        description: "Дуут болон бичгэн орчуулга",
        descriptionEn: "Voice and text translation",
        color: "from-purple-400 to-indigo-600",
        href: "/ai/translator",
    },
    {
        id: "expense",
        icon: ShoppingBag,
        title: "Зардал Хөтлөгч",
        titleEn: "Expense Tracker",
        description: "Аялалын зардлаа хялбар удирдах",
        descriptionEn: "Smart travel expense management",
        color: "from-rose-400 to-orange-500",
        href: "/ai/expenses",
    },
    {
        id: "medical",
        icon: Stethoscope,
        title: "Эмчилгээний Туслах",
        titleEn: "Medical Assistant",
        description: "Эмнэлэг хайх, шинж тэмдэг тайлбарлах",
        descriptionEn: "Find clinics and explain symptoms",
        color: "from-emerald-400 to-teal-600",
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
        // Navigate to planner with pre-filled data or handle it
        router.push(`/ai/planner?destination=${encodeURIComponent(data.destination)}&duration=${data.duration}&purpose=${data.purpose}`);
    };

    return (
        <div className="relative min-h-screen pb-32 bg-[#020617] text-white selection:bg-blue-500/30 overflow-hidden">
            {/* --- Futuristic Background Layer --- */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Nebula Effects */}
                <motion.div
                    animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.2, 1] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full"
                />
                <motion.div
                    animate={{ x: [0, -40, 0], y: [0, 60, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute top-1/4 -right-40 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full"
                />
                <motion.div
                    animate={{ x: [0, 30, 0], y: [0, -50, 0] }}
                    transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 4 }}
                    className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-cyan-600/10 blur-[100px] rounded-full"
                />

                {/* Grid Overlay */}
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20" />
            </div>

            {/* --- Header Section --- */}
            <header className="relative z-10 px-6 pt-12 pb-10">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-2 mb-2"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-[pulse_2s_infinite]" />
                            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400/80">
                                {isMongolian ? "Ирээдүйн аялал" : "Future of Travel"}
                            </h2>
                        </motion.div>
                        <h1 className="text-4xl font-black tracking-tighter flex items-center gap-4 text-white">
                            AI Hub
                            <Sparkles className="w-7 h-7 text-blue-400 fill-blue-400/20 animate-pulse" />
                        </h1>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl flex items-center justify-center shadow-2xl relative group"
                    >
                        <div className="absolute inset-0 bg-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Bot className="w-7 h-7 text-blue-400 relative z-10" />
                    </motion.button>
                </div>
            </header>

            {/* --- Main Hero / Portal Trigger --- */}
            <section className="relative z-10 px-6 mb-12">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-2xl mx-auto"
                >
                    <Card
                        onClick={() => setIsWizardOpen(true)}
                        className="group relative p-8 rounded-[40px] bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-white/10 backdrop-blur-2xl hover:border-blue-500/50 hover:shadow-[0_0_50px_-12px_rgba(59,130,246,0.3)] transition-all duration-700 cursor-pointer overflow-hidden"
                    >
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2.5s_infinite] transition-transform pointer-events-none" />

                        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                            <div className="w-24 h-24 rounded-3xl bg-blue-600/20 flex items-center justify-center relative shadow-2xl group-hover:scale-105 transition-transform duration-700">
                                <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 group-hover:opacity-40" />
                                <Compass className="w-12 h-12 text-blue-400 animate-[spin_10s_linear_infinite]" />
                            </div>

                            <div className="flex-1 text-center md:text-left space-y-2">
                                <h3 className="text-2xl font-black tracking-tight text-white group-hover:text-blue-400 transition-colors">
                                    {isMongolian ? "Шинэ аялал эхлүүлэх" : "Start a New Journey"}
                                </h3>
                                <p className="text-sm text-slate-400 font-medium">
                                    {isMongolian
                                        ? "AI ассистенттай ярилцаж өөрийн төгс аяллын төлөвлөгөөг гаргаарай."
                                        : "Talk to AI to create your personalized dream itinerary right now."}
                                </p>
                            </div>

                            <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-2xl px-8 h-12 font-black shadow-lg shadow-blue-500/20 flex items-center gap-2 group-hover:px-10 transition-all">
                                Go
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1" />
                            </Button>
                        </div>
                    </Card>
                </motion.div>
            </section>

            {/* --- Features Grid --- */}
            <section className="relative z-10 px-6 mb-12">
                <div className="max-w-2xl mx-auto grid grid-cols-2 gap-4">
                    {aiFeatures.map((feature, idx) => (
                        <motion.div
                            key={feature.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 + idx * 0.1 }}
                        >
                            <Link href={feature.href}>
                                <Card className="group relative h-full p-6 bg-white/5 border border-white/5 backdrop-blur-xl hover:bg-white/10 hover:border-white/20 transition-all duration-500 rounded-[32px] overflow-hidden">
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-xl group-hover:scale-110 transition-transform bg-gradient-to-br",
                                        feature.color
                                    )}>
                                        <feature.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <h4 className="font-black text-sm text-white mb-1">{isMongolian ? feature.title : feature.titleEn}</h4>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                                        {isMongolian ? feature.description : feature.descriptionEn}
                                    </p>

                                    <div className="absolute bottom-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ArrowUpRight className="w-4 h-4 text-blue-400" />
                                    </div>
                                </Card>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* --- Usage & Status (Glassmorphic Banner) --- */}
            <section className="relative z-10 px-6 mb-10">
                <div className="max-w-2xl mx-auto">
                    <Card className="p-6 bg-blue-500/5 border border-blue-500/10 backdrop-blur-3xl rounded-[32px] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl -mr-16 -mt-16" />

                        <div className="flex items-center justify-between mb-6">
                            <h5 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-blue-400">
                                <Zap className="w-4 h-4 fill-blue-400" />
                                {isMongolian ? "Төлөв" : "AI Status"}
                            </h5>
                            <button
                                onClick={() => setIsPremiumModalOpen(true)}
                                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter text-amber-400 hover:text-amber-300 transition-colors"
                            >
                                <Crown className="w-3 h-3 fill-amber-400" />
                                {isMongolian ? "Premium болох" : "Go Premium"}
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-6">
                            {[
                                { label: isMongolian ? "Төлөвлөгөө" : "Plans", val: aiStatus?.remainingPlans, total: aiStatus?.planLimit },
                                { label: isMongolian ? "Тээвэр" : "Transit", val: aiStatus?.remainingTransit, total: aiStatus?.transitLimit },
                                { label: isMongolian ? "Зураг" : "Poster", val: aiStatus?.remainingPoster, total: aiStatus?.posterLimit },
                            ].map((s, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(s.val / s.total) * 100}%` }}
                                            className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                                        <span className="text-slate-500">{s.label}</span>
                                        <span className="text-white">{s.val}/{s.total}</span>
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

function ArrowUpRight(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M7 7h10v10" />
            <path d="M7 17 17 7" />
        </svg>
    )
}
