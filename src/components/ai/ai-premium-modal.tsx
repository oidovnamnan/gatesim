"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X, Crown, Check, Sparkles, MessageCircle, Globe, Zap, Shield,
    Languages, Map, Image as ImageIcon, Mic, Loader2, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

interface AIPremiumModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PLANS = [
    { id: "5_DAYS", days: 5, price: 25000, label: "5 Хоног", sub: "Богино аялал" },
    { id: "10_DAYS", days: 10, price: 40000, label: "10 Хоног", sub: "Стандарт аялал", popular: true },
    { id: "30_DAYS", days: 30, price: 90000, label: "30 Хоног", sub: "Урт хугацаа" }
];

export function AIPremiumModal({ isOpen, onClose }: AIPremiumModalProps) {
    const [step, setStep] = useState<"select" | "loading" | "payment">("select");
    const [selectedPlan, setSelectedPlan] = useState<string | null>("10_DAYS");
    const [paymentData, setPaymentData] = useState<any>(null);

    // Hide BottomNav when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.classList.add("modal-open");
        } else {
            document.body.classList.remove("modal-open");
        }
        return () => document.body.classList.remove("modal-open");
    }, [isOpen]);

    const handlePurchase = async () => {
        if (!selectedPlan) return;
        setStep("loading");
        try {
            const res = await fetch("/api/ai/upgrade", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ planId: selectedPlan }),
            });
            const data = await res.json();
            if (data.success) {
                setPaymentData(data);
                setStep("payment");
            }
        } catch (error) {
            console.error("Purchase failed", error);
            setStep("select");
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-md bg-slate-900 rounded-[32px] border border-white/10 overflow-hidden shadow-2xl relative"
                    >
                        {/* Close Button */}
                        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors z-10">
                            <X className="w-5 h-5 text-slate-400" />
                        </button>

                        {/* Content */}
                        <div className="p-6 sm:p-8 max-h-[85vh] overflow-y-auto custom-scrollbar">
                            {step === "select" && (
                                <div className="space-y-6">
                                    <div className="text-center space-y-2">
                                        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-amber-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 mb-4">
                                            <Crown className="w-8 h-8 text-white" />
                                        </div>
                                        <h2 className="text-2xl font-black text-white">GateSIM AI Premium</h2>
                                        <p className="text-slate-400 text-sm font-medium">Аялалын ухаалаг туслахаа идэвхжүүлээрэй</p>
                                    </div>

                                    {/* Features Grid */}
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            "Хязгааргүй Төлөвлөгч", "Хязгааргүй Сканнер",
                                            "PDF Татах", "Клауд Хадгалалт"
                                        ].map((f, i) => (
                                            <div key={i} className="flex items-center gap-2 text-xs font-bold text-slate-300">
                                                <Check className="w-4 h-4 text-emerald-500" /> {f}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Plans */}
                                    <div className="space-y-3">
                                        {PLANS.map((plan) => (
                                            <div
                                                key={plan.id}
                                                onClick={() => setSelectedPlan(plan.id)}
                                                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all relative ${selectedPlan === plan.id ? "border-amber-500 bg-amber-500/10" : "border-white/5 bg-white/5 hover:bg-white/10"}`}
                                            >
                                                {plan.popular && (
                                                    <div className="absolute -top-3 right-4 bg-amber-500 text-black text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider">
                                                        Popular
                                                    </div>
                                                )}
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <div className="font-black text-white">{plan.label}</div>
                                                        <div className="text-xs text-slate-400 font-medium">{plan.sub}</div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-black text-amber-400">{plan.price.toLocaleString()}₮</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <Button onClick={handlePurchase} className="w-full h-14 rounded-2xl bg-white text-slate-900 font-black text-lg hover:bg-slate-200">
                                        Идэвхжүүлэх <ArrowRight className="w-5 h-5 ml-2" />
                                    </Button>
                                </div>
                            )}

                            {step === "loading" && (
                                <div className="py-20 flex flex-col items-center justify-center space-y-4">
                                    <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
                                    <p className="text-slate-400 font-bold animate-pulse">Төлбөрийн мэдээлэл үүсгэж байна...</p>
                                </div>
                            )}

                            {step === "payment" && paymentData && (
                                <div className="space-y-6 text-center">
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-black text-white">QPay Төлбөр</h3>
                                        <p className="text-slate-400 text-sm">QR кодыг уншуулж төлбөрөө төлнө үү</p>
                                    </div>

                                    <div className="bg-white p-4 rounded-3xl inline-block">
                                        {paymentData.invoice.qr_image ? (
                                            <img
                                                src={`data:image/png;base64,${paymentData.invoice.qr_image}`}
                                                alt="QPay QR"
                                                className="w-48 h-48 object-contain"
                                            />
                                        ) : (
                                            <div className="w-48 h-48 flex items-center justify-center text-slate-900 font-bold">
                                                QR Error
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 gap-2">
                                        <Button
                                            onClick={() => window.location.href = paymentData.invoice.qPay_shortUrl}
                                            className="w-full h-14 rounded-2xl bg-white text-slate-900 font-black shadow-lg mb-2"
                                        >
                                            <Smartphone className="w-5 h-5 mr-2" />
                                            Банкны апп-аар төлөх (QPay)
                                        </Button>

                                        <div className="grid grid-cols-2 gap-2">
                                            {paymentData.invoice.urls?.map((bank: any) => (
                                                <a
                                                    key={bank.name}
                                                    href={bank.link}
                                                    onClick={(e) => {
                                                        window.location.href = bank.link;
                                                    }}
                                                    className="p-3 bg-white/5 rounded-2xl flex items-center gap-3 hover:bg-white/10 transition-colors w-full text-left"
                                                >
                                                    <div className="w-11 h-11 relative flex-shrink-0 rounded-xl overflow-hidden bg-white shadow-inner pointer-events-none">
                                                        <img src={bank.logo} className="w-full h-full object-cover" alt={bank.name} />
                                                    </div>
                                                    <span className="text-xs text-white font-black truncate pointer-events-none">{bank.name}</span>
                                                </a>
                                            ))}
                                        </div>
                                    </div>

                                    <Button variant="outline" onClick={onClose} className="w-full h-12 rounded-xl text-slate-500 border-white/10 hover:bg-white/5 hover:text-white">
                                        Хаах (Төлсний дараа автоматаар идэвхжнэ)
                                    </Button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
