"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    MessageCircle,
    X,
    Send,
    Sparkles,
    Bot,
    User,
    Loader2,
    Lock,
    Crown,
    Coins,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import {
    AIMessage,
    quickQuestions,
} from "@/lib/ai-assistant";
import { generateLocalResponse } from "@/lib/local-ai";

interface AIChatProps {
    country?: string;
    isPremium?: boolean;
}

export function AIChat({ country, isPremium = false }: AIChatProps) {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);

    const greetingVariants = [
        "Сайн байна уу? Та хаашаа, хэд хоног аялах вэ? 🌍✈️",
        "Сайн байна уу? Танд аялалдаа тохирох eSIM багц хайхад туслах уу? 🗺️✨",
        "Сайн уу? Дараагийн аялал хаашаа вэ? Би танд хамгийн хямд багцыг олоод өгье. 🚀",
        "Сайн байна уу? Та аялах улсаа хэлбэл би танд хамгийн тохиромжтой багцуудыг харуулъя. 💡"
    ];

    const [messages, setMessages] = useState<AIMessage[]>([]);
    const [input, setInput] = useState("");

    // Initialize with a random greeting
    useEffect(() => {
        const randomGreeting = greetingVariants[Math.floor(Math.random() * greetingVariants.length)];
        setMessages([
            {
                id: "welcome",
                role: "assistant",
                content: randomGreeting,
                timestamp: new Date(),
            },
        ]);
    }, []);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const isGuest = !session?.user;

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Hide bottom nav when chat is open
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

    const handleSend = async (text?: string) => {
        const messageText = text || input.trim();
        if (!messageText || isLoading) return;

        const userMessage: AIMessage = {
            id: Date.now().toString(),
            role: "user",
            content: messageText,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            // Prepare message history for API
            const apiMessages = messages.concat(userMessage).map(m => ({
                role: m.role,
                content: m.content
            }));

            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: apiMessages,
                    country: country,
                })
            });

            let responseText = "";

            if (!res.ok) {
                // Handle specific errors potentially
                console.error('API request failed');
                responseText = "Уучлаарай, системд алдаа гарлаа. Та дахин оролдоно уу.";
            } else {
                const data = await res.json();
                responseText = data.content;
            }

            // Parse AI response for package search command
            let finalResponseText = responseText;
            let packageResults: any[] = [];

            const searchMatch = responseText.match(/\[SEARCH_PACKAGES:\s*([^\]]+)\]/);
            if (searchMatch) {
                const paramsStr = searchMatch[1];
                const params = new URLSearchParams();

                paramsStr.split(',').forEach(pair => {
                    const [key, value] = pair.split('=').map(s => s.trim());
                    if (key && value) params.append(key, value);
                });

                try {
                    const searchRes = await fetch(`/api/packages/search?${params.toString()}`);
                    if (searchRes.ok) {
                        const searchData = await searchRes.json();
                        if (searchData.success && searchData.packages.length > 0) {
                            packageResults = searchData.packages;
                        }
                    }
                    // Always remove the search command from displayed text to avoid raw syntax showing
                    finalResponseText = responseText.replace(/\[SEARCH_PACKAGES:[^\]]+\]/, '').trim();
                } catch (err) {
                    console.error('Package search failed:', err);
                }
            }

            const assistantMessage: AIMessage = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: finalResponseText,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, assistantMessage]);

            if (packageResults.length > 0) {
                const packagesMessage: AIMessage = {
                    id: (Date.now() + 2).toString(),
                    role: "assistant",
                    content: `__PACKAGES__:${JSON.stringify(packageResults)}`,
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, packagesMessage]);
            }

        } catch (error) {
            console.error("Failed to fetch AI response:", error);
            const fallbackResponse = generateLocalResponse(messageText, country);
            const errorMessage: AIMessage = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: fallbackResponse || "Уучлаарай, одоогоор хариулах боломжгүй байна.",
                timestamp: new Date()
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickQuestion = (questionId: string) => {
        const question = quickQuestions.find((q) => q.id === questionId);
        if (question) {
            handleSend(question.text);
        }
    };

    return (
        <>
            {/* Floating button with pulse effect */}
            <div className={cn("fixed bottom-28 right-4 z-50", isOpen && "hidden")}>
                {/* Ripple effect */}
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 bg-red-500 rounded-full opacity-30"
                />
                <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(true)}
                    className="relative w-16 h-16 rounded-full gradient-primary shadow-xl shadow-red-500/30 flex items-center justify-center border-4 border-white dark:border-slate-900"
                >
                    <Bot className="h-7 w-7 text-white" />
                    <div className="absolute -top-1 -right-1 flex h-6 w-6">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-6 w-6 bg-sky-500 border-2 border-white items-center justify-center">
                            <Sparkles className="w-3 h-3 text-white" />
                        </span>
                    </div>
                </motion.button>
            </div>

            {/* Chat panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.9 }}
                        className="fixed inset-0 z-[100] flex flex-col bg-slate-50 text-slate-900"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center shadow-md shadow-red-500/20">
                                    <Bot className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                        Аяллын Туслах
                                        {isPremium && (
                                            <Badge variant="warning" size="sm" className="shadow-none">
                                                <Crown className="h-3 w-3 mr-1" /> Premium
                                            </Badge>
                                        )}
                                    </h3>
                                    <p className="text-xs text-slate-500 font-medium">
                                        {isGuest ? "Зочин горим" : "Ухаалаг зөвлөгөө"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center transition-all hover:bg-slate-200 text-slate-600"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-slate-50/50">
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={cn(
                                        "flex gap-3",
                                        msg.role === "user" && "flex-row-reverse"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm",
                                            msg.role === "assistant"
                                                ? "bg-white border border-slate-200"
                                                : "gradient-primary"
                                        )}
                                    >
                                        {msg.role === "assistant" ? (
                                            <Sparkles className="h-4 w-4 text-red-500" />
                                        ) : (
                                            <User className="h-4 w-4 text-white" />
                                        )}
                                    </div>
                                    <div
                                        className={cn(
                                            "rounded-2xl px-4 py-3 shadow-sm",
                                            msg.role === "assistant"
                                                ? "bg-white border border-slate-200 rounded-tl-sm text-slate-800"
                                                : "gradient-primary rounded-tr-sm text-white",
                                            // Full width for package lists, restricted width for text
                                            msg.content.startsWith('__PACKAGES__:') ? "w-full" : "max-w-[85%]"
                                        )}
                                    >
                                        {msg.content.startsWith('__PACKAGES__:') ? (
                                            // Render package cards
                                            <div className="space-y-2">
                                                {(() => {
                                                    const allPackages = JSON.parse(msg.content.replace('__PACKAGES__:', ''));
                                                    const displayPackages = allPackages.slice(0, 5);
                                                    const remainingCount = allPackages.length - 5;
                                                    // Derive country and duration for the "See More" link
                                                    const targetCountry = displayPackages[0]?.countries?.[0] || null;

                                                    // Mapping minDays to duration param
                                                    let durationParam = '';
                                                    const commandMatch = msg.content.match(/\[SEARCH_PACKAGES: ([^\]]+)\]/);
                                                    if (commandMatch) {
                                                        const p = new URLSearchParams(commandMatch[1].split(', ').join('&'));
                                                        const minDays = parseInt(p.get('minDays') || '0');
                                                        if (minDays > 0 && minDays <= 7) durationParam = 'short';
                                                        else if (minDays > 7 && minDays <= 15) durationParam = 'medium';
                                                        else if (minDays > 15) durationParam = 'long';
                                                    }

                                                    const seeMoreUrl = new URL(window.location.origin + '/packages');
                                                    if (targetCountry) seeMoreUrl.searchParams.set('country', targetCountry);
                                                    if (durationParam) seeMoreUrl.searchParams.set('duration', durationParam);

                                                    return (
                                                        <>
                                                            {displayPackages.map((pkg: any) => (
                                                                <a
                                                                    key={pkg.id}
                                                                    href={`/package/${pkg.id}`}
                                                                    className="block p-3 rounded-xl bg-slate-50 hover:bg-white transition-all border border-slate-200 hover:border-red-200 hover:shadow-md group"
                                                                >
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <div>
                                                                            <h4 className="font-bold text-slate-900 text-sm group-hover:text-red-600 transition-colors">{pkg.countryName}</h4>
                                                                            <p className="text-xs text-slate-500">{pkg.provider}</p>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <p className="text-lg font-black text-slate-900">₮{pkg.price.toLocaleString()}</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex gap-2 text-xs">
                                                                        <span className="px-2 py-1 rounded-full bg-white border border-slate-200 text-slate-600 font-medium">📊 {pkg.data}</span>
                                                                        <span className="px-2 py-1 rounded-full bg-white border border-slate-200 text-slate-600 font-medium">⏱️ {pkg.validityDays} хоног</span>
                                                                    </div>
                                                                </a>
                                                            ))}

                                                            <a
                                                                href={seeMoreUrl.toString()}
                                                                className="block w-full py-3 mt-2 text-center text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors border border-red-100"
                                                            >
                                                                Бүх багцыг харах {remainingCount > 0 && `(+${remainingCount})`} →
                                                            </a>
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        ) : (
                                            <p className="text-sm whitespace-pre-line leading-relaxed">
                                                {msg.content}
                                            </p>
                                        )}
                                    </div>
                                </motion.div>
                            ))}

                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex gap-3"
                                >
                                    <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                                        <Loader2 className="h-4 w-4 text-red-500 animate-spin" />
                                    </div>
                                    <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                                        <p className="text-sm text-slate-500">Бодож байна...</p>
                                    </div>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick questions: Show only at start */}
                        {messages.length <= 1 && (
                            <div className="px-4 pb-3">
                                <p className="text-xs text-slate-500 mb-3 font-bold uppercase tracking-wide">Жишээ:</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => handleSend("Япон 7 хоног")}
                                        className="px-3 py-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 hover:border-red-200 hover:shadow-sm hover:text-red-700 transition-all text-left group shadow-sm"
                                    >
                                        <span className="block mb-1 text-lg">🇯🇵</span>
                                        <span className="font-bold">Япон 7 хоног</span>
                                    </button>
                                    <button
                                        onClick={() => handleSend("Солонгос 5 хоног")}
                                        className="px-3 py-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 hover:border-red-200 hover:shadow-sm hover:text-red-700 transition-all text-left group shadow-sm"
                                    >
                                        <span className="block mb-1 text-lg">🇰🇷</span>
                                        <span className="font-bold">Солонгос 5 хоног</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Input */}
                        <div className="px-4 pb-8 pt-3 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
                            <div className="flex gap-2 relative">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                    placeholder="Ямар багц хайж байна вэ?"
                                    disabled={isLoading}
                                    className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl pl-4 pr-12 py-3.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-200 focus:bg-white focus:ring-4 focus:ring-red-500/10 transition-all font-medium disabled:opacity-50 disabled:bg-slate-100"
                                />
                                <Button
                                    onClick={() => handleSend()}
                                    disabled={!input.trim() || isLoading}
                                    className="absolute right-1.5 top-1.5 bottom-1.5 w-10 h-auto rounded-xl gradient-primary shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 transition-all p-0 flex items-center justify-center"
                                >
                                    <Send className="h-4 w-4 text-white ml-0.5" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
