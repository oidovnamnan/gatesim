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
        <div className={cn("min-h-[80vh] flex flex-col", className)}>
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
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-3xl overflow-hidden shadow-sm h-[600px] relative">
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
                />
            </div>

            {/* Quick Actions (Optional) */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-1" onClick={() => {
                    // We can programmatically send message if we expose that capability or logic
                    // For now just UI placeholders
                }}>
                    <MapPin className="w-4 h-4 text-blue-500" />
                    <span className="text-xs">{isMongolian ? "Ойрхон буудал" : "Nearest Station"}</span>
                </Button>
                <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-1">
                    <Navigation className="w-4 h-4 text-green-500" />
                    <span className="text-xs">{isMongolian ? "Эмнэлэг рүү" : "To Hospital"}</span>
                </Button>
                <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-1">
                    <Train className="w-4 h-4 text-purple-500" />
                    <span className="text-xs">{isMongolian ? "Метроны зураг" : "Subway Map"}</span>
                </Button>
            </div>
        </div>
    );
}
