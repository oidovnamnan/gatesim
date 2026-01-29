"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X, Sparkles, MapPin, Calendar, Rocket,
    ArrowRight, Check, Bot, Zap, Sun, CloudRain, Clock,
    Utensils, Heart, Users, GraduationCap, ChevronLeft,
    Globe, Star, Coffee, Plane, Compass, Music, Camera
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/providers/language-provider";

interface AICommandWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (data: any) => void;
}

const steps = [
    {
        id: "destination",
        questionKey: "wizardDestQuestion",
        placeholderKey: "wizardDestPlaceholder",
        icon: Globe,
        color: "from-blue-500 to-indigo-600",
    },
    {
        id: "duration",
        questionKey: "wizardDurQuestion",
        placeholderKey: "wizardDurPlaceholder",
        icon: Clock,
        color: "from-emerald-500 to-teal-600",
    },
    {
        id: "purpose",
        questionKey: "wizardPurposeQuestion",
        options: [
            { id: "tourist", labelKey: "purposeTourist", icon: MapPin, color: "text-blue-500", bg: "bg-blue-50" },
            { id: "business", labelKey: "purposeBusiness", icon: Zap, color: "text-amber-500", bg: "bg-amber-50" },
            { id: "shopping", labelKey: "purposeShopping", icon: Sparkles, color: "text-purple-500", bg: "bg-purple-50" },
            { id: "medical", labelKey: "purposeMedical", icon: CloudRain, color: "text-rose-500", bg: "bg-rose-50" },
            { id: "foodie", labelKey: "purposeFoodie", icon: Utensils, color: "text-orange-500", bg: "bg-orange-50" },
            { id: "relaxation", labelKey: "purposeRelaxation", icon: Heart, color: "text-pink-500", bg: "bg-pink-50" },
            { id: "adventure", labelKey: "purposeAdventure", icon: Rocket, color: "text-indigo-500", bg: "bg-indigo-50" },
            { id: "family", labelKey: "purposeFamily", icon: Users, color: "text-cyan-500", bg: "bg-cyan-50" },
            { id: "education", labelKey: "purposeEducation", icon: GraduationCap, color: "text-violet-500", bg: "bg-violet-50" },
            { id: "event", labelKey: "purposeEvent", icon: Star, color: "text-yellow-500", bg: "bg-yellow-50" },
        ],
        icon: Sparkles,
        color: "from-rose-500 to-red-600",
    }
];

