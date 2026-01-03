import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

const SETTINGS_KEY = 'pricing_config';
const DEFAULT_SETTINGS = {
    usdToMnt: 3450,
    marginPercent: 25,
};

// Admin emails that are allowed to access admin APIs
const ADMIN_EMAILS = [
    'admin@gatesim.mn', // Keep old one just in case
    'admin@gatesim.travel', // New correct email
    'suren@gatesim.mn',
    // Add more admin emails here
];

async function verifyAdmin() {
    const session = await auth();
    if (!session?.user?.email) {
        return { authorized: false, error: 'Нэвтрээгүй байна' };
    }

    // Check if user email is in admin list
    if (!ADMIN_EMAILS.includes(session.user.email)) {
        return { authorized: false, error: 'Админ эрхгүй байна' };
    }

    return { authorized: true, user: session.user };
}

export async function GET() {
    try {
        // Settings GET is public (needed for pricing display)
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
        // 🔐 AUTHENTICATION CHECK
        const adminCheck = await verifyAdmin();
        if (!adminCheck.authorized) {
            console.warn(`Unauthorized admin access attempt`);
            return NextResponse.json(
                { error: adminCheck.error },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { usdToMnt, marginPercent } = body;

        // Validate input
        if (typeof usdToMnt !== 'number' || typeof marginPercent !== 'number') {
            return NextResponse.json(
                { error: 'Буруу өгөгдөл' },
                { status: 400 }
            );
        }

        if (usdToMnt < 1000 || usdToMnt > 10000) {
            return NextResponse.json(
                { error: 'Ханш 1000-10000 хооронд байх ёстой' },
                { status: 400 }
            );
        }

        if (marginPercent < 0 || marginPercent > 100) {
            return NextResponse.json(
                { error: 'Ашиг 0-100% хооронд байх ёстой' },
                { status: 400 }
            );
        }

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

        console.log(`Admin ${adminCheck.user?.email} updated settings:`, { usdToMnt, marginPercent });

        // Revalidate all caches
        revalidatePath('/', 'layout');

        return NextResponse.json(updated.value);
    } catch (error: any) {
        console.error("Failed to save settings:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

