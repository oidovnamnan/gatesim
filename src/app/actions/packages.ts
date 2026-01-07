"use server";

import { revalidatePath } from "next/cache";

export async function syncPackages() {
    try {
        revalidatePath("/admin/packages");
        // Also revalidate the main packages page if it uses the same cache tag or path
        revalidatePath("/packages");

        console.log("Packages synced successfully");
        return { success: true };
    } catch (error) {
        console.error("Failed to revalidate packages:", error);
        return { success: false, error: "Failed to sync packages" };
    }
}
