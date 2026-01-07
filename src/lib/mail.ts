import nodemailer from "nodemailer";

// SMTP Configuration
// Supports both Gmail (simple) and custom SMTP (Resend, SendGrid, Zoho, etc.)
const isGmail = !process.env.SMTP_HOST; // If no host provided, assume Gmail

const transporter = nodemailer.createTransport({
    ...(isGmail ? { service: "gmail" } : {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    }),
    auth: {
        user: process.env.SMTP_EMAIL || "",
        pass: process.env.SMTP_PASSWORD || ""
    }
});

interface OrderConfirmationData {
    orderId: string;
    totalAmount: number;
    currency: string;
    items: Array<{
        name: string;
        price: number;
    }>;
    esim?: {
        iccid: string;
        lpa: string;
        qrData?: string; // Base64 string of the QR image
    };
}

export class MailService {

    static async sendOrderConfirmation(to: string, data: OrderConfirmationData) {
        if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
            console.warn("[MailService] SMTP credentials missing. Skipping email.");
            return;
        }

        const subject = `GateSIM Захиалга баталгаажлаа #${data.orderId}`;

        // Prepare attachments if QR data is present
        const attachments = [];
        let qrHtml = '';

        if (data.esim?.qrData) {
            // Remove header if present (e.g. data:image/png;base64,)
            const base64Data = data.esim.qrData.replace(/^data:image\/\w+;base64,/, "");

            attachments.push({
                filename: 'qrcode.png',
                content: base64Data,
                encoding: 'base64',
                cid: 'qrcode-image' // Referenced in HTML
            });

            qrHtml = `
                <div style="text-align: center; margin: 24px 0;">
                    <img src="cid:qrcode-image" alt="eSIM QR Code" style="width: 200px; height: 200px; border: 8px solid white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);" />
                    <p style="font-size: 13px; color: #64748b; margin-top: 12px;">Энэхүү QR кодыг утасныхаа тохиргооноос уншуулна уу</p>
                </div>
            `;
        }

        // Generate Install Instructions based on LPA
        const lpaCode = data.esim?.lpa || "";
        const [server, activationCode] = lpaCode.split('$');

        // HTML Template (Mongolian)
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Захиалга баталгаажлаа</title>
            </head>
            <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 24px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); margin-top: 20px; margin-bottom: 20px;">
                    
                    <!-- Header -->
                    <div style="text-align: center; margin-bottom: 32px;">
                        <h1 style="color: #0f172a; margin: 0; font-size: 24px; font-weight: 800;">Захиалга Баталгаажлаа!</h1>
                        <p style="color: #64748b; margin-top: 8px; font-size: 16px;">GateSIM-ийг сонгосонд баярлалаа</p>
                    </div>

                    <!-- Order Details -->
                    <div style="background-color: #f8fafc; padding: 24px; border-radius: 12px; margin-bottom: 32px; border: 1px solid #e2e8f0;">
                        <h3 style="margin: 0 0 16px 0; color: #334155; font-size: 16px; text-transform: uppercase; letter-spacing: 0.05em;">Захиалгын мэдээлэл</h3>
                        
                        <div style="margin-bottom: 8px; display: flex; justify-content: space-between;">
                            <span style="color: #64748b;">Захиалгын дугаар:</span>
                            <span style="font-weight: 600; color: #0f172a;">${data.orderId.substring(0, 8)}...</span>
                        </div>
                        
                        <div style="margin-bottom: 16px; display: flex; justify-content: space-between; border-bottom: 1px dashed #cbd5e1; padding-bottom: 16px;">
                            <span style="color: #64748b;">Нийт дүн:</span>
                            <span style="font-weight: 600; color: #0f172a;">${data.totalAmount.toLocaleString()} ${data.currency}</span>
                        </div>

                        <div style="color: #475569;">
                            ${data.items.map(item => `
                                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                                    <span>${item.name}</span>
                                    <span style="font-weight: 500;">${item.price.toLocaleString()} ${data.currency}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    ${data.esim ? `
                    <!-- eSIM Card -->
                    <div style="background-color: #f0fdf4; padding: 32px 24px; border-radius: 16px; border: 1px solid #bbf7d0; margin-bottom: 32px;">
                        <div style="text-align: center;">
                            <h2 style="color: #166534; margin: 0; font-size: 20px; font-weight: 700;">Таны eSIM бэлэн боллоо!</h2>
                        </div>
                        
                        ${qrHtml}

                        <div style="background-color: rgba(255, 255, 255, 0.6); padding: 16px; border-radius: 8px; margin-top: 24px; border: 1px solid #86efac;">
                            <p style="margin: 0 0 8px 0; font-size: 13px; color: #166534;"><strong>SM-DP+ Address:</strong> <br/><span style="font-family: monospace; color: #14532d;">${server || 'N/A'}</span></p>
                            <p style="margin: 0 0 8px 0; font-size: 13px; color: #166534;"><strong>Activation Code:</strong> <br/><span style="font-family: monospace; color: #14532d;">${activationCode || data.esim.lpa}</span></p>
                            <p style="margin: 0; font-size: 13px; color: #166534;"><strong>ICCID:</strong> <br/><span style="font-family: monospace; color: #14532d;">${data.esim.iccid}</span></p>
                        </div>
                    </div>
                    
                    <!-- Instructions -->
                    <div style="margin-top: 32px;">
                        <h3 style="color: #0f172a; font-size: 16px; margin-bottom: 16px;">Суулгах заавар (iOS):</h3>
                        <ol style="color: #475569; padding-left: 20px; line-height: 1.6;">
                            <li><strong>Settings > Cellular</strong> цэс рүү орно</li>
                            <li><strong>Add eSIM</strong> эсвэл <strong>Add Data Plan</strong> дээр дарна</li>
                            <li>Use QR Code сонголтыг сонгоод дээрх QR кодыг уншуулна</li>
                            <li>Аялалын үедээ "roaming" асаахаа мартуузай</li>
                        </ol>
                    </div>
                    ` : `
                    <div style="background-color: #fff7ed; color: #c2410c; padding: 16px; border-radius: 8px; text-align: center; border: 1px solid #fdba74;">
                        Таны eSIM боловсруулагдаж байна. Түр хүлээнэ үү.
                    </div>
                    `}
                    
                    <div style="text-align: center; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 24px;">
                        <p style="font-size: 12px; color: #94a3b8; margin: 0;">
                            © ${new Date().getFullYear()} GateSIM. All rights reserved.
                        </p>
                        <p style="font-size: 12px; color: #cbd5e1; margin-top: 8px;">
                            Ulaanbaatar, Mongolia
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `;

        try {
            await transporter.sendMail({
                from: `"GateSIM Support" <${process.env.SMTP_EMAIL}>`,
                to,
                subject,
                html,
                attachments // Attach the QR code image
            });
            console.log(`[MailService] Email sent to ${to}`);
        } catch (error) {
            console.error("[MailService] Failed to send email:", error);
        }
    }
}
