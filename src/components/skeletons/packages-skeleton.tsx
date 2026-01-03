import { Skeleton } from "@/components/ui/skeleton";

export function PackagesSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-3xl border border-white/20 bg-white/5 p-4 space-y-4">
                    <div className="flex justify-between items-start">
                        <Skeleton className="h-12 w-16 px-2 rounded-xl" />
                        <Skeleton className="h-5 w-20 rounded-md" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-3/4 rounded-md" />
                        <Skeleton className="h-3 w-1/2 rounded-md" />
                    </div>
                    <div className="pt-4 flex justify-between items-center">
                        <Skeleton className="h-6 w-20 rounded-md" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                </div>
            ))}
        </div>
    );
}
