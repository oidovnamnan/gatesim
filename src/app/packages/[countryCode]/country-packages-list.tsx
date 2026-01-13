"use client";

import { useState, useMemo } from "react";
import { PackageCard } from "@/components/packages/package-card";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/providers/language-provider";
import { MobileHeader } from "@/components/layout/mobile-header";

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
}

interface Props {
    packages: Package[];
    countryCode: string;
}

export function CountryPackagesList({ packages, countryCode }: Props) {
    const { t } = useTranslation();
    const [durationFilter, setDurationFilter] = useState<"short" | "medium" | "long" | null>(null);
    const [isUnlimitedFilter, setIsUnlimitedFilter] = useState(false);

    const filteredPackages = useMemo(() => {
        return packages.filter(pkg => {
            // Duration Filter
            if (durationFilter === "short" && pkg.validityDays > 7) return false;
            if (durationFilter === "medium" && (pkg.validityDays <= 7 || pkg.validityDays > 15)) return false;
            if (durationFilter === "long" && pkg.validityDays <= 15) return false;

            // Unlimited Data Filter
            if (isUnlimitedFilter && !pkg.isUnlimited) return false;

            return true;
        });
    }, [packages, durationFilter, isUnlimitedFilter]);

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
                        }}
                        className={cn(
                            "px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border",
                            !durationFilter && !isUnlimitedFilter
                                ? "bg-slate-900 text-white border-slate-900 shadow-md dark:bg-white dark:text-slate-900"
                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                        )}
                    >
                        {t("all")}
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
                        {t("packagesFound").replace("{count}", filteredPackages.length.toString())}
                    </p>
                </div>

                {/* Grid Layout */}
                {filteredPackages.length > 0 ? (
                    <motion.div
                        layout
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                    >
                        <AnimatePresence>
                            {filteredPackages.map(pkg => (
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
