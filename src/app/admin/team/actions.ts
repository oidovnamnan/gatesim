"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

type UserRole = "USER" | "ADMIN" | "STAFF";

export async function addTeamMember(prevState: any, formData: FormData) {
    const session = await auth();
    // @ts-ignore
    const currentUserRole = session?.user?.role;

    // Only Super Admin can add team members (Security Check)
    // For now allowing regular ADMIN too based on config, but ideally restricted
    if (currentUserRole !== "super_admin" && currentUserRole !== "admin") {
        return { message: "Unauthorized", success: false };
    }

    const email = formData.get("email") as string;
    const role = formData.get("role") as UserRole;

    if (!email || !role) {
        return { message: "Email and Role are required", success: false };
    }

    try {
        await prisma.user.upsert({
            where: { email },
            update: { role: role as any },
            create: {
                email,
                role: role as any
            },
        });
        revalidatePath("/admin/team");
        return { message: "Success", success: true };
    } catch (e) {
        console.error("Failed to add team member", e);
        return { message: "Failed to add member", success: false };
    }
}

export async function removeTeamMember(email: string) {
    const session = await auth();
    // @ts-ignore
    const currentUserRole = session?.user?.role;

    if (currentUserRole !== "super_admin" && currentUserRole !== "admin") {
        return { message: "Unauthorized", success: false };
    }

    try {
        await prisma.user.update({
            where: { email },
            data: { role: "USER" as any },
        });
        revalidatePath("/admin/team");
        return { success: true };
    } catch (e) {
        console.error("Failed to remove team member", e);
        return { success: false };
    }
}

export async function updateTeamMemberRole(email: string, newRole: UserRole) {
    const session = await auth();
    // @ts-ignore
    const currentUserRole = session?.user?.role;

    if (currentUserRole !== "super_admin" && currentUserRole !== "admin") {
        return { message: "Unauthorized", success: false };
    }

    try {
        await prisma.user.update({
            where: { email },
            data: { role: newRole as any },
        });
        revalidatePath("/admin/team");
        return { success: true };
    } catch (e) {
        console.error("Failed to update team member role", e);
        return { success: false };
    }
}
