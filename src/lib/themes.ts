/**
 * GateSIM Theme System
 * Multiple color themes for the app + Country Specific Ambiences
 */

export type ThemeName = "ocean" | "sunset" | "forest" | "purple" | "midnight" | "rose" | "cyan";

export interface ThemeColors {
    primary: string;
    primaryHsl: string;
    accent: string;
    accentHsl: string;
    gradient: string;
    gradientCard: string;
    shadow: string;
}

export interface Theme {
    name: ThemeName;
    label: string;
    emoji: string;
    colors: ThemeColors;
}

// Country Ambience Definition
export interface CountryAmbience {
    id: string;
    colors: ThemeColors;
    icon: string; // Background Icon/Emoji
    pattern: "dots" | "waves" | "grid" | "blobs";
}

// 1. Standard Themes (User selectable)
export const themes: Record<string, Theme> = {
    ocean: {
        name: "ocean",
        label: "Ocean Blue",
        emoji: "🌊",
        colors: {
            primary: "#3b82f6",
            primaryHsl: "217 91% 60%",
            accent: "#8b5cf6",
            accentHsl: "262 83% 58%",
            gradient: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
            gradientCard: "linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)",
            shadow: "rgba(59, 130, 246, 0.25)",
        },
    },
    purple: {
        name: "purple",
        label: "Royal Purple",
        emoji: "👑",
        colors: {
            primary: "#a855f7",
            primaryHsl: "271 91% 65%",
            accent: "#6366f1",
            accentHsl: "239 84% 67%",
            gradient: "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)",
            gradientCard: "linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)",
            shadow: "rgba(168, 85, 247, 0.25)",
        },
    },
    emerald: {
        // @ts-ignore
        name: "emerald",
        label: "Forest Green",
        emoji: "🌲",
        colors: {
            primary: "#10b981",
            primaryHsl: "160 84% 39%",
            accent: "#06b6d4",
            accentHsl: "186 94% 41%",
            gradient: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
            gradientCard: "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)",
            shadow: "rgba(16, 185, 129, 0.25)",
        },
    },
    sunset: {
        name: "sunset",
        label: "Sunset Orange",
        emoji: "🌅",
        colors: {
            primary: "#f97316",
            primaryHsl: "25 95% 53%",
            accent: "#ec4899",
            accentHsl: "330 81% 60%",
            gradient: "linear-gradient(135deg, #f97316 0%, #ec4899 100%)",
            gradientCard: "linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(236, 72, 153, 0.15) 100%)",
            shadow: "rgba(249, 115, 22, 0.25)",
        },
    },
    rose: {
        name: "rose",
        label: "Rose Pink",
        emoji: "🌸",
        colors: {
            primary: "#f43f5e",
            primaryHsl: "350 89% 60%",
            accent: "#d946ef",
            accentHsl: "292 91% 73%",
            gradient: "linear-gradient(135deg, #f43f5e 0%, #d946ef 100%)",
            gradientCard: "linear-gradient(135deg, rgba(244, 63, 94, 0.15) 0%, rgba(217, 70, 239, 0.15) 100%)",
            shadow: "rgba(244, 63, 94, 0.25)",
        },
    },
    orange: {
        // @ts-ignore
        name: "orange",
        label: "Warm Orange",
        emoji: "🍊",
        colors: {
            primary: "#ea580c",
            primaryHsl: "20 91% 48%",
            accent: "#fbbf24",
            accentHsl: "45 93% 56%",
            gradient: "linear-gradient(135deg, #ea580c 0%, #fbbf24 100%)",
            gradientCard: "linear-gradient(135deg, rgba(234, 88, 12, 0.15) 0%, rgba(251, 191, 36, 0.15) 100%)",
            shadow: "rgba(234, 88, 12, 0.25)",
        }
    },
    cyan: {
        name: "cyan",
        label: "Cyber Cyan",
        emoji: "💎",
        colors: {
            primary: "#06b6d4",
            primaryHsl: "189 94% 43%",
            accent: "#3b82f6",
            accentHsl: "217 91% 60%",
            gradient: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
            gradientCard: "linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)",
            shadow: "rgba(6, 182, 212, 0.25)",
        }
    },
    forest: {
        name: "forest",
        label: "Forest",
        emoji: "🌲",
        colors: {
            primary: "#10b981",
            primaryHsl: "160 84% 39%",
            accent: "#06b6d4",
            accentHsl: "186 94% 41%",
            gradient: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
            gradientCard: "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)",
            shadow: "rgba(16, 185, 129, 0.25)",
        }
    },
    midnight: {
        name: "midnight",
        label: "Midnight",
        emoji: "🌙",
        colors: {
            primary: "#6366f1",
            primaryHsl: "239 84% 67%",
            accent: "#14b8a6",
            accentHsl: "168 76% 42%",
            gradient: "linear-gradient(135deg, #6366f1 0%, #14b8a6 100%)",
            gradientCard: "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(20, 184, 166, 0.15) 100%)",
            shadow: "rgba(99, 102, 241, 0.25)",
        }
    }
};

