import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
    try {
        const { destination, purposes, medicalDetail, businessDetail } = await request.json();

        if (!destination) {
            return NextResponse.json({ success: false, error: "Destination is required" }, { status: 400 });
        }

        const systemPrompt = `You are a travel expert specializing in ${destination}. 
        Suggest the top 3-4 most suitable cities in ${destination} for a trip with the following criteria:
        - Purposes: ${purposes}
        - Medical Details: ${medicalDetail || 'N/A'}
        - Business Details: ${businessDetail || 'N/A'}

        Return a JSON object with a list of cities. Each city should have a name (in English and Mongolian) and a short reason why it matches the criteria.
        
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
                { role: "user", content: `Suggest cities in ${destination} for ${purposes}. Details: ${medicalDetail} ${businessDetail}` }
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
