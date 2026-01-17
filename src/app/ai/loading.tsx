import { Skeleton } from "@/components/ui/skeleton";
import { MobileHeader } from "@/components/layout/mobile-header";

export default function AILoading() {
    return (
        <div className="min-h-screen bg-background pb-24 md:pb-8">
            {/* Hero Skeleton */}
            <div className="px-4 py-6 bg-slate-50/50">
                <div className="max-w-lg mx-auto text-center space-y-3">
                    <Skeleton className="w-14 h-14 mx-auto rounded-2xl" />
                    <Skeleton className="h-8 w-40 mx-auto" />
                    <Skeleton className="h-4 w-32 mx-auto" />
                </div>
            </div>

            {/* Travel Mode Skeleton */}
            <div className="px-4 py-4 border-b flex gap-2 overflow-hidden">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-9 w-24 rounded-full flex-shrink-0" />
                ))}
            </div>

            {/* Grid Skeleton */}
            <div className="px-4 py-6 grid grid-cols-2 gap-3">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-32 rounded-xl" />
                ))}
            </div>
        </div>
    );
}
