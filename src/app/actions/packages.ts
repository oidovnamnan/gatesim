"use server";

import { revalidatePath } from "next/cache";

export async function syncPackages() {
    try {
        revalidatePath("/admin/packages");
        return { success: true };
    } catch (error) {
        console.error("Failed to revalidate packages:", error);
        return { success: false, error: "Failed to sync packages" };
    }
}
