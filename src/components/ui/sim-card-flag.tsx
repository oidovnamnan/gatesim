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
        width: 70, height: 46,
        chipSize: 11, chipX: 46, chipY: 15,
        outlinePadding: 2, outlineRadius: 3, outlineWidth: 1
    },
    md: {
        width: 100, height: 66, // Increased size even more
        chipSize: 14, chipX: 68, chipY: 22,
        outlinePadding: 2, outlineRadius: 4, outlineWidth: 1
    },
    lg: {
        width: 150, height: 100,
        chipSize: 26, chipX: 105, chipY: 34,
        outlinePadding: 3, outlineRadius: 6, outlineWidth: 1.5
    },
};

// Comprehensive aliasing to ensure common non-ISO codes work with CDNs
const COUNTRY_MAP: Record<string, string> = {
    "UK": "GB",
    "EUROPE": "EU",
    "GLOBAL": "UN", // Use UN flag for global
    "WORLD": "UN",
    "ASIA": "UN", // Or specific UN sub-regions if available
    "AMERIKA": "US",
    "AMERICA": "US",
};

export function SimCardFlag({ countryCode, size = "md", className }: SimCardFlagProps) {
    const config = sizeConfig[size];
    const [imageError, setImageError] = useState(false);

    const normalizedCode = useMemo(() => {
        let code = countryCode?.toUpperCase().trim() || "UN";
        if (COUNTRY_MAP[code]) code = COUNTRY_MAP[code];
        return code.toLowerCase();
    }, [countryCode]);

    // Using FlagCDN SVG for high-res flat look
    const flagUrl = `https://flagcdn.com/${normalizedCode}.svg`;

    const outlineWidth = config.chipSize + config.outlinePadding * 2;
    const outlineHeight = config.chipSize * 0.85 + config.outlinePadding * 2;
    const outlineX = config.chipX - config.outlinePadding;
    const outlineY = config.chipY - config.outlinePadding;

    return (
        <div
            className={cn(
                "relative overflow-hidden group/sim transition-all duration-300",
                "shadow-xl shadow-black/30 ring-1 ring-white/20 bg-slate-100",
                className
            )}
            style={{
                width: config.width,
                height: config.height,
                borderRadius: config.width * 0.08,
            }}
        >
            {/* Flag Background - Forced full cover */}
            {!imageError ? (
                <div className="absolute inset-0 w-full h-full bg-slate-200">
                    <Image
                        src={flagUrl}
                        alt={`${countryCode} flag`}
                        fill
                        className="object-cover"
                        style={{ objectPosition: 'center' }}
                        sizes={`${config.width * 2}px`}
                        unoptimized
                        priority
                        onError={() => setImageError(true)}
                    />
                </div>
            ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
                    {/* Make the emoji fallback HUGE so it fills the space */}
                    <span
                        className="select-none leading-none"
                        style={{ fontSize: config.height * 0.8 }}
                    >
                        {getCountryFlag(countryCode)}
                    </span>
                </div>
            )}

            {/* Realistic SIM Card overlays */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/10 pointer-events-none" />

            {/* White outline around chip */}
            <div
                className="absolute pointer-events-none z-10"
                style={{
                    left: outlineX,
                    top: outlineY,
                    width: outlineWidth,
                    height: outlineHeight,
                    borderRadius: config.outlineRadius,
                    border: `${config.outlineWidth}px solid rgba(255, 255, 255, 0.9)`,
                    boxShadow: '0 0 4px rgba(0,0,0,0.2)',
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
                    className="w-full h-full rounded-[2px] overflow-hidden relative"
                    style={{
                        background: 'linear-gradient(135deg, #f5e6a3 0%, #d4af37 25%, #f0d78c 50%, #c19a1e 75%, #b8860b 100%)',
                        boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.5), 0 1px 2px rgba(0,0,0,0.3)',
                    }}
                >
                    <div className="absolute inset-0 flex flex-col justify-around py-[10%] opacity-20">
                        <div className="w-full h-[0.5px] bg-black" />
                        <div className="w-full h-[0.5px] bg-black" />
                        <div className="w-full h-[0.5px] bg-black" />
                    </div>
                </div>
            </div>

            {/* Glossy sheen */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)',
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
