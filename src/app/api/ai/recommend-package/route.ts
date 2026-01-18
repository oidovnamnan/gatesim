import { NextRequest, NextResponse } from "next/server";
import { getProductsFromDB } from "@/lib/products-db";
import { getMobiMatterProducts } from "@/lib/mobimatter";

export const dynamic = 'force-dynamic';

// Map country names to ISO codes
const countryNameToCode: Record<string, string> = {
    "china": "CN", "хятад": "CN",
    "japan": "JP", "япон": "JP",
    "korea": "KR", "солонгос": "KR",
    "thailand": "TH", "тайланд": "TH",
    "singapore": "SG", "сингапур": "SG",
    "vietnam": "VN", "вьетнам": "VN",
    "turkey": "TR", "турк": "TR",
    "usa": "US", "америк": "US", "us": "US",
    "russia": "RU", "орос": "RU",
};

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const countryParam = searchParams.get("country");
    const durationStr = searchParams.get("duration");
    const duration = durationStr ? parseInt(durationStr) : 7;

    if (!countryParam) {
        return NextResponse.json({ success: false, error: "Country required" }, { status: 400 });
    }

    // Normalize country to ISO code
    const lowerParam = countryParam.toLowerCase().trim();
    let targetCountry = countryNameToCode[lowerParam] || countryParam.toUpperCase();

    // Handle common 2-letter codes that might have different casing
    if (targetCountry.length === 2) {
        targetCountry = targetCountry.toUpperCase();
    }

    try {
        // 1. Try DB first (fast)
        let products = await getProductsFromDB({ countryCode: targetCountry });

        // 2. Fallback to API if DB is empty
        if (products.length === 0) {
            console.log("[RecommendPackage] DB empty for", targetCountry, ", falling back to API");
            const allProducts = await getMobiMatterProducts();
            products = allProducts.filter(p => p.countries.includes(targetCountry));
        }

        if (products.length === 0) {
            return NextResponse.json({ success: false, message: `No packages found for ${targetCountry}` });
        }

        // 2. Filter by Duration (must cover the trip, or close to it)
        // We prefer plans that are >= duration.
        // If no plan covers the full duration, we'll fall back to any plan (user can buy multiple).
        const sufficientDuration = products.filter(p => p.durationDays >= duration);

        let candidates = sufficientDuration.length > 0 ? sufficientDuration : products;

        // 3. Sort with smarter scoring:
        // - Prefer packages with duration closest to requested (but >= duration)
        // - Within similar durations, prefer cheaper packages
        // - Score = (duration difference) * DURATION_WEIGHT + (price normalized)

        const maxPrice = Math.max(...candidates.map(p => p.price));
        const DURATION_WEIGHT = 5000; // Penalty per extra day (in MNT-equivalent score)

        candidates.sort((a, b) => {
            // Duration difference from ideal (0 is perfect match, higher is worse)
            const aDurationDiff = Math.abs(a.durationDays - duration);
            const bDurationDiff = Math.abs(b.durationDays - duration);

            // Prefer exact or close match first
            // If duration is very close (within 3 days), prefer by price
            // Otherwise, prefer by duration closeness
            if (Math.abs(aDurationDiff - bDurationDiff) > 3) {
                return aDurationDiff - bDurationDiff; // Prefer closer duration
            }

            // Same or similar duration - prefer cheaper
            return a.price - b.price;
        });

        // Pick the best one
        // We might want to avoid "Global" plans if a local one exists and is cheaper? 
        // Logic handled by price sort usually.

        const bestPackage = candidates[0];

        return NextResponse.json({
            success: true,
            package: bestPackage
        });

    } catch (error) {
        console.error("Recommendation Error:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
