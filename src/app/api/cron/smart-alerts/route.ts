import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { airalo } from '@/services/airalo/client';
import webpush from 'web-push';

// Vercel Cron needs this to verify authenticity
// Make sure to set CRON_SECRET in .env
// And configure vercel.json for the job

export const maxDuration = 60; // Allow 1 minute timeout (serverless function limit usually)
export const dynamic = 'force-dynamic';

const VAPID_SUBJECT = 'mailto:hello@gatesim.travel';

if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        VAPID_SUBJECT,
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
}

export async function GET(req: Request) {
    // 1. Security Check
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        // 2. Fetch Active Orders (Last 60 days, Completed)
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

        const activeOrders = await prisma.order.findMany({
            where: {
                status: 'COMPLETED',
                createdAt: { gte: sixtyDaysAgo },
                iccid: { not: null },
                // Only fetch if user has push subscriptions
                user: {
                    pushSubscriptions: {
                        some: {}
                    }
                }
            },
            include: {
                user: {
                    include: {
                        pushSubscriptions: true
                    }
                }
            }
        });

        console.log(`[SmartAlerts] Checking ${activeOrders.length} active orders...`);

        let alertsSent = 0;

        for (const order of activeOrders) {
            if (!order.iccid) continue;

            try {
                // 3. Check Live Usage from Airalo
                const { data: usage } = await airalo.getSimUsage(order.iccid);

                // Parse Order Metadata
                const metadata = (order.metadata as any) || {};
                const alerts = metadata.alerts || { lowData: false, expiring: false };

                // LOGIC 1: Low Data (< 500MB or < 10%)
                const isLowData = checkLowData(usage);
                if (isLowData && !alerts.lowData) {
                    await sendNotification(
                        order.user.pushSubscriptions,
                        'Дата дуусаж байна! ⚠️',
                        `Таны eSIM (${order.packageId}) дата бага үлдлээ. Цэнэглэх үү?`,
                        `/dashboard/orders`
                    );
                    alerts.lowData = true;
                    alertsSent++;
                }

                // LOGIC 2: Expiring Soon (< 48 hours)
                const isExpiring = checkExpiry(usage);
                if (isExpiring && !alerts.expiring) {
                    await sendNotification(
                        order.user.pushSubscriptions,
                        'Хугацаа дуусаж байна ⏳',
                        `Таны eSIM-ийн хугацаа удахгүй дуусна.`,
                        `/dashboard/orders`
                    );
                    alerts.expiring = true;
                    alertsSent++;
                }

                // Update Metadata if changed
                if (alerts.lowData !== (metadata.alerts?.lowData) || alerts.expiring !== (metadata.alerts?.expiring)) {
                    await prisma.order.update({
                        where: { id: order.id },
                        data: {
                            metadata: {
                                ...metadata,
                                alerts: {
                                    ...alerts,
                                    lastCheckedAt: new Date().toISOString()
                                }
                            }
                        }
                    });
                }

            } catch (err) {
                console.error(`[SmartAlerts] Error checking order ${order.orderNumber}:`, err);
                // Continue to next order
            }
        }

        return NextResponse.json({ success: true, checked: activeOrders.length, alertsSent });

    } catch (error) {
        console.error('[SmartAlerts] Critical Error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

function checkLowData(usage: any): boolean {
    if (!usage || usage.remaining === undefined) return false;

    // logic: remaining < 500 MB (assuming unit is MB, need to check if Airalo returns MB or KB)
    // Airalo usually returns 'amount' in MB. 'remaining' should match 'total' unit?
    // Let's assume MB for simplicity based on Airalo docs (usually).
    // Safest is percentage check if total > 0

    if (usage.total > 0) {
        const percent = (usage.remaining / usage.total) * 100;
        if (percent < 10) return true; // Less than 10%
    }

    if (usage.remaining < 500) return true; // Less than 500MB (if MB)

    return false;
}

function checkExpiry(usage: any): boolean {
    if (!usage || !usage.expired_at) return false;

    const expiryDate = new Date(usage.expired_at);
    const now = new Date();

    const hoursLeft = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Check if expiring in next 48 hours, but NOT already expired
    return hoursLeft > 0 && hoursLeft <= 48;
}

async function sendNotification(subscriptions: any[], title: string, body: string, url: string) {
    const payload = JSON.stringify({
        title,
        body,
        icon: '/logo.png',
        url: url // Custom data handled by SW
    });

    const promises = subscriptions.map(sub => {
        try {
            return webpush.sendNotification({
                endpoint: sub.endpoint,
                keys: sub.keys
            }, payload);
        } catch (e) {
            console.error('Push failed for sub:', sub.id, e);
            // Verify if 410 Gone -> delete sub? (Enhancement)
            return Promise.resolve();
        }
    });

    await Promise.all(promises);
}
