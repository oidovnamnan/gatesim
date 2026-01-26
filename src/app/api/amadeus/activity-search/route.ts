import { NextResponse } from "next/server";
import { getCityDetails, getPointsOfInterest, getToursAndActivities } from "@/lib/amadeus";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const cityName = searchParams.get("city");

    if (!cityName) {
        return NextResponse.json({ error: "Missing city name" }, { status: 400 });
    }

    try {
        const city = await getCityDetails(cityName);

        if (!city || !city.geoCode) {
            return NextResponse.json({ error: "City not found or coordinates missing" }, { status: 404 });
        }

        const { latitude, longitude } = city.geoCode;

        // Fetch both POIs and Activities in parallel
        const [poi, activities] = await Promise.all([
            getPointsOfInterest(latitude, longitude),
            getToursAndActivities(latitude, longitude)
        ]);

        return NextResponse.json({
            success: true,
            city: city.name,
            poiCount: poi?.length || 0,
            activityCount: activities?.length || 0,
            attractions: poi?.slice(0, 10).map((p: any) => ({
                name: p.name,
                category: p.category,
                tags: p.tags
            })),
            tours: activities?.slice(0, 10).map((a: any) => ({
                name: a.name,
                price: a.price ? `${a.price.amount} ${a.price.currencyCode}` : 'N/A',
                shortDescription: a.shortDescription
            }))
        });
    } catch (error) {
        console.error("Activity Search PoC Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
