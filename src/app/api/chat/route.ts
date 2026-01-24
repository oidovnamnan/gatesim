import { OpenAI } from "openai";
import { findContextData, generateLocalResponse } from "@/lib/local-ai";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getUserTravelContext } from "@/lib/ai-server-context";
import { checkAILimit, incrementAIUsage } from "@/lib/ai-usage";
import { getOpenAIConfig } from "@/lib/ai-config";

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
    let userId: string | undefined;

    try {
        const body = await req.json();
        const { messages, country, apiKey: clientProvidedKey, language = "mn", mode = "tourist", tripContext } = body;

        if (!messages || messages.length === 0) {
            return Response.json({ error: "No messages provided" }, { status: 400 });
        }

        const session = await auth();
        userId = session?.user?.id;

        // ============ 1. RATE LIMITING (GUESTS) ============
        if (!session?.user?.email) {
            const requestHeaders = await headers();
            const ip = requestHeaders.get("x-forwarded-for") || "unknown";
            const now = Date.now();
            let limitData = rateLimitMap.get(ip);

            if (!limitData || now > limitData.resetTime) {
                limitData = { count: 0, resetTime: now + RATE_LIMIT_WINDOW, repeatCount: 0, isBlocked: false };
            }

            if (limitData.isBlocked) {
                const blockedMsg = language === "en" ? "Your chat access is temporarily blocked." : "Таны чатлах эрх түр хаагдсан байна.";
                return Response.json({ role: "assistant", content: blockedMsg });
            }

            const lastMessage = messages[messages.length - 1];
            const userQuery = lastMessage.content;

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

        // ============ 2. LIMIT CHECK (TRANSIT) ============
        if (mode === 'transit') {
            if (!userId) {
                return Response.json({ error: "Authentication required" }, { status: 401 });
            }

            const canUse = await checkAILimit(userId, "TRANSIT");
            if (!canUse) {
                return Response.json({
                    role: "assistant",
                    content: language === 'mn' ? "Нийтийн тээврийн хөтчийн үнэгүй эрх дууссан байна. Premium эрх авч хязгааргүй ашиглаарай." : "Transit Guide limit reached. Please upgrade to Premium for unlimited access."
                });
            }
        }

        // ============ 3. GET DYNAMIC CONFIG ============
        const aiConfig = await getOpenAIConfig();
        const effectiveApiKey = clientProvidedKey || aiConfig.apiKey;

        if (!effectiveApiKey) {
            const lastMsg = messages[messages.length - 1].content;
            return Response.json({
                role: "assistant",
                content: generateLocalResponse(lastMsg, country) + "\n\n(System: AI Service configuration pending)"
            });
        }

        // ============ 4. FETCH USER CONTEXT ============
        const travelContext = await getUserTravelContext();

        // ============ 5. CONSTRUCT SYSTEM PROMPT ============
        const languageInstruction = language === "en" ? "English" : language === "cn" ? "Chinese (Simplified)" : "Mongolian (Cyrillic)";
        const modeInstruction = MODE_PROMPTS[mode] || MODE_PROMPTS.default;

        let scopeInstruction = "";
        if (travelContext.hasActiveOrder) {
            scopeInstruction = `User HAS an active plan (${travelContext.activePlan?.provider} - ${travelContext.activePlan?.dataTotal}). You can discuss advanced travel topics, locations, and advice freely.`;
        } else {
            scopeInstruction = `User does NOT have an active plan. Your primary goal is to help them buy an eSIM. If they ask generic questions, answer briefly but remind them they need internet to travel.`;
        }

        // Trip Context (Local Plan)
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
- Goal: You MUST provide specific routes to these locations if asked.
`;
            } catch (e) {
                console.error("Failed to parse tripContext in Chat API", e);
            }
        }

        const contextBlock = travelContext.activePlan
            ? `USER CONTEXT: Country: ${travelContext.activePlan.country}, Mode: ${mode.toUpperCase()}`
            : `USER CONTEXT: No active plan, Mode: ${mode.toUpperCase()}`;

        const systemPrompt = `You are GateSIM AI. ${modeInstruction} You strictly answer in ${languageInstruction}. ${scopeInstruction}\n\n${contextBlock}\n${localPlanContext}\n\nINTERACTION GUIDELINES: Friendly, polite. For packages: [SEARCH_PACKAGES: country=CODE]. For directions: [TRANSIT_ROUTE: to=NAME, mode=transit].`;

        // ============ 6. CALL OPENAI ============
        const openai = new OpenAI({ apiKey: effectiveApiKey });

        const response = await openai.chat.completions.create({
            model: aiConfig.model,
            messages: [
                { role: "system", content: systemPrompt },
                ...messages.map((m: any) => ({ role: m.role, content: m.content }))
            ],
            temperature: 0.7,
            max_tokens: 600,
        });

        // ============ 7. INCREMENT USAGE ============
        if (mode === 'transit' && userId) {
            incrementAIUsage(userId, "TRANSIT").catch(e => console.error("Usage increment failed (chat):", e));
        }

        return Response.json({
            role: "assistant",
            content: response.choices[0].message.content
        });

    } catch (error: any) {
        console.error("AI API Chat Error:", error);

        let errorMsg = "An error occurred with AI service. Please try again.";
        if (error.message?.includes("API key")) {
            errorMsg = "AI service configuration error. Admin verification required.";
        }

        return Response.json({
            role: "assistant",
            content: "⚠️ " + errorMsg
        }, { status: 500 });
    }
}
