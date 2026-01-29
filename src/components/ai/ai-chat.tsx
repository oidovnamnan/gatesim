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
import { collection, query, where, getDocs, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Badge } from "@/components/ui/badge";

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
    const [activeStaff, setActiveStaff] = useState<{ name: string; image: string } | null>(
        pathname?.startsWith("/ai")
            ? { name: "Мишээл", image: "/assets/ai/staff/staff_2.png" }
            : { name: "Ану", image: "/assets/ai/staff/staff_1.png" }
    );

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

    const getGreetings = (name: string, isTravel: boolean) => {
        const sales = [
            `Сайн байна уу! Намайг ${name} гэдэг. Гадаадад явахдаа датаны асуудалгүй аялахад тань би туслах уу? 📱`,
            `Сайн уу? ${name} байна. GateSIM-д тавтай морил! Танд тохирох eSIM багцыг хамтдаа ольё. 🌟`,
            `Сайн байна уу? ${name} байна. Танд өнөөдөр ямар улсын eSIM хэрэгтэй байна, би шалгаад өгөх үү? ✨`,
            `Сайн уу? ${name} байна. Би танд хамгийн хямд бөгөөд хурдан дата багцуудыг санал болгож чадна шүү. 🌐`,
            `Сайн байна уу! ${name} байна. Танд үйлчлэхдээ баяртай байна. Таны утас eSIM дэмждэг үү? 😊`
        ];

        const travel = [
            `Сайн байна уу! Би таны аяллын туслах ${name} байна. Орчуулга эсвэл замын мэдээлэл хэрэгтэй юу? 🗺️`,
            `Сайн уу? ${name} байна. Таны аяллыг илүү сонирхолтой болгох зөвлөгөөнүүд надад байна шүү. ✈️`,
            `Хаашаа аялах гэж байна? Намайг ${name} гэдэг, би таны аяллын бүх асуултад хариулахад бэлэн байна. 📍`,
            `Сайн уу, аялагч аа! ${name} байна. Танд өнөөдөр юугаар туслах вэ? 🌍`,
            `Сайн байна уу? GateSIM-ийн аяллын зөвлөх ${name} байна. Танд туслахдаа үргэлж баяртай байх болно! ✨`
        ];

        return isTravel ? travel : sales;
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

    // Initialize welcome message when chat opens
    useEffect(() => {
        if (!isOpen) return;

        // If we already have messages, don't re-welcome
        if (messages.length > 0) return;

        const hasGreeted = sessionStorage.getItem("ai_greeted");
        if (hasGreeted) return;

        const device = detectDevice();
        const compatible = isEsimCompatible(device);
        const isAiHub = pathname === "/ai";

        let initialMessage = "";
        if (!compatible) {
            initialMessage = t("aiCompatibilityWarning").replace("{device}", device);
        } else {
            const name = activeStaff?.name || (isAiHub ? "Мишээл" : "Ану");
            const variants = getGreetings(name, isAiHub);
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
    }, [isOpen, activeStaff, pathname]);

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

    // Fetch active staff profile
    useEffect(() => {
        const field = pathname?.startsWith("/ai") ? "isDefaultTravel" : "isDefaultSales";
        const q = query(
            collection(db, "aiStaff"),
            where(field, "==", true),
            limit(1)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const data = snapshot.docs[0].data();
                setActiveStaff({
                    name: data.name,
                    image: data.image
                });
            } else {
                // Fallback to defaults (Anu and Misheel - Mongolian staff)
                setActiveStaff({
                    name: pathname?.startsWith("/ai") ? "Мишээл" : "Ану",
                    image: pathname?.startsWith("/ai") ? "/assets/ai/staff/staff_2.png" : "/assets/ai/staff/staff_1.png"
                });
            }
        });

        return () => unsubscribe();
    }, [pathname]);

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

    const isAiHub = pathname === "/ai" || pathname?.startsWith("/ai/");

    return (
        <>
            {/* Floating Draggable Button */}
            <motion.div
                drag
                dragConstraints={isAiHub ? { left: 0, right: 300, top: -500, bottom: 0 } : { left: -300, right: 0, top: -500, bottom: 0 }}
                dragElastic={0.1}
                dragMomentum={false}
                className={cn(
                    "fixed bottom-44 z-50 transition-all duration-500",
                    isAiHub ? "left-4" : "right-4",
                    (isOpen || (pathname !== "/" && !pathname?.startsWith("/ai"))) && "opacity-0 pointer-events-none"
                )}
            >
                <div className="relative group cursor-grab active:cursor-grabbing">
                    {/* Premium Aurora Glow Effect */}
                    <motion.div
                        animate={{
                            rotate: [0, 360],
                            scale: [1, 1.15, 1],
                            opacity: [0.3, 0.5, 0.3]
                        }}
                        transition={{
                            rotate: { duration: 15, repeat: Infinity, ease: "linear" },
                            scale: { duration: 5, repeat: Infinity, ease: "easeInOut" },
                            opacity: { duration: 5, repeat: Infinity, ease: "easeInOut" }
                        }}
                        className={cn(
                            "absolute -inset-4 rounded-full blur-2xl transition-colors",
                            pathname === "/ai"
                                ? "bg-gradient-to-tr from-indigo-500/40 via-purple-500/40 to-blue-400/40"
                                : "bg-gradient-to-tr from-red-500/40 via-rose-400/40 to-orange-400/40"
                        )}
                    />

                    <motion.button
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{
                            scale: 1,
                            rotate: 0,
                            y: [0, -8, 0], // Floating motion
                        }}
                        transition={{
                            y: {
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                            },
                        }}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsOpen(true)}
                        className={cn(
                            "relative w-16 h-16 rounded-full shadow-2xl overflow-hidden border-2 border-white bg-white backdrop-blur-md transition-all",
                            pathname === "/ai" ? "ring-2 ring-indigo-50/50" : "ring-2 ring-red-50/50"
                        )}
                    >
                        <motion.div
                            animate={{
                                rotate: [0, -2, 2, -2, 0], // Subtle wiggle to attract attention every few seconds
                            }}
                            transition={{
                                duration: 5,
                                repeat: Infinity,
                                repeatDelay: 2
                            }}
                            className="relative w-full h-full"
                        >
                            <Image
                                src={activeStaff?.image || (pathname === "/ai" ? "/assets/ai/staff/staff_2.png" : "/assets/ai/staff/staff_1.png")}
                                alt={activeStaff?.name || "AI Assistant"}
                                fill
                                className="object-cover"
                            />

                            {/* Shimmer Light Sweep Effect */}
                            <motion.div
                                animate={{
                                    left: ['-100%', '200%']
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    repeatDelay: 4,
                                    ease: "linear"
                                }}
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 -z-0"
                            />
                        </motion.div>

                        {/* Status Dot */}
                        <div className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white shadow-lg z-10" />
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
                        activeStaff={activeStaff}
                    />
                )}
            </AnimatePresence>
        </>
    );
}
