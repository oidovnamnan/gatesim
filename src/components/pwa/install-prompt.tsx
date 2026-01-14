"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

const DISMISS_KEY = "gatesim_pwa_prompt_dismissed_at";
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

export function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [show, setShow] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Check if recently dismissed
        const lastDismissed = localStorage.getItem(DISMISS_KEY);
        if (lastDismissed) {
            const timeSinceDismissed = Date.now() - parseInt(lastDismissed);
            if (timeSinceDismissed < TWENTY_FOUR_HOURS) {
                return;
            }
        }

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
            setShow(true);
        }

        // 2. Check for Android/Desktop (beforeinstallprompt)
        const handler = (e: any) => {
            // Prevent default to capture the event and suppress auto-prompt
            e.preventDefault();
            setDeferredPrompt(e);

            // Show our custom UI to provide the trigger button
            setShow(true);
        };

        window.addEventListener("beforeinstallprompt", handler);

        return () => {
            window.removeEventListener("beforeinstallprompt", handler);
        };
    }, []);

    const handleDismiss = () => {
        setShow(false);
        localStorage.setItem(DISMISS_KEY, Date.now().toString());
    };

    const handleInstall = async () => {
        if (isIOS) {
            return;
        }

        if (!deferredPrompt) return;

        // Close the custom UI immediately
        handleDismiss();

        // Wait for the UI to close before triggering the native prompt
        setTimeout(async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;

                if (outcome === "accepted") {
                    setDeferredPrompt(null);
                }
            }
        }, 300);
    };

    if (!show) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                onClick={handleDismiss}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="w-full max-w-xl mx-4"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Card className="p-4 shadow-2xl border-none bg-white rounded-2xl overflow-hidden relative text-slate-900">
                        {/* Close button */}
                        <button
                            onClick={handleDismiss}
                            className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-4 text-left">
                            {/* Icon - Left */}
                            <div className="w-14 h-14 shrink-0 rounded-xl bg-white shadow-sm border border-slate-100 dark:border-slate-800 p-2 flex items-center justify-center">
                                <img src="/logo.png" alt="GateSIM" className="w-full h-full object-contain" />
                            </div>

                            {/* Content - Middle */}
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-lg leading-tight">GateSIM App</h3>
                                <p className="text-sm text-muted-foreground mt-0.5 leading-snug">
                                    {isIOS ? "Share ⬆️ -> Add to Home Screen ➕" : "Аппликейшн болгож суулгаад хялбар ашиглаарай."}
                                </p>
                            </div>

                            {/* Actions - Right (Desktop/Android) */}
                            {!isIOS && (
                                <div className="shrink-0 pl-2">
                                    <Button
                                        onClick={handleInstall}
                                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold px-5 shadow-lg shadow-blue-600/20"
                                        size="sm"
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        Суулгах
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* iOS Instructions Expanded (Optional) */}
                        {isIOS && (
                            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-muted-foreground">
                                <span>Safari хөтөч дээр суулгах заавар</span>
                                <span className="flex items-center gap-1">Share <span className="text-blue-500">⬆️</span> &rarr; Add to Home Screen</span>
                            </div>
                        )}
                    </Card>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
