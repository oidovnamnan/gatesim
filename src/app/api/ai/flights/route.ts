
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
        const { destination, date, travelers } = await request.json();

        const amadeus = getAmadeus();
        if (!amadeus) {
            return NextResponse.json({ success: false, error: "Amadeus not configured" }, { status: 500 });
        }

        const destinationCode = AIRPORT_CODES[destination] || "PEK"; // Default to Beijing if unknown
        const departureDate = date ? new Date(date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

        console.log(`Searching flights: UBN -> ${destinationCode} on ${departureDate}`);

        const response = await amadeus.shopping.flightOffersSearch.get({
            originLocationCode: 'UBN', // Ulaanbaatar (New Airport Code) or ULN
            destinationLocationCode: destinationCode,
            departureDate: departureDate,
            adults: travelers?.adults || 1,
            max: 10
        });

        const offers = response.data.map((offer: any) => {
            const segment = offer.itineraries[0].segments[0];
            return {
                id: offer.id,
                price: `${offer.price.total} ${offer.price.currency}`,
                airline: segment.carrierCode, // In real app, map code to name
                departure: segment.departure.at,
                arrival: segment.arrival.at,
                duration: offer.itineraries[0].duration.replace('PT', '').replace('H', 'h ').replace('M', 'm'),
                stops: offer.itineraries[0].segments.length - 1
            };
        });

        return NextResponse.json({ success: true, offers });

    } catch (error: any) {
        console.error("Flight search error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
