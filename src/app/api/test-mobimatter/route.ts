
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const apiKey = process.env.MOBIMATTER_API_KEY;
        const merchantId = process.env.MOBIMATTER_MERCHANT_ID;

        console.log("Testing with exact headers from docs...");

        // DOCS SAY:
        // -H 'api-key: ...'
        // -H 'merchantId: ...'  (camelCase, no hyphen)

        const res = await fetch("https://api.mobimatter.com/mobimatter/api/v2/products", {
            headers: {
                'api-key': apiKey || '',
                'merchantId': merchantId || '',
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            cache: 'no-store'
        });

        const status = res.status;
        const text = await res.text();

        let json = null;
        try {
            json = JSON.parse(text);
        } catch (e) {
            // Not JSON
        }

        return NextResponse.json({
            status,
            ok: res.ok,
            headersUsed: {
                'api-key': apiKey ? 'PRESENT' : 'MISSING',
                'merchantId': merchantId ? 'PRESENT' : 'MISSING' // Showing key name in logs
            },
            response: json || text
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
