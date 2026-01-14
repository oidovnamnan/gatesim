import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// POST /api/auth/reset-password/confirm - Confirm password reset
export async function POST(request: NextRequest) {
    try {
        const { token, password } = await request.json();

        if (!token || !password) {
            return NextResponse.json(
                { error: "Токен болон шинэ нууц үг шаардлагатай" },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: "Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой" },
                { status: 400 }
            );
        }

        // Hash the token to compare with database
        const tokenHash = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        // Find user with valid token
        const user = await prisma.user.findFirst({
            where: {
                passwordResetToken: tokenHash,
                passwordResetExpires: {
                    gt: new Date()
                }
            }
        });

        if (!user) {
            return NextResponse.json(
                { error: "Токен буруу эсвэл хугацаа дууссан байна" },
                { status: 400 }
            );
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Update user password and clear reset token
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                passwordResetToken: null,
                passwordResetExpires: null
            }
        });

        return NextResponse.json({
            success: true,
            message: "Нууц үг амжилттай солигдлоо. Одоо нэвтэрч болно."
        });
    } catch (error) {
        console.error("Password reset confirm error:", error);
        return NextResponse.json(
            { error: "Алдаа гарлаа. Дахин оролдоно уу." },
            { status: 500 }
        );
    }
}
