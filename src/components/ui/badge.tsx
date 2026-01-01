"use client";

import { cn } from "@/lib/utils";

interface BadgeProps {
    children: React.ReactNode;
    variant?: "default" | "secondary" | "outline" | "destructive" | "success" | "warning";
    size?: "sm" | "md";
    className?: string;
}

const variantStyles = {
    default: "bg-slate-900 text-white shadow hover:bg-slate-900/80",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200/80",
    outline: "text-slate-900 border border-slate-200 hover:bg-slate-100",
    destructive: "bg-red-500 text-white shadow hover:bg-red-600",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border border-amber-200",
};

const sizeStyles = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-0.5 text-sm",
};

export function Badge({
    children,
    variant = "default",
    size = "md",
    className
}: BadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2",
                variantStyles[variant],
                sizeStyles[size],
                className
            )}
        >
            {children}
        </span>
    );
}
