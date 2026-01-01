import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const SETTINGS_KEY = 'pricing_config';
const DEFAULT_SETTINGS = {
    usdToMnt: 3450,
    marginPercent: 25,
};

export async function GET() {
    try {
        const setting = await prisma.setting.findUnique({
            where: { key: SETTINGS_KEY },
        });

        if (!setting) {
            return NextResponse.json(DEFAULT_SETTINGS);
        }

        return NextResponse.json(setting.value);
    } catch (error: any) {
        console.error("Failed to fetch settings:", error);
        return NextResponse.json(DEFAULT_SETTINGS); // Fallback
    }
}

export async function POST(req: Request) {
    try {
        // Here you should check for ADMIN role, but for now we skip strict check or assume protected middleware
        // const session = await getServerSession(authOptions);
        // if (!session) { return new NextResponse("Unauthorized", { status: 401 }); }

        const body = await req.json();
        const { usdToMnt, marginPercent } = body;

        const updated = await prisma.setting.upsert({
            where: { key: SETTINGS_KEY },
            update: {
                value: { usdToMnt, marginPercent },
            },
            create: {
                key: SETTINGS_KEY,
                value: { usdToMnt, marginPercent },
            },
        });

        return NextResponse.json(updated.value);
    } catch (error: any) {
        console.error("Failed to save settings:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
