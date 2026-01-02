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

export async function getMobiMatterProducts(): Promise<MobiMatterProduct[]> {
    const apiKey = process.env.MOBIMATTER_API_KEY;
    const merchantId = process.env.MOBIMATTER_MERCHANT_ID;

    // Debug logs to verify keys are present
    console.log("[MobiMatter] Fetching products...");
    console.log("[MobiMatter] API Key Present:", !!apiKey);
    console.log("[MobiMatter] Merchant ID Present:", !!merchantId);

    // Warn but do not exit - behave as user requested "try API anyway"
    if (!apiKey || !merchantId) {
        console.warn("[MobiMatter] Warning: API credentials missing from process.env");
    }

    try {
        const res = await fetch(`${BASE_URL}/products`, {
            headers: {
                'api-key': apiKey || "",
                'merchantId': merchantId || "", // camelCase as required
                'Accept': 'application/json'
            },
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (!res.ok) {
            console.error(`[MobiMatter] API Request Failed: ${res.status} ${res.statusText}`);
            // If failed, return empty array (or throw error if strictly necessary)
            // Returning empty array allows the page to render "No packages found" instead of crashing
            return [];
        }

        const rawData = await res.json();
        const productsList = Array.isArray(rawData) ? rawData : (rawData.result || []);

        if (productsList.length === 0) {
            console.warn("[MobiMatter] API returned 0 products.");
            return [];
        }

        console.log(`[MobiMatter] Found ${productsList.length} products via API.`);

        // Map API response to our internal format
        const mappedProducts: MobiMatterProduct[] = productsList.map((p: any) => {
            const details = p.productDetails || [];

            const getValue = (key: string) => details.find((d: any) => d.name === key)?.value;

            const dataLimit = parseFloat(getValue("PLAN_DATA_LIMIT") || "0");
            const dataUnit = getValue("PLAN_DATA_UNIT") || "GB";
            let validity = parseInt(getValue("PLAN_VALIDITY") || "0", 10);
            const title = getValue("PLAN_TITLE") || p.productCategory || "Unknown Package";

            // Heuristic for validity validation
            if (validity > 60) {
                const daysFromHours = Math.round(validity / 24);
                if (daysFromHours > 0 && daysFromHours < 366) {
                    validity = daysFromHours;
                }
            }
            if (validity === 0 || validity > 365) {
                const durationMatch = title.match(/(\d+)\s*(days?|day|d)/i);
                if (durationMatch) {
                    const parsedDuration = parseInt(durationMatch[1], 10);
                    if (parsedDuration > 0 && parsedDuration < 366) {
                        validity = parsedDuration;
                    }
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

            // Handle Unlimited
            const isUnlimited = getValue("UNLIMITED") === "1";
            if (isUnlimited) mb = -1;

            // Countries
            const countryCodes = p.countries ? p.countries.map((c: any) => c.alpha2Code || c) : [];

            return {
                sku: p.productId,
                name: title,
                price: p.retailPrice,
                currency: p.currencyCode,
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
        return [];
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
        // STEP 1: Create Order (Reserve)
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

        // STEP 2: Complete Order (Capture)
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
