/**
 * Airalo Partner API Types
 */

export interface AiraloConfig {
    clientId: string;
    clientSecret: string;
    apiUrl: string;
    environment: "sandbox" | "production";
}

export interface AiraloAuthResponse {
    data: {
        access_token: string;
        token_type: string;
        expires_in: number;
    };
}

export interface AiraloPackage {
    package_id: string;
    slug: string;
    type: "sim" | "topup";
    price: number;
    net_price: number;
    amount: number; // MB
    day: number;
    is_unlimited: boolean;
    title: string;
    data: string;
    short_info: string | null;
    voice: string | null;
    text: string | null;
    plan_type: "data" | "voice" | "combo";
    activation_policy: "first-usage" | "purchase";
    operator: {
        title: string;
        is_roaming: boolean;
        info: string[];
    };
    countries: string[];
    prices?: {
        net_price: Record<string, number>;
        recommended_retail_price: Record<string, number>;
    };
}

export interface AiraloPackagesResponse {
    pricing?: {
        model: string;
        discount_percentage: number;
    };
    data: AiraloPackage[];
    links?: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
    meta?: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export interface AiraloCountry {
    slug: string;
    title: string;
    code: string;
    image: {
        url: string;
        width: number;
        height: number;
    };
}

export interface AiraloOrderRequest {
    package_id: string;
    quantity: number;
    description?: string;
    brand_settings_name?: string;
}

export interface AiraloOrderResponse {
    data: {
        id: number;
        code: string;
        currency: string;
        package_id: string;
        quantity: number;
        type: string;
        description: string | null;
        esim_type: string;
        validity: number;
        package: string;
        data: string;
        price: number;
        created_at: string;
        sims: AiraloSim[];
    };
}

export interface AiraloSim {
    id: number;
    iccid: string;
    lpa: string;
    imsis: string | null;
    matching_id: string;
    qrcode: string;
    qrcode_url: string;
    direct_apple_installation_url: string;
    confirmation_code: string | null;
    apn_type: string;
    apn_value: string;
    is_roaming: boolean;
    airalo_code: string | null;
    created_at: string;
}

export interface AiraloSimUsage {
    remaining: number;
    total: number;
    used: number;
    unit: string;
    is_unlimited: boolean;
    expired_at: string | null;
    status: "active" | "expired" | "pending";
}

export interface AiraloSimInstructions {
    data: {
        installation_guides: {
            ios: {
                manual: string[];
                qr_code: string[];
            };
            android: {
                manual: string[];
                qr_code: string[];
            };
        };
        network_setup: {
            ios: string[];
            android: string[];
        };
        apn_type: string;
        apn_value: string;
    };
}

export interface AiraloError {
    meta: {
        message: string;
    };
    data?: unknown;
}
