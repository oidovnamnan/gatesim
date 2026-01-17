
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, limit, orderBy } from "firebase/firestore";
import { MobiMatterProduct } from "./mobimatter";

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

