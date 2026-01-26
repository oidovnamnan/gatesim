"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X, Sparkles, MapPin, Calendar, Rocket,
    ArrowRight, Check, Bot, Zap, Sun, CloudRain
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
        placeholder: "Улс эсвэл хотын нэр...",
        icon: MapPin,
    },
    {
        id: "duration",
        question: "Хэд хоног аялах вэ?",
        questionEn: "How many days is your trip?",
        placeholder: "Хоногийн тоо...",
        icon: Calendar,
    },
    {
        id: "purpose",
        question: "Аяллын үндсэн зорилго юу вэ?",
        questionEn: "What is the main purpose of your trip?",
        options: [
            { id: "tourist", label: "Жуулчлал", icon: Rocket },
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
    const [isAnimating, setIsAnimating] = useState(false);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setIsAnimating(true);
            setTimeout(() => {
                setCurrentStep(prev => prev + 1);
                setIsAnimating(false);
            }, 300);
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
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/20 dark:border-slate-800 rounded-[32px] shadow-2xl overflow-hidden"
                >
                    {/* Header Glow */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-400" />
                    </button>

                    <div className="p-8 pt-12">
                        {/* Progress */}
                        <div className="flex gap-2 mb-8">
                            {steps.map((_, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "h-1 rounded-full transition-all duration-500",
                                        i <= currentStep ? "w-8 bg-blue-500" : "w-4 bg-slate-200 dark:bg-slate-800"
                                    )}
                                />
                            ))}
                        </div>

                        {/* Question Section */}
                        <div className="min-h-[200px]">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentStep}
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -20, opacity: 0 }}
                                    className="space-y-6"
                                >
                                    <div className="flex items-center gap-3 text-blue-500">
                                        <stepInfo.icon className="w-6 h-6" />
                                        <span className="text-xs font-black uppercase tracking-widest opacity-60">Step {currentStep + 1}</span>
                                    </div>

                                    <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                                        {stepInfo.question}
                                    </h2>

                                    {stepInfo.id === "purpose" ? (
                                        <div className="grid grid-cols-2 gap-3">
                                            {stepInfo.options?.map((opt) => {
                                                const OptIcon = opt.icon;
                                                return (
                                                    <button
                                                        key={opt.id}
                                                        onClick={() => {
                                                            setFormData({ ...formData, purpose: opt.id });
                                                            handleNext();
                                                        }}
                                                        className={cn(
                                                            "flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all",
                                                            formData.purpose === opt.id
                                                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                                                : "border-slate-100 dark:border-slate-800 hover:border-blue-200"
                                                        )}
                                                    >
                                                        <OptIcon className="w-6 h-6 text-blue-500" />
                                                        <span className="text-xs font-bold">{opt.label}</span>
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
                                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-lg font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
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
                                variant="ghost"
                                onClick={handleBack}
                                className={cn("rounded-xl font-bold", currentStep === 0 && "invisible")}
                            >
                                Буцах
                            </Button>

                            {stepInfo.id !== "purpose" && (
                                <Button
                                    disabled={!formData[stepInfo.id]}
                                    onClick={handleNext}
                                    className="bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 text-white rounded-xl px-8 font-black flex items-center gap-2 group"
                                >
                                    Дараах
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* AI Character Overlay (Subtle) */}
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/10 blur-3xl rounded-full" />
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
