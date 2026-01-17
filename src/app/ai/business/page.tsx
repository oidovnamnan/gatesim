"use client";

import { AIBusinessPlanner } from "@/components/ai/ai-business-planner";
import { motion } from "framer-motion";
import { Package, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/providers/language-provider";

export default function BusinessPlannerPage() {
    const { language } = useTranslation();
    const isMongolian = language === "mn";

    return (
        <div className="min-h-screen pb-32 md:pb-8">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b">
                <div className="container mx-auto px-6 py-4 flex items-center gap-4">
                    <Link
                        href="/ai"
                        className="p-2 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                            <Package className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg">
                                {isMongolian ? "Бизнес Аялал" : "Business Trip"}
                            </h1>
                            <p className="text-xs text-muted-foreground">
                                {isMongolian ? "Хятадын бөөний зах" : "China Wholesale Markets"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="container mx-auto px-6 py-8"
            >
                <AIBusinessPlanner />
            </motion.div>
        </div>
    );
}
