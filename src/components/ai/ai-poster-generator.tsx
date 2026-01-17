"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Upload,
    Image as ImageIcon,
    Download,
    Share2,
    Loader2,
    Sparkles,
    Type,
    Palette,
    RotateCw,
    X,
    Check,
    MapPin,
    Calendar,
    Camera,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/providers/language-provider";
import { cn } from "@/lib/utils";

// Filter presets
const filterPresets = [
    { id: "original", name: "Эх", nameEn: "Original", filter: "" },
    { id: "vivid", name: "Тод", nameEn: "Vivid", filter: "saturate(1.3) contrast(1.1)" },
    { id: "warm", name: "Дулаан", nameEn: "Warm", filter: "sepia(0.2) saturate(1.2)" },
    { id: "cool", name: "Хөнгөн", nameEn: "Cool", filter: "hue-rotate(20deg) saturate(1.1)" },
    { id: "vintage", name: "Ретро", nameEn: "Vintage", filter: "sepia(0.4) contrast(1.1) brightness(1.05)" },
    { id: "bw", name: "Хар цагаан", nameEn: "B&W", filter: "grayscale(1)" },
];

// Text positions
const textPositions = [
    { id: "bottom", label: "Доод", labelEn: "Bottom" },
    { id: "top", label: "Дээд", labelEn: "Top" },
    { id: "center", label: "Төв", labelEn: "Center" },
];

interface TravelMemoryPosterProps {
    className?: string;
}

