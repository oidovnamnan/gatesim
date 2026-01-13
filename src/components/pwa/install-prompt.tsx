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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                onClick={() => setShow(false)}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="w-full max-w-sm"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Card className="p-6 shadow-2xl border-none bg-white dark:bg-slate-900 rounded-2xl">
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="w-20 h-20 rounded-2xl bg-white shadow-md p-2 flex items-center justify-center">
                                <img src="/logo.png" alt="GateSIM" className="w-full h-full object-contain" />
                            </div>

                            <div className="space-y-2">
                                <h3 className="font-bold text-xl">GateSIM App</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Аппликейшн болгож суулгаад, илүү хурдан, хялбар ашиглаарай.
                                </p>
                            </div>

                            {isIOS ? (
                                <div className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-xl text-left text-sm space-y-3 mt-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full text-xs font-bold">1</div>
                                        <span>Доор байрлах <strong>Share</strong> <span className="text-blue-500">⬆️</span> товчийг дарна уу.</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full text-xs font-bold">2</div>
                                        <span><strong>Add to Home Screen</strong> <span className="text-foreground">➕</span> сонгоно уу.</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex gap-3 w-full mt-2">
                                    <Button
                                        onClick={() => setShow(false)}
                                        variant="outline"
                                        className="flex-1 rounded-full"
                                    >
                                        Дараа
                                    </Button>
                                    <Button
                                        onClick={handleInstall}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold"
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        Суулгах
                                    </Button>
                                </div>
                            )}

                            {isIOS && (
                                <Button
                                    onClick={() => setShow(false)}
                                    variant="ghost"
                                    className="text-muted-foreground text-sm"
                                >
                                    Хаах
                                </Button>
                            )}
                        </div>
                    </Card>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
