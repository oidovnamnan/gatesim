import { NextResponse } from "next/server";
import { searchFlights } from "@/lib/amadeus";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const origin = searchParams.get("origin");
    const dest = searchParams.get("dest");
    const date = searchParams.get("date");

    if (!origin || !dest || !date) {
        return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    try {
        const flights = await searchFlights(origin, dest, date);

        if (!flights) {
            return NextResponse.json({ error: "Failed to fetch flights or API keys missing" }, { status: 500 });
        }

        // Return a simplified version for the PoC
        const simplifiedFlights = flights.map((f: any) => ({
            id: f.id,
            price: `${f.price.total} ${f.price.currency}`,
            airline: f.itineraries[0].segments[0].carrierCode,
            duration: f.itineraries[0].duration,
            departure: f.itineraries[0].segments[0].departure.at,
        }));

        return NextResponse.json({
            success: true,
            count: flights.length,
            flights: simplifiedFlights
        });
    } catch (error) {
        console.error("Flight Search PoC Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
