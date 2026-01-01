import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { airalo } from "@/services/airalo";
import { qpay } from "@/services/payments/qpay/client";

// POST /api/webhooks/qpay - Handle QPay payment callback
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const searchParams = request.nextUrl.searchParams;
        const orderId = searchParams.get("order_id");


        if (!orderId) {
            console.error("QPay webhook: missing order_id");
            return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
        }

        // Verify payment with QPay
        const invoiceId = body.invoice_id || body.object_id;

        if (invoiceId) {
            const paymentStatus = await qpay.checkPayment(invoiceId);

            const isPaid = paymentStatus.count > 0 && paymentStatus.rows.some(
                (row) => row.payment_status === "PAID"
            );

            if (!isPaid) {
                // Payment not confirmed yet
                return NextResponse.json({
                    success: false,
                    message: "Payment not confirmed"
                });
            }
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
