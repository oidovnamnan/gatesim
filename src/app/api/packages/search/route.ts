import { NextResponse } from 'next/server';
import { getMobiMatterProducts } from '@/lib/mobimatter';
import { getPricingSettings } from '@/lib/settings';
import { getCountryName } from '@/config/countries';

export const dynamic = 'force-dynamic';

// Helper to calculate price
function calculatePrice(netPriceUSD: number, usdToMnt: number, marginPercent: number) {
    let applicableMargin = marginPercent;
    if (netPriceUSD <= 5) applicableMargin = Math.min(marginPercent, 15);
    const marginMultiplier = 1 + applicableMargin / 100;
    const rawPriceMNT = netPriceUSD * usdToMnt * marginMultiplier;
    return Math.ceil(rawPriceMNT / 100) * 100;
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        // Parse query params
        const country = searchParams.get('country')?.toUpperCase();
        const minDays = parseInt(searchParams.get('minDays') || '0');
        const maxDays = parseInt(searchParams.get('maxDays') || '365');
        const minData = parseInt(searchParams.get('minData') || '0'); // in MB
        const maxData = parseInt(searchParams.get('maxData') || '999999'); // in MB
        const limit = parseInt(searchParams.get('limit') || '20');
        const query = searchParams.get('q')?.toLowerCase(); // text search

        const [products, settings] = await Promise.all([
            getMobiMatterProducts(),
            getPricingSettings()
        ]);

        const { usdToMnt, marginPercent } = settings;

        // Filter and transform
        let packages = products
            .filter(p => {
                // Country filter
                if (country && !p.countries.includes(country)) return false;

                // Duration filter
                if (p.durationDays < minDays || p.durationDays > maxDays) return false;

                // Data filter (handle unlimited = -1)
                if (p.dataAmount !== -1) {
                    if (p.dataAmount < minData || p.dataAmount > maxData) return false;
                }

                // Text search
                if (query) {
                    const searchText = `${p.name} ${p.provider} ${p.countries.join(' ')}`.toLowerCase();
                    if (!searchText.includes(query)) return false;
                }

                return true;
            })
            .map(p => ({
                id: p.sku,
                title: p.name,
                provider: p.provider,
                data: p.dataAmount === -1 ? "Unlimited" : (p.dataAmount >= 1024 ? `${(p.dataAmount / 1024).toFixed(0)} GB` : `${p.dataAmount} MB`),
                dataAmount: p.dataAmount,
                validityDays: p.durationDays,
                price: p.price,
                countries: p.countries,
                countryName: getCountryName(p.countries[0]),
            }));

        // Deduplicate by country+data+duration, keep cheapest
        const groups = new Map<string, typeof packages[0]>();
        packages.forEach(pkg => {
            const key = `${pkg.countries.sort().join(',')}-${pkg.dataAmount}-${pkg.validityDays}`;
            const existing = groups.get(key);
            if (!existing || pkg.price < existing.price) {
                groups.set(key, pkg);
            }
        });
        packages = Array.from(groups.values());

        // Sort by price
        packages.sort((a, b) => a.price - b.price);

        // Limit results
        packages = packages.slice(0, limit);

        return NextResponse.json({
            success: true,
            count: packages.length,
            packages: packages
        });

    } catch (error: any) {
        console.error("Package search error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
