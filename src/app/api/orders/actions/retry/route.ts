import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, runTransaction } from "firebase/firestore";
import { createMobiMatterOrder } from "@/lib/mobimatter";
import { MailService } from "@/lib/mail";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/config/admin";

export async function POST(req: Request) {
    // 🔐 Admin-only endpoint
    const session = await auth();
    if (!session?.user?.email || !isAdmin(session.user.email)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let orderId: string | undefined;

    try {
        const body = await req.json();
        orderId = body.orderId;

        if (!orderId) {
            return NextResponse.json({ error: "Order ID required" }, { status: 400 });
        }

        console.log(`[Retry] Provisioning for Order ${orderId}`);
        const orderRef = doc(db, "orders", orderId);

        // 1. Transactional Check & Lock
        const data = await runTransaction(db, async (transaction) => {
            const orderDoc = await transaction.get(orderRef);
            if (!orderDoc.exists()) {
                throw new Error("Order not found");
            }
            const data = orderDoc.data();

            // Allow retry if FAILED or PENDING or PAID (but not COMPLETED)
            if (data.status === "COMPLETED") {
                throw new Error("Order is already COMPLETED");
            }

            if (data.status === "PROVISIONING") {
                // Allow breaking the lock if it's old (> 5 mins)
                const fiveMinsAgo = Date.now() - 5 * 60 * 1000;
                if (data.updatedAt && data.updatedAt > fiveMinsAgo) {
                    throw new Error("Order is currently PROVISIONING so cannot retry immediately.");
                }
            }

            transaction.update(orderRef, {
                status: "PROVISIONING",
                updatedAt: Date.now(),
                "metadata.retryCount": (data.metadata?.retryCount || 0) + 1,
                "metadata.provisioningError": null // Clear error
            });

            return data;
        });

        // 2. Provision
        // (Copied logic from webhook because abstracting it properly would take bigger refactor, 
        //  and we need to be careful with imports)
        let packageId = data.packageId;
        if (!packageId && data.items && data.items.length > 0) {
            packageId = data.items[0].id || data.items[0].sku;
        }

        if (!packageId) {
            throw new Error("No Package ID found in order");
        }

        // Call MobiMatter
        const esimsResponse = await createMobiMatterOrder(packageId);
        const esimData = esimsResponse.esim;

        const qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(esimData.qrData || esimData.lpa)}&size=300&margin=1`;

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

        // Send Email
        if (data.contactEmail) {
            await MailService.sendOrderConfirmation(data.contactEmail, {
                orderId: orderId!, // safe because we checked above
                totalAmount: data.totalAmount || 0,
                currency: data.currency || "MNT",
                items: data.items || [],
                esim: {
                    iccid: esimData.iccid,
                    lpa: esimData.lpa,
                    qrData: esimData.qrData
                }
            });
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("[Retry] Failed:", error);

        // Update status back to FAILED
        if (orderId) {
            try {
                const orderRef = doc(db, "orders", orderId);
                const errorMessage = error instanceof Error
                    ? error.message
                    : typeof error === 'object'
                        ? JSON.stringify(error)
                        : String(error);

                await updateDoc(orderRef, {
                    status: "PROVISIONING_FAILED",
                    metadata: { provisioningError: errorMessage }
                });
            } catch (dbError) {
                console.error("Failed to update order status:", dbError);
            }
        }

        return NextResponse.json(
            { error: error.message || "Retry failed" },
            { status: 500 }
        );
    }
}
