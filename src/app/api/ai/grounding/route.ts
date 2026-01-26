import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getVerifiedDiscovery } from "@/lib/ai/discovery-grounding";
import { getHotelsInCity, getPointsOfInterest, getToursAndActivities, getCityDetails } from "@/lib/amadeus";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
    try {
        const { destination, city, purposes, budget, type, filters, purposeDetails, travelers } = await request.json();

        const travelersStr = travelers
            ? `${travelers.adults} adults${travelers.children > 0 ? `, ${travelers.children} children` : ''}`
            : 'single traveler';

        if (!destination || !type) {
            return NextResponse.json(
                { success: false, error: "Missing required fields" },
                { status: 400 }
            );
        }

        const detailPrompt = purposeDetails?.[purposes]
            ? `Specific interest for this category: ${purposeDetails[purposes]}`
            : "";

        const itemCount = type === 'hotel' ? 5 : 10;

        const systemPrompt = `You are an expert travel researcher and data provider. 
        Your task is to provide exactly ${itemCount} high-quality, REAL-WORLD suggestions for ${type} in ${city || destination}.
        
        Travelers: ${travelersStr}
        Trip Purpose: ${purposes}
        ${detailPrompt}
        Budget Level: ${budget}
        
        CRITICAL LOGIC:
        1. If "hotel": Find ${budget}-appropriate hotels. If children are traveling (${travelers.children} children), prioritize hotels with family rooms or suitable room configurations.
        2. If "shopping" and purpose is "procurement": Find wholesale markets, trade centers, and industrial hubs.
        3. If children are traveling: Prioritize activities and places that are family-friendly and safe for kids.
        4. IMAGE CRITERIA: For each option, find a high-quality professional ARCHITECTURAL or EXTERIOR photo from Unsplash. 
           E.g., https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800
           CRITICAL: NEVER include images of people, food (unless Dining), or internal rooms (unless specified).
        5. Provide highly detailed descriptions (2-3 sentences) explaining WHY this fits the purpose for ${travelersStr}.

        Return ONLY a JSON object with this structure:
        {
          "options": [
            {
              "id": "unique-slug",
              "name": "Official Name",
              "description": "Justification for ${travelersStr}",
              "rating": 4.5,
              "price": "$120",
              "imageUrl": "https://images.unsplash.com/... (MUST BE EXTERIOR/ARCHITECTURAL)",
              "location": "District/Area",
              "distanceFromAirport": "X km from Airport",
              "bookingUrl": "Direct Search/Booking link"
            }
          ]
        }`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Find ${itemCount} ${type}s in ${city || destination} for ${purposes}. Travelers: ${travelersStr}.` }
            ],
            response_format: { type: "json_object" },
        });

        const data = JSON.parse(response.choices[0].message.content || "{}");
        const aiOptions = data.options || [];

        // --- Verified Grounding Overlay ---
        // If we have verified data for this city and type, inject it at the top
        const verifiedOptions = getVerifiedDiscovery(destination, city || "", type);

        // --- Amadeus Grounding Overlay (New) ---
        const amadeusOptions: any[] = [];

        // Resolve city name to IATA or English for Amadeus
        let resolvedCity = city;
        if (city) {
            const cityDetails = await getCityDetails(city);
            if (cityDetails?.iataCode) {
                resolvedCity = cityDetails.iataCode;
            } else if (cityDetails?.address?.cityName) {
                resolvedCity = cityDetails.address.cityName;
            }
        }

        if (resolvedCity) {
            try {
                if (type === 'hotel') {
                    // Try by resolved city code first
                    let amadeusHotels = await getHotelsInCity(resolvedCity);

                    if (amadeusHotels && amadeusHotels.length > 0) {
                        amadeusOptions.push(...amadeusHotels.slice(0, 3).map((h: any) => ({
                            id: h.hotelId,
                            name: h.name,
                            description: `Real-time availability confirmed via Amadeus. Star rating: ${h.rating || 'N/A'}.`,
                            rating: h.rating ? parseFloat(h.rating) : 4.0,
                            price: "Live Price available",
                            imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800",
                            location: h.iataCode || city,
                            isLive: true,
                            bookingUrl: `https://www.google.com/search?q=hotel+${encodeURIComponent(h.name)}+${encodeURIComponent(city || '')}`
                        })));
                    }
                } else if (type === 'attraction' || type === 'tourist') {
                    const cityDetails = await getCityDetails(city || destination);
                    if (cityDetails?.geoCode) {
                        const pois = await getPointsOfInterest(cityDetails.geoCode.latitude, cityDetails.geoCode.longitude);
                        if (pois && pois.length > 0) {
                            amadeusOptions.push(...pois.slice(0, 3).map((p: any) => ({
                                id: `poi-${p.id}`,
                                name: p.name,
                                description: `Popular local attraction (${p.category}). Recommended by real traveler data.`,
                                rating: 4.8,
                                price: "Entry Fee Varies",
                                imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=800",
                                location: city || destination,
                                isLive: true
                            })));
                        }
                    }
                }
            } catch (e) {
                console.error("Amadeus enrichment failed for grounding:", e);
            }
        }

        // Combine: Verified first, then Amadeus, then AI suggestions (removing duplicates by name)
        const combinedOptions = [...verifiedOptions, ...amadeusOptions];
        aiOptions.forEach((aiOpt: any) => {
            if (!combinedOptions.some(v => v.name.toLowerCase() === aiOpt.name.toLowerCase())) {
                combinedOptions.push(aiOpt);
            }
        });

        return NextResponse.json({
            success: true,
            options: combinedOptions.map(opt => ({
                ...opt,
                imageUrl: opt.imageUrl || opt.image // Ensure consistency
            })).slice(0, itemCount),
        });
    } catch (error: any) {
        console.error("Grounding Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
