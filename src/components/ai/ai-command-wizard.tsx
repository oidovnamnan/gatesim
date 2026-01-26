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
        color: "from-blue-500 to-indigo-600",
    },
    {
        id: "duration",
        question: "Хэд хоног аялах вэ?",
        questionEn: "How many days is your trip?",
        placeholder: "Хоногийн тоо...",
        icon: Clock,
        color: "from-emerald-500 to-teal-600",
    },
    {
        id: "purpose",
        question: "Аяллын үндсэн зорилго юу вэ?",
        questionEn: "What is the main purpose?",
        options: [
            { id: "tourist", label: "Жуулчлал", icon: MapPin, color: "text-blue-500", bg: "bg-blue-50" },
            { id: "business", label: "Бизнес", icon: Zap, color: "text-amber-500", bg: "bg-amber-50" },
            { id: "shopping", label: "Шопинг", icon: Sparkles, color: "text-purple-500", bg: "bg-purple-50" },
            { id: "medical", label: "Эмчилгээ", icon: CloudRain, color: "text-rose-500", bg: "bg-rose-50" },
            { id: "foodie", label: "Хоол", icon: Utensils, color: "text-orange-500", bg: "bg-orange-50" },
            { id: "relaxation", label: "Амралт", icon: Heart, color: "text-pink-500", bg: "bg-pink-50" },
            { id: "adventure", label: "Адал явдал", icon: Rocket, color: "text-indigo-500", bg: "bg-indigo-50" },
            { id: "family", label: "Гэр бүл", icon: Users, color: "text-cyan-500", bg: "bg-cyan-50" },
            { id: "education", label: "Боловсрол", icon: GraduationCap, color: "text-violet-500", bg: "bg-violet-50" },
            { id: "event", label: "Эвент", icon: Star, color: "text-yellow-500", bg: "bg-yellow-50" },
        ],
        icon: Sparkles,
        color: "from-rose-500 to-red-600",
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
        const stepId = steps[currentStep].id;
        const currentData = formData[stepId];

        if (!currentData) return;

        // Validation for duration
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
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* --- Vibrant Backdrop --- */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-950/60 backdrop-blur-[12px]"
                />

                {/* --- Vibrant Premium Modal --- */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: "spring", damping: 20, stiffness: 200 }}
                    className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[32px] shadow-[0_40px_100px_-20px_rgba(220,38,38,0.2)] overflow-hidden"
                >
                    {/* --- Mesh Gradient Background Layer --- */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
                        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-rose-500/20 blur-[100px] animate-pulse" />
                        <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] rounded-full bg-blue-600/20 blur-[100px] animate-pulse [animation-delay:1s]" />
                    </div>

                    {/* Progress Bar (Elite Pro Liquid) */}
                    <div className="absolute top-0 left-0 w-full flex h-1 px-10 pt-10 gap-2">
                        {steps.map((_, i) => (
                            <motion.div
                                key={i}
                                className={cn(
                                    "h-1 flex-1 rounded-full transition-all duration-1000",
                                    i <= currentStep ? "bg-gradient-to-r from-red-600 to-rose-400 shadow-[0_0_15px_rgba(220,38,38,0.5)]" : "bg-slate-100 dark:bg-white/[0.05]"
                                )}
                            />
                        ))}
                    </div>

                    {/* Actions */}
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all z-10"
                    >
                        <X className="w-4 h-4 text-slate-400" />
                    </button>

                    <div className="p-8 pt-16 pb-8 relative z-10">
                        {/* Question Section */}
                        <div className="min-h-[160px]">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentStep}
                                    initial={{ x: 30, y: 10, opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                                    animate={{ x: 0, y: 0, opacity: 1, scale: 1, filter: "blur(0px)" }}
                                    exit={{ x: -30, y: -10, opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                    className="space-y-6"
                                >
                                    <div className="space-y-3">
                                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-md", stepInfo.color)}>
                                            <stepInfo.icon className="w-5 h-5 text-white" />
                                        </div>
                                        <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                                            {stepInfo.question}
                                        </h2>
                                    </div>

                                    {stepInfo.id === "purpose" ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
                                                            "flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all duration-300",
                                                            isActive
                                                                ? "border-red-600 bg-red-600 text-white shadow-lg shadow-red-200 dark:shadow-red-900/20 scale-105"
                                                                : cn("border-transparent hover:border-slate-200 dark:hover:border-slate-700", opt.bg)
                                                        )}
                                                    >
                                                        <opt.icon className={cn("w-4 h-4", isActive ? "text-white" : opt.color)} />
                                                        <span className={cn("text-[8px] font-black uppercase tracking-wider", isActive ? "text-white" : "text-slate-600 dark:text-slate-400")}>
                                                            {opt.label}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="relative group">
                                            <input
                                                autoFocus
                                                type={stepInfo.id === "duration" ? "number" : "text"}
                                                min={stepInfo.id === "duration" ? "1" : undefined}
                                                value={formData[stepInfo.id]}
                                                onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                                onChange={(e) => {
                                                    let val = e.target.value;
                                                    if (stepInfo.id === "duration") {
                                                        // Prevent negative numbers and zero
                                                        if (parseInt(val) < 1) val = "1";
                                                    }
                                                    setFormData({ ...formData, [stepInfo.id]: val });
                                                }}
                                                placeholder={stepInfo.placeholder}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl p-5 text-lg font-black text-slate-900 dark:text-white focus:border-red-600 focus:bg-white dark:focus:bg-slate-800 transition-all outline-none placeholder:text-slate-300 shadow-inner [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                onKeyDown={(e) => e.key === "Enter" && formData[stepInfo.id] && handleNext()}
                                            />
                                            <div className="absolute right-5 top-1/2 -translate-y-1/2 opacity-0 group-focus-within:opacity-100 transition-opacity">
                                                <Sparkles className="w-5 h-5 text-red-600 animate-pulse" />
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Footer */}
                        <div className="mt-8 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={handleBack}
                                className={cn(
                                    "flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-red-600 transition-all",
                                    currentStep === 0 && "opacity-0 pointer-events-none"
                                )}
                            >
                                <ChevronLeft className="w-3 h-3" />
                                Буцах
                            </button>

                            {stepInfo.id !== "purpose" && (
                                <Button
                                    type="button"
                                    disabled={!formData[stepInfo.id]}
                                    onClick={handleNext}
                                    className="h-12 bg-red-600 hover:bg-red-700 text-white rounded-2xl px-8 font-black text-xs flex items-center gap-3 transition-all active:scale-95 disabled:opacity-30 shadow-lg shadow-red-200 dark:shadow-red-900/10"
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
