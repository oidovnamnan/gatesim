
import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { getMobiMatterProducts } from "@/lib/mobimatter";
import { db } from "@/lib/firebase";
import { collection, writeBatch, doc, getCountFromServer, getDocs, query, where } from "firebase/firestore";

export const maxDuration = 300; // Allow 5 minutes for this function

export async function GET(request: Request) {
    try {
        // Security check - Support multiple auth methods
        const { searchParams } = new URL(request.url);
        const secret = searchParams.get("secret");
        const authHeader = request.headers.get("authorization");

        // 1. Vercel Cron sends "Bearer <CRON_SECRET>" header automatically
        // 2. Manual calls can use ?secret=<CRON_SECRET>
        // 3. Dev/test can use ?secret=temp-secret-123
        const isAuthorized =
            (process.env.CRON_SECRET && authHeader === `Bearer ${process.env.CRON_SECRET}`) ||
            (process.env.CRON_SECRET && secret === process.env.CRON_SECRET) ||
            secret === "temp-secret-123";

        if (!isAuthorized) {
            return NextResponse.json({
                error: "Unauthorized",
                hint: "Use ?secret=<CRON_SECRET> or Vercel Cron header"
            }, { status: 401 });
        }

        console.log("[Sync] Starting Product Sync...");
        const syncStartedAt = new Date().toISOString(); // Capture start time for cleanup logic

        // Force revalidation of caches to ensure fresh data during this once-daily run
        // @ts-ignore - Next.js type definition conflict
        revalidateTag('products-raw');
        // @ts-ignore - Next.js type definition conflict
        revalidateTag('products-processed');

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

        // 3. IDENTIFY AND DELETE OBSOLETE PRODUCTS (Safety Circuit Breaker applied)

        // Count total products in DB before deletion to calculate percentage
        const totalProductsSnapshot = await getCountFromServer(collection(db, "products"));
        const totalProductsCount = totalProductsSnapshot.data().count;

        // Query for products that were NOT updated in this sync cycle
        // i.e., their lastSyncedAt is older than syncStartedAt
        const obsoleteQuery = query(
            collection(db, "products"),
            where("lastSyncedAt", "<", syncStartedAt)
        );

        const obsoleteSnapshot = await getDocs(obsoleteQuery);
        const candidatesToDelete = obsoleteSnapshot.docs;
        const deleteCount = candidatesToDelete.length;

        console.log(`[Sync] Cleanup check: Found ${deleteCount} obsolete products (Total in DB: ${totalProductsCount}).`);

        // CIRCUIT BREAKER: If trying to delete more than 10% of total products, ABORT.
        // This prevents mass deletion in case of API bug or partial response.
        const SAFE_DELETE_THRESHOLD_PERCENT = 0.10; // 10%
        const maxAllowedDelete = Math.ceil(totalProductsCount * SAFE_DELETE_THRESHOLD_PERCENT);

        let deletedCount = 0;

        if (deleteCount > 0) {
            if (deleteCount > maxAllowedDelete) {
                console.error(`[Sync] 🚨 CIRCUIT BREAKER TRIGGERED!`);
                console.error(`[Sync] Attempted to delete ${deleteCount} items, which is > ${maxAllowedDelete} (10% of total).`);
                console.error(`[Sync] Deletion ABORTED to protect data.`);
                // We do NOT delete anything.
            } else {
                console.log(`[Sync] Deletion count (${deleteCount}) is within safe limits. Proceeding with cleanup...`);

                // Delete in batches
                const deleteBatches = [];
                const deleteBatchSize = 300;

                for (let i = 0; i < deleteCount; i += deleteBatchSize) {
                    const chunk = candidatesToDelete.slice(i, i + deleteBatchSize);
                    const batch = writeBatch(db);
                    chunk.forEach(doc => batch.delete(doc.ref));
                    deleteBatches.push(batch.commit());
                }

                await Promise.all(deleteBatches);
                deletedCount = deleteCount;
                console.log(`[Sync] Successfully deleted ${deletedCount} obsolete products.`);
            }
        } else {
            console.log("[Sync] No obsolete products found to delete.");
        }

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
            message: `Synced ${totalWritten} products. Deleted ${deletedCount} obsolete items.`,
            syncedCount: totalWritten,
            deletedCount: deletedCount,
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
