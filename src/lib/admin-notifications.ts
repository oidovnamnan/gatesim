import webpush from 'web-push';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

const VAPID_SUBJECT = 'mailto:hello@gatesim.travel';

// Initialize web-push with VAPID keys
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        VAPID_SUBJECT,
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
}

interface OrderNotificationData {
    orderId: string;
    orderNumber?: string;
    amount: number;
    currency: string;
    packageName: string;
    customerEmail?: string;
}

/**
 * Send push notification to all admin users when a new order is completed
 */
export async function sendAdminOrderNotification(order: OrderNotificationData) {
    try {
        // 1. Get all admin push subscriptions from Firebase
        const subscriptionsRef = collection(db, 'admin_push_subscriptions');
        const snapshot = await getDocs(subscriptionsRef);

        if (snapshot.empty) {
            console.log('[AdminNotification] No admin subscriptions found');
            return { sent: 0 };
        }

        // 2. Format notification
        const formattedAmount = new Intl.NumberFormat('mn-MN').format(order.amount);
        const currencySymbol = order.currency === 'MNT' ? '₮' : '$';

        const payload = JSON.stringify({
            title: '🎉 Шинэ захиалга!',
            body: `${order.packageName}\n${currencySymbol}${formattedAmount}`,
            icon: '/logo.png',
            badge: '/logo.png',
            tag: `order-${order.orderId}`,
            data: {
                url: '/admin/orders',
                orderId: order.orderId,
                type: 'new_order'
            },
            // Vibration pattern for mobile
            vibrate: [200, 100, 200],
            // Show notification even if app is focused
            requireInteraction: true
        });

        // 3. Send to all admin subscriptions
        const results = await Promise.allSettled(
            snapshot.docs.map(async (doc) => {
                const sub = doc.data();
                try {
                    await webpush.sendNotification(
                        {
                            endpoint: sub.endpoint,
                            keys: sub.keys
                        },
                        payload
                    );
                    return { success: true, id: doc.id };
                } catch (error: any) {
                    // If subscription is expired (410 Gone), we should delete it
                    if (error.statusCode === 410) {
                        console.log(`[AdminNotification] Subscription expired, should delete: ${doc.id}`);
                        // Could delete here, but for now just log
                    }
                    console.error(`[AdminNotification] Failed to send to ${doc.id}:`, error.message);
                    return { success: false, id: doc.id, error: error.message };
                }
            })
        );

        const sent = results.filter(r => r.status === 'fulfilled' && (r.value as any).success).length;
        console.log(`[AdminNotification] Sent ${sent}/${snapshot.docs.length} notifications for order ${order.orderId}`);

        return { sent, total: snapshot.docs.length };
    } catch (error) {
        console.error('[AdminNotification] Error sending notifications:', error);
        return { sent: 0, error };
    }
}

/**
 * Format order data for notification
 */
export function formatOrderForNotification(orderData: any, orderId: string): OrderNotificationData {
    const item = orderData.items?.[0] || orderData.package || {};

    return {
        orderId,
        orderNumber: orderData.orderNumber || orderId.slice(0, 12).toUpperCase(),
        amount: orderData.totalAmount || 0,
        currency: orderData.currency || 'MNT',
        packageName: item.name || 'eSIM Package',
        customerEmail: orderData.contactEmail
    };
}
