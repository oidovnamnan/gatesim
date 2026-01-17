"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Wifi, Clock, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SimCardFlag } from "@/components/ui/sim-card-flag";
import { cn, getCountryFlag } from "@/lib/utils";
import { useTranslation } from "@/providers/language-provider";

// Map country codes to MULTIPLE placeholder images for variety
const countryImageCollections: Record<string, string[]> = {
    JP: [ // Japan
        "https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=2070&auto=format&fit=crop", // Tokyo Tower
        "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070&auto=format&fit=crop", // Osaka
        "https://images.unsplash.com/photo-1528360983277-13d9012356ee?q=80&w=2070&auto=format&fit=crop", // Bamboo Forest
        "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?q=80&w=2070&auto=format&fit=crop", // Cherry Blossom
        "https://images.unsplash.com/photo-1492571350019-22de08371fd3?q=80&w=2053&auto=format&fit=crop", // Mt Fuji
    ],
    KR: [ // Korea
        "https://images.unsplash.com/photo-1517154421773-0529f29ea451?q=80&w=2070&auto=format&fit=crop", // Shrine
        "https://images.unsplash.com/photo-1538485399081-7191377e8241?q=80&w=2074&auto=format&fit=crop", // Seoul Tower
        "https://images.unsplash.com/photo-1627883391290-0e9e46261561?q=80&w=2070&auto=format&fit=crop", // Traditional Village
        "https://images.unsplash.com/photo-1580227974556-9632eb98b0a5?q=80&w=2069&auto=format&fit=crop", // City Night
    ],
    CN: [ // China
        "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=2070&auto=format&fit=crop", // Great Wall
        "https://images.unsplash.com/photo-1548622112-c28b6d396a84?q=80&w=2070&auto=format&fit=crop", // Shanghai
        "https://images.unsplash.com/photo-1512100356356-de1b84283e18?q=80&w=2075&auto=format&fit=crop", // Traditional Architecture
        "https://images.unsplash.com/photo-1531102981985-78833446979e?q=80&w=2072&auto=format&fit=crop", // Mountains
    ],
    TH: [ // Thailand
        "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=2079&auto=format&fit=crop", // Temple
        "https://images.unsplash.com/photo-1506665531195-3566af0702b7?q=80&w=2076&auto=format&fit=crop", // Beach
        "https://images.unsplash.com/photo-1563492065599-3520f775eeed?q=80&w=2070&auto=format&fit=crop", // Bangkok
        "https://images.unsplash.com/photo-1596700813292-0b29ce45f342?q=80&w=2070&auto=format&fit=crop", // Food Market
    ],
    US: [ // USA
        "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?q=80&w=2089&auto=format&fit=crop", // Golden Gate
        "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?q=80&w=2099&auto=format&fit=crop", // NYC
        "https://images.unsplash.com/photo-1471343750058-2928399589d8?q=80&w=2028&auto=format&fit=crop", // Yosemite
    ],
    SG: [ // Singapore
        "https://images.unsplash.com/photo-1565967511849-76a60a516170?q=80&w=2071&auto=format&fit=crop", // Marina Bay
        "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=2052&auto=format&fit=crop", // Gardens by the Bay
    ],
    VN: [ // Vietnam
        "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=2070&auto=format&fit=crop", // Ha Long Bay
        "https://images.unsplash.com/photo-1557750255-c76072a7bb56?q=80&w=2070&auto=format&fit=crop", // Hoi An
    ],
    TR: [ // Turkey
        "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=2071&auto=format&fit=crop", // Cappadocia
        "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?q=80&w=2060&auto=format&fit=crop", // Istanbul
    ],
    AU: [ // Australia
        "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?q=80&w=2030&auto=format&fit=crop", // Sydney Opera
        "https://images.unsplash.com/photo-1529108190281-9a4f620bc2d8?q=80&w=2039&auto=format&fit=crop", // Outback
    ],
    AT: [ // Austria
        "https://images.unsplash.com/photo-1516550893923-42d28e5677af?q=80&w=2072&auto=format&fit=crop", // Hallstatt
        "https://images.unsplash.com/photo-1520503922584-590e8f7a90d7?q=80&w=2070&auto=format&fit=crop", // Vienna
    ],
    TN: [ // Tunisia
        "https://images.unsplash.com/photo-1539659345033-b4e604ec2823?q=80&w=2070&auto=format&fit=crop", // Sidi Bou Said
        "https://images.unsplash.com/photo-1566914534439-4d6d9e0325aa?q=80&w=2070&auto=format&fit=crop", // Sahara
    ],
    EU: [ // Europe General
        "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=2070&auto=format&fit=crop", // Germany
        "https://images.unsplash.com/photo-1499856871940-a09627c6d7db?q=80&w=2020&auto=format&fit=crop", // Paris
        "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=2066&auto=format&fit=crop", // Italy
    ],
    // Switzerland - Adding dedicated images to prevent fallback issues
    CH: [
        "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=2070&auto=format&fit=crop", // Matterhorn
        "https://images.unsplash.com/photo-1527668752968-14dc70a27c95?q=80&w=2070&auto=format&fit=crop", // Swiss Alps
    ],
    // New Zealand
    NZ: [
        "https://images.unsplash.com/photo-1469521669194-babb45599def?q=80&w=2070&auto=format&fit=crop", // Milford Sound
        "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?q=80&w=2071&auto=format&fit=crop", // Hobbiton
    ],
    // Jordan
    JO: [
        "https://images.unsplash.com/photo-1579606032821-4e6161c81571?q=80&w=2070&auto=format&fit=crop", // Petra
    ],
    // Generic Fallback Images (World/Travel/Abstract) - Using more reliable images
    GENERIC: [
        "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=2070&auto=format&fit=crop", // Travel
        "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop", // Adventure
        "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop", // Mountains
    ]
};

