import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/config/admin";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import OpenAI from "openai";
import sharp from "sharp";

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

        // Get API Key first
        const configRef = doc(db, "system", "config");
        const configSnap = await getDoc(configRef);
        const config = configSnap.data() || {};
        const openaiApiKey = process.env.OPENAI_API_KEY || config.openaiApiKey;

        if (!openaiApiKey) {
            return NextResponse.json({ error: "OpenAI API Key missing" }, { status: 500 });
        }

        // --- IMAGE PROCESSING WITH SHARP ---
        // 1. Convert File to Buffer
        const arrayBuffer = await imageFile.arrayBuffer();
        const inputBuffer = Buffer.from(arrayBuffer);

        // 2. Process with Sharp
        // OpenAI DALL-E 2 Variation requirements:
        // - Less than 4MB
        // - PNG
        // - Square aspect ratio is best practice for 1024x1024, though DALL-E might crop. 
        //   We will force 1024x1024 square to avoid errors.
        const processedBuffer = await sharp(inputBuffer)
            .resize({
                width: 1024,
                height: 1024,
                fit: 'cover', // crop center if not square
                position: 'center'
            })
            .toFormat('png')
            .toBuffer();

        // 3. Create a new File object from the processed buffer
        // Explicitly convert Buffer to Uint8Array to satisfy BlobPart type definition
        const uInt8Array = new Uint8Array(processedBuffer);
        const processedFile = new File([uInt8Array], "image.png", { type: "image/png" });

        const openai = new OpenAI({ apiKey: openaiApiKey });

        // Call OpenAI Variation with the PROCESSED file
        const response = await openai.images.createVariation({
            image: processedFile,
            n: n,
            size: size,
            response_format: "url"
        });

        const imageUrl = response.data?.[0]?.url;

        if (!imageUrl) throw new Error("No image url returned");

        // Generate Caption relative to the context
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
