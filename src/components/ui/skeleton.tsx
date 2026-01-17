import { cn } from "@/lib/utils"

function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-muted", className)}
            {...props}
        />
    )
}

export { Skeleton }

export function OrderCardSkeleton() {
    return (
        <div className="bg-card border border-border rounded-2xl p-4 animate-pulse shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3">
                    <div className="w-10 h-10 bg-muted rounded-full" />
                    <div className="space-y-2">
                        <div className="h-4 w-24 bg-muted rounded" />
                        <div className="h-3 w-16 bg-muted rounded" />
                    </div>
                </div>
                <div className="h-6 w-16 bg-muted rounded-full" />
            </div>
            <div className="flex justify-between items-center mt-2">
                <div className="h-3 w-32 bg-muted rounded" />
                <div className="h-8 w-20 bg-muted rounded-lg" />
            </div>
        </div>
    )
}
