import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import { getGroundingContext } from "@/lib/ai/itinerary-grounding";
import { countryInfoDatabase } from "@/data/country-info";
import { airalo } from "@/services/airalo";
import { getExchangeRates } from "@/lib/currency";
import { auth } from "@/lib/auth";
import { checkAILimit, incrementAIUsage } from "@/lib/ai-usage";
import { getOpenAIConfig } from "@/lib/ai-config";
import { getForecast } from "@/lib/weather";
import { getAmadeusFlightContext } from "@/lib/ai/amadeus-grounding";

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
  relaxation: "spa treatments, beach relaxation, quiet parks, and leisure time",
  adventure: "hiking, nature trails, outdoor sports, and thrill-seeking activities",
  family: "family-oriented activities, theme parks, and safe environments for children",
  romantic: "romantic dinners, scenic viewpoints, and intimate experiences for couples",
  culture: "museums, historical landmarks, art galleries, and cultural heritage sites",
  foodie: "local food tours, highly-rated restaurants, and culinary experiences",
  education: "educational institutions, workshops, and learning-focused activities",
  event: "festivals, concerts, exhibitions, and seasonal events",
  procurement: "wholesale markets, trade centers, factories, and logistics hubs for sourcing goods",
};

// Budget estimates per day
const budgetEstimates: Record<string, Record<string, string>> = {
  budget: { JP: "$80-120", KR: "$60-100", TH: "$40-70", CN: "$50-80", SG: "$80-120", US: "$100-150" },
  mid: { JP: "$150-250", KR: "$120-200", TH: "$80-150", CN: "$100-180", SG: "$150-250", US: "$200-300" },
  luxury: { JP: "$400+", KR: "$300+", TH: "$200+", CN: "$250+", SG: "$400+", US: "$500+" },
};

