"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

export function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [show, setShow] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // 1. Check for iOS
        const isIosDevice = /iPhone|iPad|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        // Check if running in standalone mode (already installed)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone === true ||
            document.referrer.includes('android-app://');

        if (isStandalone) {
            setShow(false);
            return;
        }

        if (isIosDevice) {
            setIsIOS(true);
            // On iOS, we only show the tip if they are NOT in standalone mode
            // We can check local storage to not show it every time if needed,
            // but for now let's just show it if not installed.
            setShow(true);
        }

        // 2. Check for Android/Desktop (beforeinstallprompt)
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShow(true);
        };

        window.addEventListener("beforeinstallprompt", handler);

        return () => {
            window.removeEventListener("beforeinstallprompt", handler);
        };
    }, []);

    const handleInstall = async () => {
        if (isIOS) {
            // iOS doesn't support programmatic install, just close logic or tooltip? 
            // We will just show instructions in the render
            return;
        }

        if (!deferredPrompt) return;

        // Close the custom UI immediately to avoid overlapping with the native prompt
        setShow(false);
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === "accepted") {
            setDeferredPrompt(null);
        }
    };

    if (!show) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="fixed bottom-20 left-4 right-4 z-50 md:bottom-4 md:left-auto md:right-4 md:w-96"
            >
                <Card className="p-4 shadow-xl border-blue-500/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shrink-0">
                                <img src="/logo.png" alt="GateSIM" className="w-6 h-6 object-contain invert" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm">GateSIM App</h3>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Аппликейшн болгож суулгаад, интернэтгүй үед ч ашиглаарай.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShow(false)}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {isIOS ? (
                        <div className="mt-3 text-sm flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <span className="bg-muted p-1 rounded">1</span>
                                <span>Доор байрлах <strong>Share</strong> <span className="text-blue-500">⬆️</span> товчийг дарна уу.</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="bg-muted p-1 rounded">2</span>
                                <span><strong>Add to Home Screen</strong> <span className="text-foreground">➕</span> сонгоно уу.</span>
                            </div>
                        </div>
                    ) : (
                        <Button
                            onClick={handleInstall}
                            className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white"
                            size="sm"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Суулгах
                        </Button>
                    )}
                </Card>
            </motion.div>
        </AnimatePresence>
    );
}
