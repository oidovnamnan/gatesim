/**
 * QPay Payment Client
 * Mongolian payment gateway integration
 */

import {
    QPayConfig,
    QPayAuthResponse,
    QPayInvoiceRequest,
    QPayInvoiceResponse,
    QPayPaymentCheckRequest,
    QPayPaymentCheckResponse,
} from "./types";

class QPayClient {
    private config: QPayConfig;
    private accessToken: string | null = null;
    private tokenExpiresAt: Date | null = null;

    constructor(config?: Partial<QPayConfig>) {
        this.config = {
            username: config?.username || process.env.QPAY_USERNAME || "",
            password: config?.password || process.env.QPAY_PASSWORD || "",
            invoiceCode: config?.invoiceCode || process.env.QPAY_INVOICE_CODE || "",
            apiUrl: config?.apiUrl || process.env.QPAY_API_URL || "https://merchant.qpay.mn/v2",
            callbackUrl: config?.callbackUrl || process.env.QPAY_CALLBACK_URL || "",
        };
    }

    /**
     * Get authentication token
     */
    private async authenticate(): Promise<string> {
        // Check if we have a valid token
        if (this.accessToken && this.tokenExpiresAt && new Date() < this.tokenExpiresAt) {
            return this.accessToken;
        }

        const credentials = Buffer.from(
            `${this.config.username}:${this.config.password}`
        ).toString("base64");

        const response = await fetch(`${this.config.apiUrl}/auth/token`, {
            method: "POST",
            headers: {
                Authorization: `Basic ${credentials}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`QPay authentication failed: ${response.statusText}`);
        }

        const data: QPayAuthResponse = await response.json();
        this.accessToken = data.access_token;
        this.tokenExpiresAt = new Date(Date.now() + (data.expires_in - 60) * 1000);

        return this.accessToken;
    }

    /**
     * Make authenticated API request
     */
    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const token = await this.authenticate();

        const response = await fetch(`${this.config.apiUrl}${endpoint}`, {
            ...options,
            headers: {
                ...options.headers,
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`QPay API error: ${error || response.statusText}`);
        }

        return response.json();
    }

    /**
     * Create an invoice
     */
    async createInvoice(params: {
        orderId: string;
        amount: number;
        description: string;
    }): Promise<QPayInvoiceResponse> {
        const request: QPayInvoiceRequest = {
            invoice_code: this.config.invoiceCode,
            sender_invoice_no: params.orderId,
            invoice_receiver_code: "terminal",
            invoice_description: params.description,
            amount: params.amount,
            callback_url: `${this.config.callbackUrl}?order_id=${params.orderId}`,
        };

        return this.request<QPayInvoiceResponse>("/invoice", {
            method: "POST",
            body: JSON.stringify(request),
        });
    }

    /**
     * Check payment status
     */
    async checkPayment(invoiceId: string): Promise<QPayPaymentCheckResponse> {
        const request: QPayPaymentCheckRequest = {
            object_type: "INVOICE",
            object_id: invoiceId,
        };

        return this.request<QPayPaymentCheckResponse>("/payment/check", {
            method: "POST",
            body: JSON.stringify(request),
        });
    }

    /**
     * Cancel an invoice
     */
    async cancelInvoice(invoiceId: string): Promise<{ success: boolean }> {
        return this.request<{ success: boolean }>(`/invoice/${invoiceId}`, {
            method: "DELETE",
        });
    }

    /**
     * Get invoice details
     */
    async getInvoice(invoiceId: string): Promise<QPayInvoiceResponse> {
        return this.request<QPayInvoiceResponse>(`/invoice/${invoiceId}`);
    }

    /**
     * Verify callback signature (if QPay provides signature verification)
     */
    verifyCallback(_payload: string, _signature: string): boolean {
        // QPay callback verification logic
        // Note: Implement based on QPay's documentation if they provide HMAC signature
        // For now, we'll rely on the order_id matching
        return true;
    }
}

// Export singleton instance
export const qpay = new QPayClient();

// Export class for custom instances
export { QPayClient };
