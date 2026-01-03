import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { airalo } from "@/services/airalo";
import { qpay } from "@/services/payments/qpay/client";

// 🔐 SECURITY: Webhook secret for verification
// This should be set in your QPay merchant dashboard callback URL as query param
// Example: https://gatesim.mn/api/webhooks/qpay?secret=your-webhook-secret
const WEBHOOK_SECRET = process.env.QPAY_WEBHOOK_SECRET;

// 🔐 SECURITY: Known QPay IP addresses (update with actual QPay IPs when known)
// This provides additional layer of security
const ALLOWED_IPS = [
    // Add QPay server IPs here when you get them from QPay documentation
    // '203.0.113.0', // Example
];

// POST /api/webhooks/qpay - Handle QPay payment callback
export async function POST(request: NextRequest) {
    try {
        // 🔐 SECURITY: Verify webhook secret (if configured)
        const searchParams = request.nextUrl.searchParams;
        const secret = searchParams.get("secret");
        const orderId = searchParams.get("order_id");

        // If webhook secret is configured, verify it
        if (WEBHOOK_SECRET && secret !== WEBHOOK_SECRET) {
            console.warn("QPay webhook: Invalid secret token");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 🔐 SECURITY: IP Allowlist (optional - enable when you have QPay IPs)
        // const clientIP = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip");
        // if (ALLOWED_IPS.length > 0 && !ALLOWED_IPS.includes(clientIP || "")) {
        //     console.warn(`QPay webhook: Unauthorized IP ${clientIP}`);
        //     return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        // }

        const body = await request.json();

        if (!orderId) {
            console.error("QPay webhook: missing order_id");
            return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
        }

        // 🔐 SECURITY: Always verify payment status directly with QPay API
        // Never trust the webhook body alone - always double-check with QPay
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
            // Payment not confirmed yet - don't process
            console.log(`QPay webhook: Payment not confirmed for order ${orderId}`);
            return NextResponse.json({
                success: false,
                message: "Payment not confirmed"
            });
        }


        // Update order status in database
        try {
            const order = await prisma.order.findUnique({
                where: { orderNumber: orderId },
                include: { package: true },
            });

            if (!order) {
                console.error("QPay webhook: Order not found:", orderId);
                return NextResponse.json({ error: "Order not found" }, { status: 404 });
            }

            // Update payment record
            await prisma.payment.updateMany({
                where: { orderId: order.id, provider: "QPAY" },
                data: {
                    status: "COMPLETED",
                    completedAt: new Date(),
                    webhookPayload: body,
                },
            });

            // Update order status
            await prisma.order.update({
                where: { id: order.id },
                data: {
                    status: "PAID",
                    paidAt: new Date(),
                },
            });

            // Provision eSIM from Airalo
            await provisionEsim(order.id, order.package.airaloPackageId);

            // Order processed successfully
        } catch (dbError) {
            console.error("QPay webhook: Database error:", dbError);
            // In development, just log the error
            if (process.env.NODE_ENV !== "development") {
                throw dbError;
            }
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

            // Update order with eSIM details
            await prisma.order.update({
                where: { id: orderId },
                data: {
                    status: "COMPLETED",
                    airaloOrderId: airaloOrder.data.id.toString(),
                    iccid: sim.iccid,
                    lpaString: sim.lpa,
                    qrCodeData: sim.qrcode,
                    qrCodeUrl: sim.qrcode_url,
                    simShareUrl: sim.direct_apple_installation_url,
                },
            });

            // eSIM provisioned successfully

            // TODO: Send email notification with QR code
            // await sendEsimEmail(order.userEmail, sim);
        }
    } catch (error) {
        console.error("eSIM provisioning error:", error);

        // Update order status to failed
        await prisma.order.update({
            where: { id: orderId },
            data: { status: "PROVISIONING_FAILED" },
        });

        throw error;
    }
}

// Also handle GET for testing
export async function GET(_request: NextRequest) {
    return NextResponse.json({
        message: "QPay webhook endpoint",
        status: "active"
    });
}
