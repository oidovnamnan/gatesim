"use client";

import { useState, useEffect } from "react";
import { cn, getCountryFlag } from "@/lib/utils";

interface SimCardFlagProps {
    countryCode: string;
    size?: "sm" | "md" | "lg";
    className?: string;
}

const sizeConfig = {
    sm: {
        width: 70, height: 46, // Increased from 60x40
        chipSize: 11, chipX: 48, chipY: 16,
        outlinePadding: 2, outlineRadius: 3, outlineWidth: 1
    },
    md: {
        width: 90, height: 60, // Increased from 80x50
        chipSize: 14, chipX: 62, chipY: 22, // Keep chip relatively small
        outlinePadding: 2, outlineRadius: 4, outlineWidth: 1
    },
    lg: {
        width: 140, height: 92,
        chipSize: 26, chipX: 95, chipY: 34,
        outlinePadding: 3, outlineRadius: 6, outlineWidth: 1.5
    },
};

export function SimCardFlag({ countryCode, size = "md", className }: SimCardFlagProps) {
    const config = sizeConfig[size];
    const [imageError, setImageError] = useState(false);

    // Normalize country code
    const code = countryCode?.toLowerCase().trim();
    // Using a reliable SVG source that is definitely FLAT
    const flagUrl = `https://flagcdn.com/${code}.svg`;

    // Calculate outline dimensions (around the chip)
    const outlineWidth = config.chipSize + config.outlinePadding * 2;
    const outlineHeight = config.chipSize * 0.85 + config.outlinePadding * 2;
    const outlineX = config.chipX - config.outlinePadding;
    const outlineY = config.chipY - config.outlinePadding;

    return (
        <div
            className={cn(
                "relative overflow-hidden group/sim transition-all duration-300",
                "shadow-lg shadow-black/20 ring-1 ring-white/10",
                className
            )}
            style={{
                width: config.width,
                height: config.height,
                borderRadius: config.width * 0.08,
            }}
        >
            {/* Flag Background - Using CSS Background for guaranteed full fill without padding */}
            {!imageError ? (
                <div
                    className="absolute inset-[-1px] transition-transform duration-500 group-hover/sim:scale-110"
                    style={{
                        backgroundImage: `url("${flagUrl}")`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        // Ensuring it covers any edge cases
                        width: 'calc(100% + 2px)',
                        height: 'calc(100% + 2px)',
                    }}
                // Note: We can't easily catch 404 on CSS background-image without pre-fetching
                // But for flagcdn, we usually assume it works if code is valid ISO
                />
            ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-200 text-3xl">
                    {getCountryFlag(countryCode)}
                </div>
            )}

            {/* Subtle gloss/texture for a premium card feel */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-white/5 to-white/20 pointer-events-none" />

            {/* White outline/cutout around chip area */}
            <div
                className="absolute pointer-events-none z-10"
                style={{
                    left: outlineX,
                    top: outlineY,
                    width: outlineWidth,
                    height: outlineHeight,
                    borderRadius: config.outlineRadius,
                    border: `${config.outlineWidth}px solid rgba(255, 255, 255, 0.7)`,
                    boxShadow: '0 0 4px rgba(0,0,0,0.1)',
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
                {/* Chip body */}
                <div
                    className="w-full h-full rounded-[2px] overflow-hidden relative shadow-sm"
                    style={{
                        background: 'linear-gradient(145deg, #f5e6a3 0%, #d4af37 25%, #f0d78c 50%, #c9a227 75%, #b8860b 100%)',
                    }}
                >
                    {/* Micro-details for the chip */}
                    <div
                        className="absolute rounded-full"
                        style={{
                            width: '30%',
                            height: '30%',
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            background: 'rgba(0,0,0,0.1)',
                        }}
                    />
                    <div className="absolute inset-0 border-[0.5px] border-amber-900/10" />
                </div>
            </div>

            {/* Final Glassy Sheen */}
            <div
                className="absolute inset-0 pointer-events-none opacity-50"
                style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 40%, rgba(0,0,0,0.1) 100%)',
                }}
            />
        </div>
    );
}

// Keep the SimCardFlagEmoji for regions/fallback
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
                "relative overflow-hidden flex items-center justify-center shadow-lg",
                "bg-gradient-to-br from-slate-100 to-slate-200",
                className
            )}
            style={{
                width: config.width,
                height: config.height,
                borderRadius: config.width * 0.08,
            }}
        >
            <span className="select-none text-2xl" style={{ fontSize: config.width * 0.4 }}>
                {flag}
            </span>
            {/* Minimal chip for symmetry */}
            <div
                className="absolute opacity-30"
                style={{
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 12,
                    height: 10,
                    background: '#d4af37',
                    borderRadius: 2
                }}
            />
        </div>
    );
}
