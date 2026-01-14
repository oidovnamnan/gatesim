"use client";

import { MobileHeader } from "@/components/layout/mobile-header";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="min-h-screen pb-48 md:pb-8 bg-background">
            <MobileHeader showBack title={<Skeleton className="h-6 w-32 bg-slate-200/50" />} />

            {/* Hero Section Skeleton */}
            <div className="relative pt-16 pb-6">
                <div className="px-4 text-center">
                    <div className="inline-block relative">
                        <Skeleton className="w-24 h-24 rounded-3xl mb-4 mx-auto bg-slate-200/50" />
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        <Skeleton className="h-8 w-48 bg-slate-200/50" />
                        <Skeleton className="h-4 w-32 bg-slate-100/50" />
                    </div>
                </div>
            </div>

            {/* Package Info Card Skeleton */}
            <div className="px-4">
                <Card className="p-5 bg-white border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                        <Skeleton className="h-6 w-40 bg-slate-200/50" />
                        <div className="text-right">
                            <Skeleton className="h-3 w-12 bg-slate-100/50 mb-1 ml-auto" />
                            <Skeleton className="h-8 w-24 bg-blue-100/50" />
                        </div>
                    </div>

                    {/* Key specs grid */}
                    <div className="grid grid-cols-2 gap-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex flex-col gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="w-6 h-6 rounded-full bg-slate-200/50" />
                                    <Skeleton className="h-3 w-10 bg-slate-200/50" />
                                </div>
                                <Skeleton className="h-6 w-16 bg-slate-300/50 ml-1" />
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Operator Info Skeleton */}
            <div className="px-4 mt-4">
                <Card className="p-5 bg-white border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Skeleton className="h-5 w-5 bg-slate-200/50" />
                        <Skeleton className="h-5 w-32 bg-slate-200/50" />
                    </div>
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-center gap-3">
                                <Skeleton className="w-4 h-4 rounded-full bg-slate-200/50" />
                                <Skeleton className="h-4 w-full bg-slate-100/50" />
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Fixed bottom CTA Skeleton */}
            <div className="fixed bottom-0 left-0 right-0 p-4 pb-[calc(1rem+env(safe-area-inset-bottom)+70px)] md:pb-4 bg-gradient-to-t from-background via-background to-transparent z-30">
                <div className="bg-white rounded-2xl p-4 shadow-xl border border-slate-100 flex items-center justify-between gap-4">
                    <div>
                        <Skeleton className="h-3 w-16 bg-slate-100/50 mb-1" />
                        <Skeleton className="h-7 w-24 bg-slate-200/50" />
                    </div>
                    <Skeleton className="h-12 w-32 rounded-xl bg-blue-600/20" />
                </div>
            </div>
        </div>
    );
}
