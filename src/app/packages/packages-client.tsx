"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, Search, Loader2, Globe, Clock, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PackageCard, PackageCardCompact } from "@/components/packages/package-card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { popularCountries } from "@/config/site";
import { cn } from "@/lib/utils";
import { useInView } from "react-intersection-observer";
import { useTranslation, translations, Language } from "@/providers/language-provider";
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
    isTopUp?: boolean;
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
    const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
    const [sortBy, setSortBy] = useState<SortOption>("price-asc");
    const [selectedCountry, setSelectedCountry] = useState<string | null>(searchParams.get("country")?.toUpperCase() || null);
    const [packageType, setPackageType] = useState<"new" | "topup">(
        searchParams.get("type") === "topup" ? "topup" : "new"
    );

    // Number of packages to show per page
    const PACKAGES_PER_PAGE = 20;

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

    // Debounce search query to improve typing performance (INP fix)
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Synchronize state with URL parameters
    useEffect(() => {
        const country = searchParams.get("country");
        const duration = searchParams.get("duration");
        const type = searchParams.get("type");

        if (country) {
            setSelectedCountry(country.toUpperCase());
        }
        if (duration && (duration === "short" || duration === "medium" || duration === "long")) {
            setSelectedDuration(duration);
        }
        if (type === "topup" || type === "new") {
            setPackageType(type as "new" | "topup");
        }
    }, [searchParams]);

    const filteredPackages = useMemo(() => {
        let packages = [...initialPackages];

        // 1. Filter by Package Type (New vs Top-up)
        if (packageType === "topup") {
            packages = packages.filter(pkg => pkg.isTopUp);
        } else {
            packages = packages.filter(pkg => !pkg.isTopUp);
        }

        // 2. Filter by country first (to enable smart deduplication)
        if (selectedCountry) {
            packages = packages.filter((pkg) =>
                pkg.countries.includes(selectedCountry)
            );
        }

        // 3. Deduplicate: Group by relevant scope+data+duration, keep only the cheapest
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

        // 4. Filter by search (using debounced query for performance)
        if (debouncedQuery) {
            const query = debouncedQuery.toLowerCase();
            packages = packages.filter(
                (pkg) => {
                    const matchesTitle = pkg.title.toLowerCase().includes(query);
                    const matchesOperator = pkg.operatorTitle.toLowerCase().includes(query);
                    const matchesCountryName = pkg.countryName?.toLowerCase().includes(query);

                    // Check all associated countries in all supported languages
                    const matchesTranslatedCountries = pkg.countries.some(code => {
                        return (["mn", "en", "cn"] as Language[]).some(lang => {
                            const translated = (translations[lang] as any)[`country_${code}`]?.toLowerCase();
                            return translated && translated.includes(query);
                        });
                    });

                    return matchesTitle || matchesOperator || matchesCountryName || matchesTranslatedCountries;
                }
            );
        }

        // 5. Filter by duration
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

        // FINAL STEP: Transform data for UI (Smart Titles & Reordering)
        const activeSearch = debouncedQuery?.toLowerCase();

        return packages.map(pkg => {
            let countryToHighlight = selectedCountry;

            // If no country is selected but we are searching, check which country matched the search
            if (!countryToHighlight && activeSearch) {
                const matchingCode = pkg.countries.find(code => {
                    const translated = t(`country_${code}`).toLowerCase();
                    return translated.includes(activeSearch);
                });
                if (matchingCode) countryToHighlight = matchingCode;
            }

            if (countryToHighlight) {
                const countryKey = `country_${countryToHighlight}`;
                const highlightedCountryName = t(countryKey);
                const isExactCountryMatch = pkg.countries.length === 1 && pkg.countries[0] === countryToHighlight;

                if (!isExactCountryMatch && pkg.countries.includes(countryToHighlight)) {
                    const reorderedCountries = [
                        countryToHighlight,
                        ...pkg.countries.filter(c => c !== countryToHighlight)
                    ];

                    return {
                        ...pkg,
                        countries: reorderedCountries,
                        countryName: highlightedCountryName,
                        title: `${highlightedCountryName} ${t("plusCountries").replace("{count}", (pkg.countries.length - 1).toString())}`,
                        isFeatured: true, // Highlight in search results
                        isTopUp: pkg.isTopUp
                    };
                } else if (isExactCountryMatch) {
                    return {
                        ...pkg,
                        countryName: highlightedCountryName,
                        title: highlightedCountryName
                    };
                }
            }

            return pkg;
        });
    }, [initialPackages, debouncedQuery, selectedCountry, selectedDuration, sortBy, t, packageType]);

    // Reset display count when filters change
    useEffect(() => {
        setDisplayCount(PACKAGES_PER_PAGE);
    }, [debouncedQuery, selectedCountry, selectedDuration, sortBy, packageType]);

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
        <div className="min-h-screen pb-32 md:pb-8 bg-background">
            <div className={cn(
                "sticky top-0 z-30 bg-background/80 backdrop-blur-xl px-4 border-b border-border shadow-sm",
                "py-3 space-y-3"
            )}>
                {/* Package Type Switcher */}
                <div className="flex p-1 bg-muted rounded-xl gap-1">
                    <button
                        onClick={() => setPackageType("new")}
                        className={cn(
                            "flex-1 py-1.5 px-3 rounded-[10px] text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5",
                            packageType === "new"
                                ? "bg-white text-red-600 shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <span>✨</span> {t("newEsim")}
                    </button>
                    <button
                        onClick={() => setPackageType("topup")}
                        className={cn(
                            "flex-1 py-1.5 px-3 rounded-[10px] text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5",
                            packageType === "topup"
                                ? "bg-white text-amber-600 shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <span>🔄</span> {t("topUp")}
                    </button>
                </div>

                {/* Search bar - only show when no filters applied */}
                {!selectedCountry && !selectedDuration && (
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
                )}

                <div className="grid grid-cols-2 gap-2">
                    <Select
                        value={selectedDuration || "all"}
                        onValueChange={(v) => setSelectedDuration(v === "all" ? null : v)}
                    >
                        <SelectTrigger className="h-11 bg-muted/50 border-border rounded-xl text-xs font-bold focus:ring-red-500/20 px-3">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <Clock className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                                <span className="truncate">
                                    {selectedDuration ? t(`duration${selectedDuration === 'short' ? '1_7' : selectedDuration === 'medium' ? '8_15' : '15Plus'}`) : t("all")}
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
                        value={selectedCountry || "all"}
                        onValueChange={(v) => setSelectedCountry(v === "all" ? null : v)}
                    >
                        <SelectTrigger className="h-11 bg-muted/50 border-border rounded-xl text-xs font-bold focus:ring-red-500/20 px-3">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <Globe className="h-3.5 w-3.5 text-red-500 shrink-0" />
                                <span className="truncate">
                                    {selectedCountry ? t(`country_${selectedCountry}`) : t("allCountries")}
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

            <div className="px-4 py-4 space-y-4">
                {/* Banner Section */}
                <div className={cn(
                    "relative overflow-hidden rounded-[20px] p-6 text-white shadow-xl",
                    packageType === "new"
                        ? "bg-gradient-to-br from-red-600 via-red-500 to-rose-400"
                        : "bg-gradient-to-br from-amber-600 via-amber-500 to-orange-400"
                )}>
                    <div className="relative z-10">
                        <h2 className="text-xl font-black mb-1">{t(packageType === "new" ? "newPackagesBannerTitle" : "topUpPackagesBannerTitle")}</h2>
                        <p className="text-xs text-white/90 leading-relaxed font-medium max-w-[85%]">{t(packageType === "new" ? "newPackagesBannerDesc" : "topUpPackagesBannerDesc")}</p>
                    </div>
                    {/* Abstract Shapes for the glass look */}
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/20 rounded-full blur-2xl" />
                    <div className="absolute right-10 bottom-0 w-16 h-16 bg-white/10 rounded-full blur-xl" />
                </div>

                <div className="flex items-center justify-between">
                    <p className="text-sm text-foreground font-bold pl-1">
                        {t("packagesFound").replace("{count}", `${displayedPackages.length} / ${filteredPackages.length}`)}
                    </p>
                </div>

                <AnimatePresence mode="popLayout">
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
                    <div className="text-center py-2 text-sm text-slate-400">
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
