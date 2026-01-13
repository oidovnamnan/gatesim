"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PackageCard, PackageCardCompact } from "@/components/packages/package-card";
import { popularCountries } from "@/config/site";
import { cn } from "@/lib/utils";
import { useInView } from "react-intersection-observer";
import { useTranslation } from "@/providers/language-provider";
import { useSearchParams } from "next/navigation";

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
    isPopular?: boolean;
    isFeatured?: boolean;
}

interface PackagesClientProps {
    initialPackages: Package[];
}

type ViewMode = "grid" | "list";
type SortOption = "price-asc" | "price-desc" | "popular";

// Number of packages to show per page
const PACKAGES_PER_PAGE = 20;

export default function PackagesClient({ initialPackages }: PackagesClientProps) {
    const { t } = useTranslation();
    const searchParams = useSearchParams();

    const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
    const [viewMode, setViewMode] = useState<ViewMode>("list");
    const [sortBy, setSortBy] = useState<SortOption>("price-asc");
    const [selectedCountry, setSelectedCountry] = useState<string | null>(searchParams.get("country")?.toUpperCase() || null);

    // Parse duration from URL (short, medium, long)
    const urlDuration = searchParams.get("duration");
    const [selectedDuration, setSelectedDuration] = useState<string | null>(
        (urlDuration === "short" || urlDuration === "medium" || urlDuration === "long") ? urlDuration : null
    );

    // Infinite scroll state
    const [displayCount, setDisplayCount] = useState(PACKAGES_PER_PAGE);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // Intersection observer for infinite scroll
    const { ref: loadMoreRef, inView } = useInView({
        threshold: 0,
        rootMargin: "100px",
    });

    // Synchronize state with URL parameters
    useEffect(() => {
        const country = searchParams.get("country");
        const duration = searchParams.get("duration");

        if (country) {
            setSelectedCountry(country.toUpperCase());
        }
        if (duration && (duration === "short" || duration === "medium" || duration === "long")) {
            setSelectedDuration(duration);
        }
    }, [searchParams]);

    const filteredPackages = useMemo(() => {
        let packages = [...initialPackages];

        // 1. Filter by country first (to enable smart deduplication)
        if (selectedCountry) {
            packages = packages.filter((pkg) =>
                pkg.countries.includes(selectedCountry)
            );
        }

        // 2. Deduplicate: Group by relevant scope+data+duration, keep only the cheapest
        const packageGroups = new Map<string, Package>();
        packages.forEach(pkg => {
            let scopeKey = selectedCountry ? selectedCountry : [...pkg.countries].sort().join(",");
            const key = `${scopeKey}-${pkg.data}-${pkg.validityDays}`;

            const existing = packageGroups.get(key);
            if (!existing || pkg.price < existing.price) {
                packageGroups.set(key, pkg);
            }
        });
        packages = Array.from(packageGroups.values());

        // 3. Filter by search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            packages = packages.filter(
                (pkg) =>
                    pkg.countryName?.toLowerCase().includes(query) ||
                    pkg.title.toLowerCase().includes(query) ||
                    pkg.operatorTitle.toLowerCase().includes(query)
            );
        }

        // 4. Filter by duration
        if (selectedDuration) {
            packages = packages.filter((pkg) => {
                if (pkg.validityDays === -1) return true;
                if (selectedDuration === "short") return pkg.validityDays <= 7;
                if (selectedDuration === "medium") return pkg.validityDays > 7 && pkg.validityDays <= 15;
                if (selectedDuration === "long") return pkg.validityDays > 15;
                return true;
            });
        }

        // Sort
        switch (sortBy) {
            case "price-asc":
                packages.sort((a, b) => a.price - b.price);
                break;
            case "price-desc":
                packages.sort((a, b) => b.price - a.price);
                break;
            case "popular":
                packages.sort((a, b) => {
                    if (a.isPopular && !b.isPopular) return -1;
                    if (!a.isPopular && b.isPopular) return 1;
                    if (a.isFeatured && !b.isFeatured) return -1;
                    if (!a.isFeatured && b.isFeatured) return 1;
                    return 0;
                });
                break;
        }

        // If filtering by country, override countryName for regional packages
        if (selectedCountry) {
            const selectedCountryInfo = popularCountries.find(c => c.code === selectedCountry);
            const selectedCountryName = selectedCountryInfo?.name || selectedCountry;

            packages = packages.map(pkg => {
                if (pkg.countries.length > 1 && pkg.countries.includes(selectedCountry)) {
                    const reorderedCountries = [
                        selectedCountry,
                        ...pkg.countries.filter(c => c !== selectedCountry)
                    ];

                    return {
                        ...pkg,
                        countries: reorderedCountries,
                        countryName: selectedCountryName,
                        title: `${selectedCountryName} ${t("plusCountries").replace("{count}", (pkg.countries.length - 1).toString())}`
                    };
                }
                return pkg;
            });
        }

        return packages;
    }, [initialPackages, searchQuery, selectedCountry, selectedDuration, sortBy, t]);

    // Reset display count when filters change
    useEffect(() => {
        setDisplayCount(PACKAGES_PER_PAGE);
    }, [searchQuery, selectedCountry, selectedDuration, sortBy]);

    // Load more when scrolling to bottom
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

    // Packages to display (paginated)
    const displayedPackages = useMemo(() => {
        return filteredPackages.slice(0, displayCount);
    }, [filteredPackages, displayCount]);

    const hasMore = displayCount < filteredPackages.length;

    return (
        <div className="min-h-screen pb-24 md:pb-8 bg-background">
            <div className="md:hidden bg-white/30 backdrop-blur-md sticky top-0 z-40 border-b border-white/20 shadow-sm">
                <div className="h-14 flex items-center justify-center relative px-4">
                    <h1 className="text-lg font-bold text-slate-900 drop-shadow-sm">{t("packages")}</h1>
                </div>
            </div>

            <div className="sticky top-14 md:top-0 z-30 bg-background/80 backdrop-blur-xl px-4 py-3 border-b border-border shadow-sm space-y-3">
                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t("searchPackagesPlaceholder")}
                            className="w-full pl-4 pr-10 py-2.5 bg-muted border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-red-500/20 placeholder:text-muted-foreground"
                        />
                        <Filter className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    </div>
                </div>

                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    <button
                        onClick={() => setSelectedDuration(null)}
                        className={cn(
                            "px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border",
                            !selectedDuration
                                ? "bg-slate-800 text-white border-slate-800 shadow-md"
                                : "bg-muted text-foreground border-border hover:bg-accent"
                        )}
                    >
                        {t("all")}
                    </button>
                    <button
                        onClick={() => setSelectedDuration("short")}
                        className={cn(
                            "px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border",
                            selectedDuration === "short"
                                ? "bg-blue-600 text-white border-blue-600 shadow-md"
                                : "bg-muted text-foreground border-border hover:bg-accent"
                        )}
                    >
                        1-7 {t("day")}
                    </button>
                    <button
                        onClick={() => setSelectedDuration("medium")}
                        className={cn(
                            "px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border",
                            selectedDuration === "medium"
                                ? "bg-purple-600 text-white border-purple-600 shadow-md"
                                : "bg-muted text-foreground border-border hover:bg-accent"
                        )}
                    >
                        8-15 {t("day")}
                    </button>
                    <button
                        onClick={() => setSelectedDuration("long")}
                        className={cn(
                            "px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border",
                            selectedDuration === "long"
                                ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
                                : "bg-muted text-foreground border-border hover:bg-accent"
                        )}
                    >
                        15+ {t("day")}
                    </button>
                </div>

                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    <button
                        onClick={() => setSelectedCountry(null)}
                        className={cn(
                            "flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border",
                            !selectedCountry
                                ? "bg-red-600 text-white border-red-600 shadow-lg shadow-red-500/20"
                                : "bg-muted text-foreground border-border hover:bg-accent"
                        )}
                    >
                        {t("allCountries")}
                    </button>
                    {popularCountries.map((country) => (
                        <button
                            key={country.code}
                            onClick={() => setSelectedCountry(country.code)}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border",
                                selectedCountry === country.code
                                    ? "bg-slate-800 text-white border-slate-800 shadow-lg"
                                    : "bg-muted text-foreground border-border hover:bg-accent"
                            )}
                        >
                            <span className="text-sm">{country.flag}</span>
                            {country.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="px-4 py-4 space-y-4">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-foreground font-bold pl-1">
                        {t("countPackages").replace("{count}", `${displayedPackages.length} / ${filteredPackages.length}`)}
                    </p>

                    <div className="flex bg-white/50 rounded-xl p-1">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={cn(
                                "p-2 transition-all flex items-center justify-center w-9 h-9",
                                viewMode === "grid" ? "text-red-600 scale-110" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={cn(
                                "p-2 transition-all flex items-center justify-center w-9 h-9",
                                viewMode === "list" ? "text-red-600 scale-110" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                        </button>
                    </div>
                </div>

                <AnimatePresence mode="popLayout">
                    {viewMode === "grid" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {displayedPackages.map((pkg) => (
                                <motion.div
                                    key={pkg.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <PackageCard
                                        {...pkg}
                                        contextualCountry={selectedCountry || undefined}
                                        className="bg-white/60 border-white/60 shadow-sm"
                                    />
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {displayedPackages.map((pkg) => (
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
                                        contextualCountry={selectedCountry || undefined}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>

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
                    <div className="text-center py-6 text-sm text-slate-400">
                        {t("allPackagesShown").replace("{count}", filteredPackages.length.toString())}
                    </div>
                )}

                {filteredPackages.length === 0 && (
                    <div className="text-center py-12">
                        <div className="bg-white/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/50">
                            <Search className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-1">{t("noPackagesFound")}</h3>
                        <p className="text-slate-500 text-sm">{t("noPackagesDesc")}</p>
                        <Button
                            variant="ghost"
                            className="text-red-600 mt-2 hover:bg-red-50 hover:text-red-700"
                            onClick={() => {
                                setSearchQuery("");
                                setSelectedCountry(null);
                                setSelectedDuration(null);
                            }}
                        >
                            {t("clearFilters")}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
