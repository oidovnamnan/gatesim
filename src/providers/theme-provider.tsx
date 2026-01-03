"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
    ThemeName,
    themes,
    themeList,
    DEFAULT_THEME,
    applyTheme,
    getSavedTheme,
    saveTheme,
    applyCountryAmbience,
    clearAmbience
} from "@/lib/themes";

export type Mode = "dark" | "light";

interface ThemeContextType {
    theme: ThemeName;
    setTheme: (theme: ThemeName) => void;
    mode: Mode;
    setMode: (mode: Mode) => void;
    toggleMode: () => void;
    setCountry: (code: string | null) => void;
    activeCountry: string | null;
    themes: typeof themeList;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<ThemeName>(DEFAULT_THEME);
    const [mode, setModeState] = useState<Mode>("light");
    // Keep track of active country internally to restore theme if country is cleared
    const [activeCountry, setActiveCountry] = useState<string | null>(null);

    useEffect(() => {
        const savedTheme = getSavedTheme();
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setThemeState(savedTheme);
        applyTheme(savedTheme);

        // Load mode from localStorage - default to light if not set
        const savedMode = localStorage.getItem("gatesim-mode") as Mode;
        const actualMode = savedMode || "light";
        setModeState(actualMode);

        // Always explicitly set the class based on mode
        if (actualMode === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, []);

    const setTheme = (newTheme: ThemeName) => {
        setThemeState(newTheme);
        saveTheme(newTheme);
        // Only apply if no country is active
        if (!activeCountry) {
            applyTheme(newTheme);
        }
    };

    const setMode = (newMode: Mode) => {
        setModeState(newMode);
        localStorage.setItem("gatesim-mode", newMode);
        if (newMode === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    };

    const toggleMode = () => {
        setMode(mode === "dark" ? "light" : "dark");
    };

    const setCountry = (code: string | null) => {
        setActiveCountry(code);
        if (code) {
            applyCountryAmbience(code);
        } else {
            // Restore current theme
            clearAmbience(theme);
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, mode, setMode, toggleMode, setCountry, activeCountry, themes: themeList }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within ThemeProvider");
    }
    return context;
}

export { themes, themeList };
