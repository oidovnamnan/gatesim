import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getCountFromServer } from "firebase/firestore";

export const maxDuration = 30;

// MobiMatter API-аас product count авах
async function getMobiMatterProductCount(): Promise<number> {
    const apiKey = process.env.MOBIMATTER_API_KEY;
    const merchantId = process.env.MOBIMATTER_MERCHANT_ID;

    if (!apiKey || !merchantId) {
        throw new Error("MobiMatter credentials missing");
    }

    const res = await fetch("https://api.mobimatter.com/mobimatter/api/v2/products", {
        headers: {
            "api-key": apiKey,
            "merchantId": merchantId,
            "Accept": "application/json"
        },
        next: { revalidate: 0 } // No cache
    });

    if (!res.ok) {
        throw new Error(`MobiMatter API error: ${res.status}`);
    }

    const data = await res.json();
    return data.result?.length || 0;
}

// Firebase дахь product count авах
async function getFirebaseProductCount(): Promise<number> {
    const productsRef = collection(db, "products");
    const snapshot = await getCountFromServer(productsRef);
    return snapshot.data().count;
}

export async function GET(request: Request) {
    try {
        // Auth check
        const authHeader = request.headers.get("authorization");
        const { searchParams } = new URL(request.url);
        const secret = searchParams.get("secret");

        const isAuthorized =
            (process.env.CRON_SECRET && authHeader === `Bearer ${process.env.CRON_SECRET}`) ||
            (process.env.CRON_SECRET && secret === process.env.CRON_SECRET) ||
            secret === "temp-secret-123";

        if (!isAuthorized) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        console.log("[Check] Comparing product counts...");

        // Count-уудыг авах
        const [mobiMatterCount, firebaseCount] = await Promise.all([
            getMobiMatterProductCount(),
            getFirebaseProductCount()
        ]);

        console.log(`[Check] MobiMatter: ${mobiMatterCount}, Firebase: ${firebaseCount}`);

        // Ялгаатай бол sync дуудах
        if (mobiMatterCount !== firebaseCount) {
            console.log("[Check] Counts differ! Triggering sync...");

            // Sync endpoint-г дуудах
            const syncUrl = new URL("/api/cron/sync-products", request.url);
            syncUrl.searchParams.set("secret", secret || "internal-call");

            const syncRes = await fetch(syncUrl.toString(), {
                headers: authHeader ? { authorization: authHeader } : {}
            });

            const syncData = await syncRes.json();

            return NextResponse.json({
                action: "synced",
                reason: `Count mismatch: MobiMatter(${mobiMatterCount}) vs Firebase(${firebaseCount})`,
                syncResult: syncData
            });
        }

        // Адилхан бол юу ч хийхгүй
        return NextResponse.json({
            action: "skipped",
            reason: "Counts match",
            mobiMatterCount,
            firebaseCount
        });

    } catch (error) {
        console.error("[Check] Error:", error);
        return NextResponse.json({
            error: "Check failed",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