// Map similar regions to known keys
const countryCodeAliases: Record<string, string> = {
    "UK": "GB",
    "EUROPE": "EU",
    "GLOBAL": "GENERIC"
};

// helper to safely get images
const getImageForPackage = (countryCode: string, id: string): string | null => {
    let code = countryCode?.toUpperCase().trim() || "GENERIC";

    // Check aliases
    if (countryCodeAliases[code]) code = countryCodeAliases[code];

    let images = countryImageCollections[code];

    // If specific country not found, try to find a fallback or use GENERIC
    if (!images || images.length === 0) {
        images = countryImageCollections["GENERIC"];
    }

    // If still no images, return null
    if (!images || images.length === 0) {
        return null;
    }

    // Simple hash from string id
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = ((hash << 5) - hash) + id.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
    }

    // Use positive hash modulo length
    const index = Math.abs(hash) % images.length;
    return images[index];
};

interface PackageCardProps {
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
    contextualCountry?: string;
    className?: string;
}

export function PackageCard({
    id,
    title,
    operatorTitle,
    data,
    validityDays,
    price,
    countryName,
    countries,
    isUnlimited = false,
    isPopular = false,
    isFeatured = false,
    contextualCountry,
    className,
}: PackageCardProps) {
    const { t, language } = useTranslation();
    const [imageError, setImageError] = useState(false);
    const primaryCountry = contextualCountry || countries[0];
    const flag = primaryCountry ? getCountryFlag(primaryCountry) : "🌐";

    const bgImage = !imageError && primaryCountry ? getImageForPackage(primaryCountry, id) : null;
    const isRegional = countries.length > 1;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Link href={`/package/${encodeURIComponent(id)}${contextualCountry ? `?country=${contextualCountry}` : ""}`} className="block group">
                <div
                    className={cn(
                        "relative overflow-hidden rounded-[24px] transition-all duration-300 isolate",
                        "shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-red-900/20 hover:-translate-y-1 h-[220px] flex flex-col justify-end",
                        !bgImage && "package-card border",
                        className
                    )}
                >
                    {/* Background Image - Lazy Loading */}
                    {bgImage && (
                        <>
                            <Image
                                src={bgImage}
                                alt=""
                                fill
                                sizes="(max-width: 768px) 100vw, 33vw"
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                loading="lazy"
                                unoptimized={true}
                                onError={() => setImageError(true)}
                            />
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 z-10" />
                        </>
                    )}

                    {/* Badge */}
                    <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-1.5">
                        {(isPopular || isFeatured || isRegional) && (
                            <div className="flex flex-col items-end gap-1.5">
                                {(isPopular || isFeatured) && (
                                    <Badge
                                        className={cn(
                                            "text-[10px] font-bold px-2.5 py-1 shadow-sm border-none",
                                            bgImage
                                                ? "bg-white/20 text-white border-white/20"
                                                : "bg-red-50 text-red-600 border-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900/50"
                                        )}
                                    >
                                        {isFeatured ? `✨ ${t("featured")}` : `🔥 ${t("statusActive")}`}
                                    </Badge>
                                )}
                                {isRegional && (
                                    <Badge
                                        className={cn(
                                            "text-[10px] font-bold px-2.5 py-1 shadow-sm border-none",
                                            bgImage
                                                ? "bg-blue-500/30 text-blue-50 border-blue-500/20"
                                                : "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-900/50"
                                        )}
                                    >
                                        🌍 {t("regional")}
                                    </Badge>
                                )}
                            </div>
                        )}

                        {/* Special China Badge */}
                        {countries.includes("CN") && (
                            <Badge
                                className={cn(
                                    "text-[10px] font-bold px-2.5 py-1 shadow-sm border-none flex items-center gap-1",
                                    bgImage
                                        ? "bg-emerald-500/20 text-emerald-100 border-emerald-500/20"
                                        : "bg-emerald-50 text-emerald-600 border-emerald-100"
                                )}
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                {t("vpnIncluded")}
                            </Badge>
                        )}
                    </div>

                    {/* Content */}
                    <div className={cn("p-5 relative z-20", bgImage ? "text-white" : "package-card-text")}>
                        {/* Header with SIM Card Flag */}
                        <div className="flex items-center gap-4 mb-4">
                            {/* SIM Card Flag */}
                            <SimCardFlag
                                countryCode={primaryCountry}
                                size="md"
                                className="mt-3"
                            />
                            <div className="flex-1 min-w-0">
                                <h3 className={cn(
                                    "text-lg font-black tracking-tight leading-tight",
                                    bgImage ? "text-white" : "package-card-text"
                                )}>
                                    {isRegional && contextualCountry
                                        ? `${t(`country_${contextualCountry}`)} ${t("plusCountries").replace("{count}", (countries.length - 1).toString())}`
                                        : (t(`country_${primaryCountry}`) !== `country_${primaryCountry}` ? t(`country_${primaryCountry}`) : (countryName || title))}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <p className={cn(
                                        "text-xs font-medium truncate",
                                        bgImage ? "text-white/70" : "opacity-70"
                                    )}>
                                        {operatorTitle}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Specs */}
                        <div className="flex items-center gap-2 mb-4">
                            <div className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border",
                                bgImage ? "bg-white/10 border-white/20 text-white" : "package-badge"
                            )}>
                                <Wifi className="w-3.5 h-3.5 opacity-70" />
                                <span className="text-sm font-bold">{data}</span>
                            </div>
                            <div className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border",
                                bgImage ? "bg-white/10 border-white/20 text-white" : "package-badge"
                            )}>
                                <Clock className="w-3.5 h-3.5 opacity-70" />
                                <span className="text-sm font-bold">{validityDays} {t("day")}</span>
                            </div>
                        </div>

                        {/* Footer / Price */}
                        <div className="flex items-center justify-between pt-3 border-t border-white/10 dark:border-white/5 relative z-20">
                            <div>
                                <p className={cn("text-xs font-semibold line-through opacity-60 mb-0.5", bgImage ? "text-white" : "package-card-text opacity-50")}>
                                    ₮{(price + 5000).toLocaleString()}
                                </p>
                                <p className={cn("text-xl font-black", bgImage ? "text-white" : "package-card-text")}>
                                    ₮{price.toLocaleString()}
                                </p>
                            </div>
                            {/* Action Button */}
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                                bgImage
                                    ? "bg-white text-slate-900 group-hover:bg-red-500 group-hover:text-white group-hover:scale-110"
                                    : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 group-hover:bg-red-600 group-hover:scale-110"
                            )}>
                                <ArrowRight className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

