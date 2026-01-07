import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

export async function POST(req: NextRequest) {
    const session = await auth();
    // Only allow verified admins
    const ADMIN_EMAILS = [
        'admin@gatesim.mn',
        'suren@gatesim.mn',
        'nsurenoidov@gmail.com',
        'admin@gatesim.travel'
    ];

    if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { orderId } = await req.json();

        // TODO: Integrate actual QPay Refund API here.
        // For now, we will mark it as REFUNDED in DB to show "Real" action, 
        // but QPay refund usually requires manual intervention or a specific API we haven't built 'refund' method for in QPayClient yet.

        if (!orderId) {
            return NextResponse.json({ error: "Order ID required" }, { status: 400 });
        }

        console.log(`[Refund] Refund initiated for Order ${orderId} by ${session.user.email}`);

        // Update status in DB
        const orderRef = doc(db, "orders", orderId);
        await updateDoc(orderRef, {
            status: "REFUNDED",
            refundedAt: Date.now(),
            refundedBy: session.user.email
        });

        return NextResponse.json({ success: true, message: "Refund recorded locally. Please process manually in QPay merchant portal if needed." });

    } catch (error) {
        console.error("Refund Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
