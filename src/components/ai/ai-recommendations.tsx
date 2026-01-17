"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    Sparkles,
    RefreshCw,
    TrendingUp,
    ChevronRight,
    Wifi,
    Clock,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/providers/language-provider";
import { cn, getCountryFlag } from "@/lib/utils";

interface RecommendedPackage {
    id: string;
    slug: string;
    title: string;
    data: string;
    dataAmount: string;
    validityDays: number;
    price: number;
    operatorTitle: string;
    countries: string[];
    countryCode: string;
    aiScore: number;
    aiReason: string;
}

interface AIRecommendationsProps {
    purpose?: string;
    duration?: number;
    budget?: "low" | "medium" | "high";
    limit?: number;
    className?: string;
}

export function AIRecommendations({
    purpose = "tourist",
    duration = 7,
    budget = "medium",
    limit = 6,
    className,
}: AIRecommendationsProps) {
    const { language } = useTranslation();
    const isMongolian = language === "mn";

    const [packages, setPackages] = useState<RecommendedPackage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRecommendations = async () => {
        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({
                purpose,
                duration: duration.toString(),
                budget,
                limit: limit.toString(),
            });

            const response = await fetch(`/api/ai/recommendations?${params}`);
            const data = await response.json();

            if (data.success) {
                setPackages(data.recommendations);
            } else {
                setError(data.error || "Failed to load");
            }
        } catch (err) {
            setError("Network error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecommendations();
    }, [purpose, duration, budget]);

    if (error) {
        return (
            <Card className={cn("p-6 text-center", className)}>
                <p className="text-muted-foreground mb-4">{error}</p>
                <button
                    onClick={fetchRecommendations}
                    className="text-sm text-primary hover:underline"
                >
                    {isMongolian ? "Дахин оролдох" : "Try again"}
                </button>
            </Card>
        );
    }

    return (
        <div className={cn("space-y-4", className)}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">
                            {isMongolian ? "AI Санал болголт" : "AI Recommendations"}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            {isMongolian ? "Танд тохирох багцууд" : "Packages for you"}
                        </p>
                    </div>
                </div>
                <button
                    onClick={fetchRecommendations}
                    disabled={loading}
                    className="p-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                </button>
            </div>

            {/* Loading state */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(limit)].map((_, i) => (
                        <RecommendationSkeleton key={i} />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {packages.map((pkg, index) => (
                        <RecommendationCard
                            key={pkg.id}
                            package={pkg}
                            index={index}
                            isMongolian={isMongolian}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function RecommendationCard({
    package: pkg,
    index,
    isMongolian,
}: {
    package: RecommendedPackage;
    index: number;
    isMongolian: boolean;
}) {
    const flag = getCountryFlag(pkg.countryCode);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
        >
            <Link href={`/package/${pkg.id}`}>
                <Card hover className="p-4 h-full relative overflow-hidden group">
                    {/* AI Badge */}
                    <Badge
                        variant="outline"
                        className="absolute top-3 right-3 text-xs bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400"
                    >
                        <TrendingUp className="w-3 h-3 mr-1" />
                        AI
                    </Badge>

                    {/* Country Flag */}
                    <div className="text-4xl mb-3">{flag}</div>

                    {/* Title */}
                    <h4 className="font-bold text-sm mb-1 line-clamp-1 pr-12">
                        {pkg.title}
                    </h4>

                    {/* AI Reason */}
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-1">
                        {pkg.aiReason}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                            <Wifi className="w-3 h-3" />
                            {pkg.data}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {pkg.validityDays} {isMongolian ? "хоног" : "days"}
                        </span>
                    </div>

                    {/* Price & CTA */}
                    <div className="flex items-center justify-between mt-auto">
                        <div>
                            <span className="text-lg font-black text-primary">
                                ${pkg.price}
                            </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-medium text-primary group-hover:translate-x-1 transition-transform">
                            {isMongolian ? "Дэлгэрэнгүй" : "View"}
                            <ChevronRight className="w-3 h-3" />
                        </div>
                    </div>
                </Card>
            </Link>
        </motion.div>
    );
}

function RecommendationSkeleton() {
    return (
        <Card className="p-4 h-full">
            <Skeleton className="w-12 h-12 rounded-xl mb-3" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-3 w-1/2 mb-3" />
            <div className="flex gap-3 mb-3">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-16" />
            </div>
            <div className="flex justify-between">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-4 w-12" />
            </div>
        </Card>
    );
}

export default AIRecommendations;
