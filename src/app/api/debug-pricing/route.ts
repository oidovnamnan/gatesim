
import { NextResponse } from 'next/server';
import { getPricingSettings } from '@/lib/settings';
import { getMobiMatterProducts } from '@/lib/mobimatter';

export async function GET() {
    try {
        // 1. Get Settings
        const settings = await getPricingSettings();

        // 2. Fetch one product to see raw data
        // We need to bypass getMobiMatterProducts transformation to see raw data first, 
        // but since I can't easily duplicate that fetch code here without clutter, 
        // I will inspect the output of getMobiMatterProducts and reverse-engineer,
        // OR I will fetch raw data manually here.

        const products = await getMobiMatterProducts();
        const sampleProduct = products[0];

        // Fetch raw manually to compare
        let rawSample = null;
        if (process.env.MOBIMATTER_API_KEY && process.env.MOBIMATTER_MERCHANT_ID) {
            const res = await fetch("https://api.mobimatter.com/mobimatter/api/v2/products", {
                headers: {
                    'api-key': process.env.MOBIMATTER_API_KEY,
                    'merchantId': process.env.MOBIMATTER_MERCHANT_ID,
                    'Accept': 'application/json'
                },
                next: { revalidate: 0 }
            });
            const data = await res.json();
            const list = Array.isArray(data) ? data : (data.result || []);
            rawSample = list[0];
        }

        return NextResponse.json({
            settings,
            sampleProductCalculated: sampleProduct ? {
                name: sampleProduct.name,
                price: sampleProduct.price,
                currency: sampleProduct.currency
            } : "No products found",
            rawSampleData: rawSample ? {
                retailPrice: rawSample.retailPrice,
                currencyCode: rawSample.currencyCode,
                title: rawSample.productCategory
            } : "Could not fetch raw data"
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
