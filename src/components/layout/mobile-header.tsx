"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileHeaderProps {
    title?: string;
    showBack?: boolean;
    rightAction?: ReactNode;
    transparent?: boolean;
    className?: string;
}

export function MobileHeader({
    title,
    showBack = false,
    rightAction,
    transparent = false,
    className,
}: MobileHeaderProps) {
    const router = useRouter();

    return (
        <header
            className={cn(
                "sticky top-0 z-40 safe-padding",
                transparent ? "bg-transparent" : "header-bg backdrop-blur-md border-b",
                className
            )}
        >
            <div className="flex items-center justify-between h-14 px-4">
                {/* Left side */}
                <div className="flex items-center gap-2 min-w-[60px]">
                    {showBack && (
                        <button
                            onClick={() => router.back()}
                            className="flex items-center justify-center w-10 h-10 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors touch-manipulation"
                        >
                            <ChevronLeft className="header-icon h-6 w-6" />
                        </button>
                    )}
                </div>

                {/* Title */}
                {title && (
                    <h1 className="header-text text-lg font-semibold truncate">
                        {title}
                    </h1>
                )}

                {/* Right side */}
                <div className="flex items-center gap-2 min-w-[60px] justify-end">
                    {rightAction}
                </div>
            </div>
        </header>
    );
}

// Simple page header with just title
interface PageHeaderProps {
    title: string;
    subtitle?: string;
    action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
    return (
        <div className="px-4 py-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="header-text text-2xl font-bold">{title}</h1>
                    {subtitle && (
                        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
                    )}
                </div>
                {action}
            </div>
        </div>
    );
}
