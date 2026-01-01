import { OrderCardSkeleton } from "@/components/ui/skeleton";

export default function MyEsimsLoading() {
    return (
        <div className="min-h-screen pb-24">
            {/* Header skeleton */}
            <div className="sticky top-0 z-40 header-blur border-b border-white/10 px-4 h-14 flex items-center">
                <div className="h-6 w-32 bg-white/10 rounded animate-pulse" />
            </div>

            {/* Tabs skeleton */}
            <div className="px-4 py-4">
                <div className="flex gap-2">
                    <div className="h-10 w-28 bg-white/10 rounded-xl animate-pulse" />
                    <div className="h-10 w-28 bg-white/10 rounded-xl animate-pulse" />
                </div>
            </div>

            {/* eSIM cards skeleton */}
            <div className="px-4 space-y-3">
                {[...Array(3)].map((_, i) => (
                    <OrderCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}
