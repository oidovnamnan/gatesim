"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type ThemeColor = "blue" | "purple" | "emerald" | "orange" | "rose" | "cyan";

interface ThemeContextType {
    themeColor: ThemeColor;
    setThemeColor: (color: ThemeColor) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEMES: Record<ThemeColor, { primary: string; accent: string; label: string }> = {
    blue: {
        primary: "217 91% 60%", // Blue-500
        accent: "262 83% 58%",  // Violet-500
        label: "Ocean Blue"
    },
    purple: {
        primary: "270 95% 60%", // Purple-500
        accent: "320 90% 60%",  // Pink-500
        label: "Royal Purple"
    },
    emerald: {
        primary: "142 76% 36%", // Emerald-600
        accent: "160 84% 39%",  // Teal-500
        label: "Forest Green"
    },
    orange: {
        primary: "24 94% 50%",  // Orange-500
        accent: "45 93% 47%",   // Yellow-500
        label: "Sunset Orange"
    },
    rose: {
        primary: "343 87% 55%", // Rose-500
        accent: "10 90% 60%",   // Red-500
        label: "Neon Rose"
    },
    cyan: {
        primary: "190 90% 50%", // Cyan-500
        accent: "210 90% 50%",  // Sky-500
        label: "Cyber Cyan"
    }
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [themeColor, setThemeColorState] = useState<ThemeColor>("blue");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Load from localStorage
        const saved = localStorage.getItem("theme-color") as ThemeColor;
        if (saved && THEMES[saved]) {
            setThemeColorState(saved);
        }
        setMounted(true);
    }, []);

    const setThemeColor = (color: ThemeColor) => {
        setThemeColorState(color);
        localStorage.setItem("theme-color", color);
    };

    // Apply colors to :root
    useEffect(() => {
        const root = document.documentElement;
        const theme = THEMES[themeColor];

        // Disable transitions temporarily to prevent weird flashing
        root.style.setProperty("--primary", theme.primary);
        root.style.setProperty("--accent", theme.accent);

        // Update gradient variable dynamically
        root.style.setProperty("--theme-gradient", `linear-gradient(135deg, hsl(${theme.primary}) 0%, hsl(${theme.accent}) 100%)`);

    }, [themeColor]);

    // Prevent hydration mismatch by rendering children only after mount (optional but safer for theme)
    // Actually, for theme provider, usually we just render children. 
    // The flicker on generic HTML is acceptable or handled by script in head (advanced).
    return (
        <ThemeContext.Provider value={{ themeColor, setThemeColor }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) throw new Error("useTheme must be used within ThemeProvider");
    return context;
}

export const availableThemes = Object.entries(THEMES).map(([key, value]) => ({
    id: key as ThemeColor,
    ...value
}));
