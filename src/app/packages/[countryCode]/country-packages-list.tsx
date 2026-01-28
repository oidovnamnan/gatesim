"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { PackageCard, PackageCardCompact } from "@/components/packages/package-card";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/providers/language-provider";
import { MobileHeader } from "@/components/layout/mobile-header";
import { useRouter } from "next/navigation";
import { useInView } from "react-intersection-observer";
import { Loader2, Clock, Search, Filter, Globe } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { popularCountries } from "@/config/site";

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
    const router = useRouter();
    const [durationFilter, setDurationFilter] = useState<"short" | "medium" | "long" | null>(null);
    const [isUnlimitedFilter, setIsUnlimitedFilter] = useState(false);
    const [typeFilter, setTypeFilter] = useState<"new" | "topup">("new");
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

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

            // Search Filter
            if (debouncedQuery) {
                const query = debouncedQuery.toLowerCase();
                return (
                    pkg.title.toLowerCase().includes(query) ||
                    pkg.operatorTitle.toLowerCase().includes(query) ||
                    pkg.data.toLowerCase().includes(query)
                );
            }

            return true;
        });
    }, [packages, durationFilter, isUnlimitedFilter, typeFilter, debouncedQuery]);

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
        <div className="bg-background min-h-screen pb-32 md:pb-8">
            {/* Sticky Filters Header */}
            <div className={cn(
                "sticky top-0 z-30 bg-background/80 backdrop-blur-xl px-4 border-b border-border shadow-sm",
                "py-3 space-y-3"
            )}>
                {/* Search within country */}
                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t("searchPackagesPlaceholder")}
                            className="w-full pl-4 pr-10 py-2.5 bg-muted/50 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-red-500/20 placeholder:text-muted-foreground transition-all"
                        />
                        <Search className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    </div>
                </div>

                {/* Filters Row */}
                <div className="grid grid-cols-2 gap-2">
                    <Select
                        value={durationFilter || "all"}
                        onValueChange={(v) => setDurationFilter(v === "all" ? null : v as any)}
                    >
                        <SelectTrigger className="h-11 bg-muted/50 border-border rounded-xl text-xs font-bold focus:ring-red-500/20 px-3">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <Clock className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                                <span className="truncate">
                                    {durationFilter ? t(`duration${durationFilter === 'short' ? '1_7' : durationFilter === 'medium' ? '8_15' : '15Plus'}`) : t("all")}
                                </span>
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t("all")}</SelectItem>
                            <SelectItem value="short">{t("duration1_7")}</SelectItem>
                            <SelectItem value="medium">{t("duration8_15")}</SelectItem>
                            <SelectItem value="long">{t("duration15Plus")}</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={countryCode || "all"}
                        onValueChange={(v) => {
                            if (v === "all") router.push("/packages");
                            else router.push(`/packages/${v}`);
                        }}
                    >
                        <SelectTrigger className="h-11 bg-muted/50 border-border rounded-xl text-xs font-bold focus:ring-red-500/20 px-3">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <Globe className="h-3.5 w-3.5 text-red-500 shrink-0" />
                                <span className="truncate">
                                    {t(`country_${countryCode}`)}
                                </span>
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t("allCountries")}</SelectItem>
                            {popularCountries.map((country) => (
                                <SelectItem key={country.code} value={country.code}>
                                    <span className="mr-2">{country.flag}</span>
                                    {t(`country_${country.code}`)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="container max-w-7xl mx-auto p-4 space-y-4 pt-4">
                {/* Banner Section */}
                <div className={cn(
                    "relative overflow-hidden rounded-[20px] p-6 text-white shadow-xl",
                    typeFilter === "topup"
                        ? "bg-gradient-to-br from-amber-600 via-amber-500 to-orange-400"
                        : "bg-gradient-to-br from-red-600 via-red-500 to-rose-400"
                )}>
                    <div className="relative z-10">
                        <h2 className="text-xl font-black mb-1">
                            {t(typeFilter === "topup" ? "topUpPackagesBannerTitle" : "newPackagesBannerTitle")}
                        </h2>
                        <p className="text-xs text-white/90 leading-relaxed font-medium max-w-[85%]">
                            {t(typeFilter === "topup" ? "topUpPackagesBannerDesc" : "newPackagesBannerDesc")}
                        </p>
                    </div>
                    {/* Abstract Shapes */}
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/20 rounded-full blur-2xl" />
                    <div className="absolute right-10 bottom-0 w-16 h-16 bg-white/10 rounded-full blur-xl" />
                </div>

                <div className="space-y-4">
                    {/* Package Type Switcher */}
                    <div className="flex p-1 bg-muted/50 border border-border backdrop-blur-sm rounded-xl gap-1 shadow-sm">
                        <button
                            onClick={() => setTypeFilter("new")}
                            className={cn(
                                "flex-1 py-1.5 px-3 rounded-[10px] text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5",
                                typeFilter !== "topup"
                                    ? "bg-white text-red-600 shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <span>✨</span> {t("newEsim")}
                        </button>
                        <button
                            onClick={() => setTypeFilter("topup")}
                            className={cn(
                                "flex-1 py-1.5 px-3 rounded-[10px] text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5",
                                typeFilter === "topup"
                                    ? "bg-white text-amber-600 shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <span>🔄</span> {t("topUp")}
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <p className="text-sm text-foreground font-bold pl-1">
                            {t("packagesFound").replace("{count}", `${displayedPackages.length} / ${filteredPackages.length}`)}
                        </p>
                    </div>
                </div>

                {/* List Layout */}
                {filteredPackages.length > 0 ? (
                    <>
                        <AnimatePresence mode="popLayout">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {displayedPackages.map(pkg => (
                                    <motion.div
                                        key={pkg.id}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <PackageCardCompact
                                            {...pkg}
                                            contextualCountry={countryCode}
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        </AnimatePresence>

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
                        <div className="bg-white/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto border border-white/50">
                            <Search className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-1">{t("noPackagesFound")}</h3>
                        <p className="text-slate-500 text-sm">{t("noPackagesMatch")}</p>
                        <button
                            onClick={() => {
                                setDurationFilter(null);
                                setIsUnlimitedFilter(false);
                                setSearchQuery("");
                            }}
                            className="text-red-600 font-bold hover:underline py-2"
                        >
                            {t("clearFilters")}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
