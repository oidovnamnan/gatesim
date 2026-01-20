import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
    try {
        const { destination, purposes, details, currentCity, chinaDistance, travelers, intlTransport } = await request.json();

        if (!destination) {
            return NextResponse.json({ success: false, error: "Destination is required" }, { status: 400 });
        }

        const travelersStr = travelers
            ? `${travelers.adults} adults${travelers.children > 0 ? `, ${travelers.children} children` : ''}`
            : 'single traveler';

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
            const distances = Array.isArray(chinaDistance) ? chinaDistance : [chinaDistance];
            const prompts: string[] = [];

            if (distances.includes('near')) {
                prompts.push("CLOSE (Ойр) to the Mongolian border (e.g. Erlian, Hohhot, Baotou)");
            }
            if (distances.includes('mid')) {
                prompts.push("MID-DISTANCE (Дунд) cities (e.g. Beijing, Tianjin, Harbin, Xi'an)");
            }
            if (distances.includes('far')) {
                prompts.push("FAR-DISTANCE/SOUTH (Хол) cities (e.g. Guangzhou, Shanghai, Shenzhen, Chengdu, Sanya)");
            }

            if (prompts.length > 0) {
                distancePrompt = `CRITICAL: The user is interested in cities in the following distance ranges from the Mongolian border: ${prompts.join(", ")}. Please provide a balanced mix of suggestions if multiple ranges are selected.`;
            }
        }

        const systemPrompt = `You are a travel expert specializing in ${countryName}. 
        Suggest the top 3-4 most suitable cities in ${countryName} for a trip with the following criteria:
        - Travelers: ${travelersStr}
        - Main Purposes: ${purposes}
        - User's Specific Needs/Details: ${details || 'N/A'}
        ${currentCity ? `- Starting from/Relative to: ${currentCity}` : ''}
        - Preferred International Transport: ${intlTransport || 'Flight'} (from Mongolia)
        ${distancePrompt}

        CRITICAL LOGIC:
        1. If the user mentions "furniture" (тавилга), "market", or "wholesale" in the details for China (CN), MUST suggest Foshan or Guangzhou (even if distance is 'near', suggest them but mention they are far).
        2. If children are traveling, prioritize family-friendly cities with safe infrastructure and parks.
        3. LOGISTICS (CRITICAL): If transport is 'Train' or 'Bus', prioritize cities reachable by land, especially for China (e.g. northern hubs).
        4. Match the city to the details provided.
        5. DISTANCE: Provide approximate distance in km from Ulaanbaatar.

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
                { role: "user", content: `Suggest cities in ${destination} for ${purposes}. Details: ${details}. Travelers: ${travelersStr}. Distance Preference: ${chinaDistance || 'any'}` }
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
