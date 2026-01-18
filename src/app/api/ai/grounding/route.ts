import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
    try {
        const { destination, city, purposes, budget, type, filters } = await request.json();

        if (!destination || !type) {
            return NextResponse.json(
                { success: false, error: "Missing required fields" },
                { status: 400 }
            );
        }

        // --- Filter Logic ---
        let filterPrompt = '';
        if (type === 'hotel' && filters) {
            const { hotelStars, hotelArea } = filters;
            if (hotelStars !== 'all') filterPrompt += ` Ensure the hotels have a rating of at least ${hotelStars} stars.`;
            if (hotelArea === 'center') filterPrompt += ` Prioritize hotels located in the central/downtown area of the city.`;
            if (hotelArea === 'transit') filterPrompt += ` Prioritize hotels near major airports, train stations, or transit hubs.`;
            if (hotelArea === 'scenic') filterPrompt += ` Prioritize hotels in scenic, quiet, or residential areas away from the noise.`;
        }

        const systemPrompt = `You are a travel database explorer. Return a JSON list of 5 REAL-WORLD ${type}s in ${city || destination}.
    
    ${type === 'hotel' ? 'Ensure they match the budget level: ' + budget + '. ' + filterPrompt : ''}
    ${purposes ? 'Consider the trip purposes: ' + purposes : ''}

    CRITICAL: 
    - Return ONLY valid JSON.
    - Include REAL names, approximate price, and a short justification.
    - Include a Booking.com search URL for each entry if applicable.
    - Include a high-quality "imageUrl" for each entry. Use valid, high-resolution Unsplash source URLs (e.g. https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800).

    JSON Format:
    {
      "options": [
        {
          "id": "1",
          "name": "Exact Name",
          "description": "Short description",
          "price": "approx price (e.g. $120)",
          "rating": 4.5,
          "address": "Street address",
          "bookingUrl": "Direct search URL",
          "imageUrl": "https://images.unsplash.com/photo-..."
        }
      ]
    }
    `;

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Find 5 ${type}s in ${city || destination}.` },
            ],
            response_format: { type: "json_object" },
        });

        const data = JSON.parse(response.choices[0].message.content || "{}");

        return NextResponse.json({
            success: true,
            options: data.options || [],
        });
    } catch (error: any) {
        console.error("Grounding Error:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
