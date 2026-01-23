"use server";

import { syncProductsToDB } from "@/lib/products-db";

export async function syncPackages() {
    try {
        const result = await syncProductsToDB();

        console.log("Packages synced successfully:", result);
        return result;
    } catch (error) {
        console.error("Failed to sync packages:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to sync packages" };
    }
}
