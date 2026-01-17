
import { NextResponse } from "next/server";
import { getMobiMatterProducts } from "@/lib/mobimatter";
import { db } from "@/lib/firebase";
import { collection, writeBatch, doc } from "firebase/firestore";

export const maxDuration = 300; // Allow 5 minutes for this function

export async function GET(request: Request) {
    try {
        // Security check (Basic secret query param)
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
            return NextResponse.json({ error: "No packages found" }, { status: 500 });
        }

        console.log(`[Sync] Found ${packages.length} packages. writing to Firestore...`);

        // Batch writes (limit 500 per batch)
        const batchSize = 450;
        const chunks = [];

        for (let i = 0; i < packages.length; i += batchSize) {
            chunks.push(packages.slice(i, i + batchSize));
        }

        let totalWritten = 0;

        for (const chunk of chunks) {
            const batch = writeBatch(db);

            chunk.forEach((pkg) => {
                const docRef = doc(db, "products", pkg.sku);
                batch.set(docRef, {
                    ...pkg,
                    lastSyncedAt: new Date().toISOString(),
                    // Flatten countries for querying if needed, but existing array is fine
                    // We might add 'searchKeywords' here for easier querying later
                }, { merge: true });
            });

            await batch.commit();
            totalWritten += chunk.length;
            console.log(`[Sync] Committed batch of ${chunk.length} items.`);
        }

        return NextResponse.json({
            success: true,
            message: `Synced ${totalWritten} products successfully.`,
            count: totalWritten
        });

    } catch (error) {
        console.error("[Sync] Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
