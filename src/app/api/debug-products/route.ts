import { NextResponse } from 'next/server';
import { getMobiMatterProducts } from '@/lib/mobimatter';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const products = await getMobiMatterProducts();

        // Анализ хийх
        const analysis: any = {
            total: products.length,
            duplicates: [],
            byCountry: {},
        };

        // Group by (CountryList + Data + Duration) to find exact duplicates
        const lookup = new Map<string, any[]>();

        products.forEach(p => {
            // Normalize country list
            const countries = [...p.countries].sort().join(",");
            const key = `${countries}|${p.dataAmount}|${p.durationDays}`;

            if (!lookup.has(key)) {
                lookup.set(key, []);
            }
            lookup.get(key)?.push({
                sku: p.sku,
                name: p.name,
                provider: p.provider,
                price: p.price
            });

            // Count by country
            p.countries.forEach(c => {
                analysis.byCountry[c] = (analysis.byCountry[c] || 0) + 1;
            });
        });

        // Find keys with > 1 product
        lookup.forEach((items, key) => {
            if (items.length > 1) {
                analysis.duplicates.push({
                    key: key,
                    count: items.length,
                    items: items
                });
            }
        });

        // Sort duplicates by count desc
        analysis.duplicates.sort((a: any, b: any) => b.count - a.count);

        return NextResponse.json(analysis);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
