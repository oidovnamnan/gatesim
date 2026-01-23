import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/config/admin";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// List of models to try for Vision (Image Analysis)
// User confirmed Gemini 1.5 might not be enabled. Prioritizing older stable vision models.
const VISON_MODELS = [
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-2.0-flash-exp"
];

// List of models to try for Text (Captioning)
// Gemini Pro Vision cannot do text-only chat well without image, so use Gemini Pro for text
const TEXT_MODELS = [
    "gemini-1.5-flash",
    "gemini-1.5-pro"
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
            lastError = error;
        }
    }
    throw new Error(`All Gemini models failed. Please check if 'Gemini Pro Vision' API is enabled in Google Cloud Console. Last error: ${lastError?.message || "Unknown"}`);
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
        const n = parseInt((formData.get("n") as string) || "1");
        const customPrompt = (formData.get("customPrompt") as string) || "";

        if (!imageFile) {
            return NextResponse.json({ error: "No image file provided" }, { status: 400 });
        }

        const configRef = doc(db, "system", "config");
        const configSnap = await getDoc(configRef);
        const config = configSnap.data() || {};

        // Prioritize dynamic config key over env var to allow override from Admin Settings
        const googleKey = config.googleApiKey || process.env.GOOGLE_API_KEY;

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

        let visionPrompt = `Analyze this image in extreme detail to create a prompt for an AI image generator (Imagen 3/4).
        
        1. Describe the main subject, composition, and lighting.
        2. If there is valid text like "GateSIM" or country names, include them in the description as 'text "GateSIM"'.
        3. Ignore artifacts or QR codes if they look messy, but describe the intended layout.
        4. Output ONLY the detailed prompt string, nothing else.`;

        if (customPrompt) {
            visionPrompt += `\n\nUSER MODIFICATION REQUEST: "${customPrompt}". Please adjust the description to prioritize this change while keeping the core identity of the source image.`;
        }

        let detailedPrompt = "";

        try {
            const visionResult = await generateContentWithFallback(genAI, VISON_MODELS, visionPrompt, imagePart);
            detailedPrompt = visionResult.response.text();
            console.log("Gemini Vision Success. Prompt:", detailedPrompt);
        } catch (err: any) {
            console.error("Gemini Vision Analysis Failed completely:", err);
            throw new Error(`Gemini Vision Error: ${err.message}. Please check API Key permissions.`);
        }

        // --- STEP 2: GENERATE NEW IMAGE WITH IMAGEN ---
        const configModelId = config.googleModelId || "imagen-4.0-generate-001";
        const modelIdRaw = (process.env.GOOGLE_MODEL_ID || configModelId).trim();
        const fullModelName = modelIdRaw.startsWith("models/") ? modelIdRaw : `models/${modelIdRaw}`;

        let aspectRatio = "1:1";
        if (size.includes("1792")) aspectRatio = "9:16";
        if (size.includes("1792") && size.startsWith("1792")) aspectRatio = "16:9";
        if (size === "9:16" || size === "16:9" || size === "4:3" || size === "3:4") aspectRatio = size;

        // Generate N variations
        const actualCount = Math.min(Math.max(1, n), 4);
        const imagePromises = Array(actualCount).fill(0).map(() =>
            fetch(`https://generativelanguage.googleapis.com/v1beta/${fullModelName}:predict?key=${googleKey}`, {
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
            }).then(async (res) => {
                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.error?.message || "Generation error");
                }
                const data = await res.json();
                return data.predictions?.[0]?.bytesBase64Encoded;
            })
        );

        const results = await Promise.allSettled(imagePromises);
        const imageUrls = results
            .filter(r => r.status === "fulfilled" && r.value)
            .map(r => `data:image/png;base64,${(r as PromiseFulfilledResult<string>).value}`);

        if (imageUrls.length === 0) {
            const firstError = results.find(r => r.status === "rejected") as PromiseRejectedResult;
            throw new Error(`Imagen Generation Failed: ${firstError?.reason?.message || "Unknown error"}`);
        }

        const imageUrl = imageUrls[0];

        // --- STEP 3: GENERATE CAPTION (with Fallback) ---
        let captionData = {};
        try {
            const captionPrompt = `
            You are a social media manager for GateSIM. 
            Based on this image description: "${detailedPrompt}"
            ${customPrompt ? `User also requested: "${customPrompt}"` : ""}
            
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
            imageUrls,
            captionMN: (captionData as any).mn || "Gemini Variation",
            captionEN: (captionData as any).en || "Gemini Variation",
            hashtags: (captionData as any).hashtags || "#GateSIM #AI",
            provider: "google-gemini",
            message: `Created ${imageUrls.length} variations`
        });

    } catch (error: any) {
        console.error("Gemini Variation error:", error);
        return NextResponse.json({
            error: error.message || "Variation generation failed"
        }, { status: 500 });
    }
}