// Compact version remains largely the same but with refined styling
export function PackageCardCompact({
    id,
    title,
    data,
    validityDays,
    price,
    countryName,
    countries,
    contextualCountry,
    className,
}: PackageCardProps) {
    const { t, language } = useTranslation();
    const primaryCountry = contextualCountry || countries[0];
    const flag = primaryCountry ? getCountryFlag(primaryCountry) : "🌐";
    const isRegional = countries.length > 1;

    return (
        <Link href={`/package/${encodeURIComponent(id)}${contextualCountry ? `?country=${contextualCountry}` : ""}`} className={cn("block group", className)}>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all hover:bg-slate-50 hover:border-red-200/50">
                <div className="flex items-center gap-3">
                    {/* Render SimCardFlag instead of Emoji container */}
                    <SimCardFlag countryCode={primaryCountry} size="sm" className="shrink-0" />

                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                            <h4 className="font-bold text-slate-900 text-sm truncate pr-2 group-hover:text-red-700 transition-colors">
                                {isRegional && contextualCountry
                                    ? `${t(`country_${contextualCountry}`)} ${t("plusCountries").replace("{count}", (countries.length - 1).toString())}`
                                    : (t(`country_${primaryCountry}`) !== `country_${primaryCountry}` ? t(`country_${primaryCountry}`) : (countryName || title))}
                            </h4>
                            <p className="font-black text-slate-900 text-sm whitespace-nowrap">₮{price.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                            <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                                <span className="bg-red-50 border border-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">{data}</span>
                                <span className="text-slate-300">•</span>
                                <span>{validityDays} {t("day")}</span>

                                {isRegional && (
                                    <>
                                        <span className="text-slate-300">•</span>
                                        <span className="text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                                            {t("regional")}
                                        </span>
                                    </>
                                )}

                                {/* VPN Badge for Compact View */}
                                {countries.includes("CN") && (
                                    <>
                                        <span className="text-slate-300">•</span>
                                        <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 font-bold">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            {t("vpnIncluded")}
                                        </span>
                                    </>
                                )}
                            </div>

                            {/* Mini Flags for list view regional packages */}
                            {isRegional && (
                                <div className="flex -space-x-1 ml-2">
                                    {countries.filter(c => c !== primaryCountry).slice(0, 3).map(c => (
                                        <div key={c} className="w-4 h-4 rounded-full bg-slate-100 border border-white flex items-center justify-center text-[8px] leading-none shadow-sm" title={c}>
                                            {getCountryFlag(c)}
                                        </div>
                                    ))}
                                    {countries.length > 4 && (
                                        <div className="w-4 h-4 rounded-full bg-slate-900 text-[white] text-[6px] font-bold flex items-center justify-center border border-white shadow-sm">
                                            +{countries.length - 4}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
