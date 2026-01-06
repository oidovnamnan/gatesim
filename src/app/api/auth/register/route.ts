import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { email, password, phone } = await req.json();

        if (!email || !password) {
            return new NextResponse("Email and password are required", { status: 400 });
        }

        if (phone && !/^\d{8}$/.test(phone)) {
            return new NextResponse("Invalid phone number format. Must be 8 digits.", { status: 400 });
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return new NextResponse("User with this email already exists", { status: 409 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                // @ts-ignore - password field relies on schema update which might be pending
                password: hashedPassword,
                phone: phone || null,
                name: email.split("@")[0],
            },
        });

        return NextResponse.json({
            id: user.id,
            email: user.email,
            name: user.name
        });
    } catch (error: any) {
        console.error("REGISTRATION_ERROR", error);
        return new NextResponse(`Registration Error: ${error.message || "Unknown error"}`, { status: 500 });
    }
}
