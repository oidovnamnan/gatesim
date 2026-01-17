"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Languages,
    Mic,
    MicOff,
    Camera,
    Type,
    Volume2,
    Copy,
    Check,
    ArrowLeftRight,
    Loader2,
    X,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/providers/language-provider";
import { cn } from "@/lib/utils";

// Supported languages
const languages = [
    { code: "mn", name: "Монгол", flag: "🇲🇳" },
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "zh", name: "中文", flag: "🇨🇳" },
    { code: "ja", name: "日本語", flag: "🇯🇵" },
    { code: "ko", name: "한국어", flag: "🇰🇷" },
    { code: "th", name: "ไทย", flag: "🇹🇭" },
    { code: "ru", name: "Русский", flag: "🇷🇺" },
];

// Input modes
const inputModes = [
    { id: "text", icon: Type, label: "Текст", labelEn: "Text" },
    { id: "voice", icon: Mic, label: "Дуу", labelEn: "Voice" },
    { id: "camera", icon: Camera, label: "Камер", labelEn: "Camera" },
];

interface AITranslatorProps {
    className?: string;
}

export function AITranslator({ className }: AITranslatorProps) {
    const { language: appLang } = useTranslation();
    const isMongolian = appLang === "mn";

    const [inputMode, setInputMode] = useState<"text" | "voice" | "camera">("text");
    const [sourceLang, setSourceLang] = useState("en");
    const [targetLang, setTargetLang] = useState("mn");
    const [inputText, setInputText] = useState("");
    const [translatedText, setTranslatedText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [copied, setCopied] = useState(false);
    const [cameraOpen, setCameraOpen] = useState(false);

    const recognitionRef = useRef<any>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Swap languages
    const swapLanguages = () => {
        setSourceLang(targetLang);
        setTargetLang(sourceLang);
        setInputText(translatedText);
        setTranslatedText(inputText);
    };

    // Translate text
    const handleTranslate = async () => {
        if (!inputText.trim()) return;

        setIsLoading(true);
        try {
            const res = await fetch("/api/ai/translate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text: inputText,
                    sourceLang,
                    targetLang,
                }),
            });

            const data = await res.json();
            if (data.success) {
                setTranslatedText(data.translatedText);
            } else {
                setTranslatedText("Translation failed");
            }
        } catch (error) {
            console.error("Translation error:", error);
            setTranslatedText("Network error");
        } finally {
            setIsLoading(false);
        }
    };

    // Voice recognition
    const startVoiceRecognition = () => {
        if (typeof window === "undefined") return;

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Voice input not supported");
            return;
        }

        if (isRecording) {
            recognitionRef.current?.stop();
            setIsRecording(false);
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = sourceLang === "mn" ? "mn-MN" :
            sourceLang === "zh" ? "zh-CN" :
                sourceLang === "ja" ? "ja-JP" :
                    sourceLang === "ko" ? "ko-KR" :
                        sourceLang === "th" ? "th-TH" :
                            sourceLang === "ru" ? "ru-RU" : "en-US";
        recognition.interimResults = false;

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInputText(transcript);
            setIsRecording(false);
            // Auto translate after voice
            setTimeout(() => handleTranslate(), 500);
        };

        recognition.onerror = () => setIsRecording(false);
        recognition.onend = () => setIsRecording(false);

        recognitionRef.current = recognition;
        recognition.start();
        setIsRecording(true);
    };

    // Camera OCR
    const openCamera = async () => {
        if (!navigator.mediaDevices?.getUserMedia) {
            alert("Camera not supported");
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }
            setCameraOpen(true);
        } catch (error) {
            console.error("Camera error:", error);
            alert("Cannot access camera");
        }
    };

    const captureImage = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(video, 0, 0);

        // Stop camera
        const stream = video.srcObject as MediaStream;
        stream?.getTracks().forEach(track => track.stop());
        setCameraOpen(false);

        // Get image data for OCR
        const imageData = canvas.toDataURL("image/png");

        // Call OCR API
        setIsLoading(true);
        try {
            const res = await fetch("/api/ai/ocr", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: imageData }),
            });

            const data = await res.json();
            if (data.success && data.text) {
                setInputText(data.text);
                // Auto translate
                setTimeout(() => handleTranslate(), 500);
            }
        } catch (error) {
            console.error("OCR error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Text-to-speech
    const speakText = (text: string, lang: string) => {
        if (!text || typeof window === "undefined") return;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang === "mn" ? "mn-MN" :
            lang === "zh" ? "zh-CN" :
                lang === "ja" ? "ja-JP" :
                    lang === "ko" ? "ko-KR" :
                        lang === "th" ? "th-TH" :
                            lang === "ru" ? "ru-RU" : "en-US";
        window.speechSynthesis.speak(utterance);
    };

    // Copy to clipboard
    const copyToClipboard = async (text: string) => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={cn("space-y-6", className)}>
            {/* Input Mode Selector */}
            <div className="flex justify-center gap-2">
                {inputModes.map((mode) => {
                    const Icon = mode.icon;
                    return (
                        <button
                            key={mode.id}
                            onClick={() => {
                                setInputMode(mode.id as any);
                                if (mode.id === "camera") openCamera();
                                if (mode.id === "voice") startVoiceRecognition();
                            }}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-sm transition-all",
                                inputMode === mode.id
                                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                            )}
                        >
                            <Icon className="w-4 h-4" />
                            {isMongolian ? mode.label : mode.labelEn}
                        </button>
                    );
                })}
            </div>

            {/* Camera View */}
            <AnimatePresence>
                {cameraOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="relative rounded-2xl overflow-hidden bg-black"
                    >
                        <video ref={videoRef} className="w-full h-64 object-cover" />
                        <canvas ref={canvasRef} className="hidden" />
                        <div className="absolute inset-x-0 bottom-4 flex justify-center gap-4">
                            <Button
                                onClick={captureImage}
                                className="w-16 h-16 rounded-full bg-white text-black"
                            >
                                <Camera className="w-6 h-6" />
                            </Button>
                            <Button
                                onClick={() => {
                                    const stream = videoRef.current?.srcObject as MediaStream;
                                    stream?.getTracks().forEach(track => track.stop());
                                    setCameraOpen(false);
                                }}
                                variant="ghost"
                                className="w-12 h-12 rounded-full bg-black/50 text-white"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Language Selector */}
            <div className="flex items-center justify-center gap-3">
                <select
                    value={sourceLang}
                    onChange={(e) => setSourceLang(e.target.value)}
                    className="px-4 py-2.5 rounded-xl border bg-background font-bold text-sm"
                >
                    {languages.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                            {lang.flag} {lang.name}
                        </option>
                    ))}
                </select>

                <button
                    onClick={swapLanguages}
                    className="p-2.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 hover:scale-110 transition-transform"
                >
                    <ArrowLeftRight className="w-5 h-5" />
                </button>

                <select
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                    className="px-4 py-2.5 rounded-xl border bg-background font-bold text-sm"
                >
                    {languages.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                            {lang.flag} {lang.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Input Area */}
            <Card className="p-4">
                <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                        {languages.find(l => l.code === sourceLang)?.flag} {isMongolian ? "Оролт" : "Input"}
                    </Badge>
                    <div className="flex gap-2">
                        {inputMode === "voice" && (
                            <button
                                onClick={startVoiceRecognition}
                                className={cn(
                                    "p-2 rounded-lg transition-all",
                                    isRecording ? "bg-red-500 text-white animate-pulse" : "bg-muted hover:bg-muted/80"
                                )}
                            >
                                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                            </button>
                        )}
                        <button
                            onClick={() => speakText(inputText, sourceLang)}
                            className="p-2 rounded-lg bg-muted hover:bg-muted/80"
                        >
                            <Volume2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={isMongolian ? "Орчуулах текстээ бичнэ үү..." : "Enter text to translate..."}
                    className="w-full h-32 bg-transparent resize-none focus:outline-none text-lg"
                />
            </Card>

            {/* Translate Button */}
            <Button
                onClick={handleTranslate}
                disabled={!inputText.trim() || isLoading}
                className="w-full py-6 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg"
            >
                {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                    <Languages className="w-5 h-5 mr-2" />
                )}
                {isMongolian ? "Орчуулах" : "Translate"}
            </Button>

            {/* Output Area */}
            {translatedText && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
                        <div className="flex items-center justify-between mb-2">
                            <Badge className="text-xs bg-purple-500">
                                {languages.find(l => l.code === targetLang)?.flag} {isMongolian ? "Гаралт" : "Output"}
                            </Badge>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => speakText(translatedText, targetLang)}
                                    className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 hover:scale-110 transition-transform"
                                >
                                    <Volume2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => copyToClipboard(translatedText)}
                                    className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 hover:scale-110 transition-transform"
                                >
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                        <p className="text-lg leading-relaxed">{translatedText}</p>
                    </Card>
                </motion.div>
            )}
        </div>
    );
}

export default AITranslator;
