import { NextRequest, NextResponse } from "next/server";
import { qpay } from "@/services/payments/qpay/client";
import { db } from "@/lib/firebase";
import { doc, runTransaction, updateDoc } from "firebase/firestore"; // Added updateDoc
import { createMobiMatterOrder } from "@/lib/mobimatter";
import { MailService } from "@/lib/mail";

// Default exchange rate (USD to MNT)
const USD_TO_MNT = 3450;

// POST /api/checkout/qpay - Create QPay invoice
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { orderId, amount, description, currency = "USD" } = body;

        if (!orderId || !amount) {
            return NextResponse.json(
                { error: "Төлбөрийн мэдээлэл дутуу байна (orderId, amount)" },
                { status: 400 }
            );
        }

        // Convert to MNT if needed
        const amountMNT = currency === "USD"
            ? Math.round(amount * USD_TO_MNT)
            : amount;

        // Create QPay invoice
        const invoice = await qpay.createInvoice({
            orderId,
            amount: amountMNT,
            description: description || `GateSIM захиалга #${orderId}`,
        });

        return NextResponse.json({
            success: true,
            invoiceId: invoice.invoice_id,
            qrText: invoice.qr_text,
            qrImage: invoice.qr_image,
            shortUrl: invoice.qPay_shortUrl,
            deeplinks: invoice.urls,
            amountMNT,
            amountUSD: amount,
        });
    } catch (error) {
        console.error("Error creating QPay invoice:", error);

        // Return mock data in development when QPay fails
        if (process.env.NODE_ENV === "development") {
            let mockAmount = 10;
            try {
                const clonedRequest = request.clone();
                const body = await clonedRequest.json();
                mockAmount = body.amount || 10;
            } catch { /* ignore */ }

            return NextResponse.json({
                success: true,
                invoiceId: `mock-invoice-${Date.now()}`,
                qrText: "00020101021229520009MN.QPAY0115DEMO_MERCHANT0208DEMO_TXN52040000530349654041.005802MN5914GATESIM TEST6304ABCD",
                qrImage: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=GATESIM_DEMO_PAYMENT",
                shortUrl: "https://qpay.mn/demo",
                deeplinks: [
                    { name: "Khan Bank", description: "ХААН Банк", logo: "", link: "khanbank://payment" },
                    { name: "Golomt Bank", description: "Голомт Банк", logo: "", link: "golomt://payment" },
                    { name: "TDB", description: "ХХБ", logo: "", link: "tdb://payment" },
                ],
                amountMNT: Math.round(mockAmount * USD_TO_MNT),
                amountUSD: mockAmount,
            });
        }

        return NextResponse.json(
            { error: "QPay нэхэмжлэх үүсгэхэд алдаа гарлаа" },
            { status: 500 }
        );
    }
}

// GET /api/checkout/qpay?invoiceId=xxx&orderId=xxx - Check payment status AND provision if paid
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const invoiceId = searchParams.get("invoiceId");
        const orderId = searchParams.get("orderId");

        if (!invoiceId) {
            return NextResponse.json(
                { error: "Нэхэмжлэхийн дугаар хоосон байна" },
                { status: 400 }
            );
        }

        // Check payment status with QPay
        const result = await qpay.checkPayment(invoiceId);

        const isPaid = result.count > 0 && result.rows.some(
            (row) => row.payment_status === "PAID"
        );

        // If paid AND orderId provided, trigger provisioning with TRANSACTION LOCK
        if (isPaid && orderId) {
            try {
                await processPaymentAndProvision(orderId, invoiceId);
            } catch (provisionError) {
                console.error("Provisioning error (non-blocking):", provisionError);
                // Don't fail the response - payment IS successful
            }
        }

        return NextResponse.json({
            success: true,
            isPaid,
            paidAmount: result.paid_amount,
            payments: result.rows,
        });
    } catch (error) {
        console.error("QPay Invoice Error:", error);
        return NextResponse.json(
            { error: "Payment system unavailable. Please try again later." },
            { status: 500 }
        );
    }
}

// Process payment and provision eSIM using TRANSACTION
async function processPaymentAndProvision(orderId: string, invoiceId: string) {
    console.log(`[Provision] Starting transaction for order ${orderId}`);

    const orderRef = doc(db, "orders", orderId);

    // 1. Run Transaction to ATOMICALLY check and set status
    const provisionData = await runTransaction(db, async (transaction) => {
        const orderDoc = await transaction.get(orderRef);

        if (!orderDoc.exists()) {
            throw new Error(`Order not found: ${orderId}`);
        }

        const data = orderDoc.data();

        // STRICT CHECK: If already COMPLETED or PROVISIONING, abort immediately
        if (
            data.status === "COMPLETED" ||
            data.status === "completed" ||
            data.status === "PROVISIONING"
        ) {
            console.log(`[Provision] Order ${orderId} status is ${data.status}, skipping.`);
            return { shouldProceed: false, reason: `Status is ${data.status}` };
        }

        // Lock it!
        transaction.update(orderRef, {
            status: "PROVISIONING",
            paymentId: invoiceId,
            paymentMethod: "qpay",
            updatedAt: Date.now(),
        });

        return {
            shouldProceed: true,
            data: data,
            packageId: data.items?.[0]?.id || data.items?.[0]?.sku
        };
    });

    if (!provisionData.shouldProceed) {
        console.log(`[Provision] Skipped: ${provisionData.reason}`);
        return;
    }

    // 2. Provisioning (MobiMatter API call) - Outside transaction because it's external API
    console.log(`[Provision] Locked order ${orderId}, starting MobiMatter call...`);

    try {
        const packageId = provisionData.packageId;

        if (!packageId) {
            throw new Error("No package ID found in order");
        }

        // Create order with MobiMatter
        const esimsResponse = await createMobiMatterOrder(packageId);

        // Extract eSIM Data
        const esimData = esimsResponse.esim;

        // Use QuickChart which is often more reliable for email clients
        const qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(esimData.qrData || esimData.lpa)}&size=300&margin=1`;
        esimData.qrUrl = qrUrl;

        // 3. Final Update
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

        console.log(`[Provision] Order ${orderId} successfully provisioned!`);

        // Send confirmation email (non-blocking)
        if (provisionData.data && provisionData.data.contactEmail) {
            try {
                await MailService.sendOrderConfirmation(provisionData.data.contactEmail, {
                    orderId,
                    totalAmount: provisionData.data.totalAmount || 0,
                    currency: provisionData.data.currency || "MNT",
                    items: provisionData.data.items || [],
                    esim: esimData
                });
            } catch (emailError) {
                console.error("Failed to send email:", emailError);
            }
        }

    } catch (error) {
        console.error(`[Provision] Failed:`, error);
        // Revert status to PROVISIONING_FAILED so we can debug or retry manually
        await updateDoc(orderRef, {
            status: "PROVISIONING_FAILED",
            metadata: { provisioningError: JSON.stringify(error) }
        });
        throw error;
    }
}
