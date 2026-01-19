import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
    try {
        const { destination, purposes, details } = await request.json();

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

        CRITICAL LOGIC:
        1. If the user mentions "furniture" (тавилга), "market", or "wholesale" in the details for China (CN), MUST suggest Foshan or Guangzhou.
        2. If the user mentions specific medical procedures, suggest cities with top-tier specialized hospitals (e.g., Seoul for Plastic Surgery/Health Screening, Bangkok for General Medical).
        3. Match the city to the details provided. If details contradict the purpose (e.g., Medical purpose but detail is about shopping), prioritize the DETAIL over the high-level category name, but mention why in the reason.

        Return a JSON object with a list of cities. Each city should have a name (in English and Mongolian) and a short reason why it matches the specific needs.
        
        Format:
        {
            "suggestions": [
                {
                    "name": "City Name",
                    "nameMn": "Хот",
                    "reason": "Why this city? (Keep it short, max 15 words)"
                }
            ]
        }`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Suggest cities in ${destination} for ${purposes}. Details: ${details}` }
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
