"use client";
import { useEffect } from "react";
import { useTheme } from "@/providers/theme-provider";

export function AmbienceTrigger({ countryCode }: { countryCode: string }) {
    const { setCountry } = useTheme();

    useEffect(() => {
        if (countryCode) {
            setCountry(countryCode);
        }
        return () => {
            setCountry(null); // Reset on unmount
        };
    }, [countryCode, setCountry]);

    return null; // Invisible component
}
