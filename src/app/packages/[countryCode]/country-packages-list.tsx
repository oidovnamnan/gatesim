"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { PackageCard } from "@/components/packages/package-card";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/providers/language-provider";
import { MobileHeader } from "@/components/layout/mobile-header";
import { useInView } from "react-intersection-observer";
import { Loader2 } from "lucide-react";

interface Package {
    id: string;
    title: string;
    operatorTitle: string;
    data: string;
    validityDays: number;
    price: number;
    currency?: string;
    countries: string[];
    countryName?: string;
    isUnlimited?: boolean;
    isFeatured?: boolean;
    isPopular?: boolean;
    isTopUp?: boolean;
}

interface Props {
    packages: Package[];
    countryCode: string;
}

export function CountryPackagesList({ packages, countryCode }: Props) {
    const { t } = useTranslation();
    const [durationFilter, setDurationFilter] = useState<"short" | "medium" | "long" | null>(null);
    const [isUnlimitedFilter, setIsUnlimitedFilter] = useState(false);
    const [typeFilter, setTypeFilter] = useState<"new" | "topup" | null>(null);

    const filteredPackages = useMemo(() => {
        return packages.filter(pkg => {
            // Duration Filter
            if (durationFilter === "short" && pkg.validityDays > 7) return false;
            if (durationFilter === "medium" && (pkg.validityDays <= 7 || pkg.validityDays > 15)) return false;
            if (durationFilter === "long" && pkg.validityDays <= 15) return false;

            // Unlimited Data Filter
            if (isUnlimitedFilter && !pkg.isUnlimited) return false;

            // Type Filter
            if (typeFilter === "new" && pkg.isTopUp) return false;
            if (typeFilter === "topup" && !pkg.isTopUp) return false;

            return true;
        });
    }, [packages, durationFilter, isUnlimitedFilter, typeFilter]);

    // Pagination State
    const PACKAGES_PER_PAGE = 20;
    const [displayCount, setDisplayCount] = useState(PACKAGES_PER_PAGE);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // Infinite scroll trigger
    const { ref: loadMoreRef, inView } = useInView({
        threshold: 0,
        rootMargin: "100px",
    });

    // Reset display count when filters change
    useEffect(() => {
        setDisplayCount(PACKAGES_PER_PAGE);
    }, [durationFilter, isUnlimitedFilter, typeFilter]);

    // Load more function
    const loadMore = useCallback(() => {
        if (displayCount >= filteredPackages.length) return;

        setIsLoadingMore(true);
        setTimeout(() => {
            setDisplayCount(prev => Math.min(prev + PACKAGES_PER_PAGE, filteredPackages.length));
            setIsLoadingMore(false);
        }, 300);
    }, [displayCount, filteredPackages.length]);

    // Trigger load more when in view
    useEffect(() => {
        if (inView && !isLoadingMore) {
            loadMore();
        }
    }, [inView, isLoadingMore, loadMore]);

    const displayedPackages = useMemo(() => {
        return filteredPackages.slice(0, displayCount);
    }, [filteredPackages, displayCount]);

    const hasMore = displayCount < filteredPackages.length;

    return (
        <>
            <MobileHeader title={t(`country_${countryCode}`)} showBack />

            <div className="container max-w-7xl mx-auto p-4 space-y-6 pt-4">
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-xl md:text-2xl font-bold text-foreground">
                        {t("countryEsimPackages").replace("{country}", t(`country_${countryCode}`))}
                    </h1>
                </div>

                {/* Minimal Filters - Horizontal Scroll */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 md:mx-0 md:px-0">
                    <button
                        onClick={() => {
                            setDurationFilter(null);
                            setIsUnlimitedFilter(false);
                            setTypeFilter(null);
                        }}
                        className={cn(
                            "px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border",
                            !durationFilter && !isUnlimitedFilter && !typeFilter
                                ? "bg-slate-900 text-white border-slate-900 shadow-md dark:bg-white dark:text-slate-900"
                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                        )}
                    >
                        {t("all")}
                    </button>

                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 self-center mx-1" />

                    {/* Type Filters */}
                    <button
                        onClick={() => setTypeFilter(typeFilter === "new" ? null : "new")}
                        className={cn(
                            "px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border",
                            typeFilter === "new"
                                ? "bg-red-600 text-white border-red-600 shadow-md"
                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                        )}
                    >
                        {t("newEsim")}
                    </button>

                    <button
                        onClick={() => setTypeFilter(typeFilter === "topup" ? null : "topup")}
                        className={cn(
                            "px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border",
                            typeFilter === "topup"
                                ? "bg-amber-500 text-white border-amber-500 shadow-md"
                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                        )}
                    >
                        {t("topUp")}
                    </button>

                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 self-center mx-1" />

                    <button
                        onClick={() => setDurationFilter(durationFilter === "short" ? null : "short")}
                        className={cn(
                            "px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border",
                            durationFilter === "short"
                                ? "bg-blue-600 text-white border-blue-600 shadow-md"
                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                        )}
                    >
                        {t("duration1_7")}
                    </button>

                    <button
                        onClick={() => setDurationFilter(durationFilter === "medium" ? null : "medium")}
                        className={cn(
                            "px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border",
                            durationFilter === "medium"
                                ? "bg-purple-600 text-white border-purple-600 shadow-md"
                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                        )}
                    >
                        {t("duration8_15")}
                    </button>

                    <button
                        onClick={() => setDurationFilter(durationFilter === "long" ? null : "long")}
                        className={cn(
                            "px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border",
                            durationFilter === "long"
                                ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                        )}
                    >
                        {t("duration15Plus")}
                    </button>

                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 self-center mx-1" />

                    <button
                        onClick={() => setIsUnlimitedFilter(!isUnlimitedFilter)}
                        className={cn(
                            "flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border",
                            isUnlimitedFilter
                                ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                        )}
                    >
                        ∞ {t("unlimited")}
                    </button>
                </div>

                {/* Results Info */}
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        {t("packagesFound").replace("{count}", `${displayedPackages.length} / ${filteredPackages.length}`)}
                    </p>
                </div>

                {/* Grid Layout */}
                {filteredPackages.length > 0 ? (
                    <>
                        <motion.div
                            layout
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                        >
                            <AnimatePresence>
                                {displayedPackages.map(pkg => (
                                    <motion.div
                                        key={pkg.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <PackageCard {...pkg} />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>

                        {/* Load More Trigger */}
                        {hasMore && (
                            <div
                                ref={loadMoreRef}
                                className="flex items-center justify-center py-8"
                            >
                                {isLoadingMore ? (
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        <span className="text-sm">{t("loadingMore")}</span>
                                    </div>
                                ) : (
                                    <div className="text-sm text-slate-400">
                                        {t("scrollMore")}
                                    </div>
                                )}
                            </div>
                        )}

                        {!hasMore && displayedPackages.length > 0 && (
                            <div className="text-center py-4 text-sm text-slate-400">
                                {t("allPackagesShown").replace("{count}", filteredPackages.length.toString())}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground space-y-4">
                        <div className="text-4xl">🔍</div>
                        <p>{t("noPackagesMatch")}</p>
                        <button
                            onClick={() => {
                                setDurationFilter(null);
                                setIsUnlimitedFilter(false);
                            }}
                            className="text-red-600 font-bold hover:underline"
                        >
                            {t("clearFilters")}
                        </button>
                    </div>
                )}
            </div >
        </>
    );
}
