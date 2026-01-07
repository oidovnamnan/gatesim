import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { createMobiMatterOrder } from "@/lib/mobimatter";
import { MailService } from "@/lib/mail";
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

// Provision eSIM from MobiMatter
async function provisionEsim(orderId: string, packageId: string) {
    try {
        console.log(`[Webhook] Provisioning eSIM for Order ${orderId}, SKU: ${packageId}`);

        // 1. Create order with MobiMatter
        const esimsResponse = await createMobiMatterOrder(packageId);

        // 2. Extract eSIM Data
        const esimData = esimsResponse.esim; // { iccid, lpa, qrData }
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(esimData.qrData || esimData.lpa)}`;
        esimData.qrUrl = qrUrl;

        // 3. Update order in Firebase
        const orderRef = doc(db, "orders", orderId);
        const orderSnap = await getDoc(orderRef);
        const orderData = orderSnap.data() as any;

        await updateDoc(orderRef, {
            status: "COMPLETED",
            esim: {
                iccid: esimData.iccid,
                lpa: esimData.lpa,
                qrData: esimData.qrData
            },
            updatedAt: Date.now()
        });

        // 4. Send Confirmation Email
        if (orderData?.contactEmail) {
            await MailService.sendOrderConfirmation(orderData.contactEmail, {
                orderId: orderId,
                totalAmount: orderData.totalAmount || 0,
                currency: orderData.currency || "MNT",
                items: orderData.items || [],
                esim: esimData
            });
        } else {
            console.warn(`[Webhook] No contact email for order ${orderId}, skipping email.`);
        }

        console.log(`[Webhook] Order ${orderId} completed successfully.`);

    } catch (error) {
        console.error("[Webhook] eSIM provisioning error:", error);

        // Update order status to failed
        const orderRef = doc(db, "orders", orderId);
        await updateDoc(orderRef, {
            status: "PROVISIONING_FAILED",
            metadata: { provisioningError: JSON.stringify(error) }
        }).catch(e => console.error("Failed to update status", e));

        throw error;
    }
}

export async function GET(_request: NextRequest) {
    return NextResponse.json({
        message: "QPay webhook endpoint (Firebase + MobiMatter)",
        status: "active"
    });
}
