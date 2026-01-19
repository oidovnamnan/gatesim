import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
    try {
        const { destination, purposes, details, currentCity } = await request.json();

        if (!destination) {
            return NextResponse.json({ success: false, error: "Destination is required" }, { status: 400 });
        }

        const countryNames: Record<string, string> = {
            "CN": "China",
            "JP": "Japan",
            "KR": "South Korea",
            "TH": "Thailand",
            "SG": "Singapore",
            "VN": "Vietnam",
            "US": "USA",
            "MY": "Malaysia",
            "ID": "Indonesia",
            "PH": "Philippines",
            "TR": "Turkey",
            "AE": "UAE"
        };

        const countryName = countryNames[destination] || destination;

        const systemPrompt = `You are a travel expert specializing in ${countryName}. 
        Suggest the top 3-4 most suitable cities in ${countryName} for a trip with the following criteria:
        - Main Purposes: ${purposes}
        - User's Specific Needs/Details: ${details || 'N/A'}
        ${currentCity ? `- Starting from/Relative to: ${currentCity}` : ''}

        CRITICAL LOGIC:
        1. If the user mentions "furniture" (тавилга), "market", or "wholesale" in the details for China (CN), MUST suggest Foshan or Guangzhou.
        2. If the user mentions specific medical procedures, suggest cities with top-tier specialized hospitals (e.g., Seoul for Plastic Surgery/Health Screening, Bangkok for General Medical).
        3. Match the city to the details provided.
        4. DISTANCE: If 'Starting from/Relative to' is provided, estimate the approximate distance in km (e.g., "30km" or "1,200km").

        Return a JSON object with a list of cities.
        
        Format:
        {
            "suggestions": [
                {
                    "name": "City Name",
                    "nameMn": "Хот",
                    "reason": "Why this city? (Keep it short, max 15 words)",
                    "distance": "approx distance from ${currentCity || 'Ulaanbaatar'} (e.g. 50km or 1200km)"
                }
            ]
        }`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Suggest cities in ${destination} for ${purposes}. Details: ${details}. Relative to: ${currentCity || 'Ulaanbaatar'}` }
            ],
            response_format: { type: "json_object" },
        });

        const data = JSON.parse(response.choices[0].message.content || "{}");

        return NextResponse.json({
            success: true,
            suggestions: data.suggestions || [],
        });
    } catch (error: any) {
        console.error("City Suggestion Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
