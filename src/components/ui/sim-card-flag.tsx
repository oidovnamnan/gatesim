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
        width: 80, height: 54,
        chipSize: 12, chipX: 52, chipY: 18,
        outlinePadding: 2, outlineRadius: 3, outlineWidth: 1
    },
    md: {
        width: 120, height: 80,
        chipSize: 18, chipX: 85, chipY: 28,
        outlinePadding: 2, outlineRadius: 4, outlineWidth: 1
    },
    lg: {
        width: 180, height: 120,
        chipSize: 32, chipX: 130, chipY: 42,
        outlinePadding: 3, outlineRadius: 6, outlineWidth: 1.5
    },
};

// Comprehensive mapping to handle ALL variants found in the app data
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
};

export function SimCardFlag({ countryCode, size = "md", className }: SimCardFlagProps) {
    const config = sizeConfig[size];
    const [imageError, setImageError] = useState(false);

    const normalizedCode = useMemo(() => {
        const input = countryCode?.toUpperCase().trim() || "UN";
        if (COUNTRY_MAP[input]) return COUNTRY_MAP[input].toLowerCase();
        // If it's already a 2-letter code, use it
        if (input.length === 2) return input.toLowerCase();
        return "un";
    }, [countryCode]);

    // Using FlagCDN SVG - Guaranteed FLAT and High Resolution
    const flagUrl = `https://flagcdn.com/${normalizedCode}.svg`;

    const outlineWidth = config.chipSize + config.outlinePadding * 2;
    const outlineHeight = config.chipSize * 0.85 + config.outlinePadding * 2;
    const outlineX = config.chipX - config.outlinePadding;
    const outlineY = config.chipY - config.outlinePadding;

    return (
        <div
            className={cn(
                "relative overflow-hidden group/sim transition-all duration-300",
                "shadow-2xl shadow-black/40 bg-zinc-800",
                className
            )}
            style={{
                width: config.width,
                height: config.height,
                borderRadius: config.width * 0.1,
            }}
        >
            {/* Flag Background - Forced full cover using negative inset */}
            {!imageError ? (
                <div className="absolute inset-[-2px] w-[calc(100%+4px)] h-[calc(100%+4px)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={flagUrl}
                        alt={`${countryCode} flag`}
                        className="w-full h-full object-cover scale-[1.05] group-hover/sim:scale-[1.15] transition-transform duration-700"
                        style={{ objectPosition: 'center' }}
                        onError={() => setImageError(true)}
                    />
                </div>
            ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                    <span className="text-white/50 font-bold text-[10px] uppercase">
                        {normalizedCode}
                    </span>
                </div>
            )}

            {/* Premium overlays */}
            <div className="absolute inset-0 bg-black/5 pointer-events-none" />

            {/* Golden Chip - Small and Clean */}
            <div
                className="absolute z-20"
                style={{
                    left: config.chipX,
                    top: config.chipY,
                    width: config.chipSize,
                    height: config.chipSize * 0.85,
                    borderRadius: 1.5,
                    background: 'linear-gradient(135deg, #f5e6a3 0%, #d4af37 40%, #b8860b 100%)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                    overflow: 'hidden'
                }}
            >
                {/* Visual detail on chip */}
                <div className="absolute inset-x-0 top-[20%] bottom-[20%] border-y-[0.5px] border-black/10" />
                <div className="absolute inset-y-0 left-[20%] right-[20%] border-x-[0.5px] border-black/10" />
            </div>

            {/* Glossy Reflection */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 40%)',
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
