import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, runTransaction } from "firebase/firestore";
import { createMobiMatterOrder } from "@/lib/mobimatter";
import { MailService } from "@/lib/mail";

export async function POST(req: Request) {
    try {
        const { orderId } = await req.json();

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
                orderId: orderId,
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
        // Only if we know the orderId
        try {
            const body = await req.clone().json().catch(() => ({}));
            if (body.orderId) {
                const orderRef = doc(db, "orders", body.orderId);
                await updateDoc(orderRef, {
                    status: "PROVISIONING_FAILED",
                    metadata: { provisioningError: error.message || String(error) }
                });
            }
        } catch (e) { /* ignore */ }

        return NextResponse.json(
            { error: error.message || "Retry failed" },
            { status: 500 }
        );
    }
}
