"use client";

import { useState } from "react";
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
    RefreshCw,
    Wand2,
    Save
} from "lucide-react";

type PosterSize = "instagram" | "facebook" | "story";

const sizeOptions: { id: PosterSize; label: string; dimensions: string }[] = [
    { id: "instagram", label: "Instagram Post", dimensions: "1080x1080" },
    { id: "facebook", label: "Facebook Post", dimensions: "1200x630" },
    { id: "story", label: "Story/Reels", dimensions: "1080x1920" },
];

interface GeneratedPoster {
    imageUrl: string;
    captionMN: string;
    captionEN: string;
    hashtags: string;
}

export default function ContentManagerPage() {
    const [selectedSize, setSelectedSize] = useState<PosterSize>("instagram");

    // Prompt Studio State
    const [idea, setIdea] = useState("");
    const [enhancedPrompt, setEnhancedPrompt] = useState("");
    const [enhancing, setEnhancing] = useState(false);

    // Caption Settings
    const [captionTone, setCaptionTone] = useState("promotional");
    const [captionLength, setCaptionLength] = useState("medium");

    const [generating, setGenerating] = useState(false);
    const [poster, setPoster] = useState<GeneratedPoster | null>(null);
    const [copied, setCopied] = useState<string | null>(null);

    const handleEnhance = async () => {
        if (!idea.trim()) return;
        setEnhancing(true);
        try {
            const res = await fetch('/api/ai/enhance-prompt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idea })
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

        try {
            const response = await fetch('/api/admin/poster/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customPrompt: finalPrompt,
                    size: selectedSize,
                    captionTone,
                    captionLength
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

                        {/* Step 1: Idea Input */}
                        <div className="space-y-2">
                            <Label>Your Idea</Label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="e.g. Woman drinking coffee in Paris street"
                                    value={idea}
                                    onChange={(e) => setIdea(e.target.value)}
                                />
                                <Button
                                    onClick={handleEnhance}
                                    disabled={!idea || enhancing}
                                    className="bg-purple-600 hover:bg-purple-700 text-white min-w-[120px]"
                                >
                                    {enhancing ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Wand2 className="w-4 h-4 mr-2" />
                                            Enhance
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

                            <div className="flex gap-2">
                                <Button onClick={downloadPoster} variant="outline" className="flex-1">
                                    <Download className="w-4 h-4 mr-2" />
                                    Download
                                </Button>
                                {/* <Button variant="outline" className="flex-1">
                                    <Save className="w-4 h-4 mr-2" />
                                    Save to Library
                                </Button> */}
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
                                1. Enter your idea (e.g. "Hiking in Alps")<br />
                                2. Click "Enhance" to add branding magic<br />
                                3. Generate your poster
                            </p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
