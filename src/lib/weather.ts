
export interface WeatherData {
    temp: number;
    condition: string;
    description: string;
    icon: string;
    date: string;
}

const API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5";

/**
 * Fetch 5-day weather forecast for a given city
 */
export async function getForecast(city: string): Promise<WeatherData[]> {
    if (!API_KEY) {
        console.warn("[Weather] API Key missing. Returning mock data.");
        return getMockForecast(city);
    }

    try {
        // 1. Get coordinates for city
        const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`);
        const geoData = await geoRes.json();

        if (!geoData || geoData.length === 0) {
            throw new Error(`City not found: ${city}`);
        }

        const { lat, lon } = geoData[0];

        // 2. Get forecast
        const res = await fetch(`${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Failed to fetch weather");
        }

        // 3. Process data (extract 1 forecast per day at 12:00)
        const dailyForecasts: WeatherData[] = data.list
            .filter((item: any) => item.dt_txt.includes("12:00:00"))
            .map((item: any) => ({
                temp: Math.round(item.main.temp),
                condition: item.weather[0].main,
                description: item.weather[0].description,
                icon: item.weather[0].icon,
                date: item.dt_txt.split(" ")[0]
            }));

        return dailyForecasts;
    } catch (error) {
        console.error("[Weather] Error fetching forecast:", error);
        return getMockForecast(city);
    }
}

function getMockForecast(city: string): WeatherData[] {
    const today = new Date();
    return Array.from({ length: 5 }).map((_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        return {
            temp: 20 + Math.floor(Math.random() * 10),
            condition: "Clear",
            description: "clear sky",
            icon: "01d",
            date: date.toISOString().split("T")[0]
        };
    });
}
