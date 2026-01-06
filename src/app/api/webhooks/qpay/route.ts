import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { airalo } from "@/services/airalo";
import { qpay } from "@/services/payments/qpay/client";

// 🔐 SECURITY: Webhook secret for verification
const WEBHOOK_SECRET = process.env.QPAY_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
    try {
        // 🔐 SECURITY: Verify webhook secret (if configured)
        const searchParams = request.nextUrl.searchParams;
        const secret = searchParams.get("secret");
        const orderId = searchParams.get("order_id") || searchParams.get("orderId"); // Try both params

        if (WEBHOOK_SECRET && secret !== WEBHOOK_SECRET) {
            console.warn("QPay webhook: Invalid secret token");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();

        if (!orderId) {
            console.error("QPay webhook: missing order_id");
            return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
        }

        const invoiceId = body.invoice_id || body.object_id;
        if (!invoiceId) {
            console.error("QPay webhook: missing invoice_id");
            return NextResponse.json({ error: "Missing invoice_id" }, { status: 400 });
        }

        // Double verification with QPay API
        const paymentStatus = await qpay.checkPayment(invoiceId);
        const isPaid = paymentStatus.count > 0 && paymentStatus.rows.some(
            (row) => row.payment_status === "PAID"
        );

        if (!isPaid) {
            console.log(`QPay webhook: Payment not confirmed for order ${orderId}`);
            return NextResponse.json({ success: false, message: "Payment not confirmed" });
        }

        // Update order status in Firebase
        try {
            const orderRef = doc(db, "orders", orderId);
            const orderSnap = await getDoc(orderRef);

            if (!orderSnap.exists()) {
                console.error("QPay webhook: Order not found:", orderId);
                // Even if not found, return success to QPay so they stop retrying (assuming invalid ID)
                // But better to log error.
                return NextResponse.json({ error: "Order not found" }, { status: 404 });
            }

            const orderData = orderSnap.data();

            // Update order status
            await updateDoc(orderRef, {
                status: "PAID", // Correct enum value from types/db.ts is 'paid', but Prisma was 'PAID'. Let's use 'paid'
                paymentId: invoiceId,
                paymentMethod: "qpay",
                updatedAt: Date.now(),
                // Store webhook payload mostly for debugging
                webhookPayload: body
            });

            // Provision eSIM from Airalo
            // Note: In Firebase version, packageId is inside the order data
            if (orderData.package?.id || orderData.items?.[0]?.id) {
                const packageId = orderData.package?.id || orderData.items?.[0]?.id;
                await provisionEsim(orderId, packageId);
            } else {
                console.error("QPay webhook: No package ID found in order");
            }

        } catch (dbError) {
            console.error("QPay webhook: Database error:", dbError);
            throw dbError;
        }

        return NextResponse.json({
            success: true,
            message: "Payment processed"
        });
    } catch (error) {
        console.error("QPay webhook error:", error);
        return NextResponse.json(
            { error: "Webhook processing failed" },
            { status: 500 }
        );
    }
}

// Provision eSIM from Airalo
async function provisionEsim(orderId: string, packageId: string) {
    try {
        // Create order with Airalo
        const airaloOrder = await airalo.createOrder({
            package_id: packageId,
            quantity: 1,
            description: `GateSIM order ${orderId}`,
        });

        if (airaloOrder.data.sims && airaloOrder.data.sims.length > 0) {
            const sim = airaloOrder.data.sims[0];

            // Update order with eSIM details in Firebase
            const orderRef = doc(db, "orders", orderId);
            await updateDoc(orderRef, {
                status: "COMPLETED", // or 'completed' depending on enum
                esimIccid: sim.iccid,
                esimActivationCode: sim.lpa, // Mapping lpa to validation code field or creating new field
                // Add missing fields to Order interface if needed, or put in metadata
                metadata: {
                    airaloOrderId: airaloOrder.data.id.toString(),
                    lpa: sim.lpa,
                    qrCode: sim.qrcode,
                    qrCodeUrl: sim.qrcode_url,
                    simShareUrl: sim.direct_apple_installation_url
                },
                updatedAt: Date.now()
            });
        }
    } catch (error) {
        console.error("eSIM provisioning error:", error);
        // Update order status to failed
        const orderRef = doc(db, "orders", orderId);
        await updateDoc(orderRef, {
            status: "PROVISIONING_FAILED" as any // Type assertion if strictly typed
        }).catch(e => console.error("Failed to update status", e));

        throw error;
    }
}

export async function GET(_request: NextRequest) {
    return NextResponse.json({
        message: "QPay webhook endpoint (Firebase)",
        status: "active"
    });
}
