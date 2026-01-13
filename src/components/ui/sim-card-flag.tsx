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
        // If it's a multi-country package or invalid code, use UN
        if (code.length > 2) return "un";
        return code.toLowerCase();
    }, [countryCode]);

    // Using Flat PNG source - guaranteed no waves
    const flagUrl = `https://flagpedia.net/data/flags/h120/${normalizedCode}.png`;

    const outlineWidth = config.chipSize + config.outlinePadding * 2;
    const outlineHeight = config.chipSize * 0.85 + config.outlinePadding * 2;
    const outlineX = config.chipX - config.outlinePadding;
    const outlineY = config.chipY - config.outlinePadding;

    return (
        <div
            className={cn(
                "relative overflow-hidden group/sim transition-all duration-500 bg-zinc-800",
                "shadow-2xl shadow-black/40",
                className
            )}
            style={{
                width: config.width,
                height: config.height,
                borderRadius: config.width * 0.1,
            }}
        >
            {/* Flag Background - Forced edge-to-edge fill */}
            {!imageError ? (
                <div className="absolute inset-[-1px] w-[calc(100%+2px)] h-[calc(100%+2px)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={flagUrl}
                        alt={`${countryCode} flag`}
                        className="w-full h-full object-cover scale-[1.1] transition-transform duration-700"
                        style={{
                            objectPosition: 'center',
                            // Ensure no smoothing artifacts cause gaps
                            imageRendering: 'crisp-edges'
                        } as any}
                        onError={() => setImageError(true)}
                    />
                </div>
            ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                    <span className="text-white/40 font-bold text-[10px] tracking-tighter uppercase">
                        {countryCode}
                    </span>
                </div>
            )}

            {/* Premium SIM card effects - VERY subtle */}
            <div className="absolute inset-0 bg-black/5 pointer-events-none" />

            {/* Chip position remains small and realistic */}
            <div
                className="absolute z-20"
                style={{
                    left: config.chipX,
                    top: config.chipY,
                    width: config.chipSize,
                    height: config.chipSize * 0.85,
                    borderRadius: 1,
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, #f5e6a3 0%, #d4af37 40%, #b8860b 100%)',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
                }}
            >
                {/* Minimal chip detail */}
                <div className="absolute inset-0 border-[0.5px] border-amber-900/10" />
            </div>

            {/* Final glassy sheen */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%)',
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
