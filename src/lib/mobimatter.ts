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
    originalPrice?: number;
    originalCurrency?: string;
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
            } else if (originalCurrency === 'USD') {
                const priceWithMargin = basePrice * (1 + marginPercent / 100);
                const priceMnt = priceWithMargin * usdToMnt;
                finalPrice = Math.ceil(priceMnt / 100) * 100;
            } else {
                // Unknown currency (e.g., VND, EUR). Prevent converting as USD!
                console.warn(`[MobiMatter] Skipping price calc for unknown currency: ${originalCurrency} (Value: ${basePrice})`);
                finalPrice = 0; // Or handle other currencies if needed
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
                isRegional: countryCodes.length > 1,
                originalPrice: basePrice,
                originalCurrency: originalCurrency
            };
        });

        return mappedProducts;

    } catch (e) {
        console.error("[MobiMatter] Fetch Error:", e);
        throw e;
    }
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
            const errText = await createRes.text();
            console.error(`[MobiMatter] Create Failed Body: ${errText}`);
            throw new Error(`Create Order Failed: ${createRes.status} - ${errText}`);
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
