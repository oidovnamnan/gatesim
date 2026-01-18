import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
    try {
        const { destination, city, purposes, budget, type } = await request.json();

        if (!destination || !type) {
            return NextResponse.json(
                { success: false, error: "Missing required fields" },
                { status: 400 }
            );
        }

        // This prompt asks the AI to act as a search engine and return REAL-WORLD places
        // In a prod environment, this would call Google Places API directly.
        const systemPrompt = `You are a travel database explorer. Return a JSON list of 5 REAL-WORLD ${type}s in ${city || destination}.
    
    ${type === 'hotel' ? 'Ensure they match the budget level: ' + budget : ''}
    ${purposes ? 'Consider the trip purposes: ' + purposes : ''}

    CRITICAL: 
    - Return ONLY valid JSON.
    - Include REAL names, approximate price, and a short justification.
    - Include a Booking.com search URL for each entry if applicable.

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
          "imageSearch": "Keyword for image search"
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
