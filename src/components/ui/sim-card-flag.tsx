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
        width: 120, height: 80, // Substantially larger
        chipSize: 18, chipX: 85, chipY: 28,
        outlinePadding: 2, outlineRadius: 4, outlineWidth: 1
    },
    lg: {
        width: 180, height: 120,
        chipSize: 32, chipX: 130, chipY: 42,
        outlinePadding: 3, outlineRadius: 6, outlineWidth: 1.5
    },
};

// Comprehensive aliasing to ensure common non-ISO codes work with CDNs
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
};

export function SimCardFlag({ countryCode, size = "md", className }: SimCardFlagProps) {
    const config = sizeConfig[size];
    const [imageError, setImageError] = useState(false);

    const normalizedCode = useMemo(() => {
        let code = countryCode?.toUpperCase().trim() || "UN";
        if (COUNTRY_MAP[code]) code = COUNTRY_MAP[code];
        // If code is still more than 2 chars and not in map, it's likely invalid for flagcdn
        if (code.length > 2) return null;
        return code.toLowerCase();
    }, [countryCode]);

    // Using FlagCDN SVG or a secondary fallback source
    const flagUrl = normalizedCode
        ? `https://flagcdn.com/${normalizedCode}.svg`
        : null;

    const outlineWidth = config.chipSize + config.outlinePadding * 2;
    const outlineHeight = config.chipSize * 0.85 + config.outlinePadding * 2;
    const outlineX = config.chipX - config.outlinePadding;
    const outlineY = config.chipY - config.outlinePadding;

    return (
        <div
            className={cn(
                "relative overflow-hidden group/sim transition-all duration-500",
                "shadow-2xl shadow-black/40",
                className
            )}
            style={{
                width: config.width,
                height: config.height,
                borderRadius: config.width * 0.1,
            }}
        >
            {/* Flag Background - Using raw img for guaranteed fill control */}
            {!imageError && flagUrl ? (
                <div className="absolute inset-0 w-full h-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={flagUrl}
                        alt={`${countryCode} flag`}
                        className="w-full h-full object-cover scale-[1.3] group-hover/sim:scale-[1.5] transition-transform duration-700"
                        style={{ objectPosition: 'center' }}
                        onError={() => setImageError(true)}
                    />
                </div>
            ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
                    {/* Massive fallback emoji */}
                    <span
                        className="select-none leading-none scale-[4]"
                        style={{ fontSize: config.height * 0.3 }}
                    >
                        {getCountryFlag(countryCode)}
                    </span>
                </div>
            )}

            {/* Premium SIM card effects */}
            <div className="absolute inset-0 bg-black/10 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/20 pointer-events-none" />

            {/* White outline around chip */}
            <div
                className="absolute pointer-events-none z-10"
                style={{
                    left: outlineX,
                    top: outlineY,
                    width: outlineWidth,
                    height: outlineHeight,
                    borderRadius: config.outlineRadius,
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                }}
            />

            {/* Golden Chip */}
            <div
                className="absolute z-20"
                style={{
                    left: config.chipX,
                    top: config.chipY,
                    width: config.chipSize,
                    height: config.chipSize * 0.85,
                }}
            >
                <div
                    className="w-full h-full rounded-[2px] overflow-hidden relative shadow-md"
                    style={{
                        background: 'linear-gradient(135deg, #f5e6a3 0%, #d4af37 30%, #f0d78c 50%, #c19a1e 70%, #b8860b 100%)',
                    }}
                >
                    <div className="absolute inset-0 flex flex-col justify-around py-[10%] opacity-30">
                        <div className="w-full h-[0.5px] bg-black" />
                        <div className="w-full h-[0.5px] bg-black" />
                        <div className="w-full h-[0.5px] bg-black" />
                    </div>
                </div>
            </div>

            {/* High-gloss overlay */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 40%, rgba(0,0,0,0.1) 100%)',
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
