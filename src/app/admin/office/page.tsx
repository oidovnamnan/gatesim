"use client";

import { useState, useEffect, useRef } from "react";
import {
    ShieldCheck,
    Send,
    User,
    Bot,
    Loader2,
    Sparkles,
    ClipboardCheck,
    Coffee,
    Calendar,
    Users
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, where, limit, onSnapshot } from "firebase/firestore";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

export default function ManagerOfficePage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [manager, setManager] = useState<{ name: string; image: string } | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Fetch the active manager
    useEffect(() => {
        const q = query(
            collection(db, "aiStaff"),
            where("isDefaultManager", "==", true),
            limit(1)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const data = snapshot.docs[0].data();
                setManager({
                    name: data.name,
                    image: data.image
                });

                // Greeting from manager
                setMessages([
                    {
                        id: "welcome",
                        role: "assistant",
                        content: `Сайн байна уу, Захирал аа. Би өнөөдөр танд оффисын үйл ажиллагаа, ажилчдын тайлан зэрэгт туслахад бэлэн байна. Та өнөөдрийн байдлаар юуг шалгамаар байна?`,
                        timestamp: new Date()
                    }
                ]);
            } else {
                setManager({
                    name: "Менежер",
                    image: "/assets/ai/staff/staff_3.png" // Fallback
                });
            }
        });

        return () => unsubscribe();
    }, []);

    // Scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: messages.concat(userMsg).map(m => ({ role: m.role, content: m.content })),
                    mode: "manager",
                    language: "mn"
                })
            });

            const data = await response.json();

            const assistMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: data.content,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistMsg]);
        } catch (error) {
            console.error("Chat error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto h-[calc(100vh-140px)] flex flex-col gap-6">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                <div className="flex items-center gap-6">
                    <div className="relative w-24 h-24 rounded-[2rem] overflow-hidden shadow-2xl ring-4 ring-emerald-500/20">
                        {manager?.image && (
                            <Image src={manager.image} alt={manager.name} fill className="object-cover" />
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Захирлын өрөө</h1>
                            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-3 py-0.5 rounded-full font-black text-[10px] tracking-widest uppercase">
                                Active Manager
                            </Badge>
                        </div>
                        <p className="text-slate-500 font-medium">
                            Оффис менежер <span className="text-slate-900 dark:text-slate-200 font-bold">{manager?.name}</span>-тай харилцах хэсэг.
                        </p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <div className="flex flex-col items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 min-w-[100px]">
                        <ClipboardCheck className="h-5 w-5 text-emerald-500 mb-1" />
                        <span className="text-[10px] font-black text-slate-400 uppercase">Бэлэн</span>
                    </div>
                    <div className="flex flex-col items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 min-w-[100px]">
                        <Coffee className="h-5 w-5 text-amber-500 mb-1" />
                        <span className="text-[10px] font-black text-slate-400 uppercase">Менежер</span>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] flex flex-col overflow-hidden shadow-sm">
                {/* Messages */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar"
                >
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                                "flex items-start gap-4",
                                msg.role === "user" ? "flex-row-reverse" : "flex-row"
                            )}
                        >
                            <div className={cn(
                                "w-10 h-10 rounded-2xl overflow-hidden flex-shrink-0 shadow-md",
                                msg.role === "user" ? "bg-blue-500" : "bg-slate-200"
                            )}>
                                {msg.role === "assistant" ? (
                                    manager?.image && <Image src={manager.image} alt="Manager" width={40} height={40} className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white">
                                        <User className="h-5 w-5" />
                                    </div>
                                )}
                            </div>

                            <div className={cn(
                                "max-w-[80%] p-4 rounded-3xl text-sm font-medium leading-relaxed",
                                msg.role === "user"
                                    ? "bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-500/10"
                                    : "bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-100 dark:border-slate-700"
                            )}>
                                {msg.content}
                                <div className={cn(
                                    "text-[9px] mt-2 font-bold opacity-50",
                                    msg.role === "user" ? "text-right" : "text-left"
                                )}>
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    {isLoading && (
                        <div className="flex items-center gap-3 text-slate-400">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-xs font-bold tracking-widest uppercase">Менежер бичиж байна...</span>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-6 bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800">
                    <div className="relative flex items-center gap-3">
                        <Input
                            placeholder="Захирал аа, та зааварчилгаа өгнө үү..."
                            className="h-14 bg-white dark:bg-slate-800 border-none rounded-2xl px-6 shadow-sm font-medium"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                        />
                        <Button
                            className="h-14 w-14 rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                            onClick={handleSendMessage}
                            disabled={isLoading || !input.trim()}
                        >
                            <Send className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Өдрийн тайлан", icon: Calendar, color: "text-blue-500" },
                    { label: "Ажилчдын ирц", icon: Users, color: "text-emerald-500" },
                    { label: "Борлуулалтын явц", icon: ClipboardCheck, color: "text-amber-500" },
                    { label: "Системийн төлөв", icon: ShieldCheck, color: "text-violet-500" }
                ].map((action, i) => (
                    <button
                        key={i}
                        onClick={() => setInput(action.label)}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-left shadow-sm group"
                    >
                        <div className={cn("p-2 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:scale-110 transition-transform", action.color)}>
                            <action.icon className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight">{action.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
