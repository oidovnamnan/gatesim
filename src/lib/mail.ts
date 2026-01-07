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
        qrCode?: string;
        qrUrl?: string; // URL to QR code image if available
    };
}

export class MailService {

    static async sendOrderConfirmation(to: string, data: OrderConfirmationData) {
        if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
            console.warn("[MailService] SMTP credentials missing. Skipping email.");
            return;
        }

        const subject = `GateSIM Order Confirmation #${data.orderId}`;

        // Generate Install Instructions based on LPA
        const lpaCode = data.esim?.lpa || "";
        const [server, activationCode] = lpaCode.split('$');

        // HTML Template
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h1 style="color: #2563eb; text-align: center;">GateSIM Order Confirmed!</h1>
                <p>Hello,</p>
                <p>Thank you for your purchase. Here is your eSIM details.</p>
                
                <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Order Summary</h3>
                    <p><strong>Order ID:</strong> ${data.orderId}</p>
                    <p><strong>Total:</strong> ${data.totalAmount.toLocaleString()} ${data.currency}</p>
                    <ul>
                        ${data.items.map(item => `<li>${item.name} - ${item.price.toLocaleString()} ${data.currency}</li>`).join('')}
                    </ul>
                </div>

                ${data.esim ? `
                <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; border: 1px solid #bbf7d0; margin: 20px 0;">
                    <h2 style="color: #166534; text-align: center;"> Your eSIM is Ready!</h2>
                    
                    ${data.esim.qrUrl ? `
                    <div style="text-align: center; margin: 20px 0;">
                        <img src="${data.esim.qrUrl}" alt="eSIM QR Code" style="width: 200px; height: 200px; border: 4px solid white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);" />
                        <p style="font-size: 12px; color: #64748b;">Scan this QR code in your phone settings</p>
                    </div>
                    ` : ''}

                    <div style="margin-top: 20px;">
                        <p><strong>SM-DP+ Address:</strong> ${server || 'N/A'}</p>
                        <p><strong>Activation Code:</strong> ${activationCode || data.esim.lpa}</p>
                        <p><strong>ICCID:</strong> ${data.esim.iccid}</p>
                    </div>
                </div>
                
                <div style="margin-top: 20px;">
                    <h3>How to Install:</h3>
                    <ol>
                        <li>Go to Settings > Cellular/Mobile Data</li>
                        <li>Tap "Add eSIM" or "Add Data Plan"</li>
                        <li>Scan the QR code above</li>
                        <li>Label it as "Travel" and enable Data Roaming</li>
                    </ol>
                </div>
                ` : '<p style="color: #ea580c;">Your eSIM is being processed. Using a physical SIM?</p>'}
                
                <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 30px;">
                    © ${new Date().getFullYear()} GateSIM. All rights reserved.
                </p>
            </div>
        `;

        try {
            await transporter.sendMail({
                from: `"GateSIM Support" <${process.env.SMTP_EMAIL}>`,
                to,
                subject,
                html
            });
            console.log(`[MailService] Email sent to ${to}`);
        } catch (error) {
            console.error("[MailService] Failed to send email:", error);
        }
    }
}
