import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getGroundingContext } from "@/lib/ai/itinerary-grounding";

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
    const {
      destination,
      duration,
      purposes,
      medicalDetail,
      businessDetail,
      budget,
      language,
      city,
      transportMode,
      selectedHotel,
      selectedActivities
    } = await request.json();

    if (!destination || !duration) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const countryName = countryNames[destination]?.[language === "mn" ? "mn" : "en"] || destination;

    // Handle multiple purposes
    const purposeList = (purposes || "").split(",").map((p: string) => p.trim());
    const purposeDescList = purposeList.map((p: string) => {
      let desc = purposeDescriptions[p] || p;
      if (p === 'medical' && medicalDetail) desc += ` (${medicalDetail})`;
      if (p === 'business' && businessDetail) desc += ` (${businessDetail})`;
      return desc;
    });
    const purposeDesc = purposeDescList.length > 1
      ? `MULTIPLE PURPOSES - Include activities for ALL of the following: ${purposeDescList.join(", ")}`
      : purposeDescList[0] || purposeDescriptions.tourist;

    const dailyBudget = budgetEstimates[budget]?.[destination] || "$100-200";
    const isMongolian = language === "mn";

    // Get live grounding context for more accurate pricing/timing
    const groundingContext = getGroundingContext(destination, transportMode, city);

    // Special logic for Mongolia -> China travel
    let transportLogic = "";
    let budgetInstruction = "";

    // Check for Erlian/Ereen specifically
    const isErlian = city?.toLowerCase().includes("erlian") || city?.toLowerCase().includes("эрээн");

    if (destination === "CN" || countryName.toLowerCase().includes("china") || countryName.toLowerCase().includes("хятад")) {
      if (isErlian) {
        budgetInstruction = "NOTE: User is going to ERLIAN (Border city). Costs are very low. International transport (Train/Bus) is cheap (~$50-$100). Do NOT use standard international flight costs.";
        if (transportMode === "flight") {
          transportLogic = "User selected Flight, but Erlian is best reached by Train/Bus. Suggest flight to nearby airports (e.g. Hohhot) or mention that Train is better. Keep transport cost realistic for reaching Erlian (e.g. < $300).";
        } else {
          transportLogic = "User is traveling overland to Erlian. Transport cost is cheap (~$50).";
        }
      } else {
        // Standard China logic
        if (transportMode === "flight") {
          transportLogic = "User is flying directly. Do NOT include Zamiin-Uud border crossing. Start Day 1 at the destination airport.";
        } else if (["train", "bus", "car"].includes(transportMode)) {
          transportLogic = "User is traveling overland from Mongolia. You MUST include the Zamiin-Uud border crossing (Erlian) in the itinerary (usually Day 1).";
        }
      }
    }

    const systemPrompt = `You are a professional travel planner creating detailed day-by-day itineraries for Mongolian travelers.
    
    ${purposeDescriptions[purposes] || purposes.includes('medical') || purposes.includes('business') || purposes.includes('education') ? `
    **SPECIAL PURPOSE RIGOR (ACCURACY MATTERS):**
    - This is a ${purposeDesc} trip. LOGISTICAL ACCURACY IS CRITICAL.
    - **Business:** Prioritize logistics, proximity to companies, work-friendly environments, and reliable transport.
    - **Medical:** Focus on hospital directions, pharmacy proximity, recovery/rest time between appointments, and ease of transport for patients.
    - **Education:** Include university/college visits, student life orientation, and campus-related logistics.
    ` : ''}

**USER SELECTIONS (PRIORITY):**
- **Selected Hotel:** ${selectedHotel || 'Any suitable 4-star hotel'} (MUST BE USED as the primary accommodation).
- **Selected Activities/Places:** ${selectedActivities || 'AI suggestions'} (MUST incorporate these specific places into the itinerary).

**TRIP PREFERENCES:**
- **Origin:** Ulaanbaatar, Mongolia (All trips start here)
- **Destination:** ${countryName}${city ? ` (specifically: ${city})` : ''}
- **Duration:** ${duration} days
- **Purpose:** ${purposeDesc}
- **Budget Level:** ${budget} (${dailyBudget} daily expenses + International Transport). ${budgetInstruction}
- **Transport Mode:** ${transportMode || 'Flight'}

${transportLogic}

${groundingContext}

**CRITICAL INSTRUCTIONS:**
1. **Multi-City Logic**: If multiple cities are listed in the destination (${city}), you MUST plan movements between them (trains/flights) and allocate days reasonably to cover all of them.
2. **Origin & Transport**: Day 1 MUST start with "Departure from Ulaanbaatar". Include specific flight/train details to the destination.
3. **Total Budget**: MUST be calculated in BOTH destination currency (e.g., USD/KRW/JPY) AND Mongolian Tugrik (MNT).
   - Format: "3000 USD / 10,500,000 MNT" (Use accurate current exchange rates).
   - This Total Budget MUST INCLUDE the international transport cost (Round trip ticket) + Accommodation + Daily expenses.
4. **Accuracy for Professionals**: For Business/Medical/Education, include REAL-WORLD names of facilities mentioned in the ${purposeDesc} description.
5. **Language**: ${isMongolian ? "WRITE EVERYTHING IN MONGOLIAN." : "Write in English."}

**RESPONSE FORMAT (JSON):**
{
  "destination": "${destination}",
  "city": "${city || ''}",
  "duration": ${duration},
  "totalBudget": "ESTIMATED TOTAL (e.g. 250 USD / 890,000 MNT)",
  "visaRequirement": {
    "needed": true/false,
    "type": "e.g. Visa-free, E-visa, or Sticker Visa",
    "details": "Brief explanation for Mongolian citizens"
  },
  "days": [
    {
      "day": 1,
      "title": "${isMongolian ? "Улаанбаатараас хөдлөх" : "Departure from Ulaanbaatar"}",
      "activities": [
        {
          "time": "07:00",
          "activity": "${isMongolian ? "Улаанбаатараас нисэх/хөдлөх" : "Depart from Ulaanbaatar"}",
          "location": "Chinggis Khaan Intl Airport / Railway Station",
          "coordinates": { "lat": 47.9, "lng": 106.9 },
          "type": "transport",
          "cost": "International Ticket Cost (e.g. $800)"
        }
      ]
    }
  ],
  "tips": ["Tip 1"],
  "esimRecommendation": "Best eSIM for this trip",
  "packingList": [
    { "category": "Category", "items": ["Item"] }
  ],
  "budgetBreakdown": [
    { "category": "Intl Transport", "amount": 800, "currency": "USD", "percentage": 30 },
    { "category": "Accommodation", "amount": 1000, "currency": "USD", "percentage": 40 }
  ]
}

Include 4-6 activities per day. Be specific with locations and costs.`;

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
