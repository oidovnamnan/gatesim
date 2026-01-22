import { Suspense } from "react";
import { getMobiMatterProducts } from "@/lib/mobimatter";
import PackagesClient from "./packages-client";

function formatDataAmount(mb: number): string {
    if (mb === -1) return "Unlimited";
    if (mb >= 1024) return `${(mb / 1024).toFixed(0)} GB`;
    return `${mb} MB`;
}

// This page is Static and updated On-Demand (via /api/cron/sync-products)
// No time-based revalidation needed as per user request

import { getProductsFromDB } from "@/lib/products-db";

export default async function PackagesPage() {
    // 1. Try DB first (Fast & Robust)
    let products = await getProductsFromDB({});

    // 2. Fallback to API if DB is empty
    if (!products || products.length === 0) {
        console.log("[PackagesPage] DB empty, falling back to API cache");
        products = await getMobiMatterProducts();
    }

    const packages = products.map((product) => {
        return {
            id: product.sku,
            title: product.name,
            operatorTitle: product.provider,
            data: formatDataAmount(product.dataAmount),
            validityDays: product.durationDays,
            price: product.price, // Already MNT and calculated
            currency: "MNT",
            countries: product.countries,
            isUnlimited: product.dataAmount === -1,
            isPopular: product.countries.includes("MN") || product.countries.includes("JP") || product.countries.includes("KR"),
            isFeatured: false,
        };
    });


    return (
        <Suspense fallback={<div className="min-h-screen" />}>
            <PackagesClient initialPackages={packages} />
        </Suspense>
    );
}
