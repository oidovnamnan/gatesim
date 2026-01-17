"use client";

import { motion } from "framer-motion";
import { Bot, ChevronLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/providers/language-provider";

interface ComingSoonProps {
    title: string;
    description?: string;
}

export function AIComingSoon({ title, description }: ComingSoonProps) {
    const { t, language } = useTranslation();
    const isMongolian = language === "mn";

    return (
        <div className="min-h-screen flex flex-col pt-12 px-6">
            <Link href="/ai">
                <Button variant="ghost" className="mb-8 pl-0 text-muted-foreground hover:text-foreground">
                    <ChevronLeft className="w-5 h-5 mr-1" />
                    {isMongolian ? "Буцах" : "Back"}
                </Button>
            </Link>

            <div className="flex-1 flex flex-col items-center justify-center text-center -mt-20">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-xl mb-8 relative"
                >
                    <Bot className="w-12 h-12 text-white" />
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 rounded-3xl border-2 border-white/20 border-dashed"
                    />
                </motion.div>

                <h1 className="text-3xl font-black mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {title}
                </h1>

                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-600 text-sm font-bold border border-amber-500/20 mb-6">
                    <Sparkles className="w-4 h-4" />
                    {isMongolian ? "Тун удахгүй" : "Coming Soon"}
                </div>

                <p className="text-muted-foreground max-w-xs leading-relaxed">
                    {description || (isMongolian
                        ? "Энэхүү боломж одоогоор хөгжүүлэлтийн шатандаа явж байна. Бид удахгүй илүү ухаалаг үйлчилгээг нэвтрүүлэх болно."
                        : "This feature is currently under development. We are working hard to bring you a smarter travel experience soon.")}
                </p>

                <Link href="/ai" className="mt-12">
                    <Button size="lg" className="rounded-2xl px-8 font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl">
                        {isMongolian ? "Бусад боломжуудыг үзэх" : "Explore other features"}
                    </Button>
                </Link>
            </div>
        </div>
    );
}
