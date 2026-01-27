import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/config/admin";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import OpenAI from "openai";

export const dynamic = 'force-dynamic';
export const maxDuration = 120; // Vision + Generation takes time

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email || !isAdmin(session.user.email)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const sourceFile = formData.get("source") as File;
        const refFile = formData.get("reference") as File;
        const mode = formData.get("mode") as string;
        const extraPrompt = formData.get("prompt") as string;

        if (!sourceFile || !refFile) {
            return NextResponse.json({ error: "Missing required images" }, { status: 400 });
        }

        const configRef = doc(db, "system", "config");
        const configSnap = await getDoc(configRef);
        const config = configSnap.data() || {};
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || config.openaiApiKey });

        // Helper: Convert File to Base64
        const fileToBase64 = async (file: File) => {
            const buffer = await file.arrayBuffer();
            return Buffer.from(buffer).toString('base64');
        };

        const sourceB64 = await fileToBase64(sourceFile);
        const refB64 = await fileToBase64(refFile);

        // 1. Vision Analysis & Prompt Synthesis
        let visionSystemPrompt = "";
        if (mode === 'face') {
            visionSystemPrompt = "Analyze these two images. Image 1 is the SOURCE (scene/body). Image 2 is the REFERENCE (face). Describe the source scene in detail, then describe the unique facial features of the reference person precisely. Synthesize a single master prompt to recreate the source scene but with the person having the facial features of the reference. Maintain professional travel photography aesthetic.";
        } else if (mode === 'background') {
            visionSystemPrompt = "Analyze these two images. Image 1 is the SOURCE (subject). Image 2 is the REFERENCE (background/location). Describe the subject from image 1 in detail, then describe the location from image 2. Synthesize a master prompt to place the subject into that specific location naturally. Maintain professional advertising aesthetic.";
        } else {
            visionSystemPrompt = "Analyze these two images. Image 1 is the SOURCE (content). Image 2 is the REFERENCE (artistic style). Describe the content of image 1, then analyze the artistic style, color palette, and lighting of image 2. Synthesize a master prompt to recreate the content of image 1 in the exact style of image 2.";
        }

        const visionResponse = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are an expert AI art director. Synthesize a powerful, descriptive prompt for DALL-E 3 based on visual analysis. Your output must be a single string (the prompt)." },
                {
                    role: "user",
                    content: [
                        { type: "text", text: visionSystemPrompt + (extraPrompt ? ` Additional instruction: ${extraPrompt}` : "") },
                        { type: "image_url", image_url: { url: `data:image/jpeg;base64,${sourceB64}` } },
                        { type: "image_url", image_url: { url: `data:image/jpeg;base64,${refB64}` } }
                    ]
                }
            ]
        });

        const masterPrompt = visionResponse.choices[0]?.message?.content || "";
        if (!masterPrompt) throw new Error("Vision analysis failed to generate a prompt");

        // 2. Image Synthesis
        const imageResponse = await openai.images.generate({
            model: "dall-e-3",
            prompt: masterPrompt + " Clearly include 'GateSIM' branding if applicable. Highly detailed, 8k, photorealistic travel photography.",
            n: 1,
            size: "1024x1024",
            quality: "hd",
        });

        const imageUrl = imageResponse.data?.[0]?.url || "";
        if (!imageUrl) throw new Error("Image synthesis failed");

        // 3. Caption Generation
        const captionResponse = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "Write a fresh social media caption for this fused image. Return JSON: { mn, en, hashtags }" },
                { role: "user", content: `Fused Content Description: ${masterPrompt}` }
            ],
            response_format: { type: "json_object" }
        });
        const captionData = JSON.parse(captionResponse.choices[0]?.message?.content || "{}");

        return NextResponse.json({
            success: true,
            imageUrl,
            captionMN: captionData.mn,
            captionEN: captionData.en,
            hashtags: captionData.hashtags
        });

    } catch (error: any) {
        console.error("Fusion Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
