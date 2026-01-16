"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    ImagePlus,
    Download,
    Copy,
    Loader2,
    Sparkles,
    Check,
    RefreshCw
} from "lucide-react";

type PosterSize = "instagram" | "facebook" | "story";

const sizeOptions: { id: PosterSize; label: string; dimensions: string }[] = [
    { id: "instagram", label: "Instagram Post", dimensions: "1080x1080" },
    { id: "facebook", label: "Facebook Post", dimensions: "1200x630" },
    { id: "story", label: "Story/Reels", dimensions: "1080x1920" },
];

const themeOptions = [
    { id: "morning", label: "🌅 Өглөөний", color: "from-orange-400 to-pink-500" },
    { id: "evening", label: "🌙 Оройн", color: "from-purple-600 to-blue-800" },
    { id: "travel", label: "✈️ Аялал", color: "from-blue-400 to-cyan-500" },
    { id: "promo", label: "🔥 Хямдрал", color: "from-red-500 to-orange-500" },
];

interface GeneratedPoster {
    imageUrl: string;
    captionMN: string;
    captionEN: string;
    hashtags: string;
}

export default function ContentManagerPage() {
    const [selectedSize, setSelectedSize] = useState<PosterSize>("instagram");
    const [selectedTheme, setSelectedTheme] = useState("morning");
    const [generating, setGenerating] = useState(false);
    const [poster, setPoster] = useState<GeneratedPoster | null>(null);
    const [copied, setCopied] = useState<string | null>(null);

    const handleGenerate = async () => {
        setGenerating(true);
        setPoster(null);

        // Short delay for UX
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Use pre-generated AI posters
        const posterImages: Record<string, string> = {
            morning: "/posters/morning.png",
            evening: "/posters/evening.png",
            travel: "/posters/travel.png",
            promo: "/posters/promo.png"
        };

        const captions: Record<string, { mn: string; en: string }> = {
            morning: {
                mn: "🌅 Өглөөний мэнд!\n\n✈️ Аялалаа төлөвлөж байна уу?\n📱 GateSIM-ээр 200+ улсад интернет!\n\n💰 Хамгийн хямд үнэ\n⚡ Шууд идэвхжинэ\n🔒 Байнгын холболт\n\n👉 gatesim.travel",
                en: "🌅 Good morning!\n\n✈️ Planning your next trip?\n📱 Stay connected in 200+ countries with GateSIM!\n\n💰 Best prices\n⚡ Instant activation\n🔒 Reliable connection\n\n👉 gatesim.travel"
            },
            evening: {
                mn: "🌙 Сайн оройн мэнд!\n\n🌍 Маргааш аялалд гарах уу?\n📱 GateSIM таны хамгийн найдвартай интернет!\n\n✨ 200+ улс\n💳 QPay төлбөр\n📞 24/7 дэмжлэг\n\n👉 gatesim.travel",
                en: "🌙 Good evening!\n\n🌍 Traveling tomorrow?\n📱 GateSIM - Your reliable travel companion!\n\n✨ 200+ countries\n💳 Easy payment\n📞 24/7 support\n\n👉 gatesim.travel"
            },
            travel: {
                mn: "✈️ Аялал таны хүлээж байна!\n\n🌏 200+ улсад интернет\n📱 eSIM - физик карт шаардлагагүй\n\n💰 Хямд үнэ\n⚡ Минутанд идэвхжинэ\n🔒 Найдвартай холболт\n\n👉 gatesim.travel",
                en: "✈️ Adventure awaits!\n\n🌏 Stay connected in 200+ countries\n📱 eSIM - No physical SIM needed\n\n💰 Affordable prices\n⚡ Activate in minutes\n🔒 Reliable connection\n\n👉 gatesim.travel"
            },
            promo: {
                mn: "🔥 ОНЦГОЙ САНАЛ!\n\n🎯 Энэ 7 хоногт л!\n📱 Бүх багц -20% хямдралтай\n\n💰 ₮5,000-с эхлэн\n✈️ Япон, Солонгос, Хятад\n⚡ Шууд идэвхжинэ\n\n👉 gatesim.travel",
                en: "🔥 SPECIAL OFFER!\n\n🎯 This week only!\n📱 All packages 20% OFF\n\n💰 Starting from $5\n✈️ Japan, Korea, China & more\n⚡ Instant activation\n\n👉 gatesim.travel"
            }
        };

        const generatedPoster: GeneratedPoster = {
            imageUrl: posterImages[selectedTheme] || posterImages.morning,
            captionMN: captions[selectedTheme]?.mn || captions.morning.mn,
            captionEN: captions[selectedTheme]?.en || captions.morning.en,
            hashtags: "#GateSIM #eSIM #Аялал #Travel #Mongolia #TravelTech #DigitalNomad"
        };

        setPoster(generatedPoster);
        setGenerating(false);
    };

    const copyToClipboard = async (text: string, type: string) => {
        await navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
    };

    const downloadPoster = () => {
        // In real implementation, this would download the actual generated image
        if (poster?.imageUrl) {
            const link = document.createElement('a');
            link.href = poster.imageUrl;
            link.download = `gatesim-poster-${selectedTheme}-${Date.now()}.png`;
            link.click();
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 p-1">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                        Content Manager
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Маркетингийн постер үүсгэх
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Generator Panel */}
                <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-amber-500" />
                        Постер үүсгэх
                    </h2>

                    {/* Size Selection */}
                    <div className="mb-6">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                            Хэмжээ сонгох
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {sizeOptions.map((size) => (
                                <button
                                    key={size.id}
                                    onClick={() => setSelectedSize(size.id)}
                                    className={`p-3 rounded-xl border-2 transition-all text-center ${selectedSize === size.id
                                        ? "border-primary bg-primary/5 text-primary"
                                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                                        }`}
                                >
                                    <div className="text-xs font-medium">{size.label}</div>
                                    <div className="text-[10px] text-slate-500">{size.dimensions}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Theme Selection */}
                    <div className="mb-6">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                            Загвар сонгох
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {themeOptions.map((theme) => (
                                <button
                                    key={theme.id}
                                    onClick={() => setSelectedTheme(theme.id)}
                                    className={`p-3 rounded-xl border-2 transition-all ${selectedTheme === theme.id
                                        ? "border-primary ring-2 ring-primary/20"
                                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                                        }`}
                                >
                                    <div className={`h-8 rounded-lg bg-gradient-to-r ${theme.color} mb-2`} />
                                    <div className="text-xs font-medium">{theme.label}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Generate Button */}
                    <Button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="w-full h-12 text-base font-bold"
                    >
                        {generating ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Үүсгэж байна...
                            </>
                        ) : (
                            <>
                                <ImagePlus className="w-5 h-5 mr-2" />
                                Постер үүсгэх
                            </>
                        )}
                    </Button>
                </Card>

                {/* Preview Panel */}
                <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <h2 className="font-bold text-lg mb-4">Урьдчилж харах</h2>

                    {generating ? (
                        <div className="aspect-square rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <div className="text-center">
                                <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                                <p className="text-slate-500">AI постер үүсгэж байна...</p>
                            </div>
                        </div>
                    ) : poster ? (
                        <div className="space-y-4">
                            {/* Poster Preview - Real AI Image */}
                            <div className="rounded-xl overflow-hidden shadow-lg">
                                <img
                                    src={poster.imageUrl}
                                    alt="GateSIM Poster"
                                    className="w-full h-auto object-contain"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                                <Button onClick={downloadPoster} variant="outline" className="flex-1">
                                    <Download className="w-4 h-4 mr-2" />
                                    Татах
                                </Button>
                                <Button onClick={handleGenerate} variant="outline" className="flex-1">
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Дахин үүсгэх
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="aspect-square rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600">
                            <div className="text-center text-slate-500">
                                <ImagePlus className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>Постер үүсгэхийн тулд</p>
                                <p className="text-sm">дээрх тохиргоог сонгоод товч дарна уу</p>
                            </div>
                        </div>
                    )}
                </Card>
            </div>

            {/* Caption Section */}
            {poster && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Mongolian Caption */}
                    <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-bold flex items-center gap-2">
                                🇲🇳 Монгол текст
                            </h3>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(poster.captionMN + "\n\n" + poster.hashtags, "mn")}
                            >
                                {copied === "mn" ? (
                                    <Check className="w-4 h-4 text-green-500" />
                                ) : (
                                    <Copy className="w-4 h-4" />
                                )}
                            </Button>
                        </div>
                        <pre className="text-sm whitespace-pre-wrap bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                            {poster.captionMN}
                        </pre>
                        <div className="mt-2 text-xs text-blue-500">{poster.hashtags}</div>
                    </Card>

                    {/* English Caption */}
                    <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-bold flex items-center gap-2">
                                🇺🇸 English text
                            </h3>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(poster.captionEN + "\n\n" + poster.hashtags, "en")}
                            >
                                {copied === "en" ? (
                                    <Check className="w-4 h-4 text-green-500" />
                                ) : (
                                    <Copy className="w-4 h-4" />
                                )}
                            </Button>
                        </div>
                        <pre className="text-sm whitespace-pre-wrap bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                            {poster.captionEN}
                        </pre>
                        <div className="mt-2 text-xs text-blue-500">{poster.hashtags}</div>
                    </Card>
                </div>
            )}
        </div>
    );
}
