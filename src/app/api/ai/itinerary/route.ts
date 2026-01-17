import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Country names
const countryNames: Record<string, { en: string; mn: string }> = {
    JP: { en: "Japan", mn: "Япон" },
    KR: { en: "South Korea", mn: "Солонгос" },
    TH: { en: "Thailand", mn: "Тайланд" },
    CN: { en: "China", mn: "Хятад" },
    SG: { en: "Singapore", mn: "Сингапур" },
    US: { en: "USA", mn: "Америк" },
};

// Purpose descriptions
const purposeDescriptions: Record<string, string> = {
    tourist: "sightseeing, cultural experiences, and popular attractions",
    shopping: "shopping districts, malls, and local markets",
    business: "business meetings, networking events, and work-related activities",
    medical: "medical appointments, hospitals, and recovery time",
};

// Budget estimates per day
const budgetEstimates: Record<string, Record<string, string>> = {
    budget: { JP: "$80-120", KR: "$60-100", TH: "$40-70", CN: "$50-80", SG: "$80-120", US: "$100-150" },
    mid: { JP: "$150-250", KR: "$120-200", TH: "$80-150", CN: "$100-180", SG: "$150-250", US: "$200-300" },
    luxury: { JP: "$400+", KR: "$300+", TH: "$200+", CN: "$250+", SG: "$400+", US: "$500+" },
};

export async function POST(request: NextRequest) {
    try {
        const { destination, duration, purpose, budget, language } = await request.json();

        if (!destination || !duration) {
            return NextResponse.json(
                { success: false, error: "Missing required fields" },
                { status: 400 }
            );
        }

        const countryName = countryNames[destination]?.[language === "mn" ? "mn" : "en"] || destination;
        const purposeDesc = purposeDescriptions[purpose] || purposeDescriptions.tourist;
        const dailyBudget = budgetEstimates[budget]?.[destination] || "$100-200";
        const isMongolian = language === "mn";

        const systemPrompt = `You are a professional travel planner creating detailed day-by-day itineraries.
Create a ${duration}-day itinerary for ${countryName} focused on ${purposeDesc}.
Budget level: ${budget} (${dailyBudget} per day)

Response format MUST be valid JSON:
{
  "destination": "${destination}",
  "duration": ${duration},
  "totalBudget": "estimated total in USD",
  "days": [
    {
      "day": 1,
      "title": "${isMongolian ? "Өдрийн гарчиг" : "Day title in local context"}",
      "activities": [
        {
          "time": "09:00",
          "activity": "${isMongolian ? "Үйл ажиллагааны тайлбар" : "Activity description"}",
          "location": "Specific place name",
          "type": "food|attraction|transport|hotel|shopping",
          "cost": "$XX"
        }
      ]
    }
  ],
  "tips": ["${isMongolian ? "Зөвлөмж" : "Helpful tip"}"],
  "esimRecommendation": "${isMongolian ? "eSIM санал болголт" : "eSIM recommendation for this trip"}"
}

${isMongolian ? "Бүх текстийг МОНГОЛ хэлээр бич." : "Write all text in English."}
Include 4-6 activities per day. Be specific with locations and times.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Create the itinerary now.` },
            ],
            max_tokens: 4000,
            temperature: 0.7,
        });

        const content = completion.choices[0]?.message?.content || "";

        // Parse JSON from response
        let itinerary;
        try {
            // Extract JSON from potential markdown code blocks
            const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
            const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
            itinerary = JSON.parse(jsonStr);
        } catch (parseError) {
            console.error("Failed to parse itinerary JSON:", parseError);
            // Return a simple fallback itinerary
            itinerary = {
                destination,
                duration,
                totalBudget: `$${duration * 150}`,
                days: [{
                    day: 1,
                    title: isMongolian ? "Ирэх өдөр" : "Arrival Day",
                    activities: [{
                        time: "14:00",
                        activity: isMongolian ? "Нисэх буудалд ирэх" : "Arrive at airport",
                        location: "International Airport",
                        type: "transport",
                        cost: "$0"
                    }]
                }],
                tips: [isMongolian ? "GateSIM eSIM ашиглана уу" : "Use GateSIM eSIM for connectivity"],
                esimRecommendation: isMongolian
                    ? `${duration} хоногийн ${countryName} багц авахыг санал болгож байна`
                    : `We recommend getting a ${duration}-day ${countryName} package`
            };
        }

        return NextResponse.json({
            success: true,
            itinerary,
        });
    } catch (error) {
        console.error("Itinerary generation error:", error);
        return NextResponse.json(
            { success: false, error: "Itinerary generation failed" },
            { status: 500 }
        );
    }
}
