"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useTranslation } from "@/providers/language-provider";
import { AIMessage, installationGuides } from "@/lib/ai-assistant";
import dynamic from "next/dynamic";
import Image from "next/image";

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

        if (path === "/") return "sales";
        if (path === "/ai") return "travel";

        if (!path) return "sales";
        if (path.includes("/medical") || path.includes("/hospitals")) return "medical";
        if (path.includes("/student") || path.includes("/campus")) return "student";
        if (path.includes("/shopping") || path.includes("/vat") || path.includes("/prices")) return "shopping";
        if (path.includes("/business") || path.includes("/expenses")) return "business";
        return "sales";
    };

    const currentMode = getModeFromPath(pathname);

    const greetingVariants = {
        sales: [
            "Сайн байна уу! Би танд тохирох eSIM багц олоход туслах уу? 📱",
            "GateSIM-д тавтай морил! Таны утас eSIM дэмждэг үү? 🌐",
            "Аялалдаа бэлэн үү? Хамгийн хурдан дата багцыг хамтдаа ольё! ✨"
        ],
        travel: [
            "Сайн байна уу! Би таны аялалыг хөнгөвчлөх AI туслах байна. 🗺️",
            "Аялалын төлөвлөгөө, орчуулга эсвэл замын мэдээлэл хэрэгтэй юу? ✈️",
            "Хаашаа аялах гэж байна? Би танд маршрут гаргахад туслах уу? 📍"
        ]
    };

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
        const isAiHub = pathname === "/ai";

        let initialMessage = "";
        if (!compatible) {
            initialMessage = t("aiCompatibilityWarning").replace("{device}", device);
            setIsOpen(true);
        } else {
            const variants = isAiHub ? greetingVariants.travel : greetingVariants.sales;
            initialMessage = variants[Math.floor(Math.random() * variants.length)];
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
    }, [pathname]); // Re-greet on page switch if not greeted yet (or refresh logic)

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
            {/* Floating Draggable Button */}
            <motion.div
                drag
                dragConstraints={{ left: -300, right: 0, top: -500, bottom: 0 }}
                dragElastic={0.1}
                dragMomentum={false}
                className={cn(
                    "fixed bottom-44 right-4 z-50 transition-opacity duration-300",
                    (isOpen || (pathname !== "/" && pathname !== "/ai")) && "opacity-0 pointer-events-none"
                )}
            >
                <div className="relative group cursor-grab active:cursor-grabbing">
                    {/* Premium Glow Effect */}
                    <div className={cn(
                        "absolute inset-0 rounded-full blur-xl transition-colors animate-pulse",
                        pathname === "/ai" ? "bg-indigo-500/20" : "bg-red-500/20"
                    )} />

                    <motion.button
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsOpen(true)}
                        className={cn(
                            "relative w-16 h-16 rounded-full shadow-2xl overflow-hidden border-2 border-white bg-white backdrop-blur-md transition-all",
                            pathname === "/ai" ? "ring-2 ring-indigo-50/50" : "ring-2 ring-red-50/50"
                        )}
                    >
                        <Image
                            src={pathname === "/ai" ? "/assets/ai/travel-guide.png" : "/assets/ai/sim-expert.png"}
                            alt="AI Assistant"
                            fill
                            className="object-cover"
                        />

                        {/* Status Dot */}
                        <div className="absolute top-1.5 right-1.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-sm z-10" />
                    </motion.button>
                </div>
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
