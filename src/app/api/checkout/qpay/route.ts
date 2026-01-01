import { NextRequest, NextResponse } from "next/server";
import { qpay } from "@/services/payments/qpay/client";

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

        // Return mock data in development
        if (process.env.NODE_ENV === "development" && !process.env.QPAY_USERNAME) {
            const body = await request.json().catch(() => ({}));
            return NextResponse.json({
                success: true,
                invoiceId: `mock-invoice-${Date.now()}`,
                qrText: "00020101021229520009MN.QPAY0115DEMO_MERCHANT0208DEMO_TXN52040000530349654041.005802MN5914GATESIM TEST6304ABCD",
                qrImage: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
                shortUrl: "https://qpay.mn/demo",
                deeplinks: [
                    { name: "Khan Bank", description: "ХААН Банк", logo: "", link: "khanbank://payment" },
                    { name: "Golomt Bank", description: "Голомт Банк", logo: "", link: "golomt://payment" },
                    { name: "TDB", description: "ТДБ", logo: "", link: "tdb://payment" },
                ],
                amountMNT: Math.round((body.amount || 10) * USD_TO_MNT),
                amountUSD: body.amount || 10,
            });
        }

        return NextResponse.json(
            { error: "QPay нэхэмжлэх үүсгэхэд алдаа гарлаа" },
            { status: 500 }
        );
    }
}

// GET /api/checkout/qpay?invoiceId=xxx - Check payment status
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const invoiceId = searchParams.get("invoiceId");

        if (!invoiceId) {
            return NextResponse.json(
                { error: "Нэхэмжлэхийн дугаар хоосон байна" },
                { status: 400 }
            );
        }

        // Check payment status
        const result = await qpay.checkPayment(invoiceId);

        const isPaid = result.count > 0 && result.rows.some(
            (row) => row.payment_status === "PAID"
        );

        return NextResponse.json({
            success: true,
            isPaid,
            paidAmount: result.paid_amount,
            payments: result.rows,
        });
    } catch (error) {
        console.error("Error checking QPay payment:", error);

        // Return mock data in development
        if (process.env.NODE_ENV === "development" && !process.env.QPAY_USERNAME) {
            return NextResponse.json({
                success: true,
                isPaid: false,
                paidAmount: 0,
                payments: [],
            });
        }

        return NextResponse.json(
            { error: "Төлбөрийн төлөв шалгахад алдаа гарлаа" },
            { status: 500 }
        );
    }
}
