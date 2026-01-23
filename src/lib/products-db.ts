
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, limit, orderBy, writeBatch, doc, getCountFromServer } from "firebase/firestore";
import { MobiMatterProduct, getMobiMatterProducts } from "./mobimatter";
import { revalidatePath, revalidateTag } from "next/cache";

export async function getProductsFromDB(options: {
    countryCode?: string;
    limitCount?: number;
}): Promise<MobiMatterProduct[]> {
    try {
        const productsRef = collection(db, "products");
        let q = query(productsRef);

        // 1. Filter by Country
        if (options.countryCode) {
            // Firestore array-contains filter
            q = query(q, where("countries", "array-contains", options.countryCode.toUpperCase()));
        }

        // 2. Sorting (requires index usually, but for small datasets might work)
        // Check if index exists error happens. For now, let's just fetch and sort in memory if needed
        // But Firestore requires 'price' sort to be part of the query if we limit.
        // Let's rely on basic filtering first. 

        // Note: Firestore requires composite indexes for multiple fields.
        // We will fetch filtered by country (usually 20-50 items) and sort in JS
        // This avoids complex index requirements for now.

        const snapshot = await getDocs(q);

        const products: MobiMatterProduct[] = [];
        snapshot.forEach((doc) => {
            products.push(doc.data() as MobiMatterProduct);
        });

        // Sort by price ascending default
        products.sort((a, b) => a.price - b.price);

        return products;

    } catch (error) {
        console.error("[DB Read] Error getting products:", error);
        return [];
    }
}

export async function getProductBySku(sku: string): Promise<MobiMatterProduct | null> {
    try {
        const productsRef = collection(db, "products");
        const q = query(productsRef, where("sku", "==", sku), limit(1));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return null;
        }

        return snapshot.docs[0].data() as MobiMatterProduct;
    } catch (error) {
        console.error("[DB Read] Error getting product by SKU:", error);
        return null;
    }
}

export async function syncProductsToDB() {
    console.log("[Sync] Starting Product Sync...");
    const syncStartedAt = new Date().toISOString();

    // 1. Force revalidation of API caches
    // @ts-ignore
    revalidateTag('products-raw');
    // @ts-ignore
    revalidateTag('products-processed');

    const packages = await getMobiMatterProducts();

    if (!packages || packages.length === 0) {
        throw new Error("No packages found from API");
    }

    // 2. Write to Firestore in batches
    const batchSize = 300;
    const chunks = [];
    for (let i = 0; i < packages.length; i += batchSize) {
        chunks.push(packages.slice(i, i + batchSize));
    }

    let totalWritten = 0;
    for (const chunk of chunks) {
        const batch = writeBatch(db);
        chunk.forEach((pkg) => {
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
    }

    // 3. Cleanup Obsolete Products
    const totalProductsSnapshot = await getCountFromServer(collection(db, "products"));
    const totalProductsCount = totalProductsSnapshot.data().count;

    const obsoleteQuery = query(
        collection(db, "products"),
        where("lastSyncedAt", "<", syncStartedAt)
    );

    const obsoleteSnapshot = await getDocs(obsoleteQuery);
    const candidatesToDelete = obsoleteSnapshot.docs;
    const deleteCount = candidatesToDelete.length;

    // Circuit Breaker (10%)
    const SAFE_DELETE_THRESHOLD_PERCENT = 0.10;
    const maxAllowedDelete = Math.ceil(totalProductsCount * SAFE_DELETE_THRESHOLD_PERCENT);

    let deletedCount = 0;
    if (deleteCount > 0 && deleteCount <= maxAllowedDelete) {
        const deleteBatches = [];
        for (let i = 0; i < deleteCount; i += batchSize) {
            const chunk = candidatesToDelete.slice(i, i + batchSize);
            const batch = writeBatch(db);
            chunk.forEach(doc => batch.delete(doc.ref));
            deleteBatches.push(batch.commit());
        }
        await Promise.all(deleteBatches);
        deletedCount = deleteCount;
    }

    // 4. Invalidate Pages
    try {
        revalidatePath('/packages');
        revalidatePath('/');
    } catch (e) {
        console.warn("[Sync] Revalidation non-critical error:", e);
    }

    return {
        success: true,
        syncedCount: totalWritten,
        deletedCount: deletedCount
    };
}
