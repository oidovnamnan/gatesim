"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useTranslation } from "@/providers/language-provider";
import { AIMessage, installationGuides } from "@/lib/ai-assistant";
import dynamic from "next/dynamic";

// Lazy load the Heavy Window Component
const AIChatWindow = dynamic(() => import("./ai-chat-window").then(mod => mod.AIChatWindow), {
    ssr: false,
    loading: () => null // Invisible loading or a spinner
});

interface AIChatProps {
    country?: string;
    isPremium?: boolean;
}

export function AIChat({ country, isPremium = false }: AIChatProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<AIMessage[]>([]);

    const greetingVariants = [
        t("aiGreeting1"),
        t("aiGreeting2"),
        t("aiGreeting3"),
        t("aiGreeting4")
    ];

    // Helper functions
    function detectDevice(): string {
        if (typeof navigator === "undefined") return t("devicePhone");
        const ua = navigator.userAgent;
        if (/iPhone/i.test(ua)) return "iPhone";
        if (/Samsung/i.test(ua)) return "Samsung";
        if (/Huawei/i.test(ua)) return "Huawei";
        if (/Pixel/i.test(ua)) return "Google Pixel";
        if (/Xiaomi/i.test(ua)) return "Xiaomi";
        return t("yourPhone");
    }

    function isEsimCompatible(device: string): boolean {
        if (typeof navigator === "undefined") return true;
        const ua = navigator.userAgent;
        if (/iPhone/i.test(ua)) {
            const match = ua.match(/OS (\d+)_/);
            if (match && parseInt(match[1]) < 12) return false;
        }
        return true;
    }

    function detectDeviceType(): string {
        if (typeof navigator === "undefined") return "generic";
        const ua = navigator.userAgent.toLowerCase();
        if (ua.includes("iphone") || ua.includes("ipad")) return "iphone";
        if (ua.includes("samsung")) return "samsung";
        if (ua.includes("pixel")) return "pixel";
        return "generic";
    }

    // Initialize triggers
    useEffect(() => {
        const hasGreeted = sessionStorage.getItem("ai_greeted");
        if (hasGreeted) return;

        const device = detectDevice();
        const compatible = isEsimCompatible(device);

        let initialMessage = greetingVariants[Math.floor(Math.random() * greetingVariants.length)];

        if (!compatible) {
            initialMessage = t("aiCompatibilityWarning").replace("{device}", device);
            setIsOpen(true);
        }

        setMessages([
            {
                id: "welcome",
                role: "assistant",
                content: initialMessage,
                timestamp: new Date(),
            },
        ]);

        sessionStorage.setItem("ai_greeted", "true");
    }, []);

    // Handle URL parameters
    useEffect(() => {
        const action = searchParams.get("ai");
        if (action === "install") {
            const deviceType = detectDeviceType();
            const guide = (installationGuides as any)[deviceType] || installationGuides.generic;

            setIsOpen(true);

            const guideMessage: AIMessage = {
                id: `guide-${Date.now()}`,
                role: "assistant",
                content: guide,
                timestamp: new Date(),
            };

            setMessages(prev => {
                if (prev.length > 0 && prev[prev.length - 1].content === guide) return prev;
                return [...prev, guideMessage];
            });

            const newParams = new URLSearchParams(searchParams.toString());
            newParams.delete("ai");
            router.replace(window.location.pathname + (newParams.toString() ? `?${newParams.toString()}` : ""), { scroll: false });
        }
    }, [searchParams, router]);

    // Body scroll lock
    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('ai-chat-open');
        } else {
            document.body.classList.remove('ai-chat-open');
        }
        return () => {
            document.body.classList.remove('ai-chat-open');
        };
    }, [isOpen]);

    return (
        <>
            {/* Floating button - Always Rendered */}
            <motion.div
                drag
                dragMomentum={false}
                dragElastic={0.1}
                dragConstraints={{
                    left: typeof window !== 'undefined' ? -(window.innerWidth - 80) : -300,
                    right: 40,
                    top: typeof window !== 'undefined' ? -(window.innerHeight - 180) : -600,
                    bottom: 80
                }}
                whileDrag={{ scale: 1.1, cursor: "grabbing" }}
                className={cn(
                    "fixed bottom-44 right-4 z-50 transition-opacity duration-300",
                    (isOpen || pathname?.startsWith("/ai")) && "opacity-0 pointer-events-none"
                )}
            >
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 bg-red-500 rounded-full opacity-30 pointer-events-none"
                />
                <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(true)}
                    className="relative w-16 h-16 rounded-full gradient-primary shadow-xl shadow-red-500/30 flex items-center justify-center border-4 border-white dark:border-slate-900 touch-none"
                >
                    <Bot className="h-7 w-7 text-white" />
                    <div className="absolute -top-1 -right-1 flex h-6 w-6">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-6 w-6 bg-sky-500 border-2 border-white items-center justify-center">
                            <Sparkles className="w-3 h-3 text-white" />
                        </span>
                    </div>
                </motion.button>
            </motion.div>

            {/* Heavy Window - Lazy Loaded */}
            <AnimatePresence>
                {isOpen && (
                    <AIChatWindow
                        messages={messages}
                        setMessages={setMessages}
                        isOpen={isOpen}
                        onClose={() => setIsOpen(false)}
                        country={country}
                        isPremium={isPremium}
                    />
                )}
            </AnimatePresence>
        </>
    );
}
