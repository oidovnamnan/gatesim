import { PackageCardSkeleton } from "@/components/ui/skeleton";

export default function PackagesLoading() {
    return (
        <div className="min-h-screen pb-24 bg-background">
            {/* Header skeleton with better styling */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3">
                <div className="flex items-center justify-between mb-4">
                    <div className="h-8 w-32 bg-slate-200 rounded animate-pulse" />
                    <div className="h-9 w-9 bg-slate-200 rounded-full animate-pulse" />
                </div>

                {/* Search Bar Skeleton */}
                <div className="h-12 w-full bg-slate-100 rounded-xl animate-pulse ring-1 ring-slate-200/50" />
            </div>

            {/* Filter tabs skeleton (Horizontal Scroll) */}
            <div className="px-4 py-4 overflow-hidden">
                <div className="flex gap-2">
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className="h-9 w-24 bg-white border border-slate-200 rounded-full animate-pulse flex-shrink-0 shadow-sm"
                        />
                    ))}
                </div>
            </div>

            {/* Package cards skeleton */}
            <div className="px-4 space-y-3">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-slate-100 rounded-xl animate-pulse" />
                            <div className="space-y-2 flex-1">
                                <div className="h-4 w-1/2 bg-slate-200 rounded animate-pulse" />
                                <div className="h-3 w-1/3 bg-slate-100 rounded animate-pulse" />
                            </div>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                            <div className="h-6 w-20 bg-slate-100 rounded-full animate-pulse" />
                            <div className="h-10 w-24 bg-slate-200 rounded-xl animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
