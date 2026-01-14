import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MailService } from "@/lib/mail";
import crypto from "crypto";

// POST /api/auth/reset-password - Request password reset
export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: "И-мэйл хаяг оруулна уу" },
                { status: 400 }
            );
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });

        // Always return success even if user not found (security)
        if (!user) {
            return NextResponse.json({
                success: true,
                message: "Хэрэв бүртгэлтэй имэйл бол нууц үг сэргээх линк илгээгдлээ."
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenHash = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        // Token expires in 1 hour
        const resetExpires = new Date(Date.now() + 60 * 60 * 1000);

        // Save token to database
        await prisma.user.update({
            where: { id: user.id },
            data: {
                passwordResetToken: resetTokenHash,
                passwordResetExpires: resetExpires
            }
        });

        // Create reset URL
        const baseUrl = process.env.NEXTAUTH_URL || "https://gatesim.travel";
        const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

        // Send email
        await MailService.sendPasswordReset(email, resetUrl);

        return NextResponse.json({
            success: true,
            message: "Нууц үг сэргээх линк таны и-мэйл рүү илгээгдлээ."
        });
    } catch (error) {
        console.error("Password reset error:", error);
        return NextResponse.json(
            { error: "Алдаа гарлаа. Дахин оролдоно уу." },
            { status: 500 }
        );
    }
}
