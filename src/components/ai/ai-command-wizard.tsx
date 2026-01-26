"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X, Sparkles, MapPin, Calendar, Rocket,
    ArrowRight, Check, Bot, Zap, Sun, CloudRain, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
        placeholder: "Хотын нэр (ж.нь: Сөүл, Токио...)",
        icon: MapPin,
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
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 10 }}
                    className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                >
                    {/* Progress Bar (Minimal) */}
                    <div className="absolute top-0 left-0 w-full flex h-1.5 px-6 pt-6 gap-1">
                        {steps.map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "h-1 px-1 flex-1 rounded-full transition-all duration-300",
                                    i <= currentStep ? "bg-slate-900 dark:bg-white" : "bg-slate-100 dark:bg-slate-800"
                                )}
                            />
                        ))}
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-8 right-8 p-2 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors z-10"
                    >
                        <X className="w-5 h-5 text-slate-400" />
                    </button>

                    <div className="p-8 pt-16">
                        {/* Question Section */}
                        <div className="min-h-[180px]">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentStep}
                                    initial={{ x: 10, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -10, opacity: 0 }}
                                    className="space-y-6"
                                >
                                    <div className="space-y-2">
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                                            Step {currentStep + 1} of {steps.length}
                                        </p>
                                        <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                                            {stepInfo.question}
                                        </h2>
                                    </div>

                                    {stepInfo.id === "purpose" ? (
                                        <div className="grid grid-cols-2 gap-4">
                                            {stepInfo.options?.map((opt) => {
                                                const isActive = formData[stepInfo.id] === opt.id;
                                                return (
                                                    <button
                                                        key={opt.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setFormData({ ...formData, [stepInfo.id]: opt.id });
                                                            // Auto-next for selection
                                                            setTimeout(handleNext, 200);
                                                        }}
                                                        className={cn(
                                                            "flex flex-col items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-300",
                                                            isActive
                                                                ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
                                                                : "border-slate-100 bg-white hover:border-slate-200 dark:border-slate-800 dark:bg-slate-800/50 dark:hover:border-slate-700"
                                                        )}
                                                    >
                                                        <opt.icon className={cn("w-6 h-6", isActive ? "text-current" : "text-slate-400")} />
                                                        <span className="text-xs font-black uppercase tracking-widest">{opt.label}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <input
                                                autoFocus
                                                type={stepInfo.id === "duration" ? "number" : "text"}
                                                value={formData[stepInfo.id]}
                                                onChange={(e) => setFormData({ ...formData, [stepInfo.id]: e.target.value })}
                                                placeholder={stepInfo.placeholder}
                                                className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-4 text-lg font-bold text-slate-900 dark:text-white focus:border-slate-900 dark:focus:border-white transition-all outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600"
                                                onKeyDown={(e) => e.key === "Enter" && formData[stepInfo.id] && handleNext()}
                                            />
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Footer Actions */}
                        <div className="mt-12 flex items-center justify-between">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleBack}
                                className={cn("rounded-xl font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white", currentStep === 0 && "invisible")}
                            >
                                Буцах
                            </Button>

                            {stepInfo.id !== "purpose" && (
                                <Button
                                    type="button"
                                    disabled={!formData[stepInfo.id]}
                                    onClick={handleNext}
                                    className="h-12 bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-white rounded-[16px] px-8 font-black text-xs flex items-center gap-3 transition-all active:scale-95 disabled:opacity-30"
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
