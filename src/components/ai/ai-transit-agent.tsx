"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Send,
    Bot,
    MapPin,
    Navigation,
    Bus,
    Train,
    User,
    Sparkles,
    Loader2
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/providers/language-provider";
import { AIChatWindow } from "./ai-chat-window"; // Reusing the chat window logic but wrapped differently
import { AIMessage } from "@/lib/ai-assistant";

interface AITransitAgentProps {
    className?: string;
}

export function AITransitAgent({ className }: AITransitAgentProps) {
    const { t, language } = useTranslation();
    const isMongolian = language === "mn";
    const [messages, setMessages] = useState<AIMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [contextLoaded, setContextLoaded] = useState(false);

    // Initial Greeting & Context Load
    useEffect(() => {
        if (contextLoaded) return;

        const savedPlan = sessionStorage.getItem("gateSIM_activePlan");
        let initialMsg = isMongolian
            ? "Сайн байна уу? Би таны Нийтийн Тээврийн туслах байна. Та хаашаа явах вэ?"
            : "Hello, I'm your Transit Assistant. Where would you like to go?";

        if (savedPlan) {
            try {
                const plan = JSON.parse(savedPlan);
                const isMedical = plan.type === "medical";
                const locations = isMedical
                    ? [plan.data.hospitalInfo?.name].filter(Boolean)
                    : plan.data.days?.[0]?.activities?.map((a: any) => a.location).slice(0, 3);

                if (locations && locations.length > 0) {
                    initialMsg = isMongolian
                        ? `Таны төлөвлөгөөнд байгаа "${locations[0]}" руу хүрэх замыг зааж өгөх үү?`
                        : `Should I guide you to "${locations[0]}" from your itinerary?`;
                } else if (plan.destination) {
                    initialMsg = isMongolian
                        ? `Таны "${plan.destination}" аяллын замд туслах уу?`
                        : `Need help getting around in "${plan.destination}"?`;
                }
            } catch (e) {
                console.error("Error parsing plan for transit agent", e);
            }
        }

        setMessages([{
            id: "transit-welcome",
            role: "assistant",
            content: initialMsg,
            timestamp: new Date()
        }]);

        setContextLoaded(true);
    }, [contextLoaded, isMongolian]);

    return (
        <div className={cn("flex flex-col", className)}>
            {/* Header Area */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Bus className="w-6 h-6 text-blue-500" />
                        {isMongolian ? "Нийтийн Тээврийн Хөтөч" : "Transit Guide"}
                    </h1>
                    <p className="text-slate-500 text-sm">
                        {isMongolian ? "Хамгийн дөт, хямд замыг олоорой" : "Find the fastest and cheapest routes"}
                    </p>
                </div>
            </div>

            {/* Chat Area - Reusing AIChatWindow but embedded */}
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-3xl overflow-hidden shadow-sm h-[500px] relative">
                <AIChatWindow
                    isOpen={true}
                    onClose={() => { }} // No close action needed for embedded
                    messages={messages}
                    setMessages={setMessages}
                    mode="transit"
                    // Pass context so API knows about the plan
                    tripContext={typeof window !== 'undefined' ? sessionStorage.getItem("gateSIM_activePlan") : null}
                    // Custom styling to fit embedded view
                    className="h-full w-full rounded-none shadow-none static !fixed-none !transform-none !inset-auto"
                    hideHeader={true}
                    quickActions={[
                        {
                            label: isMongolian ? "Ойрхон буудал" : "Nearest Station",
                            value: isMongolian ? "Хамгийн ойр автобусны буудал хаана байна?" : "Where is the nearest bus station?",
                            icon: <MapPin className="w-3.5 h-3.5" />
                        },
                        {
                            label: isMongolian ? "Эмнэлэг рүү" : "To Hospital",
                            value: isMongolian ? "Хамгийн ойр эмнэлэг рүү яаж очих вэ?" : "How do I get to the nearest hospital?",
                            icon: <Navigation className="w-3.5 h-3.5" />
                        },
                        {
                            label: isMongolian ? "Метроны зураг" : "Subway Map",
                            value: isMongolian ? "Метроны зураг харуулна уу" : "Show me the subway map",
                            icon: <Train className="w-3.5 h-3.5" />
                        }
                    ]}
                />
            </div>
        </div>
    );
}
