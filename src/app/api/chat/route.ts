import { OpenAI } from "openai";
import { findContextData, generateLocalResponse } from "@/lib/local-ai";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

export async function POST(req: Request) {
    try {
        const { messages, country, apiKey } = await req.json();
        const session = await auth();

        if (!messages || messages.length === 0) {
            return Response.json({ error: "No messages provided" }, { status: 400 });
        }

        const lastMessage = messages[messages.length - 1];
        const userQuery = lastMessage.content;
        const requestHeaders = await headers();
        const ip = requestHeaders.get("x-forwarded-for") || "unknown";

        // ============ 1. AUTH & SCOPE LOGIC ============
        let userHasActiveOrder = false;

        if (session?.user?.email) {
            const user = await prisma.user.findUnique({
                where: { email: session.user.email },
                include: { orders: { where: { status: "PAID" } } }
            });

            if (user) {
                userHasActiveOrder = user.orders.length > 0;
            }
        } else {
            // ============ 2. GUEST & SPAM LOGIC ============
            const now = Date.now();
            let limitData = rateLimitMap.get(ip);

            if (!limitData || now > limitData.resetTime) {
                limitData = { count: 0, resetTime: now + RATE_LIMIT_WINDOW, repeatCount: 0, isBlocked: false };
            }

            if (limitData.isBlocked) {
                return Response.json({
                    role: "assistant",
                    content: "Таны чатлах эрх түр хаагдсан байна. (Спам илэрсэн)"
                });
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
                return Response.json({
                    role: "assistant",
                    content: "Таны чатлах эрх түр хаагдсан байна. (Хэт олон мессеж эсвэл давтамж)"
                });
            }

            limitData.count++;
            rateLimitMap.set(ip, limitData);
        }

        // ============ 3. AI SYSTEM PROMPT & SCOPE ============
        const contextData = findContextData(userQuery, country);

        // Scope definition
        const scopeInstruction = userHasActiveOrder
            ? "Since the user has purchased a package, you can discuss travel tips, places to visit, and advice for the destination country. Keep it helpful and related to their trip."
            : "The user has NOT purchased yet. STRICTLY limit conversation to GateSIM products, eSIM cards, choosing a data package, and checkout. If the user asks about general topics (weather, history, politics, etc.), politely steer them back to buying an eSIM. Example: 'Би зөвхөн eSIM болон аяллын дата багцын талаар мэдээлэл өгөх боломжтой.'";

        let systemPrompt = `You are GateSIM AI, an elite Travel Assistant.
You strictly answer in Mongolian language (Cyrillic).
Your interaction style is:
1. Extremely polite and friendly (Use "Та", "Сайн байна уу?", emojis).
2. Direct and helpful.
3. GOAL: Ask where they are going and for how long, then recommend the best GateSIM package. Use [SEARCH_PACKAGES: country=CODE, minDays=N] if you detect intent.

SCOPE CONTROL:
${scopeInstruction}

- If the user says "Japan 5 days" or "Cheapest in China", output "[SEARCH_PACKAGES: ...]" IMMEDIATELY.
- START your response with the command.
- DO NOT generate a numbered list of packages (e.g. "1. Package A..."). The UI does this.
- DO NOT describe the packages in text. Just say "Here are the best options:" and then the command.
- Do NOT ask "Do you want to order?". Just show the packages. The user can click them.
`;

        if (contextData) {
            systemPrompt += `\n\nCONTEXT DATA:\n${contextData}`;
        }

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
            max_tokens: 500,
        });

        return Response.json({
            role: "assistant",
            content: response.choices[0].message.content
        });

    } catch (error) {
        console.error("AI API Error:", error);
        return Response.json({
            role: "assistant",
            content: "Уучлаарай, алдаа гарлаа. Та дахин оролдоно уу."
        }, { status: 500 });
    }
}
