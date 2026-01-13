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
        width: 60, height: 40,
        chipSize: 11, chipX: 40, chipY: 14,
        outlinePadding: 2, outlineRadius: 3, outlineWidth: 1
    },
    md: {
        width: 80, height: 50,
        chipSize: 13, chipX: 55, chipY: 18,
        outlinePadding: 2, outlineRadius: 3, outlineWidth: 1 // Reduced white outline
    },
    lg: {
//...
//...
            {
    !imageError ? (
        <Image
            src={flagUrl}
            alt={`${countryCode} flag`}
            fill
            className="object-cover scale-[1.5]" // Increased scale for full fill
            sizes={`${config.width}px`}
            unoptimized
            onError={() => setImageError(true)}
        />
    ) : (
    <div className="absolute inset-0 flex items-center justify-center bg-slate-200 text-3xl">
        {getCountryFlag(countryCode)}
    </div>
)
}

{/* Subtle gradient overlay for depth */ }
<div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10" />

{/* White outline/cutout around chip area */ }
<div
    className="absolute pointer-events-none"
    style={{
        left: outlineX,
        top: outlineY,
        width: outlineWidth,
        height: outlineHeight,
        borderRadius: config.outlineRadius,
        border: `${config.outlineWidth}px solid rgba(255, 255, 255, 0.9)`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
    }}
/>

{/* Golden Chip */ }
<div
    className="absolute"
    style={{
        left: config.chipX,
        top: config.chipY,
        width: config.chipSize,
        height: config.chipSize * 0.85,
    }}
>
    {/* Chip body */}
    <div
        className="w-full h-full rounded-[2px] overflow-hidden relative"
        style={{
            background: 'linear-gradient(145deg, #f5e6a3 0%, #d4af37 25%, #f0d78c 50%, #c9a227 75%, #b8860b 100%)',
            boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.5), inset 0 -1px 3px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.2)',
        }}
    >
        {/* Center circle */}
        <div
            className="absolute rounded-full"
            style={{
                width: config.chipSize * 0.35,
                height: config.chipSize * 0.35,
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'linear-gradient(145deg, #e8d174 0%, #c9a227 100%)',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2)',
            }}
        />

        {/* Contact lines - horizontal */}
        <div className="absolute inset-x-0 flex flex-col justify-between h-full py-[12%]">
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-amber-700/50 to-transparent" />
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-amber-700/50 to-transparent" />
        </div>

        {/* Contact lines - vertical */}
        <div className="absolute inset-y-0 flex justify-between w-full px-[12%]">
            <div className="h-full w-[1px] bg-gradient-to-b from-transparent via-amber-700/50 to-transparent" />
            <div className="h-full w-[1px] bg-gradient-to-b from-transparent via-amber-700/50 to-transparent" />
        </div>
    </div>
</div>

{/* Glossy reflection overlay */ }
<div
    className="absolute inset-0 pointer-events-none"
    style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 50%)',
    }}
/>
        </div >
    );
}

// Variant with emoji fallback
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

    const outlineWidth = config.chipSize + config.outlinePadding * 2;
    const outlineHeight = config.chipSize * 0.85 + config.outlinePadding * 2;
    const outlineX = config.chipX - config.outlinePadding;
    const outlineY = config.chipY - config.outlinePadding;

    return (
        <div
            className={cn(
                "relative overflow-hidden flex items-center justify-center",
                "shadow-lg shadow-black/20 bg-gradient-to-br from-slate-100 to-slate-200",
                "transform transition-transform duration-300 group-hover:scale-105",
                className
            )}
            style={{
                width: config.width,
                height: config.height,
                borderRadius: config.width * 0.08,
            }}
        >
            {/* Flag Emoji */}
            <span
                className="select-none"
                style={{
                    fontSize: config.width * 0.45,
                    lineHeight: 1,
                }}
            >
                {flag}
            </span>

            {/* White outline around chip */}
            <div
                className="absolute pointer-events-none"
                style={{
                    left: outlineX,
                    top: outlineY,
                    width: outlineWidth,
                    height: outlineHeight,
                    borderRadius: config.outlineRadius,
                    border: `${config.outlineWidth}px solid rgba(255, 255, 255, 0.9)`,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                }}
            />

            {/* Golden Chip */}
            <div
                className="absolute"
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
                        boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.5), inset 0 -1px 3px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.2)',
                    }}
                >
                    <div
                        className="absolute rounded-full"
                        style={{
                            width: config.chipSize * 0.35,
                            height: config.chipSize * 0.35,
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            background: 'linear-gradient(145deg, #e8d174 0%, #c9a227 100%)',
                            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2)',
                        }}
                    />
                    <div className="absolute inset-x-0 flex flex-col justify-between h-full py-[12%]">
                        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-amber-700/50 to-transparent" />
                        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-amber-700/50 to-transparent" />
                    </div>
                    <div className="absolute inset-y-0 flex justify-between w-full px-[12%]">
                        <div className="h-full w-[1px] bg-gradient-to-b from-transparent via-amber-700/50 to-transparent" />
                        <div className="h-full w-[1px] bg-gradient-to-b from-transparent via-amber-700/50 to-transparent" />
                    </div>
                </div>
            </div>

            {/* Glossy effect */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%)',
                }}
            />
        </div>
    );
}
