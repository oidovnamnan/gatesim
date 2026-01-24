
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
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

        // 2. Create Order
        // Note: We use a placeholder 'AI_PASS' as packageId for now, 
        // in a real scenario we might want a Product table or consistent ID.
        // We assume User already exists.

        const orderId = `AI-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const order = await db.order.create({
            data: {
                orderNumber: orderId,
                userId: session.user.id,
                userEmail: session.user.email,
                packageId: "AI_PASS", // Virtual Product ID
                packageSnapshot: { name: plan.name, days: plan.days, type: "digital_service" },
                amount: plan.price,
                currency: "MNT",
                status: "PENDING_PAYMENT",
                metadata: {
                    type: "AI_PASS",
                    planId: planId,
                    days: plan.days
                }
            }
        });

        // 3. Create QPay Invoice
        const invoice = await qpay.createInvoice({
            orderId: order.orderNumber,
            amount: plan.price,
            description: `GateSIM: ${plan.name}`
        });

        // 4. Save Payment Record
        await db.payment.create({
            data: {
                orderId: order.id,
                provider: "QPAY",
                amount: plan.price,
                currency: "MNT",
                status: "PENDING",
                qpayInvoiceId: invoice.invoice_id,
                qpayQrText: invoice.qPay_QRcode,
                qpayQrImage: invoice.qPay_QRimage,
                qpayDeeplinks: invoice.qPay_deeplink
            }
        });

        return NextResponse.json({
            success: true,
            orderId: order.orderNumber,
            invoice: invoice
        });

    } catch (error) {
        console.error("AI Upgrade Error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
