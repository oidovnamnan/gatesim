import { getMobiMatterProducts } from "@/lib/mobimatter";
import PackagesClient from "./packages-client";
import { getPricingSettings } from "@/lib/settings"; // Fetch settings DIRECTLY once

function formatDataAmount(mb: number): string {
    if (mb === -1) return "Unlimited";
    if (mb >= 1024) return `${(mb / 1024).toFixed(0)} GB`;
    return `${mb} MB`;
}

// Optimized helper to calculate price without refetching DB
function calculateOptimizedPrice(netPriceUSD: number, usdToMnt: number, marginPercent: number) {
    let applicableMargin = marginPercent;

    if (netPriceUSD <= 5) applicableMargin = Math.min(marginPercent, 15);
    else if (netPriceUSD <= 15) applicableMargin = marginPercent;
    else applicableMargin = marginPercent;

    const marginMultiplier = 1 + applicableMargin / 100;
    const rawPriceMNT = netPriceUSD * usdToMnt * marginMultiplier;
    return Math.ceil(rawPriceMNT / 100) * 100;
}

export const dynamic = 'force-dynamic';

export default async function PackagesPage() {
    // PARALLEL FETCHING: Fetch products and settings at the same time
    const [products, settings] = await Promise.all([
        getMobiMatterProducts(),
        getPricingSettings()
    ]);

    const { usdToMnt, marginPercent } = settings;

    // Fast synchronous mapping (No DB calls inside loop)
    const packages = products.map((product) => {
        const sellPrice = calculateOptimizedPrice(product.price, usdToMnt, marginPercent);

        return {
            id: product.sku,
            title: product.name,
            operatorTitle: product.provider,
            data: formatDataAmount(product.dataAmount),
            validityDays: product.durationDays,
            price: sellPrice,
            currency: "MNT",
            countries: product.countries,
            isUnlimited: product.dataAmount === -1,
            isPopular: product.countries.includes("MN") || product.countries.includes("JP") || product.countries.includes("KR"),
            isFeatured: false,
        };
    });

    return <PackagesClient initialPackages={packages} />;
}
