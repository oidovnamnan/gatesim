
interface TransportEstimate {
    min: number;
    max: number;
    currency: "USD";
    details: string;
}

const KNOWN_ROUTES: Record<string, Record<string, TransportEstimate>> = {
    "flight": {
        "CN": { min: 300, max: 500, currency: "USD", details: "Direct flight Ulaanbaatar -> Beijing/Hohhot" },
        "KR": { min: 400, max: 600, currency: "USD", details: "Direct flight Ulaanbaatar -> Seoul (Incheon)" },
        "JP": { min: 550, max: 850, currency: "USD", details: "Direct flight Ulaanbaatar -> Tokyo (Narita)" },
        "TH": { min: 600, max: 900, currency: "USD", details: "Flight via Seoul/Beijing to Bangkok" },
        "SG": { min: 650, max: 950, currency: "USD", details: "Flight via Seoul/Hong Kong to Singapore" },
        "US": { min: 1200, max: 1800, currency: "USD", details: "Trans-pacific flight via Seoul/Tokyo" },
        "TR": { min: 800, max: 1100, currency: "USD", details: "Flight via Istanbul" },
        "AE": { min: 900, max: 1300, currency: "USD", details: "Flight to Dubai" },
    },
    "train": {
        "CN": { min: 40, max: 80, currency: "USD", details: "Train Ulaanbaatar -> Zamiin-Uud -> Erlian" },
        "RU": { min: 50, max: 100, currency: "USD", details: "Train Ulaanbaatar -> Ulan-Ude/Irkutsk" },
    },
    "bus": {
        "CN": { min: 30, max: 60, currency: "USD", details: "Bus Ulaanbaatar -> Zamiin-Uud -> Erlian" },
        "RU": { min: 25, max: 50, currency: "USD", details: "Bus Ulaanbaatar -> Ulan-Ude" },
    }
};

/**
 * Estimates international transport cost from Ulaanbaatar
 */
export function estimateTransportCost(mode: string, destinationCode: string): TransportEstimate {
    const normalizedMode = mode.toLowerCase().includes("train") ? "train"
        : mode.toLowerCase().includes("bus") ? "bus"
            : "flight";

    const specificRoute = KNOWN_ROUTES[normalizedMode]?.[destinationCode];

    if (specificRoute) {
        return specificRoute;
    }

    // Fallback estimates
    if (normalizedMode === "flight") {
        return {
            min: 800,
            max: 1200,
            currency: "USD",
            details: `Estimated flight cost to ${destinationCode}`
        };
    }

    return {
        min: 100,
        max: 300,
        currency: "USD",
        details: `Estimated overland transport to ${destinationCode}`
    };
}

/**
 * Estimates high-speed train costs between cities (e.g. within China/Japan)
 * Approx $0.10 - $0.20 per km
 */
export function estimateInterCityCost(countryCode: string): string {
    switch (countryCode) {
        case "JP": return "approx. $50-$150 (Shinkansen)";
        case "CN": return "approx. $30-$80 (High-speed Rail)";
        case "KR": return "approx. $20-$50 (KTX)";
        case "EU": return "approx. $40-$100 (Eurail)";
        default: return "approx. $20-$60";
    }
}
