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
        const { messages, country, apiKey, language = "mn" } = await req.json();
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
                    content: language === "en" ? "Your chat access is temporarily blocked. (Spam detected)" :
                        language === "cn" ? "您的聊天权限已被暂时封锁。（检测到垃圾信息）" :
                            "Таны чатлах эрх түр хаагдсан байна. (Спам илэрсэн)"
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
                    content: language === "en" ? "Your chat access is temporarily blocked. (Too many messages or repetition)" :
                        language === "cn" ? "您的聊天权限已被暂时封锁。（消息过多或重复）" :
                            "Таны чатлах эрх түр хаагдсан байна. (Хэт олон мессеж эсвэл давтамж)"
                });
            }

            limitData.count++;
            rateLimitMap.set(ip, limitData);
        }

        // ============ 3. AI SYSTEM PROMPT & SCOPE ============
        const contextData = findContextData(userQuery, country);

        // Scope definition
        const scopeInstruction = userHasActiveOrder
            ? (language === "en" ? "Since the user has purchased a package, you can discuss travel tips, places to visit, and advice for the destination country. Keep it helpful and related to their trip." :
                language === "cn" ? "既然用户已经购买了套餐，你可以讨论旅行小贴士、参观地点和目的地国家的建议。保持有用且与他们的旅行相关。" :
                    "Хэрэглэгч багц худалдаж авсан тул та аяллын зөвлөгөө, очих газрууд, аяллын талаар ярилцаж болно. Тусламжтай, аялалтай нь холбоотой байлгаарай.")
            : (language === "en" ? "The user has NOT purchased yet. STRICTLY limit conversation to GateSIM products, eSIM cards, choosing a data package, and checkout. If the user asks about general topics, politely steer them back to buying an eSIM." :
                language === "cn" ? "用户尚未购。严格限制对话为 GateSIM 产品、eSIM 卡、选择数据套餐和结账。如果用户询问一般主题，请礼貌地引导他们回到购买 eSIM。" :
                    "Хэрэглэгч хараахан худалдан авалт хийгээгүй байна. Яриаг ЗӨВХӨН GateSIM бүтээгдэхүүн, eSIM карт, дата багц сонгох, төлбөр төлөхөд хязгаарлаарай. Хэрэв хэрэглэгч ерөнхий сэдэв асуувал eSIM худалдаж авах руу эелдгээр чиглүүлээрэй.");

        const languageInstruction = language === "en" ? "English" : language === "cn" ? "Chinese (Simplified)" : "Mongolian (Cyrillic)";

        let systemPrompt = `You are GateSIM AI, an elite Travel Assistant.
You strictly answer in ${languageInstruction}.
Your interaction style is:
1. Extremely polite and friendly (Use "Та" or formal titles, "Сайн байна уу?" or appropriate greetings, emojis).
2. Direct and helpful.
3. GOAL: Ask where they are going and for how long, then recommend the best GateSIM package. Use [SEARCH_PACKAGES: country=CODE, minDays=N] if you detect intent.

SCOPE CONTROL:
${scopeInstruction}

- If the user says "Japan 5 days" or "Cheapest in China", output "[SEARCH_PACKAGES: country=JP, minDays=5]" IMMEDIATELY.
- ALWAYS use 2-letter ISO country codes (JP, KR, CN, US, TH, etc.) in the command.
- START your response with the command.
- DO NOT generate a numbered list of packages (e.g. "1. Package A..."). The UI does this.
- DO NOT describe the packages in text. Just say "Here are the best options:" (in ${languageInstruction}) and then the command.
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
            content: "An error occurred. Please try again."
        }, { status: 500 });
    }
}
