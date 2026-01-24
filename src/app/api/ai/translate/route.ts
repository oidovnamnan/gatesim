import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { auth } from "@/lib/auth";
import { checkAILimit, incrementAIUsage } from "@/lib/ai-usage";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

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
    try {
        const { text, sourceLang, targetLang } = await request.json();

        if (!text || !sourceLang || !targetLang) {
            return NextResponse.json(
                { success: false, error: "Missing required fields" },
                { status: 400 }
            );
        }

        const session = await auth();
        const userId = session?.user?.id;

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

        const sourceLanguage = languageNames[sourceLang] || "English";
        const targetLanguage = languageNames[targetLang] || "Mongolian";

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
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

        return NextResponse.json({
            success: true,
            translatedText,
            sourceLang,
            targetLang,
        });
    } finally {
        const session = await auth();
        if (session?.user?.id) {
            await incrementAIUsage(session.user.id, "TRANSLATE");
        }
    }
}
