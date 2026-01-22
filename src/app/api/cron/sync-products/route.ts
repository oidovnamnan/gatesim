
import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { getMobiMatterProducts } from "@/lib/mobimatter";
import { db } from "@/lib/firebase";
import { collection, writeBatch, doc } from "firebase/firestore";

export const maxDuration = 300; // Allow 5 minutes for this function

export async function GET(request: Request) {
    try {
        // Security check
        const { searchParams } = new URL(request.url);
        const secret = searchParams.get("secret");

        // Allow EITHER the production env secret OR the temp secret for manual run
        const isAuthorized =
            (process.env.CRON_SECRET && secret === process.env.CRON_SECRET) ||
            secret === "temp-secret-123";

        if (!isAuthorized) {
            return NextResponse.json({
                error: "Unauthorized",
                hint: "Use ?secret=temp-secret-123"
            }, { status: 401 });
        }

        console.log("[Sync] Starting Product Sync...");
        const packages = await getMobiMatterProducts();

        if (!packages || packages.length === 0) {
            console.error("[Sync] No packages found from API.");
            return NextResponse.json({ error: "No packages found from API" }, { status: 500 });
        }

        console.log(`[Sync] Found ${packages.length} packages. Writing to Firestore...`);

        // Batch writes - Optimized size (300 is safer for heavily throttled environments)
        const batchSize = 300;
        const chunks = [];

        for (let i = 0; i < packages.length; i += batchSize) {
            chunks.push(packages.slice(i, i + batchSize));
        }

        let totalWritten = 0;

        for (const [index, chunk] of chunks.entries()) {
            const batch = writeBatch(db);

            chunk.forEach((pkg) => {
                // Ensure SKU is valid for ID
                if (!pkg.sku) return;

                const docRef = doc(db, "products", pkg.sku);
                batch.set(docRef, {
                    ...pkg,
                    lastSyncedAt: new Date().toISOString(),
                    keywords: [
                        ...(pkg.countries || []),
                        pkg.name,
                        pkg.provider
                    ].map(k => k?.toString().toLowerCase()).filter(Boolean)
                }, { merge: true });
            });

            await batch.commit();
            totalWritten += chunk.length;
            console.log(`[Sync] Batch ${index + 1}/${chunks.length} committed (${chunk.length} items).`);
        }

        // Optional: Clean up old items? (For now, let's just upsert)

        // IMPORTANT: Bust Next.js cache for packages pages
        try {
            revalidatePath('/packages');
            revalidatePath('/'); // Home page might show featured packages
            console.log('[Sync] Cache invalidated for /packages and /');
        } catch (cacheError) {
            console.warn('[Sync] Cache invalidation failed (non-critical):', cacheError);
        }

        return NextResponse.json({
            success: true,
            message: `Successfully synced ${totalWritten} products from MobiMatter to Firestore.`,
            count: totalWritten,
            batches: chunks.length
        });

    } catch (error) {
        console.error("[Sync] Critical Error:", error);
        return NextResponse.json({
            error: "Internal Server Error",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
