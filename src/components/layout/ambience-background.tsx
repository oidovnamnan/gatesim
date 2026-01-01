"use client";
import { useTheme } from "@/providers/theme-provider";
import { countryAmbiences } from "@/lib/themes";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function AmbienceBackground() {
    const { activeCountry } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !activeCountry) return null;

    const ambience = countryAmbiences[activeCountry];
    if (!ambience) return null;

    // Pattern Definitions - Generic reusable patterns
    const patterns = {
        waves: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cpath d='M0 40c5.5-5.5 5.5-14.5 0-20 5.5 5.5 14.5 5.5 20 0 5.5 5.5 5.5 14.5 0 20-5.5-5.5-14.5-5.5-20 0zM20 20c5.5-5.5 5.5-14.5 0-20 5.5 5.5 14.5 5.5 20 0 5.5 5.5 5.5 14.5 0 20-5.5-5.5-14.5-5.5-20 0z' fill='white' fill-opacity='0.15' fill-rule='evenodd'/%3E%3C/svg%3E\")",

        blobs: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='white' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",

        grid: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm20 20h20v20H20V20zM0 20h20v20H0V20z' fill='white' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E\")",

        dots: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='2' fill='white' fill-opacity='0.15'/%3E%3C/svg%3E\")",
    };

    const bgImage = patterns[ambience.pattern] || "";

    return (
        <div className="fixed inset-0 z-[0] pointer-events-none overflow-hidden select-none bg-[#020205]">
            {/* 1. Base Gradient Layer - Darkened */}
            <div
                className="absolute inset-0 transition-colors duration-1000 ease-in-out"
                style={{
                    background: `linear-gradient(to bottom, #000000 0%, ${ambience.colors.primary}10 50%, ${ambience.colors.accent}10 100%)`
                }}
            />

            {/* 2. Abstract Premium Glows - Reduced Opacity for Better Contrast */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="absolute top-[-20%] right-[-20%] w-[100vw] h-[100vw] rounded-full blur-[120px] opacity-[0.12]"
                style={{ backgroundColor: ambience.colors.primary }}
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
                className="absolute bottom-[-10%] left-[-20%] w-[80vw] h-[80vw] rounded-full blur-[100px] opacity-[0.1]"
                style={{ backgroundColor: ambience.colors.accent }}
            />

            {/* 3. Texture Pattern Overlay */}
            {bgImage && (
                <div
                    className="absolute inset-0 opacity-[0.1] mix-blend-overlay"
                    style={{ backgroundImage: bgImage }}
                />
            )}

            {/* 4. Floating Icon */}
            <div className="absolute top-[5%] right-[5%] opacity-[0.02] text-[25vh] leading-none filter blur-sm rotate-12">
                {ambience.icon}
            </div>

            {/* 5. Cinematic Vignette & Bottom Fade for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80" />
            <div className="absolute inset-0 bg-black/20" /> {/* General dimmer */}
        </div>
    );
}
