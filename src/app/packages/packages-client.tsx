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

const PACKAGES_PER_PAGE = 20;

export default function PackagesClient({ initialPackages }: PackagesClientProps) {
    const { t } = useTranslation();
    const searchParams = useSearchParams();

    const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
    const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
    const [sortBy, setSortBy] = useState<SortOption>(searchParams.get("sort") === "popular" ? "popular" : "price-asc");
    const [selectedCountry, setSelectedCountry] = useState<string | null>(searchParams.get("country")?.toUpperCase() || null);
    const [packageType, setPackageType] = useState<"new" | "topup">(
        searchParams.get("type") === "topup" ? "topup" : "new"
    );

    const urlDuration = searchParams.get("duration");
    const [selectedDuration, setSelectedDuration] = useState<string | null>(
        (urlDuration === "short" || urlDuration === "medium" || urlDuration === "long") ? urlDuration : null
    );

    const [displayCount, setDisplayCount] = useState(PACKAGES_PER_PAGE);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const { ref: loadMoreRef, inView } = useInView({
        threshold: 0,
        rootMargin: "100px",
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        const country = searchParams.get("country");
        const duration = searchParams.get("duration");
        const type = searchParams.get("type");

        if (country) setSelectedCountry(country.toUpperCase());
        if (duration && (duration === "short" || duration === "medium" || duration === "long")) setSelectedDuration(duration);
        if (type === "topup" || type === "new") setPackageType(type as "new" | "topup");
    }, [searchParams]);

    const filteredPackages = useMemo(() => {
        let packages = [...initialPackages];

        // 1. Strict Filter by Package Type
        if (packageType === "topup") {
            packages = packages.filter(pkg => pkg.isTopUp);
        } else {
            packages = packages.filter(pkg => !pkg.isTopUp);
        }

        // 2. Filter by country
        if (selectedCountry) {
            packages = packages.filter((pkg) => pkg.countries.includes(selectedCountry));
        }

        // 3. Deduplicate (Keep cheapest SKU for same spec)
        const packageGroups = new Map<string, Package>();
        packages.forEach(pkg => {
            const scopeKey = selectedCountry ? selectedCountry : [...pkg.countries].sort().join(",");
            const key = `${scopeKey}-${pkg.data}-${pkg.validityDays}`;
            const existing = packageGroups.get(key);
            if (!existing || pkg.price < existing.price) {
                packageGroups.set(key, pkg);
            }
        });
        packages = Array.from(packageGroups.values());

        // 4. Search
        if (debouncedQuery) {
            const query = debouncedQuery.toLowerCase();
            packages = packages.filter((pkg) => {
                const matchesTitle = pkg.title.toLowerCase().includes(query);
                const matchesOperator = pkg.operatorTitle.toLowerCase().includes(query);
                const matchesTranslatedCountries = pkg.countries.some(code => {
                    return (["mn", "en", "cn"] as Language[]).some(lang => {
                        const translated = (translations[lang] as any)[`country_${code}`]?.toLowerCase();
                        return translated && translated.includes(query);
                    });
                });
                return matchesTitle || matchesOperator || matchesTranslatedCountries;
            });
        }

        // 5. Duration
        if (selectedDuration) {
            packages = packages.filter((pkg) => {
                if (pkg.validityDays === -1) return true;
                if (selectedDuration === "short") return pkg.validityDays <= 7;
                if (selectedDuration === "medium") return pkg.validityDays > 7 && pkg.validityDays <= 15;
                if (selectedDuration === "long") return pkg.validityDays > 15;
                return true;
            });
        }

        // 6. Sort
        switch (sortBy) {
            case "price-asc": packages.sort((a, b) => a.price - b.price); break;
            case "price-desc": packages.sort((a, b) => b.price - a.price); break;
            case "popular":
                packages.sort((a, b) => {
                    if (a.isPopular && !b.isPopular) return -1;
                    if (!a.isPopular && b.isPopular) return 1;
                    if (a.isFeatured && !b.isFeatured) return -1;
                    if (!a.isFeatured && b.isFeatured) return 1;
                    return a.price - b.price;
                });
                break;
        }

        // 7. Contextual Enhancements
        return packages.map(pkg => {
            let countryToHighlight = selectedCountry;
            if (!countryToHighlight && debouncedQuery) {
                const query = debouncedQuery.toLowerCase();
                const matchingCode = pkg.countries.find(code => t(`country_${code}`).toLowerCase().includes(query));
                if (matchingCode) countryToHighlight = matchingCode;
            }

            if (countryToHighlight) {
                const highlightedCountryName = t(`country_${countryToHighlight}`);
                const isExact = pkg.countries.length === 1 && pkg.countries[0] === countryToHighlight;
                if (!isExact && pkg.countries.includes(countryToHighlight)) {
                    return {
                        ...pkg,
                        countries: [countryToHighlight, ...pkg.countries.filter(c => c !== countryToHighlight)],
                        countryName: highlightedCountryName,
                        title: `${highlightedCountryName} ${t("plusCountries").replace("{count}", (pkg.countries.length - 1).toString())}`,
                        isFeatured: true
                    };
                } else if (isExact) {
                    return { ...pkg, countryName: highlightedCountryName, title: highlightedCountryName };
                }
            }
            return pkg;
        });
    }, [initialPackages, debouncedQuery, selectedCountry, selectedDuration, sortBy, t, packageType]);

    useEffect(() => {
        setDisplayCount(PACKAGES_PER_PAGE);
    }, [debouncedQuery, selectedCountry, selectedDuration, sortBy, packageType]);

    const loadMore = useCallback(() => {
        if (displayCount >= filteredPackages.length) return;
        setIsLoadingMore(true);
        setTimeout(() => {
            setDisplayCount(prev => Math.min(prev + PACKAGES_PER_PAGE, filteredPackages.length));
            setIsLoadingMore(false);
        }, 300);
    }, [displayCount, filteredPackages.length]);

    useEffect(() => {
        if (inView && !isLoadingMore) loadMore();
    }, [inView, isLoadingMore, loadMore]);

    const displayedPackages = useMemo(() => filteredPackages.slice(0, displayCount), [filteredPackages, displayCount]);
    const hasMore = displayCount < filteredPackages.length;

    return (
        <div className="min-h-screen pb-32 md:pb-8 bg-background">
            <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl px-4 border-b border-border shadow-sm py-3 space-y-3">
                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t("searchPackagesPlaceholder")}
                            className="w-full pl-4 pr-10 py-2.5 bg-muted/50 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all font-bold"
                        />
                        <Search className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <Select value={selectedDuration || "all"} onValueChange={(v) => setSelectedDuration(v === "all" ? null : v)}>
                        <SelectTrigger className="h-11 bg-muted/50 border-border rounded-xl text-xs font-bold px-3">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <span className="truncate text-muted-foreground mr-1">Хугацаа:</span>
                                <span className="truncate">{selectedDuration ? t(`duration${selectedDuration === 'short' ? '1_7' : selectedDuration === 'medium' ? '8_15' : '15Plus'}`) : t("all")}</span>
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t("all")}</SelectItem>
                            <SelectItem value="short">{t("duration1_7")}</SelectItem>
                            <SelectItem value="medium">{t("duration8_15")}</SelectItem>
                            <SelectItem value="long">{t("duration15Plus")}</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={selectedCountry || "all"} onValueChange={(v) => setSelectedCountry(v === "all" ? null : v)}>
                        <SelectTrigger className="h-11 bg-muted/50 border-border rounded-xl text-xs font-bold px-3">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <Globe className="h-3.5 w-3.5 text-red-500 shrink-0" />
                                <span className="truncate">{selectedCountry ? t(`country_${selectedCountry}`) : t("allCountries")}</span>
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
                <div className={cn(
                    "relative overflow-hidden rounded-[20px] p-6 text-white shadow-xl",
                    packageType === "new" ? "bg-gradient-to-br from-red-600 to-rose-400" : "bg-gradient-to-br from-amber-600 to-orange-400"
                )}>
                    <div className="relative z-10">
                        <h2 className="text-xl font-black mb-1">{t(packageType === "new" ? "newPackagesBannerTitle" : "topUpPackagesBannerTitle")}</h2>
                        <p className="text-xs text-white/90 font-medium max-w-[85%]">{t(packageType === "new" ? "newPackagesBannerDesc" : "topUpPackagesBannerDesc")}</p>
                    </div>
                </div>

                <div className="flex p-1 bg-muted/50 border border-border backdrop-blur-sm rounded-xl gap-1 shadow-sm">
                    <button onClick={() => setPackageType("new")} className={cn("flex-1 py-1.5 px-3 rounded-[10px] text-xs font-bold transition-all flex items-center justify-center gap-1.5", packageType === "new" ? "bg-white text-red-600 shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                        <span>✨</span> {t("newEsim")}
                    </button>
                    <button onClick={() => setPackageType("topup")} className={cn("flex-1 py-1.5 px-3 rounded-[10px] text-xs font-bold transition-all flex items-center justify-center gap-1.5", packageType === "topup" ? "bg-white text-amber-600 shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                        <span>🔄</span> {t("topUp")}
                    </button>
                </div>

                <div className="flex items-center justify-between">
                    <p className="text-sm font-bold pl-1">{t("packagesFound").replace("{count}", `${displayedPackages.length} / ${filteredPackages.length}`)}</p>
                </div>

                <AnimatePresence mode="popLayout">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {displayedPackages.map((pkg) => (
                            <motion.div key={pkg.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <PackageCardCompact {...pkg} contextualCountry={selectedCountry || undefined} />
                            </motion.div>
                        ))}
                    </div>
                </AnimatePresence>

                {hasMore && (
                    <div ref={loadMoreRef} className="flex items-center justify-center py-8">
                        {isLoadingMore ? (
                            <div className="flex items-center gap-2 text-slate-500">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span className="text-sm">{t("loadingMore")}</span>
                            </div>
                        ) : <div className="text-sm text-slate-400 font-bold">{t("scrollMore")}</div>}
                    </div>
                )}
            </div>
        </div>
    );
}
