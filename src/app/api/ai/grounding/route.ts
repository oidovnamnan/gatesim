import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
    try {
        const { destination, city, purposes, budget, type, filters, purposeDetails } = await request.json();

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

        // --- Detailed Purpose Context ---
        let detailPrompt = '';
        // Use the specific detail for the current discovery type if available
        const currentDetail = purposeDetails?.[type];
        if (currentDetail) {
            detailPrompt = ` CRITICAL: The user has specified a specific need for this ${type}: "${currentDetail}". Priority #1 is to find results matching this exact description (e.g., if it says furniture, find spots near furniture markets).`;
        } else if (purposeDetails) {
            // Otherwise, provide a general context of all details
            const allDetails = Object.entries(purposeDetails)
                .map(([id, val]) => `${id}: ${val}`)
                .join(", ");
            detailPrompt = ` Consider the general trip context: ${allDetails}.`;
        }

        const itemCount = type === 'hotel' ? 5 : 10;

        const systemPrompt = `You are a professional travel database explorer. Return a JSON list of ${itemCount} REAL-WORLD ${type}s in ${city || destination}.
    
    ${type === 'hotel' ? 'Ensure they match the budget level: ' + budget + '. ' + filterPrompt : ''}
    ${purposes ? 'Consider the trip purposes: ' + purposes + '.' : ''}
    ${detailPrompt}

    CATEGORY GUIDELINES:
    - attraction: Find unique, must-visit spots including hidden gems.
    - shopping: If purpose is procurement, find wholesale markets, industrial zones, or trade centers. If leisure, find luxury malls or local markets.
    - medical: Find top-rated hospitals or clinics relevant to the user's needs.
    - dining: Find highly-rated restaurants from local specialties to fine dining.

    CRITICAL: 
    - Return ONLY valid JSON.
    - Descriptions must be VERY DETAILED (at least 2-3 sentences) explaining why this is relevant to the user's purpose: "${purposes}".
    - Include REAL names, approximate price, and a compelling justification.
    - Include a Booking.com search URL for each entry if applicable.
    - IMAGES: Include a high-quality "imageUrl". For hotels, use ONLY architectural exterior/lobby shots from Unsplash. 
      E.g. https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800
      CRITICAL: NEVER show people, beach scenes (unless seaside), or unrelated content.
    - For hotels, include "distanceFromAirport" (e.g. "12 km from Pudong Airport").

    JSON Format:
    {
      "options": [
        {
          "id": "1",
          "name": "Exact Name",
          "description": "Very detailed description related to user purpose",
          "price": "approx price or 'Varies'",
          "rating": 4.5,
          "address": "Street address",
          "bookingUrl": "Direct search URL",
          "imageUrl": "https://images.unsplash.com/photo-...",
          "distanceFromAirport": "X km from [Airport Name]"
        }
      ]
    }
    `;

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Find ${itemCount} ${type}s in ${city || destination}. Focus heavily on the user's purpose: ${purposes}.` },
            ],
            response_format: { type: "json_object" },
        });

        const data = JSON.parse(response.choices[0].message.content || "{}");
        const options = (data.options || []).map((opt: any, index: number) => {
            const slug = opt.name.toLowerCase().replace(/[^a-z0-0]/g, '-');
            return {
                ...opt,
                id: `${type}-${slug}`, // Deterministic ID based on name
                imageUrl: opt.imageUrl?.includes('images.unsplash.com')
                    ? opt.imageUrl
                    : `https://loremflickr.com/800/600/${encodeURIComponent(type + ',' + opt.name.split(' ')[0] + ',' + (city || destination))}`
            };
        });

        return NextResponse.json({
            success: true,
            options,
        });
    } catch (error: any) {
        console.error("Grounding Error:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
