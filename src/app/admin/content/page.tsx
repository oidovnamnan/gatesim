"use client";

import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
    ImagePlus,
    Download,
    Copy,
    Loader2,
    Sparkles,
    Check,
    Wand2,
    Stamp,
    Upload,
    Lightbulb,
    ArrowDownRight,
    ArrowUpLeft,
    ArrowUpRight,
    ArrowDownLeft,
    Shuffle
} from "lucide-react";

const RANDOM_IDEAS = [
    "Digital Nomad working at a beach cafe in Bali with laptop and phone",
    "Cyberpunk city street at night with neon lights and 5G connection",
    "Hiker at the top of a mountain taking a selfie with high signal",
    "Business traveler in a modern airport lounge making a video call",
    "Friends sharing photos at a music festival"
];

type PosterSize = "square" | "portrait" | "landscape";

const sizeOptions: { id: PosterSize; label: string; dimensions: string; ratio: string }[] = [
    { id: "square", label: "Square", dimensions: "1024x1024", ratio: "1:1" },
    { id: "portrait", label: "Portrait", dimensions: "1024x1792", ratio: "9:16" },
    { id: "landscape", label: "Landscape", dimensions: "1792x1024", ratio: "1.91:1" },
];

const PRESET_PROMPTS = [
    {
        id: "cyberpunk",
        label: "Neon City",
        icon: "🌃",
        idea: "Futuristic Tokyo street at night, glowing neon signs, holding phone with high signal",
        prompt: "Cyberpunk aesthetic shot of a busy Tokyo street at night. Neon signs reflect on wet pavement. In the foreground, a hand holds a modern bezel-less smartphone displaying the 'GateSIM' logo with full 5G bars. Blue and purple color grading, cinematic depth of field, 8k resolution, Unreal Engine 5 style rendering."
    },
    {
        id: "minimalist",
        label: "Tech Minimalist",
        icon: "⚪",
        idea: "Clean white desk setup, coffee, passport and phone with GateSIM",
        prompt: "Ultra-minimalist product photography. A pristine white marble desk surface. Organized layout featuring a passport, a cup of artisan coffee, and a premium smartphone displaying the 'GateSIM' app interface. Soft diffuse lighting, high-key photography, Apple-style advertising aesthetic, sharp focus."
    },
    {
        id: "travel_pov",
        label: "Travel POV",
        icon: "✈️",
        idea: "First person view looking at Eiffel tower holding phone",
        prompt: "First-person POV shot of a traveler's hand holding a smartphone against the backdrop of the Eiffel Tower during golden hour. The phone screen clearly shows 'GateSIM Connected'. Warm sunlight, dreamy atmosphere, travel blog aesthetic, bokeh background, highly detailed lifestyle photography."
    },
    {
        id: "nature",
        label: "Wild Nature",
        icon: "🏔️",
        idea: "Hiking in Swiss Alps, phone showing connection on mountain peak",
        prompt: "Epic wide shot of a hiker on a snowy mountain peak in the Swiss Alps. Blue sky, bright sunlight. The hiker holds a phone up, screen displaying 'GateSIM' logo. Sense of adventure and freedom. National Geographic style photography, sharp details, vibrant natural colors."
    }
];

interface GeneratedPoster {
    imageUrl: string;
    captionMN: string;
    captionEN: string;
    hashtags: string;
}

