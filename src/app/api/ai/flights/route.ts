
import { NextRequest, NextResponse } from "next/server";
import { getAmadeus } from "@/lib/amadeus";

// Simple mapping for demonstration (ULN is constant origin for now as per context)
const AIRPORT_CODES: Record<string, string> = {
    "CN": "PEK", // Beijing
    "JP": "NRT", // Tokyo
    "KR": "ICN", // Seoul
    "TH": "BKK", // Bangkok
    "SG": "SIN", // Singapore
    "US": "LAX", // Los Angeles
    "VN": "SGN", // Ho Chi Minh
    "MY": "KUL", // Kuala Lumpur
    "ID": "CGK", // Jakarta
    "PH": "MNL", // Manila
    "TW": "TPE", // Taipei
    "HK": "HKG", // Hong Kong
    "AE": "DXB", // Dubai
    "TR": "IST", // Istanbul
    "GB": "LHR", // London
    "FR": "CDG", // Paris
    "DE": "FRA", // Frankfurt
    "IT": "FCO", // Rome
    "AU": "SYD", // Sydney
    "RU": "SVO", // Moscow
};

export async function POST(request: NextRequest) {
    try {
        console.log("--- FLIGHT SEARCH REQUEST STARTED ---");

        let body;
        try {
            body = await request.json();
        } catch (e) {
            console.error("Failed to parse request JSON");
            return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
        }

        const { destination, date, travelers } = body;
        console.log("Request Params:", { destination, date, travelers });

        const amadeus = getAmadeus();

        // If Amadeus is not configured, return MOCK immediately to avoid crash
        if (!amadeus) {
            console.error("Amadeus Instance is NULL - Check env vars");
            const mockOffers = [
                { id: "MOCK-1", price: "450.00 EUR", airline: "OM", departure: `${new Date().toISOString().split('T')[0]}T07:45:00`, arrival: `${new Date().toISOString().split('T')[0]}T11:30:00`, duration: "3h 45m", stops: 0 }
            ];
            return NextResponse.json({ success: true, offers: mockOffers, isMock: true, reason: "Amadeus not configured" });
        }

        const destinationCode = AIRPORT_CODES[destination] || "PEK";
        const departureDate = date ? new Date(date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        const originCode = 'UBN';

        console.log(`Searching Amadeus: ${originCode} -> ${destinationCode} on ${departureDate}`);

        let response;
        try {
            response = await amadeus.shopping.flightOffersSearch.get({
                originLocationCode: originCode,
                destinationLocationCode: destinationCode,
                departureDate: departureDate,
                adults: travelers?.adults || 1,
                max: 5
            });
        } catch (searchError: any) {
            console.error("Primary search failed:", searchError.message);
            // We swallow this error and let the logic proceed to "if (response)" check, which will fail and trigger fallback
        }

        if (response && response.data) {
            console.log(`Amadeus returned ${response.data.length} flights`);
            const offers = response.data.map((offer: any) => {
                const segment = offer.itineraries[0].segments[0];
                return {
                    id: offer.id,
                    price: `${offer.price.total} ${offer.price.currency}`,
                    airline: segment.carrierCode,
                    departure: segment.departure.at,
                    arrival: segment.arrival.at,
                    duration: offer.itineraries[0].duration.replace('PT', '').replace('H', 'h ').replace('M', 'm'),
                    stops: offer.itineraries[0].segments.length - 1
                };
            });
            return NextResponse.json({ success: true, offers });
        }

        // --- FALLBACK MOCK IF NO RESPONSE OR ERROR ---
        console.log("Returning Mock Fallback Data due to API failure/no results");
        const mockOffers = [
            {
                id: "MOCK-1",
                price: "450.00 EUR",
                airline: "OM",
                departure: `${new Date().toISOString().split('T')[0]}T07:45:00`,
                arrival: `${new Date().toISOString().split('T')[0]}T11:30:00`,
                duration: "3h 45m",
                stops: 0
            },
            {
                id: "MOCK-2",
                price: "380.00 EUR",
                airline: "CA",
                departure: `${new Date().toISOString().split('T')[0]}T13:20:00`,
                arrival: `${new Date().toISOString().split('T')[0]}T15:50:00`,
                duration: "2h 30m",
                stops: 1
            }
        ];

        return NextResponse.json({
            success: true,
            offers: mockOffers,
            isMock: true
        });

    } catch (criticalError: any) {
        console.error("CRITICAL FLIGHT API ERROR:", criticalError);
        return NextResponse.json({ success: false, error: criticalError.message }, { status: 500 });
    }
}
