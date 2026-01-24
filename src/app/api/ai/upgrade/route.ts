import { auth } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { collection, doc, setDoc } from "firebase/firestore";
import { qpay } from "@/services/payments/qpay/client";
import { NextResponse } from "next/server";


const PRICING = {
    "5_DAYS": { days: 5, price: 25000, name: "5 Days AI Pass" },
    "10_DAYS": { days: 10, price: 40000, name: "10 Days AI Pass" },
    "30_DAYS": { days: 30, price: 90000, name: "30 Days AI Pass" }
};

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id || !session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { planId } = await req.json();

        // 1. Validate Plan
        const plan = PRICING[planId as keyof typeof PRICING];
        if (!plan) {
            return new NextResponse("Invalid Plan", { status: 400 });
        }

        // 2. Create Order in Firebase (Source of Truth for Orders)
        const orderId = `AI-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const orderRef = doc(collection(db, "orders"), orderId);

        const orderData = {
            id: orderId,
            userId: session.user.id,
            contactEmail: session.user.email,
            items: [{
                sku: "AI_PASS",
                name: plan.name,
                price: plan.price,
                quantity: 1,
                metadata: { planId, days: plan.days }
            }],
            totalAmount: plan.price,
            currency: "MNT",
            status: "pending",
            type: "AI_UPGRADE", // Field for webhook to distinguish
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        await setDoc(orderRef, orderData);

        // 3. Create QPay Invoice
        const invoice = await qpay.createInvoice({
            orderId: orderId,
            amount: plan.price,
            description: `GateSIM: ${plan.name}`
        });

        // 4. Update Order with Payment Info
        await setDoc(orderRef, {
            paymentId: invoice.invoice_id,
            paymentMethod: "qpay",
            paymentData: {
                invoice_id: invoice.invoice_id,
                qr_text: invoice.qr_text,
                qr_image: invoice.qr_image,
                urls: invoice.urls as any
            }
        }, { merge: true });


        return NextResponse.json({
            success: true,
            orderId: orderId,
            invoice: invoice
        });


    } catch (error: any) {
        console.error("AI Upgrade Error:", error);
        return NextResponse.json({
            success: false,
            error: error.message || "Internal Error",
            details: error.code // Prisma error code if available
        }, { status: 500 });
    }
}
