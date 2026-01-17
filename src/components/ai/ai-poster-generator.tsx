"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Image as ImageIcon,
    Download,
    Share2,
    Loader2,
    Sparkles,
    RefreshCw,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/providers/language-provider";
import { cn } from "@/lib/utils";

// Poster templates
const templates = [
    { id: "postcard", label: "Шуудангийн хуудас", labelEn: "Postcard", aspect: "4:3" },
    { id: "story", label: "Story", labelEn: "Story", aspect: "9:16" },
    { id: "square", label: "Дөрвөлжин", labelEn: "Square", aspect: "1:1" },
    { id: "poster", label: "Постер", labelEn: "Poster", aspect: "2:3" },
];

// Destinations for poster
const destinations = [
    { code: "JP", name: "Япон", nameEn: "Japan", emoji: "🗼" },
    { code: "KR", name: "Солонгос", nameEn: "Korea", emoji: "🏯" },
    { code: "TH", name: "Тайланд", nameEn: "Thailand", emoji: "🏝️" },
    { code: "CN", name: "Хятад", nameEn: "China", emoji: "🏮" },
    { code: "SG", name: "Сингапур", nameEn: "Singapore", emoji: "🌆" },
];

// Styles
const posterStyles = [
    { id: "modern", label: "Орчин үе", labelEn: "Modern" },
    { id: "vintage", label: "Ретро", labelEn: "Vintage" },
    { id: "minimalist", label: "Минималист", labelEn: "Minimalist" },
    { id: "vibrant", label: "Тод өнгөт", labelEn: "Vibrant" },
];

interface AIPosterGeneratorProps {
    className?: string;
}

export function AIPosterGenerator({ className }: AIPosterGeneratorProps) {
    const { language } = useTranslation();
    const isMongolian = language === "mn";

    const [destination, setDestination] = useState("JP");
    const [template, setTemplate] = useState("postcard");
    const [style, setStyle] = useState("modern");
    const [customPrompt, setCustomPrompt] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);

    const generatePoster = async () => {
        setIsLoading(true);
        setGeneratedImage(null);

        try {
            const res = await fetch("/api/ai/image", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    destination,
                    template,
                    style,
                    customPrompt,
                    language,
                }),
            });

            const data = await res.json();
            if (data.success && data.imageUrl) {
                setGeneratedImage(data.imageUrl);
            }
        } catch (error) {
            console.error("Image generation error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const downloadImage = async () => {
        if (!generatedImage) return;

        const response = await fetch(generatedImage);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `gatesim-travel-poster-${destination}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    const shareImage = async () => {
        if (!generatedImage || !navigator.share) return;

        try {
            await navigator.share({
                title: isMongolian ? "GateSIM Аялалын Постер" : "GateSIM Travel Poster",
                text: isMongolian ? "AI-ийн үүсгэсэн аялалын постер" : "AI-generated travel poster",
                url: generatedImage,
            });
        } catch (error) {
            console.error("Share error:", error);
        }
    };

    return (
        <div className={cn("space-y-6", className)}>
            {/* Destination Selection */}
            <div>
                <h3 className="font-bold mb-3">
                    {isMongolian ? "Газар сонгоно уу" : "Choose destination"}
                </h3>
                <div className="flex flex-wrap gap-2">
                    {destinations.map((dest) => (
                        <button
                            key={dest.code}
                            onClick={() => setDestination(dest.code)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-sm transition-all",
                                destination === dest.code
                                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg scale-105"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                            )}
                        >
                            <span>{dest.emoji}</span>
                            {isMongolian ? dest.name : dest.nameEn}
                        </button>
                    ))}
                </div>
            </div>

            {/* Template Selection */}
            <div>
                <h3 className="font-bold mb-3">
                    {isMongolian ? "Загвар" : "Template"}
                </h3>
                <div className="grid grid-cols-4 gap-2">
                    {templates.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTemplate(t.id)}
                            className={cn(
                                "flex flex-col items-center gap-2 p-3 rounded-xl font-bold text-xs transition-all",
                                template === t.id
                                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                            )}
                        >
                            <div className={cn(
                                "w-8 h-10 bg-current/20 rounded",
                                t.aspect === "1:1" && "w-8 h-8",
                                t.aspect === "9:16" && "w-6 h-10",
                                t.aspect === "4:3" && "w-10 h-8"
                            )} />
                            {isMongolian ? t.label : t.labelEn}
                        </button>
                    ))}
                </div>
            </div>

            {/* Style Selection */}
            <div>
                <h3 className="font-bold mb-3">
                    {isMongolian ? "Загварчлал" : "Style"}
                </h3>
                <div className="flex flex-wrap gap-2">
                    {posterStyles.map((s) => (
                        <button
                            key={s.id}
                            onClick={() => setStyle(s.id)}
                            className={cn(
                                "px-4 py-2 rounded-full font-bold text-sm transition-all",
                                style === s.id
                                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                            )}
                        >
                            {isMongolian ? s.label : s.labelEn}
                        </button>
                    ))}
                </div>
            </div>

            {/* Custom Prompt */}
            <div>
                <h3 className="font-bold mb-3">
                    {isMongolian ? "Нэмэлт тайлбар (заавал биш)" : "Custom prompt (optional)"}
                </h3>
                <input
                    type="text"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder={isMongolian ? "Жишээ: Намар, уулсыг харуулсан..." : "Example: Autumn scenery with mountains..."}
                    className="w-full px-4 py-3 rounded-xl border bg-background text-sm"
                />
            </div>

            {/* Generate Button */}
            <Button
                onClick={generatePoster}
                disabled={isLoading}
                className="w-full py-6 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-lg"
            >
                {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                    <Sparkles className="w-5 h-5 mr-2" />
                )}
                {isMongolian ? "Постер үүсгэх" : "Generate Poster"}
            </Button>

            {/* Generated Image */}
            <AnimatePresence>
                {generatedImage && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        <Card className="p-4 overflow-hidden">
                            <div className="relative rounded-xl overflow-hidden">
                                <img
                                    src={generatedImage}
                                    alt="Generated travel poster"
                                    className="w-full h-auto"
                                />
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <Badge className="bg-black/50 text-white backdrop-blur-sm">
                                        AI Generated
                                    </Badge>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 mt-4">
                                <Button
                                    onClick={downloadImage}
                                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-500"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    {isMongolian ? "Татах" : "Download"}
                                </Button>
                                <Button
                                    onClick={shareImage}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    <Share2 className="w-4 h-4 mr-2" />
                                    {isMongolian ? "Хуваалцах" : "Share"}
                                </Button>
                                <Button
                                    onClick={generatePoster}
                                    variant="outline"
                                    disabled={isLoading}
                                >
                                    <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Loading State */}
            {isLoading && (
                <Card className="p-8 text-center">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-orange-500" />
                    <p className="font-bold">
                        {isMongolian ? "AI постер үүсгэж байна..." : "AI is generating your poster..."}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                        {isMongolian ? "20-30 секунд болно" : "This takes 20-30 seconds"}
                    </p>
                </Card>
            )}
        </div>
    );
}

export default AIPosterGenerator;
