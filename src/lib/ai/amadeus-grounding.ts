import { searchFlights } from "@/lib/amadeus";
import { format, addDays } from "date-fns";

const COUNTRY_TO_CORE_CITY: Record<string, string> = {
    'JP': 'NRT', // Narita (Tokyo)
    'KR': 'ICN', // Incheon (Seoul)
    'TH': 'BKK', // Bangkok
    'CN': 'PEK', // Beijing
    'SG': 'SIN', // Singapore
    'US': 'JFK', // New York
};

export async function getAmadeusFlightContext(destination: string): Promise<string> {
    const destCode = COUNTRY_TO_CORE_CITY[destination];
    if (!destCode) return "";

    // For PoC, let's search for a flight 2 weeks from now
    const testDate = format(addDays(new Date(), 14), 'yyyy-MM-dd');

    try {
        const flights = await searchFlights('ULN', destCode, testDate);

        if (!flights || flights.length === 0) {
            return "";
        }

        const topFlight = flights[0];
        const airlines = Array.from(new Set(flights.map((f: any) => f.itineraries[0].segments[0].carrierCode)));
        const avgPrice = flights.reduce((acc: number, f: any) => acc + parseFloat(f.price.total), 0) / flights.length;

        return `
--- LIVE AMADEUS FLIGHT DATA ---
Current real-time flight search results for ULN to ${destCode} around ${testDate}:
- Direct/Available Airlines: ${airlines.join(', ')}
- Lowest Price Found: ${topFlight.price.total} ${topFlight.price.currency}
- Average Price: ${avgPrice.toFixed(2)} ${topFlight.price.currency}
- Travel Duration: ${topFlight.itineraries[0].duration}
- Sample Schedule (First available): Depart at ${topFlight.itineraries[0].segments[0].departure.at}
Use this data to override any static budget or airline assumptions for the international transport segment.
--- END AMADEUS DATA ---
`;
    } catch (error) {
        console.error("Amadeus grounding failed:", error);
        return "";
    }
}
