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
                transparent ? "bg-transparent" : "bg-background/80 backdrop-blur-md border-b border-border",
                className
            )}
        >
            <div className="flex items-center justify-between h-14 px-4">
                {/* Left side */}
                <div className="flex items-center gap-2 min-w-[60px]">
                    {showBack && (
                        <button
                            onClick={() => router.back()}
                            className="flex items-center justify-center w-10 h-10 -ml-2 rounded-full hover:bg-muted transition-colors touch-manipulation"
                        >
                            <ChevronLeft className="h-6 w-6 text-foreground" />
                        </button>
                    )}
                </div>

                {/* Title */}
                {title && (
                    <h1 className="text-lg font-semibold text-foreground truncate">
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
                    <h1 className="text-2xl font-bold text-foreground">{title}</h1>
                    {subtitle && (
                        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
                    )}
                </div>
                {action}
            </div>
        </div>
    );
}
