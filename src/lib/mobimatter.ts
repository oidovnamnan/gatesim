export interface MobiMatterProduct {
    sku: string;
    name: string;
    price: number;
    currency: string;
    dataAmount: number; // in MB
    durationDays: number;
    countries: string[];
    provider: string; // e.g. "eSIMGo", "RedteaGO"
    description?: string;
    isRegional?: boolean;
}

const BASE_URL = "https://api.mobimatter.com/mobimatter/api/v2";

import { getPricingSettings } from "@/lib/settings";

// ... existing imports

export async function getMobiMatterProducts(): Promise<MobiMatterProduct[]> {
    // Check credentials immediately
    if (!process.env.MOBIMATTER_API_KEY || !process.env.MOBIMATTER_MERCHANT_ID) {
        console.error("[MobiMatter] API credentials missing! Please check .env file.");
        return [];
    }

    // Fetch pricing settings
    const { usdToMnt, marginPercent } = await getPricingSettings();

    try {
        console.log("[MobiMatter] Connecting to API...");
        const res = await fetch(`${BASE_URL}/products`, {
            headers: {
                'api-key': process.env.MOBIMATTER_API_KEY,
                'merchantId': process.env.MOBIMATTER_MERCHANT_ID, // camelCase as required
                'Accept': 'application/json'
            },
            next: {
                revalidate: 3600, // Cache for 1 hour default
                tags: ['products'] // Allow manual revalidation
            }
        });

        if (!res.ok) {
            console.error(`[MobiMatter] API Request Failed: ${res.status} ${res.statusText}`);
            return [];
        }

        const rawData = await res.json();
        const productsList = Array.isArray(rawData) ? rawData : (rawData.result || []);

        if (productsList.length === 0) {
            console.warn("[MobiMatter] API returned 0 products.");
            return [];
        }

        console.log(`[MobiMatter] Successfully fetched ${productsList.length} products.`);

        // Map API response to our internal format
        const mappedProducts: MobiMatterProduct[] = productsList.map((p: any) => {
            const details = p.productDetails || [];
            const getValue = (key: string) => details.find((d: any) => d.name === key)?.value;

            const dataLimit = parseFloat(getValue("PLAN_DATA_LIMIT") || "0");
            const dataUnit = getValue("PLAN_DATA_UNIT") || "GB";
            let validity = parseInt(getValue("PLAN_VALIDITY") || "0", 10);
            const title = getValue("PLAN_TITLE") || p.productCategory || "Unknown Package";

            // Validity Heuristics
            if (validity > 60) {
                const daysFromHours = Math.round(validity / 24);
                if (daysFromHours > 0 && daysFromHours < 366) validity = daysFromHours;
            }
            if (validity === 0 || validity > 365) {
                const durationMatch = title.match(/(\d+)\s*(days?|day|d)/i);
                if (durationMatch) {
                    const parsed = parseInt(durationMatch[1], 10);
                    if (parsed > 0 && parsed < 366) validity = parsed;
                }
            }

            // Description
            let description = "";
            try {
                const descJson = JSON.parse(getValue("PLAN_DETAILS") || "{}");
                description = (descJson.items || []).join(". ");
            } catch {
                description = getValue("PLAN_DETAILS") || "";
            }

            // Calculate MB
            let mb = 0;
            if (dataUnit === "MB") mb = dataLimit;
            else if (dataUnit === "GB") mb = dataLimit * 1024;
            if (getValue("UNLIMITED") === "1") mb = -1;

            // Countries
            const countryCodes = p.countries ? p.countries.map((c: any) => c.alpha2Code || c) : [];

            // --- PRICING CALCULATION ---
            const basePrice = p.retailPrice || 0;
            const originalCurrency = p.currencyCode;
            let finalPrice = 0;

            if (originalCurrency === 'MNT') {
                // If it's already MNT, we just add margin. No exchange rate multiplication.
                const priceWithMargin = basePrice * (1 + marginPercent / 100);
                finalPrice = Math.ceil(priceWithMargin / 100) * 100;
            } else {
                // Assume USD (or convert others to MNT using USD rate as fallback)
                const priceWithMargin = basePrice * (1 + marginPercent / 100);
                const priceMnt = priceWithMargin * usdToMnt;
                finalPrice = Math.ceil(priceMnt / 100) * 100;
            }

            return {
                sku: p.productId,
                name: title,
                price: finalPrice, // Transformed to MNT
                currency: "MNT",   // Hardcoded since we converted it
                dataAmount: mb,
                durationDays: validity,
                countries: countryCodes.length > 0 ? countryCodes : ["Global"],
                provider: p.providerName,
                description: description.substring(0, 150) + (description.length > 150 ? "..." : ""),
                isRegional: countryCodes.length > 1
            };
        });

        return mappedProducts;

    } catch (e) {
        console.error("[MobiMatter] Fetch Error:", e);
        return getMockProducts();
    }
}

