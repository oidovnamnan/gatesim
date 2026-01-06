"use client";

import * as React from "react";
import { createContext, useContext, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface Toast {
    id: string;
    title?: string;
    description?: string;
    variant?: "default" | "destructive" | "success";
}

interface ToastContextType {
    toasts: Toast[];
    toast: (props: Omit<Toast, "id">) => void;
    dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        // Fallback for components that might not be wrapped in provider
        return {
            toast: (props: Omit<Toast, "id">) => {
                console.log("[Toast]", props.title, props.description);
            },
            toasts: [],
            dismiss: () => { }
        };
    }
    return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const toast = useCallback((props: Omit<Toast, "id">) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { ...props, id }]);

        // Auto dismiss after 3 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    }, []);

    const dismiss = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, toast, dismiss }}>
            {children}
            {/* Toast Container */}
            <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={cn(
                            "pointer-events-auto min-w-[300px] rounded-xl p-4 shadow-lg animate-in slide-in-from-right-full duration-300",
                            t.variant === "destructive"
                                ? "bg-red-500 text-white"
                                : t.variant === "success"
                                    ? "bg-emerald-500 text-white"
                                    : "bg-white text-slate-900 border border-slate-200"
                        )}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                                {t.title && (
                                    <p className="font-semibold text-sm">{t.title}</p>
                                )}
                                {t.description && (
                                    <p className={cn(
                                        "text-sm mt-1",
                                        t.variant === "destructive" || t.variant === "success"
                                            ? "text-white/80"
                                            : "text-slate-600"
                                    )}>
                                        {t.description}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={() => dismiss(t.id)}
                                className="opacity-70 hover:opacity-100"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
