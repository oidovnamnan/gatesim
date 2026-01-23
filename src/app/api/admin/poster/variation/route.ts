import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/config/admin";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import OpenAI from "openai";

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email || !isAdmin(session.user.email)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const imageFile = formData.get("image") as File;
        const n = Number(formData.get("n")) || 1;
        const size = (formData.get("size") as "256x256" | "512x512" | "1024x1024") || "1024x1024";

        if (!imageFile) {
            return NextResponse.json({ error: "No image file provided" }, { status: 400 });
        }

        // Validate File Type (OpenAI specifically requires PNG)
        // Although the SDK might handle conversion, it is safer to check.
        // Actually, createVariation supports PNG. JPEG might need conversion if strict.
        // But for now, we pass the file. If OpenAI errors, we catch it.

        // Get API Key
        const configRef = doc(db, "system", "config");
        const configSnap = await getDoc(configRef);
        const config = configSnap.data() || {};
        const openaiApiKey = process.env.OPENAI_API_KEY || config.openaiApiKey;

        if (!openaiApiKey) {
            return NextResponse.json({ error: "OpenAI API Key missing" }, { status: 500 });
        }

        const openai = new OpenAI({ apiKey: openaiApiKey });

        // Call OpenAI Variation
        // The SDK helps with the FormData construction internally when passing a File object from the Web API
        const response = await openai.images.createVariation({
            image: imageFile,
            n: n,
            size: size,
            response_format: "url"
        });

        const imageUrl = response.data[0].url;

        if (!imageUrl) throw new Error("No image url returned");

        // Generate Caption relative to the context (Variation of...)
        const captionResponse = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are a social media manager for GateSIM. Create a caption for this new AI-remixed travel image. Return JSON: { \"mn\": \"...\", \"en\": \"...\", \"hashtags\": \"...\" }" },
                { role: "user", content: "A variation of a travel photo was just generated." }
            ],
            response_format: { type: "json_object" }
        });

        const captionData = JSON.parse(captionResponse.choices[0]?.message?.content || "{}");

        return NextResponse.json({
            success: true,
            imageUrl,
            captionMN: captionData.mn || "AI Variation",
            captionEN: captionData.en || "AI Variation",
            hashtags: captionData.hashtags || "#GateSIM #AI",
            provider: "openai",
            message: "Хувилбар зураг амжилттай үүслээ"
        });

    } catch (error: any) {
        console.error("Variation error:", error);
        return NextResponse.json({
            error: error.message || "Variation generation failed"
        }, { status: 500 });
    }
}
