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

        // Return mock data in development when QPay fails
        if (process.env.NODE_ENV === "development") {
            // Re-parse body for mock response
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
                    { name: "State Bank", description: "Төрийн Банк", logo: "", link: "statebank://payment" },
                    { name: "Xac Bank", description: "ХасБанк", logo: "", link: "xacbank://payment" },
                    { name: "M Bank", description: "М Банк", logo: "", link: "mbank://payment" },
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
        console.error("QPay Invoice Error:", error);
        return NextResponse.json(
            { error: "Payment system unavailable. Please try again later." },
            { status: 500 }
        );
    }
}
