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
    const { t, language } = useTranslation();
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<any>({
        destination: "",
        duration: "",
        purpose: "",
    });

    const isMongolian = language === 'mn';

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
            <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
                {/* --- Vibrant Backdrop --- */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/40 backdrop-blur-md"
                />

                {/* --- Apple Style Sheet / Modal --- */}
                <motion.div
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "100%", opacity: 0 }}
                    transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
                    className={cn(
                        "relative w-full max-w-md bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl",
                        "rounded-t-[32px] sm:rounded-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] sm:shadow-[0_20px_60px_rgba(0,0,0,0.2)]",
                        "border-t sm:border border-white/20 dark:border-white/10 overflow-hidden",
                        "flex flex-col max-h-[90vh]"
                    )}
                >
                    {/* --- Grabber / Handle (Mobile Only) --- */}
                    <div className="flex justify-center pt-3 pb-1 sm:hidden">
                        <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-white/10" />
                    </div>

                    {/* --- Close Button (Apple Standard) --- */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                        }}
                        className="absolute top-4 right-4 sm:top-6 sm:right-6 w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/20 transition-all z-[110] active:scale-90"
                    >
                        <X className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    </button>

                    {/* Progress Bar (Sleek Liquid) */}
                    <div className="px-8 pt-8 sm:pt-10 flex gap-1.5">
                        {steps.map((_, i) => (
                            <div
                                key={i}
                                className="h-1 flex-1 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden"
                            >
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: i <= currentStep ? "100%" : "0%" }}
                                    className={cn(
                                        "h-full transition-all duration-700",
                                        i === currentStep ? "bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.3)]" :
                                            i < currentStep ? "bg-red-600/40" : "bg-transparent"
                                    )}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="p-8 pb-10 sm:pb-8 flex-1 overflow-y-auto">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ x: 20, opacity: 0, filter: "blur(5px)" }}
                                animate={{ x: 0, opacity: 1, filter: "blur(0px)" }}
                                exit={{ x: -20, opacity: 0, filter: "blur(5px)" }}
                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                className="space-y-8"
                            >
                                {/* Header Section */}
                                <div className="space-y-4">
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-inner",
                                        stepInfo.color
                                    )}>
                                        <stepInfo.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                                        {t(stepInfo.questionKey as any)}
                                    </h2>
                                </div>

                                {/* Content Section */}
                                <div className="min-h-[140px]">
                                    {stepInfo.id === "purpose" ? (
                                        <div className="grid grid-cols-2 gap-3">
                                            {stepInfo.options?.map((opt) => {
                                                const isActive = formData[stepInfo.id] === opt.id;
                                                return (
                                                    <button
                                                        key={opt.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setFormData({ ...formData, [stepInfo.id]: opt.id });
                                                            setTimeout(handleNext, 400);
                                                        }}
                                                        className={cn(
                                                            "group flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden",
                                                            isActive
                                                                ? "border-red-600 bg-red-600 shadow-xl shadow-red-200 dark:shadow-red-900/10 scale-[1.02]"
                                                                : cn("border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] hover:border-slate-200 dark:hover:border-white/10 active:scale-95")
                                                        )}
                                                    >
                                                        <div className={cn(
                                                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500",
                                                            isActive ? "bg-white/20" : "bg-white dark:bg-zinc-800 shadow-sm"
                                                        )}>
                                                            <opt.icon className={cn("w-5 h-5", isActive ? "text-white" : opt.color)} />
                                                        </div>
                                                        <span className={cn(
                                                            "text-[10px] font-black uppercase tracking-wider",
                                                            isActive ? "text-white" : "text-slate-600 dark:text-slate-400"
                                                        )}>
                                                            {t(opt.labelKey as any)}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="relative">
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
                                                    "w-full bg-slate-100/50 dark:bg-white/[0.05] border-2 border-transparent focus:border-red-600/50 focus:bg-white dark:focus:bg-zinc-800",
                                                    "rounded-2xl px-6 py-5 text-xl font-black text-slate-900 dark:text-white transition-all outline-none placeholder:text-slate-300 dark:placeholder:text-zinc-700",
                                                    "shadow-inner"
                                                )}
                                                onKeyDown={(e) => e.key === "Enter" && formData[stepInfo.id] && handleNext()}
                                            />
                                            {formData[stepInfo.id] && (
                                                <div className="absolute right-6 top-1/2 -translate-y-1/2">
                                                    <Sparkles className="w-6 h-6 text-red-600 animate-pulse" />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Footer Section */}
                        <div className="mt-8 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={handleBack}
                                className={cn(
                                    "h-12 flex items-center gap-2 px-4 -ml-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-600 transition-all active:scale-95",
                                    currentStep === 0 && "opacity-0 pointer-events-none"
                                )}
                            >
                                <ChevronLeft className="w-4 h-4" />
                                {t("back")}
                            </button>

                            {stepInfo.id !== "purpose" && (
                                <Button
                                    type="button"
                                    disabled={!formData[stepInfo.id]}
                                    onClick={handleNext}
                                    className="h-14 bg-red-600 hover:bg-red-700 text-white rounded-2xl px-8 font-black text-xs uppercase tracking-widest flex items-center gap-3 transition-all active:scale-95 disabled:opacity-30 shadow-2xl shadow-red-500/20 border-none"
                                >
                                    {t("next")}
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