export function TravelMemoryPoster({ className }: TravelMemoryPosterProps) {
    const { language } = useTranslation();
    const isMongolian = language === "mn";

    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [selectedFilter, setSelectedFilter] = useState("original");
    const [overlayText, setOverlayText] = useState("");
    const [locationText, setLocationText] = useState("");
    const [dateText, setDateText] = useState("");
    const [textPosition, setTextPosition] = useState("bottom");
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [enhancedImage, setEnhancedImage] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Handle file upload
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setUploadedImage(event.target?.result as string);
                setEnhancedImage(null);
            };
            reader.readAsDataURL(file);
        }
    };

    // AI Enhance (calls OpenAI Vision or simple enhancement)
    const handleEnhance = async () => {
        if (!uploadedImage) return;

        setIsEnhancing(true);
        try {
            const res = await fetch("/api/ai/enhance-photo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: uploadedImage }),
            });

            const data = await res.json();
            if (data.success && data.enhancedImage) {
                setEnhancedImage(data.enhancedImage);
            }
        } catch (error) {
            console.error("Enhancement error:", error);
        } finally {
            setIsEnhancing(false);
        }
    };

    // Download poster
    const downloadPoster = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const link = document.createElement("a");
        link.download = `gatesim-travel-memory-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
    }, []);

    // Share poster
    const sharePoster = async () => {
        const canvas = canvasRef.current;
        if (!canvas || !navigator.share) return;

        try {
            canvas.toBlob(async (blob) => {
                if (!blob) return;
                const file = new File([blob], "travel-memory.png", { type: "image/png" });
                await navigator.share({
                    title: isMongolian ? "Аялалын дурсамж" : "Travel Memory",
                    files: [file],
                });
            });
        } catch (error) {
            console.error("Share error:", error);
        }
    };

    // Render canvas with overlays
    const renderCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const imageToUse = enhancedImage || uploadedImage;
        if (!canvas || !imageToUse) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            // Set canvas size
            canvas.width = img.width;
            canvas.height = img.height;

            // Apply filter
            const filter = filterPresets.find(f => f.id === selectedFilter)?.filter || "";
            ctx.filter = filter || "none";

            // Draw image
            ctx.drawImage(img, 0, 0);
            ctx.filter = "none";

            // Add gradient overlay for text
            if (overlayText || locationText || dateText) {
                const gradient = ctx.createLinearGradient(0, canvas.height * 0.6, 0, canvas.height);
                gradient.addColorStop(0, "rgba(0,0,0,0)");
                gradient.addColorStop(1, "rgba(0,0,0,0.7)");

                if (textPosition === "bottom") {
                    ctx.fillStyle = gradient;
                    ctx.fillRect(0, canvas.height * 0.6, canvas.width, canvas.height * 0.4);
                } else if (textPosition === "top") {
                    const gradientTop = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.4);
                    gradientTop.addColorStop(0, "rgba(0,0,0,0.7)");
                    gradientTop.addColorStop(1, "rgba(0,0,0,0)");
                    ctx.fillStyle = gradientTop;
                    ctx.fillRect(0, 0, canvas.width, canvas.height * 0.4);
                }
            }

            // Draw text
            ctx.fillStyle = "white";
            ctx.textAlign = "center";

            const fontSize = Math.max(canvas.width * 0.05, 24);
            const smallFontSize = Math.max(canvas.width * 0.03, 16);

            let yPos = textPosition === "bottom" ? canvas.height * 0.85 :
                textPosition === "top" ? canvas.height * 0.15 :
                    canvas.height * 0.5;

            // Main text
            if (overlayText) {
                ctx.font = `bold ${fontSize}px 'Geist', sans-serif`;
                ctx.fillText(overlayText, canvas.width / 2, yPos);
                yPos += fontSize * 1.5;
            }

            // Location
            if (locationText) {
                ctx.font = `${smallFontSize}px 'Geist', sans-serif`;
                ctx.fillText(`📍 ${locationText}`, canvas.width / 2, yPos);
                yPos += smallFontSize * 1.5;
            }

            // Date
            if (dateText) {
                ctx.font = `${smallFontSize}px 'Geist', sans-serif`;
                ctx.fillText(`📅 ${dateText}`, canvas.width / 2, yPos);
            }

            // GateSIM watermark
            ctx.font = `${smallFontSize * 0.8}px 'Geist', sans-serif`;
            ctx.fillStyle = "rgba(255,255,255,0.6)";
            ctx.textAlign = "right";
            ctx.fillText("GateSIM.travel", canvas.width - 20, canvas.height - 20);
        };
        img.src = imageToUse;
    }, [uploadedImage, enhancedImage, selectedFilter, overlayText, locationText, dateText, textPosition]);

    // Re-render canvas when settings change
    useState(() => {
        renderCanvas();
    });

    return (
        <div className={cn("space-y-6", className)}>
            {/* Upload Section */}
            {!uploadedImage ? (
                <Card className="p-8 border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-colors">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    {/* Camera Input - capture="environment" for rear camera */}
                    <input
                        ref={cameraInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileChange}
                        className="hidden"
                    />

                    <div className="flex flex-col md:flex-row gap-6 items-center justify-center text-center">
                        {/* Upload Option */}
                        <div
                            className="flex-1 cursor-pointer group"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/20">
                                <Upload className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="font-bold text-lg mb-1">
                                {isMongolian ? "Зураг хуулах" : "Upload Photo"}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                {isMongolian ? "Төхөөрөмжөөс сонгох" : "Choose from device"}
                            </p>
                        </div>

                        {/* Divider */}
                        <div className="w-full md:w-px h-px md:h-16 bg-border" />

                        {/* Camera Option */}
                        <div
                            className="flex-1 cursor-pointer group"
                            onClick={() => cameraInputRef.current?.click()}
                        >
                            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-orange-500/20">
                                <Camera className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="font-bold text-lg mb-1">
                                {isMongolian ? "Зураг дарах" : "Take Photo"}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                {isMongolian ? "Камер нээх" : "Open camera"}
                            </p>
                        </div>
                    </div>
                </Card>
            ) : (
                <>
                    {/* Preview & Canvas */}
                    <Card className="p-4 relative overflow-hidden">
                        <button
                            onClick={() => {
                                setUploadedImage(null);
                                setEnhancedImage(null);
                            }}
                            className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <canvas
                            ref={canvasRef}
                            className="w-full h-auto rounded-xl"
                            style={{
                                filter: filterPresets.find(f => f.id === selectedFilter)?.filter || "none",
                                display: "none"
                            }}
                        />

                        {/* Visual Preview */}
                        <div className="relative rounded-xl overflow-hidden">
                            <img
                                src={enhancedImage || uploadedImage}
                                alt="Preview"
                                className="w-full h-auto"
                                style={{ filter: filterPresets.find(f => f.id === selectedFilter)?.filter || "none" }}
                                onLoad={renderCanvas}
                            />

                            {/* Text Overlay Preview */}
                            {(overlayText || locationText || dateText) && (
                                <div className={cn(
                                    "absolute left-0 right-0 p-6 text-white text-center",
                                    textPosition === "bottom" && "bottom-0 bg-gradient-to-t from-black/70 to-transparent",
                                    textPosition === "top" && "top-0 bg-gradient-to-b from-black/70 to-transparent",
                                    textPosition === "center" && "top-1/2 -translate-y-1/2"
                                )}>
                                    {overlayText && <h2 className="text-2xl font-bold mb-2">{overlayText}</h2>}
                                    {locationText && <p className="text-sm flex items-center justify-center gap-1"><MapPin className="w-4 h-4" />{locationText}</p>}
                                    {dateText && <p className="text-sm flex items-center justify-center gap-1"><Calendar className="w-4 h-4" />{dateText}</p>}
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* AI Enhance */}
                    <Button
                        onClick={handleEnhance}
                        disabled={isEnhancing}
                        className="w-full py-5 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500"
                    >
                        {isEnhancing ? (
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        ) : (
                            <Sparkles className="w-5 h-5 mr-2" />
                        )}
                        {isMongolian ? "AI-р сайжруулах" : "AI Enhance"}
                        {enhancedImage && <Check className="w-4 h-4 ml-2" />}
                    </Button>

                    {/* Filters */}
                    <div>
                        <h3 className="font-bold mb-3 flex items-center gap-2">
                            <Palette className="w-4 h-4" />
                            {isMongolian ? "Шүүлтүүр" : "Filter"}
                        </h3>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {filterPresets.map((filter) => (
                                <button
                                    key={filter.id}
                                    onClick={() => {
                                        setSelectedFilter(filter.id);
                                        setTimeout(renderCanvas, 100);
                                    }}
                                    className={cn(
                                        "flex-shrink-0 px-4 py-2 rounded-full font-bold text-sm transition-all",
                                        selectedFilter === filter.id
                                            ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white"
                                            : "bg-muted text-muted-foreground"
                                    )}
                                >
                                    {isMongolian ? filter.name : filter.nameEn}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Text Overlays */}
                    <div className="space-y-3">
                        <h3 className="font-bold flex items-center gap-2">
                            <Type className="w-4 h-4" />
                            {isMongolian ? "Текст нэмэх" : "Add Text"}
                        </h3>
                        <input
                            type="text"
                            value={overlayText}
                            onChange={(e) => {
                                setOverlayText(e.target.value);
                                setTimeout(renderCanvas, 100);
                            }}
                            placeholder={isMongolian ? "Гарчиг..." : "Title..."}
                            className="w-full px-4 py-3 rounded-xl border bg-background"
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <input
                                type="text"
                                value={locationText}
                                onChange={(e) => {
                                    setLocationText(e.target.value);
                                    setTimeout(renderCanvas, 100);
                                }}
                                placeholder={isMongolian ? "📍 Байршил" : "📍 Location"}
                                className="px-4 py-3 rounded-xl border bg-background"
                            />
                            <input
                                type="text"
                                value={dateText}
                                onChange={(e) => {
                                    setDateText(e.target.value);
                                    setTimeout(renderCanvas, 100);
                                }}
                                placeholder={isMongolian ? "📅 Огноо" : "📅 Date"}
                                className="px-4 py-3 rounded-xl border bg-background"
                            />
                        </div>

                        {/* Text Position */}
                        <div className="flex gap-2">
                            {textPositions.map((pos) => (
                                <button
                                    key={pos.id}
                                    onClick={() => {
                                        setTextPosition(pos.id);
                                        setTimeout(renderCanvas, 100);
                                    }}
                                    className={cn(
                                        "flex-1 py-2 rounded-xl font-bold text-sm transition-all",
                                        textPosition === pos.id
                                            ? "bg-orange-500 text-white"
                                            : "bg-muted text-muted-foreground"
                                    )}
                                >
                                    {isMongolian ? pos.label : pos.labelEn}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <Button
                            onClick={downloadPoster}
                            className="flex-1 py-5 rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500"
                        >
                            <Download className="w-5 h-5 mr-2" />
                            {isMongolian ? "Татах" : "Download"}
                        </Button>
                        <Button
                            onClick={sharePoster}
                            variant="outline"
                            className="flex-1 py-5 rounded-2xl"
                        >
                            <Share2 className="w-5 h-5 mr-2" />
                            {isMongolian ? "Хуваалцах" : "Share"}
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}

export default TravelMemoryPoster;
