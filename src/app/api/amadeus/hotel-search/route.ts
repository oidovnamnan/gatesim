import { NextResponse } from "next/server";
import { getHotelsInCity } from "@/lib/amadeus";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city");

    if (!city) {
        return NextResponse.json({ error: "Missing city code (e.g. ICN)" }, { status: 400 });
    }

    try {
        const hotels = await getHotelsInCity(city);

        if (!hotels) {
            return NextResponse.json({ error: "Failed to fetch hotels" }, { status: 500 });
        }

        // Return top 10 hotels
        return NextResponse.json({
            success: true,
            count: hotels.length,
            hotels: hotels.slice(0, 10).map((h: any) => ({
                id: h.hotelId,
                name: h.name,
                iataCode: h.iataCode,
                chain: h.chainCode,
                coordinates: h.geoCode
            }))
        });
    } catch (error) {
        console.error("Hotel Search PoC Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
