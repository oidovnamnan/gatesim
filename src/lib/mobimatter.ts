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
    if (!process.env.MOBIMATTER_API_KEY || !process.env.MOBIMATTER_MERCHANT_ID) {
        console.warn("MobiMatter API credentials missing. Returning MOCK data.");
        return [
            {
                sku: "MOCK-JP-10",
                name: "Japan Travel Data",
                price: 12.50,
                currency: "USD",
                dataAmount: 10240, // 10GB
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
                dataAmount: -1, // Unlimited
                durationDays: 7,
                countries: ["KR"],
                provider: "SK Telecom",
                description: "Unlimited data for 7 days",
                isRegional: false
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

    try {
        const res = await fetch(`${BASE_URL}/products`, {
            headers: {
                'api-key': process.env.MOBIMATTER_API_KEY,
                'merchantId': process.env.MOBIMATTER_MERCHANT_ID, // camelCase as required
                'Accept': 'application/json'
            },
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (!res.ok) {
            console.error(`MobiMatter API Failed: ${res.status} ${res.statusText}`);
            throw new Error("Failed to fetch products");
        }

        const rawData = await res.json();
        const productsList = Array.isArray(rawData) ? rawData : (rawData.result || []);

        if (productsList.length === 0) {
            console.warn("MobiMatter API returned 0 products.");
            return [];
        }

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
        console.error("MobiMatter Fetch Error:", e);
        return []; // Return empty on error, no mocks
    }
}

export async function createMobiMatterOrder(sku: string): Promise<any> {
    if (!process.env.MOBIMATTER_API_KEY || !process.env.MOBIMATTER_MERCHANT_ID) {
        throw new Error("MobiMatter API credentials missing. Cannot create order.");
    }

    const headers = {
        'api-key': process.env.MOBIMATTER_API_KEY,
        'merchantId': process.env.MOBIMATTER_MERCHANT_ID,
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
