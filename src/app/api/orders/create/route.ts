import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, doc, setDoc } from "firebase/firestore";
import { Order } from "@/types/db";
import { auth } from "@/lib/auth";

// Force dynamic needed because we use simple fetch/responses
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        // 🔐 AUTHENTICATION CHECK (Optional for Guest Checkout)
        const session = await auth();
        // If system requires auth, uncomment below:
        // if (!session?.user) {
        //     return NextResponse.json(
        //         { error: "Нэвтрээгүй байна" },
        //         { status: 401 }
        //     );
        // }

        const body = await req.json();

        // Basic validation
        if (!body.totalAmount || !body.items || body.items.length === 0) {
            return NextResponse.json(
                { error: "Invalid order data" },
                { status: 400 }
            );
        }

        // 🔐 SECURITY: Ensure userId matches session user (if logged in)
        const sessionUserId = session?.user ? (session.user as any).id : null;

        if (sessionUserId && body.userId && body.userId !== sessionUserId) {
            console.warn(`User ${sessionUserId} attempted to create order for ${body.userId}`);
            return NextResponse.json(
                { error: "Хандах эрхгүй" },
                { status: 403 }
            );
        }

        // We can reconstruct the order object here to prevent client-side manipulation of sensitive fields
        // But for now, we trust the structure matches the interface, just ensuring IDs and Timestamps

        const orderData = body as Order;

        // Generate ID securely on server if provided ID is empty strings (though client usually sends empty string)
        const ordersRef = collection(db, "orders");
        // Use provided ID if available (from client-side generation for consistency) or generate new
        const newOrderRef = orderData.id
            ? doc(ordersRef, orderData.id)
            : doc(ordersRef);

        const finalOrder: Order = {
            ...orderData,
            id: newOrderRef.id,
            // 🔐 SECURITY: Use session userId if available, otherwise Guest or provided ID (if trusted)
            // Ideally we don't trust body.userId for Guests to claim other users' orders, but for now allow null
            userId: sessionUserId || "GUEST",
            contactEmail: session?.user?.email || orderData.contactEmail,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            // Ensure status starts correctly - FORCE pending, ignore client input
            status: 'pending'
        };

        // Write to Firestore (Server-side execution)
        // This runs on Vercel/Your Server, bypassing China Firewall
        await setDoc(newOrderRef, finalOrder);

        return NextResponse.json({
            success: true,
            orderId: finalOrder.id,
            order: finalOrder
        });

    } catch (error: any) {
        console.error("API Order Create Error:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