// 2. Country Special Ambiences
export const countryAmbiences: Record<string, CountryAmbience> = {
    "CN": { // China
        id: "china",
        icon: "🐉",
        pattern: "waves",
        colors: {
            primary: "#ef4444",
            primaryHsl: "0 84% 60%",
            accent: "#fbbf24",
            accentHsl: "45 93% 56%",
            gradient: "linear-gradient(135deg, #b91c1c 0%, #fbbf24 100%)",
            gradientCard: "linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(234, 179, 8, 0.15) 100%)",
            shadow: "rgba(220, 38, 38, 0.3)",
        }
    },
    "JP": { // Japan
        id: "japan",
        icon: "🌸",
        pattern: "blobs",
        colors: {
            primary: "#f472b6",
            primaryHsl: "330 81% 70%",
            accent: "#fbcfe8",
            accentHsl: "323 88% 90%",
            gradient: "linear-gradient(135deg, #ec4899 0%, #fbcfe8 100%)",
            gradientCard: "linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(251, 207, 232, 0.2) 100%)",
            shadow: "rgba(236, 72, 153, 0.2)",
        }
    },
    "KR": { // Korea
        id: "korea",
        icon: "🏯",
        pattern: "grid",
        colors: {
            primary: "#8b5cf6",
            primaryHsl: "262 83% 58%",
            accent: "#06b6d4",
            accentHsl: "189 94% 43%",
            gradient: "linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)",
            gradientCard: "linear-gradient(135deg, rgba(124, 58, 237, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)",
            shadow: "rgba(124, 58, 237, 0.3)",
        }
    },
    "TH": { // Thailand/SEA
        id: "thailand",
        icon: "🐘",
        pattern: "blobs",
        colors: {
            primary: "#34d399", // Bright Emerald (Fixed)
            primaryHsl: "150 75% 55%",
            accent: "#fbbf24", // Bright Amber
            accentHsl: "45 93% 56%",
            gradient: "linear-gradient(135deg, #34d399 0%, #fbbf24 100%)",
            gradientCard: "linear-gradient(135deg, rgba(52, 211, 153, 0.15) 0%, rgba(251, 191, 36, 0.15) 100%)",
            shadow: "rgba(52, 211, 153, 0.25)",
        }
    },
    "SG": { // Singapore
        id: "singapore",
        icon: "🦁",
        pattern: "grid",
        colors: {
            primary: "#0ea5e9", // Sky Blue
            primaryHsl: "199 89% 48%",
            accent: "#10b981", // Emerald
            accentHsl: "160 84% 39%",
            gradient: "linear-gradient(135deg, #0ea5e9 0%, #10b981 100%)",
            gradientCard: "linear-gradient(135deg, rgba(14, 165, 233, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%)",
            shadow: "rgba(14, 165, 233, 0.25)",
        }
    },
    "VN": { // Vietnam
        id: "vietnam",
        icon: "🏮",
        pattern: "waves",
        colors: {
            primary: "#facc15", // Bright Yellow (Fixed)
            primaryHsl: "52 94% 53%",
            accent: "#f87171", // Light Red
            accentHsl: "0 91% 71%",
            gradient: "linear-gradient(135deg, #facc15 0%, #f87171 100%)",
            gradientCard: "linear-gradient(135deg, rgba(250, 204, 21, 0.15) 0%, rgba(248, 113, 113, 0.15) 100%)",
            shadow: "rgba(250, 204, 21, 0.25)",
        }
    },
    "TR": { // Turkey
        id: "turkey",
        icon: "🎈",
        pattern: "blobs",
        colors: {
            primary: "#2dd4bf", // Bright Teal (Fixed)
            primaryHsl: "172 66% 50%",
            accent: "#fbbf24",
            accentHsl: "45 93% 56%",
            gradient: "linear-gradient(135deg, #2dd4bf 0%, #fbbf24 100%)",
            gradientCard: "linear-gradient(135deg, rgba(45, 212, 191, 0.15) 0%, rgba(251, 191, 36, 0.15) 100%)",
            shadow: "rgba(45, 212, 191, 0.25)",
        }
    },
    "US": { // USA
        id: "usa",
        icon: "🗽",
        pattern: "grid",
        colors: {
            primary: "#3b82f6",
            primaryHsl: "217 91% 60%",
            accent: "#ef4444",
            accentHsl: "0 84% 60%",
            gradient: "linear-gradient(135deg, #1e40af 0%, #ef4444 100%)",
            gradientCard: "linear-gradient(135deg, rgba(30, 64, 175, 0.15) 0%, rgba(239, 68, 68, 0.15) 100%)",
            shadow: "rgba(30, 64, 175, 0.25)",
        }
    },
    "EU": { // Europe
        id: "europe",
        icon: "🏰",
        pattern: "dots",
        colors: {
            primary: "#60a5fa", // Bright Blue (Fixed)
            primaryHsl: "217 91% 68%",
            accent: "#fbbf24",
            accentHsl: "45 93% 56%",
            gradient: "linear-gradient(135deg, #60a5fa 0%, #fbbf24 100%)",
            gradientCard: "linear-gradient(135deg, rgba(96, 165, 250, 0.15) 0%, rgba(251, 191, 36, 0.15) 100%)",
            shadow: "rgba(96, 165, 250, 0.25)",
        }
    },
    "RU": { // Russia
        id: "russia",
        icon: "🕌",
        pattern: "dots",
        colors: {
            primary: "#f87171", // Light Red (Fixed)
            primaryHsl: "0 91% 71%",
            accent: "#60a5fa", // Light Blue
            accentHsl: "217 91% 68%",
            gradient: "linear-gradient(135deg, #f87171 0%, #60a5fa 100%)",
            gradientCard: "linear-gradient(135deg, rgba(248, 113, 113, 0.15) 0%, rgba(96, 165, 250, 0.15) 100%)",
            shadow: "rgba(248, 113, 113, 0.25)",
        }
    }
}

