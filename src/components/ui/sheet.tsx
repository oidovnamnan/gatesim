"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface SheetProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
}

export function Sheet({ open, onOpenChange, children }: SheetProps) {
    if (!open) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                onClick={() => onOpenChange?.(false)}
            />
            {children}
        </>
    );
}

interface SheetContentProps {
    children: React.ReactNode;
    className?: string;
    side?: "left" | "right" | "top" | "bottom" | "center";
    onClose?: () => void;
}

export function SheetContent({
    children,
    className,
    side = "right",
    onClose
}: SheetContentProps) {
    const sideClasses = {
        right: "right-0 top-0 h-full w-full max-w-lg border-l animate-in slide-in-from-right duration-300",
        left: "left-0 top-0 h-full w-full max-w-lg border-r animate-in slide-in-from-left duration-300",
        top: "top-0 left-0 w-full max-h-[80vh] border-b animate-in slide-in-from-top duration-300",
        bottom: "bottom-0 left-0 w-full max-h-[80vh] border-t animate-in slide-in-from-bottom duration-300",
        center: "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg border rounded-xl shadow-2xl h-auto max-h-[90vh] animate-in fade-in zoom-in-95 duration-300"
    };

    return (
        <div className={cn(
            "fixed z-50 bg-slate-900 shadow-xl",
            sideClasses[side],
            className
        )}>
            {onClose && (
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
                >
                    <X className="h-5 w-5 text-white" />
                    <span className="sr-only">Close</span>
                </button>
            )}
            {children}
        </div>
    );
}

export function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("flex flex-col space-y-2 text-center sm:text-left", className)}
            {...props}
        />
    );
}

export function SheetTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h2
            className={cn("text-lg font-semibold text-white", className)}
            {...props}
        />
    );
}

export function SheetDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
    return (
        <p
            className={cn("text-sm text-white/60", className)}
            {...props}
        />
    );
}
