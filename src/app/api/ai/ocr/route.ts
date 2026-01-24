import { OpenAI } from "openai";
import { auth } from "@/lib/auth";
import { checkAILimit, incrementAIUsage } from "@/lib/ai-usage";
import { getOpenAIConfig } from "@/lib/ai-config";

export const maxDuration = 60; // Allow longer timeout for vision processing

export async function POST(req: Request) {
    let userId: string | undefined;

    try {
        const session = await auth();
        userId = session?.user?.id;

        if (!userId) {
            return Response.json({ error: "Authentication required" }, { status: 401 });
        }

        // 1. Check AI Limit
        const canUse = await checkAILimit(userId, "SCAN");
        if (!canUse) {
            return Response.json({
                error: "LIMIT_REACHED",
                message: "Scan limit reached. Please upgrade to Premium."
            }, { status: 403 });
        }

        const { image } = await req.json();

        if (!image) {
            return Response.json({ error: "No image provided" }, { status: 400 });
        }

        // 2. GET DYNAMIC CONFIG
        const aiConfig = await getOpenAIConfig();
        if (!aiConfig.apiKey) {
            return Response.json({
                error: "AI_NOT_CONFIGURED",
                message: "AI service is currently not configured. Please contact support or check Admin Panel."
            }, { status: 503 });
        }

        const openai = new OpenAI({ apiKey: aiConfig.apiKey });

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini", // Keep vision-capable model
            messages: [
                {
                    role: "system",
                    content: `You are a receipt scanner API. 
                    Analyze the provided image and extract expense details. 
                    Return ONLY a JSON object with this structure:
                    {
                        "merchant": "Store Name",
                        "date": "YYYY-MM-DD",
                        "amount": 1000,
                        "currency": "MNT",
                        "category": "Food" | "Transport" | "Shopping" | "Entertainment" | "Other"
                    }
                    If currency symbol is used (₮, ¥, $, ₩), convert to ISO code (MNT, JPY, USD, KRW).
                    If amount is in thousands (e.g. 5.0, 5,000) but looks like MNT, assume MNT.
                    If date is missing, use today's date.
                    If unsure, use "Other" category.`
                },
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Scan this receipt." },
                        {
                            type: "image_url",
                            image_url: {
                                url: image, // Expecting base64 data url
                                detail: "low" // Low detail is usually enough for text and saves tokens
                            }
                        }
                    ]
                }
            ],
            max_tokens: 300,
            response_format: { type: "json_object" }
        });

        const result = response.choices[0].message.content;
        if (!result) {
            throw new Error("No response from AI");
        }

        // 3. Increment usage on success (Safe background call)
        incrementAIUsage(userId, "SCAN").catch(e => console.error("Usage increment failed (OCR):", e));

        return Response.json(JSON.parse(result));

    } catch (error: any) {
        console.error("OCR Error:", error);

        const errorMessage = error.message?.includes("API key")
            ? "AI API configuration error. Admin must verify key."
            : "Failed to process image. Please try again.";

        return Response.json({ error: "AI_ERROR", message: errorMessage }, { status: 500 });
    }
}