export const themeList = Object.values(themes);

export const DEFAULT_THEME = "ocean";

// Helper functions
export function applyTheme(themeName: string): void {
    const theme = themes[themeName];
    if (!theme) return;
    applyColors(theme.colors);
    document.documentElement.setAttribute("data-theme", themeName);
}

export function applyCountryAmbience(countryCode: string): void {
    const ambience = countryAmbiences[countryCode];
    if (!ambience) return;
    applyColors(ambience.colors);
    document.documentElement.setAttribute("data-ambience", countryCode);
}

export function clearAmbience(originalTheme: string): void {
    document.documentElement.removeAttribute("data-ambience");
    applyTheme(originalTheme);
}

function applyColors(colors: ThemeColors) {
    const root = document.documentElement;
    root.style.setProperty("--primary", colors.primaryHsl);
    root.style.setProperty("--accent", colors.accentHsl);
    root.style.setProperty("--theme-gradient", colors.gradient);
    root.style.setProperty("--theme-gradient-card", colors.gradientCard);
    root.style.setProperty("--theme-shadow", colors.shadow);
}

export function getSavedTheme(): any {
    if (typeof window === "undefined") return DEFAULT_THEME;
    const saved = localStorage.getItem("gatesim-theme");
    return (saved && themes[saved]) ? saved : DEFAULT_THEME;
}

export function saveTheme(themeName: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem("gatesim-theme", themeName);
}
