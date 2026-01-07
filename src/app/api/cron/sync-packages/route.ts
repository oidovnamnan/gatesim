import { NextResponse } from 'next/server';
import { syncPackages } from '@/app/actions/packages';

export async function GET(req: Request) {
    const authHeader = req.headers.get('authorization');

    // Vercel automatically sends this header for Cron Jobs
    // Ensure you add CRON_SECRET to your environment variables in Vercel Project Settings
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const result = await syncPackages();
        if (result.success) {
            return NextResponse.json({ success: true, message: "Packages synced via cron" });
        } else {
            return NextResponse.json({ success: false, error: result.error }, { status: 500 });
        }
    } catch (error) {
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
