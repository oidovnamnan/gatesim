/**
 * QPay Payment Types
 */

export interface QPayConfig {
    username: string;
    password: string;
    invoiceCode: string;
    apiUrl: string;
    callbackUrl: string;
}

export interface QPayAuthResponse {
    token_type: string;
    refresh_expires_in: number;
    refresh_token: string;
    access_token: string;
    expires_in: number;
    scope: string;
    not_before_policy: number;
    session_state: string;
}

export interface QPayInvoiceRequest {
    invoice_code: string;
    sender_invoice_no: string;
    invoice_receiver_code: string;
    invoice_description: string;
    amount: number;
    callback_url: string;
    sender_branch_code?: string;
}

export interface QPayInvoiceResponse {
    invoice_id: string;
    qr_text: string;
    qr_image: string;
    qPay_shortUrl: string;
    urls: QPayDeeplink[];
}

export interface QPayDeeplink {
    name: string;
    description: string;
    logo: string;
    link: string;
}

export interface QPayPaymentCheckRequest {
    object_type: "INVOICE";
    object_id: string;
    offset?: {
        page_number: number;
        page_limit: number;
    };
}

export interface QPayPaymentCheckResponse {
    count: number;
    paid_amount: number;
    rows: QPayPaymentRow[];
}

export interface QPayPaymentRow {
    payment_id: string;
    payment_status: "PAID" | "PENDING" | "FAILED";
    payment_date: string;
    payment_fee: number;
    payment_amount: number;
    payment_currency: string;
    payment_wallet: string;
    transaction_type: string;
}

export interface QPayCallbackData {
    payment_id: string;
    payment_status: string;
    payment_date: string;
    payment_amount: number;
    payment_currency: string;
    invoice_id: string;
}
