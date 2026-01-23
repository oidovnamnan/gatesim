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
    Shuffle,
    ArrowUp,
    ArrowDown,
    Move,
    Maximize2,
    X,
    Server,
    Palette,
    Scissors,
    Layers,
    RotateCcw,
    Eraser
} from "lucide-react";

const RANDOM_IDEAS = [
    "Digital Nomad working at a beach cafe in Bali with laptop and phone",
    "Cyberpunk city street at night with neon lights and 5G connection",
    "Hiker at the top of a mountain taking a selfie with high signal",
    "Business traveler in a modern airport lounge making a video call",
    "Friends sharing photos at a music festival"
];

const sizeOptions: { id: string; label: string; dimensions: string; ratio: string }[] = [
    { id: "square", label: "Square", dimensions: "1024x1024", ratio: "1:1" },
    { id: "portrait", label: "Portrait", dimensions: "1024x1792", ratio: "9:16" },
    { id: "landscape", label: "Landscape", dimensions: "1792x1024", ratio: "16:9" },
    { id: "social", label: "Social", dimensions: "1024x1280", ratio: "4:5" },
    { id: "photo", label: "Photo", dimensions: "1536x1024", ratio: "3:2" },
    { id: "standard", label: "Standard", dimensions: "1024x768", ratio: "4:3" },
];

