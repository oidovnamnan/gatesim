"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

// Temporary type until Prisma generate runs
type UserRole = "USER" | "ADMIN" | "STAFF";

export async function addTeamMember(prevState: any, formData: FormData) {
    const session = await auth();
    // In real app, verify session.user.role is ADMIN

    const email = formData.get("email") as string;
    const role = formData.get("role") as UserRole;

    if (!email || !role) {
        return { message: "Email and Role are required" };
    }

    try {
        await prisma.user.upsert({
            where: { email },
            update: { role: role as any }, // cast as any until schema updated
            create: {
                email,
                role: role as any
            },
        });
        revalidatePath("/admin/team");
        return { message: "Success", success: true };
    } catch (e) {
        console.error("Failed to add team member", e);
        return { message: "Failed to add member" };
    }
}

export async function removeTeamMember(email: string) {
    try {
        await prisma.user.update({
            where: { email },
            data: { role: "USER" as any },
        });
        revalidatePath("/admin/team");
    } catch (e) {
        console.error("Failed to remove team member", e);
    }
}
