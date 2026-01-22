"use server";

import { revalidatePath, revalidateTag } from "next/cache";

export async function syncPackages() {
    try {
        // Revalidate the unstable_cache tags used by getMobiMatterProducts
        // @ts-ignore - Next.js type definition conflict
        revalidateTag('products-processed');
        // @ts-ignore - Next.js type definition conflict
        revalidateTag('products-raw');

        // Also revalidate the pages
        revalidatePath("/admin/packages");
        revalidatePath("/packages");

        console.log("Packages synced successfully");
        return { success: true };
    } catch (error) {
        console.error("Failed to revalidate packages:", error);
        return { success: false, error: "Failed to sync packages" };
    }
}