const PRESET_PROMPTS = [
    {
        id: "cyberpunk",
        label: "Tokyo Neon",
        icon: "🌃",
        idea: "Futuristic Tokyo street at night, glowing neon signs, seamless connectivity",
        prompt: "Cyberpunk aesthetic shot of a busy Tokyo street at night. Neon signs reflect on wet pavement. Subtle digital network pathways glow in the air, representing 'GateSIM' seamless connectivity. Blue and purple color grading, cinematic depth of field, 8k resolution."
    },
    {
        id: "minimalist",
        label: "Tech Minimal",
        icon: "⚪",
        idea: "Clean white desk setup, coffee, passport and subtle connectivity",
        prompt: "Ultra-minimalist product photography. A pristine white marble desk surface. Organized layout featuring a passport, a cup of artisan coffee, and a premium tablet displaying a clean 'GateSIM' connected status. Soft diffuse lighting, high-key photography, Apple-style advertising aesthetic."
    },
    {
        id: "business",
        label: "Business Class",
        icon: "💎",
        idea: "Business traveler in luxury airport lounge at sunset",
        prompt: "Cinematic shot of a business traveler in a modern luxury airport lounge. Outside the window, a plane takes off at sunset. A laptop on the side shows 'GateSIM Global Link'. Premium lifestyle, warm golden lighting, depth of field."
    },
    {
        id: "nomad",
        label: "Bali Nomad",
        icon: "☕",
        idea: "Working from a cozy Bali cafe with laptop and phone",
        prompt: "Cozy atmosphere in a hipster coffee shop in Bali. A wooden table with a laptop and a steaming cup of coffee. A subtle 'GateSIM' sticker is on the laptop. Soft morning light entering through window. Digital nomad lifestyle, realistic texture."
    },
    {
        id: "santorini",
        label: "Santorini Blue",
        icon: "🇬🇷",
        idea: "Style traveler in Santorini white buildings with blue domes",
        prompt: "Professional travel photograph of a stylish traveler standing against the iconic white walls and blue domes of Santorini. Breathtaking view of the Aegean Sea. They look relaxed and connected to the world. Soft morning light, vibrant blues, crisp whites, wide-angle lens."
    },
    {
        id: "dubai",
        label: "Dubai Safari",
        icon: "🐪",
        idea: "Camel safari in Dubai desert at sunset",
        prompt: "Epic sunset shot in the Arabian desert. A traveler on a camel trek over orange sand dunes. The feeling of 'GateSIM' global reaching even the most remote sands. The sun is a large orange orb on the horizon. Warm cinematic lighting, high contrast, sharp details."
    },
    {
        id: "iceland",
        label: "Iceland Aurora",
        icon: "🌌",
        idea: "Northern lights in Iceland with 5G signal",
        prompt: "Magical night shot of the Aurora Borealis dancing over a snowy Icelandic landscape. A modern camper van in the distance glows from within. Floating digital data streams subtly indicate 'GateSIM' signal. Long exposure feel, vibrant greens and purples, epic nature."
    },
    {
        id: "newyork",
        label: "NYC Pulse",
        icon: "🗽",
        idea: "Times Square New York busy street at night",
        prompt: "High-energy editorial photograph of Times Square, New York City at night. Blurred motion of yellow taxis and crowds. Branded 'GateSIM' digital billboards illuminate the street. Vibrant colors, anamorphic lens flare, cinematic city vibes."
    },
    {
        id: "swiss",
        label: "Swiss Express",
        icon: "🚂",
        idea: "Glacier Express train journey through Swiss Alps",
        prompt: "Interior shot of the luxury Glacier Express train traveling through the snowy Swiss Alps. Large panoramic windows show majestic peaks. A tablet on the table shows 'GateSIM Connected'. Soft daylight, premium travel aesthetic, realistic textures."
    },
    {
        id: "maldives",
        label: "Maldives Villa",
        icon: "🏝️",
        idea: "Luxury overwater bungalow in the Maldives with WiFi",
        prompt: "Breathtaking view of a luxury overwater villa in the Maldives. Crystal clear turquoise water underneath. A professional traveler relaxes on a dock, staying connected with 'GateSIM'. Perfect tropical paradise, bright natural sunlight, high saturation, sharp focus."
    },
    {
        id: "paris",
        label: "Parisian Cafe",
        icon: "🥐",
        idea: "Chic traveler at a Parisian street cafe",
        prompt: "Lifestyle photograph of a chic traveler sitting at a classic Parisian sidewalk cafe with the Eiffel Tower in the far background. They are casually using a tablet to navigate. Warm morning light, soft bokeh, romantic European atmosphere."
    },
    {
        id: "singapore",
        label: "Futuristic SG",
        icon: "🦁",
        idea: "Gardens by the Bay Singapore futuristic trees",
        prompt: "Futuristic shot of the Supertree Grove at Gardens by the Bay, Singapore at twilight. Glowing artificial trees. A holographic 'GateSIM' network overlay subtly pulses in the mid-ground. Sci-fi aesthetic, vibrant neon lighting, high-tech city vibes."
    },
    {
        id: "machupicchu",
        label: "Inca Trail",
        icon: "⛰️",
        idea: "Hiker at Machu Picchu ruins",
        prompt: "Adventure photography of a hiker reaching the summit overlooking Machu Picchu, Peru. Ancient stone ruins and lush green mountains. The feeling of being 'GateSIM Connected' even at the peak of history. Dramatic lighting, authentic textures, National Geographic style."
    },
    {
        id: "kyoto",
        label: "Kyoto Zen",
        icon: "🏮",
        idea: "Traveler in Kyoto bamboo forest",
        prompt: "Peaceful shot of a traveler walking through the Arashiyama Bamboo Grove in Kyoto. Sunbeams filtering through tall green bamboo stalks. 'GateSIM' represents their link back home. Zen atmosphere, soft natural lighting, high depth of field."
    },
    {
        id: "safari",
        label: "Africa Safari",
        icon: "🦁",
        idea: "Lion in African savanna",
        prompt: "Powerful wildlife shot from an open safari jeep in the Serengeti. A majestic lion is visible in the distance across the yellow savanna. A traveler shares the moment instantly via 'GateSIM'. Golden hour glow, realistic wildlife textures, wide lens."
    },
    {
        id: "rome",
        label: "Roman Holiday",
        icon: "🏛️",
        idea: "Colosseum Rome with modern traveler",
        prompt: "Cinematic wide shot of the Colosseum in Rome under a clear blue sky. A stylish traveler in the foreground uses an AR headset powered by 'GateSIM'. Rich historical textures, vibrant colors, professional travel editorial style."
    },
    {
        id: "london",
        label: "London Tube",
        icon: "🎡",
        idea: "London Underground station with motion blur",
        prompt: "Urban photography of a busy London Underground station. A red tube train is arriving with motion blur. Digital 'GateSIM' branding on a station display. Cool industrial color palette, high contrast, modern city energy."
    },
    {
        id: "petra",
        label: "Petra Mystery",
        icon: "🏺",
        idea: "Petra Treasury Jordan at night",
        prompt: "Atmospheric night shot of the Treasury (Al-Khazneh) in Petra, Jordan, illuminated by thousands of candles. A traveler is engrossed in the mystery, connected via 'GateSIM'. Ancient vibes, warm candle light, deep shadows, cinematic."
    },
    {
        id: "cappadocia",
        label: "Sky Full of Balloons",
        icon: "🎈",
        idea: "Hot air balloons in Cappadocia Turkey",
        prompt: "Dreamy sunrise shot in Cappadocia, Turkey. Hundreds of colorful hot air balloons fill the sky over unique rock formations. A traveler captures the scale, connected by 'GateSIM'. Pastel sky colors, soft morning glow, epic scale."
    },
    {
        id: "venice",
        label: "Venice Canal",
        icon: "🛶",
        idea: "Gondola ride in Venice canals",
        prompt: "Romantic shot of a gondola moving through the narrow canals of Venice. Historic arched bridges and colorful buildings. 'GateSIM' powers the traveler's journey through time. Reflective water, soft afternoon light, classic Italian charm."
    },
    {
        id: "sydney",
        label: "Sydney Harbor",
        icon: "🎡",
        idea: "Sydney Opera House at night",
        prompt: "Spectacular night shot of the Sydney Opera House with fireworks exploding in the sky. Lights reflecting on the harbor water. Connected to the world with 'GateSIM'. High energy, vibrant colors, festive atmosphere, celebration vibes."
    },
    {
        id: "rio",
        label: "Rio Carnival",
        icon: "🇧🇷",
        idea: "Christ the Redeemer in Rio de Janeiro",
        prompt: "Epic aerial-style shot of the Christ the Redeemer statue in Rio de Janeiro, overlooking the city and ocean. 'GateSIM' connectivity spans the horizon. Vibrant tropical colors, bright sunshine, cinematic wide angle."
    },
    {
        id: "bangkok",
        label: "Bangkok Food",
        icon: "🍜",
        idea: "Busy Bangkok street food market at night",
        prompt: "Vibrant and busy night market in Bangkok. Steam rising from street food stalls, colorful signs, crowded atmosphere. A traveler uses a device for digital navigation via 'GateSIM'. Rich textures, neon lighting, authentic urban feel."
    },
    {
        id: "lofoten",
        label: "Norway Cabins",
        icon: "🇳🇴",
        idea: "Red fishing cabins in Lofoten Norway",
        prompt: "Beautiful winter shot of red Rorbu cabins on the coast of Lofoten, Norway. Snowy mountains in the background and dark blue sea. 'GateSIM' keeps the local connection strong. Cold crisp air, high contrast between red and white, stunning nature."
    },
    {
        id: "cairo",
        label: "Giza Pyramids",
        icon: "🇪🇬",
        idea: "Great Pyramids of Giza at sunset",
        prompt: "Majestic shot of the Great Pyramids of Giza at sunset. The Sphinx is visible in the foreground. 'GateSIM' represents the bridge between ancient and modern. Cinematic golden lighting, silhouettes against orange sky, epic historical feel."
    },
    {
        id: "seoul",
        label: "Seoul Cyberpunk",
        icon: "🇰🇷",
        idea: "Gangnam district Seoul high-tech skyscrapers",
        prompt: "High-tech urban shot of Seoul's Gangnam district at night. Huge LED screens and futuristic skyscrapers. Digitally transparent 'GateSIM' network pathways flow through the scene. Hyper-modern, intense colors, crisp digital aesthetic."
    },
    {
        id: "amalfi",
        label: "Amalfi Drive",
        icon: "🍋",
        idea: "Vintage car driving on Amalfi Coast road",
        prompt: "Lifestyle shot of an open-top vintage convertible driving along the winding cliffside roads of the Amalfi Coast. Stunning view of the colorful towns and blue sea. GPS guidance by 'GateSIM'. Sunny, Mediterranean vibes, classy travel."
    },
    {
        id: "lisbon",
        label: "Lisbon Tram",
        icon: "🚋",
        idea: "Yellow tram on cobblestone street in Lisbon",
        prompt: "Charming shot of the famous yellow Tram 28 climbing a steep cobblestone street in Lisbon. Old colorful buildings with azulejo tiles. Connected to the digital world via 'GateSIM'. Soft afternoon sun, vintage European feel."
    },
    {
        id: "amazon",
        label: "Amazon Jungle",
        icon: "🦜",
        idea: "Expedition boat in the Amazon rainforest",
        prompt: "Immersive shot from a small expedition boat moving deep into the Amazon rainforest. Dense green canopy, exotic birds in flight. 'GateSIM' link keeps the mission active. Moody green lighting, humid atmosphere, authentic exploration."
    },
    {
        id: "patagonia",
        label: "Patagonia Trek",
        icon: "🏔️",
        idea: "Glaciers and granite peaks in Patagonia",
        prompt: "Rugged adventure photography of the Torres del Paine peaks in Patagonia. Turquoise glacial lakes and massive ice formations. 'GateSIM' connectivity at the edge of the world. Dramatic clouds, cold blue tones, sharp mountain textures."
    },
    {
        id: "prague",
        label: "Prague Dawn",
        icon: "🏰",
        idea: "Charles Bridge Prague in misty morning",
        prompt: "Etherial shot of the Charles Bridge in Prague at dawn. Misty atmosphere, silhouettes of bridge statues. 'GateSIM' powers the morning's exploration. Moody, historical, soft golden light breaking through fog, romantic."
    }
];

