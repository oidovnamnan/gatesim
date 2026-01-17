import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Product category to city mapping
const categoryToCity: Record<string, string[]> = {
    shoes: ["Putian (莆田)", "Guangzhou (广州)"],
    electronics: ["Shenzhen (深圳)"],
    home: ["Yiwu (义乌)"],
    toys: ["Yiwu (义乌)", "Shantou (汕头)"],
};

// Trip duration by variant
const variantDuration: Record<string, number> = {
    quick: 4,
    standard: 6,
    full: 12,
};

export async function POST(request: NextRequest) {
    try {
        const { productCategory, tripVariant, budget, language } = await request.json();

        if (!productCategory || !tripVariant) {
            return NextResponse.json(
                { success: false, error: "Missing required fields" },
                { status: 400 }
            );
        }

        const cities = categoryToCity[productCategory] || ["Yiwu (义乌)"];
        const duration = variantDuration[tripVariant] || 6;
        const isMongolian = language === "mn";

        const systemPrompt = `You are a China wholesale business trip expert helping Mongolian buyers.
Create a ${duration}-day business trip itinerary for buying ${productCategory} from China.

Target cities: ${cities.join(", ")}
Budget for products: ${budget || "flexible"}

Response format MUST be valid JSON:
{
  "productCategory": "${productCategory}",
  "tripVariant": "${tripVariant}",
  "duration": ${duration},
  "totalBudget": "total trip cost estimate in USD",
  "days": [
    {
      "day": 1,
      "title": "${isMongolian ? "Өдрийн гарчиг" : "Day title"}",
      "activities": [
        {
          "time": "09:00",
          "activity": "${isMongolian ? "Үйл ажиллагаа" : "Activity"}",
          "location": "Market/Factory name and address",
          "type": "market|factory|transport|hotel|customs",
          "cost": "$XX",
          "contact": "Phone/WeChat if relevant"
        }
      ]
    }
  ],
  "markets": [
    {
      "name": "Market name in Chinese and English",
      "address": "Full address",
      "speciality": "What they sell",
      "tips": ["Tip 1", "Tip 2"]
    }
  ],
  "customsGuide": [
    "${isMongolian ? "Гаалийн зааварчилгаа" : "Customs guideline"}"
  ],
  "esimRecommendation": "${isMongolian ? "eSIM санал болголт - VPN-гүй Хятад багц" : "eSIM recommendation - No VPN China package"}"
}

${isMongolian ? "Бүх текстийг МОНГОЛ хэлээр бич." : "Write all text in English."}
Include:
- Airport transfers
- Hotel recommendations near markets
- Market operating hours
- How to negotiate prices
- Quality checking tips
- Shipping/logistics options
- Customs declaration requirements for Mongolia`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Create the business trip itinerary now.` },
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
            console.error("Failed to parse business itinerary JSON:", parseError);
            // Fallback itinerary
            itinerary = {
                productCategory,
                tripVariant,
                duration,
                totalBudget: "$1,500 - $2,500",
                days: [{
                    day: 1,
                    title: isMongolian ? "Ирэх өдөр" : "Arrival Day",
                    activities: [{
                        time: "14:00",
                        activity: isMongolian ? "Нисэх буудалд ирэх" : "Arrive at airport",
                        location: cities[0],
                        type: "transport",
                        cost: "$0"
                    }]
                }],
                markets: [{
                    name: cities[0],
                    address: "Main wholesale market",
                    speciality: productCategory,
                    tips: [isMongolian ? "Эрт очих" : "Go early"]
                }],
                customsGuide: [
                    isMongolian ? "Бараа тус бүрийн баримт авах" : "Get receipts for all items",
                    isMongolian ? "Гаалийн мэдүүлэг бөглөх" : "Fill customs declaration"
                ],
                esimRecommendation: isMongolian
                    ? `${duration} хоногийн Хятад багц авахыг санал болгож байна. VPN шаардлагагүй.`
                    : `We recommend getting a ${duration}-day China package. No VPN required.`
            };
        }

        return NextResponse.json({
            success: true,
            itinerary,
        });
    } catch (error) {
        console.error("Business trip generation error:", error);
        return NextResponse.json(
            { success: false, error: "Business trip generation failed" },
            { status: 500 }
        );
    }
}
