"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

interface ToastContextType {
    toast: (message: string, type?: ToastType, duration?: number) => void;
    success: (message: string) => void;
    error: (message: string) => void;
    warning: (message: string) => void;
    info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const icons: Record<ToastType, typeof Check> = {
    success: Check,
    error: X,
    warning: AlertCircle,
    info: Info,
};

const styles: Record<ToastType, string> = {
    success: "bg-emerald-500/90 border-emerald-400/50",
    error: "bg-red-500/90 border-red-400/50",
    warning: "bg-amber-500/90 border-amber-400/50",
    info: "bg-blue-500/90 border-blue-400/50",
};

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const addToast = useCallback((message: string, type: ToastType = "info", duration = 3000) => {
        const id = Math.random().toString(36).substring(7);
        const newToast: Toast = { id, type, message, duration };

        setToasts((prev) => [...prev, newToast]);

        if (duration > 0) {
            setTimeout(() => removeToast(id), duration);
        }

        return id;
    }, [removeToast]);

    const value: ToastContextType = {
        toast: addToast,
        success: (message) => addToast(message, "success"),
        error: (message) => addToast(message, "error"),
        warning: (message) => addToast(message, "warning"),
        info: (message) => addToast(message, "info"),
    };

    return (
        <ToastContext.Provider value={value}>
            {children}

            {/* Toast container */}
            <div className="fixed top-4 left-4 right-4 z-[100] pointer-events-none">
                <div className="max-w-md mx-auto space-y-2">
                    <AnimatePresence>
                        {toasts.map((toast) => {
                            const Icon = icons[toast.type];

                            return (
                                <motion.div
                                    key={toast.id}
                                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg pointer-events-auto",
                                        styles[toast.type]
                                    )}
                                >
                                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                                        <Icon className="h-4 w-4 text-white" />
                                    </div>
                                    <p className="flex-1 text-sm font-medium text-white">
                                        {toast.message}
                                    </p>
                                    <button
                                        onClick={() => removeToast(toast.id)}
                                        className="w-6 h-6 rounded-full hover:bg-white/20 flex items-center justify-center flex-shrink-0 transition-colors"
                                    >
                                        <X className="h-4 w-4 text-white/80" />
                                    </button>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within ToastProvider");
    }
    return context;
}