interface GeneratedPoster {
    imageUrl: string;
    captionMN: string;
    captionEN: string;
    hashtags: string;
    provider: "openai" | "google";
}

export default function ContentManagerPage() {
    const [selectedSize, setSelectedSize] = useState<string>("square");

    // Prompt Studio State
    const [idea, setIdea] = useState("");
    const [enhancedPrompt, setEnhancedPrompt] = useState("");
    const [enhancing, setEnhancing] = useState(false);
    const [includeBranding, setIncludeBranding] = useState(true);

    // Watermark State (Default to official logo)
    const [logoImage, setLogoImage] = useState<string | null>("/logo-official-full.jpg");
    const [watermarking, setWatermarking] = useState(false);
    const [watermarkPosition, setWatermarkPosition] = useState("bottom-right");
    const [logoScale, setLogoScale] = useState(0.2);
    const [overlayText, setOverlayText] = useState("");
    const [overlayTextColor, setOverlayTextColor] = useState("#ffffff");
    const [overlayFontSize, setOverlayFontSize] = useState(60);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [captionTone, setCaptionTone] = useState("promotional");
    const [captionLength, setCaptionLength] = useState("medium");
    const [imageStyle, setImageStyle] = useState("vivid");
    const [provider, setProvider] = useState<"openai" | "google" | "dual">("openai");

    const [generating, setGenerating] = useState(false);
    const [generatingGoogle, setGeneratingGoogle] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [savingToHub, setSavingToHub] = useState(false);

    // Magic AI Edit States
    const [magicLoading, setMagicLoading] = useState(false);
    const [magicInstruction, setMagicInstruction] = useState("");
    const [activeMagicAction, setActiveMagicAction] = useState<"edit" | "variation" | "bg-remove" | null>(null);
    const [magicPosterRef, setMagicPosterRef] = useState<GeneratedPoster | null>(null);
    const [poster, setPoster] = useState<GeneratedPoster | null>(null);
    const [googlePoster, setGooglePoster] = useState<GeneratedPoster | null>(null);
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

    const handleApplyWatermark = async (targetPoster: GeneratedPoster) => {
        if (!targetPoster.imageUrl || !logoImage) return;
        setWatermarking(true);
        try {
            const res = await fetch('/api/admin/poster/overlay', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mainImage: targetPoster.imageUrl,
                    logoImage,
                    position: watermarkPosition,
                    text: overlayText,
                    textColor: overlayTextColor,
                    fontSize: overlayFontSize,
                    logoScale
                })
            });
            const data = await res.json();
            if (data.imageUrl) {
                const updated = { ...targetPoster, imageUrl: data.imageUrl };
                if (targetPoster.provider === "openai") setPoster(updated);
                else setGooglePoster(updated);

                // Auto-save the watermarked version as well
                autoSaveToHub(updated);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setWatermarking(false);
        }
    };

    const handleEnhance = async (isRandom = false) => {
        if (!isRandom && !idea.trim()) return;
        setEnhancing(true);
        if (isRandom) setIdea(""); // Clear idea if randomizing

        try {
            const res = await fetch('/api/ai/enhance-prompt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    idea: isRandom ? "" : idea,
                    includeBranding,
                    targetModel: provider, // 'openai' or 'google'
                    isRandom
                })
            });
            const data = await res.json();
            if (data.prompt) {
                setEnhancedPrompt(data.prompt);
                // If it was random, we might want to put a simple title/idea in the input
                // but for now let's just leave it to keep the UI clean
            }
        } catch (e) {
            console.error(e);
        } finally {
            setEnhancing(false);
        }
    };

    const autoSaveToHub = async (posterData: GeneratedPoster) => {
        try {
            setSavingToHub(true);
            const res = await fetch('/api/admin/poster/hub/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageUrl: posterData.imageUrl,
                    captionMN: posterData.captionMN,
                    captionEN: posterData.captionEN,
                    hashtags: posterData.hashtags,
                    provider: posterData.provider,
                    idea: idea,
                    prompt: enhancedPrompt || idea
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to auto-save to hub");
            console.log("Auto-saved to hub:", data.savedUrl);
        } catch (error) {
            console.error("Auto-save failed:", error);
        } finally {
            setSavingToHub(false);
        }
    };

    const handleExecuteMagicAction = async () => {
        if (!magicPosterRef || !activeMagicAction) return;
        if (activeMagicAction === 'edit' && !magicInstruction.trim()) return;

        setMagicLoading(true);
        try {
            const res = await fetch('/api/admin/poster/edit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    originalImageUrl: magicPosterRef.imageUrl,
                    action: activeMagicAction,
                    instruction: magicInstruction,
                    originalPrompt: enhancedPrompt || idea,
                    provider: magicPosterRef.provider
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Magic Edit failed");

            const updated: GeneratedPoster = {
                imageUrl: data.imageUrl,
                captionMN: data.captionMN,
                captionEN: data.captionEN,
                hashtags: data.hashtags,
                provider: magicPosterRef.provider
            };

            if (magicPosterRef.provider === "openai") setPoster(updated);
            else setGooglePoster(updated);

            // Auto-save the new magic version
            autoSaveToHub(updated);

            // Reset states
            setActiveMagicAction(null);
            setMagicInstruction("");
            setMagicPosterRef(null);
        } catch (e: any) {
            console.error(e);
            alert(`Magic Error: ${e.message}`);
        } finally {
            setMagicLoading(false);
        }
    };

    const handleGenerate = async () => {
        setGenerating(true);
        setGeneratingGoogle(provider === "dual");
        setPoster(null);
        setGooglePoster(null);

        const finalPrompt = enhancedPrompt || idea;
        const sizeObj = sizeOptions.find(s => s.id === selectedSize) || sizeOptions[0];
        const apiSize = sizeObj.ratio;

        const generateRequest = async (targetProvider: "openai" | "google") => {
            const response = await fetch('/api/admin/poster/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customPrompt: finalPrompt,
                    size: apiSize,
                    captionTone,
                    captionLength,
                    style: imageStyle,
                    provider: targetProvider
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || `${targetProvider} generation failed`);

            const result = {
                imageUrl: data.imageUrl,
                captionMN: data.captionMN,
                captionEN: data.captionEN,
                hashtags: data.hashtags,
                provider: targetProvider as "openai" | "google"
            };

            // Trigger auto-save immediately
            autoSaveToHub(result);

            return result;
        };

        try {
            if (provider === "dual") {
                // Dual mode: fire both in parallel
                const [openaiRes, googleRes] = await Promise.allSettled([
                    generateRequest("openai"),
                    generateRequest("google")
                ]);

                if (openaiRes.status === "fulfilled") setPoster(openaiRes.value as GeneratedPoster);
                else console.error("OpenAI failed:", openaiRes.reason);

                if (googleRes.status === "fulfilled") setGooglePoster(googleRes.value as GeneratedPoster);
                else console.error("Google failed:", googleRes.reason);

                if (openaiRes.status === "rejected" && googleRes.status === "rejected") {
                    throw new Error("Both AI providers failed. Check console for details.");
                }
            } else {
                // Single provider mode
                const result = await generateRequest(provider as "openai" | "google");
                setPoster(result as GeneratedPoster);
            }
        } catch (error: any) {
            console.error('Poster generation error:', error);
            alert(`Error: ${error.message || "Something went wrong"}`);
        } finally {
            setGenerating(false);
            setGeneratingGoogle(false);
        }
    };

    const copyToClipboard = async (text: string, type: string) => {
        await navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
    };

    const downloadPoster = (targetPoster: GeneratedPoster) => {
        if (targetPoster.imageUrl) {
            const link = document.createElement('a');
            link.href = targetPoster.imageUrl;
            link.download = `gatesim-${targetPoster.provider}-${Date.now()}.png`;
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
                            <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-1">
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
                                        onClick={() => handleEnhance(true)}
                                        title="Generate Random Idea"
                                        disabled={enhancing}
                                    >
                                        {enhancing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shuffle className="w-4 h-4" />}
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
                                    onClick={() => handleEnhance(false)}
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

                        <div className="space-y-4">
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                <Label className="mb-2 block text-purple-600 dark:text-purple-400 font-bold">AI Model Provider</Label>
                                <Select value={provider} onValueChange={(v) => setProvider(v as any)}>
                                    <SelectTrigger className="h-12 text-md">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="openai">
                                            <div className="flex items-center gap-2">
                                                <span>🤖</span>
                                                <div className="flex flex-col text-left">
                                                    <span className="font-bold">OpenAI DALL-E 3</span>
                                                    <span className="text-xs text-slate-500">Best for text & complex prompts</span>
                                                </div>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="google">
                                            <div className="flex items-center gap-2">
                                                <span>🎨</span>
                                                <div className="flex flex-col text-left">
                                                    <span className="font-bold">Google Imagen 3</span>
                                                    <span className="text-xs text-slate-500">Best for photorealism & speed</span>
                                                </div>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="dual">
                                            <div className="flex items-center gap-2">
                                                <span>👯</span>
                                                <div className="flex flex-col text-left">
                                                    <span className="font-bold">Dual Generation</span>
                                                    <span className="text-xs text-slate-500">Compare OpenAI & Google</span>
                                                </div>
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Size</Label>
                                    <Select value={selectedSize} onValueChange={(v) => setSelectedSize(v)}>
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
                                            <SelectItem value="cinematic">🎬 Cinematic (Movie)</SelectItem>
                                            <SelectItem value="3d-model">🧸 3D Render (Cute)</SelectItem>
                                            <SelectItem value="minimalist">⚪ Minimalist (Clean)</SelectItem>
                                            <SelectItem value="anime">🌸 Anime (2D Art)</SelectItem>
                                            <SelectItem value="analog">🎞️ Analog Film (Retro)</SelectItem>
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

                    {generating || generatingGoogle ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {generating && (
                                <div className="aspect-square rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                    <div className="text-center">
                                        <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
                                        <p className="text-xs text-slate-500">OpenAI DALL-E 3...</p>
                                    </div>
                                </div>
                            )}
                            {generatingGoogle && (
                                <div className="aspect-square rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                    <div className="text-center">
                                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
                                        <p className="text-xs text-slate-500">Google Imagen 4...</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (poster || googlePoster) ? (
                        <div className={`grid grid-cols-1 ${provider === 'dual' ? 'md:grid-cols-2' : ''} gap-6`}>
                            {[poster, googlePoster].filter(p => p !== null).map((p, idx) => (
                                <div key={`${p!.provider}-${idx}`} className="space-y-4">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p!.provider === 'openai' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {p!.provider === 'openai' ? '🤖 OpenAI DALL-E 3' : '🎨 Google Imagen 4'}
                                        </span>
                                    </div>
                                    <div
                                        className="rounded-xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700 relative group/img cursor-zoom-in"
                                        onClick={() => setSelectedImage(p!.imageUrl)}
                                    >
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center z-10">
                                            <Maximize2 className="w-8 h-8 text-white" />
                                        </div>
                                        <img
                                            src={p!.imageUrl}
                                            alt="Generated Poster"
                                            className="w-full h-auto object-contain"
                                        />
                                    </div>

                                    {/* Watermark & Text Tool */}
                                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-lg border border-slate-200 dark:border-slate-800 space-y-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Stamp className="w-4 h-4 text-blue-500" />
                                            <h3 className="text-sm font-bold">Logo & Text Branding</h3>
                                        </div>

                                        <div className="flex gap-3">
                                            <div
                                                className="w-12 h-12 border-2 border-dashed border-slate-300 rounded overflow-hidden flex items-center justify-center cursor-pointer hover:bg-slate-100 bg-white"
                                                onClick={() => fileInputRef.current?.click()}
                                                title="Upload custom logo"
                                            >
                                                {logoImage ? (
                                                    <img src={logoImage} className="w-full h-full object-contain" />
                                                ) : (
                                                    <Upload className="w-4 h-4 text-slate-400" />
                                                )}
                                            </div>

                                            <div className="flex-1 space-y-3">
                                                <div className="space-y-1">
                                                    <div className="flex justify-between items-center text-[10px] text-slate-500">
                                                        <span>Logo size</span>
                                                        <span>{Math.round(logoScale * 100)}%</span>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min="0.05"
                                                        max="0.5"
                                                        step="0.01"
                                                        value={logoScale}
                                                        onChange={(e) => setLogoScale(parseFloat(e.target.value))}
                                                        className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-4 gap-1">
                                                    {['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right', 'center'].map((pos) => (
                                                        <button
                                                            key={pos}
                                                            onClick={() => setWatermarkPosition(pos)}
                                                            className={`p-1 rounded bg-white shadow-sm border ${watermarkPosition === pos ? 'border-primary' : 'border-slate-200'} hover:bg-slate-50 flex items-center justify-center`}
                                                            title={pos}
                                                        >
                                                            {pos === 'top-left' && <ArrowUpLeft className="w-2.5 h-2.5" />}
                                                            {pos === 'top-center' && <ArrowUp className="w-2.5 h-2.5" />}
                                                            {pos === 'top-right' && <ArrowUpRight className="w-2.5 h-2.5" />}
                                                            {pos === 'bottom-left' && <ArrowDownLeft className="w-2.5 h-2.5" />}
                                                            {pos === 'bottom-center' && <ArrowDown className="w-2.5 h-2.5" />}
                                                            {pos === 'bottom-right' && <ArrowDownRight className="w-2.5 h-2.5" />}
                                                            {pos === 'center' && <Move className="w-2.5 h-2.5" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-3">
                                            <div className="flex gap-2">
                                                <div className="flex-1">
                                                    <Label className="text-[10px] font-bold text-slate-500 uppercase">Poster Text</Label>
                                                    <Input
                                                        value={overlayText}
                                                        onChange={(e) => setOverlayText(e.target.value)}
                                                        placeholder="Add sale text, web URL..."
                                                        className="h-7 text-xs"
                                                    />
                                                </div>
                                                <div className="w-12">
                                                    <Label className="text-[10px] font-bold text-slate-500 uppercase">Color</Label>
                                                    <input
                                                        type="color"
                                                        value={overlayTextColor}
                                                        onChange={(e) => setOverlayTextColor(e.target.value)}
                                                        className="w-full h-7 p-0 border-0 bg-transparent cursor-pointer"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex justify-between items-center text-[10px] text-slate-500">
                                                    <span>Font size</span>
                                                    <span>{overlayFontSize}px</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="20"
                                                    max="200"
                                                    step="5"
                                                    value={overlayFontSize}
                                                    onChange={(e) => setOverlayFontSize(parseInt(e.target.value))}
                                                    className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                                />
                                            </div>
                                        </div>

                                        <Button
                                            size="sm"
                                            className="w-full h-8 text-xs bg-blue-600 hover:bg-blue-700"
                                            onClick={() => handleApplyWatermark(p!)}
                                            disabled={(!logoImage && !overlayText) || watermarking}
                                        >
                                            {watermarking ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Stamp className="w-3 h-3 mr-2" />}
                                            Apply Branding
                                        </Button>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button onClick={() => downloadPoster(p!)} variant="outline" size="sm" className="flex-1 h-8 text-[10px]">
                                            <Download className="w-3 h-3 mr-1" />
                                            Download
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 text-[10px] border-amber-200 dark:border-amber-800/30 hover:bg-amber-50 dark:hover:bg-amber-900/10 text-amber-600"
                                            onClick={() => {
                                                setMagicPosterRef(p!);
                                                setActiveMagicAction("edit");
                                            }}
                                        >
                                            <Wand2 className="w-3 h-3 mr-1" />
                                            Magic Edit
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 text-[10px] border-blue-200 dark:border-blue-800/30 hover:bg-blue-50 dark:hover:bg-blue-900/10 text-blue-600"
                                            onClick={() => {
                                                setMagicPosterRef(p!);
                                                setActiveMagicAction("variation");
                                                // Directly trigger for variations
                                                setTimeout(() => handleExecuteMagicAction(), 100);
                                            }}
                                        >
                                            <Layers className="w-3 h-3 mr-1" />
                                            Variations
                                        </Button>
                                    </div>

                                    {/* Magic Edit Input Overlay */}
                                    {activeMagicAction === 'edit' && magicPosterRef?.provider === p!.provider && (
                                        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 p-3 rounded-lg animate-in slide-in-from-top-2 duration-300">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[10px] font-bold text-amber-700 flex items-center gap-1">
                                                    <Palette className="w-3 h-3" />
                                                    What to change?
                                                </span>
                                                <button onClick={() => setActiveMagicAction(null)}>
                                                    <X className="w-3 h-3 text-amber-400 hover:text-amber-600" />
                                                </button>
                                            </div>
                                            <Input
                                                value={magicInstruction}
                                                onChange={(e) => setMagicInstruction(e.target.value)}
                                                placeholder="e.g. Change sky to sunset, add more clouds..."
                                                className="h-8 text-xs bg-white dark:bg-slate-900 border-amber-100"
                                                autoFocus
                                            />
                                            <Button
                                                size="sm"
                                                className="w-full mt-2 h-7 bg-amber-600 hover:bg-amber-700 text-white text-[10px]"
                                                onClick={handleExecuteMagicAction}
                                                disabled={magicLoading}
                                            >
                                                {magicLoading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Wand2 className="w-3 h-3 mr-1" />}
                                                Apply Magic Edit
                                            </Button>
                                        </div>
                                    )}

                                    <div className="flex gap-2 text-[10px]">
                                        <button
                                            className="flex items-center gap-1 text-slate-400 hover:text-red-500 transition-colors"
                                            onClick={() => {
                                                setMagicPosterRef(p!);
                                                setActiveMagicAction("bg-remove");
                                                setTimeout(() => handleExecuteMagicAction(), 100);
                                            }}
                                        >
                                            <Eraser className="w-3 h-3" />
                                            Remove Background
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 gap-2 mt-2">
                                        <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg relative group">
                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(p!.captionMN, "mn")}>
                                                    {copied === "mn" ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                                                </Button>
                                            </div>
                                            <p className="text-[10px] font-bold text-slate-500 mb-0.5">MONGOLIAN (MN)</p>
                                            <p className="text-xs whitespace-pre-wrap">{p!.captionMN}</p>
                                        </div>

                                        <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg relative group">
                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(p!.captionEN, "en")}>
                                                    {copied === "en" ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                                                </Button>
                                            </div>
                                            <p className="text-[10px] font-bold text-slate-500 mb-0.5">ENGLISH (EN)</p>
                                            <p className="text-xs whitespace-pre-wrap">{p!.captionEN}</p>
                                        </div>

                                        <div className="text-[10px] text-blue-500 font-mono italic">
                                            {p!.hashtags}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="aspect-square rounded-xl bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600 p-8 text-center">
                            <Sparkles className="w-12 h-12 text-slate-300 mb-4" />
                            <h3 className="font-semibold text-slate-600 dark:text-slate-400">Ready to create?</h3>
                            <p className="text-sm text-slate-500 mt-2">
                                1. Enter your idea (or use a template)<br />
                                2. "Write Pro Prompt" to add details<br />
                                3. Generate & Compare AI Results
                            </p>
                        </div>
                    )}
                </Card>
            </div>
            {/* Image Zoom Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300"
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImage(null);
                        }}
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div className="max-w-5xl max-h-[90vh] relative group" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={selectedImage}
                            className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain border border-white/10"
                            alt="Zoomed Poster"
                        />
                        <div className="absolute top-4 left-4">
                            <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full border border-white/20 flex items-center gap-2">
                                <Maximize2 className="w-3 h-3" />
                                PREVIEW MODE
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Hub Sync Toast (Subtle) */}
            {savingToHub && (
                <div className="fixed bottom-6 right-6 z-40 animate-in slide-in-from-right-10 duration-500">
                    <div className="bg-white dark:bg-slate-900 shadow-2xl rounded-full px-5 py-2.5 flex items-center gap-3 border border-slate-200 dark:border-slate-800">
                        <div className="flex -space-x-1">
                            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                                <Server className="w-3 h-3 text-white animate-pulse" />
                            </div>
                        </div>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                            Syncing to AI Hub...
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
