import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatPrice(price: number, currency: string = "USD"): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
}

export function formatData(dataMB: number): string {
    if (dataMB >= 1024) {
        return `${(dataMB / 1024).toFixed(0)} GB`;
    }
    return `${dataMB} MB`;
}

export function formatDays(days: number): string {
    if (days === 1) return "1 өдөр";
    if (days === 7) return "7 хоног";
    if (days === 30) return "30 хоног";
    return `${days} хоног`;
}

export function generateOrderNumber(): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `GS-${dateStr}-${random}`;
}

export function getCountryFlag(countryCode: string): string {
    // Explicit mapping for common countries (more reliable than code calculation)
    const flagMap: Record<string, string> = {
        "JP": "🇯🇵", "KR": "🇰🇷", "CN": "🇨🇳", "TH": "🇹🇭",
        "US": "🇺🇸", "SG": "🇸🇬", "MY": "🇲🇾", "VN": "🇻🇳",
        "TR": "🇹🇷", "AE": "🇦🇪", "DE": "🇩🇪", "FR": "🇫🇷",
        "GB": "🇬🇧", "AU": "🇦🇺", "CA": "🇨🇦", "IT": "🇮🇹",
        "ES": "🇪🇸", "NL": "🇳🇱", "CH": "🇨🇭", "AT": "🇦🇹",
        "MN": "🇲🇳", "RU": "🇷🇺", "IN": "🇮🇳", "ID": "🇮🇩",
        "PH": "🇵🇭", "TW": "🇹🇼", "HK": "🇭🇰", "MO": "🇲🇴",
    };

    const code = countryCode.toUpperCase();
    if (flagMap[code]) return flagMap[code];

    // Fallback to code point calculation
    const codePoints = code
        .split("")
        .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
}

export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function truncate(str: string, length: number): string {
    if (str.length <= length) return str;
    return str.slice(0, length) + "...";
}
// Deploy Trigger: Wed Jan 14 07:26:03 +08 2026