export async function POST(request: NextRequest) {
  let userId: string | undefined;

  try {
    const session = await auth();
    userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // 1. Check AI Limit
    const canUse = await checkAILimit(userId, "PLAN");
    if (!canUse) {
      return NextResponse.json(
        { success: false, error: "LIMIT_REACHED", message: "AI usage limit reached. Please upgrade to Premium." },
        { status: 403 }
      );
    }

    const {
      destination,
      duration,
      purposes,
      purposeDetails,
      budget,
      language,
      city,
      cityRoute,
      intlTransport,
      interCityTransport,
      innerCityTransport,
      selectedHotels,
      selectedActivities,
      travelers
    } = await request.json();

    if (!destination || !duration) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 2. GET DYNAMIC CONFIG
    const aiConfig = await getOpenAIConfig();
    if (!aiConfig.apiKey) {
      return NextResponse.json({
        success: false,
        error: "AI_NOT_CONFIGURED",
        message: "AI service is currently not configured. Please contact support or check Admin Panel."
      }, { status: 503 });
    }

    const openai = new OpenAI({ apiKey: aiConfig.apiKey });

    const travelersStr = travelers
      ? `${travelers.adults} adults${travelers.children > 0 ? `, ${travelers.children} children` : ''}`
      : 'single traveler';

    const countryName = countryNames[destination]?.[language === "mn" ? "mn" : "en"] || destination;

    // Handle multiple purposes
    const purposeList = (purposes || "").split(",").map((p: string) => p.trim());
    const purposeDescList = purposeList.map((p: string) => {
      let desc = purposeDescriptions[p] || p;
      const detail = purposeDetails?.[p];
      if (detail) desc += ` (Specific User Need: ${detail})`;
      return desc;
    });
    const purposeDesc = purposeDescList.length > 1
      ? `MULTIPLE PURPOSES - Include activities for ALL of the following: ${purposeDescList.join(", ")}`
      : purposeDescList[0] || purposeDescriptions.tourist;

    const dailyBudget = budgetEstimates[budget]?.[destination] || "$100-200";
    const isMongolian = language === "mn";

    // Get live grounding context for more accurate pricing/timing
    const groundingContext = getGroundingContext(destination, intlTransport, city);

    // Special logic for Mongolia -> China travel
    let transportLogic = "";
    let budgetInstruction = "";

    // Check for Erlian/Ereen specifically
    const isErlian = city?.toLowerCase().includes("erlian") || city?.toLowerCase().includes("эрээн");

    if (destination === "CN" || countryName.toLowerCase().includes("china") || countryName.toLowerCase().includes("хятад")) {
      if (isErlian) {
        budgetInstruction = "NOTE: User is going to ERLIAN (Border city). Costs are very low. International transport (Train/Bus) is cheap (~$50-$100). Do NOT use standard international flight costs.";
        if (intlTransport === "flight") {
          transportLogic = "User selected Flight, but Erlian is best reached by Train/Bus. Suggest flight to nearby airports (e.g. Hohhot) or mention that Train is better. Keep transport cost realistic for reaching Erlian (e.g. < $300).";
        } else {
          transportLogic = "User is traveling overland to Erlian. Transport cost is cheap (~$50).";
        }
      } else {
        // Standard China logic
        if (intlTransport === "flight") {
          transportLogic = "User is flying directly. Do NOT include Zamiin-Uud border crossing. Start Day 1 at the destination airport.";
        } else if (["train", "bus", "car"].includes(intlTransport || "")) {
          transportLogic = "User is traveling overland from Mongolia. You MUST include the Zamiin-Uud border crossing (Erlian) in the itinerary (usually Day 1).";
        }
      }
    }

    // --- Factual Visa Data for Mongolian citizens ---
    const countrySlugMap: Record<string, string> = {
      JP: "japan",
      KR: "south-korea",
      TH: "thailand",
      CN: "china",
    };
    const targetSlug = countrySlugMap[destination];
    const factualInfo = targetSlug ? countryInfoDatabase[targetSlug] : null;
    const visaData = factualInfo?.visaRequirement;

    const visaInstruction = visaData
      ? `You MUST state that for Mongolian citizens, the visa requirement is: ${visaData.type}. Details: ${visaData.details}. ${isMongolian ? `(In Mongolian: ${visaData.detailsMn})` : ""}`
      : "Provide general visa information for Mongolian citizens based on common knowledge (e.g. China is 30 days visa-free, Thailand is 30 days visa-free).";

    // --- Real eSIM Recommendations ---
    let esimContext = "";
    try {
      const airaloSlugMap: Record<string, string> = {
        JP: "japan",
        KR: "south-korea",
        TH: "thailand",
        CN: "china",
        SG: "singapore",
        US: "united-states",
      };
      const airaloSlug = airaloSlugMap[destination] || destination.toLowerCase();
      const resVal = await airalo.getCountryPackages(airaloSlug);
      const packages = resVal.data.slice(0, 3).map(pkg => ({
        id: pkg.package_id,
        name: pkg.title,
        data: pkg.data,
        validity: pkg.day,
        price: pkg.price
      }));

      if (packages.length > 0) {
        esimContext = `Here are the REAL GateSIM eSIM packages available for this trip: ${JSON.stringify(packages)}. Pick the most suitable one and explain why in the 'esimRecommendation' field.`;
      }
    } catch (e) {
      console.error("Airalo fetch failed for itinerary:", e);
    }

    // --- Dynamic Exchange Rates (Khan Bank Approx) ---
    const rates = await getExchangeRates();
    const localCurrencyMap: Record<string, string> = {
      JP: "JPY", KR: "KRW", TH: "THB", CN: "CNY", SG: "SGD", US: "USD"
    };
    const localCurrencyCode = localCurrencyMap[destination] || "USD";
    const localCurrencySymbol = factualInfo?.currencySymbol || "$";

    // --- Transport Cost Estimation (New) ---
    const { estimateTransportCost, estimateInterCityCost } = await import("@/services/transport/price-estimator");
    const intlCost = estimateTransportCost(intlTransport || 'flight', destination);
    const interCityCostDesc = estimateInterCityCost(destination);

    // --- Weather Context (New) ---
    let weatherContext = "";
    try {
      const citiesToFetch = cityRoute && Array.isArray(cityRoute) ? cityRoute.map((c: any) => c.name) : [city];
      const weatherData = await Promise.all(citiesToFetch.map(async (c: string) => {
        const forecast = await getForecast(c);
        return { city: c, forecast: forecast.slice(0, 3) }; // First 3 days
      }));
      weatherContext = `**LIVE WEATHER DATA (For Contextual Advice):**\n${JSON.stringify(weatherData)}`;
    } catch (e) {
      console.error("Weather fetch failed:", e);
    }

    // --- Amadeus Real-time Flight Context (New) ---
    let amadeusContext = "";
    if (intlTransport === "flight") {
      amadeusContext = await getAmadeusFlightContext(destination);
    }

    const pricingLogic = `
    **TRANSPORT PRICING (HARD CONSTRAINT):**
    - **International (${intlTransport}):** The estimated cost is **${intlCost.min} - ${intlCost.max} ${intlCost.currency}**. You MUST use a value within this range for the 'Departure from Ulaanbaatar' activity.
    - **Inter-City:** For travel between cities, use approximately **${interCityCostDesc}** per leg.
    `;

    const systemPrompt = `You are a professional travel planner creating detailed day-by-day itineraries for Mongolian travelers.
    
    ${purposeDescriptions[purposes] || purposes.includes('medical') || purposes.includes('business') || purposes.includes('education') ? `
    **SPECIAL PURPOSE RIGOR (ACCURACY MATTERS):**
    - This is a ${purposeDesc} trip. LOGISTICAL ACCURACY IS CRITICAL.
    - **Business:** Prioritize logistics, proximity to companies, work-friendly environments, and reliable transport.
    - **Medical:** Focus on hospital directions, pharmacy proximity, recovery/rest time between appointments, and ease of transport for patients.
    - **Education:** Include university/college visits, student life orientation, and campus-related logistics.
    ` : ''}

**TRIP PREFERENCES:**
- **Origin:** Ulaanbaatar, Mongolia (All trips start here)
- **Destination:** ${countryName}
- **Travelers:** ${travelersStr}
- **Duration:** ${duration} days
- **Purpose:** ${purposeDesc}
- **Budget Level:** ${budget} (${dailyBudget} daily expenses + International Transport). ${budgetInstruction}
- **Transport Modes (CRITICAL):**
  - **International:** ${intlTransport || 'Flight'} (UB to ${countryName})
  - **Inter-city:** ${interCityTransport || 'High-speed Train'} (Between cities)
  - **Inner-city:** ${innerCityTransport || 'Public Transport'} (Within cities)

**ACCURACY & FINANCIALS (FACTUAL):**
- Exchange Rates (Mongol Bank Official): 1 USD = ${rates.MNT} MNT, 1 USD = ${rates[localCurrencyCode as keyof typeof rates]} ${localCurrencyCode}
- **Budget Display (TRIPLE):** You MUST show all budget estimates (Total and per-day) in THREE currencies in this exact order: 
  1. Mongolian Tugrik (₮)
  2. ${countryName} Local Currency (${localCurrencySymbol})
  3. US Dollar ($)
  - Example "totalBudget": "10,350,000 ₮ / 4,140,000 ₩ / 3,000 $"
- ${visaInstruction}
- ${esimContext || 'Recommend a generic local eSIM if no specific packages found.'}

**USER SELECTIONS (PRIORITY):**
- **City Sequence & Duration:** ${cityRoute ? JSON.stringify(cityRoute) : city} (FOLLOW THIS EXACT SEQUENCE AND DAYS PER CITY).
- **Selected Hotels per City:** ${selectedHotels ? JSON.stringify(selectedHotels) : 'Any suitable 4-star hotels'} (MUST USE these exact hotels for the respective cities).
- **Selected Activities/Places:** ${selectedActivities ? JSON.stringify(selectedActivities) : 'AI suggestions'} (MUST incorporate these specific places into the itinerary).

${transportLogic}
${pricingLogic}

    ${groundingContext}
    ${weatherContext}
    ${amadeusContext}

**CRITICAL INSTRUCTIONS:**
1. **Multi-modal Logistics**: Plan the itinerary STRICTLY following the Transport Modes. 
   - If International is 'Train' or 'Bus' to China, Day 1 MUST include the border crossing (Zamiin-Uud/Erlian).
   - If Inter-city is 'High-speed Train', mention specific stations and durations between cities.
   - If Inner-city is 'Public Transport', prioritize proximity to subway/bus stations in activity descriptions.
2. **Multi-City Logic**: You MUST follow the sequence and number of days specified in "City Sequence & Duration". Plan movements between cities on the transition days.
3. **Accommodation**: Use the specific hotels provided. If a hotel name is "Өөрийн сонголт" or "My own choice", explicitly state that the traveler will arrange their own accommodation in that city.
4. **Origin & Transport**: Day 1 MUST start with "Departure from Ulaanbaatar". Include specific details based on the selected International transport.
6. **Weather Awareness**: Use the provided WEATHER DATA to give smart, contextual advice in the activity descriptions and 'tips' field. For example, if it's rainy, suggest indoor activities or remind them to bring an umbrella. Combine this with the travel purpose for a truly personalized experience.
7. **Language**: ${isMongolian ? "WRITE EVERYTHING IN MONGOLIAN." : "Write in English."}
    
**ACCURACY & GROUND TRUTH (CRITICAL):**
- YOU MUST prioritize the factual data provided in the "LIVE TRANSPORT DATA" and "VISA" sections above. 
- If the transport is "Train" to Beijing, mention it is the K24 train (if Thurs) or local 275/276.

**RESPONSE FORMAT (JSON):**
{
  "destination": "${destination}",
  "city": "${city || ''}",
  "duration": ${duration},
  "totalBudget": "MNT / LOCAL / USD (e.g. 890,000 ₮ / 250 $ ...)",
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
      model: aiConfig.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Create the itinerary now.` },
      ],
      max_tokens: 4000,
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content || "";

    // Parse JSON from response with higher resilience
    let itinerary;
    try {
      // 1. Try to find JSON in markdown code blocks first
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/);
      let jsonStr = jsonMatch ? jsonMatch[1].trim() : "";

      // 2. Fallback: Find anything that looks like a JSON object if no code block
      if (!jsonStr) {
        const startBracket = content.indexOf('{');
        const endBracket = content.lastIndexOf('}');
        if (startBracket !== -1 && endBracket !== -1) {
          jsonStr = content.substring(startBracket, endBracket + 1).trim();
        }
      }

      // 3. Last fallback: use raw content
      if (!jsonStr) jsonStr = content.trim();

      itinerary = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse itinerary JSON. Raw content:", content);
      console.error("Parse Error:", parseError);
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

    // 3. Increment usage (Safe background call)
    if (userId) {
      incrementAIUsage(userId, "PLAN").catch(e => console.error("Usage increment failed (itinerary):", e));
    }

    return NextResponse.json({
      success: true,
      itinerary,
    });

  } catch (error: any) {
    console.error("Itinerary generation error:", error);

    const errorMessage = error.message?.includes("API key")
      ? "AI configuration error. Admin must verify API key."
      : "Itinerary generation failed. Please try again.";

    return NextResponse.json(
      { success: false, error: "AI_ERROR", message: errorMessage },
      { status: 500 }
    );
  }
}
