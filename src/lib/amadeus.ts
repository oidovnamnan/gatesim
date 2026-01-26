import Amadeus from 'amadeus';
import { getSystemConfig } from './db';

// Singleton instance to prevent multiple initializations
let amadeusInstance: any = null;

export async function getAmadeus() {
    if (!amadeusInstance) {
        // Fetch config from DB first
        const config = await getSystemConfig();

        const clientId = config.amadeusClientId || process.env.AMADEUS_CLIENT_ID;
        const clientSecret = config.amadeusClientSecret || process.env.AMADEUS_CLIENT_SECRET;
        const env = config.amadeusEnv || process.env.AMADEUS_ENV || 'test';

        if (!clientId || !clientSecret) {
            console.error("[Amadeus] Missing API Keys. Flight/Hotel search will fail.");
            return null;
        }

        amadeusInstance = new Amadeus({
            clientId,
            clientSecret,
            hostname: env === 'production' ? 'production' : 'test'
        });
    }
    return amadeusInstance;
}

/**
 * Search for flight offers between cities
 * @param origin IATA code for origin (e.g. 'ULN')
 * @param destination IATA code for destination (e.g. 'ICN')
 * @param departureTime Date string (YYYY-MM-DD)
 */
export async function searchFlights(origin: string, destination: string, departureTime: string) {
    const amadeus = await getAmadeus();
    if (!amadeus) return null;

    try {
        const response = await amadeus.shopping.flightOffersSearch.get({
            originLocationCode: origin,
            destinationLocationCode: destination,
            departureDate: departureTime,
            adults: '1',
            max: '5' // Limit to top 5 offers for speed/relevance
        });

        return response.data;
    } catch (error) {
        console.error("[Amadeus] Flight search failed:", error);
        return null;
    }
}

/**
 * Get the most relevant IATA code for a city name
 * Useful when the user enters a city name instead of a code
 */
export async function getCityCode(cityName: string) {
    const amadeus = await getAmadeus();
    if (!amadeus) return null;

    try {
        const response = await amadeus.referenceData.locations.get({
            keyword: cityName,
            subType: Amadeus.location.city,
        });

        // Return the first matching city's IATA code
        return response.data[0]?.iataCode || null;
    } catch (error) {
        console.error("[Amadeus] City search failed:", error);
        return null;
    }
}

/**
 * Get list of hotel IDs in a city
 */
export async function getHotelsInCity(cityCode: string) {
    const amadeus = await getAmadeus();
    if (!amadeus) return null;

    try {
        const response = await amadeus.referenceData.locations.hotels.byCity.get({
            cityCode: cityCode
        });
        return response.data;
    } catch (error) {
        console.error("[Amadeus] Hotel list fetch failed:", error);
        return null;
    }
}

/**
 * Get pricing and availability for specific hotels
 * @param hotelIds Array of hotel IDs (e.g. ['HLPAR401'])
 */
export async function getHotelOffers(hotelIds: string[]) {
    const amadeus = await getAmadeus();
    if (!amadeus) return null;

    try {
        const response = await amadeus.shopping.hotelOffersSearch.get({
            hotelIds: hotelIds.join(','),
            adults: '1'
        });
        return response.data;
    } catch (error) {
        // This often fails in Sandbox if there are no test offers for those specific hotels
        console.warn("[Amadeus] Hotel offers fetch failed/empty:", error);
        return null;
    }
}

const CITY_COORDINATES: Record<string, { latitude: number, longitude: number }> = {
    'seoul': { latitude: 37.5665, longitude: 126.9780 },
    'tokyo': { latitude: 35.6762, longitude: 139.6503 },
    'bangkok': { latitude: 13.7563, longitude: 100.5018 },
    'beijing': { latitude: 39.9042, longitude: 116.4074 },
    'chengdu': { latitude: 30.5728, longitude: 104.0668 },
    'guangzhou': { latitude: 23.1291, longitude: 113.2644 },
    'shanghai': { latitude: 31.2304, longitude: 121.4737 },
    'hong kong': { latitude: 22.3193, longitude: 114.1694 },
    'singapore': { latitude: 1.3521, longitude: 103.8198 },
    'ulaanbaatar': { latitude: 47.8864, longitude: 106.9057 },
};

/**
 * Get detailed city info including coordinates
 */
export async function getCityDetails(cityName: string) {
    const amadeus = await getAmadeus();
    if (!amadeus) return null;

    // Use hardcoded fallback for Sandbox reliability
    const fallback = CITY_COORDINATES[cityName.toLowerCase()];

    try {
        const response = await amadeus.referenceData.locations.get({
            keyword: cityName,
            subType: Amadeus.location.city,
        });

        const data = response.data[0];
        if (data && data.geoCode) return data;

        // If Amadeus returns nothing but we have a fallback, use it
        if (fallback) {
            return {
                name: cityName,
                geoCode: fallback
            };
        }
        return null;
    } catch (error) {
        console.warn("[Amadeus] City details fetch failed, trying fallback:", cityName);
        if (fallback) {
            return {
                name: cityName,
                geoCode: fallback
            };
        }
        return null;
    }
}

/**
 * Get top attractions (Points of Interest) near coordinates
 */
export async function getPointsOfInterest(latitude: number, longitude: number) {
    const amadeus = await getAmadeus();
    if (!amadeus) return null;

    try {
        const response = await amadeus.referenceData.locations.pointsOfInterest.get({
            latitude,
            longitude,
            radius: 10 // 10km radius
        });
        return response.data;
    } catch (error) {
        console.error("[Amadeus] POI fetch failed:", error);
        return null;
    }
}

/**
 * Get bookable tours and activities near coordinates
 */
export async function getToursAndActivities(latitude: number, longitude: number) {
    const amadeus = await getAmadeus();
    if (!amadeus) return null;

    try {
        const response = await amadeus.shopping.activities.get({
            latitude,
            longitude,
            radius: 10
        });
        return response.data;
    } catch (error) {
        console.error("[Amadeus] Activities fetch failed:", error);
        return null;
    }
}
