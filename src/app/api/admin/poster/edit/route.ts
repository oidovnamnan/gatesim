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

        const { originalImageUrl, action, instruction, originalPrompt, provider } = await req.json();

        if (!originalImageUrl) {
            return NextResponse.json({ error: "Missing original image" }, { status: 400 });
        }

        const configRef = doc(db, "system", "config");
        const configSnap = await getDoc(configRef);
        const config = configSnap.data() || {};

        let resultImageUrl = "";
        let newCaptionMN = "";
        let newCaptionEN = "";
        let newHashtags = "";

        if (action === "variation") {
            // Logic for Variations
            // Since DALL-E 3 doesn't support 'variations' API yet, we use a trick: 
            // Describe the image and generate again with slight variations.
            // Or use DALL-E 2 if available (but quality is lower).
            // Here we'll use "DALL-E 3 Prompt Injection" based on the original.

            const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || config.openaiApiKey });

            const variationPrompt = `Create a visually similar variation of this scene: ${originalPrompt}. Maintain the same composition and lighting but change specific details to make it a unique alternative. Professional travel photography aesthetic.`;

            const response = await openai.images.generate({
                model: "dall-e-3",
                prompt: variationPrompt,
                n: 1,
                size: "1024x1024", // Default to square for variations
                quality: "hd",
            });
            resultImageUrl = response.data?.[0]?.url || "";

        } else if (action === "edit") {
            // Logic for Magic Edit (Instructional)
            const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || config.openaiApiKey });

            const editPrompt = `Modify the following scene based on these instructions: "${instruction}". Original Scene: ${originalPrompt}. Ensure the modification looks seamless and maintains the 'GateSIM' branding and high-end travel aesthetic.`;

            const response = await openai.images.generate({
                model: "dall-e-3",
                prompt: editPrompt,
                n: 1,
                size: "1024x1024",
                quality: "hd",
            });
            resultImageUrl = response.data?.[0]?.url || "";

        } else if (action === "bg-remove") {
            // Logic for Background Removal (Advanced Prompting or External Tool)
            // For now, we'll use a specialized prompt to 'clean' the background to white/studio.
            const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || config.openaiApiKey });

            const bgRemovePrompt = `Isolate the subject from this scene: ${originalPrompt}. Place the subject on a pristine, perfectly white studio background with soft professional product lighting. No shadows, no distractions. Just the isolated subject.`;

            const response = await openai.images.generate({
                model: "dall-e-3",
                prompt: bgRemovePrompt,
                n: 1,
                size: "1024x1024",
                quality: "hd",
            });
            resultImageUrl = response.data?.[0]?.url || "";
        }

        if (!resultImageUrl) throw new Error("AI Editing failed");

        // Generate new captions if it was an edit or variation
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || config.openaiApiKey });
        const captionResponse = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "Write a fresh social media caption for this modified image. Return JSON: { mn, en, hashtags }" },
                { role: "user", content: `Action: ${action}, Modified Content: ${instruction || "Similar variation"}` }
            ],
            response_format: { type: "json_object" }
        });
        const captionData = JSON.parse(captionResponse.choices[0]?.message?.content || "{}");

        return NextResponse.json({
            success: true,
            imageUrl: resultImageUrl,
            captionMN: captionData.mn,
            captionEN: captionData.en,
            hashtags: captionData.hashtags
        });

    } catch (error: any) {
        console.error("AI Edit error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
