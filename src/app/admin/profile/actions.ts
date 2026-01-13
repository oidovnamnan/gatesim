"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function updateProfile(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session?.user?.email) {
        return { message: "Unauthorized", success: false };
    }

    const name = formData.get("name") as string;
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return { message: "User not found", success: false };
        }

        const updates: any = {};
        if (name) updates.name = name;

        // Password Change Logic
        if (newPassword) {
            // If user has a password set, verify current
            if (user.password) {
                if (!currentPassword) {
                    return { message: "Current password is required", success: false };
                }
                const isValid = await bcrypt.compare(currentPassword, user.password);
                if (!isValid) {
                    return { message: "Current password incorrect", success: false };
                }
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            updates.password = hashedPassword;
        }

        await prisma.user.update({
            where: { email: session.user.email },
            data: updates,
        });

        revalidatePath("/admin/profile");
        return { message: "Profile updated successfully", success: true };
    } catch (e) {
        console.error("Profile update failed:", e);
        return { message: "Failed to update profile", success: false };
    }
}
