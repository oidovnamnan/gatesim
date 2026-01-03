"use client";

import { useState, useMemo } from "react";
import { PackageCard } from "@/components/packages/package-card";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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
}

export function CountryPackagesList({ packages }: Props) {
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
        <div className="space-y-6">
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
                    Бүгд
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
                    1-7 хоног
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
                    8-15 хоног
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
                    15+ хоног
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
                    ∞ Хязгааргүй
                </button>
            </div>

            {/* Results Info */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Нийт <span className="font-bold text-foreground">{filteredPackages.length}</span> багц олдлоо
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
                    <p>Сонгосон шүүлтүүрт тохирох багц олдсонгүй.</p>
                    <button
                        onClick={() => {
                            setDurationFilter(null);
                            setIsUnlimitedFilter(false);
                        }}
                        className="text-red-600 font-bold hover:underline"
                    >
                        Шүүлтүүр арилгах
                    </button>
                </div>
            )}
        </div>
    );
}