export default function ContentManagerPage() {
    const [selectedSize, setSelectedSize] = useState<PosterSize>("square");

    // Prompt Studio State
    const [idea, setIdea] = useState("");
    const [enhancedPrompt, setEnhancedPrompt] = useState("");
    const [enhancing, setEnhancing] = useState(false);
    const [includeBranding, setIncludeBranding] = useState(true);

    // Watermark State
    const [logoImage, setLogoImage] = useState<string | null>(null);
    const [watermarking, setWatermarking] = useState(false);
    const [watermarkPosition, setWatermarkPosition] = useState("bottom-right");
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Caption Settings
    const [captionTone, setCaptionTone] = useState("promotional");
    const [captionLength, setCaptionLength] = useState("medium");
    const [imageStyle, setImageStyle] = useState("vivid");

    const [generating, setGenerating] = useState(false);
    const [poster, setPoster] = useState<GeneratedPoster | null>(null);
    const [copied, setCopied] = useState<string | null>(null);

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleApplyWatermark = async () => {
        if (!poster?.imageUrl || !logoImage) return;
        setWatermarking(true);
        try {
            const res = await fetch('/api/admin/poster/overlay', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mainImage: poster.imageUrl,
                    logoImage,
                    position: watermarkPosition
                })
            });
            const data = await res.json();
            if (data.imageUrl) {
                setPoster(prev => prev ? ({ ...prev, imageUrl: data.imageUrl }) : null);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setWatermarking(false);
        }
    };

    const handleEnhance = async () => {
        if (!idea.trim()) return;
        setEnhancing(true);
        try {
            const res = await fetch('/api/ai/enhance-prompt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    idea,
                    includeBranding
                })
            });
            const data = await res.json();
            if (data.prompt) {
                setEnhancedPrompt(data.prompt);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setEnhancing(false);
        }
    };

    const handleGenerate = async () => {
        setGenerating(true);
        setPoster(null);

        // Use enhanced prompt if available, otherwise just use the idea
        const finalPrompt = enhancedPrompt || idea;

        // Map generic sizes back to what the API expects
        let apiSize = "1024x1024";
        if (selectedSize === "portrait") apiSize = "1024x1792";
        if (selectedSize === "landscape") apiSize = "1792x1024";

        try {
            const response = await fetch('/api/admin/poster/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customPrompt: finalPrompt,
                    size: apiSize,
                    captionTone,
                    captionLength,
                    style: imageStyle
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Generation failed');
            }

            setPoster({
                imageUrl: data.imageUrl,
                captionMN: data.captionMN,
                captionEN: data.captionEN,
                hashtags: data.hashtags
            });

        } catch (error: any) {
            console.error('Poster generation error:', error);
            // Error handling UI could be added here
        } finally {
            setGenerating(false);
        }
    };

    const copyToClipboard = async (text: string, type: string) => {
        await navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
    };

    const downloadPoster = () => {
        if (poster?.imageUrl) {
            const link = document.createElement('a');
            link.href = poster.imageUrl;
            link.download = `gatesim-poster-${Date.now()}.png`;
            link.click();
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 p-1">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                        GateSIM Prompt Studio
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Create AI-powered marketing assets with precision
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Panel: Controls */}
                <div className="space-y-6">
                    <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-5 h-5 text-amber-500" />
                            <h2 className="font-bold text-lg">Idea & Prompt</h2>
                        </div>

                        {/* Templates */}
                        <div className="space-y-2 mb-4">
                            <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                <Lightbulb className="w-3 h-3" />
                                Quick Start Templates
                            </Label>
                            <div className="grid grid-cols-2 gap-2">
                                {PRESET_PROMPTS.map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => {
                                            setIdea(t.idea);
                                            setEnhancedPrompt(t.prompt);
                                        }}
                                        className="text-left p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 group"
                                    >
                                        <span className="text-lg group-hover:scale-110 transition-transform">{t.icon}</span>
                                        <div className="overflow-hidden">
                                            <div className="text-xs font-medium truncate">{t.label}</div>
                                            <div className="text-[10px] text-slate-500 truncate opacity-70">Click to load</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Step 1: Idea Input */}
                        <div className="space-y-2">
                            <Label>Your Idea</Label>
                            <div className="flex flex-col gap-2">
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="e.g. Woman drinking coffee in Paris street"
                                        value={idea}
                                        onChange={(e) => setIdea(e.target.value)}
                                    />
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setIdea(RANDOM_IDEAS[Math.floor(Math.random() * RANDOM_IDEAS.length)])}
                                        title="Surprise me"
                                    >
                                        <Shuffle className="w-4 h-4" />
                                    </Button>
                                </div>
                                <div className="flex items-center space-x-2 py-1">
                                    <input
                                        type="checkbox"
                                        id="branding"
                                        className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                                        checked={includeBranding}
                                        onChange={(e) => setIncludeBranding(e.target.checked)}
                                    />
                                    <Label htmlFor="branding" className="text-sm font-normal cursor-pointer text-slate-600 dark:text-slate-400">
                                        Include "GateSIM" Text (AI Generated)
                                    </Label>
                                </div>
                                <Button
                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white min-w-[120px]"
                                    onClick={handleEnhance}
                                    disabled={!idea || enhancing}
                                >
                                    {enhancing ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Wand2 className="w-4 h-4 mr-2" />
                                            Write Pro Prompt
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Step 2: Enhanced Prompt */}
                        <div className="space-y-2">
                            <Label>AI Engineered Prompt (Editable)</Label>
                            <Textarea
                                value={enhancedPrompt}
                                onChange={(e) => setEnhancedPrompt(e.target.value)}
                                placeholder="Enhanced prompt will appear here..."
                                className="h-32 text-sm font-mono bg-slate-50 dark:bg-slate-950"
                            />
                            <p className="text-xs text-slate-500">
                                This prompt includes mandatory branding instructions for GateSIM.
                            </p>
                        </div>
                    </Card>

                    <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 space-y-4">
                        <h2 className="font-bold text-lg">Settings</h2>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Size</Label>
                                <Select value={selectedSize} onValueChange={(v) => setSelectedSize(v as PosterSize)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sizeOptions.map(s => (
                                            <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Image Style</Label>
                                <Select value={imageStyle} onValueChange={setImageStyle}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="vivid">🎨 Vivid (Dramatic)</SelectItem>
                                        <SelectItem value="natural">📷 Natural (Realistic)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Caption Tone</Label>
                                <Select value={captionTone} onValueChange={setCaptionTone}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="promotional">🔥 Promotional (Sales)</SelectItem>
                                        <SelectItem value="educational">🧠 Educational (Facts)</SelectItem>
                                        <SelectItem value="lifestyle">✨ Lifestyle (Vibes)</SelectItem>
                                        <SelectItem value="funny">😄 Funny (Engaging)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Caption Length</Label>
                                <Select value={captionLength} onValueChange={setCaptionLength}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="short">Short (1-2 sentences)</SelectItem>
                                        <SelectItem value="medium">Medium (Standard)</SelectItem>
                                        <SelectItem value="long">Long (Storytelling)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Button
                            className="w-full h-12 text-lg font-bold mt-4"
                            onClick={handleGenerate}
                            disabled={generating || (!idea && !enhancedPrompt)}
                        >
                            {generating ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Generating Assets...
                                </>
                            ) : (
                                <>
                                    <ImagePlus className="w-5 h-5 mr-2" />
                                    Generate Poster
                                </>
                            )}
                        </Button>
                    </Card>
                </div>

                {/* Right Panel: Preview */}
                <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-fit">
                    <h2 className="font-bold text-lg mb-4">Preview</h2>

                    {generating ? (
                        <div className="aspect-square rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <div className="text-center">
                                <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                                <p className="text-slate-500">Creating magic with DALL-E 3...</p>
                            </div>
                        </div>
                    ) : poster ? (
                        <div className="space-y-4">
                            <div className="rounded-xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700">
                                <img
                                    src={poster.imageUrl}
                                    alt="Generated Poster"
                                    className="w-full h-auto object-contain"
                                />
                            </div>

                            {/* Watermark Tool */}
                            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                                <div className="flex items-center gap-2 mb-3">
                                    <Stamp className="w-4 h-4 text-blue-500" />
                                    <h3 className="text-sm font-bold">Logo & Watermark Tool</h3>
                                </div>

                                <div className="flex gap-3">
                                    <div
                                        className="w-16 h-16 border-2 border-dashed border-slate-300 rounded overflow-hidden flex items-center justify-center cursor-pointer hover:bg-slate-100 bg-white"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {logoImage ? (
                                            <img src={logoImage} className="w-full h-full object-contain" />
                                        ) : (
                                            <Upload className="w-4 h-4 text-slate-400" />
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleLogoUpload}
                                    />

                                    <div className="flex-1 flex flex-col justify-between">
                                        <div className="flex gap-1 justify-between">
                                            {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((pos) => (
                                                <button
                                                    key={pos}
                                                    onClick={() => setWatermarkPosition(pos)}
                                                    className={`p-1.5 rounded bg-white shadow-sm border ${watermarkPosition === pos ? 'border-primary ring-1 ring-primary' : 'border-slate-200'} hover:bg-slate-50`}
                                                    title={pos}
                                                >
                                                    {pos === 'top-left' && <ArrowUpLeft className="w-3 h-3" />}
                                                    {pos === 'top-right' && <ArrowUpRight className="w-3 h-3" />}
                                                    {pos === 'bottom-left' && <ArrowDownLeft className="w-3 h-3" />}
                                                    {pos === 'bottom-right' && <ArrowDownRight className="w-3 h-3" />}
                                                </button>
                                            ))}
                                        </div>
                                        <Button
                                            size="sm"
                                            className="w-full h-7 text-xs"
                                            onClick={handleApplyWatermark}
                                            disabled={!logoImage || watermarking}
                                        >
                                            {watermarking ? (
                                                <>
                                                    <Loader2 className="w-3 h-3 animate-spin mr-2" />
                                                    Applying...
                                                </>
                                            ) : (
                                                <>
                                                    <Stamp className="w-3 h-3 mr-2" />
                                                    Overlay Logo
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button onClick={downloadPoster} variant="outline" className="flex-1">
                                    <Download className="w-4 h-4 mr-2" />
                                    Download
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 gap-4 mt-4">
                                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-lg relative group">
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(poster.captionMN, "mn")}>
                                            {copied === "mn" ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                                        </Button>
                                    </div>
                                    <p className="text-xs font-bold text-slate-500 mb-1">MONGOLIAN</p>
                                    <p className="text-sm whitespace-pre-wrap">{poster.captionMN}</p>
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-lg relative group">
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(poster.captionEN, "en")}>
                                            {copied === "en" ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                                        </Button>
                                    </div>
                                    <p className="text-xs font-bold text-slate-500 mb-1">ENGLISH</p>
                                    <p className="text-sm whitespace-pre-wrap">{poster.captionEN}</p>
                                </div>

                                <div className="text-xs text-blue-500 font-mono">
                                    {poster.hashtags}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="aspect-square rounded-xl bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600 p-8 text-center">
                            <Sparkles className="w-12 h-12 text-slate-300 mb-4" />
                            <h3 className="font-semibold text-slate-600 dark:text-slate-400">Ready to create?</h3>
                            <p className="text-sm text-slate-500 mt-2">
                                1. Enter your idea (or use a template)<br />
                                2. "Enhance" to add details<br />
                                3. Generate & Add Logo Overlay
                            </p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
