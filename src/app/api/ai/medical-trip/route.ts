import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { auth } from "@/lib/auth";
import { checkAILimit, incrementAIUsage } from "@/lib/ai-usage";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Treatment to duration mapping
const treatmentDuration: Record<string, number> = {
    cosmetic: 10,
    dental: 7,
    orthopedic: 14,
    cardiac: 21,
    vision: 5,
};

// Country to specialty mapping
const countrySpecialty: Record<string, string[]> = {
    KR: ["cosmetic", "dental", "vision"],
    TH: ["dental", "cosmetic", "vision"],
    TR: ["dental", "cosmetic"],
    IN: ["cardiac", "orthopedic", "vision"],
};

export async function POST(request: NextRequest) {
    try {
        const { treatment, destination, additionalInfo, language } = await request.json();

        if (!treatment || !destination) {
            return NextResponse.json(
                { success: false, error: "Missing required fields" },
                { status: 400 }
            );
        }

        const session = await auth();
        const userId = session?.user?.id;

        if (!userId) {
            return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
        }

        // 1. Check AI Limit
        const canUse = await checkAILimit(userId, "MEDICAL");
        if (!canUse) {
            return NextResponse.json({
                success: false,
                error: "LIMIT_REACHED",
                message: "Medical Assistant limit reached. Please upgrade to Premium."
            }, { status: 403 });
        }

        const duration = treatmentDuration[treatment] || 7;
        const isMongolian = language === "mn";

        const systemPrompt = `You are a medical tourism expert helping patients plan their treatment abroad.
Create a ${duration}-day medical trip itinerary for ${treatment} treatment in ${destination}.

Treatment: ${treatment}
Country: ${destination}
Additional info: ${additionalInfo || "none"}

Response format MUST be valid JSON:
{
  "treatment": "${treatment}",
  "destination": "${destination}",
  "duration": ${duration},
  "totalCost": "estimated total cost in USD",
  "preTripChecklist": [
    "${isMongolian ? "Эмчийн шинжилгээ авах" : "Get medical tests"}"
  ],
  "days": [
    {
      "day": 1,
      "title": "${isMongolian ? "Өдрийн гарчиг" : "Day title"}",
      "activities": [
        {
          "time": "09:00",
          "activity": "${isMongolian ? "Үйл ажиллагаа" : "Activity"}",
          "location": "Hospital/Clinic name",
          "type": "consultation|procedure|recovery|sightseeing|transport",
          "cost": "$XX",
          "contact": "Phone if relevant"
        }
      ]
    }
  ],
  "recovery": {
    "duration": "${isMongolian ? "X долоо хоног" : "X weeks"}",
    "tips": ["${isMongolian ? "Зөвлөмж" : "Recovery tip"}"]
  },
  "hospitalInfo": {
    "name": "Hospital name",
    "address": "Full address",
    "speciality": "What they specialize in",
    "accreditation": "JCI Accredited",
    "contact": "Phone/WhatsApp"
  },
  "esimRecommendation": "${isMongolian ? "eSIM санал болголт - 24/7 холбоо барих" : "eSIM recommendation - 24/7 connectivity"}"
}

${isMongolian ? "Бүх текстийг МОНГОЛ хэлээр бич." : "Write all text in English."}
Include:
- Pre-surgery consultation
- Actual procedure day
- Post-operative care
- Follow-up appointments
- Recovery time activities
- When to fly home
- What to pack`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Create the medical trip itinerary now.` },
            ],
            max_tokens: 4000,
            temperature: 0.7,
        });

        const content = completion.choices[0]?.message?.content || "";

        let itinerary;
        try {
            const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
            const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
            itinerary = JSON.parse(jsonStr);
        } catch (parseError) {
            console.error("Failed to parse medical itinerary JSON:", parseError);
            // Fallback itinerary
            itinerary = {
                treatment,
                destination,
                duration,
                totalCost: "$3,000 - $5,000",
                preTripChecklist: [
                    isMongolian ? "Эмчийн шинжилгээ авах" : "Get medical tests",
                    isMongolian ? "Даатгалын баримт бичиг" : "Insurance documents"
                ],
                days: [{
                    day: 1,
                    title: isMongolian ? "Ирэх, зөвлөгөө" : "Arrival & Consultation",
                    activities: [{
                        time: "14:00",
                        activity: isMongolian ? "Нисэх буудалд ирэх" : "Arrive at airport",
                        location: "International Airport",
                        type: "transport",
                        cost: "$0"
                    }]
                }],
                recovery: {
                    duration: isMongolian ? "1-2 долоо хоног" : "1-2 weeks",
                    tips: [isMongolian ? "Их амрах" : "Rest well"]
                },
                hospitalInfo: {
                    name: "International Hospital",
                    address: "City Center",
                    speciality: treatment,
                    accreditation: "JCI Accredited",
                    contact: "+82-XXX-XXXX"
                },
                esimRecommendation: isMongolian
                    ? `${duration} хоногийн багц авахыг санал болгож байна. Эмнэлэгтэй 24/7 холбоо барих.`
                    : `We recommend getting a ${duration}-day package. Stay connected with hospital 24/7.`
            };
        }

        return NextResponse.json({
            success: true,
            itinerary,
        });
    } finally {
        const session = await auth();
        if (session?.user?.id) {
            await incrementAIUsage(session.user.id, "MEDICAL");
        }
    }
}
