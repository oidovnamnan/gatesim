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

    // Derive mode from pathname
    const getModeFromPath = (path: string | null) => {
        const modeParam = searchParams.get("mode");
        if (modeParam) return modeParam;

        if (!path) return "tourist";
        if (path.includes("/medical") || path.includes("/hospitals")) return "medical";
        if (path.includes("/student") || path.includes("/campus")) return "student";
        if (path.includes("/shopping") || path.includes("/vat") || path.includes("/prices")) return "shopping";
        if (path.includes("/business") || path.includes("/expenses")) return "business";
        return "tourist";
    };

    const currentMode = getModeFromPath(pathname);

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

        if (action === "install" || action === "chat") {
            if (action === "install") {
                const deviceType = detectDeviceType();
                const guide = (installationGuides as any)[deviceType] || installationGuides.generic;

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
            }

            setIsOpen(true);

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
            {/* Floating button - Only show on Home page */}
            <motion.div
                className={cn(
                    "fixed bottom-44 right-4 z-50 transition-opacity duration-300",
                    (isOpen || pathname !== "/") && "opacity-0 pointer-events-none"
                )}
            >
                <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(true)}
                    className="relative w-14 h-14 rounded-full gradient-primary shadow-2xl flex items-center justify-center border-2 border-white dark:border-slate-900 touch-none group"
                >
                    <Bot className="h-7 w-7 text-white transition-transform group-hover:scale-110" />
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
                        mode={currentMode}
                    />
                )}
            </AnimatePresence>
        </>
    );
}
