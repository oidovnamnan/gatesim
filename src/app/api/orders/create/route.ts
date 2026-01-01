
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, doc, setDoc } from "firebase/firestore";
import { Order } from "@/types/db";

// Force dynamic needed because we use simple fetch/responses
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Basic validation
        if (!body.totalAmount || !body.items || body.items.length === 0) {
            return NextResponse.json(
                { error: "Invalid order data" },
                { status: 400 }
            );
        }

        // We can reconstruct the order object here to prevent client-side manipulation of sensitive fields
        // But for now, we trust the structure matches the interface, just ensuring IDs and Timestamps

        const orderData = body as Order;

        // Generate ID securely on server if provided ID is empty strings (though client usually sends empty string)
        const ordersRef = collection(db, "orders");
        const newOrderRef = doc(ordersRef); // Auto-gen ID

        const finalOrder: Order = {
            ...orderData,
            id: newOrderRef.id,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            // Ensure status starts correctly if not provided
            status: orderData.status || 'pending'
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