export function AICommandWizard({ isOpen, onClose, onComplete }: AICommandWizardProps) {
    const { t } = useTranslation();
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<any>({
        destination: "",
        duration: "",
        purpose: "",
    });

    const handleNext = () => {
        const stepId = steps[currentStep].id;
        const currentData = formData[stepId];

        if (!currentData) return;

        if (stepId === "duration") {
            const val = parseInt(currentData);
            if (isNaN(val) || val <= 0) return;
        }

        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            onComplete(formData);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    if (!isOpen) return null;

    const stepInfo = steps[currentStep];

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
                {/* --- Cinematic Backdrop --- */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-950/40 backdrop-blur-xl"
                />

                {/* --- Ambient Light Orbs (Super Designer Touch) --- */}
                <div className="absolute inset-0 pointer-events-none">
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.5, 0.3],
                            x: [0, 50, 0],
                            y: [0, 30, 0]
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-red-500/10 blur-[120px] rounded-full"
                    />
                    <motion.div
                        animate={{
                            scale: [1.2, 1, 1.2],
                            opacity: [0.2, 0.4, 0.2],
                            x: [0, -40, 0],
                            y: [0, -50, 0]
                        }}
                        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-indigo-500/10 blur-[140px] rounded-full"
                    />
                </div>

                {/* --- Masterpiece Vision Modal --- */}
                <motion.div
                    initial={{ y: "100%", opacity: 0, scale: 0.95 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: "100%", opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", damping: 32, stiffness: 280, mass: 1 }}
                    className={cn(
                        "relative w-full max-w-xl bg-white/70 dark:bg-zinc-900/60 backdrop-blur-[40px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)]",
                        "rounded-t-[40px] sm:rounded-[48px] border-t sm:border border-white/40 dark:border-white/10",
                        "flex flex-col max-h-[92vh] ring-1 ring-black/5 dark:ring-white/5"
                    )}
                >
                    {/* --- Shimmer Handle --- */}
                    <div className="flex justify-center pt-5 pb-1 sm:hidden relative">
                        <div className="w-12 h-1.5 rounded-full bg-slate-400/20 dark:bg-white/10" />
                    </div>

                    {/* --- Elite Close Button --- */}
                    <button
                        onClick={(e) => { e.stopPropagation(); onClose(); }}
                        className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/50 dark:bg-white/5 text-slate-500 dark:text-slate-400 flex items-center justify-center hover:bg-white dark:hover:bg-white/10 border border-white/20 dark:border-white/10 transition-all z-[110] active:scale-90 group"
                    >
                        <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                    </button>

                    <div className="p-8 sm:p-12 space-y-12 flex-1 overflow-y-auto custom-scrollbar">
                        {/* Progress Liquid Line */}
                        <div className="flex gap-2.5">
                            {steps.map((_, i) => (
                                <div key={i} className="h-1.5 flex-1 bg-slate-200/50 dark:bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ x: "-100%" }}
                                        animate={{ x: i <= currentStep ? "0%" : "-100%" }}
                                        transition={{ type: "spring", damping: 20, stiffness: 100 }}
                                        className={cn(
                                            "h-full rounded-full transition-shadow duration-500",
                                            i === currentStep ? "bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]" : "bg-red-600/30"
                                        )}
                                    />
                                </div>
                            ))}
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ y: 30, opacity: 0, filter: "blur(15px)" }}
                                animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                                exit={{ y: -30, opacity: 0, filter: "blur(15px)" }}
                                transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
                                className="space-y-10"
                            >
                                {/* Hero Header Section */}
                                <div className="space-y-6">
                                    <motion.div
                                        whileHover={{ scale: 1.05, rotate: 5 }}
                                        className={cn(
                                            "w-16 h-16 rounded-3xl flex items-center justify-center shadow-2xl relative group overflow-hidden",
                                            stepInfo.color
                                        )}
                                    >
                                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <stepInfo.icon className="w-8 h-8 text-white relative z-10" />
                                    </motion.div>
                                    <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1] drop-shadow-sm">
                                        {t(stepInfo.questionKey as any)}
                                    </h2>
                                </div>

                                {/* Dynamic Interactive Layer */}
                                <div className="min-h-[220px]">
                                    {stepInfo.id === "purpose" ? (
                                        <div className="grid grid-cols-2 gap-4">
                                            {stepInfo.options?.map((opt, idx) => {
                                                const isActive = formData[stepInfo.id] === opt.id;
                                                return (
                                                    <motion.button
                                                        key={opt.id}
                                                        initial={{ opacity: 0, y: 15 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: idx * 0.05 }}
                                                        onClick={() => {
                                                            setFormData({ ...formData, [stepInfo.id]: opt.id });
                                                            setTimeout(handleNext, 400);
                                                        }}
                                                        className={cn(
                                                            "group flex flex-col items-center gap-4 p-6 rounded-[32px] border-2 transition-all duration-500 relative overflow-hidden",
                                                            isActive
                                                                ? "border-red-600 bg-red-600 shadow-[0_20px_40px_-5px_rgba(220,38,38,0.3)] scale-[1.03]"
                                                                : "border-white/50 dark:border-white/5 bg-white/40 dark:bg-white/[0.03] hover:border-slate-300 dark:hover:border-white/20 active:scale-95 shadow-sm hover:shadow-md"
                                                        )}
                                                    >
                                                        <div className={cn(
                                                            "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-inner",
                                                            isActive ? "bg-white/20" : "bg-white dark:bg-zinc-800"
                                                        )}>
                                                            <opt.icon className={cn("w-7 h-7", isActive ? "text-white" : opt.color)} />
                                                        </div>
                                                        <span className={cn(
                                                            "text-[12px] font-black uppercase tracking-[0.1em]",
                                                            isActive ? "text-white" : "text-slate-600 dark:text-slate-400"
                                                        )}>
                                                            {t(opt.labelKey as any)}
                                                        </span>
                                                        {isActive && (
                                                            <motion.div
                                                                layoutId="active-spark"
                                                                className="absolute top-3 right-3"
                                                            >
                                                                <Star className="w-3 h-3 text-white fill-white animate-pulse" />
                                                            </motion.div>
                                                        )}
                                                    </motion.button>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="relative group">
                                            <input
                                                autoFocus
                                                type={stepInfo.id === "duration" ? "number" : "text"}
                                                inputMode={stepInfo.id === "duration" ? "numeric" : "text"}
                                                value={formData[stepInfo.id]}
                                                onChange={(e) => {
                                                    let val = e.target.value;
                                                    if (stepInfo.id === "duration" && val) {
                                                        if (parseInt(val) < 1) val = "1";
                                                    }
                                                    setFormData({ ...formData, [stepInfo.id]: val });
                                                }}
                                                placeholder={t(stepInfo.placeholderKey as any)}
                                                className={cn(
                                                    "w-full bg-slate-100/30 dark:bg-white/[0.05] border-2 border-transparent focus:border-red-600/40 focus:bg-white dark:focus:bg-zinc-800/80",
                                                    "rounded-[32px] px-8 py-8 text-2xl font-black text-slate-900 dark:text-white transition-all outline-none placeholder:text-slate-300 dark:placeholder:text-zinc-700",
                                                    "shadow-[inset_0_2px_15px_rgba(0,0,0,0.02)] sm:text-4xl"
                                                )}
                                                onKeyDown={(e) => e.key === "Enter" && formData[stepInfo.id] && handleNext()}
                                            />
                                            <motion.div
                                                animate={{ opacity: formData[stepInfo.id] ? 1 : 0.3, scale: formData[stepInfo.id] ? 1.1 : 1 }}
                                                className="absolute right-8 top-1/2 -translate-y-1/2"
                                            >
                                                <div
                                                    className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center shadow-2xl shadow-red-500/40 cursor-pointer active:scale-90 transition-transform"
                                                    onClick={() => formData[stepInfo.id] && handleNext()}
                                                >
                                                    <ArrowRight className="w-6 h-6 text-white" />
                                                </div>
                                            </motion.div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Navigation Console */}
                        <div className="flex items-center justify-between mt-auto pt-6">
                            <motion.button
                                whileHover={{ x: -2 }}
                                whileTap={{ scale: 0.95 }}
                                type="button"
                                onClick={handleBack}
                                className={cn(
                                    "flex items-center gap-3 px-8 h-16 rounded-[32px] text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-500 transition-all active:bg-slate-100 dark:active:bg-white/5",
                                    currentStep === 0 && "opacity-0 pointer-events-none"
                                )}
                            >
                                <ChevronLeft className="w-5 h-5" />
                                {t("back")}
                            </motion.button>

                            {stepInfo.id !== "purpose" && (
                                <Button
                                    type="button"
                                    disabled={!formData[stepInfo.id]}
                                    onClick={handleNext}
                                    className={cn(
                                        "h-16 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[32px] px-12 font-black text-xs uppercase tracking-[0.2em] flex items-center gap-5 transition-all shadow-2xl overflow-hidden group/btn",
                                        "hover:bg-red-600 hover:text-white dark:hover:bg-red-600 disabled:opacity-10 active:scale-[0.97]"
                                    )}
                                >
                                    <span className="relative z-10">{t("next")}</span>
                                    <div className="w-7 h-7 rounded-full bg-white/20 dark:bg-black/5 flex items-center justify-center group-hover/btn:rotate-[-45deg] transition-transform duration-500">
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Elite Finishing Glow */}
                    <div className="h-2 w-1/2 mx-auto bg-gradient-to-r from-transparent via-red-600/20 to-transparent blur-md mb-2" />
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