// Helper to return mock data
function getMockProducts(): MobiMatterProduct[] {
    return [
        {
            sku: "MOCK-JP-10",
            name: "Japan Travel Data",
            price: 12.50,
            currency: "USD",
            dataAmount: 10240,
            durationDays: 15,
            countries: ["JP"],
            provider: "GateGlobal",
            description: "High speed 5G data in Japan",
            isRegional: false
        },
        {
            sku: "MOCK-KR-UNL",
            name: "Korea Unlimited",
            price: 18.00,
            currency: "USD",
            dataAmount: -1,
            durationDays: 7,
            countries: ["KR"],
            provider: "SK Telecom",
            description: "Unlimited data for 7 days",
            isRegional: false
        },
        {
            sku: "MOCK-CN-15",
            name: "China Premium 15GB",
            price: 22.00,
            currency: "USD",
            dataAmount: 15360,
            durationDays: 30,
            countries: ["CN"],
            provider: "China Unicom",
            description: "Works with VPN, no restrictions",
            isRegional: false
        },
        {
            sku: "MOCK-TH-DTAC",
            name: "Thailand Tourist 50GB",
            price: 9.50,
            currency: "USD",
            dataAmount: 51200,
            durationDays: 10,
            countries: ["TH"],
            provider: "DTAC",
            description: "Best tourist sim in Thailand",
            isRegional: false
        },
        {
            sku: "MOCK-US-30",
            name: "USA T-Mobile 30GB",
            price: 32.00,
            currency: "USD",
            dataAmount: 30720,
            durationDays: 30,
            countries: ["US"],
            provider: "T-Mobile",
            description: "Nationwide 5G coverage",
            isRegional: false
        },
        {
            sku: "MOCK-EU-10",
            name: "Europe 35 Countries 10GB",
            price: 14.00,
            currency: "USD",
            dataAmount: 10240,
            durationDays: 30,
            countries: ["FR", "DE", "IT", "ES", "NL"],
            provider: "Orange",
            description: "Covers standard EU countries",
            isRegional: true
        },
        {
            sku: "MOCK-ASIA-REG",
            name: "Asia Pacific 20GB",
            price: 25.00,
            currency: "USD",
            dataAmount: 20480,
            durationDays: 30,
            countries: ["JP", "KR", "SG", "TH", "VN", "CN"],
            provider: "AsiaLink",
            description: "Best for multi-country travel",
            isRegional: true
        },
        {
            sku: "MOCK-GLOBAL",
            name: "Global 5GB",
            price: 35.00,
            currency: "USD",
            dataAmount: 5120,
            durationDays: 365,
            countries: ["US", "UK", "EU", "AU", "MN"],
            provider: "WorldConnect",
            description: "Valid for 1 year in 100+ countries",
            isRegional: true
        }
    ];
}

export async function createMobiMatterOrder(sku: string): Promise<any> {
    const apiKey = process.env.MOBIMATTER_API_KEY;
    const merchantId = process.env.MOBIMATTER_MERCHANT_ID;

    if (!apiKey || !merchantId) {
        throw new Error("MobiMatter API credentials missing. Cannot create order.");
    }

    const headers = {
        'api-key': apiKey,
        'merchantId': merchantId,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };

    try {
        const createRes = await fetch(`${BASE_URL}/order`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                productId: sku,
                productCategory: "esim_realtime"
            })
        });

        if (!createRes.ok) {
            const err = await createRes.text();
            throw new Error(`Create Order Failed: ${createRes.status} - ${err}`);
        }

        const createData = await createRes.json();
        const orderId = createData.result?.orderId || createData.orderId;

        if (!orderId) {
            throw new Error("No Order ID received from MobiMatter");
        }

        const completeRes = await fetch(`${BASE_URL}/order/complete`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({
                orderId: orderId,
                provider: createData.result?.provider || createData.provider
            })
        });

        if (!completeRes.ok) {
            const err = await completeRes.text();
            throw new Error(`Complete Order Failed: ${completeRes.status} - ${err}`);
        }

        const completeData = await completeRes.json();
        const result = completeData.result;
        const details = result.orderLineItem?.lineItemDetails || [];
        const getValue = (k: string) => details.find((d: any) => d.name === k)?.value;

        return {
            success: true,
            orderId: result.orderId,
            status: "COMPLETED",
            esim: {
                iccid: getValue("ICCID") || result.iccid || "N/A",
                lpa: getValue("LOCAL_PROFILE_ASSISTANT") || getValue("LPA") || "N/A",
                qrData: getValue("QR_CODE") || ""
            },
            raw: result
        };

    } catch (error: any) {
        console.error("MobiMatter Order Error:", error);
        throw error;
    }
}
