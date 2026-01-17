import { NextRequest, NextResponse } from "next/server";
import { airalo } from "@/services/airalo";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Recommendation scoring weights
const WEIGHTS = {
    POPULARITY: 0.25,      // Popular destinations
    SEASONALITY: 0.20,     // Season-appropriate
    VALUE: 0.20,           // Price/data ratio
    USER_HISTORY: 0.20,    // User's past purchases
    TRENDING: 0.15,        // Currently trending
};

// Country seasonality data (best months to visit)
const seasonalityMap: Record<string, number[]> = {
    JP: [3, 4, 10, 11],     // Japan: Spring (cherry blossom) & Fall
    KR: [4, 5, 9, 10],      // Korea: Spring & Fall
    TH: [11, 12, 1, 2],     // Thailand: Cool season
    CN: [4, 5, 9, 10],      // China: Spring & Fall
    SG: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], // Singapore: Year-round
    US: [5, 6, 7, 8, 9],    // USA: Summer
    AU: [12, 1, 2],         // Australia: Summer (Dec-Feb)
    EU: [5, 6, 7, 8, 9],    // Europe: Summer
};

// Popularity scores (based on user data)
const popularityScores: Record<string, number> = {
    JP: 95, KR: 90, CN: 85, TH: 80, SG: 75, US: 70, AU: 65, EU: 60,
};

// Travel purpose → country mapping
const purposeCountryMap: Record<string, string[]> = {
    tourist: ["JP", "KR", "TH", "SG", "US", "AU", "EU"],
    shopping: ["KR", "JP", "SG", "TH", "US"],
    wholesale: ["CN"],
    medical: ["KR", "TH", "TR", "IN"],
    student: ["KR", "JP", "US", "AU", "EU"],
    business: ["SG", "JP", "US", "EU", "CN"],
};

interface RecommendationRequest {
    purpose?: string;   // tourist, shopping, wholesale, medical, student, business
    duration?: number;  // days
    budget?: "low" | "medium" | "high";
    limit?: number;
}

