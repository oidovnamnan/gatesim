import Amadeus from 'amadeus';

// Singleton instance to prevent multiple initializations
let amadeusInstance: any = null;

export function getAmadeus() {
    if (!amadeusInstance) {
        const clientId = process.env.AMADEUS_CLIENT_ID;
        const clientSecret = process.env.AMADEUS_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
            console.error("[Amadeus] Missing API Keys. Flight/Hotel search will fail.");
            return null;
        }

        amadeusInstance = new Amadeus({
            clientId,
            clientSecret,
            // Automatically switches to production if keys are from production environment
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
    const amadeus = getAmadeus();
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
    const amadeus = getAmadeus();
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
