import { Skeleton } from "@/components/ui/skeleton";
import { MobileHeader } from "@/components/layout/mobile-header";

export default function MyEsimsLoading() {
    return (
        <div className="min-h-screen bg-background pb-24 md:pt-28">
            <div className="md:hidden">
                <MobileHeader title="..." />
            </div>

            <div className="hidden md:block container mx-auto px-6 mb-8 pt-8 space-y-3">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-5 w-64" />
            </div>

            <div className="container mx-auto px-4 md:px-6 mb-6">
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-1/2 md:w-40 rounded-xl" />
                    <Skeleton className="h-10 w-1/2 md:w-40 rounded-xl" />
                </div>
            </div>

            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 space-y-4">
                            <div className="flex gap-4">
                                <Skeleton className="w-12 h-10 rounded-xl" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                            </div>
                            <div className="pt-4 border-t border-slate-50 space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-8 w-24 rounded-xl" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
