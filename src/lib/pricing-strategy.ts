import { getPricingSettings } from "./settings";

/**
 * Calculates the selling price based on a tiered margin strategy.
 * This allows us to be competitive on low-cost items (matching AmarSim/DSim)
 * while maintaining healthy profits on larger packages.
 * 
 * Strategy:
 * - Low Cost Items (< $5): Lower Margin to compete with entry-level prices (e.g. 1GB/3GB).
 * - Mid Cost Items ($5 - $15): Standard Margin.
 * - High Cost Items (> $15): Standard or slightly lower Margin to keep total price attractive.
 */
export async function calculateSellPrice(netPriceUSD: number): Promise<{ price: number, currency: string }> {
    const settings = await getPricingSettings();
    const { usdToMnt, marginPercent } = settings;

    // Base Calculation
    const exchangeRate = usdToMnt;
    let applicableMargin = marginPercent;

    // DYNAMIC TIERED PRICING STRATEGY
    // Override the global margin based on price point to stay competitive
    if (netPriceUSD <= 5) {
        // Entry level (1GB - 3GB)
        // Competitor (AmarSim) sells 1GB for ~5,000₮ ($1.45) on cost ~$1.2-$1.4
        // We need slim margins here.
        // If Global Margin is 25%, we reduce it to 15% for cheap items.
        applicableMargin = Math.min(marginPercent, 15);
    } else if (netPriceUSD <= 15) {
        // Mid range (5GB - 10GB)
        // Standard margin applies
        applicableMargin = marginPercent;
    } else {
        // High ticket items (> $15) e.g. 20GB, Unlimited
        // Keep attractive.
        applicableMargin = marginPercent;
    }

    const marginMultiplier = 1 + applicableMargin / 100;
    const rawPriceMNT = netPriceUSD * exchangeRate * marginMultiplier;

    // Rounding strategy:
    // Round to nearest 100 MNT for clean pricing (e.g., 5230 -> 5300)
    // Or maybe pseudo-psychological pricing (e.g. 19,900)? Let's stick to clean 100s for now.
    const sellPrice = Math.ceil(rawPriceMNT / 100) * 100;

    return {
        price: sellPrice,
        currency: "MNT"
    };
}
