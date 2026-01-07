import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { MailService } from "@/lib/mail";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { orderId } = await req.json();

        if (!orderId) {
            return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
        }

        const orderRef = doc(db, "orders", orderId);
        const orderSnap = await getDoc(orderRef);

        if (!orderSnap.exists()) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        const orderData = orderSnap.data();
        const contactEmail = orderData.contactEmail;

        if (!contactEmail) {
            return NextResponse.json({ error: "Order has no contact email" }, { status: 400 });
        }

        // Send email
        await MailService.sendOrderConfirmation(contactEmail, {
            orderId: orderId,
            totalAmount: orderData.totalAmount || 0,
            currency: orderData.currency || "MNT",
            items: orderData.items || [],
            esim: orderData.esim || { iccid: "N/A", lpa: "N/A", qrData: "" }
        });

        return NextResponse.json({ success: true, message: "Email sent" });

    } catch (error) {
        console.error("Resend Email Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
