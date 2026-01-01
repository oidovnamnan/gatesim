"use client";

import { motion } from "framer-motion";
import {
    X,
    Crown,
    Check,
    Sparkles,
    MessageCircle,
    Globe,
    Zap,
    Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { aiPricing } from "@/lib/ai-assistant";

interface AIPremiumModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPurchase?: (plan: "premium" | "perPackage") => void;
}

export function AIPremiumModal({ isOpen, onClose, onPurchase }: AIPremiumModalProps) {
    if (!isOpen) return null;

    const features = [
        { icon: MessageCircle, text: "Хязгааргүй асуулт" },
        { icon: Sparkles, text: "AI-ийн ухаалаг хариулт" },
        { icon: Globe, text: "Бүх улсын мэдээлэл" },
        { icon: Zap, text: "Хурдан хариулт" },
        { icon: Shield, text: "24/7 дэмжлэг" },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg bg-[#0d111c] rounded-t-3xl border-t border-white/10 overflow-hidden"
            >
                {/* Header */}
                <div className="relative px-6 pt-6 pb-4">
                    <div className="absolute top-3 right-3">
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
                        >
                            <X className="h-4 w-4 text-white/70" />
                        </button>
                    </div>

                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                            <Crown className="h-8 w-8 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-white">AI Туслах Premium</h2>
                        <p className="text-white/60 text-sm mt-1">
                            Аялалын хамгийн сайн туслах
                        </p>
                    </div>
                </div>

                {/* Features */}
                <div className="px-6 pb-4">
                    <div className="grid grid-cols-2 gap-2">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <div
                                    key={index}
                                    className="flex items-center gap-2 p-3 rounded-xl bg-white/5"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                                        <Icon className="h-4 w-4 text-white/70" />
                                    </div>
                                    <span className="text-sm text-white">{feature.text}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Pricing options */}
                <div className="px-6 pb-6 space-y-3">
                    {/* Premium plan */}
                    <Card className="p-4 border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/10">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-white">Premium</h3>
                                    <Badge variant="warning" size="sm">Хамгийн хямд</Badge>
                                </div>
                                <p className="text-xs text-white/60 mt-1">Бүх аялалд ашиглах</p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-white">
                                    ${aiPricing.premium.price}
                                </p>
                                <p className="text-xs text-white/50">/ сар</p>
                            </div>
                        </div>
                        <div className="space-y-2 mb-4">
                            {aiPricing.premium.features.map((f, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm text-white/70">
                                    <Check className="h-4 w-4 text-emerald-400" />
                                    {f}
                                </div>
                            ))}
                        </div>
                        <Button
                            fullWidth
                            onClick={() => onPurchase?.("premium")}
                            className="bg-gradient-to-r from-amber-500 to-orange-500"
                        >
                            <Crown className="h-4 w-4" />
                            Premium болох
                        </Button>
                    </Card>

                    {/* Per package plan */}
                    <Card className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <h3 className="font-semibold text-white">Нэг багцад</h3>
                                <p className="text-xs text-white/60 mt-1">Тухайн улсад зориулсан</p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-white">
                                    ${aiPricing.perPackage.price}
                                </p>
                                <p className="text-xs text-white/50">/ багц</p>
                            </div>
                        </div>
                        <Button
                            fullWidth
                            variant="secondary"
                            onClick={() => onPurchase?.("perPackage")}
                        >
                            Нэмэх
                        </Button>
                    </Card>
                </div>

                {/* Footer */}
                <div className="px-6 pb-6">
                    <p className="text-center text-xs text-white/40">
                        Хэзээ ч цуцлах боломжтой. Баталгаат буцаалт.
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
}
