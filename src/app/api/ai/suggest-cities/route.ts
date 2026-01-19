import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
    try {
        const { destination, purposes, details, currentCity, chinaDistance } = await request.json();

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

        let distancePrompt = '';
        if (destination === 'CN' && chinaDistance) {
            if (chinaDistance === 'near') {
                distancePrompt = `CRITICAL: The user wants cities CLOSE (Ойр) to the Mongolian border. MUST prioritize cities like Erlian (Эрлянь), Hohhot (Хөххот), or Baotou (Бугат). Avoid far-south cities.`;
            } else if (chinaDistance === 'mid') {
                distancePrompt = `CRITICAL: The user wants MID-DISTANCE (Дунд) cities. MUST prioritize cities like Beijing (Бээжин), Tianjin (Тяньжинь), Harbin (Харбин), or Xi'an (Сиань).`;
            } else if (chinaDistance === 'far') {
                distancePrompt = `CRITICAL: The user wants FAR-DISTANCE/SOUTH (Хол) cities. MUST prioritize cities like Guangzhou (Гуанжоу), Shanghai (Шанхай), Shenzhen (Шэньжэнь), Chengdu (Чэнду), or Sanya (Санья).`;
            }
        }

        const systemPrompt = `You are a travel expert specializing in ${countryName}. 
        Suggest the top 3-4 most suitable cities in ${countryName} for a trip with the following criteria:
        - Main Purposes: ${purposes}
        - User's Specific Needs/Details: ${details || 'N/A'}
        ${currentCity ? `- Starting from/Relative to: ${currentCity}` : ''}
        ${distancePrompt}

        CRITICAL LOGIC:
        1. If the user mentions "furniture" (тавилга), "market", or "wholesale" in the details for China (CN), MUST suggest Foshan or Guangzhou (even if distance is 'near', suggest them but mention they are far).
        2. If the user mentions specific medical procedures, suggest cities with top-tier specialized hospitals.
        3. Match the city to the details provided.
        4. DISTANCE: Provide approximate distance in km from Ulaanbaatar.

        Return a JSON object with a list of cities.
        
        Format:
        {
            "suggestions": [
                {
                    "name": "City Name",
                    "nameMn": "Хот",
                    "reason": "Why this city? (Keep it short, max 15 words)",
                    "distance": "approx distance from Ulaanbaatar (e.g. 50km or 1200km)"
                }
            ]
        }`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Suggest cities in ${destination} for ${purposes}. Details: ${details}. Distance Preference: ${chinaDistance || 'any'}` }
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
