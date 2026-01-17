import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

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
    } catch (error) {
        console.error("Translation error:", error);
        return NextResponse.json(
            { success: false, error: "Translation failed" },
            { status: 500 }
        );
    }
}
