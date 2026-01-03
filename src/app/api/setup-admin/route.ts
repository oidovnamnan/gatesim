
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
    try {
        const password = await bcrypt.hash('admin123', 10);
        const email = 'admin@gatesim.travel';

        await prisma.user.upsert({
            where: { email },
            update: { password },
            create: {
                email,
                name: 'Admin User',
                password,
            },
        });

        return NextResponse.json({
            success: true,
            message: `Admin user ${email} created successfully on PRODUCTION DB`,
            credentials: {
                email,
                password: 'admin123'
            }
        });
    } catch (e: any) {
        console.error("Setup admin error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
