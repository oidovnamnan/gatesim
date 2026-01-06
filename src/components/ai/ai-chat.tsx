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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
    AIMessage,
    quickQuestions,
    aiPricing,
    installationGuides,
} from "@/lib/ai-assistant";
import { generateLocalResponse, ESIM_INSTALL_PROMPT } from "@/lib/local-ai";

interface AIChatProps {
    country?: string;
    isPremium?: boolean;
}

export function AIChat({ country, isPremium = false }: AIChatProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<AIMessage[]>([
        {
            id: "welcome",
            role: "assistant",
            content: `Сайн байна уу! 👋 

Би таны Аяллын Ухаалаг Туслах. ${country ? `**${country}** руу аялахад туслах бэлэн байна!` : "Аливаа асуултаа асуугаарай!"}

💡 Жишээ нь: "Япон руу 2 долоо хоног явна" гэвэл танд тохирох багцуудыг санал болгоно.

Доорх түгээмэл асуултуудаас сонгох эсвэл өөрийн асуултаа бичээрэй.`,
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [messageCount, setMessageCount] = useState(0);
    const [conversationState, setConversationState] = useState<"idle" | "awaiting_device">("idle");
    const messagesEndRef = useRef<HTMLDivElement>(null);


    const maxFreeMessages = aiPricing.free.messagesPerDay;
    const canSendMessage = isPremium || messageCount < maxFreeMessages;

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
        if (!messageText || isLoading || !canSendMessage) return;

        const userMessage: AIMessage = {
            id: Date.now().toString(),
            role: "user",
            content: messageText,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);
        setMessageCount((prev) => prev + 1);

        // Simulate AI response (in production, call actual API)
        await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));

        // Check for prebuilt responses
        let responseText = "";
        const lowerText = messageText.toLowerCase();

        if (conversationState === "awaiting_device") {
            if (lowerText.includes("iphone") || lowerText.includes("ios") || lowerText.includes("apple")) {
                responseText = installationGuides.iphone;
            } else if (lowerText.includes("samsung") || lowerText.includes("galaxy")) {
                responseText = installationGuides.samsung;
            } else if (lowerText.includes("pixel") || lowerText.includes("google")) {
                responseText = installationGuides.pixel;
            } else {
                responseText = installationGuides.generic;
            }
            setConversationState("idle");
        } else if (lowerText.includes("суулгах") || lowerText.includes("install")) {
            responseText = ESIM_INSTALL_PROMPT;
            setConversationState("awaiting_device");
        } else if (lowerText.includes("дэмжих үү") || lowerText.includes("support") || lowerText.includes("compatible")) {
            // Use local logic for device check
            responseText = generateLocalResponse(messageText);
        } else {
            // Call API for response (Local or OpenAI handled by server)
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
                        country: country
                    })
                });

                if (!res.ok) throw new Error('API request failed');

                const data = await res.json();
                responseText = data.content;
            } catch (error) {
                console.error("Failed to fetch AI response:", error);
                // Fallback to local generator client-side if API fails completely
                responseText = generateLocalResponse(messageText, country);
            }
        }

        // Parse AI response for package search command
        let finalResponseText = responseText;
        let packageResults: any[] = [];

        const searchMatch = responseText.match(/\[SEARCH_PACKAGES:\s*([^\]]+)\]/);
        if (searchMatch) {
            // Extract search parameters
            const paramsStr = searchMatch[1];
            const params = new URLSearchParams();

            // Parse parameters (country=JP, minDays=10, etc.)
            paramsStr.split(',').forEach(pair => {
                const [key, value] = pair.split('=').map(s => s.trim());
                if (key && value) params.append(key, value);
            });

            // Call package search API
            try {
                const searchRes = await fetch(`/api/packages/search?${params.toString()}`);
                if (searchRes.ok) {
                    const searchData = await searchRes.json();
                    if (searchData.success && searchData.packages.length > 0) {
                        packageResults = searchData.packages;
                        // Remove the search command from displayed text
                        finalResponseText = responseText.replace(/\[SEARCH_PACKAGES:[^\]]+\]/, '').trim();
                    }
                }
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

        // If packages found, add them as a separate message
        if (packageResults.length > 0) {
            const packagesMessage: AIMessage = {
                id: (Date.now() + 2).toString(),
                role: "assistant",
                content: `__PACKAGES__:${JSON.stringify(packageResults)}`,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, packagesMessage]);
        }

        setIsLoading(false);
    };

    const handleQuickQuestion = (questionId: string) => {
        const question = quickQuestions.find((q) => q.id === questionId);
        if (question) {
            handleSend(question.text);
        }
    };


    return (
        <>
            {/* Floating button */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(true)}
                className={cn(
                    "fixed bottom-28 right-4 z-50 w-14 h-14 rounded-full",
                    "gradient-primary shadow-lg shadow-[var(--theme-shadow)]",
                    "flex items-center justify-center",
                    isOpen && "hidden"
                )}
            >
                <MessageCircle className="h-6 w-6 text-white" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                    AI
                </span>
            </motion.button>

            {/* Chat panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.9 }}
                        className="fixed inset-0 z-[100] flex flex-col bg-slate-50"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center shadow-md shadow-red-500/20">
                                    <Bot className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                        Аяллын Ухаалаг Туслах
                                        {isPremium && (
                                            <Badge variant="warning" size="sm" className="shadow-none">
                                                <Crown className="h-3 w-3 mr-1" /> Premium
                                            </Badge>
                                        )}
                                    </h3>
                                    <p className="text-xs text-slate-500 font-medium">Ухаалаг зөвлөгөө</p>
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
                        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
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
                                            "max-w-[85%] rounded-2xl px-4 py-3 shadow-sm",
                                            msg.role === "assistant"
                                                ? "bg-white border border-slate-200 rounded-tl-sm text-slate-800"
                                                : "gradient-primary rounded-tr-sm text-white"
                                        )}
                                    >
                                        {msg.content.startsWith('__PACKAGES__:') ? (
                                            // Render package cards
                                            <div className="space-y-2">
                                                {JSON.parse(msg.content.replace('__PACKAGES__:', '')).map((pkg: any) => (
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

                        {/* Quick questions */}
                        {messages.length <= 2 && (
                            <div className="px-4 pb-3">
                                <p className="text-xs text-slate-500 mb-3 font-bold uppercase tracking-wide">Түгээмэл асуултууд:</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {quickQuestions.slice(0, 4).map((q) => (
                                        <button
                                            key={q.id}
                                            onClick={() => handleQuickQuestion(q.id)}
                                            className="px-3 py-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 hover:border-red-200 hover:shadow-sm hover:text-red-700 transition-all text-left group shadow-sm"
                                        >
                                            <span className="block mb-1 text-lg group-hover:scale-110 transition-transform origin-left">{q.icon}</span>
                                            <span className="font-bold">{q.text}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Free tier limit warning */}
                        {!isPremium && messageCount >= maxFreeMessages - 1 && (
                            <div className="px-4 pb-2">
                                <div className="mb-2 flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-amber-500" />
                                    <span className="text-xs text-slate-600 font-medium">
                                        {messageCount >= maxFreeMessages ? "Өдрийн хязгаар хүрлээ" : "Туршилтын хязгаар дуусах дөхлөө"}
                                    </span>
                                </div>
                                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                    {aiPricing.plans.map(plan => (
                                        <div key={plan.id} className="min-w-[140px] p-3 rounded-xl bg-white border border-slate-200 hover:border-red-500 transition-colors cursor-pointer relative overflow-hidden flex flex-col group shadow-sm">
                                            {plan.recommended && (
                                                <div className="absolute top-0 right-0 px-1.5 py-0.5 bg-red-600 text-[8px] text-white rounded-bl-lg font-bold">
                                                    BEST
                                                </div>
                                            )}
                                            <h4 className="font-bold text-slate-900 text-xs mb-1">{plan.name}</h4>
                                            <div className="flex items-baseline gap-0.5 mb-1">
                                                <span className="text-lg font-black text-red-600">${plan.price}</span>
                                                <span className="text-[10px] text-slate-400">/{plan.durationDays}d</span>
                                            </div>
                                            <Button size="sm" className="w-full h-7 text-[10px] bg-slate-900 text-white hover:bg-slate-800 mt-auto rounded-lg">
                                                Авах
                                            </Button>
                                        </div>
                                    ))}
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
                                    placeholder={
                                        canSendMessage
                                            ? "Асуултаа бичнэ үү..."
                                            : "Өдрийн хязгаар хүрлээ"
                                    }
                                    disabled={!canSendMessage || isLoading}
                                    className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl pl-4 pr-12 py-3.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-200 focus:bg-white focus:ring-4 focus:ring-red-500/10 transition-all font-medium disabled:opacity-50 disabled:bg-slate-100"
                                />
                                <Button
                                    onClick={() => handleSend()}
                                    disabled={!input.trim() || isLoading || !canSendMessage}
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
