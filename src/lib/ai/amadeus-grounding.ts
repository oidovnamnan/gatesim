import { searchFlights, getHotelsInCity, getCityDetails, getPointsOfInterest, getToursAndActivities } from "@/lib/amadeus";
import { format, addDays } from "date-fns";

const COUNTRY_TO_CORE_CITY: Record<string, string> = {
    'JP': 'NRT', // Narita (Tokyo)
    'KR': 'ICN', // Incheon (Seoul)
    'TH': 'BKK', // Bangkok
    'CN': 'PEK', // Beijing
    'SG': 'SIN', // Singapore
    'US': 'JFK', // New York
};

const COUNTRY_TO_SEARCH_CITY: Record<string, string> = {
    'JP': 'Tokyo',
    'KR': 'Seoul',
    'TH': 'Bangkok',
    'CN': 'Beijing',
    'SG': 'Singapore',
    'US': 'New York',
};

export async function getAmadeusFlightContext(destination: string): Promise<string> {
    const destCode = COUNTRY_TO_CORE_CITY[destination];
    if (!destCode) return "";

    const testDate = format(addDays(new Date(), 14), 'yyyy-MM-dd');

    try {
        const flights = await searchFlights('ULN', destCode, testDate);
        if (!flights || flights.length === 0) return "";

        const topFlight = flights[0];
        const airlines = Array.from(new Set(flights.map((f: any) => f.itineraries[0].segments[0].carrierCode)));
        const avgPrice = flights.reduce((acc: number, f: any) => acc + parseFloat(f.price.total), 0) / flights.length;

        return `
--- LIVE AMADEUS FLIGHT DATA ---
Flight search results for ULN to ${destCode}:
- Available Airlines: ${airlines.join(', ')}
- Lowest Price: ${topFlight.price.total} ${topFlight.price.currency}
- Travel Duration: ${topFlight.itineraries[0].duration}
--- END AMADEUS FLIGHT DATA ---
`;
    } catch (error) { return ""; }
}

export async function getAmadeusHotelContext(destination: string): Promise<string> {
    const cityCode = COUNTRY_TO_CORE_CITY[destination];
    if (!cityCode) return "";

    try {
        const hotels = await getHotelsInCity(cityCode);
        if (!hotels || hotels.length === 0) return "";

        const hotelNames = hotels.slice(0, 5).map((h: any) => h.name);

        return `
--- LIVE AMADEUS HOTEL DATA ---
Top available hotels in ${cityCode}:
${hotelNames.map((name: string) => `- ${name}`).join('\n')}
--- END AMADEUS HOTEL DATA ---
`;
    } catch (error) { return ""; }
}

export async function getAmadeusActivityContext(destination: string): Promise<string> {
    const cityName = COUNTRY_TO_SEARCH_CITY[destination];
    if (!cityName) return "";

    try {
        const city = await getCityDetails(cityName);
        if (!city || !city.geoCode) return "";

        const { latitude, longitude } = city.geoCode;

        // Fetch both POIs and Activities
        const [poi, activities] = await Promise.all([
            getPointsOfInterest(latitude, longitude),
            getToursAndActivities(latitude, longitude)
        ]);

        const poiList = poi?.slice(0, 5).map((p: any) => `${p.name} (${p.category})`) || [];
        const activityList = activities?.slice(0, 5).map((a: any) => `${a.name} (${a.price?.amount} ${a.price?.currencyCode || ''})`) || [];

        return `
--- LIVE AMADEUS ACTIVITIES & ATTRACTIONS ---
Real-world attractions in ${cityName}:
${poiList.map((p: string) => `- ${p}`).join('\n')}

Bookable tours/activities in ${cityName}:
${activityList.map((a: string) => `- ${a}`).join('\n')}
--- END AMADEUS ACTIVITIES ---
`;
    } catch (error) { return ""; }
}