// GET /api/ai/recommendations - Get AI-powered package recommendations
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const purpose = searchParams.get("purpose") || "tourist";
        const duration = parseInt(searchParams.get("duration") || "7");
        const budget = searchParams.get("budget") as "low" | "medium" | "high" || "medium";
        const limit = parseInt(searchParams.get("limit") || "6");

        // Get user's purchase history if authenticated (simplified)
        const session = await auth();
        let userHistory: string[] = [];
        let hasOrders = false;

        if (session?.user?.email) {
            // Simple check - just see if user exists
            // Full history tracking can be added later with proper schema
            const orderCount = await prisma.order.count({
                where: {
                    userEmail: session.user.email,
                    status: "PAID"
                }
            });
            hasOrders = orderCount > 0;
        }

        // Get recommended countries based on purpose
        const recommendedCountries = purposeCountryMap[purpose] || purposeCountryMap.tourist;

        // Score and rank countries
        const currentMonth = new Date().getMonth() + 1;
        const scoredCountries = recommendedCountries.map(countryCode => {
            let score = 0;

            // Popularity score
            score += (popularityScores[countryCode] || 50) / 100 * WEIGHTS.POPULARITY;

            // Seasonality score
            const bestMonths = seasonalityMap[countryCode] || [];
            if (bestMonths.includes(currentMonth)) {
                score += WEIGHTS.SEASONALITY;
            } else {
                score += WEIGHTS.SEASONALITY * 0.5; // Half score if not best season
            }

            // User history boost (recommend similar or new destinations)
            if (userHistory.includes(countryCode)) {
                score += WEIGHTS.USER_HISTORY * 0.3; // Small boost for repeat
            } else if (userHistory.length > 0) {
                score += WEIGHTS.USER_HISTORY * 0.7; // Larger boost for new destinations
            }

            // Trending boost (random for now, could be data-driven)
            score += Math.random() * WEIGHTS.TRENDING;

            return { countryCode, score };
        });

        // Sort by score and get top countries
        const topCountries = scoredCountries
            .sort((a, b) => b.score - a.score)
            .slice(0, Math.ceil(limit / 2));

        // Fetch packages for top countries
        const packagePromises = topCountries.map(async ({ countryCode, score }) => {
            try {
                const response = await airalo.getCountryPackages(countryCode);

                if (!response.data || response.data.length === 0) return [];

                // Filter and score packages
                return response.data
                    .filter(pkg => pkg.day >= duration - 2 && pkg.day <= duration + 5)
                    .map(pkg => {
                        // Value score (data per dollar)
                        const dataAmount = typeof pkg.amount === 'string' ? parseFloat(pkg.amount) : (pkg.amount || 0);
                        const valueScore = dataAmount / (pkg.net_price || 1);

                        // Budget filter
                        let budgetMatch = true;
                        if (budget === "low" && pkg.net_price > 15) budgetMatch = false;
                        if (budget === "high" && pkg.net_price < 10) budgetMatch = false;

                        return {
                            id: pkg.package_id,
                            slug: pkg.slug,
                            title: pkg.title,
                            data: pkg.data,
                            dataAmount: pkg.amount,
                            validityDays: pkg.day,
                            netPrice: pkg.net_price,
                            price: Math.round((pkg.net_price * 1.25) * 100) / 100,
                            operatorTitle: pkg.operator.title,
                            countries: pkg.countries,
                            countryCode,
                            aiScore: score + (valueScore / 100) * WEIGHTS.VALUE,
                            aiReason: getRecommendationReason(countryCode, purpose, currentMonth),
                            budgetMatch,
                        };
                    })
                    .filter(pkg => pkg.budgetMatch)
                    .sort((a, b) => b.aiScore - a.aiScore)
                    .slice(0, 2);
            } catch (error) {
                console.error(`Error fetching packages for ${countryCode}:`, error);
                return [];
            }
        });

        const allPackages = (await Promise.all(packagePromises)).flat();

        // Final sort by AI score and limit
        const recommendations = allPackages
            .sort((a, b) => b.aiScore - a.aiScore)
            .slice(0, limit);

        return NextResponse.json({
            success: true,
            recommendations,
            meta: {
                purpose,
                duration,
                budget,
                userHistoryLength: userHistory.length,
            }
        });
    } catch (error) {
        console.error("Error generating recommendations:", error);
        return NextResponse.json(
            { success: false, error: "Failed to generate recommendations" },
            { status: 500 }
        );
    }
}

// Generate human-readable recommendation reason
function getRecommendationReason(countryCode: string, purpose: string, month: number): string {
    const reasons: Record<string, Record<string, string>> = {
        JP: {
            tourist: "🌸 Япон - Аялал жуулчлалын шилдэг газар",
            shopping: "🛍️ Токиогийн шоппинг",
            default: "🇯🇵 Япон - Таны хүсэлтэнд тохирно",
        },
        KR: {
            tourist: "🎌 Солонгос - K-culture дурлагсдад",
            shopping: "🛒 Myeongdong шоппинг",
            medical: "🏥 Гоо сайхны мэс засал",
            default: "🇰🇷 Солонгос - Trend сонголт",
        },
        TH: {
            tourist: "🏖️ Тайланд - Арал, далай",
            medical: "🦷 Шүдний эмчилгээ",
            default: "🇹🇭 Тайланд - Халуун аялал",
        },
        CN: {
            wholesale: "📦 Хятад - Бөөний худалдаа",
            business: "💼 Бизнес уулзалт",
            default: "🇨🇳 Хятад - VPN-гүй интернет",
        },
    };

    const countryReasons = reasons[countryCode] || {};
    return countryReasons[purpose] || countryReasons.default || "✨ AI санал болгож байна";
}
