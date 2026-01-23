import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/config/admin";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const VISON_MODELS = [
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-2.0-flash-exp"
];

async function generateContentWithFallback(genAI: GoogleGenerativeAI, models: string[], prompt: string, imagePart: any) {
    let lastError;
    for (const modelName of models) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent([prompt, imagePart]);
            return result;
        } catch (error: any) {
            console.warn(`Model ${modelName} failed:`, error.message);
            lastError = error;
        }
    }
    throw new Error(`Vision models failed: ${lastError?.message}`);
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email || !isAdmin(session.user.email)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const imageFile = formData.get("image") as File;

        if (!imageFile) {
            return NextResponse.json({ error: "No image file provided" }, { status: 400 });
        }

        const configRef = doc(db, "system", "config");
        const configSnap = await getDoc(configRef);
        const config = configSnap.data() || {};
        const googleKey = config.googleApiKey || process.env.GOOGLE_API_KEY;

        if (!googleKey) {
            return NextResponse.json({ error: "Google API Key missing" }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(googleKey);
        const arrayBuffer = await imageFile.arrayBuffer();
        const base64Image = Buffer.from(arrayBuffer).toString("base64");

        const imagePart = {
            inlineData: {
                data: base64Image,
                mimeType: imageFile.type || "image/png"
            }
        };

        const visionPrompt = `Extract a highly detailed, professional text-to-image prompt from this image. 
        Focus on:
        1. Subject description and action.
        2. Artistic style (e.g., cinematic, realistic, oil painting).
        3. Lighting and atmosphere.
        4. Composition and camera angle.
        
        Output ONLY the raw prompt string, optimized for Imagen 3/4 or DALL-E 3. No introductory text.`;

        const visionResult = await generateContentWithFallback(genAI, VISON_MODELS, visionPrompt, imagePart);
        const detailedPrompt = visionResult.response.text().trim();

        return NextResponse.json({
            success: true,
            prompt: detailedPrompt
        });

    } catch (error: any) {
        console.error("Image Analysis error:", error);
        return NextResponse.json({
            error: error.message || "Analysis failed"
        }, { status: 500 });
    }
}
