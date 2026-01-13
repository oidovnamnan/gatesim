"use client";

import { useState } from "react";
import Image from "next/image";
import { cn, getCountryFlag } from "@/lib/utils";

interface SimCardFlagProps {
    countryCode: string;
    size?: "sm" | "md" | "lg";
    className?: string;
}

const sizeConfig = {
    sm: {
        width: 65, height: 44,
        chipSize: 11, chipX: 42, chipY: 15,
        outlinePadding: 2, outlineRadius: 3, outlineWidth: 1
    },
    md: {
        width: 90, height: 60,
        chipSize: 14, chipX: 60, chipY: 20,
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

    // Normalize country code and build URL
    const code = countryCode?.toLowerCase().trim() || "un";
    // Using w640 for better quality and ensuring flat look
    const flagUrl = `https://flagcdn.com/w640/${code}.png`;

    // Calculate outline dimensions (around the chip)
    const outlineWidth = config.chipSize + config.outlinePadding * 2;
    const outlineHeight = config.chipSize * 0.85 + config.outlinePadding * 2;
    const outlineX = config.chipX - config.outlinePadding;
    const outlineY = config.chipY - config.outlinePadding;

    return (
        <div
            className={cn(
                "relative overflow-hidden group/sim transition-all duration-300",
                "shadow-lg shadow-black/25 ring-1 ring-black/5 bg-slate-200",
                className
            )}
            style={{
                width: config.width,
                height: config.height,
                borderRadius: config.width * 0.08,
            }}
        >
            {/* Flag Background */}
            {!imageError ? (
                <div className="absolute inset-0 w-full h-full">
                    <Image
                        src={flagUrl}
                        alt={`${countryCode} flag`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover/sim:scale-110"
                        sizes={`${config.width * 2}px`}
                        unoptimized
                        priority
                        onError={() => setImageError(true)}
                    />
                </div>
            ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-3xl">
                    {getCountryFlag(countryCode)}
                </div>
            )}

            {/* Premium overlays */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-white/5 to-white/10 pointer-events-none" />
            <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-[inherit] pointer-events-none" />

            {/* White outline around chip */}
            <div
                className="absolute pointer-events-none z-10"
                style={{
                    left: outlineX,
                    top: outlineY,
                    width: outlineWidth,
                    height: outlineHeight,
                    borderRadius: config.outlineRadius,
                    border: `${config.outlineWidth}px solid rgba(255, 255, 255, 0.8)`,
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
                <div
                    className="w-full h-full rounded-[2px] overflow-hidden relative"
                    style={{
                        background: 'linear-gradient(145deg, #f5e6a3 0%, #d4af37 25%, #f0d78c 50%, #c9a227 75%, #b8860b 100%)',
                        boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.4), 0 1px 2px rgba(0,0,0,0.2)',
                    }}
                >
                    {/* Micro-details */}
                    <div className="absolute inset-0 flex flex-col justify-around py-[15%]">
                        <div className="w-full h-[0.5px] bg-black/10" />
                        <div className="w-full h-[0.5px] bg-black/10" />
                    </div>
                </div>
            </div>

            {/* Subtle reflection */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 40%)',
                }}
            />
        </div>
    );
}

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
                "relative overflow-hidden flex items-center justify-center shadow-md bg-slate-50",
                className
            )}
            style={{
                width: config.width,
                height: config.height,
                borderRadius: config.width * 0.08,
            }}
        >
            <span className="select-none" style={{ fontSize: config.width * 0.4 }}>
                {flag}
            </span>
            <div
                className="absolute opacity-20 bg-amber-600 rounded-[1px]"
                style={{
                    right: 6,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 10,
                    height: 8,
                }}
            />
        </div>
    );
}
