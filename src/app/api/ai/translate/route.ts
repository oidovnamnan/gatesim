import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import { auth } from "@/lib/auth";
import { checkAILimit, incrementAIUsage } from "@/lib/ai-usage";
import { getOpenAIConfig } from "@/lib/ai-config";

// Language names for prompts
const languageNames: Record<string, string> = {
    mn: "Mongolian",
    en: "English",
    zh: "Chinese (Simplified)",
    ja: "Japanese",
    ko: "Korean",
    th: "Thai",
    ru: "Russian",
};

export async function POST(request: NextRequest) {
    let userId: string | undefined;

    try {
        const { text, sourceLang, targetLang } = await request.json();

        if (!text || !sourceLang || !targetLang) {
            return NextResponse.json(
                { success: false, error: "Missing required fields" },
                { status: 400 }
            );
        }

        const session = await auth();
        userId = session?.user?.id;

        if (!userId) {
            return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
        }

        // 1. Check AI Limit (20 for Translate)
        const canUse = await checkAILimit(userId, "TRANSLATE");
        if (!canUse) {
            return NextResponse.json({
                success: false,
                error: "LIMIT_REACHED",
                message: "Translation limit reached. Please upgrade to Premium."
            }, { status: 403 });
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
        const sourceLanguage = languageNames[sourceLang] || "English";
        const targetLanguage = languageNames[targetLang] || "Mongolian";

        const completion = await openai.chat.completions.create({
            model: aiConfig.model,
            messages: [
                {
                    role: "system",
                    content: `You are a professional translator. Translate the following text from ${sourceLanguage} to ${targetLanguage}. 
Only respond with the translation, nothing else. Do not add explanations or notes.
If the text contains slang or idioms, translate them to natural equivalents in the target language.`,
                },
                {
                    role: "user",
                    content: text,
                },
            ],
            max_tokens: 1000,
            temperature: 0.3,
        });

        const translatedText = completion.choices[0]?.message?.content?.trim() || "";

        // 3. Increment usage (Don't let DB failure block response)
        try {
            await incrementAIUsage(userId, "TRANSLATE");
        } catch (dbErr) {
            console.error("Failed to increment AI usage (translate):", dbErr);
        }

        return NextResponse.json({
            success: true,
            translatedText,
            sourceLang,
            targetLang,
        });

    } catch (error: any) {
        console.error("Translation error:", error);

        // Return a cleaner error message
        const errorMessage = error.message?.includes("API key")
            ? "AI API configuration error. Please notify admin."
            : "Translation failed. Please try again later.";

        return NextResponse.json(
            { success: false, error: "AI_ERROR", message: errorMessage },
            { status: 500 }
        );
    }
}
