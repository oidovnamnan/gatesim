"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PackageCard, PackageCardCompact } from "@/components/packages/package-card";
import { popularCountries } from "@/config/site";
import { cn } from "@/lib/utils";

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

export default function PackagesClient({ initialPackages }: PackagesClientProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const [sortBy, setSortBy] = useState<SortOption>("popular");
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
    const [selectedDuration, setSelectedDuration] = useState<string | null>(null); // "short" | "medium" | "long"

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
            // Smart grouping: If checking specific country, ignore regional differences
            // This ensures "China Only" ($4.49) and "Asia (inc. China)" ($5.49) are duplicates for "China 3GB 5Days"
            // and we keep the cheapest one.
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
                if (pkg.validityDays === -1) return true; // Keep unlimited if fitting context
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
                // If this is a regional package (covers multiple countries) and was matched by filter
                if (pkg.countries.length > 1 && pkg.countries.includes(selectedCountry)) {
                    // Reorder countries to put selected country first (for correct flag display)
                    const reorderedCountries = [
                        selectedCountry,
                        ...pkg.countries.filter(c => c !== selectedCountry)
                    ];

                    return {
                        ...pkg,
                        countries: reorderedCountries,
                        countryName: selectedCountryName,
                        title: `${selectedCountryName} + ${pkg.countries.length - 1} улс` // e.g., "Хятад + 3 улс"
                    };
                }
                return pkg;
            });
        }

        return packages;
    }, [initialPackages, searchQuery, selectedCountry, selectedDuration, sortBy]);

    return (
        <div className="min-h-screen pb-24 md:pb-8 bg-[#F4F7FC]/50">
            {/* Header - Mobile Only (Desktop uses TopHeader from layout) */}
            <div className="md:hidden bg-white/30 backdrop-blur-md sticky top-0 z-40 border-b border-white/20 shadow-sm">
                <div className="h-14 flex items-center justify-center relative px-4">
                    <h1 className="text-lg font-bold text-slate-900 drop-shadow-sm">Багцууд</h1>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="sticky top-14 md:top-0 z-30 bg-white/60 backdrop-blur-xl px-4 py-3 border-b border-white/20 shadow-sm space-y-3">
                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Улс, багц хайх..."
                            className="w-full pl-4 pr-10 py-2.5 bg-white/40 border border-white/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 backdrop-blur-sm placeholder:text-slate-500"
                        />
                        <Filter className="absolute right-3 top-2.5 h-5 w-5 text-slate-400" />
                    </div>
                </div>

                {/* Duration Filters */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    <button
                        onClick={() => setSelectedDuration(null)}
                        className={cn(
                            "px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border",
                            !selectedDuration
                                ? "bg-slate-800 text-white border-slate-800 shadow-md"
                                : "bg-white/40 text-slate-600 border-white/50 hover:bg-white/60"
                        )}
                    >
                        Бүгд
                    </button>
                    <button
                        onClick={() => setSelectedDuration("short")}
                        className={cn(
                            "px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border",
                            selectedDuration === "short"
                                ? "bg-blue-600 text-white border-blue-600 shadow-md"
                                : "bg-white/40 text-slate-600 border-white/50 hover:bg-white/60"
                        )}
                    >
                        1-7 хоног
                    </button>
                    <button
                        onClick={() => setSelectedDuration("medium")}
                        className={cn(
                            "px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border",
                            selectedDuration === "medium"
                                ? "bg-purple-600 text-white border-purple-600 shadow-md"
                                : "bg-white/40 text-slate-600 border-white/50 hover:bg-white/60"
                        )}
                    >
                        8-15 хоног
                    </button>
                    <button
                        onClick={() => setSelectedDuration("long")}
                        className={cn(
                            "px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border",
                            selectedDuration === "long"
                                ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
                                : "bg-white/40 text-slate-600 border-white/50 hover:bg-white/60"
                        )}
                    >
                        15+ хоног
                    </button>
                </div>

                {/* Country Filters - Horizontal Scroll */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    <button
                        onClick={() => setSelectedCountry(null)}
                        className={cn(
                            "flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border",
                            !selectedCountry
                                ? "bg-red-600 text-white border-red-600 shadow-lg shadow-red-500/20"
                                : "bg-white/40 text-slate-600 border-white/50 hover:bg-white/60"
                        )}
                    >
                        Бүх улс
                    </button>
                    {popularCountries.map((country) => (
                        <button
                            key={country.code}
                            onClick={() => setSelectedCountry(country.code)}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border",
                                selectedCountry === country.code
                                    ? "bg-slate-800 text-white border-slate-800 shadow-lg"
                                    : "bg-white/40 text-slate-600 border-white/50 hover:bg-white/60"
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
                    <p className="text-sm text-slate-500 font-medium pl-1">
                        {filteredPackages.length} багц олдлоо
                    </p>

                    {/* View Mode Toggle */}
                    <div className="flex bg-white/40 rounded-lg p-0.5 border border-white/50">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={cn(
                                "p-1.5 rounded-md transition-all",
                                viewMode === "grid" ? "bg-white shadow-sm text-slate-900" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={cn(
                                "p-1.5 rounded-md transition-all",
                                viewMode === "list" ? "bg-white shadow-sm text-slate-900" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                        </button>
                    </div>
                </div>

                <AnimatePresence mode="popLayout">
                    {viewMode === "grid" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredPackages.map((pkg) => (
                                <motion.div
                                    key={pkg.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <PackageCard {...pkg} className="bg-white/60 border-white/60 shadow-sm" />
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredPackages.map((pkg) => (
                                <motion.div
                                    key={pkg.id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <PackageCardCompact {...pkg} />
                                </motion.div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>

                {filteredPackages.length === 0 && (
                    <div className="text-center py-12">
                        <div className="bg-white/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/50">
                            <Search className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-1">Багц олдсонгүй</h3>
                        <p className="text-slate-500 text-sm">Хайлт эсвэл шүүлтүүрээ өөрчлөөд үзнэ үү.</p>
                        <Button
                            variant="ghost"
                            className="text-red-600 mt-2 hover:bg-red-50 hover:text-red-700"
                            onClick={() => {
                                setSearchQuery("");
                                setSelectedCountry(null);
                                setSelectedDuration(null);
                            }}
                        >
                            Шүүлтүүр цэвэрлэх
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
