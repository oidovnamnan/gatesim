import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/config/admin";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// List of models to try for Vision (Image Analysis)
// We try them in order of preference: Optimized (Flash) -> Powerful (Pro) -> Legacy (Pro Vision)
const VISON_MODELS = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-001",
    "gemini-1.5-pro",
    "gemini-1.5-pro-001",
    "gemini-pro-vision"
];

// List of models to try for Text (Captioning)
const TEXT_MODELS = [
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-pro"
];

async function generateContentWithFallback(genAI: GoogleGenerativeAI, models: string[], prompt: string, imagePart?: any) {
    let lastError;
    for (const modelName of models) {
        try {
            console.log(`Attempting Gemini model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const content = imagePart ? [prompt, imagePart] : [prompt];
            const result = await model.generateContent(content);
            return result;
        } catch (error: any) {
            console.warn(`Model ${modelName} failed:`, error.message);
            // If it's a 404 (Not Found) or 400 (Not Supported), continue to next model
            // Otherwise if it's auth error etc, maybe we should stop, but safe to try others.
            lastError = error;
        }
    }
    throw new Error(`All Gemini models failed. Last error: ${lastError?.message || "Unknown"}`);
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email || !isAdmin(session.user.email)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const imageFile = formData.get("image") as File;
        const size = (formData.get("size") as string) || "1:1";

        if (!imageFile) {
            return NextResponse.json({ error: "No image file provided" }, { status: 400 });
        }

        const configRef = doc(db, "system", "config");
        const configSnap = await getDoc(configRef);
        const config = configSnap.data() || {};

        const googleKey = process.env.GOOGLE_API_KEY || config.googleApiKey;

        if (!googleKey) {
            return NextResponse.json({ error: "Google API Key missing" }, { status: 500 });
        }

        // --- STEP 1: ANALYZE IMAGE WITH GEMINI (Smart Vision with Fallback) ---
        const genAI = new GoogleGenerativeAI(googleKey);

        const arrayBuffer = await imageFile.arrayBuffer();
        const base64Image = Buffer.from(arrayBuffer).toString("base64");

        const imagePart = {
            inlineData: {
                data: base64Image,
                mimeType: imageFile.type || "image/png"
            }
        };

        const visionPrompt = `Analyze this image in extreme detail to create a prompt for an AI image generator (Imagen 3).
        
        1. Describe the main subject, composition, and lighting.
        2. If there is valid text like "GateSIM" or country names, include them in the description as 'text "GateSIM"'.
        3. Ignore artifacts or QR codes if they look messy, but describe the intended layout.
        4. Output ONLY the detailed prompt string, nothing else.`;

        let detailedPrompt = "";

        try {
            const visionResult = await generateContentWithFallback(genAI, VISON_MODELS, visionPrompt, imagePart);
            detailedPrompt = visionResult.response.text();
            console.log("Gemini Vision Success. Prompt:", detailedPrompt);
        } catch (err: any) {
            console.error("Gemini Vision Analysis Failed completely:", err);
            // Fallback: If vision fails entirely, just use a generic prompt based on filename or something?
            // No, better to fail and tell user.
            throw new Error(`Gemini Vision Error: ${err.message}. Please check API Key permissions.`);
        }

        // --- STEP 2: GENERATE NEW IMAGE WITH IMAGEN 3 ---
        const configModelId = config.googleModelId || "imagen-3.0-generate-001";
        const modelIdRaw = (process.env.GOOGLE_MODEL_ID || configModelId).trim();
        const fullModelName = modelIdRaw.startsWith("models/") ? modelIdRaw : `models/${modelIdRaw}`;

        let aspectRatio = "1:1";
        if (size.includes("1792")) aspectRatio = "9:16";
        if (size.includes("1792") && size.startsWith("1792")) aspectRatio = "16:9";
        if (size === "9:16" || size === "16:9" || size === "4:3" || size === "3:4") aspectRatio = size;

        const imagenResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/${fullModelName}:predict?key=${googleKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                instances: [{ prompt: detailedPrompt }],
                parameters: {
                    sampleCount: 1,
                    aspectRatio: aspectRatio,
                    outputMimeType: "image/png"
                }
            })
        });

        if (!imagenResponse.ok) {
            const err = await imagenResponse.json();
            throw new Error(`Imagen Generation Failed: ${err.error?.message || JSON.stringify(err)}`);
        }

        const imagenData = await imagenResponse.json();
        const b64 = imagenData.predictions?.[0]?.bytesBase64Encoded;

        if (!b64) throw new Error("No image returned from Google Imagen");

        const imageUrl = `data:image/png;base64,${b64}`;

        // --- STEP 3: GENERATE CAPTION (with Fallback) ---
        let captionData = {};
        try {
            const captionPrompt = `
            You are a social media manager for GateSIM. 
            Based on this image description: "${detailedPrompt}"
            
            Write a travel caption.
            Return ONLY valid JSON: { "mn": "...", "en": "...", "hashtags": "..." }
            `;

            const captionResult = await generateContentWithFallback(genAI, TEXT_MODELS, captionPrompt);
            const text = captionResult.response.text();
            const jsonText = text.replace(/```json/g, "").replace(/```/g, "").trim();
            captionData = JSON.parse(jsonText);
        } catch (e) {
            console.error("Caption generation error", e);
            captionData = { mn: "Тайлбар үүсгэж чадсангүй", en: "Caption failed", hashtags: "#GateSIM" };
        }

        return NextResponse.json({
            success: true,
            imageUrl,
            captionMN: (captionData as any).mn || "Gemini Variation",
            captionEN: (captionData as any).en || "Gemini Variation",
            hashtags: (captionData as any).hashtags || "#GateSIM #AI",
            provider: "google-gemini",
            message: "Gemini High-Fidelity Variation Created"
        });

    } catch (error: any) {
        console.error("Gemini Variation error:", error);
        return NextResponse.json({
            error: error.message || "Variation generation failed"
        }, { status: 500 });
    }
}
