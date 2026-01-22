import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc, runTransaction } from "firebase/firestore";
import { qpay } from "@/services/payments/qpay/client";
import { createMobiMatterOrder } from "@/lib/mobimatter";
import { MailService } from "@/lib/mail";
import { auth } from "@/lib/auth";
import { getAdminRole } from "@/config/admin";

export const maxDuration = 60; // Allow 60 seconds for batch processing

/**
 * POST /api/admin/process-pending
 * Admin-only endpoint to check and process pending orders
 * This is a fallback for when webhooks fail
 */
export async function POST(request: NextRequest) {
    try {
        // 🔐 AUTHENTICATION CHECK
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 🔐 AUTHORIZATION CHECK - Admin only
        const role = getAdminRole(session.user.email);
        if (!role) {
            return NextResponse.json({ error: "Admin access required" }, { status: 403 });
        }

        // Get all pending orders
        const ordersRef = collection(db, "orders");
        const q = query(ordersRef, where("status", "==", "pending"));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return NextResponse.json({
                success: true,
                message: "No pending orders found",
                processed: 0
            });
        }

        const results: Array<{
            orderId: string;
            status: string;
            action: string;
            error?: string;
        }> = [];

        for (const orderDoc of snapshot.docs) {
            const order = orderDoc.data();
            const orderId = orderDoc.id;

            try {
                // Check if we have a payment ID (invoice ID)
                if (!order.paymentId && !order.invoiceId) {
                    results.push({
                        orderId,
                        status: "skipped",
                        action: "No payment ID found - order may not have started payment"
                    });
                    continue;
                }

                const invoiceId = order.paymentId || order.invoiceId;

                // Check payment status with QPay
                const paymentStatus = await qpay.checkPayment(invoiceId);
                const isPaid = paymentStatus.count > 0 && paymentStatus.rows.some(
                    (row) => row.payment_status === "PAID"
                );

                if (!isPaid) {
                    results.push({
                        orderId,
                        status: "pending",
                        action: "Payment not confirmed by QPay"
                    });
                    continue;
                }

                // Payment is confirmed! Process the order
                console.log(`[ProcessPending] Order ${orderId} is PAID, processing...`);

                const orderRef = doc(db, "orders", orderId);

                // Provision eSIM
                const packageId = order.items?.[0]?.id || order.items?.[0]?.sku;

                if (!packageId) {
                    await updateDoc(orderRef, {
                        status: "PAID",
                        paymentMethod: "qpay",
                        updatedAt: Date.now()
                    });
                    results.push({
                        orderId,
                        status: "paid",
                        action: "Marked as paid but no package ID for provisioning"
                    });
                    continue;
                }

                // Update to PROVISIONING
                await updateDoc(orderRef, {
                    status: "PROVISIONING",
                    updatedAt: Date.now()
                });

                try {
                    // Create order with MobiMatter
                    const esimsResponse = await createMobiMatterOrder(packageId);
                    const esimData = esimsResponse.esim;

                    const qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(esimData.qrData || esimData.lpa)}&size=300&margin=1`;

                    // Update to COMPLETED
                    await updateDoc(orderRef, {
                        status: "COMPLETED",
                        esim: {
                            iccid: esimData.iccid,
                            lpa: esimData.lpa,
                            qrData: esimData.qrData,
                            qrUrl: qrUrl
                        },
                        updatedAt: Date.now()
                    });

                    // Send email
                    if (order.contactEmail) {
                        await MailService.sendOrderConfirmation(order.contactEmail, {
                            orderId,
                            totalAmount: order.totalAmount || 0,
                            currency: order.currency || "MNT",
                            items: order.items || [],
                            esim: {
                                iccid: esimData.iccid,
                                lpa: esimData.lpa,
                                qrData: esimData.qrData
                            }
                        });
                    }

                    results.push({
                        orderId,
                        status: "COMPLETED",
                        action: `Successfully provisioned eSIM (ICCID: ${esimData.iccid})`
                    });

                } catch (provError) {
                    const errorMsg = provError instanceof Error ? provError.message : String(provError);
                    await updateDoc(orderRef, {
                        status: "PROVISIONING_FAILED",
                        metadata: { provisioningError: errorMsg }
                    });
                    results.push({
                        orderId,
                        status: "PROVISIONING_FAILED",
                        action: "Provisioning failed",
                        error: errorMsg
                    });
                }

            } catch (orderError) {
                const errorMsg = orderError instanceof Error ? orderError.message : String(orderError);
                results.push({
                    orderId,
                    status: "error",
                    action: "Error processing order",
                    error: errorMsg
                });
            }
        }

        const completed = results.filter(r => r.status === "COMPLETED").length;
        const failed = results.filter(r => r.status === "PROVISIONING_FAILED" || r.status === "error").length;

        return NextResponse.json({
            success: true,
            message: `Processed ${snapshot.docs.length} pending orders`,
            summary: {
                total: snapshot.docs.length,
                completed,
                failed,
                skipped: snapshot.docs.length - completed - failed
            },
            results
        });

    } catch (error) {
        console.error("[ProcessPending] Error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to process pending orders" },
            { status: 500 }
        );
    }
}
