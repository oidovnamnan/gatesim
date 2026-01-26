"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X, Sparkles, MapPin, Calendar, Rocket,
    ArrowRight, Check, Bot, Zap, Sun, CloudRain, Clock,
    Utensils, Heart, Users, GraduationCap, ChevronLeft,
    Search, Globe, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AICommandWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (data: any) => void;
}

const steps = [
    {
        id: "destination",
        question: "Хаашаа явахаар төлөвлөж байна?",
        questionEn: "Where are you planning to go?",
        placeholder: "Хотын нэр...",
        icon: Globe,
    },
    {
        id: "duration",
        question: "Хэд хоног аялах вэ?",
        questionEn: "How many days is your trip?",
        placeholder: "Хоногийн тоо...",
        icon: Clock,
    },
    {
        id: "purpose",
        question: "Аяллын үндсэн зорилго юу вэ?",
        questionEn: "What is the main purpose?",
        options: [
            { id: "tourist", label: "Жуулчлал", icon: MapPin },
            { id: "business", label: "Бизнес", icon: Zap },
            { id: "shopping", label: "Шопинг", icon: Sparkles },
            { id: "medical", label: "Эмчилгээ", icon: Sparkles },
            { id: "foodie", label: "Хоол", icon: Utensils },
            { id: "relaxation", label: "Амралт", icon: Heart },
            { id: "adventure", label: "Адал явдал", icon: Rocket },
            { id: "family", label: "Гэр бүл", icon: Users },
            { id: "education", label: "Боловсрол", icon: GraduationCap },
            { id: "event", label: "Эвент", icon: Star },
        ],
        icon: Sparkles,
    }
];

export function AICommandWizard({ isOpen, onClose, onComplete }: AICommandWizardProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<any>({
        destination: "",
        duration: "",
        purpose: "",
    });

    const handleNext = () => {
        const currentData = formData[steps[currentStep].id];
        if (!currentData) return;

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
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* --- Backdrop --- */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-950/40 backdrop-blur-[12px] transition-all"
                />

                {/* --- Luxury Modal Container --- */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-[48px] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] border border-white/20 dark:border-slate-800/30 overflow-hidden"
                >
                    {/* Noise Texture Overaly */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] contrast-150" />

                    {/* Progress Bar (Ultra Thin Luxury) */}
                    <div className="absolute top-0 left-0 w-full flex h-1.5 px-12 pt-10 gap-1.5">
                        {steps.map((_, i) => (
                            <motion.div
                                key={i}
                                layoutId={`progress-${i}`}
                                className={cn(
                                    "h-1 flex-1 rounded-full transition-all duration-700",
                                    i <= currentStep ? "bg-slate-900 dark:bg-white" : "bg-slate-100 dark:bg-slate-800"
                                )}
                            />
                        ))}
                    </div>

                    {/* Close Action */}
                    <button
                        onClick={onClose}
                        className="absolute top-10 right-10 p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all z-10 group"
                    >
                        <X className="w-5 h-5 text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
                    </button>

                    <div className="p-10 pt-24 pb-12">
                        {/* Question Section */}
                        <div className="min-h-[220px]">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentStep}
                                    initial={{ x: 20, opacity: 0, filter: "blur(10px)" }}
                                    animate={{ x: 0, opacity: 1, filter: "blur(0px)" }}
                                    exit={{ x: -20, opacity: 0, filter: "blur(10px)" }}
                                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                    className="space-y-8"
                                >
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 rounded-xl bg-slate-950 dark:bg-white shrink-0">
                                                <stepInfo.icon className="w-4 h-4 text-white dark:text-slate-950" />
                                            </div>
                                            <h2 className="text-3xl font-black tracking-tightest text-slate-900 dark:text-white leading-[1.1]">
                                                {stepInfo.question}
                                            </h2>
                                        </div>
                                    </div>

                                    {stepInfo.id === "purpose" ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                            {stepInfo.options?.map((opt) => {
                                                const isActive = formData[stepInfo.id] === opt.id;
                                                return (
                                                    <button
                                                        key={opt.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setFormData({ ...formData, [stepInfo.id]: opt.id });
                                                            setTimeout(handleNext, 300);
                                                        }}
                                                        className={cn(
                                                            "flex flex-col items-center gap-3 p-4 rounded-3xl border-2 transition-all duration-500 relative group overflow-hidden",
                                                            isActive
                                                                ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900 shadow-xl scale-105"
                                                                : "border-slate-50 bg-slate-50/50 hover:border-slate-200 dark:border-slate-800 dark:bg-slate-800/30 dark:hover:border-slate-700"
                                                        )}
                                                    >
                                                        {isActive && (
                                                            <motion.div
                                                                layoutId="active-glow"
                                                                className="absolute inset-0 bg-white/10 dark:bg-black/5"
                                                            />
                                                        )}
                                                        <opt.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive ? "text-current" : "text-slate-400")} />
                                                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">{opt.label}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="group relative">
                                            <input
                                                autoFocus
                                                type={stepInfo.id === "duration" ? "number" : "text"}
                                                value={formData[stepInfo.id]}
                                                onChange={(e) => setFormData({ ...formData, [stepInfo.id]: e.target.value })}
                                                placeholder={stepInfo.placeholder}
                                                className="w-full bg-slate-50 dark:bg-slate-800/30 border-2 border-slate-100 dark:border-slate-800 rounded-[28px] p-6 text-xl font-black text-slate-900 dark:text-white focus:border-slate-950 dark:focus:border-white transition-all outline-none placeholder:text-slate-300 dark:placeholder:text-slate-700"
                                                onKeyDown={(e) => e.key === "Enter" && formData[stepInfo.id] && handleNext()}
                                            />
                                            {formData[stepInfo.id] && (
                                                <div className="absolute right-6 top-1/2 -translate-y-1/2">
                                                    <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-white flex items-center justify-center animate-in zoom-in-50 duration-300">
                                                        <Check className="w-4 h-4 text-white dark:text-slate-900" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Footer Actions (Luxury Compact) */}
                        <div className="mt-12 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={handleBack}
                                className={cn(
                                    "flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all",
                                    currentStep === 0 && "opacity-0 pointer-events-none"
                                )}
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Буцах
                            </button>

                            {stepInfo.id !== "purpose" && (
                                <Button
                                    type="button"
                                    disabled={!formData[stepInfo.id]}
                                    onClick={handleNext}
                                    className="h-14 bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-white rounded-[24px] px-10 font-black text-xs flex items-center gap-3 transition-all active:scale-95 disabled:opacity-20 shadow-2xl shadow-slate-900/10 dark:shadow-white/5"
                                >
                                    Дараах
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
