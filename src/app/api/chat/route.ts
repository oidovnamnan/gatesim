import { OpenAI } from "openai";
import { findContextData, generateLocalResponse } from "@/lib/local-ai";
import { headers } from "next/headers";

// Simple in-memory rate limiting (Note: This resets on server restart)
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const FREE_LIMIT_PER_WINDOW = 5; // 5 requests per hour

interface RateLimitData {
    count: number;
    resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitData>();

export async function POST(req: Request) {
    try {
        const { messages, country, apiKey } = await req.json();

        if (!messages || messages.length === 0) {
            return Response.json({ error: "No messages provided" }, { status: 400 });
        }

        const lastMessage = messages[messages.length - 1];
        const userQuery = lastMessage.content;

        // --- RATE LIMITING LOGIC ---
        const requestHeaders = await headers();
        const ip = requestHeaders.get("x-forwarded-for") || "unknown";
        const now = Date.now();

        let limitData = rateLimitMap.get(ip);

        // Reset if window passed
        if (!limitData || now > limitData.resetTime) {
            limitData = { count: 0, resetTime: now + RATE_LIMIT_WINDOW };
        }

        limitData.count++;
        rateLimitMap.set(ip, limitData);

        const isRateLimited = limitData.count > FREE_LIMIT_PER_WINDOW;
        const effectiveApiKey = apiKey || process.env.OPENAI_API_KEY;

        // Use Local AI if: 1. No API Key OR 2. Rate Limit Exceeded
        if (!effectiveApiKey || isRateLimited) {
            if (isRateLimited) {
                console.warn(`Rate limit exceeded for IP: ${ip}. Falling back to local AI.`);
            } else {
                console.warn("OPENAI_API_KEY not found, falling back to local logic");
            }

            // Fallback to local logic
            const localResponse = generateLocalResponse(userQuery, country);

            // Add a polite notice if rate limited
            let finalContent = localResponse;
            if (isRateLimited) {
                finalContent += "\n\n(Таны AI ашиглах эрх түр дууссан тул офлайн хариу өглөө. Түр хүлээгээд дахин оролдоно уу)";
            }

            // Simulate network delay for realistic feel
            await new Promise(resolve => setTimeout(resolve, 500));

            return Response.json({
                role: "assistant",
                content: finalContent
            });
        }

        // OpenAI Logic
        const contextData = findContextData(userQuery, country);

        let systemPrompt = `You are GateSIM AI, a helpful travel assistant.
You strictly answer in Mongolian language (Cyrillic).
You provide helpful, concise, and friendly responses about travel, eSIMs, and connectivity.
Use emojis to make the conversation engaging.`;

        if (contextData) {
            systemPrompt += `\n\nIMPORTANT: Use the following official context data to answer the user's question accurately. Do not make up facts if they contradict this data:\n${contextData}`;
        }

        const openai = new OpenAI({
            apiKey: effectiveApiKey,
        });

        // Determine model (use 3.5-turbo or 4o-mini for speed/cost)
        const model = "gpt-4o-mini";

        const response = await openai.chat.completions.create({
            model: model,
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

        // Fallback on error (try safe parsing)
        const localResponse = generateLocalResponse("Сайн байна уу");
        return Response.json({
            role: "assistant",
            content: localResponse + "\n\n(AI API алдаа гарсан тул offline горимд хариуллаа)"
        });
    }
}
