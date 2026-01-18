import { OpenAI } from "openai";
import { findContextData, generateLocalResponse } from "@/lib/local-ai";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserTravelContext } from "@/lib/ai-server-context";

// Rate limiting for guests
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_MESSAGES_PER_MINUTE = 10;
const SPAM_THRESHOLD_REPEATED = 3; // Block if same message sent 3 times

interface RateLimitData {
    count: number;
    resetTime: number;
    lastMessage?: string;
    repeatCount: number;
    isBlocked: boolean;
}

const rateLimitMap = new Map<string, RateLimitData>();

const MODE_PROMPTS: Record<string, string> = {
    tourist: "You are a helpful tourist guide. Focus on sightseeing, culture, and fun. Suggest popular spots.",
    business: "You are a business travel assistant. Focus on efficiency, wifi spots, taxi receipts, and quick transport.",
    medical: "You are a medical travel assistant. PRIORITIZE health and safety. Help find hospitals, pharmacies, and translating symptoms. Be serious and concise.",
    student: "You are a student guide. Focus on budget tips, campus life, libraries, cheap eats, and student discounts.",
    shopping: "You are a shopping assistant. Focus on VAT refunds, malls, opening hours, and sales.",
    transit: "You are a transit guide. You MUST help users get from A to B. ALWAYS use [TRANSIT_ROUTE: to=Dest, mode=transit] for directions.",
    default: "You are an elite Travel Assistant."
};

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { messages, country, apiKey, language = "mn", mode = "tourist", tripContext } = body;
        const session = await auth();

        if (!messages || messages.length === 0) {
            return Response.json({ error: "No messages provided" }, { status: 400 });
        }

        const lastMessage = messages[messages.length - 1];
        const userQuery = lastMessage.content;
        const requestHeaders = await headers();
        const ip = requestHeaders.get("x-forwarded-for") || "unknown";

        // ============ 1. RATE LIMITING (GUESTS) ============
        if (!session?.user?.email) {
            const now = Date.now();
            let limitData = rateLimitMap.get(ip);

            if (!limitData || now > limitData.resetTime) {
                limitData = { count: 0, resetTime: now + RATE_LIMIT_WINDOW, repeatCount: 0, isBlocked: false };
            }

            if (limitData.isBlocked) {
                const blockedMsg = language === "en" ? "Your chat access is temporarily blocked." : "Таны чатлах эрх түр хаагдсан байна.";
                return Response.json({ role: "assistant", content: blockedMsg });
            }

            // Check repetition
            if (limitData.lastMessage === userQuery) {
                limitData.repeatCount++;
            } else {
                limitData.repeatCount = 0;
            }
            limitData.lastMessage = userQuery;

            // Block triggers
            if (limitData.count > MAX_MESSAGES_PER_MINUTE || limitData.repeatCount >= SPAM_THRESHOLD_REPEATED) {
                limitData.isBlocked = true;
                rateLimitMap.set(ip, limitData);
                const blockedMsg = language === "en" ? "Blocked for spam." : "Спам илэрсэн тул түр хаагдлаа.";
                return Response.json({ role: "assistant", content: blockedMsg });
            }

            limitData.count++;
            rateLimitMap.set(ip, limitData);
        }

        // ============ 2. FETCH USER CONTEXT (NEW) ============
        const travelContext = await getUserTravelContext();

        // ============ 3. CONSTRUCT SYSTEM PROMPT ============
        const languageInstruction = language === "en" ? "English" : language === "cn" ? "Chinese (Simplified)" : "Mongolian (Cyrillic)";
        const modeInstruction = MODE_PROMPTS[mode] || MODE_PROMPTS.default;

        let scopeInstruction = "";
        if (travelContext.hasActiveOrder) {
            scopeInstruction = `User HAS an active plan (${travelContext.activePlan?.provider} - ${travelContext.activePlan?.dataTotal}). You can discuss advanced travel topics, locations, and advice freely.`;
        } else {
            scopeInstruction = `User does NOT have an active plan. Your primary goal is to help them buy an eSIM. If they ask generic questions, answer briefly but remind them they need internet to travel.`;
        }

        // Check for tripContext (Local Plan)
        let localPlanContext = "";

        if (tripContext && mode === 'transit') {
            try {
                const plan = JSON.parse(tripContext);
                const isMedical = plan.type === "medical";
                const locations = isMedical
                    ? [plan.data.hospitalInfo?.name].filter(Boolean)
                    : plan.data.days?.[0]?.activities?.map((a: any) => a.location).slice(0, 3);

                localPlanContext = `
USER'S ITINERARY CONTEXT:
- Destination: ${plan.destination}
- Type: ${plan.type}
- Key Locations: ${locations.join(", ")}
- Goal: You MUST provide specific routes to these locations if asked. Assume "getting there" means getting to one of these spots from their hotel (generic).
`;
            } catch (e) {
                console.error("Failed to parse tripContext in API", e);
            }
        }

        // Context Injection
        let contextBlock = "";
        if (travelContext.activePlan) {
            contextBlock = `
USER CONTEXT:
- Active Trip Country: ${travelContext.activePlan.country}
- Data Plan: ${travelContext.activePlan.provider} (${travelContext.activePlan.dataTotal})
- Days Remaining: ${travelContext.activePlan.daysRemaining}
- Mode: ${mode.toUpperCase()}
`;
        } else {
            contextBlock = `
USER CONTEXT:
- No active plan found.
- Mode: ${mode.toUpperCase()}
`;
        }

        contextBlock += localPlanContext;

        const systemPrompt = `You are GateSIM AI.
${modeInstruction}
You strictly answer in ${languageInstruction}.
${scopeInstruction}

${contextBlock}

INTERACTION GUIDELINES:
1. Extremely polite and friendly.
2. If the user has an active plan for a specific country (e.g. Japan), assume their questions are about that country unless specified otherwise.
3. If the user asks for package recommendations, output "[SEARCH_PACKAGES: country=CODE, minDays=N]" command.
4. If the user asks for DIRECTIONS, HOW TO GET SOMEWHERE, or "Яаж очих вэ", "Хаана байдаг вэ", output "[TRANSIT_ROUTE: to=DESTINATION_NAME, mode=transit]" command. 
   - Example directly: "[TRANSIT_ROUTE: to=Tokyo Tower, mode=transit]"
   - Do not give text directions like "Take line 5...". Just give the card.
5. Keep answers concise vs comprehensive based on Mode (e.g. Medical = Concise, Tourist = Detailed).
`;

        // ============ 4. CALL OPENAI ============
        const effectiveApiKey = apiKey || process.env.OPENAI_API_KEY;

        if (!effectiveApiKey) {
            return Response.json({
                role: "assistant",
                content: generateLocalResponse(userQuery, country) + "\n\n(System: OpenAI Key missing)"
            });
        }

        const openai = new OpenAI({ apiKey: effectiveApiKey });

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                ...messages.map((m: any) => ({ role: m.role, content: m.content }))
            ],
            temperature: 0.7,
            max_tokens: 600,
        });

        return Response.json({
            role: "assistant",
            content: response.choices[0].message.content
        });

    } catch (error) {
        console.error("AI API Error:", error);
        return Response.json({
            role: "assistant",
            content: "An error occurred. Please try again."
        }, { status: 500 });
    }
}
