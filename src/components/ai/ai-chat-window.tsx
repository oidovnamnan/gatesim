"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Send,
    Sparkles,
    Bot,
    User,
    Loader2,
    Mic,
    MicOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { AIMessage } from "@/lib/ai-assistant";
import { generateLocalResponse } from "@/lib/local-ai";
import { useTranslation } from "@/providers/language-provider";

interface AIChatWindowProps {
    country?: string;
    isPremium?: boolean;
    isOpen: boolean;
    onClose: () => void;
    messages: AIMessage[];
    setMessages: React.Dispatch<React.SetStateAction<AIMessage[]>>;
    mode?: string;
    tripContext?: string | null;
    className?: string;
    hideHeader?: boolean;
    quickActions?: { label: string; value: string; icon?: React.ReactNode }[];
}

export function AIChatWindow({
    country,
    isPremium = false,
    isOpen,
    onClose,
    messages,
    setMessages,
    mode = "tourist",
    tripContext = null,
    className,
    hideHeader = false,
    quickActions
}: AIChatWindowProps) {
    const { data: session } = useSession();
    const { t, language } = useTranslation();
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);

    const isGuest = !session?.user;

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isOpen]);

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
                    language: language,
                    mode: mode,
                    tripContext: tripContext
                })
            });

            let responseText = "";

            if (!res.ok) {
                console.error('API request failed');
                responseText = t("error");
            } else {
                const data = await res.json();
                responseText = data.content;
            }

            let finalResponseText = responseText;
            let packageResults: any[] = [];
            let transitRoute: { to: string; mode: string } | null = null;

            // 1. Check for Package Search
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
                    finalResponseText = finalResponseText.replace(/\[SEARCH_PACKAGES:[^\]]+\]/, '').trim();
                } catch (err) {
                    console.error('Package search failed:', err);
                }
            }

            // 2. Check for Transit Route
            const transitMatch = responseText.match(/\[TRANSIT_ROUTE:\s*([^\]]+)\]/);
            if (transitMatch) {
                const paramsStr = transitMatch[1];
                const params: Record<string, string> = {};
                paramsStr.split(',').forEach(pair => {
                    const [key, value] = pair.split('=').map(s => s.trim());
                    if (key && value) params[key] = value;
                });

                if (params.to) {
                    transitRoute = { to: params.to, mode: params.mode || 'transit' };
                }

                finalResponseText = finalResponseText.replace(/\[TRANSIT_ROUTE:[^\]]+\]/, '').trim();
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

            if (transitRoute) {
                const transitMessage: AIMessage = {
                    id: (Date.now() + 3).toString(),
                    role: "assistant", // Using system role or special format would be cleaner but this works
                    content: `__TRANSIT__:${JSON.stringify(transitRoute)}`,
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, transitMessage]);
            }

        } catch (error) {
            console.error("Failed to fetch AI response:", error);
            const fallbackResponse = generateLocalResponse(messageText, country);
            const errorMessage: AIMessage = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: fallbackResponse || t("error"),
                timestamp: new Date()
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className={cn(
                "fixed inset-0 z-[100] flex flex-col bg-slate-50 text-slate-900 md:bottom-32 md:right-8 md:left-auto md:top-auto md:w-[400px] md:h-[600px] md:rounded-[32px] md:overflow-hidden md:shadow-2xl",
                className
            )}
        >
            {/* Header */}
            {!hideHeader && (
                <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center shadow-md shadow-red-500/20">
                            <Bot className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                {t("aiTitle")}
                            </h3>
                            <p className="text-xs text-slate-500 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[180px]">
                                {isGuest ? t("aiGuestMode") : t("aiDescription")}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center transition-all hover:bg-slate-200 text-slate-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
            )}

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
                                msg.content.startsWith('__PACKAGES__:') ? "w-full" : "max-w-[85%]"
                            )}
                        >
                            {msg.content.startsWith('__PACKAGES__:') ? (
                                <div className="space-y-2">
                                    {(() => {
                                        const allPackages = JSON.parse(msg.content.replace('__PACKAGES__:', ''));
                                        const displayPackages = allPackages.slice(0, 5);
                                        const remainingCount = allPackages.length - 5;
                                        const targetCountry = displayPackages[0]?.countries?.[0] || null;

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
                                                                <h4 className="font-bold text-slate-900 text-sm group-hover:text-red-600 transition-colors uppercase">{pkg.countryName}</h4>
                                                                <p className="text-[10px] text-slate-500 font-bold">{pkg.provider}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-base font-black text-slate-900">₮{pkg.price.toLocaleString()}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2 text-[10px]">
                                                            <span className="px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 font-bold">{pkg.data}</span>
                                                            <span className="px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 font-bold">{pkg.validityDays} {t("day")}</span>
                                                        </div>
                                                    </a>
                                                ))}
                                                <a
                                                    href={`/packages${targetCountry ? `?country=${targetCountry}` : ''}`}
                                                    className="block w-full py-2.5 mt-2 text-center text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors border border-red-100"
                                                >
                                                    {t("aiSeeAll")} {remainingCount > 0 && `(+${remainingCount})`} →
                                                </a>
                                            </>
                                        );
                                    })()}
                                </div>
                            ) : msg.content.startsWith('__TRANSIT__:') ? (
                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mt-2">
                                    {(() => {
                                        const route = JSON.parse(msg.content.replace('__TRANSIT__:', ''));
                                        return (
                                            <div>
                                                <div className="flex items-start gap-3 mb-4">
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-slate-500 font-bold uppercase mb-0.5">Route Guide</p>
                                                        <h4 className="text-base font-black text-slate-900 leading-tight">To {route.to}</h4>
                                                    </div>
                                                </div>

                                                <a
                                                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(route.to)}&travelmode=${route.mode || 'transit'}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-lg shadow-blue-500/30"
                                                >
                                                    <span>View Route on Maps</span>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                </a>
                                                <p className="text-[10px] text-center text-slate-400 mt-2 font-medium">Opens Google Maps</p>
                                            </div>
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
                            <p className="text-sm text-slate-500">{t("aiThinking")}</p>
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions (Custom) */}
            {quickActions && quickActions.length > 0 && (
                <div className="px-4 pb-2">
                    <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                        {quickActions.map((action, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSend(action.value)}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm whitespace-nowrap"
                            >
                                {action.icon && <span className="text-blue-500">{action.icon}</span>}
                                <span className="font-bold">{action.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Default Popular Packages (Tourist Mode) */}
            {messages.length <= 1 && mode !== 'transit' && !quickActions && (
                <div className="px-4 pb-3">
                    <p className="text-[10px] text-slate-400 mb-3 font-black uppercase tracking-widest ml-1">{t("aiPopularPackages")}</p>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => handleSend(language === 'mn' ? "Япон 7 хоног" : language === 'cn' ? "日本 7 天" : "Japan 7 days")}
                            className="px-3 py-3 rounded-2xl bg-white border border-slate-200 text-xs text-slate-700 hover:border-red-200 hover:shadow-md hover:text-red-700 transition-all text-left group shadow-sm"
                        >
                            <span className="block mb-1 text-xl">🇯🇵</span>
                            <span className="font-bold">{language === 'mn' ? "Япон" : language === 'cn' ? "日本" : "Japan"} 7 {t("day")}</span>
                        </button>
                        <button
                            onClick={() => handleSend(language === 'mn' ? "Солонгос 5 хоног" : language === 'cn' ? "韩国 5 天" : "Korea 5 days")}
                            className="px-3 py-3 rounded-2xl bg-white border border-slate-200 text-xs text-slate-700 hover:border-red-200 hover:shadow-md hover:text-red-700 transition-all text-left group shadow-sm"
                        >
                            <span className="block mb-1 text-xl">🇰🇷</span>
                            <span className="font-bold">{language === 'mn' ? "Солонгос" : language === 'cn' ? "韩国" : "Korea"} 5 {t("day")}</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Input */}
            <div className={cn(
                "px-4 pt-3 bg-white border-t border-slate-200",
                hideHeader ? "pb-3" : "pb-4 md:pb-6"
            )}>
                <div className="flex gap-2 relative">
                    {/* Voice Input Button */}
                    <button
                        onClick={() => {
                            if (typeof window === 'undefined') return;
                            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                            if (!SpeechRecognition) {
                                alert(t('voiceNotSupported') || 'Voice input not supported in this browser');
                                return;
                            }

                            if (isRecording) {
                                recognitionRef.current?.stop();
                                setIsRecording(false);
                                return;
                            }

                            const recognition = new SpeechRecognition();
                            recognition.lang = language === 'mn' ? 'mn-MN' : language === 'cn' ? 'zh-CN' : 'en-US';
                            recognition.interimResults = false;
                            recognition.maxAlternatives = 1;

                            recognition.onresult = (event: any) => {
                                const transcript = event.results[0][0].transcript;
                                setInput(prev => prev + transcript);
                                setIsRecording(false);
                            };

                            recognition.onerror = () => {
                                setIsRecording(false);
                            };

                            recognition.onend = () => {
                                setIsRecording(false);
                            };

                            recognitionRef.current = recognition;
                            recognition.start();
                            setIsRecording(true);
                        }}
                        disabled={isLoading}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isRecording
                            ? 'bg-red-500 text-white animate-pulse'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </button>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder={
                            isRecording ? (t('listening') || 'Listening...')
                                : mode === 'transit'
                                    ? (language === 'mn' ? "Хаашаа явах вэ?" : "Where do you want to go?")
                                    : t("aiPlaceholder")
                        }
                        disabled={isLoading || isRecording}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl pl-4 pr-12 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-200 focus:bg-white transition-all font-bold disabled:opacity-50"
                    />
                    <Button
                        onClick={() => handleSend()}
                        disabled={!input.trim() || isLoading}
                        className="absolute right-1.5 top-1.5 bottom-1.5 w-10 h-auto rounded-xl gradient-primary shadow-md p-0 flex items-center justify-center border-none"
                    >
                        <Send className="h-4 w-4 text-white" />
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}
