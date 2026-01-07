import { NextRequest, NextResponse } from "next/server";
import { qpay } from "@/services/payments/qpay/client";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
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

        // If paid AND orderId provided, trigger provisioning
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

// Process payment and provision eSIM
async function processPaymentAndProvision(orderId: string, invoiceId: string) {
    console.log(`[Provision] Starting for order ${orderId}`);

    const orderRef = doc(db, "orders", orderId);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
        console.error(`[Provision] Order not found: ${orderId}`);
        return;
    }

    const orderData = orderSnap.data();

    // Check if already processed
    if (orderData.status === "COMPLETED" || orderData.status === "completed") {
        console.log(`[Provision] Order ${orderId} already completed`);
        return;
    }

    // Update status to PAID
    await updateDoc(orderRef, {
        status: "PAID",
        paymentId: invoiceId,
        paymentMethod: "qpay",
        updatedAt: Date.now(),
    });

    // Get package ID from order
    const packageId = orderData.items?.[0]?.id || orderData.items?.[0]?.sku;

    if (!packageId) {
        console.error(`[Provision] No package ID found in order ${orderId}`);
        await updateDoc(orderRef, {
            status: "PAID_NO_PACKAGE",
            metadata: { error: "No package ID in order" }
        });
        return;
    }

    console.log(`[Provision] Creating MobiMatter order for SKU: ${packageId}`);

    try {
        // Create order with MobiMatter
        const esimsResponse = await createMobiMatterOrder(packageId);

        // Extract eSIM Data
        const esimData = esimsResponse.esim;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(esimData.qrData || esimData.lpa)}`;
        esimData.qrUrl = qrUrl;

        // Update order with eSIM data
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

        // Send confirmation email
        if (orderData.contactEmail) {
            await MailService.sendOrderConfirmation(orderData.contactEmail, {
                orderId,
                totalAmount: orderData.totalAmount || 0,
                currency: orderData.currency || "MNT",
                items: orderData.items || [],
                esim: esimData
            });
        }

        console.log(`[Provision] Order ${orderId} completed successfully!`);

    } catch (error) {
        console.error(`[Provision] MobiMatter error:`, error);
        await updateDoc(orderRef, {
            status: "PROVISIONING_FAILED",
            metadata: { provisioningError: JSON.stringify(error) }
        });
        throw error;
    }
}
