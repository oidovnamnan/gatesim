"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
    return (
        <div className={cn("skeleton rounded-lg", className)} />
    );
}

// Package card skeleton
export function PackageCardSkeleton() {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
            <div className="flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
            </div>
            <div className="flex items-center justify-between pt-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-10 w-24 rounded-xl" />
            </div>
        </div>
    );
}

// Country card skeleton
export function CountryCardSkeleton() {
    return (
        <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5">
            <Skeleton className="w-14 h-14 rounded-full" />
            <Skeleton className="h-4 w-16" />
        </div>
    );
}

// Order card skeleton
export function OrderCardSkeleton() {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-4">
            <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
            </div>
            <Skeleton className="h-10 w-full rounded-xl" />
        </div>
    );
}
