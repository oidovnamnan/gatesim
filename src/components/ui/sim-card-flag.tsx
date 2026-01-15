"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { cn, getCountryFlag } from "@/lib/utils";

interface SimCardFlagProps {
    countryCode: string;
    size?: "sm" | "md" | "lg";
    className?: string;
}

const sizeConfig = {
    sm: {
        width: 80, height: 50, // Standard small
        chipSize: 12, chipX: 58, chipY: 18,
        outlinePadding: 2, outlineRadius: 3, outlineWidth: 1
    },
    md: {
        width: 120, height: 75, // Standard medium (3:2 approx)
        chipSize: 18, chipX: 95, chipY: 28,
        outlinePadding: 2, outlineRadius: 4, outlineWidth: 1
    },
    lg: {
        width: 180, height: 112,
        chipSize: 32, chipX: 145, chipY: 42,
        outlinePadding: 3, outlineRadius: 6, outlineWidth: 1.5
    },
};

// Comprehensive mapping for all localized names to ISO codes
const COUNTRY_MAP: Record<string, string> = {
    "UK": "GB",
    "EUROPE": "EU",
    "GLOBAL": "UN",
    "WORLD": "UN",
    "ASIA": "UN",
    "AMERIKA": "US",
    "AMERICA": "US",
    "AUSTRALIA": "AU",
    "AUSTRIA": "AT",
    "TUNISIA": "TN",
    "SINGAPORE": "SG",
    "VIETNAM": "VN",
    "TURKEY": "TR",
    "TURKIYE": "TR",
    "MONGOLIA": "MN",
    "KOREA": "KR",
    "JAPAN": "JP",
    "CHINA": "CN",
    "THAILAND": "TH",
    // Mongol names - Critical for app data
    "ЯПОН": "JP",
    "СОЛОНГОС": "KR",
    "ХЯТАД": "CN",
    "ТАЙЛАНД": "TH",
    "АМЕРИК": "US",
    "СИНГАПУР": "SG",
    "ВЬЕТНАМ": "VN",
    "ТУРК": "TR",
    "ГЕРМАН": "DE",
    "ФРАНЦ": "FR",
    "АВСТРАЛИ": "AU",
    "КАНАД": "CA",
    "АНГЛИ": "GB",
    "ИТАЛИ": "IT",
    "МАКАО": "MO",
    "ИСПАНИ": "ES",
    "ШВЕЙЦАР": "CH",
    "ШВЕД": "SE",
    "ГОЛЛАНД": "NL",
    "ИНДОНЕЗИ": "ID",
    "МАЛАЙЗ": "MY",
    "ФИЛИППИН": "PH",
    "ЭНЭТХЭГ": "IN",
};

export function SimCardFlag({ countryCode, size = "md", className }: SimCardFlagProps) {
    const config = sizeConfig[size];
    const [imageError, setImageError] = useState(false);

    const normalizedCode = useMemo(() => {
        if (!countryCode) return "un";
        const input = countryCode.toUpperCase().trim();

        // Check map first
        if (COUNTRY_MAP[input]) return COUNTRY_MAP[input].toLowerCase();

        // If 2 chars, assume ISO
        if (input.length === 2) return input.toLowerCase();

        return "un";
    }, [countryCode]);

    // Back to reliable FlagCDN SVGs
    // These are vector-based and always straight/flat
    const flagUrl = `https://flagcdn.com/${normalizedCode}.svg`;

    return (
        <div
            className={cn(
                "relative overflow-hidden group/sim bg-slate-100", // Restored bg for safety
                "shadow-lg shadow-black/20", // Softer, more natural shadow
                className
            )}
            style={{
                width: config.width,
                height: config.height,
                borderRadius: config.width * 0.08, // Standard SIM roundness
            }}
        >
            {/* Flag Image - Standard reliable fill */}
            {!imageError ? (
                <div className="absolute inset-0 w-full h-full">
                    <Image
                        src={flagUrl}
                        alt={`${countryCode}`}
                        fill
                        className="object-cover"
                        sizes={`${config.width * 2}px`}
                        loading="lazy" // Strict lazy loading
                        onError={() => setImageError(true)}
                    />
                </div>
            ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-200">
                    <span className="text-2xl opacity-50">
                        {getCountryFlag(countryCode)}
                    </span>
                </div>
            )}

            {/* Premium Overlays - Restored to original subtle values */}
            <div className="absolute inset-0 bg-black/5 pointer-events-none" />

            {/* White outline - Restored as it provides good contrast */}
            <div
                className="absolute pointer-events-none z-10"
                style={{
                    left: config.chipX - config.outlinePadding,
                    top: config.chipY - config.outlinePadding,
                    width: config.chipSize + config.outlinePadding * 2,
                    height: config.chipSize * 0.85 + config.outlinePadding * 2,
                    borderRadius: config.outlineRadius,
                    border: '1px solid rgba(255, 255, 255, 0.6)',
                }}
            />

            {/* Golden Chip - Standard */}
            <div
                className="absolute z-20"
                style={{
                    left: config.chipX,
                    top: config.chipY,
                    width: config.chipSize,
                    height: config.chipSize * 0.85,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #f5e6a3 0%, #d4af37 100%)',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                }}
            >
                {/* Simple tech lines */}
                <div className="absolute inset-0 opacity-30 flex flex-col justify-center">
                    <div className="w-full h-[1px] bg-black mb-[2px]" />
                    <div className="w-full h-[1px] bg-black mt-[2px]" />
                </div>
            </div>

            {/* Sheen */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'linear-gradient(120deg, rgba(255,255,255,0.3) 0%, transparent 40%)',
                }}
            />
        </div>
    );
}

// Minimal fallback for simple usage
export function SimCardFlagEmoji({
    flag,
    size = "md",
    className
}: {
    flag: string;
    size?: "sm" | "md" | "lg";
    className?: string;
}) {
    const config = sizeConfig[size];
    return (
        <div
            className={cn(
                "relative overflow-hidden flex items-center justify-center shadow-lg bg-white",
                className
            )}
            style={{
                width: config.width,
                height: config.height,
                borderRadius: config.width * 0.08,
            }}
        >
            <span className="select-none" style={{ fontSize: config.height * 0.7 }}>
                {flag}
            </span>
        </div>
    );
}
