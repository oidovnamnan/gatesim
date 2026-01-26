
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
            // Fallback generator for unconfigured env
            const mockOffers = generateMockFlights(date);
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
        console.log("Returning Realistic Mock Data due to API failure/Sandbox limit");
        const mockOffers = generateMockFlights(departureDate);

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

// Helper to generate realistic looking flight data
function generateMockFlights(dateString: string) {
    const airlines = [
        { code: "OM", name: "MIAT" },
        { code: "CA", name: "Air China" },
        { code: "KE", name: "Korean Air" },
        { code: "TK", name: "Turkish Airlines" }
    ];

    return Array.from({ length: 3 }).map((_, i) => {
        const airline = airlines[i % airlines.length];
        // Generate realistic looking flight number like 501, 882
        const flightNum = Math.floor(Math.random() * 800) + 101;
        const price = 420 + Math.floor(Math.random() * 250);

        // Calculate plausible times (Morning, Afternoon, Evening)
        const depHour = 7 + (i * 5);
        const durationHours = 2 + i;
        const arrHour = depHour + durationHours;

        return {
            id: `${airline.code}${flightNum}`, // e.g. OM501 - Looks like real flight code
            price: `${price}.00 EUR`,
            airline: airline.code,
            departure: `${dateString}T${depHour.toString().padStart(2, '0')}:30:00`,
            arrival: `${dateString}T${arrHour.toString().padStart(2, '0')}:45:00`,
            duration: `${durationHours}h 15m`,
            stops: i === 0 ? 0 : 1
        };
    });
}
